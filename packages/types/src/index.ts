// ================================
// BREWNAL — SHARED TYPES
// ================================

// --- User ---
export interface User {
  id: string
  email: string
  username: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
  brewerIdentity?: BrewerIdentity | null
  identitySetAt?: string | null
  onboardingCompleted: boolean
}

export enum BrewerIdentity {
  BEGINNER = 'BEGINNER',
  HOME_BREWER = 'HOME_BREWER',
  BARISTA_CAFE = 'BARISTA_CAFE',
  BARISTA_COMPETITION = 'BARISTA_COMPETITION',
}

export interface AuthResponse {
  user: User
}

// --- Sensory ---
export type SensoryLevel = 1 | 2 | 3

export interface SensoryProfile {
  bodyness?: SensoryLevel
  sweetness?: SensoryLevel
  acidity?: SensoryLevel
}

// --- Bean ---
export type ProcessMethod = 'Natural' | 'Washed' | 'Honey' | 'Anaerobic' | 'Other'
export type RoastLevel = 'Light' | 'Light-Medium' | 'Medium' | 'Medium-Dark' | 'Dark'

export interface Bean {
  id: string
  userId: string
  roastery: string
  beanName: string
  originCountry: string
  originRegion?: string
  altitude?: number
  varietal?: string
  process?: ProcessMethod
  roastLevel?: RoastLevel
  roastDate?: string
  photoUrl?: string
  notes?: string
  scannedAt?: string
  expectedBodyness?: SensoryLevel
  expectedSweetness?: SensoryLevel
  expectedAcidity?: SensoryLevel
  createdAt: string
}

export interface CreateBeanDto {
  roastery: string
  beanName: string
  originCountry: string
  originRegion?: string
  altitude?: number
  varietal?: string
  process?: ProcessMethod
  roastLevel?: RoastLevel
  roastDate?: string
  photoUrl?: string
  notes?: string
  expectedBodyness?: SensoryLevel
  expectedSweetness?: SensoryLevel
  expectedAcidity?: SensoryLevel
}

// --- Brew Journal ---
export interface PourDetail {
  time_sec: number
  amount_ml: number
}

export interface BrewJournal {
  id: string
  userId: string
  beanId: string
  bean?: Bean
  brewMethod: string
  grinder?: string
  grindSize?: string
  doseGrams?: number
  waterMl?: number
  ratio?: string
  waterTempC?: number
  brewTimeSec?: number
  pourCount?: number
  pourDetails?: PourDetail[]
  tastingNotes: string[]
  rating?: number
  notes?: string
  isPublic: boolean
  actualBodyness?: SensoryLevel
  actualSweetness?: SensoryLevel
  actualAcidity?: SensoryLevel
  createdAt: string
}

export interface CreateBrewDto {
  beanId: string
  brewMethod: string
  grinder?: string
  grindSize?: string
  doseGrams?: number
  waterMl?: number
  ratio?: string
  waterTempC?: number
  brewTimeSec?: number
  pourCount?: number
  pourDetails?: PourDetail[]
  tastingNotes?: string[]
  rating?: number
  notes?: string
  isPublic?: boolean
  actualBodyness?: SensoryLevel
  actualSweetness?: SensoryLevel
  actualAcidity?: SensoryLevel
}

// --- AI ---
export interface ScanResult {
  roastery?: string
  beanName?: string
  originCountry?: string
  originRegion?: string
  altitude?: number
  varietal?: string
  process?: ProcessMethod
  roastLevel?: RoastLevel
  roastDate?: string
  expectedBodyness?: SensoryLevel
  expectedSweetness?: SensoryLevel
  expectedAcidity?: SensoryLevel
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  statusCode: number
}

// --- Language ---
export type Language = 'id' | 'en'
