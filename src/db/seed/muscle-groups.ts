export const MUSCLE_GROUPS = [
  // Upper body - Push
  { id: 'mg-chest', name: 'Chest', bodyRegion: 'upper_body' },
  { id: 'mg-pec-minor', name: 'Pectoralis Minor', bodyRegion: 'upper_body' },
  { id: 'mg-ant-delt', name: 'Anterior Deltoid', bodyRegion: 'upper_body' },
  { id: 'mg-lat-delt', name: 'Lateral Deltoid', bodyRegion: 'upper_body' },
  { id: 'mg-triceps', name: 'Triceps', bodyRegion: 'upper_body' },

  // Upper body - Pull
  { id: 'mg-lats', name: 'Latissimus Dorsi', bodyRegion: 'upper_body' },
  { id: 'mg-rhomboids', name: 'Rhomboids', bodyRegion: 'upper_body' },
  { id: 'mg-traps', name: 'Trapezius', bodyRegion: 'upper_body' },
  { id: 'mg-rear-delt', name: 'Rear Deltoid', bodyRegion: 'upper_body' },
  { id: 'mg-biceps', name: 'Biceps', bodyRegion: 'upper_body' },
  { id: 'mg-forearms', name: 'Forearms', bodyRegion: 'upper_body' },
  { id: 'mg-teres-major', name: 'Teres Major', bodyRegion: 'upper_body' },

  // Lower body
  { id: 'mg-quads', name: 'Quadriceps', bodyRegion: 'lower_body' },
  { id: 'mg-hamstrings', name: 'Hamstrings', bodyRegion: 'lower_body' },
  { id: 'mg-glutes', name: 'Glutes', bodyRegion: 'lower_body' },
  { id: 'mg-adductors', name: 'Adductors', bodyRegion: 'lower_body' },
  { id: 'mg-abductors', name: 'Abductors', bodyRegion: 'lower_body' },
  { id: 'mg-hip-flexors', name: 'Hip Flexors', bodyRegion: 'lower_body' },
  { id: 'mg-calves', name: 'Calves', bodyRegion: 'lower_body' },
  { id: 'mg-soleus', name: 'Soleus', bodyRegion: 'lower_body' },

  // Core
  { id: 'mg-abs', name: 'Rectus Abdominis', bodyRegion: 'core' },
  { id: 'mg-obliques', name: 'Obliques', bodyRegion: 'core' },
  { id: 'mg-tva', name: 'Transverse Abdominis', bodyRegion: 'core' },
  { id: 'mg-erectors', name: 'Erector Spinae', bodyRegion: 'core' },
] as const;

export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number]['id'];
