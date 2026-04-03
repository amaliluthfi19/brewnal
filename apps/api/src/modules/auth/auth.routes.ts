import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import { registerUser, loginUser, getUserById } from './auth.service'
import { t, getLang } from '../../lib/i18n'

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/register', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { email, username, password, displayName, brewerIdentity } = req.body as {
      email: string
      username: string
      password: string
      displayName?: string
      brewerIdentity?: string | null
    }

    try {
      const user = await registerUser({ email, username, password, displayName, brewerIdentity: brewerIdentity as any })
      const token = app.jwt.sign({ id: user.id, email: user.email })
      return reply.code(201).send({
        data: { token, user },
        message: t('auth.register_success', lang),
      })
    } catch (err: any) {
      if (err.code === 'P2002') {
        const field = err.meta?.target?.includes('email') ? 'auth.email_taken' : 'auth.username_taken'
        return reply.code(409).send({ error: t(field, lang), statusCode: 409 })
      }
      return reply.code(500).send({ error: t('error.server', lang), statusCode: 500 })
    }
  })

  // POST /auth/login
  app.post('/login', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { email, password } = req.body as { email: string; password: string }

    const user = await loginUser(email, password)
    if (!user) {
      return reply.code(401).send({ error: t('auth.invalid_credentials', lang), statusCode: 401 })
    }

    const token = app.jwt.sign({ id: user.id, email: user.email })
    return reply.send({ data: { token, user } })
  })

  // GET /auth/me
  app.get('/me', { preHandler: authenticate }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const payload = req.user as { id: string }
    const user = await getUserById(payload.id)
    if (!user) {
      return reply.code(404).send({ error: t('auth.user_not_found', lang), statusCode: 404 })
    }
    return reply.send({ data: user })
  })
}
