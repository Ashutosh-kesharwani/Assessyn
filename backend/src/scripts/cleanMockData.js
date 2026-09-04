import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function clean() {
  try {
    const uri = process.env.MONGODB_URI
      ? `${process.env.MONGODB_URI}/${process.env.DB_NAME || 'AssessynDB'}?retryWrites=true&w=majority&appName=Assessyn-Cluster`
      : process.env.MONGO_URI;
    await mongoose.connect(uri);
    const tx = await mongoose.connection.collection('transactions').deleteMany({ transactionId: { $regex: '^ch_stripe_' } });
    const wb = await mongoose.connection.collection('webhooklogs').deleteMany({ 'payload.id': { $regex: '^evt_' } });
    console.log(`Cleaned ${tx.deletedCount} dummy transactions and ${wb.deletedCount} dummy webhooks.`);
  } catch (err) {
    console.error('Error cleaning mock data:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clean();
