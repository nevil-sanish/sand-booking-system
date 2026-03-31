import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ShuffleText from '../animations/ShuffleText';

export default function SplashScreen({ onComplete }) {
  const containerRef = useRef(null);
  const [phase, setPhase] = useState('enter'); // 'enter' | 'hold' | 'exit'

  useEffect(() => {
    // Phase 1: Enter - show the text with animation
    const enterTimer = setTimeout(() => setPhase('hold'), 800);
    
    // Phase 2: Hold - display for a moment
    const holdTimer = setTimeout(() => setPhase('exit'), 2800);
    
    // Phase 3: Exit - fade out and call onComplete
    const exitTimer = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.1,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => onComplete?.()
        });
      }
    }, 3200);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a0f0a',
        overflow: 'hidden',
      }}
    >
      {/* Animated particles background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(226,161,111,0.12) 0%, transparent 70%)',
      }} />

      {/* Floating sand particles */}
      <SandParticles />



      {/* Title with ShuffleText */}
      <div style={{
        fontSize: '42px',
        fontWeight: 800,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color: '#FFF0DD',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(30px)' : 'translateY(0)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s',
        fontFamily: 'var(--font-family)',
        textAlign: 'center',
      }}>
        <ShuffleText text="MULLONKAL" className="splash-title" />
      </div>

      <div style={{
        fontSize: '48px',
        fontWeight: 800,
        letterSpacing: '8px',
        textTransform: 'uppercase',
        color: '#E2A16F',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(30px)' : 'translateY(0)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s',
        fontFamily: 'var(--font-family)',
        textAlign: 'center',
      }}>
        <ShuffleText text="SAND" className="splash-title" />
      </div>

      {/* Subtitle */}
      <p style={{
        marginTop: '16px',
        fontSize: '13px',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'rgba(255,240,221,0.4)',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(20px)' : 'translateY(0)',
        transition: 'all 0.6s ease 0.8s',
        fontFamily: 'var(--font-family)',
      }}>
        Premium Sand Delivery
      </p>

      {/* Loading bar */}
      <div style={{
        position: 'absolute',
        bottom: '60px',
        width: '120px',
        height: '2px',
        background: 'rgba(255,240,221,0.1)',
        borderRadius: '1px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #E2A16F, #FFF0DD)',
          borderRadius: '1px',
          animation: 'splashLoad 2.8s ease-in-out forwards',
        }} />
      </div>

      <style>{`
        @keyframes splashLoad {
          0% { width: 0%; }
          30% { width: 40%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function SandParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.5 - 0.1,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 161, 111, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
}
