import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['high_alert', 'important', 'update', 'maintenance', 'announcement'],
      default: 'update',
    },
    label: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Label cannot exceed 50 characters'],
    },
    targetTheme: {
      type: String,
      enum: ['all', 'shadow', 'forest', 'maple', 'sakura', 'gold'],
      default: 'all',
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date & time is required'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dismissedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index for efficient candidate queries
notificationSchema.index({ isActive: 1, expiresAt: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
