import dotenv from 'dotenv'
dotenv.config()
import fs from 'node:fs/promises'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from './server/supabase.js';
import authRoutes from './api/auth.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export const app = express()

app.use(cors({
  origin: `${process.env.NODE_ENV !== 'production' ? 'http://localhost:4000' : process.env.VITE_SERVER_UR}`,
  credentials: true
}));

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
    // @ts-ignore
    const supabase = createClient(req, res)
    
    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.js').render} */
    let render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      // @ts-ignore
      template = await vite.transformIndexHtml(url, template)
      // @ts-ignore
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      // @ts-ignore
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
    // @ts-ignore
    vite?.ssrFixStacktrace(e)
    // @ts-ignore
    console.log(e.stack)
    // @ts-ignore
    res.status(500).end(e.stack)
  }
})

// Start the server
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
}

export default app