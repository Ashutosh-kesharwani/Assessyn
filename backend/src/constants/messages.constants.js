export const AUTH_MESSAGES = {
  // Registration
  REGISTER_SUCCESS: "Account created successfully.",
  USER_ALREADY_EXISTS: "An account with the provided details already exists.",
  REGISTER_FAILED: "Failed to register user. Please try again later.",

  // Login
  LOGIN_SUCCESS: "Logged in successfully.",
  INVALID_CREDENTIALS: "Invalid email, username, mobile number, or password.",
  ADMIN_INVALID_CREDENTIALS: "Invalid email, username or password.",
  ACCOUNT_DEACTIVATED: "Your account has been deactivated. Contact support.",
  ACCOUNT_BANNED: "Your account has been banned due to terms violation.",

  // Logout
  LOGOUT_SUCCESS: "Logged out successfully.",

  // Password
  PASSWORD_REQUIRED: "Password is required.",
  PASSWORD_CHANGED: "Password changed successfully.",
  PASSWORD_RESET: "Password reset successfully.",
  PASSWORD_CONFIRM_REQUIRED: "Please confirm your password.",
  PASSWORD_MISMATCH: "New Password and confirm password must be same.",
  PASSWORD_SAME_AS_OLD: "New password cannot be the same as your current password.",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",

  // Refresh Token
  TOKEN_REFRESHED: "Session refreshed successfully.",
  INVALID_REFRESH_TOKEN: "Your session is invalid. Please log in again.",
  REFRESH_TOKEN_EXPIRED: "Your session has expired. Please log in again.",

  // Access Token
  INVALID_ACCESS_TOKEN: "Your login session is invalid. Please log in again.",
  ACCESS_TOKEN_EXPIRED: "Your login session has expired. Please log in again.",
  TOKEN_SERVER_ERROR: "Something went wrong while generating authentication tokens.",

  // Firebase Auth
  FIREBASE_TOKEN_REQUIRED: "Firebase authentication token is required.",
  FIREBASE_AUTH_FAILED: "Firebase authentication verification failed.",

  // Authentication & Authorization
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "You do not have permission to access this resource.",
};

export const USER_MESSAGES = {
  USER_NOT_FOUND: "User not found.",
  CURRENT_USER_FETCHED: "User profile fetched successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  DASHBOARD_FETCHED: "User dashboard data fetched successfully.",

  // Email
  EMAIL_UPDATED: "Email address updated successfully.",
  EMAIL_ALREADY_EXISTS: "This email address is already associated with another account.",
  EMAIL_REQUIRED: "Email address is required.",
  EMAIL_VERIFICATION_REQUIRED: "Google email verification token is required.",

  // Username
  USERNAME_AVAILABLE: "Username is available.",
  USERNAME_UPDATED: "Username updated successfully.",
  USERNAME_ALREADY_EXISTS: "This username is already taken. Please choose another.",
  USERNAME_REQUIRED: "Username is required.",
  INVALID_USERNAME_FORMAT: "Username must be 3-30 characters with lowercase letters, numbers, or underscores.",

  // Mobile
  MOBILE_UPDATED: "Mobile number updated successfully.",
  MOBILE_ALREADY_EXISTS: "This mobile number is already registered to another account.",
  MOBILE_REQUIRED: "Mobile number is required.",
  MOBILE_SAME_AS_OLD: "New mobile number cannot be the same as your current mobile number.",
  INVALID_MOBILE_NUMBER: "Please enter a valid mobile number.",
  MOBILE_VERIFICATION_FAILED: "Mobile number verification failed. Please try resending OTP.",
  MOBILE_NOT_VERIFIED: "This mobile number has not been verified yet.",

  // Avatar
  AVATAR_UPLOADED: "Profile avatar uploaded successfully.",
  AVATAR_DELETED: "Profile avatar removed successfully.",
  AVATAR_REQUIRED: "No avatar image file or data provided.",
};

export const RESUME_MESSAGES = {
  RESUME_UPLOADED: "Resume uploaded successfully.",
  RESUMES_FETCHED: "Resumes fetched successfully.",
  RESUME_NOT_FOUND: "Resume not found.",
  RESUME_DELETED: "Resume deleted successfully.",
  DEFAULT_RESUME_SET: "Default resume updated successfully.",
  RESUME_PARSED: "Resume parsed successfully.",
  PREVIEW_GENERATED: "Resume text preview generated successfully.",
  MAX_RESUMES_REACHED: "Maximum limit of 5 resumes reached. Please delete an existing resume before uploading a new one.",
};

export const INTERVIEW_MESSAGES = {
  INTERVIEW_CREATED: "Interview created successfully.",
  INTERVIEWS_FETCHED: "Interviews fetched successfully.",
  INTERVIEW_NOT_FOUND: "Interview blueprint not found.",
  INTERVIEW_DELETED: "Interview deleted successfully.",
  QUESTIONS_GENERATED: "Interview questions generated successfully.",
  QUESTIONS_ALREADY_GENERATING: "Questions are already being generated.",
  QUESTIONS_GENERATION_FAILED: "Failed to generate interview questions.",
};

export const SESSION_MESSAGES = {
  SESSION_STARTED: "Interview session started successfully.",
  SESSIONS_FETCHED: "Interview sessions fetched successfully.",
  SESSION_NOT_FOUND: "Interview session not found.",
  ANSWER_SUBMITTED: "Answer submitted successfully.",
  SESSION_COMPLETED: "Interview session completed and evaluated successfully.",
  QUESTIONS_NOT_READY: "Interview questions have not been generated yet.",
};

export const JOB_MESSAGES = {
  JOBS_FETCHED: "Jobs fetched successfully.",
  JOB_NOT_FOUND: "Job listing not found.",
  CATEGORIES_FETCHED: "Job categories fetched successfully.",
  RECOMMENDED_JOBS_FETCHED: "Recommended jobs fetched successfully.",
  QUESTIONS_GENERATED: "Questions generated from job description successfully.",
};

export const PRO_MESSAGES = {
  API_KEYS_SAVED: "Custom API keys saved securely.",
  API_KEYS_FETCHED: "Custom API keys retrieved successfully.",
  RESUME_RESTRUCTURED: "Resume restructured successfully by AI.",
  PROJECTS_GENERATED: "Tailored portfolio projects generated successfully.",
  QUESTIONS_GENERATED: "Strategic interview question bank generated successfully.",
  ROADMAP_GENERATED: "Skill advancement roadmap generated successfully.",
  RADAR_JOBS_FETCHED: "Live radar jobs fetched successfully.",
};

export const PAYMENT_MESSAGES = {
  PLANS_FETCHED: "Subscription plans fetched successfully.",
  CHECKOUT_INITIATED: "PayU checkout transaction initiated successfully.",
  PAYMENT_VERIFIED: "Payment verified and subscription activated successfully.",
  MOCK_CHECKOUT_SUCCESS: "Demo transaction processed successfully.",
  BILLING_HISTORY_FETCHED: "Billing transactions history fetched successfully.",
  INVALID_HASH: "Payment hash verification failed.",
  PAYMENT_FAILED: "Payment transaction could not be completed.",
};

export const NOTIFICATION_MESSAGES = {
  NOTIFICATIONS_FETCHED: "Notifications retrieved successfully.",
  NOTIFICATION_MARKED_READ: "Notification marked as read.",
  ALL_MARKED_READ: "All notifications marked as read.",
  NOTIFICATION_DISMISSED: "Notification dismissed successfully.",
  NOTIFICATION_NOT_FOUND: "Notification not found.",
};

export const FILE_MESSAGES = {
  FILE_REQUIRED: "Please upload a file.",
  IMAGE_REQUIRED: "Please upload an image.",
  IMAGE_UPLOADED: "Image uploaded successfully.",
  IMAGE_UPDATED: "Image updated successfully.",
  IMAGE_DELETED: "Image deleted successfully.",
  IMAGE_REPLACE_FAILED: "Failed to change image. Please try again.",
  INVALID_FILE_TYPE: "Only PDF and Word documents are allowed.",
  INVALID_IMAGE_TYPE: "Only JPG, PNG, and WEBP image files are allowed.",
  INVALID_AUDIO_TYPE: "Only MP3, WAV, OGG, or M4A audio files are allowed.",
  FILE_UPLOAD_FAILED: "File upload failed. Please try again.",
  IMAGE_UPLOAD_FAILED: "Failed to upload image. Please try again.",
  IMAGE_SIZE_EXCEEDED: "Image size must not exceed the allowed limit (5MB).",
};

export const ADMIN_MESSAGES = {
  DASHBOARD_FETCHED: "Admin dashboard metrics fetched successfully.",
  USERS_FETCHED: "Users directory fetched successfully.",
  USER_STATUS_UPDATED: "User account status updated successfully.",
  USER_ROLE_UPDATED: "User role updated successfully.",
  SETTINGS_FETCHED: "System settings fetched successfully.",
  SETTINGS_SAVED: "System settings saved successfully.",
  SOUND_CONFIGURED: "Theme sound configuration updated successfully.",
  SOUND_DELETED: "Theme sound removed successfully.",
  PROMPTS_FETCHED: "AI system prompts fetched successfully.",
  PROMPT_SAVED: "AI system prompt updated successfully.",
  LOGS_FETCHED: "System logs fetched successfully.",
  TEMPLATES_FETCHED: "Interview templates fetched successfully.",
  TEMPLATE_SAVED: "Interview template saved successfully.",
  TEMPLATE_DELETED: "Interview template deleted successfully.",
};

export const GENERAL_MESSAGES = {
  SUCCESS: "Request completed successfully.",
  CREATED: "Resource created successfully.",
  UPDATED: "Resource updated successfully.",
  DELETED: "Resource deleted successfully.",
  BAD_REQUEST: "The request could not be processed.",
  VALIDATION_ERROR: "Please fill in all required fields.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
  RESOURCE_NOT_FOUND: "Requested resource was not found.",
  DUPLICATE_RESOURCE: "Resource already exists.",
  TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
};

export const LOGGER_MESSAGES = {
  SERVER_STARTED: "Server successfully initialized and listening.",
  DATABASE_CONNECTED: "MongoDB database connection established.",
  DATABASE_DISCONNECTED: "MongoDB database connection terminated.",
  REDIS_CONNECTED: "Redis in-memory cache connected.",
  REDIS_ERROR: "Redis connection encounter error.",
  CRON_INITIALIZED: "Background cron scheduler initialized.",
  SOCKET_INITIALIZED: "WebSocket server successfully attached.",
  UNCAUGHT_EXCEPTION: "Uncaught process exception detected.",
  UNHANDLED_REJECTION: "Unhandled promise rejection detected.",
};

export { LOGGER_CONSTANTS } from './logger.constants.js';

export default {
  AUTH_MESSAGES,
  USER_MESSAGES,
  RESUME_MESSAGES,
  INTERVIEW_MESSAGES,
  SESSION_MESSAGES,
  JOB_MESSAGES,
  PRO_MESSAGES,
  PAYMENT_MESSAGES,
  NOTIFICATION_MESSAGES,
  FILE_MESSAGES,
  ADMIN_MESSAGES,
  LOGGER_MESSAGES,
  GENERAL_MESSAGES,
};
