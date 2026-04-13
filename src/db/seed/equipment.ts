export const EQUIPMENT = [
  { id: 'eq-barbell', name: 'Barbell' },
  { id: 'eq-dumbbell', name: 'Dumbbell' },
  { id: 'eq-cable', name: 'Cable' },
  { id: 'eq-machine', name: 'Machine' },
  { id: 'eq-bodyweight', name: 'Bodyweight' },
  { id: 'eq-kettlebell', name: 'Kettlebell' },
  { id: 'eq-band', name: 'Resistance Band' },
  { id: 'eq-smith', name: 'Smith Machine' },
  { id: 'eq-ez-bar', name: 'EZ Bar' },
  { id: 'eq-trap-bar', name: 'Trap Bar' },
  { id: 'eq-pullup-bar', name: 'Pull-up Bar' },
  { id: 'eq-dip-bars', name: 'Dip Bars' },
] as const;

export type EquipmentId = (typeof EQUIPMENT)[number]['id'];
