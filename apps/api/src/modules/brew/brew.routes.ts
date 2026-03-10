import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import { getBrewsByUser, getBrewById, createBrew, updateBrew, deleteBrew } from './brew.service'
import { t, getLang } from '../../lib/i18n'

export async function brewRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // GET /brews?beanId=xxx
  app.get('/', async (req) => {
    const { id: userId } = req.user as { id: string }
    const { beanId } = req.query as { beanId?: string }
    const brews = await getBrewsByUser(userId, { beanId })
    return { data: brews }
  })

  // GET /brews/:id
  app.get('/:id', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    const brew = await getBrewById(id, userId)
    if (!brew) return reply.code(404).send({ error: t('brew.not_found', lang), statusCode: 404 })
    return { data: brew }
  })

  // POST /brews
  app.post('/', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id: userId } = req.user as { id: string }
    const brew = await createBrew(userId, req.body as any)
    return reply.code(201).send({ data: brew, message: t('brew.created', lang) })
  })

  // PUT /brews/:id
  app.put('/:id', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    await updateBrew(id, userId, req.body as any)
    return reply.send({ message: t('brew.updated', lang) })
  })

  // DELETE /brews/:id
  app.delete('/:id', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    await deleteBrew(id, userId)
    return reply.send({ message: t('brew.deleted', lang) })
  })
}
