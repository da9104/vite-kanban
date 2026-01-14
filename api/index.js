// api/index.js
import { createServer } from 'http'
import { app } from '../server.js'  // Your Express app

// Vercel serverless handler
export default async function handler(req, res) {
  return new Promise((resolve) => {
    // Convert Vercel req to Node http.IncomingMessage
    const httpReq = req
    const httpRes = res
    
    app(httpReq, httpRes)
    
    httpRes.on('finish', () => resolve())
    httpRes.on('close', () => resolve())
  })
}
