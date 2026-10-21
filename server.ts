import express from 'express';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { db } from './src/db/index.ts';
import { campuses, facilities, foodWasteLogs } from './src/db/schema.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Sync user from Firebase Auth
app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || '';
    const name = (req.user as any)?.name || '';
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }
    const user = await getOrCreateUser(uid, email, name);
    res.json(user);
  } catch (error: any) {
    console.error('Failed to sync user in Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// API: Campuses
app.get('/api/campuses', async (_req, res) => {
  try {
    const allCampuses = await db.select().from(campuses);
    res.json(allCampuses);
  } catch (error: any) {
    console.error('Failed to fetch campuses:', error);
    res.status(500).json({ error: 'Failed to fetch campuses' });
  }
});

// API: Facilities
app.get('/api/facilities', async (_req, res) => {
  try {
    const allFacilities = await db.select().from(facilities);
    res.json(allFacilities);
  } catch (error: any) {
    console.error('Failed to fetch facilities:', error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// API: Waste logs
app.get('/api/waste-logs', async (_req, res) => {
  try {
    const logs = await db.select().from(foodWasteLogs).limit(100);
    res.json(logs);
  } catch (error: any) {
    console.error('Failed to fetch waste logs:', error);
    res.status(500).json({ error: 'Failed to fetch waste logs' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
