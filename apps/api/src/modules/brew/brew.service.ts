import { prisma } from '../../lib/prisma'
import { CreateBrewDto } from '@brewnal/types'

export async function getBrewsByUser(userId: string, filters?: { beanId?: string }) {
  return prisma.brewJournal.findMany({
    where: { userId, ...(filters?.beanId && { beanId: filters.beanId }) },
    include: { bean: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getBrewById(id: string, userId: string) {
  return prisma.brewJournal.findFirst({
    where: { id, userId },
    include: { bean: true },
  })
}

export async function createBrew(userId: string, data: CreateBrewDto) {
  const { pourDetails, ...rest } = data
  return prisma.brewJournal.create({
    data: {
      ...rest,
      userId,
      tastingNotes: data.tastingNotes ?? [],
      ...(pourDetails !== undefined && { pourDetails: pourDetails as object[] }),
    },
    include: { bean: true },
  })
}

export async function updateBrew(id: string, userId: string, data: Partial<CreateBrewDto>) {
  const { beanId, pourDetails, ...rest } = data
  return prisma.brewJournal.updateMany({
    where: { id, userId },
    data: {
      ...rest,
      ...(pourDetails !== undefined && { pourDetails: pourDetails as object[] }),
    },
  })
}

export async function deleteBrew(id: string, userId: string) {
  return prisma.brewJournal.deleteMany({
    where: { id, userId },
  })
}
