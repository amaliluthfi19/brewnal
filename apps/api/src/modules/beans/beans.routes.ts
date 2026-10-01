import { FastifyError, FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.middleware'
import {
  getBeansByUser,
  getBeanById,
  createBean,
  updateBean,
  deleteBean,
  saveBeanPhoto,
  getBeanPhoto,
  deleteBeanPhoto,
  BeanInput,
} from './beans.service'
import { createBeanSchema, updateBeanSchema } from './beans.schema'
import { isStorageConfigured, detectImageType } from '../../lib/storage'
import { t, getLang } from '../../lib/i18n'

export async function beansRoutes(app: FastifyInstance) {
  // All beans routes require auth
  app.addHook('preHandler', authenticate)

  // Schema failures get the app's localized error shape instead of AJV's internals
  app.setErrorHandler((err: FastifyError, req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    if (err.validation) {
      return reply.code(400).send({ error: t('error.validation', lang), statusCode: 400 })
    }
    req.log.error(err, 'beans route failed')
    return reply.code(500).send({ error: t('error.server', lang), statusCode: 500 })
  })

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
  app.post('/', { schema: createBeanSchema }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id: userId } = req.user as { id: string }
    const bean = await createBean(userId, req.body as BeanInput)
    return reply.code(201).send({ data: bean, message: t('beans.created', lang) })
  })

  // PUT /beans/:id
  app.put('/:id', { schema: updateBeanSchema }, async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    await updateBean(id, userId, req.body as Partial<BeanInput>)
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

  // POST /beans/:id/photo (multipart image)
  app.post('/:id/photo', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    if (!isStorageConfigured()) {
      return reply.code(503).send({ error: t('error.storage_unavailable', lang), statusCode: 503 })
    }

    let buffer: Buffer
    try {
      const file = await req.file()
      if (!file) return reply.code(400).send({ error: t('error.validation', lang), statusCode: 400 })
      // Throws once the 5 MB multipart limit is exceeded
      buffer = await file.toBuffer()
    } catch (err) {
      if ((err as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.code(413).send({ error: t('beans.photo_too_large', lang), statusCode: 413 })
      }
      return reply.code(400).send({ error: t('error.validation', lang), statusCode: 400 })
    }

    const contentType = detectImageType(buffer)
    if (!contentType) {
      return reply.code(415).send({ error: t('beans.photo_invalid', lang), statusCode: 415 })
    }

    const saved = await saveBeanPhoto(id, userId, buffer, contentType)
    if (!saved) return reply.code(404).send({ error: t('beans.not_found', lang), statusCode: 404 })
    return reply.send({ data: saved, message: t('beans.photo_updated', lang) })
  })

  // GET /beans/:id/photo
  app.get('/:id/photo', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    if (!isStorageConfigured()) {
      return reply.code(503).send({ error: t('error.storage_unavailable', lang), statusCode: 503 })
    }

    const photo = await getBeanPhoto(id, userId)
    if (!photo) return reply.code(404).send({ error: t('beans.photo_not_found', lang), statusCode: 404 })
    return reply
      .header('Content-Type', photo.contentType ?? 'application/octet-stream')
      // The stored type is authoritative; never let the browser guess another one
      .header('X-Content-Type-Options', 'nosniff')
      // private: a shared cache must never serve one user's photo to another
      .header('Cache-Control', 'private, max-age=31536000, immutable')
      .send(photo.body)
  })

  // DELETE /beans/:id/photo
  app.delete('/:id/photo', async (req, reply) => {
    const lang = getLang(req.headers['accept-language'])
    const { id } = req.params as { id: string }
    const { id: userId } = req.user as { id: string }
    if (!isStorageConfigured()) {
      return reply.code(503).send({ error: t('error.storage_unavailable', lang), statusCode: 503 })
    }

    const deleted = await deleteBeanPhoto(id, userId)
    if (!deleted) return reply.code(404).send({ error: t('beans.not_found', lang), statusCode: 404 })
    return reply.send({ message: t('beans.photo_deleted', lang) })
  })
}
