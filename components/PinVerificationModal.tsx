import React, { useState, useEffect } from 'react';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  message?: string;
}

const LockIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Security Verification",
  message = "Enter PIN to continue"
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const CORRECT_PIN = '1256';

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setIsShaking(false);
    }
  }, [isOpen]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits
    if (value && !/^\d$/.test(value)) return; // Only allow numbers

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Check if PIN is complete
    if (newPin.every(digit => digit !== '') && index === 3) {
      const enteredPin = newPin.join('');
      if (enteredPin === CORRECT_PIN) {
        onSuccess(); // This will handle closing the modal and opening the next one
      } else {
        setError('Incorrect PIN. Please try again.');
        setIsShaking(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          setIsShaking(false);
          const firstInput = document.getElementById('pin-0');
          firstInput?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
      
      if (pastedData === CORRECT_PIN) {
        onSuccess(); // This will handle closing the modal and opening the next one
      } else {
        setError('Incorrect PIN. Please try again.');
        setIsShaking(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          setIsShaking(false);
        }, 500);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-sm transition-transform duration-300 ${
        isShaking ? 'animate-shake' : ''
      }`}>
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <LockIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* PIN Input */}
        <div className="p-6">
          <div className="flex justify-center gap-3 mb-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ${
                  error ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                maxLength={1}
                autoComplete="off"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="text-center mb-4">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="text-center text-xs text-slate-500">
            <p>Enter the 4-digit PIN to modify records</p>
            <p className="mt-1">This helps prevent accidental changes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
