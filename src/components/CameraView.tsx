import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Zap, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  X, 
  RotateCcw, 
  Maximize, 
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { useTheme } from '../lib/theme';

interface CameraViewProps {
  onClose: () => void;
}

type CameraMode = 'form_check' | 'equipment_scan' | 'gym_selfie';

export const CameraView: React.FC<CameraViewProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [mode, setMode] = useState<CameraMode>('form_check');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{
    status: 'good' | 'warning';
    title: string;
    points: string[];
  }>({
    status: 'good',
    title: 'Optimal Bar Path & Depth',
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
        throw new Error('Camera device access is not supported in this browser.');
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
        videoRef.current.play();
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
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }

  function takeSnapshot() {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      
      // Simulate AI analysis
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
      }, 1200);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col max-w-md mx-auto overflow-hidden animate-in fade-in duration-300">
      
      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls Overlay */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center font-black"
            style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
          >
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-white">
              Gym Camera
            </div>
            <div className="text-[10px] font-mono" style={{ color: theme.primary }}>
              {mode === 'form_check' ? 'AI Form Analyzer' : mode === 'equipment_scan' ? 'Machine & Plate Scanner' : 'Progress Snapper'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

        {/* Captured Snapshot View */}
        {capturedImage && (
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Captured gym snapshot" className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#12141D]/90 backdrop-blur-md border border-[#222738] shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.primary }}>
                  <Sparkles className="w-4 h-4" /> Snapshot Saved
                </span>
                <span className="text-[10px] text-[#8E95A5] font-mono">Today, 5:42 PM</span>
              </div>
              <p className="text-xs text-[#CBD3E3]">
                {mode === 'gym_selfie' ? 'Watermarked progress photo logged to your personal profile.' : 'Biometric posture angles evaluated.'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex-1 py-2 rounded-xl bg-[#1C202E] text-white text-xs font-bold hover:bg-[#252C3D] transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl text-xs font-extrabold transition"
                  style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
                >
                  Done
                </button>
              </div>
            </div>
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
                Allow camera permissions in your browser to analyze exercise posture, scan equipment QR codes, and take progress photos.
              </p>
            </div>
            <button
              onClick={startCamera}
              className="py-2.5 px-6 rounded-full font-extrabold text-xs uppercase tracking-wider transition"
              style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* OVERLAYS BASED ON MODE */}
        {cameraActive && !capturedImage && (
          <>
            {mode === 'form_check' && (
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                {/* AI Grid & Silhouette Alignment */}
                <div 
                  className="relative w-full h-full border border-dashed rounded-3xl flex items-center justify-center"
                  style={{ borderColor: `${theme.primary}40` }}
                >
                  {/* Center Target Box */}
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
                    {/* Angle tracking nodes */}
                    <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-white/70 animate-ping" />
                    <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-white/90" />
                    <div className="absolute bottom-6 right-4 w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                  </div>
                </div>

                {/* Real-time posture pill */}
                <div className="absolute bottom-24 left-6 right-6 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-xs">
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

            {mode === 'equipment_scan' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                <div className="w-64 h-64 rounded-3xl border-2 border-[#00E5FF] relative flex items-center justify-center">
                  <span className="absolute -top-3 bg-black/80 px-3 py-0.5 rounded text-[10px] font-mono text-[#00E5FF] uppercase font-bold">
                    Scan Machine or Plate QR
                  </span>
                  <div className="w-full h-0.5 bg-[#00E5FF] absolute animate-bounce" />
                  <QrCode className="w-12 h-12 text-[#00E5FF]/40" />
                </div>
                <p className="mt-4 text-xs font-semibold text-center text-white bg-black/70 px-4 py-1.5 rounded-full border border-white/10">
                  Align gym equipment tag inside square to auto-load exercise
                </p>
              </div>
            )}

            {mode === 'gym_selfie' && (
              <div className="absolute top-16 left-6 pointer-events-none">
                <div 
                  className="bg-black/60 backdrop-blur-md border p-3 rounded-2xl"
                  style={{ borderColor: `${theme.primary}40` }}
                >
                  <div className="text-xs font-black uppercase tracking-wider" style={{ color: theme.primary }}>
                    AURAFIT ATHLETE
                  </div>
                  <div className="text-[10px] font-mono text-[#CBD3E3] mt-0.5">
                    CHEST & TRICEPS • 640 KCAL
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="relative z-20 flex items-center justify-around py-2.5 px-4 bg-[#0D0F16] border-t border-[#1F2332]">
        <button
          onClick={() => setMode('form_check')}
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
          onClick={() => setMode('equipment_scan')}
          className={`text-xs font-bold py-1.5 px-3 rounded-xl transition ${
            mode === 'equipment_scan'
              ? 'shadow-md font-extrabold'
              : 'text-[#8E95A5] hover:text-white'
          }`}
          style={mode === 'equipment_scan' ? {
            backgroundColor: theme.primary,
            color: theme.primaryContrast
          } : undefined}
        >
          QR & Machine
        </button>
        <button
          onClick={() => setMode('gym_selfie')}
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
      <div className="relative z-20 p-6 bg-[#0A0B0F] flex items-center justify-center">
        <button
          id="camera-shutter-btn"
          onClick={takeSnapshot}
          className="w-18 h-18 rounded-full border-4 p-1 flex items-center justify-center active:scale-90 transition group"
          style={{ borderColor: theme.primary }}
          aria-label="Take Photo"
        >
          <div 
            className="w-full h-full rounded-full group-hover:scale-95 transition"
            style={{ backgroundColor: theme.primary }}
          />
        </button>
      </div>

    </div>
  );
};
