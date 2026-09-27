import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import { registerUser, loginUser, getUserById, blacklistToken } from './auth.service'
import { t, getLang } from '../../lib/i18n'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

const PASSWORD_MIN = 8
// bcrypt only uses the first 72 bytes
const PASSWORD_MAX = 72

// Accepts a calendar date as YYYY-MM-DD and returns it as UTC midnight,
// or null if it's malformed, not a real date (e.g. 2001-02-30), in the future or before 1900.
function parseBirthdate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null
  if (date.getUTCFullYear() < 1900 || date.getTime() > Date.now()) return null
  return date
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/register', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { email, username, password, displayName, birthdate: rawBirthdate } = (req.body ?? {}) as Record<string, unknown>

    const birthdate = parseBirthdate(rawBirthdate)
    if (
      typeof email !== 'string' || !email ||
      typeof username !== 'string' || !username ||
      typeof password !== 'string' || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX ||
      (displayName !== undefined && typeof displayName !== 'string') ||
      !birthdate
    ) {
      return reply.code(400).send({ error: t('error.validation', lang), statusCode: 400 })
    }

    try {
      const user = await registerUser({ email, username, password, displayName, birthdate })
      const token = app.jwt.sign({ id: user.id, email: user.email })
      reply.setCookie('token', token, COOKIE_OPTS)
      return reply.code(201).send({
        data: { user },
        message: t('auth.register_success', lang),
      })
    } catch (err: any) {
      if (err.code === 'P2002') {
        const field = err.meta?.target?.includes('email') ? 'auth.email_taken' : 'auth.username_taken'
        return reply.code(409).send({ error: t(field, lang), statusCode: 409 })
      }
      req.log.error(err, 'register failed')
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
    reply.setCookie('token', token, COOKIE_OPTS)
    return reply.send({ data: { user } })
  })

  // POST /auth/logout
  app.post('/logout', { preHandler: authenticate }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const token = req.cookies.token ?? ''
    const decoded = req.user as { exp?: number }
    const expiresAt = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await blacklistToken(token, expiresAt)
    reply.clearCookie('token', { path: '/' })
    return reply.send({ message: t('auth.logout_success', lang) })
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
