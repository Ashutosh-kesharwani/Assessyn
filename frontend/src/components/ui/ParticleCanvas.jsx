import { useEffect, useRef } from 'react';

export default function ParticleCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ── High-Precision Water Ripple System ───────────────────
    const ripples = [];
    let lastRippleTime = 0;

    const addRipple = (x, y, isClick = false) => {
      const now = Date.now();
      if (!isClick && now - lastRippleTime < 35) return;
      lastRippleTime = now;

      ripples.push({
        x,
        y,
        radius: isClick ? 6 : 4,
        maxRadius: isClick ? 140 : 105,
        opacity: isClick ? 0.75 : 0.5,
        speed: isClick ? 2.4 : 1.7,
        lineWidth: isClick ? 2.2 : 1.4,
      });

      if (ripples.length > 25) ripples.shift();
    };

    const handleMouseMove = (e) => addRipple(e.clientX, e.clientY, false);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        addRipple(e.touches[0].clientX, e.touches[0].clientY, false);
      }
    };
    const handleClick = (e) => addRipple(e.clientX, e.clientY, true);
    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        addRipple(e.touches[0].clientX, e.touches[0].clientY, true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    // ── Floating & Spinning Ninja Shurikens ───────────────────
    const isMobile = width < 768;
    const shurikenCount = isMobile ? 22 : 38;

    const shurikens = Array.from({ length: shurikenCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 8, // Small to medium: 8px to 16px
      speedX: (Math.random() - 0.5) * 0.9 + 0.35,
      speedY: Math.random() * 0.75 + 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.06 + (Math.random() > 0.5 ? 0.03 : -0.03), // Continuous spin
      opacity: Math.random() * 0.45 + 0.3,
      oscillation: Math.random() * Math.PI * 2,
      oscillationSpeed: Math.random() * 0.02 + 0.01,
      points: Math.random() > 0.3 ? 4 : 3, // 4-point and 3-point shurikens
    }));

    // Draw single 4-point or 3-point Ninja Shuriken
    const drawShuriken = (x, y, size, rotation, opacity, color, points = 4) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Outer Shuriken Blades
      ctx.beginPath();
      const numPoints = points;
      const outerR = size;
      const innerR = size * 0.32;

      for (let i = 0; i < numPoints * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / numPoints;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      // Blade Edge Highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.stroke();
      }

      // Center Aperture Ring (Center hole of Shuriken)
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#06060c';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Read current theme CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      const shurikenColor = computedStyle.getPropertyValue('--particle-color').trim() || 'rgba(168, 85, 247, 0.75)';
      const accentPrimary = computedStyle.getPropertyValue('--accent-primary').trim() || '#a855f7';

      // ── 1. Render Concentric Water Touch Ripples ─────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity -= 0.009;

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = accentPrimary;
        ctx.globalAlpha = r.opacity;
        ctx.lineWidth = r.lineWidth;

        // Primary wave ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary echo wave
        if (r.radius > 16) {
          ctx.lineWidth = r.lineWidth * 0.65;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.72, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Tertiary inner liquid ripple
        if (r.radius > 32) {
          ctx.lineWidth = r.lineWidth * 0.35;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.45, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // ── 2. Render Floating & Spinning Ninja Shurikens ─────
      for (let i = 0; i < shurikens.length; i++) {
        const s = shurikens[i];

        s.oscillation += s.oscillationSpeed;
        s.x += s.speedX + Math.sin(s.oscillation) * 0.6;
        s.y += s.speedY;
        s.rotation += s.rotationSpeed;

        // Seamless edge wrap
        if (s.y > height + 25) {
          s.y = -25;
          s.x = Math.random() * width;
        }
        if (s.x > width + 25) s.x = -25;
        if (s.x < -25) s.x = width + 25;

        drawShuriken(s.x, s.y, s.size, s.rotation, s.opacity, shurikenColor, s.points);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
