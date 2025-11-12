# Quick Start Guide - Apex Sandbox with Docker

This guide will help you get the Apex Sandbox application running locally with Docker-based PostgreSQL in under 10 minutes.

## Step 1: Prerequisites Check

Make sure you have installed:
- [ ] Node.js v14.15.3 or later
- [ ] Docker Desktop (running)
- [ ] Git

## Step 2: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd apex-sandbox

# Install dependencies
npm install
cd client
npm install
cd ..
```

## Step 3: Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Wait a few seconds, then initialize the database schema
# Windows PowerShell:
.\init-db.ps1

# Mac/Linux:
chmod +x init-db.sh
./init-db.sh
```

## Step 4: Configure Salesforce OAuth

### Create Connected App:
1. Login to your [Salesforce Developer Org](https://developer.salesforce.com/)
2. Setup → App Manager → New Connected App
3. Fill in basic info (name, email, etc.)
4. Enable OAuth Settings:
   - Callback URL: `http://localhost:5000/logincallback`
   - Selected OAuth Scopes: `api`, `refresh_token`
5. Save and wait 2-10 minutes for it to activate

### Configure Permissions:
1. Find your Connected App → Manage → Edit Policies
2. Permitted Users: **"All users may self-authorize"**
3. IP Relaxation: **"Relax IP restrictions"**
4. Save

### Get Credentials:
1. Go back to your Connected App → View
2. Copy **Consumer Key** and **Consumer Secret** (click to reveal)

## Step 5: Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
# Windows: notepad .env
# Mac/Linux: nano .env
```

Update these values in `.env`:
```
CLIENT_ID=<your_consumer_key>
CLIENT_SECRET=<your_consumer_secret>
SESSION_SECRET=<any_random_string>
```

The database URL is already configured for Docker PostgreSQL.

## Step 6: Start the Application

### Terminal 1 - Backend:
```bash
# PowerShell
node -r dotenv/config index.js

# You should see: "Listening on 5000"
```

### Terminal 2 - Frontend:
```bash
cd client

# PowerShell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start

# Mac/Linux
export NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

## Step 7: Access the Application

1. Open your browser to: http://localhost:3000
2. Click "Login with Salesforce"
3. Authenticate with your Salesforce credentials
4. Start solving Apex problems!

## Troubleshooting

### "Port already in use" error
```bash
# PowerShell
taskkill /IM node.exe /F

# Mac/Linux
killall node
```

### "Database connection failed"
```bash
# Check if container is running
docker ps

# View container logs
docker logs apex-sandbox-db

# Restart container
docker-compose restart
```

### OAuth errors
- Wait 10 minutes after creating Connected App
- Verify callback URL exactly matches: `http://localhost:5000/logincallback`
- Ensure "All users may self-authorize" is enabled

## Database Management Commands

```bash
# Stop database
docker-compose down

# Start database
docker-compose up -d

# View logs
docker logs -f apex-sandbox-db

# Access PostgreSQL CLI
docker exec -it apex-sandbox-db psql -U apex_user -d apex_sandbox

# Backup database
docker exec apex-sandbox-db pg_dump -U apex_user apex_sandbox > backup.sql

# Restore database
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < backup.sql
```

## What's Next?

- Visit `/leaderboard` to see top users
- Start with "Hello World" problem to test your setup
- Check `/the-team` page to learn more about the project

## Need Help?

- Check the full README.md for detailed documentation
- Review database scripts in `dbscripts/` folder
- Ensure all environment variables are set correctly in `.env`
