import { api } from '../lib/api'
import type { BrewerIdentity } from '@brewnal/types'

export const profileService = {
  updateIdentity: (brewerIdentity: BrewerIdentity) =>
    api.patch<{ data: { success: boolean; brewerIdentity: BrewerIdentity } }>('/profile/identity', {
      brewerIdentity,
    }),
}
