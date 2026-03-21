Deploy backend to Render — quick checklist

1) MongoDB Atlas
- Create a MongoDB Atlas cluster, create a DB user, and copy the connection string.
  Example (replace <user>,<pass>,<dbname>):
  mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/<dbname>?retryWrites=true&w=majority

2) Render service setup
- Option A (render.yaml present): Render will use `render.yaml` from repo root automatically.
- Option B (manual): In Render Dashboard > New > Web Service:
  - Repo: select your repo (nottee9-resto-website)
  - Branch: main
  - Root Directory: server
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Health Check Path: `/api/health`

3) Required environment variables (Render → Service → Environment)
- `MONGODB_URI` = Atlas connection string
- `JWT_SECRET` = secure random string
- `CLIENT_URL` = your frontend URL (Vercel) e.g. https://your-site.vercel.app
- `NODE_ENV` = production
- (Optional) SMTP credentials if using email: `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`

4) Trigger deploy
- Push commits to `main` or trigger Manual Deploy in Render.
- Watch the Build and Start logs — common failures: missing envs, DB auth, port binding.

5) Verify
- Health check:
  curl https://<your-service>.onrender.com/api/health
- Admin dashboard: https://<your-service>.onrender.com/admin.html

Local testing
```
cd server
npm install
MONGODB_URI="<local-uri>" JWT_SECRET=dev CLIENT_URL=http://localhost:3000 npm start
curl http://localhost:5000/api/health
```

Security note
- Do NOT commit credentials. Use Render's Environment settings to store secrets.
