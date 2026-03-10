import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'

export async function registerUser(data: {
  email: string
  username: string
  password: string
  displayName?: string
}) {
  const passwordHash = await bcrypt.hash(data.password, 12)
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      passwordHash,
      displayName: data.displayName,
    },
    select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, createdAt: true },
  })
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (!user) return null

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null

  const { passwordHash: _, ...safeUser } = user
  return safeUser
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, createdAt: true },
  })
}
