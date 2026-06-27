require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log("=== USERS IN DATABASE ===");
    users.forEach(u => {
      console.log(`Role: ${u.role} | Email: ${u.email} | Name: ${u.firstName} ${u.lastName}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
connectDB();
