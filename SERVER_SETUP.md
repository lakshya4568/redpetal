# Backend Server Setup and Troubleshooting

## Quick Start

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and update the values, especially:

- `DB_PASSWORD`: Your PostgreSQL password
- `JWT_SECRET`: A secure random string

### 2. Install Server Dependencies

```bash
cd server
pnpm install
```

### 3. Ensure PostgreSQL is Running

Make sure PostgreSQL is running on your machine:

```bash
# On macOS with Homebrew
brew services start postgresql@14

# Or check if it's already running
pg_isready
```

### 4. Start the Backend Server

From the `server` directory:

```bash
pnpm run dev
```

You should see:

```
🚀 Server is running on port 3000
📝 API docs: http://localhost:3000/
```

### 5. Test the Connection

Open a browser or use curl:

```bash
curl http://localhost:3000/
```

## Common Issues and Solutions

### Issue 1: "Network request failed" in React Native App

**Cause**: The backend server is not running or the app can't reach it.

**Solutions**:

1. Make sure the backend is running: `cd server && pnpm run dev`
2. Check your IP address matches in `app/services/api.ts`
3. On Android emulator, the server should use `10.0.2.2` instead of `localhost`
4. On iOS simulator, `localhost` works
5. On physical devices, use your computer's local IP (e.g., `192.168.1.2`)

### Issue 2: Database Connection Failed

**Cause**: PostgreSQL is not running or credentials are wrong.

**Solutions**:

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql@14

# Check database exists
psql -l | grep redpetal

# Create database if it doesn't exist
createdb redpetal
```

### Issue 3: Port 3000 Already in Use

**Cause**: Another process is using port 3000.

**Solutions**:

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=3001
```

## Testing API Endpoints

### Health Check

```bash
curl http://localhost:3000/
```

### Get Posts

```bash
curl http://localhost:3000/api/community/posts
```

### Get Remedies

```bash
curl http://localhost:3000/api/remedies
```

## Development Workflow

1. **Terminal 1**: Run the backend server

   ```bash
   cd server
   pnpm run dev
   ```

2. **Terminal 2**: Run the React Native app

   ```bash
   pnpm start
   ```

3. **Terminal 3**: Available for other commands (git, database, etc.)

## Environment Variables Reference

| Variable       | Description           | Default        |
| -------------- | --------------------- | -------------- |
| `PORT`         | Server port           | 3000           |
| `DB_HOST`      | PostgreSQL host       | localhost      |
| `DB_PORT`      | PostgreSQL port       | 5432           |
| `DB_NAME`      | Database name         | redpetal       |
| `DB_USER`      | Database user         | postgres       |
| `DB_PASSWORD`  | Database password     | password       |
| `JWT_SECRET`   | Secret for JWT tokens | (required)     |
| `CORS_ORIGINS` | Allowed origins       | localhost:8081 |

## Logs and Debugging

The server logs all requests and errors. Look for:

- ✅ Successful requests: `200 OK`
- ❌ Errors: Stack traces with line numbers
- 🔍 Database queries: In development mode

Common log patterns:

```
[API] Base URL: http://192.168.1.2:3000/api  ← Check this matches your server
API request failed: ... [TypeError: Network request failed]  ← Server not reachable
```
