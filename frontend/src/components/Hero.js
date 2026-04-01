import { useEffect, useRef, useState } from 'react';
import './Hero.css';

export default function Hero({ onScroll }) {
  const canvasRef = useRef(null);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setCtaVisible(true), 800);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const lines = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      opacity: Math.random() * 0.3 + 0.05,
    }));

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      lines.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      });

      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          const a = lines[i], b = lines[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const alpha = (1 - dist / 220) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.strokeStyle = `rgba(202,196,184,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="hero">
      <video
        className="hero-video"
        src="https://izzonlab.com/wp-content/uploads/2025/02/IZZON-Lab_Presentacion_EN__baja01.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-bg" />
      <canvas ref={canvasRef} className="hero-canvas" />

      <div className="hero-content">
        <button
          className={`hero-cta ${ctaVisible ? 'hero-cta-in' : ''}`}
          onClick={onScroll}
        >
          Ver contenido
        </button>
      </div>

      <div className="hero-scroll-indicator">
        <span />
      </div>
    </div>
  );
}
