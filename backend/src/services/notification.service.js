import Notification from '../models/Notification.model.js';
import ApiError from '../utils/ApiError.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.constants.js';

// ─── Candidate Notifications ─────────────────────────────────────
export const getUserNotifications = async (userId) => {
  const now = new Date();

  const notifications = await Notification.find({
    isActive: true,
    scheduledAt: { $lte: now },
    expiresAt: { $gt: now },
    dismissedBy: { $ne: userId },
  })
    .sort({ createdAt: -1 })
    .limit(50);

  let unreadCount = 0;
  const mapped = notifications.map((n) => {
    const isRead = n.readBy.some((id) => id.equals(userId));
    if (!isRead) unreadCount++;

    return {
      _id: n._id,
      title: n.title,
      message: n.message,
      category: n.category,
      label: n.label,
      targetTheme: n.targetTheme,
      link: n.link,
      createdAt: n.createdAt,
      expiresAt: n.expiresAt,
      isRead,
    };
  });

  return { notifications: mapped, unreadCount };
};

export const markAsRead = async (userId, notificationId) => {
  const notif = await Notification.findByIdAndUpdate(
    notificationId,
    { $addToSet: { readBy: userId } },
    { new: true }
  );

  if (!notif) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND);
  }

  return { notificationId };
};

export const markAllAsRead = async (userId) => {
  const now = new Date();

  await Notification.updateMany(
    {
      isActive: true,
      expiresAt: { $gt: now },
      dismissedBy: { $ne: userId },
    },
    { $addToSet: { readBy: userId } }
  );

  return true;
};

export const dismissForUser = async (userId, notificationId) => {
  const notif = await Notification.findByIdAndUpdate(
    notificationId,
    {
      $addToSet: {
        dismissedBy: userId,
        readBy: userId,
      },
    },
    { new: true }
  );

  if (!notif) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND);
  }

  return { notificationId };
};

// ─── Admin Notifications ─────────────────────────────────────────
export const getAdminNotifications = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const search = query.search || '';
  const category = query.category;
  const status = query.status;

  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
      { label: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  const now = new Date();
  if (status === 'active') {
    filter.isActive = true;
    filter.expiresAt = { $gt: now };
  } else if (status === 'expired') {
    filter.expiresAt = { $lte: now };
  } else if (status === 'inactive') {
    filter.isActive = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);

  const mapped = notifications.map((n) => {
    const isExpired = n.expiresAt <= now;
    return {
      _id: n._id,
      title: n.title,
      message: n.message,
      category: n.category,
      label: n.label,
      targetTheme: n.targetTheme,
      link: n.link,
      isActive: n.isActive,
      scheduledAt: n.scheduledAt,
      expiresAt: n.expiresAt,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      createdBy: n.createdBy,
      readCount: n.readBy?.length || 0,
      dismissedCount: n.dismissedBy?.length || 0,
      isExpired,
    };
  });

  return {
    notifications: mapped,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

export const createBroadcast = async (adminId, data) => {
  const {
    title,
    message,
    category,
    label,
    targetTheme,
    link,
    scheduledAt,
    expiresAt,
    durationDays,
    durationHours,
  } = data;

  if (!title || !message) {
    throw new ApiError(400, 'Title and message are required for broadcasts.');
  }

  const startDate = scheduledAt ? new Date(scheduledAt) : new Date();

  let finalExpiresAt;
  if (expiresAt) {
    finalExpiresAt = new Date(expiresAt);
  } else if (durationDays !== undefined && !isNaN(Number(durationDays))) {
    finalExpiresAt = new Date(startDate.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);
  } else if (durationHours !== undefined && !isNaN(Number(durationHours))) {
    finalExpiresAt = new Date(startDate.getTime() + Number(durationHours) * 60 * 60 * 1000);
  } else {
    finalExpiresAt = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  if (finalExpiresAt <= startDate) {
    throw new ApiError(400, 'Expiration date & time must be after the start date & time.');
  }

  const notification = await Notification.create({
    title,
    message,
    category: category || 'update',
    label: label || '',
    targetTheme: targetTheme || 'all',
    link: link || '',
    scheduledAt: startDate,
    expiresAt: finalExpiresAt,
    isActive: true,
    createdBy: adminId,
  });

  return notification;
};

export const updateBroadcast = async (notificationId, data) => {
  const {
    title,
    message,
    category,
    label,
    targetTheme,
    link,
    scheduledAt,
    expiresAt,
    durationDays,
    durationHours,
    isActive,
  } = data;

  const notif = await Notification.findById(notificationId);
  if (!notif) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND);
  }

  if (title !== undefined) notif.title = title;
  if (message !== undefined) notif.message = message;
  if (category !== undefined) notif.category = category;
  if (label !== undefined) notif.label = label;
  if (targetTheme !== undefined) notif.targetTheme = targetTheme;
  if (link !== undefined) notif.link = link;
  if (isActive !== undefined) notif.isActive = isActive;
  if (scheduledAt !== undefined) notif.scheduledAt = new Date(scheduledAt);

  if (expiresAt !== undefined) {
    notif.expiresAt = new Date(expiresAt);
  } else if (durationDays !== undefined && !isNaN(Number(durationDays))) {
    const base = notif.scheduledAt || new Date();
    notif.expiresAt = new Date(base.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);
  } else if (durationHours !== undefined && !isNaN(Number(durationHours))) {
    const base = notif.scheduledAt || new Date();
    notif.expiresAt = new Date(base.getTime() + Number(durationHours) * 60 * 60 * 1000);
  }

  await notif.save();
  return notif;
};

export const deleteBroadcast = async (notificationId) => {
  const notif = await Notification.findByIdAndDelete(notificationId);
  if (!notif) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND);
  }

  return true;
};

export default {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  dismissForUser,
  getAdminNotifications,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
};
