import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

import { authRoutes } from './modules/auth/auth.routes'
import { beansRoutes } from './modules/beans/beans.routes'
import { brewRoutes } from './modules/brew/brew.routes'
import { aiRoutes } from './modules/ai/ai.routes'
import { profileRoutes } from './modules/profile/profile.routes'

const app = Fastify({ logger: { level: 'warn' } })

// Plugins
app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'fallback-secret',
})

app.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// Log all responses
app.addHook('onSend', async (req, reply, payload) => {
  if (req.method === 'OPTIONS') return payload
  console.log(`[${reply.statusCode}] ${req.method} ${req.url}`, payload)
  return payload
})

// Routes
app.register(authRoutes, { prefix: '/auth' })
app.register(beansRoutes, { prefix: '/beans' })
app.register(brewRoutes, { prefix: '/brews' })
app.register(aiRoutes, { prefix: '/ai' })
app.register(profileRoutes, { prefix: '/profile' })

// Health check
app.get('/health', async () => ({ status: 'ok', app: 'Brewnal API' }))

// Start
const start = async () => {
  try {
    const port = Number(process.env.PORT) ?? 3001
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🍵 Brewnal API running on port ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()



