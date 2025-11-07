# Quick Start Guide

## Prerequisites Checklist

Before starting, make sure you have:
- ✅ Node.js installed (v14 or higher)
- ✅ PostgreSQL installed and running
- ✅ Database `collabrationapp` created

## Step 1: Set Up Environment Variables

### Server Environment (`server/.env`)

Create `server/.env` file with:

```env
USERNAME=postgres
PASSWORD=your_postgres_password
HOST=localhost
DBPORT=5432
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_secret_key_here_change_this
GOOGLE_CLIENT_ID=your_google_client_id
```

### Client Environment (`client/.env`)

Create `client/.env` file with:

```env
REACT_APP_SERVERURL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Step 2: Set Up Database

1. **Create the database:**
   ```bash
   psql -U postgres
   CREATE DATABASE collabrationapp;
   \q
   ```

2. **Run the schema:**
   ```bash
   psql -U postgres -d collabrationapp -f server/data.sql
   ```

## Step 3: Start the Application

### Option 1: Run Both Together (Recommended)

```bash
npm run dev
```

This starts both the backend (port 8000) and frontend (port 3000) simultaneously.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Step 4: Access the Application

- **Frontend:** Open http://localhost:3000 in your browser
- **Backend API:** http://localhost:8000
- **Health Check:** http://localhost:8000/health

## Troubleshooting

### Database Connection Error?
- Make sure PostgreSQL is running: `pg_isready`
- Check your credentials in `server/.env`
- Verify database exists: `psql -U postgres -l | grep collabrationapp`

### Port Already in Use?
- Change `PORT` in `server/.env` to a different port (e.g., 8001)
- Or kill the process using the port

### Module Not Found?
- Run `npm run install-all` again

### Google Sign-In Not Working?
- Make sure `REACT_APP_GOOGLE_CLIENT_ID` is set in `client/.env`
- You can skip Google OAuth for now and use the register/login endpoints

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup instructions
- Read [README.md](./README.md) for API documentation

