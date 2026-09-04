import Job from '../models/Job.model.js';
import logger from '../config/logger.js';

const TECH_SKILLS_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'rust', 'golang', 'ruby', 'php',
  'react', 'angular', 'vue', 'next.js', 'svelte', 'node.js', 'express', 'nest.js', 'django',
  'flask', 'spring', 'laravel', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'graphql', 'rest api', 'ci/cd', 'git'
];

export const extractSkillsFromDescription = (description) => {
  if (!description) return [];
  const descLower = description.toLowerCase();
  const extracted = [];

  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const skill of TECH_SKILLS_KEYWORDS) {
    const escaped = escapeRegExp(skill);
    const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'i');
    if (regex.test(descLower)) {
      extracted.push(skill);
    }
  }
  return extracted;
};

export const matchUserToJobs = async (userSkills, jobsList = null) => {
  if (!Array.isArray(userSkills) || userSkills.length === 0) {
    logger.warn('⚠️ JobMatchService: Provided user skills array is empty.');
    return [];
  }

  const normUserSkills = userSkills.map((s) => s.toLowerCase().trim());
  logger.info(`🎯 JobMatchService: Evaluating match scores against user skills: [${userSkills.join(', ')}]...`);

  try {
    let jobs = jobsList;
    if (!jobs) {
      logger.info('🎯 JobMatchService: Querying active jobs from MongoDB...');
      jobs = await Job.find({ isActive: true }).lean();
    }

    const matchedJobs = [];

    for (const job of jobs) {
      let jobSkills = Array.isArray(job.skills) ? job.skills.map((s) => s.toLowerCase().trim()) : [];
      if (jobSkills.length === 0 && job.description) {
        jobSkills = extractSkillsFromDescription(job.description);
      }

      let matchScore = 0;

      if (jobSkills.length > 0) {
        const overlaps = jobSkills.filter((skill) => normUserSkills.includes(skill));
        matchScore = Math.round((overlaps.length / jobSkills.length) * 100);
      } else if (job.description) {
        const descLower = job.description.toLowerCase();
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        let matchedCount = 0;
        for (const skill of normUserSkills) {
          const regex = new RegExp(`(?<!\\w)${escapeRegExp(skill)}(?!\\w)`, 'i');
          if (regex.test(descLower)) {
            matchedCount++;
          }
        }
        matchScore = Math.round((matchedCount / normUserSkills.length) * 100);
      }

      if (matchScore >= 60) {
        matchedJobs.push({
          ...job,
          matchScore,
        });
      }
    }

    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    logger.info(`✅ JobMatchService: Found ${matchedJobs.length} matching jobs with >= 60% match score.`);
    return matchedJobs;

  } catch (error) {
    logger.error(`❌ JobMatchService Error: ${error.message}`);
    throw error;
  }
};

export default { matchUserToJobs, extractSkillsFromDescription };
