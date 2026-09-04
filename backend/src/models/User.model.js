import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]{3,30}$/, 'Username must be 3-30 alphanumeric characters or underscores'],
    },
    firstName: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    name: {
      type: String,
      default: 'Shinobi Candidate',
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
      trim: true,
    },
    mobile: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['google', 'phone', 'password', 'custom', 'anonymous'],
      default: 'password',
    },
    password: {
      type: String,
      // Firebase sign in No password require , Set One At Profile Page
      required: function () {
        return !this.firebaseUid;
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['candidate', 'support', 'content_manager', 'admin', 'super_admin'],
      default: 'candidate',
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    photoUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    credits: {
      type: Number,
      default: 10,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
    },
    customApiKeys: [
      {
        provider: {
          type: String,
          enum: ['gemini-1.5-pro', 'gpt-4o', 'claude-3-5-sonnet', 'groq-llama-3', 'deepseek-v3'],
          required: true,
        },
        apiKey: {
          type: String,
          default: '',
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        priority: {
          type: Number,
          default: 1,
        },
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: Date,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ──────────────────────────────────────────────────────
userSchema.virtual('resumes', {
  ref: 'Resume',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.virtual('sessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'userId',
});

// ─── Statics ───────────────────────────────────────────────────────
userSchema.statics.normalizeUsername = function (username) {
  if (!username || typeof username !== 'string') return '';
  return username.trim().toLowerCase();
};

// ─── Pre-save Hook: Normalize & Hash Password ─────────────────────
userSchema.pre('save', async function (next) {
  // Sync name with firstName / lastName
  if (!this.name && (this.firstName || this.lastName)) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  } else if (this.name && !this.firstName) {
    const parts = this.name.split(' ');
    this.firstName = parts[0] || '';
    this.lastName = parts.slice(1).join(' ') || '';
  }
  if (!this.name) {
    this.name = 'Shinobi Candidate';
  }

  // Sync phone and mobile
  if (this.mobile && !this.phone) {
    this.phone = this.mobile;
  } else if (this.phone && !this.mobile) {
    this.mobile = this.phone;
  }

  // Sync avatar and photoUrl
  if (this.avatar && !this.photoUrl) {
    this.photoUrl = this.avatar;
  } else if (this.photoUrl && !this.avatar) {
    this.avatar = this.photoUrl;
  }

  // Normalize username
  if (this.isModified('username') && this.username) {
    this.username = this.username.trim().toLowerCase();
  }

  // Hash password if modified & present
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.hasPassword = true;
  } else if (this.password) {
    this.hasPassword = true;
  }

  next();
});

// ─── Methods ──────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id.toString(),
      email: this.email || null,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id.toString(),
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    }
  );
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
