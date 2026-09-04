import https from 'https';

// ─── Configuration ────────────────────────────────────────────────────────────
const REQUEST_TIMEOUT_MS   = parseInt(process.env.ADZUNA_TIMEOUT_MS,           10) || 2500;
const MAX_RETRIES          = parseInt(process.env.ADZUNA_MAX_RETRIES,          10) || 2;
const RETRY_BASE_DELAY_MS  = parseInt(process.env.ADZUNA_RETRY_BASE_DELAY_MS,  10) || 400;
const CB_FAILURE_THRESHOLD = parseInt(process.env.ADZUNA_CB_FAILURE_THRESHOLD, 10) || 5;
const CB_SUCCESS_THRESHOLD = parseInt(process.env.ADZUNA_CB_SUCCESS_THRESHOLD, 10) || 2;
const CB_OPEN_TIMEOUT_MS   = parseInt(process.env.ADZUNA_CB_OPEN_TIMEOUT_MS,   10) || 30_000;

const httpsAgent = new https.Agent({
  keepAlive     : true,
  maxSockets    : parseInt(process.env.ADZUNA_POOL_MAX_SOCKETS,      10) || 10,
  maxFreeSockets: parseInt(process.env.ADZUNA_POOL_MAX_FREE_SOCKETS, 10) || 5,
  keepAliveMsecs: 10_000,
  timeout       : REQUEST_TIMEOUT_MS + 500,
});

export const CB_STATE = Object.freeze({
  CLOSED   : 'CLOSED',
  OPEN     : 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
});

export class CircuitBreaker {
  constructor(opts = {}) {
    this.name             = opts.name             ?? 'CircuitBreaker';
    this.failureThreshold = opts.failureThreshold ?? CB_FAILURE_THRESHOLD;
    this.successThreshold = opts.successThreshold ?? CB_SUCCESS_THRESHOLD;
    this.openTimeoutMs    = opts.openTimeoutMs    ?? CB_OPEN_TIMEOUT_MS;

    this._state        = CB_STATE.CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._openedAt     = null;
    this._halfOpenLock = false;
  }

  get state() { return this._state; }

  _open(reason = '') {
    this._state        = CB_STATE.OPEN;
    this._openedAt     = Date.now();
    this._successCount = 0;
    console.warn(`[${this.name}] → OPEN after ${this._failureCount} failure(s)${reason ? ` (${reason})` : ''}`);
  }

  _halfOpen() {
    this._state        = CB_STATE.HALF_OPEN;
    this._halfOpenLock = false;
    this._successCount = 0;
    console.log(`[${this.name}] → HALF_OPEN — sending probe request`);
  }

  _close() {
    this._state        = CB_STATE.CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._halfOpenLock = false;
    console.log(`[${this.name}] → CLOSED — service recovered`);
  }

  _recordSuccess() {
    if (this._state === CB_STATE.HALF_OPEN) {
      this._successCount++;
      if (this._successCount >= this.successThreshold) this._close();
    } else {
      this._failureCount = 0;
    }
  }

  _recordFailure(err) {
    if (err?.status && err.status < 500) return;

    this._failureCount++;

    if (this._state === CB_STATE.HALF_OPEN) {
      this._open('probe failed');
    } else if (this._failureCount >= this.failureThreshold) {
      this._open(`threshold ${this.failureThreshold} reached`);
    }
  }

  async execute(fn) {
    if (this._state === CB_STATE.OPEN) {
      const elapsed  = Date.now() - this._openedAt;
      const remaining = this.openTimeoutMs - elapsed;

      if (remaining > 0) {
        const err = Object.assign(
          new Error(`[${this.name}] Service unavailable — circuit OPEN, retry in ${Math.ceil(remaining / 1000)}s`),
          { code: 'CIRCUIT_OPEN', status: 503 }
        );
        throw err;
      }

      this._halfOpen();
    }

    if (this._state === CB_STATE.HALF_OPEN) {
      if (this._halfOpenLock) {
        throw Object.assign(
          new Error(`[${this.name}] Circuit HALF_OPEN — probe in progress, try again shortly`),
          { code: 'CIRCUIT_PROBE_BUSY', status: 503 }
        );
      }
      this._halfOpenLock = true;
    }

    try {
      const result = await fn();
      this._recordSuccess();
      return result;
    } catch (err) {
      this._recordFailure(err);
      throw err;
    } finally {
      if (this._state === CB_STATE.HALF_OPEN) {
        this._halfOpenLock = false;
      }
    }
  }

  snapshot() {
    const msUntilRetry = this._state === CB_STATE.OPEN
      ? Math.max(0, this.openTimeoutMs - (Date.now() - this._openedAt))
      : null;

    return {
      state         : this._state,
      failureCount  : this._failureCount,
      successCount  : this._successCount,
      openedAt      : this._openedAt ? new Date(this._openedAt).toISOString() : null,
      msUntilRetry,
      config        : {
        failureThreshold: this.failureThreshold,
        successThreshold: this.successThreshold,
        openTimeoutMs   : this.openTimeoutMs,
      },
    };
  }

  reset() {
    this._state        = CB_STATE.CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._openedAt     = null;
    this._halfOpenLock = false;
  }
}

export const circuitBreaker = new CircuitBreaker({ name: 'Adzuna' });

function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const req = https.get(url, { agent: httpsAgent }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        try {
          const data = JSON.parse(raw);
          if (res.statusCode >= 400) {
            return reject(
              Object.assign(
                new Error(data?.exception || `Adzuna HTTP ${res.statusCode}`),
                { status: res.statusCode }
              )
            );
          }
          resolve(data);
        } catch {
          reject(new Error('Adzuna response is not valid JSON'));
        }
      });
    });

    req.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      req.destroy();
      reject(
        Object.assign(
          new Error(`Adzuna request timed out after ${timeoutMs}ms`),
          { code: 'TIMEOUT', status: 504 }
        )
      );
    }, timeoutMs);
  });
}

function isRetryable(err) {
  if (err.code === 'TIMEOUT')   return true;
  if (err.code === 'ECONNRESET') return true;
  if (err.code === 'ENOTFOUND') return false;
  if (!err.status)              return true;
  return err.status >= 500;
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url, maxRetries = MAX_RETRIES) {
  let lastErr;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url);
    } catch (err) {
      lastErr = err;

      const isLast = attempt === maxRetries;
      if (!isRetryable(err) || isLast) throw err;

      const backoffMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 100;
      console.warn(
        `[AdzunaClient] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${err.message}. ` +
        `Retrying in ${Math.round(backoffMs)}ms…`
      );
      await sleep(backoffMs);
    }
  }

  throw lastErr;
}

export function fetchJSON(url) {
  console.log('[AdzunaClient] Fetching URL:', url);
  return circuitBreaker.execute(() => fetchWithRetry(url));
}

export default {
  fetchJSON,
  circuitBreaker,
  CB_STATE,
};
