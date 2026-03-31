import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function ShuffleText({ text = '', className = '' }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current || !text) return;
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*";
    const originalText = text.split("");
    const element = containerRef.current;
    
    element.innerHTML = "";
    originalText.forEach(char => {
      const span = document.createElement("span");
      span.innerText = char === " " ? "\u00A0" : chars[Math.floor(Math.random() * chars.length)];
      span.style.opacity = 0;
      element.appendChild(span);
    });

    const spans = element.querySelectorAll("span");
    
    gsap.to(spans, {
      opacity: 1,
      duration: 0.1,
      stagger: 0.05
    });

    spans.forEach((span, i) => {
      if (originalText[i] === " ") return;
      
      let iterations = 0;
      const maxIterations = 10 + i * 1.5;
      
      const interval = setInterval(() => {
        if (iterations >= maxIterations) {
          clearInterval(interval);
          span.innerText = originalText[i];
          span.style.color = "inherit";
        } else {
          span.innerText = chars[Math.floor(Math.random() * chars.length)];
          span.style.color = "var(--color-primary)"; 
          iterations++;
        }
      }, 50);
    });

  }, [text]);

  return <span ref={containerRef} className={className} />;
}
