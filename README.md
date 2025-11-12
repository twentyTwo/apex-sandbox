# apex-sandbox

## Prerequisites

- Node.js v14.15.3 or later
- Docker and Docker Compose (for local PostgreSQL database)
- Salesforce Developer Account (for OAuth setup)

## Setup

### 1. Install Dependencies

```bash
npm install
cd client
npm install
cd ..
```

### 2. Set Up PostgreSQL Database with Docker

#### Option A: Using Docker Compose (Recommended)

1. Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: apex-sandbox-db
    environment:
      POSTGRES_USER: apex_user
      POSTGRES_PASSWORD: apex_password
      POSTGRES_DB: apex_sandbox
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./dbscripts:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

2. Start the PostgreSQL container:

```bash
docker-compose up -d
```

3. Initialize the database schema by running the SQL scripts in order:

```bash
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/users.sql
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/session.sql
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problem_categories.sql
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problems.sql
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problem_attempts.sql
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < dbscripts/problem_user_success.sql
```

#### Option B: Using Docker CLI Only

```bash
# Start PostgreSQL container
docker run --name apex-sandbox-db \
  -e POSTGRES_USER=apex_user \
  -e POSTGRES_PASSWORD=apex_password \
  -e POSTGRES_DB=apex_sandbox \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:14

# Initialize schema (run SQL scripts as shown above)
```

### 3. Configure Salesforce Connected App

1. Log in to your Salesforce Developer Org
2. Go to **Setup** → **App Manager** → **New Connected App**
3. Configure OAuth Settings:
   - **Enable OAuth Settings:** ✓
   - **Callback URL:** `http://localhost:5000/logincallback`
   - **Selected OAuth Scopes:** `api`, `refresh_token`
4. After saving, click **Manage** → **Edit Policies**:
   - **Permitted Users:** "All users may self-authorize"
   - **IP Relaxation:** "Relax IP restrictions"
5. Copy the **Consumer Key** and **Consumer Secret**

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Server Configuration
PORT=5000
ENV_NAME=development

# Salesforce OAuth Configuration
CLIENT_ID=your_salesforce_consumer_key
CLIENT_SECRET=your_salesforce_consumer_secret
LOGIN_CALLBACK=http://localhost:5000/logincallback

# Session Configuration
SESSION_SECRET=your_random_session_secret_here

# Database Configuration (Docker)
DATABASE_URL=postgresql://apex_user:apex_password@localhost:5432/apex_sandbox

# Site Configuration
SITE_BASEURL=http://localhost:3000
```

## Running the Application

### Start the Backend Server

```bash
# PowerShell
node -r dotenv/config index.js

# Command Prompt
set NODE_OPTIONS= && node -r dotenv/config index.js
```

The backend will run on `http://localhost:5000`

### Start the Frontend (React)

```bash
cd client

# PowerShell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start

# Command Prompt
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

The frontend will run on `http://localhost:3000`

**Note:** If running with Node.js v17+, you may need to set the `NODE_OPTIONS` environment variable to use the legacy OpenSSL provider due to compatibility with older webpack versions.

## Database Management

### Stop PostgreSQL Container
```bash
docker-compose down
```

### Restart PostgreSQL Container
```bash
docker-compose up -d
```

### Access PostgreSQL CLI
```bash
docker exec -it apex-sandbox-db psql -U apex_user -d apex_sandbox
```

### View Container Logs
```bash
docker logs apex-sandbox-db
```

### Backup Database
```bash
docker exec apex-sandbox-db pg_dump -U apex_user apex_sandbox > backup.sql
```

### Restore Database
```bash
docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox < backup.sql
```

## Deployment

### Deploy to Heroku

1. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

2. Set environment variables:
```bash
heroku config:set CLIENT_ID=your_client_id
heroku config:set CLIENT_SECRET=your_client_secret
heroku config:set SESSION_SECRET=your_session_secret
heroku config:set LOGIN_CALLBACK=https://your-app.herokuapp.com/logincallback
heroku config:set SITE_BASEURL=https://your-app.herokuapp.com
```

3. Deploy:
```bash
git push heroku main
```

## Troubleshooting

### Port Already in Use
If you get `EADDRINUSE` errors, kill existing Node processes:

**PowerShell:**
```powershell
taskkill /IM node.exe /F
```

**Command Prompt:**
```cmd
taskkill /F /IM node.exe
```

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker ps`
- Check container logs: `docker logs apex-sandbox-db`
- Verify DATABASE_URL in `.env` matches container credentials

### OAuth Errors
- Verify Connected App settings in Salesforce
- Ensure callback URL matches exactly
- Check that "All users may self-authorize" is enabled