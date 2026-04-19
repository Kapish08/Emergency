/**
 * SOS Button — Floating emergency button
 */
import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const SOSButton = () => {
  const { addToast } = useToast();
  const [fired, setFired] = useState(false);

  const handleSOS = () => {
    if (fired) return;
    setFired(true);
    addToast({
      type: 'error',
      title: '🚨 SOS Activated!',
      message: 'Contacting emergency services at 911. Stay calm.',
      duration: 6000,
    });
    // Simulate calling 911
    setTimeout(() => {
      addToast({
        type: 'warning',
        title: 'Ambulance Dispatched',
        message: 'ETA: ~8 minutes. Help is on the way!',
        duration: 6000,
      });
    }, 2000);
    setTimeout(() => setFired(false), 8000);
  };

  return (
    <div className="sos-button">
      <button
        id="sos-emergency-btn"
        className="sos-btn"
        onClick={handleSOS}
        title="Emergency SOS - Call 911"
        disabled={fired}
      >
        {fired ? (
          <>
            <Phone size={18} />
            <span>HOLD</span>
          </>
        ) : (
          <>
            <Phone size={18} />
            <span>SOS</span>
          </>
        )}
      </button>
    </div>
  );
};

export default SOSButton;
