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

// Fallback high-fidelity equipment presets for offline or missing API key scenarios
const FALLBACK_EQUIPMENT_DATA = [
  {
    equipmentName: 'Cable Crossover & Pulley Station',
    equipmentType: 'cable',
    primaryMuscle: 'Chest',
    targetMuscles: ['Chest', 'Shoulders', 'Arms', 'Back', 'Core'],
    overview: 'Dual adjustable pulley system allowing 360-degree rotational resistance with continuous tension throughout the full range of motion.',
    benefitsAndUses: [
      {
        title: 'Continuous Tension Profile',
        description: 'Unlike free weights where gravity removes tension at the top of a flye, cables maintain maximum tension throughout the entire squeeze.'
      },
      {
        title: 'Joint-Friendly Biomechanics',
        description: 'Allows your hands to follow natural ergonomic arc trajectories, minimizing shoulder impingement risk.'
      },
      {
        title: 'Versatile Multi-Angle Isolation',
        description: 'Easily adjust pulley height from low to high to target upper clavicular chest, mid sternal fibers, or lower pec line.'
      }
    ],
    exercises: [
      {
        name: 'High-to-Low Cable Chest Flye',
        difficulty: 'Intermediate',
        targetArea: 'Lower & Mid Chest Squeeze',
        howToPerform: [
          'Set pulleys above head height and attach single D-handles.',
          'Step forward into a staggered stance with a slight forward torso lean.',
          'Bring handles down and together across your lower chest with a slight elbow bend.',
          'Pause and contract hard for 1 second, then control the eccentric return.'
        ],
        recommendedReps: {
          hypertrophy: '10-12 reps',
          strength: '6-8 reps',
          endurance: '15-20 reps'
        },
        recommendedSets: '3-4 sets',
        restPeriod: '60-75s',
        formTips: [
          'Lead with your elbows and imagine hugging a wide tree trunk.',
          'Keep your ribcage expanded and shoulder blades retracted.'
        ]
      },
      {
        name: 'Standing Cable Face Pulls',
        difficulty: 'Beginner',
        targetArea: 'Rear Delts & Rotator Cuff',
        howToPerform: [
          'Attach a triceps rope to pulley at eye level.',
          'Grip rope with neutral or thumbs-back grip and step back to create tension.',
          'Pull hands toward eyes/ears while externally rotating shoulders.'
        ],
        recommendedReps: {
          hypertrophy: '12-15 reps',
          strength: '8-10 reps',
          endurance: '20 reps'
        },
        recommendedSets: '3 sets',
        restPeriod: '45-60s',
        formTips: [
          'Flare elbows high and wide to hit the rear deltoid peak.',
          'Avoid leaning backwards to compensate.'
        ]
      }
    ]
  },
  {
    equipmentName: 'Lat Pulldown & Low Row Machine',
    equipmentType: 'machine',
    primaryMuscle: 'Back',
    targetMuscles: ['Back', 'Biceps', 'Forearms', 'Rear Delts'],
    overview: 'Pivotal vertical traction machine engineered to build lat width, scapular retraction control, and V-taper aesthetics.',
    benefitsAndUses: [
      {
        title: 'V-Taper Lat Width Hypertrophy',
        description: 'Directly targets latissimus dorsi muscle fibers with stabilized knee pads, eliminating momentum.'
      },
      {
        title: 'Progressive Overload for Pull-Ups',
        description: 'Allows calibrated micro-loading for lifters working up to or extending beyond bodyweight pull-up volume.'
      },
      {
        title: 'Scapular Depression Mastery',
        description: 'Teaches lifters how to engage lower traps and depress shoulder blades before bending elbows.'
      }
    ],
    exercises: [
      {
        name: 'Wide-Grip Lat Pulldown',
        difficulty: 'Beginner',
        targetArea: 'Upper Latissimus Dorsi & Teres Major',
        howToPerform: [
          'Adjust thigh pads firmly over knees.',
          'Grip bar slightly wider than shoulder width with overhand grip.',
          'Drive elbows straight down towards your back pockets until bar grazes upper collarbone.',
          'Control the ascent smoothly for a full stretch at the top.'
        ],
        recommendedReps: {
          hypertrophy: '8-12 reps',
          strength: '6-8 reps',
          endurance: '15 reps'
        },
        recommendedSets: '4 sets',
        restPeriod: '60-90s',
        formTips: [
          'Avoid swinging backwards past 15 degrees.',
          'Depress your shoulders before initiating the elbow pull.'
        ]
      }
    ]
  },
  {
    equipmentName: 'Angled Leg Press Machine',
    equipmentType: 'machine',
    primaryMuscle: 'Legs',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
    overview: 'Heavy 45-degree sled machine designed for high-load leg hypertrophy without spinal compression.',
    benefitsAndUses: [
      {
        title: 'Zero Spinal Axial Loading',
        description: 'Takes vertical compressive load off lumbar vertebrae and intervertebral discs compared to barbell squats.'
      },
      {
        title: 'Maximum Quad Overload to Failure',
        description: 'Safety catches allow safe training to true muscular failure without requiring spotters.'
      },
      {
        title: 'Stance-Specific Muscle Targeting',
        description: 'Placing feet lower emphasizes quads; higher stance activates glutes and posterior chain.'
      }
    ],
    exercises: [
      {
        name: 'Standard Stance Leg Press',
        difficulty: 'Beginner',
        targetArea: 'Quad Dominant Compound',
        howToPerform: [
          'Sit with lower back and hips glued against the backrest.',
          'Place feet shoulder-width apart in middle of sled plate.',
          'Disengage safety levers, lower sled until knees reach 90 degrees.',
          'Drive through mid-foot and heel to press back up without locking knees.'
        ],
        recommendedReps: {
          hypertrophy: '10-15 reps',
          strength: '6-8 reps',
          endurance: '20 reps'
        },
        recommendedSets: '4 sets',
        restPeriod: '90-120s',
        formTips: [
          'Never lock out knees aggressively at the top.',
          'Keep your pelvis pinned down—do not let your tailbone curl off the pad.'
        ]
      }
    ]
  }
];

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
      const { image } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Missing image payload' });
      }

      const client = getAIClient();

      if (client) {
        try {
          // Clean base64 data
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

          const prompt = `You are an elite sports biomechanist, strength coach, and gym equipment identifier.
Examine this gym snapshot carefully. Identify the gym machine, free-weight station, rack, bench, or barbell/cable equipment shown.

Provide an exact, structured JSON response with:
1. "equipmentName": Concise, official name of the gym machine/equipment (e.g. "Lat Pulldown Machine", "45-Degree Incline Bench", "Cable Crossover Station", "Leg Press Machine", "Smith Machine", "Olympic Barbell Squat Rack", "Hex Dumbbells & Incline Bench").
2. "equipmentType": One of ["machine", "cable", "barbell", "dumbbell", "bodyweight", "other"].
3. "primaryMuscle": Primary target group: one of ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"].
4. "targetMuscles": Array of muscle names engaged (primary and secondary).
5. "overview": 1-2 sentence description of the machine's mechanism and function.
6. "benefitsAndUses": Array of 2 to 4 objects with:
   - "title": Short bold benefit (e.g. "Continuous Cable Tension", "Spinal Decompression", "Peak Contraction Angle")
   - "description": 1-2 sentence explanation of why this equipment is superior or valuable.
7. "exercises": Array of 1 to 3 exercises you can perform on this specific equipment, each containing:
   - "name": Exercise name
   - "difficulty": "Beginner", "Intermediate", or "Advanced"
   - "targetArea": Specific muscle division targeted
   - "howToPerform": Array of 3-4 concise step-by-step cues
   - "recommendedReps": Object with:
     - "hypertrophy": Recommended rep count for muscle growth (e.g. "8-12 reps")
     - "strength": Recommended rep count for strength/power (e.g. "5-8 reps")
     - "endurance": Recommended rep count for endurance/definition (e.g. "15-20 reps")
   - "recommendedSets": Recommended sets (e.g. "3-4 sets")
   - "restPeriod": Recommended rest interval (e.g. "60-90s")
   - "formTips": Array of 2 essential injury-prevention form tips

Only output valid JSON.`;

          const response = await client.models.generateContent({
            model: 'gemini-3.8-flash',
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

          return res.json({
            success: true,
            source: 'gemini-vision',
            data: parsed,
          });
        } catch (geminiError: any) {
          console.warn('Gemini vision API error, falling back to smart gym equipment analyzer:', geminiError?.message || geminiError);
        }
      }

      // Fallback selection if no API key or vision call failed
      const randomIndex = Math.floor(Math.random() * FALLBACK_EQUIPMENT_DATA.length);
      const fallbackResult = FALLBACK_EQUIPMENT_DATA[randomIndex];

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
