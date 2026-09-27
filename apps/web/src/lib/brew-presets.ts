// Popular gear shown in the wizard's dropdowns, merged with what the user typed before.
// Users can always type something that isn't listed.

export const GRINDER_PRESETS = [
  'Comandante C40',
  'Timemore C2',
  'Timemore C3',
  'Timemore Chestnut X',
  '1Zpresso JX-Pro',
  '1Zpresso K-Ultra',
  '1Zpresso ZP6',
  'Kingrinder K6',
  'Baratza Encore',
  'Fellow Ode',
  'Eureka Mignon',
  'DF64',
  'Niche Zero',
  'Mazzer Mini',
]

export const DRIPPER_PRESETS = [
  'V60',
  'Kalita Wave',
  'Origami',
  'Kono',
  'April Brewer',
  'Orea',
  'Aeropress',
  'Chemex',
  'Clever Dripper',
  'French Press',
  'Moka Pot',
  'Vietnam Drip',
  'Siphon',
]

export const MACHINE_PRESETS = [
  'La Marzocco Linea Mini',
  'La Marzocco GS3',
  'Rocket Appartamento',
  'Lelit Bianca',
  'Gaggia Classic Pro',
  'Breville Barista Express',
  'Breville Dual Boiler',
  'Rancilio Silvia',
  'Flair 58',
  'Nuova Simonelli Appia',
  'Victoria Arduino Eagle One',
]

// "1:16.7" from a dose and an output (water ml or espresso yield g); undefined if either is missing
export function computeRatio(dose?: number, output?: number): string | undefined {
  if (!dose || !output) return undefined
  const x = Math.round((output / dose) * 10) / 10
  return `1:${Number.isInteger(x) ? x : x.toFixed(1)}`
}
