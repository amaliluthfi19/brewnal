import { prisma } from '../../lib/prisma'
import { CreateBeanDto } from '@brewnal/types'

export async function getBeansByUser(userId: string) {
  return prisma.bean.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getBeanById(id: string, userId: string) {
  return prisma.bean.findFirst({
    where: { id, userId },
    include: {
      brews: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
}

export async function createBean(userId: string, data: CreateBeanDto) {
  return prisma.bean.create({
    data: { ...data, userId },
  })
}

export async function updateBean(id: string, userId: string, data: Partial<CreateBeanDto>) {
  return prisma.bean.updateMany({
    where: { id, userId },
    data,
  })
}

export async function deleteBean(id: string, userId: string) {
  return prisma.bean.deleteMany({
    where: { id, userId },
  })
}
