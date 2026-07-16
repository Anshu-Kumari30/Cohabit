Backend deployment checklist (Render) and Vercel frontend setup

Overview
- This project uses an Express Node backend that listens on a port and requires a MySQL database. Vercel is optimal for the frontend; for the backend use a host that supports long-running Node processes (Render, Railway, Heroku, or a Docker host).

Recommended: Render (quick, supports managed MySQL)

Steps
1. Create a managed MySQL instance (Render or PlanetScale). Note connection details: host, port, user, password, database name.

2. Deploy backend to Render
   - Connect your GitHub repo to Render and create a new "Web Service".
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: `Node` (use the default runtime)
   - In the Environment tab add these environment variables (copy values from your managed DB and secrets):
     - `DB_HOST` = your-db-host
     - `DB_PORT` = 3306
     - `DB_USER` = your-db-user
     - `DB_PASSWORD` = your-db-password
     - `DB_NAME` = cohabit (or your DB name)
     - `JWT_SECRET` = a secure random string
     - `FRONTEND_URL` = https://<your-frontend-domain>
   - Render will set `PORT` automatically — your `server.js` reads `process.env.PORT` so no change required.

3. Verify backend logs and health
   - After deploy, check service logs for startup messages (the server prints the health URL in console).
   - Verify `https://<your-backend>/api/health` responds with JSON.

4. Configure frontend (Vercel)
   - In your Vercel project settings (Environment Variables) add:
     - `REACT_APP_API_URL` = `https://<your-backend-domain>/api`
   - Redeploy the frontend (Vercel will rebuild using the new env var). The frontend build-time `process.env.REACT_APP_API_URL` will be baked into the app.

5. Test the deployed app
   - Open your frontend URL and try signing in.
   - If login fails, check browser console network tab, and backend logs for errors (DB auth, missing tables, CORS, etc.).

Common troubleshooting
- DB unreachable: ensure DB is publicly reachable from the backend host or use the host's managed DB add-on (same region recommended).
- Tables missing: this repo's `server.js` attempts to create the database and users table on startup for MySQL. If your DB user lacks privileges, either grant CREATE privileges or create the DB and table manually.
- CORS: `server.js` uses `cors()` open policy. If you lock CORS, add your frontend origin to allowed list.
- Env vars: never keep production secrets in git. Use the host's secret env settings.

Optional: Deploy backend to Render with a Managed Database on Render
- Render provides a one-click Managed Database — choose MySQL and Render will provide the connection info you can paste into your web service env vars.

If you want, I can:
- Create a short `README` with exact commands for your repo and a sample `vercel.json` for frontend environment guidance.
- Prepare a `Dockerfile` for container deployment instead.
