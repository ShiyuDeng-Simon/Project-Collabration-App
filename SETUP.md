# Setup Guide

This guide will help you set up the Project Collaboration App from scratch.

## Step 1: Install Dependencies

```bash
# Install root dependencies (includes concurrently for running both servers)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Database Setup

1. **Install PostgreSQL** if you haven't already
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Start PostgreSQL service**
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create the database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE collabrationapp;
   
   # Exit psql
   \q
   ```

4. **Run the schema script**
   ```bash
   psql -U postgres -d collabrationapp -f server/data.sql
   ```

## Step 3: Environment Configuration

### Server Environment Variables

Create `server/.env`:

```env
# Database Configuration
USERNAME=postgres
PASSWORD=your_postgres_password
HOST=localhost
DBPORT=5432

# Server Configuration
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# JWT Secret (generate a strong random string)
# You can generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Google OAuth (optional if using Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id
```

### Client Environment Variables

Create `client/.env`:

```env
# API Server URL
REACT_APP_SERVERURL=http://localhost:8000

# Google OAuth Client ID (same as server)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 4: Google OAuth Setup (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production URL (when deploying)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - Your production URL (when deploying)
8. Copy the Client ID to both `.env` files

## Step 5: Run the Application

### Development Mode (Recommended)

Run both server and client together:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:8000
- Frontend app on http://localhost:3000

### Separate Terminals

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Step 6: Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the login page
3. Click "Sign in with Google" (if configured)
4. Or use the register/login endpoints to create an account

## Troubleshooting

### Database Connection Failed

**Error:** `Connection refused` or `password authentication failed`

**Solutions:**
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `server/.env`
- Ensure database exists: `psql -U postgres -l | grep collabrationapp`
- Reset PostgreSQL password if needed:
  ```bash
  sudo -u postgres psql
  ALTER USER postgres PASSWORD 'newpassword';
  ```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solutions:**
- Change PORT in `server/.env` to a different port (e.g., 8001)
- Kill the process using the port:
  ```bash
  # Find process
  lsof -i :8000
  # Kill it
  kill -9 <PID>
  ```

### Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall dependencies
cd server && npm install
cd ../client && npm install
```

### CORS Errors

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
- Verify `CLIENT_URL` in `server/.env` matches your frontend URL
- Check that credentials are enabled in CORS config (already done in code)

### Google Sign-In Not Working

**Error:** Google button doesn't appear or authentication fails

**Solutions:**
- Verify `REACT_APP_GOOGLE_CLIENT_ID` is set in `client/.env`
- Check Google Cloud Console for correct authorized origins
- Ensure Google+ API is enabled in Google Cloud Console
- Check browser console for JavaScript errors

## Next Steps

- Read the main [README.md](./README.md) for API documentation
- Explore the codebase structure
- Customize the application for your needs
- Deploy to production (see README.md deployment section)

## Support

If you encounter issues not covered here:
1. Check the main README.md
2. Review error messages in browser console and server logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

