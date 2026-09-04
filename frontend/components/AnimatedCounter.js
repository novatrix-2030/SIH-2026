'use client';

import { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({ value, duration = 1200, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
  const isDecimal = String(value).includes('.');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setDisplayValue(numericValue);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime = null;

          const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = easeProgress * numericValue;

            setDisplayValue(isDecimal ? current.toFixed(1) : Math.floor(current));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setDisplayValue(isDecimal ? numericValue.toFixed(1) : numericValue);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [numericValue, duration, hasAnimated, isDecimal]);

  return (
    <span ref={ref}>
      {prefix}{hasAnimated ? displayValue : (isDecimal ? (0).toFixed(1) : 0)}{suffix}
    </span>
  );
}
