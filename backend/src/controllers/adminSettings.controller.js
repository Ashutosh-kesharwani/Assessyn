import SystemSetting from '../models/SystemSetting.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { replaceMedia, removeMedia } from '../services/media.service.js';
import logger from '../config/logger.js';

export const VALID_THEMES = ['shadow', 'forest', 'maple', 'sakura', 'gold'];

export const DEFAULT_THEME_SOUNDS = {
  shadow: {
    src: '/sounds/themes/shadow.wav',
    title: 'Kage 432Hz Theta Mist',
    subtitle: 'Deep meditative night wind & calming Solfeggio 432Hz frequencies',
    element: 'Void & Shadow (影)',
    color: '#a855f7',
  },
  forest: {
    src: '/sounds/themes/forest.wav',
    title: 'Jade Bamboo Rain Zen',
    subtitle: 'Soothing bamboo grove rainfall & meditative Shakuhachi flute',
    element: 'Nature & Bamboo (木)',
    color: '#10b981',
  },
  maple: {
    src: '/sounds/themes/maple.wav',
    title: 'Blood Maple Hearth Zen',
    subtitle: 'Gentle grounding heartbeat pulse & tranquil hearth embers',
    element: 'Fire & Steel (火)',
    color: '#f43f5e',
  },
  sakura: {
    src: '/sounds/themes/sakura.wav',
    title: 'Night Sakura Mindful Koto',
    subtitle: 'Peaceful Japanese Koto harp & tranquil midnight breeze',
    element: 'Floral Harmony (花)',
    color: '#ec4899',
  },
  gold: {
    src: '/sounds/themes/gold.wav',
    title: 'Solar 528Hz Temple Bowl',
    subtitle: 'Imperial bronze singing bowl & harmonic 528Hz Solfeggio meditation',
    element: 'Solar Aura (金)',
    color: '#f59e0b',
  },
};

const getOrCreateSettings = async () => {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = await SystemSetting.create({
      general: {
        appName: 'AI Interviewer',
        logo: '',
        theme: 'dark',
        maintenanceMode: false,
        supportEmail: 'support@interview.ai',
        supportPhone: '+1 (555) 019-2834',
        socialLinks: { github: '', twitter: '', linkedin: '' },
      },
      security: {
        jwtExpiry: '7d',
        apiKeys: { gemini: '', groq: '', stripe: '', adzunaId: '', adzunaKey: '' },
        rateLimits: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
      },
      ai: {
        model: 'gemini-3.6-flash',
        temperature: 0.5,
        maxTokens: 1024,
      },
      storage: {
        provider: 'local',
        cloudinary: { cloudName: '', apiKey: '', apiSecret: '' },
        aws: { bucket: '', region: '', accessKey: '', secretKey: '' },
      },
      featureFlags: {
        enableJobs: true,
        enableScraper: true,
        enableATS: true,
        enableCoach: true,
      },
      themeSounds: {
        shadow: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
        forest: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
        maple: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
        sakura: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
        gold: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
      },
    });
  }

  if (!settings.themeSounds) {
    settings.themeSounds = {
      shadow: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
      forest: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
      maple: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
      sakura: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
      gold: { customUrl: '', customTitle: '', customSubtitle: '', isCustom: false },
    };
    await settings.save();
  }

  return settings;
};

// ─── GET /api/admin/settings ───────────────────────────────────────
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  return res
    .status(200)
    .json(new ApiResponse(200, { settings }, 'System settings retrieved successfully.'));
});

// ─── PATCH /api/admin/settings ─────────────────────────────────────
export const saveSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  const { general, security, ai, storage, featureFlags, themeSounds } = req.body;

  if (general) {
    if (general.appName !== undefined) settings.general.appName = general.appName;
    if (general.logo !== undefined) settings.general.logo = general.logo;
    if (general.theme !== undefined) settings.general.theme = general.theme;
    if (general.maintenanceMode !== undefined) settings.general.maintenanceMode = general.maintenanceMode;
    if (general.supportEmail !== undefined) settings.general.supportEmail = general.supportEmail;
    if (general.supportPhone !== undefined) settings.general.supportPhone = general.supportPhone;
    if (general.socialLinks) {
      if (general.socialLinks.github !== undefined) settings.general.socialLinks.github = general.socialLinks.github;
      if (general.socialLinks.twitter !== undefined) settings.general.socialLinks.twitter = general.socialLinks.twitter;
      if (general.socialLinks.linkedin !== undefined) settings.general.socialLinks.linkedin = general.socialLinks.linkedin;
    }
  }

  if (security) {
    if (security.jwtExpiry !== undefined) settings.security.jwtExpiry = security.jwtExpiry;
    if (security.apiKeys) {
      if (security.apiKeys.groq !== undefined) settings.security.apiKeys.groq = security.apiKeys.groq;
      if (security.apiKeys.stripe !== undefined) settings.security.apiKeys.stripe = security.apiKeys.stripe;
      if (security.apiKeys.adzunaId !== undefined) settings.security.apiKeys.adzunaId = security.apiKeys.adzunaId;
      if (security.apiKeys.adzunaKey !== undefined) settings.security.apiKeys.adzunaKey = security.apiKeys.adzunaKey;
    }
    if (security.rateLimits) {
      if (security.rateLimits.windowMs !== undefined) settings.security.rateLimits.windowMs = security.rateLimits.windowMs;
      if (security.rateLimits.maxRequests !== undefined) settings.security.rateLimits.maxRequests = security.rateLimits.maxRequests;
    }
  }

  if (ai) {
    if (ai.model !== undefined) settings.ai.model = ai.model;
    if (ai.temperature !== undefined) settings.ai.temperature = ai.temperature;
    if (ai.maxTokens !== undefined) settings.ai.maxTokens = ai.maxTokens;
  }

  if (storage) {
    if (storage.provider !== undefined) settings.storage.provider = storage.provider;
    if (storage.cloudinary) {
      if (storage.cloudinary.cloudName !== undefined) settings.storage.cloudinary.cloudName = storage.cloudinary.cloudName;
      if (storage.cloudinary.apiKey !== undefined) settings.storage.cloudinary.apiKey = storage.cloudinary.apiKey;
      if (storage.cloudinary.apiSecret !== undefined) settings.storage.cloudinary.apiSecret = storage.cloudinary.apiSecret;
    }
    if (storage.aws) {
      if (storage.aws.bucket !== undefined) settings.storage.aws.bucket = storage.aws.bucket;
      if (storage.aws.region !== undefined) settings.storage.aws.region = storage.aws.region;
      if (storage.aws.accessKey !== undefined) settings.storage.aws.accessKey = storage.aws.accessKey;
      if (storage.aws.secretKey !== undefined) settings.storage.aws.secretKey = storage.aws.secretKey;
    }
  }

  if (featureFlags) {
    if (featureFlags.enableJobs !== undefined) settings.featureFlags.enableJobs = featureFlags.enableJobs;
    if (featureFlags.enableScraper !== undefined) settings.featureFlags.enableScraper = featureFlags.enableScraper;
    if (featureFlags.enableATS !== undefined) settings.featureFlags.enableATS = featureFlags.enableATS;
    if (featureFlags.enableCoach !== undefined) settings.featureFlags.enableCoach = featureFlags.enableCoach;
  }

  if (themeSounds) {
    VALID_THEMES.forEach((themeId) => {
      if (themeSounds[themeId]) {
        if (!settings.themeSounds[themeId]) settings.themeSounds[themeId] = {};
        const incoming = themeSounds[themeId];
        if (incoming.customUrl !== undefined) settings.themeSounds[themeId].customUrl = incoming.customUrl;
        if (incoming.customTitle !== undefined) settings.themeSounds[themeId].customTitle = incoming.customTitle;
        if (incoming.customSubtitle !== undefined) settings.themeSounds[themeId].customSubtitle = incoming.customSubtitle;
        if (incoming.isCustom !== undefined) settings.themeSounds[themeId].isCustom = incoming.isCustom;
        settings.themeSounds[themeId].updatedAt = new Date();
      }
    });
  }

  await settings.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { settings }, 'System settings updated successfully.'));
});

// ─── POST /api/admin/theme-sounds/:themeId/upload ──────────────────
export const uploadThemeSound = asyncHandler(async (req, res) => {
  const { themeId } = req.params;
  const { customTitle, customSubtitle, customUrl } = req.body;

  if (!VALID_THEMES.includes(themeId)) {
    throw new ApiError(400, `Invalid theme identifier: ${themeId}. Valid themes: ${VALID_THEMES.join(', ')}`);
  }

  const settings = await getOrCreateSettings();
  if (!settings.themeSounds) settings.themeSounds = {};

  let finalAudioUrl = customUrl || '';
  let finalPublicId = '';

  if (req.file?.path) {
    const existingPublicId = settings.themeSounds[themeId]?.publicId || null;
    const uploadResult = await replaceMedia(existingPublicId, req.file.path, {
      resource_type: 'video',
      folder: 'assessyn/theme_sounds',
    });

    finalAudioUrl = uploadResult?.secure_url || uploadResult?.url || '';
    finalPublicId = uploadResult?.public_id || '';
  }

  if (!finalAudioUrl) {
    throw new ApiError(400, 'Please provide an audio file or a valid audio URL.');
  }

  settings.themeSounds[themeId] = {
    customUrl: finalAudioUrl,
    publicId: finalPublicId || settings.themeSounds[themeId]?.publicId || '',
    customTitle: customTitle || `${DEFAULT_THEME_SOUNDS[themeId].title} (Custom)`,
    customSubtitle: customSubtitle || DEFAULT_THEME_SOUNDS[themeId].subtitle,
    isCustom: true,
    updatedAt: new Date(),
  };

  settings.markModified('themeSounds');
  await settings.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        themeSound: settings.themeSounds[themeId],
        themeId,
      },
      `Theme sound for "${themeId}" updated successfully.`
    )
  );
});

// ─── DELETE /api/admin/theme-sounds/:themeId/reset ─────────────────
export const resetThemeSound = asyncHandler(async (req, res) => {
  const { themeId } = req.params;

  if (!VALID_THEMES.includes(themeId)) {
    throw new ApiError(400, `Invalid theme identifier: ${themeId}`);
  }

  const settings = await getOrCreateSettings();
  if (!settings.themeSounds) settings.themeSounds = {};

  const existingPublicId = settings.themeSounds[themeId]?.publicId;
  if (existingPublicId) {
    await removeMedia(existingPublicId, { resource_type: 'video' }).catch((err) => {
      logger.warn(`[AdminSettings] Failed to delete theme sound from Cloudinary: ${err.message}`);
    });
  }

  settings.themeSounds[themeId] = {
    customUrl: '',
    publicId: '',
    customTitle: '',
    customSubtitle: '',
    isCustom: false,
    updatedAt: new Date(),
  };

  settings.markModified('themeSounds');
  await settings.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        defaultSound: DEFAULT_THEME_SOUNDS[themeId],
        themeId,
      },
      `Theme sound for "${themeId}" reverted to default.`
    )
  );
});

// ─── GET /api/theme-sounds (Public endpoint for clients) ────────────
export const getPublicThemeSounds = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  const sounds = {};
  VALID_THEMES.forEach((themeId) => {
    const customConfig = settings.themeSounds?.[themeId];
    const defaultMeta = DEFAULT_THEME_SOUNDS[themeId];

    if (customConfig && customConfig.isCustom && customConfig.customUrl) {
      sounds[themeId] = {
        id: themeId,
        src: customConfig.customUrl,
        title: customConfig.customTitle || defaultMeta.title,
        subtitle: customConfig.customSubtitle || defaultMeta.subtitle,
        element: defaultMeta.element,
        color: defaultMeta.color,
        isCustom: true,
        updatedAt: customConfig.updatedAt,
      };
    } else {
      sounds[themeId] = {
        id: themeId,
        src: defaultMeta.src,
        title: defaultMeta.title,
        subtitle: defaultMeta.subtitle,
        element: defaultMeta.element,
        color: defaultMeta.color,
        isCustom: false,
        updatedAt: null,
      };
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { sounds }, 'Theme sounds retrieved successfully.'));
});

export default {
  getSettings,
  saveSettings,
  uploadThemeSound,
  resetThemeSound,
  getPublicThemeSounds,
};
