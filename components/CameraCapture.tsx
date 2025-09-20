
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface CameraCaptureProps {
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CheckIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const RefreshIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 11M20 20l-1.5-1.5A9 9 0 013.5 13" /></svg>;
const CloseIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


export const CameraCapture: React.FC<CameraCaptureProps> = ({ onClose, onCapture }) => {
  const { t } = useLocalization();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('camera.error.no_devices');
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setStream(newStream);
    } catch (err) {
      console.error('Camera Error:', err);
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setError(t('camera.error.permission_denied'));
      } else if (err instanceof Error && err.message.startsWith('camera.error')) {
        setError(t(err.message));
      } else {
        setError(t('camera.error.generic'));
      }
    }
  }, [stopCamera, t]);

  useEffect(() => {
    startCamera();
    return stopCamera;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fadeInUp" style={{animationDuration: '0.3s'}}>
        <div className="absolute top-4 right-4 z-20">
            <button onClick={onClose} className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors" aria-label={t('camera.close_aria')}>
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="relative w-full h-full flex items-center justify-center">
            {error ? (
                <div className="text-center p-8 bg-gray-800 rounded-lg max-w-sm mx-4">
                    <h3 className="text-xl font-bold text-red-400 mb-2">{t('camera.error.title')}</h3>
                    <p className="text-gray-300">{error}</p>
                </div>
            ) : (
                <>
                    <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}></video>
                    {capturedImage && <img src={capturedImage} alt="Captured reading" className="w-full h-full object-contain" />}
                    
                    {!capturedImage && (
                         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[90vw] h-[40vh] max-w-[500px] max-h-[300px] border-2 border-dashed border-white/80 rounded-2xl"
                                 style={{boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'}}>
                            </div>
                         </div>
                    )}
                </>
            )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center z-10">
            {!error && (
                capturedImage ? (
                    <div className="flex items-center gap-x-8">
                        <button onClick={handleConfirm} className="flex flex-col items-center gap-2 text-white font-bold py-2 px-5 rounded-lg hover:bg-white/20 transition-all">
                           <CheckIcon className="w-10 h-10 text-emerald-400"/>
                           <span>{t('camera.confirm_button')}</span>
                        </button>
                        <button onClick={() => setCapturedImage(null)} className="flex flex-col items-center gap-2 text-white font-bold py-2 px-5 rounded-lg hover:bg-white/20 transition-all">
                           <RefreshIcon className="w-10 h-10 text-sky-400"/>
                           <span>{t('camera.retake_button')}</span>
                        </button>
                    </div>
                ) : (
                    <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-black/30 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 transform active:scale-95 transition-transform" aria-label={t('camera.capture_button')}>
                        <CameraIcon className="w-8 h-8 text-slate-800" />
                    </button>
                )
            )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};
