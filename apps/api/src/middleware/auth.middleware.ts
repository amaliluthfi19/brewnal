import { FastifyRequest, FastifyReply } from 'fastify'
import { isTokenBlacklisted } from '../modules/auth/auth.service'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify({ onlyCookie: true })
    const token = req.cookies.token ?? ''
    if (await isTokenBlacklisted(token)) {
      return reply.code(401).send({ error: 'Unauthorized', statusCode: 401 })
    }
  } catch {
    reply.code(401).send({ error: 'Unauthorized', statusCode: 401 })
  }
}
