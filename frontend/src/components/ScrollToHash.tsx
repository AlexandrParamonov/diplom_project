import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MAX_ATTEMPTS = 30;
const RETRY_DELAY = 50;

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return undefined;
    }

    const elementId = decodeURIComponent(
      location.hash.slice(1),
    );

    let attempts = 0;
    let timeoutId: number | undefined;

    const scrollToElement = () => {
      const element = document.getElementById(elementId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        return;
      }

      attempts += 1;

      if (attempts < MAX_ATTEMPTS) {
        timeoutId = window.setTimeout(
          scrollToElement,
          RETRY_DELAY,
        );
      }
    };

    scrollToElement();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    location.hash,
    location.key,
    location.pathname,
  ]);

  return null;
}

export default ScrollToHash;