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
  AlertTriangle,
  RotateCcw,
  RefreshCw,
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

  // Non-Gym Item Error State
  const [nonGymError, setNonGymError] = useState<{
    detectedItem: string;
    message: string;
    previewUrl: string | null;
  } | null>(null);

  const scanSteps = [
    'Scanning Item Geometry & Surfaces...',
    'Validating Fitness Equipment Authenticity...',
    'Analyzing Biomechanics & Muscle Recruitment...',
    'Structuring Training Stages & Rep Positions...'
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
  async function processEquipmentImage(rawImage: string | File, targetMuscleHint?: MuscleGroup, isSamplePreset?: boolean) {
    setIsScanning(true);
    setScanStepIndex(0);
    setNonGymError(null);

    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 600);

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
          targetMuscleHint: targetMuscleHint,
          isSamplePreset: isSamplePreset,
        }),
      });

      const result = await response.json();

      // Check if the backend detected a non-gym item (e.g. sunglasses, laptop, coffee cup)
      if (result && (result.isGymEquipment === false || result.success === false)) {
        clearInterval(stepInterval);
        haptics.trigger('warning');
        setNonGymError({
          detectedItem: result.detectedItem || 'Non-gym item',
          message: result.message || "This doesn't look like gym equipment. Please rescan the photo or retake the image.",
          previewUrl: optimizedBase64,
        });
        return;
      }

      if (result && result.success && result.data) {
        clearInterval(stepInterval);
        setScanResult(result.data);
        haptics.trigger('success');
        return;
      }

      // Default rejection if data is missing
      clearInterval(stepInterval);
      setNonGymError({
        detectedItem: 'Unrecognized item',
        message: "This doesn't look like gym equipment. Please rescan the photo or retake an image of gym equipment like dumbbells, barbells, or machines.",
        previewUrl: optimizedBase64,
      });
    } catch (err: any) {
      console.warn('Scan equipment error:', err);
      clearInterval(stepInterval);
      setNonGymError({
        detectedItem: 'Scan Error',
        message: "Unable to identify gym equipment from this photo. Please retake the photo with clearer lighting or hold the camera closer to the machine.",
        previewUrl: null,
      });
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
      // Reset input value so re-selecting same or new photo always fires onChange
      e.target.value = '';
      setNonGymError(null);
      processEquipmentImage(file);
    }
  }

  // Handle sample photo selection (instant test matching video)
  function handleSelectSample(sample: typeof SAMPLE_EQUIPMENT_PHOTOS[0]) {
    haptics.trigger('selection');
    setNonGymError(null);
    processEquipmentImage(sample.url, sample.muscle, true);
  }

  // Reset to retake
  function handleRetake() {
    haptics.trigger('light');
    setCapturedImage(null);
    setScanResult(null);
    setNonGymError(null);
    setIsScanning(false);
  }

  // Trigger resnap from non-gym error state
  function handleResnapFromError() {
    haptics.trigger('medium');
    setNonGymError(null);
    setCapturedImage(null);
    // Open camera / file chooser immediately
    if (deviceCameraInputRef.current) {
      deviceCameraInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      handleShutterClick();
    }
  }

  // IF NON-GYM ERROR ACTIVE -> Render High-Fidelity Rejection & Resnap Screen
  if (nonGymError && mode === 'equipment_scan') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0C14] text-white flex flex-col max-w-md mx-auto overflow-y-auto animate-in fade-in duration-300">
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#1E2436] bg-[#0E121E]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white">
                Equipment Verification Failed
              </div>
              <div className="text-[10px] font-mono text-[#EF4444]">
                Non-Gym Item Detected
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181D2D] hover:bg-[#252C42] border border-[#2B3550] flex items-center justify-center text-[#8E95A5] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 flex-1 flex flex-col justify-center">
          
          {/* Scanned Image Preview with Rejection Overlay */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#EF4444]/60 bg-[#121626] aspect-video max-h-56 flex items-center justify-center mx-auto w-full">
            {nonGymError.previewUrl ? (
              <>
                <img 
                  src={nonGymError.previewUrl} 
                  alt="Scanned item" 
                  className="w-full h-full object-cover filter brightness-75 contrast-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#EF4444] text-white shadow-md flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Detected: {nonGymError.detectedItem}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-[#EF4444] border border-[#EF4444]/40">
                      Not Gym Gear
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto opacity-80" />
                <div className="text-sm font-bold text-white">Item Not Recognized</div>
              </div>
            )}
          </div>

          {/* Detailed Error Notice Card */}
          <div className="p-4 rounded-2xl bg-[#141828] border border-[#EF4444]/30 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#EF4444] font-mono">
                Scan Result Notice
              </h3>
            </div>
            
            <p className="text-sm font-semibold text-white leading-relaxed">
              {nonGymError.message}
            </p>

            <div className="pt-2 border-t border-[#1F263D] text-[11px] text-[#8E95A5] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">✓ Supported:</span>
                <span>Machines, dumbbells, barbells, cable stations, racks, benches.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#EF4444] font-bold">✕ Not Supported:</span>
                <span>Laptops, sunglasses, phones, clothing, desk items, or food.</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleResnapFromError}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FF334B] hover:bg-[#E0243B] text-white font-extrabold text-sm uppercase tracking-wider transition shadow-lg shadow-[#FF334B]/20 flex items-center justify-center gap-2 active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>Retry / Resnap Gym Equipment</span>
            </button>

            <button
              onClick={() => {
                setNonGymError(null);
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#181D2D] hover:bg-[#22293E] text-[#00E5FF] font-bold text-xs uppercase tracking-wider border border-[#2B3550] transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Photo from Gallery</span>
            </button>
          </div>

          {/* Sample Gym Gear Quick Test */}
          <div className="pt-2 border-t border-[#1C2133] space-y-2">
            <div className="text-[11px] font-mono text-[#8E95A5] text-center">
              Or instantly test with a verified gym machine:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_EQUIPMENT_PHOTOS.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => handleSelectSample(sample)}
                  className="p-2.5 rounded-xl bg-[#131726] hover:bg-[#1C2338] border border-[#242D45] flex items-center gap-2 text-left transition active:scale-95"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{sample.name}</div>
                    <div className="text-[9px] font-mono text-[#8E95A5] truncate">{sample.muscle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
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
