import { prisma } from '../../lib/prisma'
import { CreateBeanDto } from '@brewnal/types'
import { isStorageConfigured, putObject, getObject, deleteObject } from '../../lib/storage'

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
  const result = await prisma.bean.deleteMany({
    where: { id, userId },
  })
  // Best effort: an orphaned object must not fail a delete that already happened
  if (result.count > 0 && isStorageConfigured()) {
    await deleteObject(beanPhotoKey(userId, id)).catch((err) => console.error(`Failed to delete bean photo: ${err}`))
  }
  return result
}

// The key is built from the authenticated userId, so one user's request can
// never address another user's object
const beanPhotoKey = (userId: string, beanId: string) => `beans/${userId}/${beanId}`

const ownsBean = async (id: string, userId: string) =>
  (await prisma.bean.count({ where: { id, userId } })) > 0

// Returns null when the bean is not the user's
export async function saveBeanPhoto(id: string, userId: string, body: Buffer, contentType: string) {
  if (!(await ownsBean(id, userId))) return null
  await putObject(beanPhotoKey(userId, id), body, contentType)
  // Path relative to the API root. The version changes on every upload so the
  // long-lived browser cache never shows a replaced photo
  const photoUrl = `/beans/${id}/photo?v=${Date.now()}`
  await prisma.bean.updateMany({ where: { id, userId }, data: { photoUrl } })
  return { photoUrl }
}

export async function getBeanPhoto(id: string, userId: string) {
  if (!(await ownsBean(id, userId))) return null
  return getObject(beanPhotoKey(userId, id))
}

export async function deleteBeanPhoto(id: string, userId: string) {
  if (!(await ownsBean(id, userId))) return false
  await deleteObject(beanPhotoKey(userId, id))
  await prisma.bean.updateMany({ where: { id, userId }, data: { photoUrl: null } })
  return true
}
