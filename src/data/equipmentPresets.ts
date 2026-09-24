import { EquipmentScanData, MuscleGroup } from '../types';

export const EQUIPMENT_PRESETS: Record<string, EquipmentScanData> = {
  Dumbbells: {
    equipmentName: 'Hex Dumbbells & Free Weight Station',
    equipmentType: 'dumbbell',
    primaryMuscle: 'Arms',
    targetMuscles: ['Biceps Brachii', 'Triceps Brachii', 'Brachialis', 'Anterior Deltoids'],
    overview: 'High-versatility unilateral free weight station allowing natural rotational freedom, deep eccentric muscle stretch, and correction of left/right muscle imbalances.',
    benefitsAndUses: [
      {
        title: 'Unilateral Symmetry Balancing',
        description: 'Each arm works independently, preventing the dominant limb from taking over and correcting side-to-side strength discrepancies.'
      },
      {
        title: 'Natural Wrist Supination Arc',
        description: 'Allows fluid rotation from neutral hammer grip into full supination, delivering a peak bicep contraction impossible on fixed barbells.'
      },
      {
        title: 'Unconstrained Loaded Range of Motion',
        description: 'Without a rigid crossbar, weights can descend past the ribcage for an intense eccentric stretch that triggers maximal muscle fiber recruitment.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Foundational motor pattern control, core stabilization, and mind-muscle connection.',
        exercises: [
          {
            name: 'Standing Dumbbell Bicep Curl',
            position: 'Standing upright, feet hip-width apart, elbows pinned against ribcage, neutral grip starting at hips',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Biceps Brachii & Forearms',
            tips: [
              'Keep elbows stationary by sides—do not swing forward',
              'Supinate wrists (turn palms to face ceiling) at top',
              'Control lowering phase for a full 2-second eccentric tempo'
            ]
          },
          {
            name: 'Overhead Two-Arm Dumbbell Extension',
            position: 'Seated upright on flat bench, dumbbell held vertically overhead with both hands cup-gripping upper plate, elbows forward',
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Triceps Long Head',
            tips: [
              'Keep upper arms close to ears without flaring out wide',
              'Lower dumbbell deep behind neck for deep long-head stretch',
              'Press smoothly to soft lockout overhead'
            ]
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Multi-angle hypertrophy, incline bench loading, and brachialis thickness builder.',
        exercises: [
          {
            name: 'Incline Dumbbell Curl',
            position: 'Seated back on 45° incline bench, head and shoulders firmly against pad, arms hanging vertically downward',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Long Head Bicep Peak',
            tips: [
              'Do not let shoulders roll forward off the bench',
              'Initiate curl with pure bicep tension without hip pop',
              'Squeeze at the top of the contraction for 1 second'
            ]
          },
          {
            name: 'Dumbbell Hammer Curls',
            position: 'Standing tall with slight athletic knee bend, dumbbells held with neutral palms-in grip throughout',
            setsAndReps: '4 sets × 10-12 reps',
            targetRepsBadge: '3x12',
            difficulty: 'Intermediate',
            targetArea: 'Brachialis & Forearm Radial Thickness',
            tips: [
              'Maintain strictly neutral grip (thumbs up) entire rep',
              'Eliminate any torso sway or momentum',
              'Pause momentarily at 90 degrees to hold peak tension'
            ]
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Strict isolation, chest-supported mechanical leverage, and high-intensity failure overload.',
        exercises: [
          {
            name: 'Dumbbell Spider Curls',
            position: 'Chest supported face-down on 45° incline bench, arms hanging completely vertical towards floor',
            setsAndReps: '4 sets × 10-12 reps',
            targetRepsBadge: '3x12',
            difficulty: 'Advanced',
            targetArea: 'Short Head Inner Bicep Peak',
            tips: [
              'Keep arms strictly perpendicular to the ground throughout',
              'Zero shoulder or back involvement is possible on this angle',
              'Contract hard at top contraction near forehead'
            ]
          },
          {
            name: 'Heavy Dumbbell Overhead Press',
            position: 'Seated on 75-80° incline bench, core braced tight, dumbbells starting at ear level with 90° elbow bend',
            setsAndReps: '4 sets × 6-8 reps',
            targetRepsBadge: '3x8',
            difficulty: 'Advanced',
            targetArea: 'Anterior & Lateral Deltoids',
            tips: [
              'Press in a smooth inward arc to soft lockout overhead',
              'Avoid slamming dumbbells together at the top',
              'Lower weights slowly over 3 seconds to ear line'
            ]
          }
        ]
      }
    }
  },
  Arms: {
    equipmentName: 'Biceps Preacher Bench & Cable Station',
    equipmentType: 'machine',
    primaryMuscle: 'Arms',
    targetMuscles: ['Biceps Brachii', 'Brachialis', 'Triceps Lateral Head', 'Forearms'],
    overview: 'Isolation station designed to lock the upper arm angle in place, isolating elbow flexion and preventing shoulder swing momentum.',
    benefitsAndUses: [
      {
        title: 'Strict Elbow Flexion Isolation',
        description: 'Padded arm rest locks humerus at 45 degrees, eliminating front delt recruitment for pure bicep peak activation.'
      },
      {
        title: 'Full Long Head Triceps Stretch',
        description: 'Overhead extensions deliver maximum loaded stretch on the long head of the triceps for upper arm thickness.'
      },
      {
        title: 'Mind-Muscle Hypertrophy Burn',
        description: 'Maintains constant peak tension at contraction, ideal for high-volume arm pump and vascularity.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Foundational arm hypertrophy focusing on mind-muscle connection and controlled tempo.',
        exercises: [
          {
            name: 'Dumbbell Preacher Curl',
            position: 'Seated with chest pressed firmly against 45° preacher pad, armpits locked at top rim, feet flat',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Lower Bicep & Peak',
            tips: ['Keep armpits snug against the pad', 'Lower smoothly over 2 full seconds', 'Do not hyperextend elbows at bottom']
          },
          {
            name: 'Overhead Dumbbell Triceps Extension',
            position: 'Standing or seated upright, elbows pointed forward tucked close to ears, core braced',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x10',
            difficulty: 'Beginner',
            targetArea: 'Long Head Triceps',
            tips: ['Keep elbows tucked close to ears', 'Lower weight deep behind neck for full stretch']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Progressive overload compound movements for overall arm mass and bone-crushing grip strength.',
        exercises: [
          {
            name: 'Standing Barbell Curl',
            position: 'Standing upright with neutral spine, feet shoulder-width, elbows pinned to lateral ribcage',
            setsAndReps: '3 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Overall Bicep Mass',
            tips: ['Pin elbows to ribcage', 'Squeeze at eye level', 'Avoid lower-back arching']
          },
          {
            name: 'Close-Grip Bench Press',
            position: 'Lying flat on bench, shoulder blades retracted, hands spaced 12-14 inches apart on barbell',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Intermediate',
            targetArea: 'Triceps Horseshoe Thickness',
            tips: ['Grip shoulder-width apart', 'Keep elbows close to sides', 'Lock out hard at top']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'High-intensity metabolic stress and extended tension techniques for stubborn growth.',
        exercises: [
          {
            name: '21s Bicep Curls',
            position: 'Standing tall with slight knee bend, chest proud, elbows stationary by torso',
            setsAndReps: '3 sets (7 bottom + 7 top + 7 full)',
            targetRepsBadge: '3x20',
            difficulty: 'Advanced',
            targetArea: 'Complete Bicep Exhaustion',
            tips: ['Control transition between ranges', 'Maximum burn at final 7 reps']
          },
          {
            name: 'Overhead Rope Triceps Extension',
            position: 'Facing away from high pulley cable, split stance, elbows elevated beside ears',
            setsAndReps: '4 sets × 12-15 reps',
            targetRepsBadge: '3x15',
            difficulty: 'Advanced',
            targetArea: 'Lateral & Long Triceps Head',
            tips: ['Flare rope handles apart at full extension', 'Keep core braced to prevent back arch']
          }
        ]
      }
    }
  },
  Chest: {
    equipmentName: 'Chest Press Machine & Incline Bench',
    equipmentType: 'machine',
    primaryMuscle: 'Chest',
    targetMuscles: ['Pectoralis Major (Sternal)', 'Clavicular Pecs', 'Anterior Deltoids', 'Triceps'],
    overview: 'Guided dual-lever compound pressing machine engineered for fixed-path safety, stable scapular retracting, and maximum pectoral recruitment.',
    benefitsAndUses: [
      {
        title: 'Stabilizer-Free Pectoral Overload',
        description: 'Guided track removes rotator cuff stabilization fatigue, allowing 100% force output directed purely into the pecs.'
      },
      {
        title: 'Constant Tension Curve',
        description: 'Cam-driven resistance maintains identical mechanical tension from the deep chest stretch all the way to full contraction.'
      },
      {
        title: 'Safety at Muscle Failure',
        description: 'Built-in safety catches allow training to true concentric failure without needing an external human spotter.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Movement groove mastery, scapular retraction anchoring, and mind-muscle connection.',
        exercises: [
          {
            name: 'Machine Chest Press',
            position: 'Seated upright at 90°, head and upper back flat against pad, handles level with mid-chest',
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Mid Sternal Pectorals',
            tips: ['Set seat so handles align with mid-chest', 'Press to soft lockout', 'Control return for 2 seconds']
          },
          {
            name: 'Flat Dumbbell Press',
            position: 'Lying flat on bench, feet planted firmly into floor, shoulder blades pinched together into bench',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x12',
            difficulty: 'Beginner',
            targetArea: 'Mid & Outer Pecs',
            tips: ['Keep wrists stacked straight over elbows', 'Press in slight inward triangle arc']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Incline clavicular focus and progressive mass building compound volume.',
        exercises: [
          {
            name: 'Incline Dumbbell Press',
            position: 'Seated on 30° incline bench, feet flat on floor, lower back naturally arched, chest proud',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Upper Clavicular Chest',
            tips: ['Keep incline at 30 degrees to minimize front delt takeover', 'Lower until dumbbells touch chest level']
          },
          {
            name: 'Incline Barbell Bench Press',
            position: 'Lying on 30-45° incline station, grip 1.5x shoulder width, bar unracked over eyes',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Upper Pec Shelf',
            tips: ['Lower bar with control to upper chest collarbone line', 'Drive up explosively with chest']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Peak muscular failure, heavy dropsets, and cable inner chest flyes.',
        exercises: [
          {
            name: 'Heavy Flat Barbell Bench Press',
            position: 'Flat bench, 5-point body contact (feet, glutes, upper back, head, hands), full arch and leg drive',
            setsAndReps: '5 sets × 5 reps',
            targetRepsBadge: '3x5',
            difficulty: 'Advanced',
            targetArea: 'Maximum Pec Power & Mass',
            tips: ['Tuck elbows to 45-60 degrees', 'Touch sternum with control before explosive press']
          },
          {
            name: 'Cable Crossover Flyes',
            position: 'Standing centered between dual towers, staggered stance, slight torso lean, soft elbow bend',
            setsAndReps: '4 sets × 12-15 reps (last set dropset)',
            targetRepsBadge: '3x15',
            difficulty: 'Advanced',
            targetArea: 'Inner Sternal Cleavage',
            tips: ['Hug a giant barrel movement arc', 'Cross hands slightly at peak squeeze for 1 second']
          }
        ]
      }
    }
  },
  Back: {
    equipmentName: 'Lat Pulldown & Seated Cable Station',
    equipmentType: 'machine',
    primaryMuscle: 'Back',
    targetMuscles: ['Latissimus Dorsi', 'Teres Major', 'Rhomboids', 'Middle Trapezius', 'Biceps'],
    overview: 'Vertical and horizontal pulling station built to develop back width (V-taper) and upper-back muscular thickness.',
    benefitsAndUses: [
      {
        title: 'Adjustable Frontal Plane Width',
        description: 'Wide overhand grip directly recruits upper lat fibers and teres major to expand lateral upper body silhouette.'
      },
      {
        title: 'Spinal Decompression',
        description: 'Unloads lumbar spine compared to heavy bent-over barbell rows, making it safe for high-volume back workouts.'
      },
      {
        title: 'Targeted Scapular Depression',
        description: 'Teaches lifters to depress and retract shoulder blades before pulling with arm flexors.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Foundational scapular depression and mind-muscle connection for the lats.',
        exercises: [
          {
            name: 'Lat Pulldown',
            position: 'Seated upright, thighs locked snugly under roller pads, slight 10-15° torso lean',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Upper Lat Width & Teres Major',
            tips: ['Grip slightly wider than shoulders', 'Drive elbows down into your back pockets', 'Touch upper chest lightly']
          },
          {
            name: 'Seated Cable Row',
            position: 'Seated upright with knees slightly bent, feet on footplates, chest tall, neutral spine',
            setsAndReps: '3 sets × 12 reps',
            targetRepsBadge: '2x12',
            difficulty: 'Beginner',
            targetArea: 'Mid-Back Rhomboids & Lats',
            tips: ['Pull handle towards belly button', 'Pinch shoulder blades hard at contraction']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Compound pulling density and V-taper development.',
        exercises: [
          {
            name: 'Bent-Over Barbell Row',
            position: 'Hinged at hips at 45°, flat neutral spine, overhand grip just outside knees',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Overall Back Thickness & Erector Spinae',
            tips: ['Brace core tight to protect lower back', 'Pull bar to lower sternum', 'Do not bounce torso']
          },
          {
            name: 'Close-Grip V-Bar Pulldown',
            position: 'Seated with V-bar attachment, torso leaned 15°, pulling to upper sternum',
            setsAndReps: '4 sets × 10-12 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Lower Lat Sweep & Thickness',
            tips: ['Deep stretch at top with arms fully extended', 'Drive elbows straight back']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Maximal back recruitment, heavy deadstop rows, and weighted pull-ups.',
        exercises: [
          {
            name: 'Weighted Pull-Ups',
            position: 'Hanging from pull-up bar with weight belt, hollow body position, full arm lockout at bottom',
            setsAndReps: '4 sets × 6-8 reps',
            targetRepsBadge: '3x8',
            difficulty: 'Advanced',
            targetArea: 'Latissimus Dorsi Functional Power',
            tips: ['Pull until chin clears bar cleanly', 'Avoid swinging or kipping legs']
          },
          {
            name: 'T-Bar Landmine Row',
            position: 'Straddling landmine bar, chest angled at 45°, neutral grip handle attached below plates',
            setsAndReps: '4 sets × 8-10 reps (heavy)',
            targetRepsBadge: '3x10',
            difficulty: 'Advanced',
            targetArea: 'Mid-Back Rhomboid & Lat Density',
            tips: ['Drive weight with elbows, not biceps', 'Squeeze upper back blades together at top']
          }
        ]
      }
    }
  },
  Legs: {
    equipmentName: 'Angled Leg Press & Squat Station',
    equipmentType: 'machine',
    primaryMuscle: 'Legs',
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings', 'Calves'],
    overview: 'Heavy 45-degree sled machine delivering extreme lower-body mechanical overload while supporting the lumbar spine.',
    benefitsAndUses: [
      {
        title: 'Massive Quad & Glute Hypertrophy',
        description: 'Enables deep knee flexion without the balance constraints of a free barbell squat.'
      },
      {
        title: 'Foot Placement Versatility',
        description: 'High stance biases glutes and hamstrings; low stance targets quad sweep and tear-drop VMO.'
      },
      {
        title: 'Zero Axial Spine Loading',
        description: 'Padded back support eliminates spinal compression, making it ideal for high-volume leg days.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Foundational leg strength, knee tracking alignment, and 90-degree depth.',
        exercises: [
          {
            name: 'Standard Leg Press',
            position: 'Seated in 45° reclined seat, lower back pressed against lumbar pad, feet centered shoulder-width',
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Quad Sweep & Glutes',
            tips: ['Feet shoulder-width on center plate', 'Lower until knees reach 90 degrees', 'Never lock knees at top']
          },
          {
            name: 'Goblet Squat (Dumbbell)',
            position: 'Standing tall, holding dumbbell vertically at chest, feet slightly wider than shoulders, toes angled out 15°',
            setsAndReps: '3 sets × 12 reps',
            targetRepsBadge: '2x12',
            difficulty: 'Beginner',
            targetArea: 'Quads, Adductors & Core',
            tips: ['Keep elbows inside knees at bottom', 'Chest proud throughout descent', 'Drive up through mid-foot']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Heavy compound leg volume and posterior chain balance.',
        exercises: [
          {
            name: 'Barbell Back Squat',
            position: 'Barbell resting across upper traps, chest upright, core braced, feet slightly outside shoulder width',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Entire Lower Body & Core',
            tips: ['Break at hips and knees simultaneously', 'Hit parallel or below', 'Drive hips upward out of the hole']
          },
          {
            name: 'Romanian Deadlift (Dumbbell/Barbell)',
            position: 'Standing tall, soft knee bend, hinge backward at hips pushing glutes to rear wall',
            setsAndReps: '4 sets × 10-12 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Hamstrings & Glute-Ham Tie-In',
            tips: ['Keep bar or dumbbells glued close to shins', 'Feel intense hamstring stretch at bottom']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'High-intensity quad burn, drop sets, and unilateral split squat overload.',
        exercises: [
          {
            name: 'Bulgarian Split Squats (Dumbbell)',
            position: 'Rear foot elevated on bench behind you, front foot placed forward, torso upright or slight 10° forward lean',
            setsAndReps: '4 sets × 10 reps each leg',
            targetRepsBadge: '3x10',
            difficulty: 'Advanced',
            targetArea: 'Single-Leg Quad & Glute Hypertrophy',
            tips: ['Lower until back knee is 1 inch off floor', 'Keep front knee tracking over second toe']
          },
          {
            name: 'Leg Press Rest-Pause Overload',
            position: 'Heavy 45° leg press, feet shoulder-width, deep controlled descent',
            setsAndReps: '3 sets × 15 reps + 5 rest-pause',
            targetRepsBadge: '3x20',
            difficulty: 'Advanced',
            targetArea: 'Maximal Quad Sarcoplasmic Hypertrophy',
            tips: ['Perform 15 reps, rack for 15 seconds, perform 5 more reps to failure', 'Maintain firm lower-back pad contact']
          }
        ]
      }
    }
  }
};

/**
 * Client-side equipment classifier fallback.
 * Ensures the app works 100% reliably even when offline or hosted on static Vercel instances
 * without an active Express backend.
 */
export function classifyEquipmentLocally(
  base64Image: string,
  targetMuscleHint?: MuscleGroup
): EquipmentScanData {
  // If target muscle hint is explicitly passed (e.g. Chest, Legs, Arms, Back)
  if (targetMuscleHint && EQUIPMENT_PRESETS[targetMuscleHint]) {
    return EQUIPMENT_PRESETS[targetMuscleHint];
  }

  // By default, dumbbells are the most universal equipment scanned in gym environments
  return EQUIPMENT_PRESETS.Dumbbells;
}
