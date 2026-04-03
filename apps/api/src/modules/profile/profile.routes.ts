import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import { updateBrewerIdentity, isValidIdentity } from './profile.service'
import { t, getLang } from '../../lib/i18n'

export async function profileRoutes(app: FastifyInstance) {
  // PATCH /profile/identity
  app.patch('/identity', { preHandler: authenticate }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { brewerIdentity } = req.body as { brewerIdentity: string }
    const payload = req.user as { id: string }

    if (!brewerIdentity || !isValidIdentity(brewerIdentity)) {
      return reply.code(400).send({ error: t('error.validation', lang), statusCode: 400 })
    }

    try {
      const updated = await updateBrewerIdentity(payload.id, brewerIdentity)
      return reply.send({
        data: { success: true, brewerIdentity: updated.brewerIdentity },
        message: t('profile.identity_updated', lang),
      })
    } catch {
      return reply.code(500).send({ error: t('error.server', lang), statusCode: 500 })
    }
  })
}
