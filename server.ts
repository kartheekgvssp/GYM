import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Fallback high-fidelity presets mapped directly to the muscle groups and progression stages from the user's reference video
const PRESET_STAGE_EQUIPMENT_DATA: Record<string, any> = {
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
            targetArea: 'Peak Vascular Pump',
            tips: ['7 bottom-half reps, 7 top-half reps, 7 full-range reps without resting', 'Continuous burning contraction']
          }
        ]
      }
    },
    exercises: [
      {
        name: 'Dumbbell Preacher Curl',
        difficulty: 'Beginner',
        targetArea: 'Biceps Brachii',
        howToPerform: [
          'Position chest and armpits firmly against the angled preacher pad.',
          'Hold dumbbell with supinated (palms up) grip.',
          'Curl weight upward toward chin while keeping elbows pinned.',
          'Lower under strict control for 2 seconds to full extension.'
        ],
        recommendedReps: { hypertrophy: '10-12 reps', strength: '8 reps', endurance: '15 reps' },
        recommendedSets: '3 sets',
        restPeriod: '60s',
        formTips: ['Keep wrist straight to protect tendons', 'Stop just shy of full joint lockout']
      }
    ]
  },
  Back: {
    equipmentName: 'Lat Pulldown & Seated Cable Station',
    equipmentType: 'machine',
    primaryMuscle: 'Back',
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Trapezius', 'Teres Major', 'Biceps'],
    overview: 'Heavy vertical & horizontal cable traction apparatus engineered to forge V-taper lat width, lower trap density, and posture stability.',
    benefitsAndUses: [
      {
        title: 'V-Taper Width Development',
        description: 'Pulls vertically down into the coronal plane, directly building lat flare and upper back width.'
      },
      {
        title: 'Scapular Depression & Retraction',
        description: 'Counters rounded shoulders and poor sitting posture by strengthening thoracic posterior chain.'
      },
      {
        title: 'Calibrated Progression for Pull-Ups',
        description: 'Allows exact weight stack pin adjustments to bridge the gap to unassisted and weighted pull-ups.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Machine-guided vertical and horizontal pulls to establish scapular control.',
        exercises: [
          {
            name: 'Lat Pulldown',
            position: 'Seated upright, thighs locked snugly under roller pads, slight 10-15° torso lean',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Upper Lat Width & Teres Major',
            tips: ['Grip slightly wider than shoulders', 'Drive elbows into back pockets', 'Touch collarbone lightly']
          },
          {
            name: 'Seated Cable Row',
            position: 'Seated on bench, knees slightly bent, feet braced on footrests, neutral upright spine',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x10',
            difficulty: 'Beginner',
            targetArea: 'Mid Back & Rhomboids',
            tips: ['Keep spine tall with slight chest lift', 'Squeeze shoulder blades together behind you']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Bodyweight traction and heavy bent-over barbell pulls for back density.',
        exercises: [
          {
            name: 'Bodyweight Pull-Ups',
            position: 'Hanging from overhead bar with wide overhand grip, hollow-body abdominal engagement',
            setsAndReps: '3 sets to failure',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Full Posterior Lat Spread',
            tips: ['Full dead hang stretch at bottom', 'Pull chin clearly over bar', 'Avoid swinging legs']
          },
          {
            name: 'Overhand Barbell Row',
            position: 'Hinged at hips at 45° angle, knees soft, spine straight, bar hanging directly below shoulders',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Intermediate',
            targetArea: 'Lower Traps & Lat Thickness',
            tips: ['Hinge at hips to 45 degrees', 'Pull bar to navel', 'Keep core braced']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Maximum threshold weighted pulls for elite back strength and thickness.',
        exercises: [
          {
            name: 'Weighted Pull-Ups',
            position: 'Suspended from pull-up bar with weight belt attached between thighs, full dead hang stretch',
            setsAndReps: '4 sets × 5-6 reps',
            targetRepsBadge: '3x20',
            difficulty: 'Advanced',
            targetArea: 'Max Strength Lat Hypertrophy',
            tips: ['Strap weight belt firmly', 'Explosive drive up, 3s descent', 'Focus on lat contraction']
          }
        ]
      }
    },
    exercises: [
      {
        name: 'Lat Pulldown',
        difficulty: 'Beginner',
        targetArea: 'Latissimus Dorsi',
        howToPerform: [
          'Lock thighs snugly under pads.',
          'Grip wide bar with overhand grip.',
          'Pull elbows straight down to your sides until bar touches upper chest.',
          'Control the upward stretch smoothly.'
        ],
        recommendedReps: { hypertrophy: '10-12 reps', strength: '6-8 reps', endurance: '15 reps' },
        recommendedSets: '3-4 sets',
        restPeriod: '60-90s',
        formTips: ['Do not swing backwards more than 10 degrees', 'Lead with elbows, not wrists']
      }
    ]
  },
  Chest: {
    equipmentName: 'Chest Press Machine & Incline Bench',
    equipmentType: 'machine',
    primaryMuscle: 'Chest',
    targetMuscles: ['Pectoralis Major (Sternal & Clavicular)', 'Anterior Deltoids', 'Triceps'],
    overview: 'Guided dual-lever pressing machine offering fixed biomechanical plane of motion for maximum chest stretch without barbell drop risk.',
    benefitsAndUses: [
      {
        title: 'Zero Spotter Safety',
        description: 'Allows training to true mechanical muscle failure without risk of being pinned under a heavy bar.'
      },
      {
        title: 'Upper Clavicular Fiber Stimulation',
        description: 'Incline pressing vectors specifically target upper pecs to create a full, square chest shelf.'
      },
      {
        title: 'Reduced Rotator Cuff Strain',
        description: 'Converging handle motion matches natural pec contraction arc, reducing shoulder capsule impingement.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Machine pressing and incline dumbbell stabilizers to build baseline pressing strength.',
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
            name: 'Incline Dumbbell Press',
            position: 'Seated on 30-45° inclined bench, dumbbells over upper chest, shoulder blades retracted',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x10',
            difficulty: 'Beginner',
            targetArea: 'Upper Pec Shelf',
            tips: ['Set bench at 30 degrees', 'Flare elbows 45 degrees, not 90', 'Drive dumbbells together at top']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Free-weight barbell compound lifts to build raw pectoral mass and power.',
        exercises: [
          {
            name: 'Flat Barbell Bench Press',
            position: 'Lying flat on bench, 5-point contact, shoulder blades pinched, hands just wider than shoulders',
            setsAndReps: '4 sets × 6-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Overall Pectoral Mass',
            tips: ['Retract scapulae and plant feet firmly', 'Touch lower sternum smoothly', 'Drive straight up']
          },
          {
            name: 'Incline Barbell Bench Press',
            position: 'Lying on 30° incline bench, eyes under racked bar, elbows tucked 45° to torso',
            setsAndReps: '3 sets × 8-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Intermediate',
            targetArea: 'Upper Pec & Front Delts',
            tips: ['Grip slightly outside shoulders', 'Lower bar to upper collarbone', 'Breathe out on drive']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Paused bottom-range overload to eliminate bounce reflex and build unstoppable chest strength.',
        exercises: [
          {
            name: 'Paused Flat Bench Press',
            position: 'Lying flat on bench, tight arch with feet driving floor, bar paused on lower chest',
            setsAndReps: '4 sets × 3-5 reps',
            targetRepsBadge: '3x20',
            difficulty: 'Advanced',
            targetArea: 'Max Force Pectoral Drive',
            tips: ['Pause motionless for 1.5 seconds at chest', 'Explode upward without bouncing', 'Maintain upper back tension']
          }
        ]
      }
    },
    exercises: [
      {
        name: 'Machine Chest Press',
        difficulty: 'Beginner',
        targetArea: 'Pectoralis Major',
        howToPerform: [
          'Adjust seat height so handles are level with mid-chest.',
          'Grip handles firmly and plant feet flat on floor.',
          'Press forward until arms are almost extended.',
          'Return slowly until you feel a deep pectoral stretch.'
        ],
        recommendedReps: { hypertrophy: '12-15 reps', strength: '8-10 reps', endurance: '20 reps' },
        recommendedSets: '3 sets',
        restPeriod: '60s',
        formTips: ['Keep shoulder blades pinned to backrest', 'Do not hunch shoulders forward']
      }
    ]
  },
  Legs: {
    equipmentName: 'Angled Leg Press & Squat Station',
    equipmentType: 'machine',
    primaryMuscle: 'Legs',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
    overview: 'Heavy 45-degree sled machine designed for high-load leg hypertrophy with zero spinal axial compression.',
    benefitsAndUses: [
      {
        title: 'Zero Spinal Axial Loading',
        description: 'Takes vertical compressive load off lumbar vertebrae and intervertebral discs compared to barbell squats.'
      },
      {
        title: 'Targeted Quad Tear',
        description: 'Foot placement variations allow deep quad isolation without balance limitations.'
      },
      {
        title: 'Progressive Overload Machine',
        description: 'Safely handle 2x-3x bodyweight loads with built-in safety lock pins.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Machine sled pressing and leg curls to build foundation quad and hamstring resilience.',
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
            name: 'Lying Leg Curl',
            position: 'Lying prone on bench, kneecaps just off edge of pad, lever roller secured against lower Achilles',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x10',
            difficulty: 'Beginner',
            targetArea: 'Hamstring Peak',
            tips: ['Keep hips pressed into pad', 'Curl heels to glutes', 'Control the 2s eccentric descent']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Barbell squats and Romanian deadlifts for complete posterior and anterior chain mass.',
        exercises: [
          {
            name: 'Barbell Back Squat',
            position: 'Standing tall with bar across upper trapezius, chest upright, feet shoulder-width flared 15°',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Total Quad & Core Compound',
            tips: ['Break at hips and knees together', 'Squat to parallel depth', 'Drive through mid-foot']
          },
          {
            name: 'Dumbbell Romanian Deadlift',
            position: 'Standing tall holding dumbbells at thighs, knees soft, hips pushing straight backward',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Intermediate',
            targetArea: 'Hamstrings & Glute Fold',
            tips: ['Hinge hips backward with soft knee bend', 'Feel deep hamstring stretch', 'Squeeze glutes to stand']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Paused deep squats and high-rep walking lunges for athletic quad endurance.',
        exercises: [
          {
            name: 'Paused Barbell Squats',
            position: 'Standing in deep parallel squat hole, motionless 2s pause with chest upright before driving up',
            setsAndReps: '4 sets × 4-6 reps',
            targetRepsBadge: '3x20',
            difficulty: 'Advanced',
            targetArea: 'Explosive Quad & Glute Power',
            tips: ['2-second motionless pause in hole', 'Drive up explosively without knee cave']
          }
        ]
      }
    },
    exercises: [
      {
        name: 'Standard Leg Press',
        difficulty: 'Beginner',
        targetArea: 'Quadriceps',
        howToPerform: [
          'Sit firmly with lower back against backrest.',
          'Place feet shoulder-width apart in middle of platform.',
          'Release safety handles and lower sled until knees reach 90° angle.',
          'Press back up through heels without locking knees.'
        ],
        recommendedReps: { hypertrophy: '12-15 reps', strength: '8-10 reps', endurance: '20 reps' },
        recommendedSets: '4 sets',
        restPeriod: '90s',
        formTips: ['Never let hips lift off the seat pad', 'Keep knees tracking directly over toes']
      }
    ]
  },
  Shoulders: {
    equipmentName: 'Overhead Shoulder Press & Cable Lateral Station',
    equipmentType: 'machine',
    primaryMuscle: 'Shoulders',
    targetMuscles: ['Anterior Deltoids', 'Lateral Deltoids', 'Posterior Deltoids', 'Upper Traps'],
    overview: 'Specialized overhead vertical pressing station combined with cable pulleys to build 3D rounded boulder shoulders.',
    benefitsAndUses: [
      {
        title: '3D Lateral Deltoid Width',
        description: 'Side cable sweeps isolate the lateral head, creating wider upper-body proportions.'
      },
      {
        title: 'Stabilized Overhead Pressing',
        description: 'Guided track removes balance instability, allowing maximum delt overload without swaying.'
      },
      {
        title: 'Rotator Cuff Health',
        description: 'Face pulls and reverse flyes balance anterior posture from excessive bench pressing.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Machine overhead press and dumbbell lateral raises for baseline deltoid silhouette.',
        exercises: [
          {
            name: 'Machine Overhead Press',
            position: 'Seated upright at 90°, back against support cushion, handles level with ears',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Anterior & Lateral Delts',
            tips: ['Keep elbows slightly forward of body', 'Press overhead to full extension', 'Lower slowly to ear level']
          },
          {
            name: 'Dumbbell Lateral Raise',
            position: 'Standing with slight 15° forward torso lean, dumbbells at sides with soft elbows',
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x10',
            difficulty: 'Beginner',
            targetArea: 'Side Lateral Delts',
            tips: ['Slight forward torso lean', 'Lead with elbows like pouring water', 'Pause for half a second at top']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Standing overhead barbell press and face pulls for raw strength and shoulder stability.',
        exercises: [
          {
            name: 'Standing Military Barbell Press',
            position: 'Standing tall with barbell racked on front collarbone, glutes squeezed, abs tight',
            setsAndReps: '4 sets × 6-8 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Full Shoulder Girdle & Core',
            tips: ['Squeeze glutes and brace core', 'Press in straight vertical bar path', 'Lock out with head through window']
          },
          {
            name: 'Cable Face Pulls',
            position: 'Standing with staggered stance facing high cable pulley with dual-rope attachment',
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Intermediate',
            targetArea: 'Rear Delts & Rotator Cuff',
            tips: ['Rope set to eye level', 'Pull toward ears and rotate knuckles back', 'Hold contraction for 1 second']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Continuous tension cable lateral drop sets for extreme capped delt roundness.',
        exercises: [
          {
            name: 'Behind-the-Back Cable Lateral Raise',
            position: 'Standing beside low cable pulley, cable running behind lower back, gripping single handle',
            setsAndReps: '4 sets × 12-15 reps',
            targetRepsBadge: '3x20',
            difficulty: 'Advanced',
            targetArea: 'Lateral Deltoid Peak Isolation',
            tips: ['Cable behind back provides stretch tension at bottom', 'Continuous tempo without rest at bottom']
          }
        ]
      }
    },
    exercises: [
      {
        name: 'Machine Overhead Press',
        difficulty: 'Beginner',
        targetArea: 'Shoulders',
        howToPerform: [
          'Adjust seat so handles start at shoulder level.',
          'Sit upright with spine supported against back pad.',
          'Press handles straight up overhead without arching back.',
          'Lower smoothly to ear level.'
        ],
        recommendedReps: { hypertrophy: '10-12 reps', strength: '6-8 reps', endurance: '15 reps' },
        recommendedSets: '3 sets',
        restPeriod: '60s',
        formTips: ['Keep wrists aligned with forearms', 'Do not flare elbows excessively wide']
      }
    ]
  },
  Core: {
    equipmentName: 'Captain\'s Chair & Abdominal Crunch Station',
    equipmentType: 'machine',
    primaryMuscle: 'Core',
    targetMuscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Internal Obliques', 'External Obliques'],
    overview: 'Specialized bodyweight and mechanical core station engineered to lock the spine into safe flexion and posterior pelvic tilt.',
    benefitsAndUses: [
      {
        title: 'Spinal Decompression & Core Bracing',
        description: 'Suspended forearm support removes lower back shearing stress while isolating deep abdominal stabilizers.'
      },
      {
        title: 'Deep Transverse Abdominal Activation',
        description: 'Enables strict pelvic tucking to strengthen the inner girdle and enhance abdominal core density.'
      },
      {
        title: 'Progression to L-Sits & Hanging Leg Raises',
        description: 'Builds foundational hip flexor and lower abdominal control for advanced calisthenics movements.'
      }
    ],
    stages: {
      beginner: {
        stageName: 'Beginner Stage',
        description: 'Supported knee raises and controlled machine crunches focusing on pelvic tuck.',
        exercises: [
          {
            name: 'Captain\'s Chair Bent-Knee Raise',
            position: 'Forearms rested on parallel padded supports, shoulders depressed, back flat against backrest',
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Lower Rectus Abdominis',
            tips: ['Support forearms on pads and lock shoulders down', 'Curl pelvis upward toward chest', 'Lower slowly without swinging']
          },
          {
            name: 'Cable Rope Ab Crunch',
            position: 'Kneeling on mat facing high cable station, rope held firmly behind neck at ears',
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x10',
            difficulty: 'Beginner',
            targetArea: 'Upper Rectus Abdominis',
            tips: ['Kneel with rope behind head', 'Contract abs to curl spine downward', 'Keep hips stationary']
          }
        ]
      },
      intermediate: {
        stageName: 'Intermediate Stage',
        description: 'Straight-leg raises and Russian twists for complete core rotational and anti-extension stability.',
        exercises: [
          {
            name: 'Hanging Straight Leg Raise',
            position: 'Hanging from overhead bar with active shoulder engagement, legs straight or soft knees',
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Full Anterior Core',
            tips: ['Hang from bar with overhand grip', 'Raise legs to parallel or higher', 'Control negative without swinging']
          },
          {
            name: 'Decline Bench Weighted Russian Twist',
            position: 'Seated on decline bench, shins locked under rollers, torso reclined back at 45° angle',
            setsAndReps: '3 sets × 16 total reps',
            targetRepsBadge: '2x15',
            difficulty: 'Intermediate',
            targetArea: 'Internal & External Obliques',
            tips: ['Lock feet under rollers', 'Lean back at 45-degree angle', 'Rotate torso under control with weight plate']
          }
        ]
      },
      advanced: {
        stageName: 'Advanced Stage',
        description: 'Toes-to-bar and isometric dragon flags for peak core tension and strength endurance.',
        exercises: [
          {
            name: 'Hanging Toes to Bar',
            position: 'Hanging from pull-up bar, lats engaged, driving feet in smooth arc until toes touch bar',
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x20',
            difficulty: 'Advanced',
            targetArea: 'Maximum Abdominal Contraction',
            tips: ['Strict pull without kip', 'Touch toes cleanly to bar', '3-second controlled eccentric lowering']
          }
        ]
      }
    },
    exercises: [
      {
        name: 'Captain\'s Chair Knee Raise',
        difficulty: 'Beginner',
        targetArea: 'Core',
        howToPerform: [
          'Step onto foot rests and position forearms securely on padded arm rests.',
          'Firmly grip handles and press down to keep shoulders depressed away from ears.',
          'Brace core and curl knees smoothly up toward chest, rounding lower back slightly at top.',
          'Lower legs back down slowly under tension without swinging or hyperextending.'
        ],
        recommendedReps: { hypertrophy: '12-15 reps', strength: '10-12 reps', endurance: '20 reps' },
        recommendedSets: '3-4 sets',
        restPeriod: '60s',
        formTips: ['Initiate movement from abs, not hip flexors', 'Breathe out forcefully as knees reach top']
      }
    ]
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Equipment Scanner with Gemini Vision
  app.post('/api/scan-equipment', async (req, res) => {
    try {
      const { image, targetMuscleHint, isSamplePreset } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Missing image payload' });
      }

      // If user clicked one of the sample test presets (Arms, Back, Chest, Legs)
      if (isSamplePreset && targetMuscleHint && PRESET_STAGE_EQUIPMENT_DATA[targetMuscleHint]) {
        return res.json({
          success: true,
          isGymEquipment: true,
          source: 'sample-preset',
          data: PRESET_STAGE_EQUIPMENT_DATA[targetMuscleHint],
        });
      }

      const client = getAIClient();

      if (client) {
        try {
          let mimeType = 'image/jpeg';
          let base64Data = image;

          if (image.startsWith('data:')) {
            const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches) {
              mimeType = matches[1];
              base64Data = matches[2];
            } else {
              base64Data = image.split(',')[1] || image;
            }
          }

          const prompt = `You are an elite sports biomechanist and gym equipment identification AI.
Analyze this photo carefully.

STEP 1: ACCURATELY VALIDATE IF THIS IS GENUINE GYM EQUIPMENT
Determine whether the primary subject is genuine gym or workout equipment (e.g. dumbbells, barbells, weight plates, cable machines, weight benches, squat racks, pull-up stations, lat pulldowns, leg press, chest press, smith machine, treadmills, kettlebells, rowing machine, etc.).

IF IT IS NOT GYM EQUIPMENT (for example: laptop, computer screen, sunglasses, eyeglasses, smartphone, clothing, desk, office chair, food, beverage, pets, landscape, automobile, random household item, or non-fitness objects):
You MUST reject it with "isGymEquipment": false.
Strict JSON schema for non-gym items:
{
  "isGymEquipment": false,
  "detectedItem": "string (Specific name of the non-gym object detected, e.g. 'Laptop', 'Sunglasses', 'Coffee Mug', 'Office Chair', 'Smartphone')",
  "rejectionReason": "string (A clear and polite message mentioning: This doesn't look like gym equipment. Detected item: <detectedItem>. Please rescan or take a photo of gym equipment like dumbbells, barbells, or machines.)"
}

IF IT IS GENUINE GYM EQUIPMENT:
You MUST set "isGymEquipment": true and provide the full biomechanical breakdown:
{
  "isGymEquipment": true,
  "equipmentName": "string (Specific equipment name, e.g. 'Olympic Barbell & Flat Bench' or 'Cable Crossover Station')",
  "equipmentType": "machine" | "cable" | "barbell" | "dumbbell" | "bodyweight" | "other",
  "primaryMuscle": "Chest" | "Back" | "Arms" | "Legs" | "Shoulders" | "Core",
  "targetMuscles": ["string", "string", "string"],
  "overview": "string (1-2 sentence overview of what this equipment does and its biomechanical function)",
  "benefitsAndUses": [
    { "title": "string (Specific use/benefit, e.g. 'Continuous Resistance Arc')", "description": "string" },
    { "title": "string (Specific use/benefit, e.g. 'Joint-Friendly Plane of Motion')", "description": "string" },
    { "title": "string (Specific use/benefit, e.g. 'Scapular & Core Bracing')", "description": "string" }
  ],
  "stages": {
    "beginner": {
      "stageName": "Beginner Stage",
      "description": "string (Purpose of beginner stage on this equipment)",
      "exercises": [
        {
          "name": "string (Exercise name)",
          "position": "string (Exact starting and exercise body position, e.g. 'Seated upright at 90° with chest flushed against chest pad, feet flat on floor')",
          "setsAndReps": "string (e.g. '3 sets × 10-12 reps')",
          "targetRepsBadge": "string (e.g. '2x15' or '2x10')",
          "difficulty": "Beginner",
          "targetArea": "string",
          "tips": ["string (Execution tip 1)", "string (Execution tip 2)"]
        }
      ]
    },
    "intermediate": {
      "stageName": "Intermediate Stage",
      "description": "string (Hypertrophy overload purpose)",
      "exercises": [
        {
          "name": "string (Exercise name)",
          "position": "string (Exact setup and body position, e.g. 'Seated on 30-45° inclined bench with shoulder blades pinched back')",
          "setsAndReps": "string (e.g. '4 sets × 8-10 reps')",
          "targetRepsBadge": "string (e.g. '3x10')",
          "difficulty": "Intermediate",
          "targetArea": "string",
          "tips": ["string (Execution tip 1)", "string (Execution tip 2)"]
        }
      ]
    },
    "advanced": {
      "stageName": "Advanced Stage",
      "description": "string (Peak tension and failure overload purpose)",
      "exercises": [
        {
          "name": "string (Exercise name)",
          "position": "string (Exact setup and body position)",
          "setsAndReps": "string (e.g. '4 sets × 4-6 reps' or '21s')",
          "targetRepsBadge": "string (e.g. '3x20')",
          "difficulty": "Advanced",
          "targetArea": "string",
          "tips": ["string (Execution tip 1)", "string (Execution tip 2)"]
        }
      ]
    }
  },
  "exercises": [
    {
      "name": "string",
      "difficulty": "Beginner",
      "targetArea": "string",
      "position": "string (Body position)",
      "howToPerform": ["step 1", "step 2", "step 3"],
      "recommendedReps": { "hypertrophy": "10-12 reps", "strength": "6-8 reps", "endurance": "15 reps" },
      "recommendedSets": "3 sets",
      "restPeriod": "60s",
      "formTips": ["tip 1", "tip 2"]
    }
  ]
}

Only return valid JSON. Do not wrap in markdown or backticks.`;

          const visionModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
          let parsedResult: any = null;
          let nonGymRejection: { detectedItem: string; rejectionReason: string } | null = null;

          for (const modelName of visionModels) {
            try {
              const response = await client.models.generateContent({
                model: modelName,
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        inlineData: {
                          mimeType,
                          data: base64Data,
                        },
                      },
                      {
                        text: prompt,
                      },
                    ],
                  },
                ],
                config: {
                  responseMimeType: 'application/json',
                },
              });

              const text = response.text || '';
              const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const parsed = JSON.parse(cleanedText);

              const dataObj = Array.isArray(parsed) ? parsed[0] : parsed;

              // Check if model identified a non-gym item
              if (dataObj && (dataObj.isGymEquipment === false || dataObj.isGymEquipment === 'false')) {
                nonGymRejection = {
                  detectedItem: dataObj.detectedItem || 'Non-gym item',
                  rejectionReason: dataObj.rejectionReason || `This doesn't look like gym equipment (detected: ${dataObj.detectedItem || 'non-gym object'}). Please retry or resnap an image of gym equipment.`,
                };
                console.log(`Model ${modelName} rejected non-gym image:`, nonGymRejection.detectedItem);
                break;
              }

              // Check if valid gym equipment data returned
              if (dataObj && (dataObj.equipmentName || dataObj.isGymEquipment === true) && (dataObj.stages?.beginner || dataObj.exercises?.length)) {
                parsedResult = dataObj;
                console.log(`Successfully identified equipment using ${modelName}:`, dataObj.equipmentName, '-', dataObj.primaryMuscle);
                break;
              }
            } catch (modelErr: any) {
              console.warn(`Vision model ${modelName} failed, trying next:`, modelErr?.message || modelErr);
            }
          }

          // If the AI determined this is NOT gym equipment (e.g. sunglasses, laptop, phone):
          if (nonGymRejection) {
            return res.json({
              success: false,
              isGymEquipment: false,
              detectedItem: nonGymRejection.detectedItem,
              message: nonGymRejection.rejectionReason,
            });
          }

          if (parsedResult) {
            // Ensure stages structure is complete if simplified
            const primaryMuscle = parsedResult.primaryMuscle || 'Back';
            if (!parsedResult.stages?.beginner || !parsedResult.stages?.intermediate || !parsedResult.stages?.advanced) {
              const fallbackTemplate = PRESET_STAGE_EQUIPMENT_DATA[primaryMuscle] || PRESET_STAGE_EQUIPMENT_DATA.Back;
              parsedResult.stages = parsedResult.stages || fallbackTemplate.stages;
              parsedResult.benefitsAndUses = parsedResult.benefitsAndUses || fallbackTemplate.benefitsAndUses;
              parsedResult.targetMuscles = parsedResult.targetMuscles || fallbackTemplate.targetMuscles;
            }

            return res.json({
              success: true,
              isGymEquipment: true,
              source: 'gemini-vision',
              data: parsedResult,
            });
          }
        } catch (geminiError: any) {
          console.warn('Gemini vision API error:', geminiError?.message || geminiError);
        }
      }

      // If user specifically clicked one of the sample test buttons with a targetMuscleHint
      if (targetMuscleHint && PRESET_STAGE_EQUIPMENT_DATA[targetMuscleHint]) {
        return res.json({
          success: true,
          isGymEquipment: true,
          source: 'smart-analyzer',
          data: PRESET_STAGE_EQUIPMENT_DATA[targetMuscleHint],
        });
      }

      // If the image was analyzed and not recognized as gym equipment
      return res.json({
        success: false,
        isGymEquipment: false,
        detectedItem: 'Unrecognized item',
        message: "This doesn't look like gym equipment. Please rescan the photo or retake an image of gym equipment like dumbbells, barbells, or machines.",
      });
    } catch (err: any) {
      console.error('Scan equipment endpoint error:', err);
      res.status(500).json({ error: 'Internal server error processing scan' });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
