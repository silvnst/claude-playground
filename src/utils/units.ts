const KG_TO_LBS = 2.20462;

export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10;
}

export function formatWeight(kg: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg} kg`;
}

export function parseWeightToKg(value: number, unit: 'metric' | 'imperial'): number {
  return unit === 'imperial' ? lbsToKg(value) : value;
}

export function getWeightLabel(unit: 'metric' | 'imperial'): string {
  return unit === 'imperial' ? 'lbs' : 'kg';
}
