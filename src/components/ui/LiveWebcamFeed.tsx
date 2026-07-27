import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Video } from 'lucide-react';

interface LiveWebcamFeedProps {
  active: boolean;
  label?: string;
  className?: string;
}

export default function LiveWebcamFeed({ active, label = 'Candidate (You)', className = '' }: LiveWebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (active) {
      setErrorMsg(null);
      navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 480 }, audio: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
          setIsStreaming(true);
        })
        .catch(err => {
          console.warn('Webcam stream error:', err);
          setErrorMsg('Camera access blocked/unavailable');
          setIsStreaming(false);
        });
    } else {
      setIsStreaming(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [active]);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 aspect-video flex items-center justify-center ${className}`}>
      {active && isStreaming ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform -scale-x-100"
        />
      ) : (
        <div className="text-center p-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2 text-slate-400">
            {active ? <Video size={18} className="animate-pulse text-indigo-400" /> : <CameraOff size={18} />}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {active ? (errorMsg || 'Connecting camera...') : 'Camera Disabled'}
          </span>
        </div>
      )}
      <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-md text-white font-semibold tracking-wide flex items-center gap-1 border border-white/10">
        <span className={`w-1.5 h-1.5 rounded-full ${active && isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
        {label}
      </span>
    </div>
  );
}
