import { state, faceState, portalState } from '../state.js';

export function drawPortal() {
    if (!faceState.landmarks) return;

    const a = faceState.fadeAlpha;
    const ctx = drawingContext;
    const cx = faceState.center.x, cy = faceState.center.y;
    const fw = faceState.faceWidth, fh = faceState.faceHeight;

    if (fw < 1) return;

    const mouthScale = faceState.isMouthOpen ? 1.2 : 1;
    const rx = fw * 0.7 * mouthScale, ry = fh * 0.55 * mouthScale;

    // Portal ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(faceState.headTiltAngle);
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = -state.frameCount;
    ctx.shadowColor = 'rgba(180,100,255,0.6)';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = `rgba(180,100,255,${0.8 * a})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 30;
    ctx.strokeStyle = `rgba(100,50,200,${0.3 * a})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.setLineDash([]);

    // Brow raise color shift
    if (faceState.isBrowRaise) {
        ctx.strokeStyle = `rgba(0,200,255,${0.6 * a})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx + 3, ry + 3, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();

    // Star field clipped to face oval
    if (!portalState.inited) {
        portalState.stars = [];
        for (let i = 0; i < 80; i++) portalState.stars.push({ ax: random(-1, 1), ay: random(-1, 1), size: random(0.5, 2), op: random(0.3, 0.9), drift: random(0.002, 0.005) });
        portalState.tendrils = [];
        for (let i = 0; i < 6; i++) portalState.tendrils.push({ angle: i * Math.PI / 3, len: 60, speed: 0.01 + random() * 0.01 });
        portalState.cosmicParts = [];
        for (let i = 0; i < 30; i++) portalState.cosmicParts.push({ angle: random(TWO_PI), dist: random(fw * 0.8, fw * 1.5), speed: random(0.5, 2), size: random(1, 3), hue: random(260, 300) });
        portalState.inited = true;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(faceState.headTiltAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx - 2, ry - 2, 0, 0, Math.PI * 2);
    ctx.clip();

    const starBri = faceState.isMouthOpen ? 1.5 : 1;
    const blinkFlicker = (faceState.blinkLeft || faceState.blinkRight) ? 0.3 : 1;

    for (const s of portalState.stars) {
        s.ay += s.drift;
        if (s.ay > 1) s.ay = -1;
        ctx.fillStyle = `rgba(200,220,255,${s.op * a * starBri * blinkFlicker})`;
        ctx.fillRect(s.ax * rx, s.ay * ry, s.size, s.size);
    }
    ctx.restore();

    // Warp tendrils
    for (const t of portalState.tendrils) {
        t.angle += t.speed;
        const elen = t.len + faceState.headVelocity * 3;
        const sx = cx + Math.cos(t.angle) * rx;
        const sy = cy + Math.sin(t.angle) * ry * 0.8;
        const ex = cx + Math.cos(t.angle) * (rx + elen);
        const ey = cy + Math.sin(t.angle) * (ry * 0.8 + elen * 0.6);
        const cpx = sx + (ex - sx) * 0.5 + Math.sin(t.angle * 3) * 20;
        const cpy = sy + (ey - sy) * 0.5 + Math.cos(t.angle * 3) * 20;

        ctx.strokeStyle = `rgba(160,80,255,${0.35 * a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cpx, cpy, ex, ey);
        ctx.stroke();
    }

    if (faceState.isMouthOpen) {
        for (const t of portalState.tendrils) {
            const a2 = t.angle + Math.PI / 6;
            const sx = cx + Math.cos(a2) * rx;
            const sy = cy + Math.sin(a2) * ry * 0.8;
            const ex = cx + Math.cos(a2) * (rx + t.len * 0.7);
            const ey = cy + Math.sin(a2) * (ry * 0.8 + t.len * 0.4);

            ctx.strokeStyle = `rgba(120,60,200,${0.2 * a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo((sx + ex) / 2 + random(-10, 10), (sy + ey) / 2 + random(-10, 10), ex, ey);
            ctx.stroke();
        }
    }

    // Cosmic particles spiraling inward
    noStroke();
    for (const p of portalState.cosmicParts) {
        p.angle += 0.03;
        p.dist -= p.speed;
        if (p.dist < 10) {
            p.dist = random(fw * 0.8, fw * 1.5);
            p.angle = random(TWO_PI);
            // Flash at center
            fill(280, 60, 100, 30 * a);
            ellipse(cx, cy, 8, 8);
        }
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist * 0.6;
        fill(p.hue, 60, 90, (p.dist / (fw * 1.5)) * 70 * a);
        ellipse(px, py, p.size, p.size);
    }
}
