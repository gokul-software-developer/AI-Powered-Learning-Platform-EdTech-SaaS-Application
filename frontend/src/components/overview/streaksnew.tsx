import React, { useState, useEffect } from 'react';
import StudyStreaks from './StudyPlan';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StudyStreaksWithOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    // Listen for messages from the popup window
    const handleMessage = (event) => {
      // Security check: verify origin
      if (event.origin !== BACKEND_URL) return;

      const { type, tokens, error } = event.data;

      if (type === 'oauth-success') {
        console.log('OAuth Success, tokens:', tokens);
        setShowOverlay(false);
        if (popup) popup.close();
        // You can save tokens in context/state here or call a function
      } else if (type === 'oauth-error') {
        console.error('OAuth Error:', error);
        setShowOverlay(false);
        if (popup) popup.close();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [popup]);

  const handleOverlayResponse = async (response) => {
    if (response === 'yes') {
      try {
        const res = await fetch(`${BACKEND_URL}/api/integrations/google/auth-url`);
        const data = await res.json();

        if (data.url) {
          // Open OAuth URL in a centered popup window
          const width = 500;
          const height = 600;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;

          const newPopup = window.open(
            data.url,
            'Google OAuth',
            `width=${width},height=${height},top=${top},left=${left}`
          );

          if (!newPopup) {
            console.error('Popup blocked');
            setShowOverlay(false);
            return;
          }

          setPopup(newPopup);
        } else {
          console.error('Google auth URL not returned');
          setShowOverlay(false);
        }
      } catch (err) {
        console.error('Error fetching Google auth URL:', err);
        setShowOverlay(false);
      }
    } else {
      setShowOverlay(false);
    }
  };

  return (
    <div className="relative p-4">
      {/* Main Component with enhanced styling */}
      <div className="rounded-2xl ">
        <StudyStreaks />
      </div>

      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-md">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-semibold text-black mb-2">
              Sync with Google Calendar?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We'll help you stay on track by syncing your schedule.
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => handleOverlayResponse('yes')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yes
              </button>
              <button
                onClick={() => handleOverlayResponse('no')}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyStreaksWithOverlay;
