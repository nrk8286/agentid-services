// Served as a same-origin deferred script. The effect is entirely local and
// decorative: no storage, network requests, pointer capture, or page changes.
function installPublisherWater() {
  "use strict";

  if (!document.body || typeof window.matchMedia !== "function") return;
  if (document.documentElement.hasAttribute("data-gmp-water-ready")) return;
  document.documentElement.setAttribute("data-gmp-water-ready", "true");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const maxRipples = 20;
  const rippleLifetime = 1700;
  const sheenLifetime = 900;
  const pixelBudget = 2400000;
  let canvas = null;
  let context = null;
  let enabled = false;
  let frame = 0;
  let width = 0;
  let height = 0;
  let ripples = [];
  let pointer = null;
  let lastInput = -Infinity;
  let lastEmission = -Infinity;
  let lastPaint = 0;
  let source = null;

  function resize() {
    if (!canvas || !context) return;
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(pixelBudget / (width * height)));
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    // A resize clears the canvas; old coordinates would leave detached wakes.
    clear();
  }

  function clear() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    ripples = [];
    pointer = null;
    source = null;
    lastInput = -Infinity;
    lastEmission = -Infinity;
    lastPaint = 0;
    if (context) context.clearRect(0, 0, width, height);
  }

  function schedule() {
    if (!frame && enabled && !document.hidden) frame = window.requestAnimationFrame(paint);
  }

  function addRipple(x, y, time, strength, angle) {
    if (ripples.length === maxRipples) ripples.shift();
    ripples.push({ x, y, time, strength, angle, phase: x * 0.021 + y * 0.013 });
    source = { x, y };
    lastEmission = time;
  }

  function move(event) {
    if (!enabled || document.hidden || (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen")) return;
    const x = event.clientX;
    const y = event.clientY;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > width || y > height) return;
    const now = performance.now();
    if (!pointer || now - lastInput > sheenLifetime) {
      pointer = { x, y, targetX: x, targetY: y };
      addRipple(x, y, now, 0.65, 0);
    } else {
      pointer.targetX = x;
      pointer.targetY = y;
    }
    lastInput = now;
    schedule();
  }

  function leave(event) {
    // Descendant-to-descendant pointer transitions must not interrupt the wake.
    if (event && event.type === "pointerout" && event.relatedTarget) return;
    if (pointer) {
      pointer.targetX = pointer.x;
      pointer.targetY = pointer.y;
    }
    lastInput = Math.min(lastInput, performance.now() - 180);
  }

  function drawSheen(now) {
    if (!pointer) return;
    const fade = Math.max(0, 1 - (now - lastInput) / sheenLifetime);
    if (!fade) return;
    const x = pointer.x;
    const y = pointer.y;
    const glow = context.createRadialGradient(x - 24, y - 16, 4, x, y, 190);
    glow.addColorStop(0, `rgba(126,231,220,${0.042 * fade})`);
    glow.addColorStop(0.38, `rgba(63,176,192,${0.022 * fade})`);
    glow.addColorStop(1, "rgba(63,176,192,0)");
    context.fillStyle = glow;
    context.fillRect(x - 195, y - 195, 390, 390);

    // Narrow broken reflections give the moving surface a liquid appearance
    // without filling the page with an opaque cursor spotlight.
    const light = context.createLinearGradient(x - 145, y, x + 145, y);
    light.addColorStop(0, "rgba(158,246,237,0)");
    light.addColorStop(0.35, `rgba(158,246,237,${0.055 * fade})`);
    light.addColorStop(0.7, `rgba(129,212,235,${0.027 * fade})`);
    light.addColorStop(1, "rgba(129,212,235,0)");
    context.strokeStyle = light;
    context.lineWidth = 0.8;
    for (let band = -2; band <= 2; band += 1) {
      context.beginPath();
      for (let step = 0; step <= 24; step += 1) {
        const dx = -145 + (290 * step) / 24;
        const envelope = Math.sin((Math.PI * step) / 24);
        const dy = band * 17 + Math.sin(dx / 42 + band * 0.7 + now * 0.0017) * 9 * envelope;
        if (step === 0) context.moveTo(x + dx, y + dy);
        else context.lineTo(x + dx, y + dy);
      }
      context.stroke();
    }
  }

  function traceRipple(ripple, radius, age) {
    context.beginPath();
    const tilt = ripple.angle * 0.035;
    const cosine = Math.cos(tilt);
    const sine = Math.sin(tilt);
    for (let step = 0; step <= 48; step += 1) {
      const angle = (step / 48) * Math.PI * 2;
      const refraction = Math.sin(angle * 3 + ripple.phase + age * 0.0017) * 1.7 + Math.sin(angle * 7 - ripple.phase) * 0.65;
      const dx = Math.cos(angle) * (radius + refraction);
      const dy = Math.sin(angle) * (radius + refraction) * 0.7;
      const x = ripple.x + dx * cosine - dy * sine;
      const y = ripple.y + dx * sine + dy * cosine;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
  }

  function drawRipple(ripple, now) {
    const age = now - ripple.time;
    const fade = Math.pow(Math.max(0, 1 - age / rippleLifetime), 1.7) * ripple.strength;
    const radius = 10 + age * 0.092;
    // Light and shadow stay translucent even when several wakes overlap.
    const reflection = context.createLinearGradient(ripple.x - radius, ripple.y - radius, ripple.x + radius, ripple.y + radius);
    reflection.addColorStop(0, `rgba(190,252,244,${0.19 * fade})`);
    reflection.addColorStop(0.36, `rgba(89,211,207,${0.065 * fade})`);
    reflection.addColorStop(0.62, `rgba(99,199,227,${0.025 * fade})`);
    reflection.addColorStop(1, `rgba(126,233,222,${0.15 * fade})`);
    for (let ring = 0; ring < 2; ring += 1) {
      const ringRadius = radius - ring * 15;
      if (ringRadius < 4) continue;
      traceRipple(ripple, ringRadius + 1.7, age);
      context.strokeStyle = `rgba(0,16,28,${0.065 * fade})`;
      context.lineWidth = 1.5;
      context.stroke();
      traceRipple(ripple, ringRadius, age);
      context.strokeStyle = reflection;
      context.lineWidth = ring === 0 ? 1.05 : 0.65;
      context.stroke();
    }
  }

  function paint(now) {
    frame = 0;
    if (!enabled || document.hidden || !context) return;
    // Avoid drawing at 120/144 Hz when the display refreshes faster than needed.
    if (lastPaint && now - lastPaint < 15) {
      schedule();
      return;
    }
    const delta = lastPaint ? Math.min(50, now - lastPaint) : 16.67;
    lastPaint = now;
    context.clearRect(0, 0, width, height);
    if (pointer) {
      const ease = 1 - Math.exp(-delta / 65);
      pointer.x += (pointer.targetX - pointer.x) * ease;
      pointer.y += (pointer.targetY - pointer.y) * ease;
      const dx = source ? pointer.x - source.x : 0;
      const dy = source ? pointer.y - source.y : 0;
      const distance = Math.hypot(dx, dy);
      if (now - lastInput < 140 && now - lastEmission > 55 && distance > 11) {
        addRipple(pointer.x, pointer.y, now, Math.min(0.95, 0.4 + distance / 120), Math.atan2(dy, dx));
      }
    }
    ripples = ripples.filter((ripple) => now - ripple.time < rippleLifetime);
    drawSheen(now);
    for (const ripple of ripples) drawRipple(ripple, now);
    if (ripples.length || now - lastInput < sheenLifetime) schedule();
    else clear();
  }

  function visibility() {
    if (document.hidden) clear();
  }

  function enableOrDisable() {
    const shouldEnable = !reducedMotion.matches && finePointer.matches;
    if (shouldEnable === enabled) return;
    if (!shouldEnable) {
      enabled = false;
      clear();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", clear);
      canvas?.remove();
      canvas = null;
      context = null;
      return;
    }
    canvas = document.createElement("canvas");
    canvas.id = "gmp-water-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("role", "presentation");
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:0;";
    context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      canvas = null;
      return;
    }
    enabled = true;
    document.body.prepend(canvas);
    resize();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", leave);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", clear);
  }

  reducedMotion.addEventListener("change", enableOrDisable);
  finePointer.addEventListener("change", enableOrDisable);
  enableOrDisable();
}

export const WATER_SCRIPT = `(${installPublisherWater.toString()})();`;
