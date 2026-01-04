import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
  getLocalStorageValue,
  setLocalStorageValue,
} from '@/lib/local-storage';

const COOKIE_BANNER_DISMISSED_KEY = 'cookie-banner-dismissed';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = getLocalStorageValue(COOKIE_BANNER_DISMISSED_KEY);
    if (!dismissed) {
      setShouldRender(true);
      // Trigger slide-in animation after a brief delay to ensure DOM is ready
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for slide-out animation to complete before removing from DOM
    setTimeout(() => {
      setShouldRender(false);
      setLocalStorageValue(COOKIE_BANNER_DISMISSED_KEY, 'true');
    }, 300);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-background rounded-md border px-4 py-3 shadow-lg">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <p className="text-sm">
            We use cookies to improve your experience and analyze site usage.
          </p>
          <div className="flex gap-2 max-md:flex-wrap">
            <Button size="sm" onClick={handleDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
