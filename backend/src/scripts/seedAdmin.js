/**
 * seedAdmin.js — Create the admin user in MongoDB
 *
 * Run once: node backend/src/scripts/seedAdmin.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ADMIN = {
  name: 'Admin Ashu',
  email: 'admin@gmail.com',
  password: 'password123',
  role: 'super_admin',   // Super Admin — full platform access
};

async function seedAdmin() {
  try {
    const uri = process.env.MONGODB_URI
      ? `${process.env.MONGODB_URI}/${process.env.DB_NAME || 'AssessynDB'}?retryWrites=true&w=majority&appName=Assessyn-Cluster`
      : process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN.email });

    if (existing) {
      // Update role to super_admin, name, and reset password
      existing.name = ADMIN.name;
      existing.role = 'super_admin';
      existing.password = ADMIN.password; // pre-save hook will hash it
      existing.isActive = true;
      existing.isBanned = false;
      await existing.save();
      console.log(`✅ Admin user updated: ${ADMIN.email}`);
    } else {
      await User.create(ADMIN);
      console.log(`✅ Admin user created: ${ADMIN.email}`);
    }

    console.log(`\n🔑 Login credentials:`);
    console.log(`   Email:    ${ADMIN.email}`);
    console.log(`   Password: ${ADMIN.password}`);
    console.log(`   Role:     super_admin\n`);

  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
