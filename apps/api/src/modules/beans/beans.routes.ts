import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import { getBeansByUser, getBeanById, createBean, updateBean, deleteBean } from './beans.service'
import { t, getLang } from '../../lib/i18n'

export async function beansRoutes(app: FastifyInstance) {
  // All beans routes require auth
  app.addHook('preHandler', authenticate)

  // GET /beans
  app.get('/', async (req) => {
    const { id } = req.user as { id: string }
    const beans = await getBeansByUser(id)
    return { data: beans }
  })

  // GET /beans/:id
  app.get('/:id', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    const bean = await getBeanById(id, userId)
    if (!bean) return reply.code(404).send({ error: t('beans.not_found', lang), statusCode: 404 })
    return { data: bean }
  })

  // POST /beans
  app.post('/', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id: userId } = req.user as { id: string }
    const bean = await createBean(userId, req.body as any)
    return reply.code(201).send({ data: bean, message: t('beans.created', lang) })
  })

  // PUT /beans/:id
  app.put('/:id', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    await updateBean(id, userId, req.body as any)
    return reply.send({ message: t('beans.updated', lang) })
  })

  // DELETE /beans/:id
  app.delete('/:id', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    await deleteBean(id, userId)
    return reply.send({ message: t('beans.deleted', lang) })
  })
}
