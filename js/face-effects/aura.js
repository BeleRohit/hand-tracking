import { faceState, auraState } from '../state.js';

export function drawAura() {
    const a = faceState.fadeAlpha;
    const ctx = drawingContext; // p5.js global
    const cx = faceState.center.x, cy = faceState.center.y;
    const fw = faceState.faceWidth, fh = faceState.faceHeight;

    if (fw < 1) return;
    const pad = fw * 0.15;
    const extra = faceState.headVelocity > 5 ? faceState.headVelocity * 2 : 0;

    // Determine color
    let colR = 0, colG = 245, colB = 255;
    if (faceState.isMouthOpen) { colR = 255; colG = 215; colB = 0; }
    if (faceState.isBrowRaise) { colR = 255; colG = 255; colB = 240; }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(faceState.headTiltAngle);

    const layers = [[1.5, 0.04], [1.3, 0.07], [1.15, 0.12]];
    layers.forEach(([sc, op]) => {
        const rx = (fw / 2 + pad + extra) * sc, ry = (fh / 2 + pad + extra) * sc * 0.7;
        ctx.fillStyle = `rgba(${colR},${colG},${colB},${op * a})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // Crisp edge
    const erx = (fw / 2 + pad + extra) * 1.15, ery = (fh / 2 + pad + extra) * 1.15 * 0.7;
    ctx.strokeStyle = `rgba(${colR},${colG},${colB},${0.4 * a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, erx, ery, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Perimeter particles
    if (faceState.detected) {
        for (let i = 0; i < 5; i++) {
            const ang = random(TWO_PI);
            const px = cx + cos(ang) * (fw * 0.8 + extra);
            const py = cy + sin(ang) * (fh * 0.5 + extra);
            auraState.particles.push({
                x: px, y: py,
                vx: cos(ang) * random(0.5, 2), vy: sin(ang) * random(0.5, 2),
                life: 40, maxLife: 40, size: random(2, 5),
                hue: faceState.isMouthOpen ? 45 : 185
            });
        }
    }

    noStroke();
    for (let i = auraState.particles.length - 1; i >= 0; i--) {
        const p = auraState.particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        const t = p.life / p.maxLife;
        fill(p.hue, 70, 95, t * 60 * a);
        ellipse(p.x, p.y, p.size * t, p.size * t);
        if (p.life <= 0) auraState.particles.splice(i, 1);
    }
    if (auraState.particles.length > 200) auraState.particles.splice(0, auraState.particles.length - 200);

    // Electric arcs
    if (faceState.detected && random() < 0.02) {
        const a1 = random(TWO_PI), a2 = a1 + random(0.5, 2);
        auraState.arcs.push({ pts: genArc(cx, cy, fw * 0.8 + extra, fh * 0.5 + extra, a1, a2), life: 3 });
    }
    for (let i = auraState.arcs.length - 1; i >= 0; i--) {
        const arc = auraState.arcs[i];
        arc.life--;
        ctx.strokeStyle = `rgba(${colR},${colG},${colB},${0.7 * a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        arc.pts.forEach((p, j) => j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
        if (arc.life <= 0) auraState.arcs.splice(i, 1);
    }
}

function genArc(cx, cy, rx, ry, a1, a2) {
    const pts = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
        const t = a1 + (a2 - a1) * (i / steps);
        const jx = (Math.random() - 0.5) * 12, jy = (Math.random() - 0.5) * 12;
        pts.push({ x: cx + Math.cos(t) * rx + jx, y: cy + Math.sin(t) * ry + jy });
    }
    return pts;
}
