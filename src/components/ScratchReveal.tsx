"use client";

import { useEffect, useRef, useState } from "react";

// Standalone scratch-to-reveal. No backend. Drag to scratch off the foil
// and reveal the children. Pointer events so it works on mouse and touch.
// Mirrors the portal ScratchCard pattern but stripped to the essentials.

type Props = {
  width?: number;
  height?: number;
  foilText?: string;
  children: React.ReactNode;
};

const REVEAL_THRESHOLD = 0.45;

export function ScratchReveal({
  width = 300,
  height = 110,
  foilText = "SCRATCH",
  children,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const drawing = useRef(false);

  // Paint the foil layer once on mount.
  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use device pixel ratio for sharper foil on retina.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Hot pink foil with diagonal stripes so it looks scratch-card-y.
    ctx.fillStyle = "#F11787";
    ctx.fillRect(0, 0, width, height);

    // Subtle stripes
    ctx.fillStyle = "rgba(255, 244, 250, 0.08)";
    for (let i = -height; i < width; i += 14) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.lineTo(i + height + 6, height);
      ctx.lineTo(i + 6, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#fff4fa";
    ctx.font = "800 22px 'Bricolage Grotesque', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(foilText, width / 2, height / 2);
    ctx.font = "500 11px 'Bricolage Grotesque', system-ui, sans-serif";
    ctx.fillText("drag to reveal", width / 2, height / 2 + 22);
  }, [revealed, width, height, foilText]);

  function scratchAt(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Sample at lower resolution to keep things fast.
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) clear++;
    }
    const fraction = clear / (canvas.width * canvas.height);
    if (fraction > REVEAL_THRESHOLD) {
      setRevealed(true);
    }
  }

  function getXY(e: React.PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function onDown(e: React.PointerEvent) {
    drawing.current = true;
    const p = getXY(e);
    if (p) scratchAt(p.x, p.y);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current) return;
    const p = getXY(e);
    if (p) scratchAt(p.x, p.y);
  }
  function onUp() {
    drawing.current = false;
  }

  return (
    <div
      className="scratch-reveal"
      style={{
        position: "relative",
        width,
        height,
        display: "inline-block",
      }}
    >
      {/* Underneath: the children, visible after scratch */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
          color: "var(--ink)",
          border: "3px solid var(--ink)",
          borderRadius: 12,
          padding: "0 14px",
          textAlign: "center",
        }}
      >
        {children}
      </div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            border: "3px solid var(--ink)",
            cursor: "grab",
            touchAction: "none",
          }}
        />
      )}
    </div>
  );
}
