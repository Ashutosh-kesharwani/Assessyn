import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  discountPercent: {
    type: Number,
    required: true,
    min: [1, 'Discount must be at least 1%'],
    max: [100, 'Discount cannot exceed 100%'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
      default: 30,
    },
    category: {
      type: String,
      enum: ['general', 'most_popular', 'economical', 'quick_test', 'long_term'],
      default: 'general',
    },
    badgeText: {
      type: String,
      default: '',
      trim: true,
    },
    savingsText: {
      type: String,
      default: '',
      trim: true,
    },
    ctaText: {
      type: String,
      default: 'Unlock Plan',
      trim: true,
    },
    accentColor: {
      type: String,
      default: '#10b981',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    credits: {
      type: Number,
      default: 9999,
    },
    features: {
      type: [String],
      default: [],
    },
    coupons: [couponSchema],
    directDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
