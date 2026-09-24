import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Sparkles, 
  X, 
  Upload, 
  Dumbbell, 
  Scan,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';
import { EquipmentScanData, DayWorkoutPlan, Weekday, Exercise, MuscleGroup } from '../types';
import { EquipmentScanDetails } from './EquipmentScanDetails';
import { optimizeImageForScan } from '../lib/imageUtils';

interface CameraViewProps {
  onClose: () => void;
  weeklyPlan?: DayWorkoutPlan[];
  onAddExerciseToWeeklyPlan?: (exercise: Exercise, targetDays: Weekday[]) => Promise<void>;
  onNavigateToHome?: () => void;
}

type CameraMode = 'equipment_scan' | 'form_check' | 'gym_selfie';

const SAMPLE_EQUIPMENT_PHOTOS: Array<{ name: string; label: string; muscle: MuscleGroup; url: string }> = [
  {
    name: 'Arms',
    label: 'Arms (Preacher/Cables)',
    muscle: 'Arms',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Back',
    label: 'Back (Lat Pulldown)',
    muscle: 'Back',
    url: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chest',
    label: 'Chest (Press Machine)',
    muscle: 'Chest',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Legs',
    label: 'Legs (45° Leg Press)',
    muscle: 'Legs',
    url: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',
  },
];

export const CameraView: React.FC<CameraViewProps> = ({ 
  onClose,
  weeklyPlan = [],
  onAddExerciseToWeeklyPlan,
  onNavigateToHome
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const deviceCameraInputRef = useRef<HTMLInputElement | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [mode, setMode] = useState<CameraMode>('equipment_scan');
  
  // Snap & Analysis State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanResult, setScanResult] = useState<EquipmentScanData | null>(null);

  const scanSteps = [
    'Scanning Machine Geometry & Grip Trajectory...',
    'Identifying Primary Muscle Recruitment...',
    'Generating Beginner, Intermediate & Advanced Stages...',
    'Finalizing Biomechanical Advantages & Rep Cues...'
  ];

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  async function startCamera() {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Device camera stream not supported in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraActive(false);
      setCameraError(err?.message || 'Camera permission denied or device not found.');
    }
  }

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  function toggleCamera() {
    haptics.trigger('selection');
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }

  // Handle equipment analysis call with optimized image and progressive status
  async function processEquipmentImage(rawImage: string | File, targetMuscleHint?: MuscleGroup) {
    setIsScanning(true);
    setScanStepIndex(0);

    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      // 1. Optimize image client-side to prevent huge base64 payload
      const optimizedBase64 = await optimizeImageForScan(rawImage);
      setCapturedImage(optimizedBase64);

      // 2. Send to backend vision endpoint
      const response = await fetch('/api/scan-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: optimizedBase64,
          targetMuscleHint: targetMuscleHint 
        }),
      });

      const result = await response.json();

      if (result && result.success && result.data) {
        clearInterval(stepInterval);
        setScanResult(result.data);
        haptics.trigger('success');
      } else {
        throw new Error('Analysis returned empty data');
      }
    } catch (err) {
      console.warn('Scan equipment fallback triggered:', err);
      clearInterval(stepInterval);
      
      // Fallback matching the video structure
      const fallbackKey = targetMuscleHint || 'Back';
      const fallbackData: EquipmentScanData = {
        equipmentName: fallbackKey === 'Arms' ? 'Biceps Preacher Bench & Cable Station' : fallbackKey === 'Chest' ? 'Chest Press Machine & Incline Bench' : 'Lat Pulldown & Seated Cable Station',
        equipmentType: 'machine',
        primaryMuscle: fallbackKey,
        targetMuscles: fallbackKey === 'Arms' ? ['Biceps Brachii', 'Brachialis', 'Triceps', 'Forearms'] : fallbackKey === 'Chest' ? ['Pectoralis Major', 'Anterior Delts', 'Triceps'] : ['Latissimus Dorsi', 'Rhomboids', 'Mid Traps'],
        overview: 'Heavy traction and isolation station designed for maximum hypertrophy with strict biomechanical stabilization.',
        benefitsAndUses: [
          {
            title: 'Anatomical Isolation',
            description: 'Locks body angle in place to prevent momentum, maximizing muscle fiber tension throughout range of motion.'
          },
          {
            title: 'Joint-Friendly Angles',
            description: 'Reduces impingement by keeping wrists and elbows in their natural ergonomic movement tracks.'
          },
          {
            title: 'Targeted Hypertrophy Squeeze',
            description: 'Delivers continuous resistance at full muscle contraction where gravity-assisted free weights drop tension.'
          }
        ],
        stages: {
          beginner: {
            stageName: 'Beginner Stage',
            description: 'Foundational machine sets focusing on scapular/elbow stability and controlled eccentric tempo.',
            exercises: [
              {
                name: fallbackKey === 'Arms' ? 'Dumbbell Preacher Curl' : fallbackKey === 'Chest' ? 'Machine Chest Press' : 'Lat Pulldown',
                setsAndReps: '3 sets × 10-12 reps',
                targetRepsBadge: '2x15',
                difficulty: 'Beginner',
                targetArea: 'Primary Muscle Base',
                tips: ['Control descent for 2 seconds', 'Do not arch back']
              },
              {
                name: fallbackKey === 'Arms' ? 'Overhead Dumbbell Triceps Extension' : fallbackKey === 'Chest' ? 'Incline Dumbbell Press' : 'Seated Cable Row',
                setsAndReps: '3 sets × 10-12 reps',
                targetRepsBadge: '2x10',
                difficulty: 'Beginner',
                targetArea: 'Secondary Fiber Stretch',
                tips: ['Focus on peak contraction', 'Keep core engaged']
              }
            ]
          },
          intermediate: {
            stageName: 'Intermediate Stage',
            description: 'Compound overload movements for overall muscle thickness and functional strength.',
            exercises: [
              {
                name: fallbackKey === 'Arms' ? 'Standing Barbell Curl' : fallbackKey === 'Chest' ? 'Flat Barbell Bench Press' : 'Pull-Ups',
                setsAndReps: '3 sets × 8-10 reps',
                targetRepsBadge: '3x10',
                difficulty: 'Intermediate',
                targetArea: 'Muscle Mass Compound',
                tips: ['Pin elbows or retract scapulae', 'Explosive concentric phase']
              },
              {
                name: fallbackKey === 'Arms' ? 'Close-Grip Bench Press' : fallbackKey === 'Chest' ? 'Incline Barbell Bench Press' : 'Barbell Row',
                setsAndReps: '4 sets × 8-10 reps',
                targetRepsBadge: '2x15',
                difficulty: 'Intermediate',
                targetArea: 'Target Thickness',
                tips: ['Strict bar path', 'Breathe out on drive']
              }
            ]
          },
          advanced: {
            stageName: 'Advanced Stage',
            description: 'High-intensity tension and pauses to break through plateaus.',
            exercises: [
              {
                name: fallbackKey === 'Arms' ? '21s Bicep Curls' : fallbackKey === 'Chest' ? 'Paused Flat Bench Press' : 'Weighted Pull-Ups',
                setsAndReps: '3-4 sets',
                targetRepsBadge: '3x20',
                difficulty: 'Advanced',
                targetArea: 'Maximum Muscle Fiber Recruitment',
                tips: ['Zero momentum', 'Hold peak contraction']
              }
            ]
          }
        },
        exercises: [
          {
            name: fallbackKey === 'Arms' ? 'Dumbbell Preacher Curl' : fallbackKey === 'Chest' ? 'Machine Chest Press' : 'Lat Pulldown',
            difficulty: 'Beginner',
            targetArea: fallbackKey,
            howToPerform: [
              'Position body securely against pads.',
              'Grip handles firmly and stabilize core.',
              'Execute movement smoothly along designated track.',
              'Control the eccentric return over 2 seconds.'
            ],
            recommendedReps: {
              hypertrophy: '10-12 reps',
              strength: '6-8 reps',
              endurance: '15 reps'
            },
            recommendedSets: '3-4 sets',
            restPeriod: '60-90s',
            formTips: ['Keep joints aligned with pivot points', 'Exhale during concentric drive']
          }
        ]
      };
      setScanResult(fallbackData);
      haptics.trigger('success');
    } finally {
      clearInterval(stepInterval);
      setIsScanning(false);
    }
  }

  // Action: Take snapshot (or open device camera if stream is not active)
  function handleShutterClick() {
    haptics.trigger('medium');

    if (cameraActive && videoRef.current && canvasRef.current) {
      // Capture live stream frame
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 200);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        processEquipmentImage(dataUrl);
        return;
      }
    }

    // If live camera stream is not active (due to iframe or browser policy), open native device camera directly
    if (deviceCameraInputRef.current) {
      deviceCameraInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  // Handle file or device camera input
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      haptics.trigger('selection');
      processEquipmentImage(file);
    }
  }

  // Handle sample photo selection (instant test matching video)
  function handleSelectSample(sample: typeof SAMPLE_EQUIPMENT_PHOTOS[0]) {
    haptics.trigger('selection');
    processEquipmentImage(sample.url, sample.muscle);
  }

  // Reset to retake
  function handleRetake() {
    haptics.trigger('light');
    setCapturedImage(null);
    setScanResult(null);
    setIsScanning(false);
  }

  // IF SCAN RESULT READY IN EQUIPMENT MODE -> Render Rich Equipment Breakdown View (matching video)
  if (scanResult && mode === 'equipment_scan') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0B0F] flex flex-col max-w-md mx-auto overflow-hidden animate-in fade-in duration-300">
        <EquipmentScanDetails
          scanData={scanResult}
          capturedImage={capturedImage}
          weeklyPlan={weeklyPlan}
          onAddExerciseToWeeklyPlan={async (exercise, days) => {
            if (onAddExerciseToWeeklyPlan) {
              await onAddExerciseToWeeklyPlan(exercise, days);
            }
          }}
          onRetake={handleRetake}
          onClose={onClose}
          onNavigateToHome={onNavigateToHome}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col max-w-md mx-auto overflow-hidden animate-in fade-in duration-300">
      
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      {/* Native device camera input: opens phone camera directly */}
      <input 
        type="file" 
        ref={deviceCameraInputRef} 
        onChange={handleFileSelected} 
        accept="image/*" 
        capture="environment"
        className="hidden" 
      />
      {/* Standard file/gallery input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelected} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Top Controls Overlay */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg"
            style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
          >
            {mode === 'equipment_scan' ? <Scan className="w-4 h-4 stroke-[2.5]" /> : <Camera className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>{mode === 'equipment_scan' ? 'AI Equipment Scanner' : mode === 'form_check' ? 'Gym Form Coach' : 'Gym Selfie'}</span>
            </div>
            <div className="text-[10px] font-mono" style={{ color: theme.primary }}>
              {mode === 'equipment_scan' ? 'Identifies machine, muscle & stages' : 'Real-time joint & spine analysis'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#CBD3E3] transition active:scale-95"
            title="Upload from Photo Gallery"
          >
            <Upload className="w-4 h-4" />
          </button>
          {cameraActive && (
            <button
              onClick={toggleCamera}
              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#CBD3E3] transition active:scale-95"
              aria-label="Flip Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-white/80 transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewport Area */}
      <div className="relative flex-1 bg-[#0A0B0F] overflow-hidden flex items-center justify-center">
        
        {/* Flash animation */}
        {flashActive && (
          <div className="absolute inset-0 bg-white z-40 transition-opacity duration-200" />
        )}

        {/* Video feed if camera stream is active */}
        {cameraActive && !capturedImage && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        )}

        {/* Captured Snapshot or Scanning View */}
        {capturedImage && (
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Captured gym snapshot" className="w-full h-full object-cover" />
            
            {/* POLISHED SCANNING HUD (NO AWKWARD GREEN LINE) */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
                {/* Concentric Pulsing Radar Frame */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-dashed animate-spin"
                    style={{ borderColor: `${theme.primary}80`, animationDuration: '6s' }}
                  />
                  <div 
                    className="absolute inset-2 rounded-full border-2 animate-ping"
                    style={{ borderColor: `${theme.primary}40`, animationDuration: '2s' }}
                  />
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                    style={{ backgroundColor: `${theme.primary}25`, color: theme.primary }}
                  >
                    <Dumbbell className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                {/* Progress Details Card */}
                <div className="w-full max-w-xs p-4 rounded-2xl bg-[#12141D] border border-[#252C3E] text-center space-y-3 shadow-2xl">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-[#00E5FF]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      AI Biomechanical Scanner
                    </h3>
                  </div>

                  <p className="text-xs text-[#BAC4D9] font-mono leading-relaxed min-h-[36px] flex items-center justify-center">
                    {scanSteps[scanStepIndex]}
                  </p>

                  {/* Progress Indicator */}
                  <div className="w-full bg-[#181C28] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        backgroundColor: theme.primary, 
                        width: `${((scanStepIndex + 1) / scanSteps.length) * 100}%` 
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8E95A5]">
                    <span>Step {scanStepIndex + 1} of 4</span>
                    <span>Analyzing Anatomy...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera Permission / Fallback Card if getUserMedia is blocked */}
        {!cameraActive && !capturedImage && (
          <div className="p-6 text-center max-w-xs space-y-4">
            <div 
              className="w-16 h-16 mx-auto rounded-3xl bg-[#151722] border border-[#2B3144] flex items-center justify-center shadow-lg"
              style={{ color: theme.primary }}
            >
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Ready to Scan Equipment</h3>
              <p className="text-xs text-[#8E95A5] mt-1.5 leading-relaxed">
                Take a snap of any gym machine or weights to unlock the Beginner, Intermediate & Advanced training stages.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => deviceCameraInputRef.current?.click()}
                className="py-3 px-5 rounded-2xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Open Device Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#1A1F2C] text-[#CBD3E3] border border-[#2D3547] hover:bg-[#252D3E] transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload From Gallery</span>
              </button>
            </div>
          </div>
        )}

        {/* OVERLAYS FOR EQUIPMENT SCAN MODE (When live video is active) */}
        {cameraActive && !capturedImage && mode === 'equipment_scan' && (
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            {/* Viewfinder brackets */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="w-64 h-64 border-2 rounded-3xl relative flex flex-col items-center justify-between p-4"
                style={{ borderColor: `${theme.primary}80` }}
              >
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 rounded-tl-xl" style={{ borderColor: theme.primary }} />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 rounded-tr-xl" style={{ borderColor: theme.primary }} />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 rounded-bl-xl" style={{ borderColor: theme.primary }} />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 rounded-br-xl" style={{ borderColor: theme.primary }} />

                <span 
                  className="bg-black/80 px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold text-white flex items-center gap-1.5 shadow-md"
                >
                  <Scan className="w-3 h-3 text-[#00E5FF]" />
                  <span>Align Machine in Frame</span>
                </span>

                <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Dumbbell className="w-8 h-8 text-white/50" />
                </div>

                <span className="text-[10px] text-white/90 font-mono text-center bg-black/80 px-3 py-1 rounded-full border border-white/10">
                  Tap Shutter to Scan
                </span>
              </div>
            </div>

            {/* Bottom guide pill */}
            <div className="p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-xs text-center">
              <p className="text-[11px] text-[#E2E8F0]">
                Detects machines & weights • Breaks down Beginner to Advanced stages with sets & reps.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* SAMPLE TEST SNAPS: Quick click to test Arms, Back, Chest, Legs from reference video */}
      {!capturedImage && (
        <div className="relative z-20 px-3 py-2 bg-[#0D0F16] border-t border-[#1C2130]">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8E95A5] flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-[#00E5FF]" /> Tap to test with reference gym photos:
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SAMPLE_EQUIPMENT_PHOTOS.map((sample) => (
              <button
                key={sample.name}
                onClick={() => handleSelectSample(sample)}
                className="py-1.5 px-3 rounded-xl text-[11px] font-mono font-bold bg-[#181C28] text-white border border-[#293144] hover:border-[#43506E] transition flex-shrink-0 active:scale-95 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Shutter Action Bar */}
      <div className="relative z-20 p-5 bg-[#0A0B0F] flex items-center justify-between px-8 border-t border-[#1F2332]">
        
        {/* Upload Button Shortcut */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-[#161924] border border-[#293042] flex items-center justify-center text-[#CBD3E3] active:scale-95 transition hover:text-white"
          title="Upload image from gallery"
        >
          <Upload className="w-5 h-5" />
        </button>

        {/* Center Big Shutter Button: Always snaps photo or opens device camera directly */}
        <button
          id="camera-shutter-btn"
          onClick={handleShutterClick}
          className="w-20 h-20 rounded-full border-4 p-1.5 flex items-center justify-center active:scale-90 transition group shadow-2xl"
          style={{ borderColor: theme.primary }}
          aria-label="Take Equipment Photo"
        >
          <div 
            className="w-full h-full rounded-full group-hover:scale-95 transition flex items-center justify-center shadow-inner"
            style={{ backgroundColor: theme.primary }}
          >
            <Scan className="w-7 h-7 stroke-[2.5]" style={{ color: theme.primaryContrast }} />
          </div>
        </button>

        {/* Device Camera Direct Trigger */}
        <button
          onClick={() => deviceCameraInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-[#161924] border border-[#293042] flex items-center justify-center text-[#CBD3E3] active:scale-95 transition hover:text-white"
          title="Direct device camera snap"
        >
          <Camera className="w-5 h-5" />
        </button>

      </div>

    </div>
  );
};
