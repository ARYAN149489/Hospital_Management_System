# 🔧 MongoDB Connection Issue - Quick Fix Guide

## Problem
Your MongoDB Atlas cluster DNS is not resolving:
```
❌ MongoDB Connection Failed: querySrv ECONNREFUSED _mongodb._tcp.hospitalmanagementsyste.migxagu.mongodb.net
```

This means your MongoDB Atlas cluster was deleted, paused, or doesn't exist.

## ✅ Solution: Create New MongoDB Atlas Cluster (FREE)

### Step 1: Create MongoDB Atlas Account & Cluster

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** or **Sign in** if you have an account
3. Click **"Build a Database"** or **"Create"**
4. Choose **"M0 FREE"** tier
5. Select a cloud provider and region (closest to you)
6. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 2: Configure Database Access

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Create username: `medicareplus_user`
4. Create a strong password (save it!)
5. User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add your IP)
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://medicareplus_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace** `<password>` with your actual password
7. **Add** database name at the end: `/medicare-plus`

Final format:
```
mongodb+srv://medicareplus_user:YourPassword123@cluster0.xxxxx.mongodb.net/medicare-plus?retryWrites=true&w=majority
```

### Step 5: Update Your .env File

```bash
# Open your backend .env file
cd /Users/aryankansal/Desktop/Soft/my-react-app/backend
nano .env  # or use any text editor
```

Replace the MONGODB_URI line with your new connection string:
```env
MONGODB_URI=mongodb+srv://medicareplus_user:YourPassword123@cluster0.xxxxx.mongodb.net/medicare-plus?retryWrites=true&w=majority
```

Save and close the file.

### Step 6: Restart Backend Server

```bash
# Kill existing servers
pkill -f "node server.js"

# Start fresh
cd /Users/aryankansal/Desktop/Soft/my-react-app/backend
NODE_ENV=development node server.js
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database Name: medicare-plus
```

## 🚀 Quick Test Script

Or use the provided script:
```bash
cd /Users/aryankansal/Desktop/Soft/my-react-app/backend
./update-mongodb-uri.sh
```

## Alternative: Use Local MongoDB (Not Recommended for Development)

If you want to use local MongoDB:
```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Update .env
MONGODB_URI=mongodb://localhost:27017/medicare-plus
```

## Need Help?

If you're still having issues:
1. Double-check your password doesn't have special characters (or encode them)
2. Make sure IP is whitelisted (0.0.0.0/0 for development)
3. Verify username and password are correct
4. Check if cluster is active (not paused)

---

**Created**: Nov 15, 2025
**Status**: Waiting for new MongoDB Atlas connection string
