import { prisma } from '../../lib/prisma'

type BrewerIdentity = 'BEGINNER' | 'HOME_BREWER' | 'BARISTA_CAFE' | 'BARISTA_COMPETITION'

const VALID_IDENTITIES: BrewerIdentity[] = ['BEGINNER', 'HOME_BREWER', 'BARISTA_CAFE', 'BARISTA_COMPETITION']

export function isValidIdentity(value: string): value is BrewerIdentity {
  return VALID_IDENTITIES.includes(value as BrewerIdentity)
}

export async function updateBrewerIdentity(userId: string, brewerIdentity: BrewerIdentity) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      brewerIdentity: brewerIdentity as any,
      identitySetAt: new Date(),
      onboardingCompleted: true,
    },
    select: {
      id: true,
      brewerIdentity: true,
      onboardingCompleted: true,
    },
  })
}
