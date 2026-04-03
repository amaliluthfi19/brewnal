import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import { scanBeanLabel } from './ai.service'
import { t, getLang } from '../../lib/i18n'

export async function aiRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // POST /ai/scan-label
  app.post('/scan-label', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])

    try {
      const data = await req.file()
      if (!data) {
        return reply.code(400).send({ error: t('error.validation', lang), statusCode: 400 })
      }

      const buffer = await data.toBuffer()
      const base64 = buffer.toString('base64')
      const mimeType = data.mimetype || 'image/jpeg'

      const result = await scanBeanLabel(base64, mimeType)
      return reply.send({ data: result, message: t('ai.scan_success', lang) })
    } catch (err) {
      console.log(`${err}`)
      return reply.code(500).send({ error: t('ai.scan_failed', lang), statusCode: 500 })
    }
  })
}
