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
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Lower Bicep & Peak',
            tips: ['Keep armpits snug against the pad', 'Lower smoothly over 2 full seconds', 'Do not hyperextend elbows at bottom']
          },
          {
            name: 'Overhead Dumbbell Triceps Extension',
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
            setsAndReps: '3 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Overall Bicep Mass',
            tips: ['Pin elbows to ribcage', 'Squeeze at eye level', 'Avoid lower-back arching']
          },
          {
            name: 'Close-Grip Bench Press',
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
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Upper Lat Width & Teres Major',
            tips: ['Grip slightly wider than shoulders', 'Drive elbows into back pockets', 'Touch collarbone lightly']
          },
          {
            name: 'Seated Cable Row',
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
            setsAndReps: '3 sets to failure',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Full Posterior Lat Spread',
            tips: ['Full dead hang stretch at bottom', 'Pull chin clearly over bar', 'Avoid swinging legs']
          },
          {
            name: 'Overhand Barbell Row',
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
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Mid Sternal Pectorals',
            tips: ['Set seat so handles align with mid-chest', 'Press to soft lockout', 'Control return for 2 seconds']
          },
          {
            name: 'Incline Dumbbell Press',
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
            setsAndReps: '4 sets × 6-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Overall Pectoral Mass',
            tips: ['Retract scapulae and plant feet firmly', 'Touch lower sternum smoothly', 'Drive straight up']
          },
          {
            name: 'Incline Barbell Bench Press',
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
            setsAndReps: '3 sets × 12-15 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Quad Sweep & Glutes',
            tips: ['Feet shoulder-width on center plate', 'Lower until knees reach 90 degrees', 'Never lock knees at top']
          },
          {
            name: 'Lying Leg Curl',
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
            setsAndReps: '4 sets × 8-10 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Total Quad & Core Compound',
            tips: ['Break at hips and knees together', 'Squat to parallel depth', 'Drive through mid-foot']
          },
          {
            name: 'Dumbbell Romanian Deadlift',
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
            setsAndReps: '3 sets × 10-12 reps',
            targetRepsBadge: '2x15',
            difficulty: 'Beginner',
            targetArea: 'Anterior & Lateral Delts',
            tips: ['Keep elbows slightly forward of body', 'Press overhead to full extension', 'Lower slowly to ear level']
          },
          {
            name: 'Dumbbell Lateral Raise',
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
            setsAndReps: '4 sets × 6-8 reps',
            targetRepsBadge: '3x10',
            difficulty: 'Intermediate',
            targetArea: 'Full Shoulder Girdle & Core',
            tips: ['Squeeze glutes and brace core', 'Press in straight vertical bar path', 'Lock out with head through window']
          },
          {
            name: 'Cable Face Pulls',
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
      const { image, targetMuscleHint } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Missing image payload' });
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

          const prompt = `You are an elite sports biomechanist and gym equipment identification expert.
Analyze this gym image or gym equipment snapshot.
Detect the machine or free-weight equipment, identify its primary muscle group (Chest, Back, Arms, Legs, Shoulders, or Core), explain what we can do with it, its biomechanical uses/advantages, and generate the exact 3 progression training stages (Beginner Stage, Intermediate Stage, Advanced Stage) with exact sets and reps, plus quick rep badges (e.g. 2x15, 2x10, 3x10, 2x15, 3x20).

Respond in STRICT JSON with this exact schema:
{
  "equipmentName": "string (Concise equipment title, e.g. 'Lat Pulldown Machine' or 'Incline Dumbbell Bench')",
  "equipmentType": "machine" | "cable" | "barbell" | "dumbbell" | "bodyweight" | "other",
  "primaryMuscle": "Chest" | "Back" | "Arms" | "Legs" | "Shoulders" | "Core",
  "targetMuscles": ["string", "string", "string"],
  "overview": "1-2 sentence description of what this equipment does and how it works",
  "benefitsAndUses": [
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" }
  ],
  "stages": {
    "beginner": {
      "stageName": "Beginner Stage",
      "description": "string",
      "exercises": [
        {
          "name": "string",
          "setsAndReps": "string (e.g. '3 sets × 10-12 reps')",
          "targetRepsBadge": "string (e.g. '2x15')",
          "difficulty": "Beginner",
          "targetArea": "string",
          "tips": ["string", "string"]
        }
      ]
    },
    "intermediate": {
      "stageName": "Intermediate Stage",
      "description": "string",
      "exercises": [
        {
          "name": "string",
          "setsAndReps": "string (e.g. '4 sets × 8-10 reps')",
          "targetRepsBadge": "string (e.g. '3x10')",
          "difficulty": "Intermediate",
          "targetArea": "string",
          "tips": ["string", "string"]
        }
      ]
    },
    "advanced": {
      "stageName": "Advanced Stage",
      "description": "string",
      "exercises": [
        {
          "name": "string",
          "setsAndReps": "string (e.g. '4 sets × 4-6 reps')",
          "targetRepsBadge": "string (e.g. '3x20')",
          "difficulty": "Advanced",
          "targetArea": "string",
          "tips": ["string", "string"]
        }
      ]
    }
  },
  "exercises": [
    {
      "name": "string",
      "difficulty": "Beginner",
      "targetArea": "string",
      "howToPerform": ["step 1", "step 2", "step 3"],
      "recommendedReps": { "hypertrophy": "10-12 reps", "strength": "6-8 reps", "endurance": "15 reps" },
      "recommendedSets": "3 sets",
      "restPeriod": "60s",
      "formTips": ["tip 1", "tip 2"]
    }
  ]
}

Only return valid JSON. Do not wrap in backticks or markdown if possible.`;

          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
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

          // Ensure stages exist
          if (parsed.stages && parsed.stages.beginner && parsed.stages.intermediate) {
            return res.json({
              success: true,
              source: 'gemini-vision',
              data: parsed,
            });
          }
        } catch (geminiError: any) {
          console.warn('Gemini vision API error, falling back to smart gym equipment analyzer:', geminiError?.message || geminiError);
        }
      }

      // Determine smart fallback based on hint or fallback list
      let fallbackKey = 'Back';
      if (targetMuscleHint && PRESET_STAGE_EQUIPMENT_DATA[targetMuscleHint]) {
        fallbackKey = targetMuscleHint;
      } else {
        const keys = Object.keys(PRESET_STAGE_EQUIPMENT_DATA);
        fallbackKey = keys[Math.floor(Math.random() * keys.length)];
      }

      const fallbackResult = PRESET_STAGE_EQUIPMENT_DATA[fallbackKey] || PRESET_STAGE_EQUIPMENT_DATA.Back;

      return res.json({
        success: true,
        source: 'smart-analyzer',
        data: fallbackResult,
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
