'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({
  children,
  variant = 'fade-up', // 'fade-up' | 'scale-up' | 'assemble-left' | 'assemble-right' | 'blur-in' | 'float-up'
  delay = 0, // milliseconds
  duration = 1100, // milliseconds (luxurious slow cinematic animation)
  threshold = 0.12,
  once = false, // Animate smoothly while scrolling both up and down
  className = '',
  style = {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--${variant} ${isVisible ? 'scroll-reveal--visible' : ''} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}

      <style jsx global>{`
        .scroll-reveal {
          opacity: 0;
          will-change: transform, opacity, filter;
          transition-property: transform, opacity, filter;
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Variant: Fade Up (Slow Glide) */
        .scroll-reveal--fade-up {
          transform: translateY(50px);
          opacity: 0;
        }

        /* Variant: Scale Up */
        .scroll-reveal--scale-up {
          transform: scale(0.85) translateY(40px);
          opacity: 0;
        }

        /* Variant: Assemble Left (Cinematic entrance from left) */
        .scroll-reveal--assemble-left {
          transform: translateX(-70px) scale(0.92);
          opacity: 0;
        }

        /* Variant: Assemble Right (Cinematic entrance from right) */
        .scroll-reveal--assemble-right {
          transform: translateX(70px) scale(0.92);
          opacity: 0;
        }

        /* Variant: Float Up & Blur */
        .scroll-reveal--blur-in,
        .scroll-reveal--float-up {
          transform: translateY(40px) scale(0.95);
          filter: blur(10px);
          opacity: 0;
        }

        /* Fully assembled visible state */
        .scroll-reveal--visible {
          opacity: 1 !important;
          transform: translateY(0) translateX(0) scale(1) !important;
          filter: blur(0) !important;
        }
      `}</style>
    </div>
  );
}
