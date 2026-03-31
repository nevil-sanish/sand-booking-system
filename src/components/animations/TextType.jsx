import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

export default function TextType({ text = '', className = '', delay = 0, speed = 1 }) {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current || !text) return;
    
    const el = textRef.current;
    el.innerHTML = ""; // reset
    
    // Add blinking cursor
    const cursor = document.createElement("span");
    cursor.innerHTML = "|";
    cursor.style.fontWeight = "bold";
    cursor.style.color = "var(--color-primary)";
    
    // GSAP text animation needs to animate text inside a specific span, not over the cursor
    const textSpan = document.createElement("span");
    el.appendChild(textSpan);
    el.appendChild(cursor);

    gsap.to(cursor, {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.5,
      ease: "steps(1)"
    });

    gsap.to(textSpan, {
      duration: text.length * 0.05 * speed,
      text: {
        value: text,
      },
      delay,
      ease: "none",
      onComplete: () => {
        setTimeout(() => {
          gsap.killTweensOf(cursor);
          cursor.style.opacity = 0; // Hide cursor when finished
        }, 2000);
      }
    });

    return () => {
      gsap.killTweensOf(textSpan);
      gsap.killTweensOf(cursor);
    };
  }, [text, delay, speed]);

  return <span ref={textRef} className={className} style={{ display: 'inline-flex', alignItems: 'center' }}></span>;
}
