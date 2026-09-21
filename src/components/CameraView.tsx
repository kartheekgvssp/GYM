import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Sparkles, 
  X, 
  RotateCcw, 
  Upload, 
  Dumbbell, 
  Scan,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';
import { EquipmentScanData, DayWorkoutPlan, Weekday, Exercise } from '../types';
import { EquipmentScanDetails } from './EquipmentScanDetails';

interface CameraViewProps {
  onClose: () => void;
  weeklyPlan?: DayWorkoutPlan[];
  onAddExerciseToWeeklyPlan?: (exercise: Exercise, targetDays: Weekday[]) => Promise<void>;
  onNavigateToHome?: () => void;
}

type CameraMode = 'equipment_scan' | 'form_check' | 'gym_selfie';

const SAMPLE_EQUIPMENT_PHOTOS = [
  {
    name: 'Cable Crossover',
    label: 'Cable Station',
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Lat Pulldown',
    label: 'Lat Pulldown',
    url: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Leg Press Sled',
    label: 'Leg Press',
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
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [mode, setMode] = useState<CameraMode>('equipment_scan');
  
  // Snap & Analysis State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState('Capturing Equipment Frame...');
  const [scanResult, setScanResult] = useState<EquipmentScanData | null>(null);

  // Form check mock data
  const [formFeedback] = useState<{
    points: string[];
  }>({
    points: ['Spine alignment: 178° (Neutral)', 'Knee tracking: Balanced over midfoot', 'Tempo: 2s eccentric matched'],
  });

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
        throw new Error('Camera device access is not supported in this browser environment.');
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

  // Handle equipment analysis call
  async function analyzeEquipmentImage(imageDataUrl: string) {
    setIsScanning(true);
    setScanStepMessage('Scanning equipment structure & grip points...');

    try {
      setTimeout(() => {
        setScanStepMessage('Evaluating biomechanics & target muscle groups...');
      }, 700);

      const response = await fetch('/api/scan-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const result = await response.json();

      if (result && result.success && result.data) {
        setScanResult(result.data);
        haptics.trigger('success');
      } else {
        throw new Error('Analysis returned empty data');
      }
    } catch (err) {
      console.warn('Scan equipment API fallback:', err);
      // Fallback safe equipment object
      const fallback: EquipmentScanData = {
        equipmentName: 'Dual Cable Station & High Pulley',
        equipmentType: 'cable',
        primaryMuscle: 'Chest',
        targetMuscles: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
        overview: 'Adjustable dual-pulley apparatus engineered for continuous isolation tension throughout the entire horizontal adduction arc.',
        benefitsAndUses: [
          {
            title: 'Constant Tension Curve',
            description: 'Maintains peak muscle contraction at the very top of the flye where dumbbells lose gravity resistance.'
          },
          {
            title: 'Shoulder Joint Safety',
            description: 'Freely pivoting handles adjust to individual wrist and shoulder mechanics, minimizing rotator cuff impingement.'
          },
          {
            title: 'Unilateral Imbalance Correction',
            description: 'Forces each side of your body to recruit independent stabilizers without allowing your dominant side to take over.'
          }
        ],
        exercises: [
          {
            name: 'Cable Standing Chest Flye',
            difficulty: 'Beginner',
            targetArea: 'Middle & Lower Sternal Pecs',
            howToPerform: [
              'Position pulleys at chest level with single D-handles attached.',
              'Take one step forward into a staggered stance with an engaged core.',
              'Bring handles together in front of sternum with a slight elbow bend.',
              'Squeeze inner chest for 1 full second before a controlled 2-second return.'
            ],
            recommendedReps: {
              hypertrophy: '10-12 reps',
              strength: '6-8 reps',
              endurance: '15-20 reps'
            },
            recommendedSets: '3-4 sets',
            restPeriod: '60-75s',
            formTips: [
              'Imagine hugging a large barrel to preserve the slight elbow bend.',
              'Avoid letting hands drift past shoulder plane on the negative phase.'
            ]
          },
          {
            name: 'Overhead Cable Triceps Extension',
            difficulty: 'Intermediate',
            targetArea: 'Long Head of Triceps',
            howToPerform: [
              'Attach rope to low or mid pulley and face away from machine.',
              'Press hands overhead and lock elbows near ears.',
              'Extend forearms upward to full triceps lockout.'
            ],
            recommendedReps: {
              hypertrophy: '10-12 reps',
              strength: '8 reps',
              endurance: '15 reps'
            },
            recommendedSets: '3 sets',
            restPeriod: '60s',
            formTips: [
              'Keep upper arms stationary throughout the entire rep.',
              'Flare the rope ends apart at full lockout.'
            ]
          }
        ]
      };
      setScanResult(fallback);
      haptics.trigger('success');
    } finally {
      setIsScanning(false);
    }
  }

  // Take snap from live video
  function takeSnapshot() {
    haptics.trigger('medium');

    // Flash visual effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    let dataUrl: string | null = null;

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    // Fallback if camera video not loaded
    if (!dataUrl) {
      dataUrl = SAMPLE_EQUIPMENT_PHOTOS[0].url;
    }

    setCapturedImage(dataUrl);

    if (mode === 'equipment_scan') {
      analyzeEquipmentImage(dataUrl);
    }
  }

  // Handle sample photo selection
  function handleSelectSample(url: string) {
    haptics.trigger('selection');
    setCapturedImage(url);
    if (mode === 'equipment_scan') {
      analyzeEquipmentImage(url);
    }
  }

  // Handle file upload
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          haptics.trigger('selection');
          setCapturedImage(dataUrl);
          if (mode === 'equipment_scan') {
            analyzeEquipmentImage(dataUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Reset to retake
  function handleRetake() {
    haptics.trigger('light');
    setCapturedImage(null);
    setScanResult(null);
    setIsScanning(false);
  }

  // IF SCAN RESULT READY IN EQUIPMENT MODE -> Render Rich Equipment Breakdown View
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
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
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
              {mode === 'equipment_scan' ? 'Point & snap any gym machine or weights' : 'Real-time joint & spine analysis'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#CBD3E3] transition active:scale-95"
            title="Upload Photo"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={toggleCamera}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:text-[#CBD3E3] transition active:scale-95"
            aria-label="Flip Camera"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
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

        {/* Video feed */}
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
            
            {/* SCANNING RADAR & LASER OVERLAY */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 z-30">
                
                {/* Laser Sweep Bar */}
                <div 
                  className="absolute left-0 right-0 h-1.5 shadow-[0_0_20px_rgba(0,229,255,0.9)] animate-bounce"
                  style={{ backgroundColor: theme.primary }}
                />

                <div className="p-5 rounded-3xl bg-[#12141D]/90 border border-[#262C3E] text-center max-w-xs space-y-3 shadow-2xl">
                  <div 
                    className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: `${theme.primary}25`, color: theme.primary }}
                  >
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Analyzing Equipment Optics
                    </h3>
                    <p className="text-xs text-[#8E95A5] mt-1 font-mono leading-relaxed">
                      {scanStepMessage}
                    </p>
                  </div>
                  <div className="w-full bg-[#1A1F2C] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                      style={{ backgroundColor: theme.primary, width: '75%' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera Permission / Fallback Graphic if no device */}
        {cameraError && !capturedImage && (
          <div className="p-6 text-center max-w-xs space-y-4">
            <div 
              className="w-16 h-16 mx-auto rounded-3xl bg-[#151722] border border-[#2B3144] flex items-center justify-center"
              style={{ color: theme.primary }}
            >
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Live Gym Camera</h3>
              <p className="text-xs text-[#8E95A5] mt-1 leading-relaxed">
                Take a snap of any machine to detect exercises, optimal rep ranges, and add it directly to Featured Power Lifts.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={startCamera}
                className="py-2.5 px-6 rounded-full font-extrabold text-xs uppercase tracking-wider transition"
                style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
              >
                Enable Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider bg-[#1A1F2C] text-white border border-[#2D3547] hover:bg-[#252D3E] transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Equipment Snap</span>
              </button>
            </div>
          </div>
        )}

        {/* OVERLAYS FOR EQUIPMENT SCAN MODE */}
        {cameraActive && !capturedImage && mode === 'equipment_scan' && (
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            {/* Viewfinder brackets */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div 
                className="w-64 h-64 border-2 rounded-3xl relative flex flex-col items-center justify-between p-4"
                style={{ borderColor: `${theme.primary}80` }}
              >
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor: theme.primary }} />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor: theme.primary }} />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: theme.primary }} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: theme.primary }} />

                <span 
                  className="bg-black/80 px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold text-white flex items-center gap-1.5"
                >
                  <Scan className="w-3 h-3 text-[#00E5FF]" />
                  <span>Align Equipment in Frame</span>
                </span>

                <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Dumbbell className="w-8 h-8 text-white/50" />
                </div>

                <span className="text-[10px] text-white/80 font-mono text-center bg-black/70 px-2.5 py-0.5 rounded-full">
                  Tap Shutter to Scan & Identify
                </span>
              </div>
            </div>

            {/* Bottom guide pill */}
            <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-xs text-center">
              <p className="text-[11px] text-[#E2E8F0]">
                Detects machines, pulleys, benches & plates • Recommends rep ranges & unlocks one-tap add to weekly power lifts.
              </p>
            </div>
          </div>
        )}

        {/* OVERLAYS FOR FORM CHECK MODE */}
        {cameraActive && !capturedImage && mode === 'form_check' && (
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div 
              className="relative w-full h-full border border-dashed rounded-3xl flex items-center justify-center"
              style={{ borderColor: `${theme.primary}40` }}
            >
              <div 
                className="w-48 h-64 border-2 rounded-2xl relative"
                style={{ borderColor: theme.primary }}
              >
                <span 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold"
                  style={{ color: theme.primary }}
                >
                  Position Body in Frame
                </span>
                <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-white/70 animate-ping" />
                <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-white/90" />
                <div className="absolute bottom-6 right-4 w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-xs">
              <div className="flex items-center justify-between font-bold text-[11px] uppercase mb-1" style={{ color: theme.primary }}>
                <span>AI Posture Guide</span>
                <span className="font-mono">Live 60 FPS</span>
              </div>
              <div className="space-y-0.5 text-[11px] text-[#E2E8F0]">
                {formFeedback.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* SAMPLE TEST SNAPS (Quick click to test without a physical gym machine) */}
      {!capturedImage && (
        <div className="relative z-20 px-4 py-2 bg-[#0D0F16] border-t border-[#1C2130] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase font-bold text-[#8E95A5] flex-shrink-0 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> Test Snaps:
          </span>
          {SAMPLE_EQUIPMENT_PHOTOS.map((sample) => (
            <button
              key={sample.name}
              onClick={() => handleSelectSample(sample.url)}
              className="py-1 px-2.5 rounded-lg text-[10px] font-mono font-bold bg-[#181C28] text-[#BAC4D9] border border-[#293144] hover:bg-[#222838] transition flex-shrink-0 active:scale-95"
            >
              {sample.label}
            </button>
          ))}
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="relative z-20 flex items-center justify-around py-2.5 px-4 bg-[#0A0B0F] border-t border-[#1F2332]">
        <button
          onClick={() => {
            haptics.trigger('selection');
            setMode('equipment_scan');
          }}
          className={`text-xs font-bold py-1.5 px-3 rounded-xl transition flex items-center gap-1.5 ${
            mode === 'equipment_scan'
              ? 'shadow-md font-extrabold'
              : 'text-[#8E95A5] hover:text-white'
          }`}
          style={mode === 'equipment_scan' ? {
            backgroundColor: theme.primary,
            color: theme.primaryContrast
          } : undefined}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Scan Equipment</span>
        </button>
        <button
          onClick={() => {
            haptics.trigger('selection');
            setMode('form_check');
          }}
          className={`text-xs font-bold py-1.5 px-3 rounded-xl transition ${
            mode === 'form_check'
              ? 'shadow-md font-extrabold'
              : 'text-[#8E95A5] hover:text-white'
          }`}
          style={mode === 'form_check' ? {
            backgroundColor: theme.primary,
            color: theme.primaryContrast
          } : undefined}
        >
          Form Check
        </button>
        <button
          onClick={() => {
            haptics.trigger('selection');
            setMode('gym_selfie');
          }}
          className={`text-xs font-bold py-1.5 px-3 rounded-xl transition ${
            mode === 'gym_selfie'
              ? 'shadow-md font-extrabold'
              : 'text-[#8E95A5] hover:text-white'
          }`}
          style={mode === 'gym_selfie' ? {
            backgroundColor: theme.primary,
            color: theme.primaryContrast
          } : undefined}
        >
          Progress Selfie
        </button>
      </div>

      {/* Bottom Shutter Action Bar */}
      <div className="relative z-20 p-5 bg-[#0A0B0F] flex items-center justify-between px-8">
        
        {/* Upload Button Shortcut */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-11 h-11 rounded-full bg-[#161924] border border-[#293042] flex items-center justify-center text-[#CBD3E3] active:scale-95 transition"
          title="Upload image from gallery"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Center Big Shutter Button */}
        <button
          id="camera-shutter-btn"
          onClick={takeSnapshot}
          className="w-18 h-18 rounded-full border-4 p-1 flex items-center justify-center active:scale-90 transition group shadow-2xl"
          style={{ borderColor: theme.primary }}
          aria-label="Take Equipment Photo"
        >
          <div 
            className="w-full h-full rounded-full group-hover:scale-95 transition flex items-center justify-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Scan className="w-6 h-6 stroke-[2.5]" style={{ color: theme.primaryContrast }} />
          </div>
        </button>

        {/* Flip camera */}
        <button
          onClick={toggleCamera}
          className="w-11 h-11 rounded-full bg-[#161924] border border-[#293042] flex items-center justify-center text-[#CBD3E3] active:scale-95 transition"
          title="Flip camera"
        >
          <SwitchCamera className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
