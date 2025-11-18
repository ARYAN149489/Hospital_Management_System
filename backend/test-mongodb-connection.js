// Test MongoDB Connection
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 Testing MongoDB Connection...\n');
console.log('Connection String:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then((conn) => {
  console.log('\n✅ SUCCESS! MongoDB Connected');
  console.log('📊 Host:', conn.connection.host);
  console.log('📊 Database:', conn.connection.name);
  console.log('📊 Port:', conn.connection.port);
  console.log('\n🎉 Your database is working correctly!');
  process.exit(0);
})
.catch((err) => {
  console.log('\n❌ FAILED! MongoDB Connection Error');
  console.log('Error:', err.message);
  
  if (err.message.includes('ECONNREFUSED')) {
    console.log('\n💡 Possible Solutions:');
    console.log('1. Your MongoDB Atlas cluster might be deleted or paused');
    console.log('2. Check your internet connection');
    console.log('3. Verify the connection string is correct');
    console.log('4. Create a new cluster at https://cloud.mongodb.com/');
  } else if (err.message.includes('authentication failed')) {
    console.log('\n💡 Possible Solutions:');
    console.log('1. Check your username and password');
    console.log('2. Make sure the database user has correct permissions');
  } else if (err.message.includes('IP')) {
    console.log('\n💡 Possible Solutions:');
    console.log('1. Add your IP address to MongoDB Atlas whitelist');
    console.log('2. Or allow access from anywhere (0.0.0.0/0)');
  }
  
  console.log('\n📖 See MONGODB_FIX_GUIDE.md for detailed instructions');
  process.exit(1);
});
