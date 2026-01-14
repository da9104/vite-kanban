import dotenv from 'dotenv'
dotenv.config()
import fs from 'node:fs/promises'
import express from 'express'
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from './server/supabase.js';
import authRoutes from './api/auth.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export const app = express()
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://vite-kanban.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Socket.IO connection handler
const onlineUsers = new Map(); // Maps socket.id to user object

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // When a user joins, store their data and notify others
  socket.on('join-app', (user) => {
    // Tell the new user about everyone else who is already there
    const others = Array.from(onlineUsers.values());
    socket.emit('others-present', others);

    // Store the new user's data
    onlineUsers.set(socket.id, user);

    // Tell everyone else that a new user has joined
    socket.broadcast.emit('user-joined', user);
  });

  // When a user moves their cursor, broadcast it to others
  socket.on('cursor-move', (cursorData) => {
    socket.broadcast.emit('cursor-update', cursorData);
  });

  // When a user disconnects, remove them and notify others
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      // Tell everyone else that this user has left
      socket.broadcast.emit('user-leave', { id: user.id });
    }
  });
});

app.use(cookieParser());
app.use(express.static(join(__dirname, 'dist/client'), { index: false }))
app.use('/assets', express.static(join(__dirname, 'dist/client/assets'), { index: false }))
app.use(express.json());

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 4000 // Changed to 4000 to match client
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile(join(__dirname, 'dist/client/index.html'), 'utf-8')
  : ''

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv(join(__dirname, 'dist/client'), { extensions: [], index: false }))
}

app.use('/api/auth', authRoutes)    

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')
    const supabase = createClient(req, res)
    
    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.js').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import('./dist/server/entry-server.js')).render
    }
    
    const { html, head, initialState } = await render(url);
       
    const stateScript = `<script>window.__INITIAL_STATE__=${JSON.stringify(initialState || {})}</script>`;

    const finalHtml = template
      .replace(`<!--app-head-->`, head ?? '')
      .replace(`<!--app-html-->`, html ?? '')
      .replace('</body>', `${stateScript}</body>`);

    res.status(200).set({ 'Content-Type': 'text/html' }).send(finalHtml)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start the server
if (!process.env.VERCEL) {
  server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
}

export default app