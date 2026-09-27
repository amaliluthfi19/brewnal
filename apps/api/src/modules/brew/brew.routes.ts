import { FastifyError, FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import {
  getBrewsByUser,
  getBrewById,
  createBrew,
  updateBrew,
  deleteBrew,
  getSuggestions,
  BrewInput,
} from './brew.service'
import {
  brewIdSchema,
  createBrewSchema,
  listBrewsSchema,
  updateBrewSchema,
} from './brew.schema'
import { t, getLang } from '../../lib/i18n'

export async function brewRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  // Schema failures get the app's localized error shape instead of AJV's internals
  app.setErrorHandler((err: FastifyError, req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    if (err.validation) {
      return reply.code(400).send({ error: t('error.validation', lang), statusCode: 400 })
    }
    req.log.error(err, 'brew route failed')
    return reply.code(500).send({ error: t('error.server', lang), statusCode: 500 })
  })

  // GET /brews?beanId=xxx
  app.get('/', { schema: listBrewsSchema }, async (req) => {
    const { id: userId } = req.user as { id: string }
    const { beanId } = req.query as { beanId?: string }
    const brews = await getBrewsByUser(userId, { beanId })
    return { data: brews }
  })

  // GET /brews/suggestions: grinders & equipment used before, for the wizard's dropdowns
  app.get('/suggestions', async (req) => {
    const { id: userId } = req.user as { id: string }
    return { data: await getSuggestions(userId) }
  })

  // GET /brews/:id
  app.get('/:id', { schema: brewIdSchema }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    const brew = await getBrewById(id, userId)
    if (!brew) return reply.code(404).send({ error: t('brew.not_found', lang), statusCode: 404 })
    return { data: brew }
  })

  // POST /brews
  app.post('/', { schema: createBrewSchema }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id: userId } = req.user as { id: string }
    const brew = await createBrew(userId, req.body as BrewInput)
    if (!brew) return reply.code(404).send({ error: t('beans.not_found', lang), statusCode: 404 })
    return reply.code(201).send({ data: brew, message: t('brew.created', lang) })
  })

  // PUT /brews/:id
  app.put('/:id', { schema: updateBrewSchema }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    const result = await updateBrew(id, userId, req.body as BrewInput)
    if (result === 'bean_not_found') {
      return reply.code(404).send({ error: t('beans.not_found', lang), statusCode: 404 })
    }
    if (result === 0) return reply.code(404).send({ error: t('brew.not_found', lang), statusCode: 404 })
    return reply.send({ message: t('brew.updated', lang) })
  })

  // DELETE /brews/:id
  app.delete('/:id', { schema: brewIdSchema }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    const count = await deleteBrew(id, userId)
    if (count === 0) return reply.code(404).send({ error: t('brew.not_found', lang), statusCode: 404 })
    return reply.send({ message: t('brew.deleted', lang) })
  })
}
