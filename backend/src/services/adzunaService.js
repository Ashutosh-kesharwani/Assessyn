import axios from 'axios';
import logger from '../config/logger.js';

const APP_ID = process.env.APP_ID || process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.APP_KEY || process.env.ADZUNA_APP_KEY;
const COUNTRY = process.env.ADZUNA_COUNTRY || 'gb';
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

const cleanHtml = (text) => {
  if (!text) return '';
  return text.replace(/<\/?[^>]+(>|$)/g, '').trim();
};

export const fetchJobs = async (keyword, location, page = 1) => {
  if (!APP_ID || !APP_KEY) {
    logger.error('❌ Adzuna Service: Missing App ID or App Key credentials.');
    throw new Error('Adzuna API credentials are not configured.');
  }

  logger.info(`🔍 Adzuna Service: Querying keyword: "${keyword}", location: "${location}", page: ${page}...`);

  const params = {
    app_id: APP_ID,
    app_key: APP_KEY,
    results_per_page: 20,
  };

  if (keyword) params.what = keyword;
  if (location) params.where = location;

  try {
    const url = `${BASE_URL}/${COUNTRY.toLowerCase()}/search/${Math.max(1, parseInt(page, 10))}`;
    
    const response = await axios.get(url, { params });

    if (!response.data || !Array.isArray(response.data.results)) {
      logger.warn('⚠️ Adzuna Service: Received empty response.');
      logger.info('📋 API success: Adzuna query returned empty list');
      return [];
    }

    const cleanedJobs = response.data.results.map((rawJob) => ({
      adzunaId: String(rawJob.id),
      title: (rawJob.title || '').trim(),
      company: (rawJob.company && rawJob.company.display_name) || 'Not Specified',
      location: (rawJob.location && rawJob.location.display_name) || 'Remote',
      description: cleanHtml(rawJob.description),
      salaryMin: rawJob.salary_min ? Number(rawJob.salary_min) : null,
      salaryMax: rawJob.salary_max ? Number(rawJob.salary_max) : null,
      category: (rawJob.category && rawJob.category.label) || 'Programming',
      contractType: rawJob.contract_time || rawJob.contract_type || 'Full-time',
      redirectUrl: rawJob.redirect_url || '',
      source: 'Adzuna',
      isActive: true,
      createdAt: rawJob.created ? new Date(rawJob.created) : new Date(),
    }));

    logger.info(`📋 API success: Adzuna query returned ${cleanedJobs.length} jobs.`);
    return cleanedJobs;

  } catch (error) {
    logger.error(`📋 API failed: Adzuna query failed - Error: ${error.message}`);
    throw error;
  }
};

export default { fetchJobs };
