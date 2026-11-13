// AI-assisted: see docs/AI_LOG.md #28
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Custom hook: true when the phone has "Reduce motion" turned on. Animations are skipped then.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    // Also follows the setting if the driver changes it while the app is open
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    // Cleanup: stop listening and ignore a late answer when the component unmounts
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}