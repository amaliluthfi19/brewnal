import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type { BrewSuggestions, DrinkType, PourDetail } from '@brewnal/types'

// Shape of a request body after brew.schema.ts has validated it.
// Optional fields may be null so an edit can clear them.
export interface BrewInput {
  beanId: string
  drinkType: DrinkType
  equipment?: string | null
  grinder?: string | null
  grindSize?: string | null
  doseGrams?: number | null
  waterMl?: number | null
  yieldGrams?: number | null
  ratio?: string | null
  waterTempC?: number | null
  brewTimeSec?: number | null
  pourCount?: number | null
  pourDetails?: PourDetail[] | null
  tastingNotes?: string[]
  rating?: number | null
  notes?: string | null
  actualBodyness?: number | null
  actualSweetness?: number | null
  actualAcidity?: number | null
}

const SUGGESTION_LIMIT = 20

// Blank strings become null so "  " is never stored as a grinder name
const clean = (value: string | null | undefined) => {
  if (value === undefined) return undefined
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

// Explicit allowlist: only these columns can ever be written from a request body
function toData(data: BrewInput) {
  return {
    drinkType: data.drinkType,
    equipment: clean(data.equipment),
    grinder: clean(data.grinder),
    grindSize: clean(data.grindSize),
    doseGrams: data.doseGrams,
    waterMl: data.waterMl,
    yieldGrams: data.yieldGrams,
    ratio: clean(data.ratio),
    waterTempC: data.waterTempC,
    brewTimeSec: data.brewTimeSec,
    pourCount: data.pourCount,
    ...(data.pourDetails !== undefined && {
      pourDetails:
        data.pourDetails === null
          ? Prisma.DbNull
          : (data.pourDetails as unknown as Prisma.InputJsonValue),
    }),
    ...(data.tastingNotes !== undefined && {
      tastingNotes: [...new Set(data.tastingNotes.map((n) => n.trim()).filter(Boolean))],
    }),
    rating: data.rating,
    notes: clean(data.notes),
    actualBodyness: data.actualBodyness,
    actualSweetness: data.actualSweetness,
    actualAcidity: data.actualAcidity,
  }
}

async function ownsBean(beanId: string, userId: string) {
  const bean = await prisma.bean.findFirst({ where: { id: beanId, userId }, select: { id: true } })
  return !!bean
}

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

// Returns null when the bean doesn't belong to the user
export async function createBrew(userId: string, data: BrewInput) {
  if (!(await ownsBean(data.beanId, userId))) return null
  const fields = toData(data)
  return prisma.brewJournal.create({
    data: { ...fields, tastingNotes: fields.tastingNotes ?? [], userId, beanId: data.beanId },
    include: { bean: true },
  })
}

// Returns 'bean_not_found' when the target bean isn't the user's, else the number of rows updated
export async function updateBrew(id: string, userId: string, data: BrewInput) {
  if (!(await ownsBean(data.beanId, userId))) return 'bean_not_found' as const
  const { count } = await prisma.brewJournal.updateMany({
    where: { id, userId },
    data: { ...toData(data), beanId: data.beanId },
  })
  return count
}

export async function deleteBrew(id: string, userId: string) {
  const { count } = await prisma.brewJournal.deleteMany({
    where: { id, userId },
  })
  return count
}

// Grinders and equipment this user has typed before, most recent first
export async function getSuggestions(userId: string): Promise<BrewSuggestions> {
  const [grinders, equipment] = await Promise.all([
    prisma.brewJournal.findMany({
      where: { userId, grinder: { not: null } },
      distinct: ['grinder'],
      select: { grinder: true },
      orderBy: { createdAt: 'desc' },
      take: SUGGESTION_LIMIT,
    }),
    prisma.brewJournal.findMany({
      where: { userId, equipment: { not: null } },
      distinct: ['equipment'],
      select: { equipment: true },
      orderBy: { createdAt: 'desc' },
      take: SUGGESTION_LIMIT,
    }),
  ])
  return {
    grinders: grinders.map((b) => b.grinder!),
    equipment: equipment.map((b) => b.equipment!),
  }
}
