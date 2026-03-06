import { faceState, haloState, auraState, MAX_HALO } from '../state.js';

export function drawHalo() {
    const a = faceState.fadeAlpha;
    const cx = faceState.center.x, cy = faceState.center.y;
    const fw = faceState.faceWidth;

    if (fw < 1) return;

    // Init orbital particles
    if (!haloState.inited || haloState.particles.length < MAX_HALO) {
        haloState.particles = [];
        for (let i = 0; i < MAX_HALO; i++) {
            const layer = i % 3;
            haloState.particles.push({
                angle: random(TWO_PI),
                orbitRadius: fw * (0.6 + random() * 0.4) * (1 + layer * 0.25),
                speed: random(0.02, 0.06) * (layer === 0 ? 1 : layer === 1 ? 0.8 : 0.6),
                size: random(1, 4),
                hue: random(160, 220),
                zOffset: random() * 0.3,
                layer
            });
        }
        haloState.inited = true;
    }

    // Update orbits
    const speedMult = 1 + faceState.headVelocity * 0.05;
    const orbitSpeedMult = faceState.isMouthOpen ? 2 : 1;
    const tiltA = faceState.headTiltAngle;

    // Sort by layer for depth
    const sorted = [...haloState.particles].sort((a2, b) => a2.layer - b.layer);

    noStroke();
    for (const p of sorted) {
        p.angle += p.speed * speedMult * orbitSpeedMult;
        // Shift hue to gold if mouth open
        if (faceState.isMouthOpen) p.hue += (45 - p.hue) * 0.05;
        else p.hue += (random(160, 220) - p.hue) * 0.01;

        const rawX = Math.cos(p.angle) * p.orbitRadius;
        const rawY = Math.sin(p.angle) * p.orbitRadius * 0.5;
        const rx = rawX * Math.cos(tiltA) - rawY * Math.sin(tiltA);
        const ry = rawX * Math.sin(tiltA) + rawY * Math.cos(tiltA);
        const px = cx + rx, py = cy + ry;
        const alph = (0.3 + p.zOffset) * a * (p.layer === 2 ? 1 : p.layer === 1 ? 0.7 : 0.4) * 80;

        fill(p.hue, 70, 95, alph);
        ellipse(px, py, p.size, p.size);
    }

    // Blink burst from eyes (adds to aura particles array)
    if (faceState.blinkLeft && !faceState.prevBlinkLeft) {
        for (let i = 0; i < 30; i++) {
            const ang = random(TWO_PI);
            auraState.particles.push({ x: faceState.leftEye.x, y: faceState.leftEye.y, vx: cos(ang) * random(1, 4), vy: sin(ang) * random(1, 4), life: 30, maxLife: 30, size: random(1, 3), hue: 190 });
        }
    }
    if (faceState.blinkRight && !faceState.prevBlinkRight) {
        for (let i = 0; i < 30; i++) {
            const ang = random(TWO_PI);
            auraState.particles.push({ x: faceState.rightEye.x, y: faceState.rightEye.y, vx: cos(ang) * random(1, 4), vy: sin(ang) * random(1, 4), life: 30, maxLife: 30, size: random(1, 3), hue: 190 });
        }
    }

    // Brow raise crown burst
    if (faceState.isBrowRaise && !faceState.prevBrowRaise) {
        for (let i = 0; i < 20; i++) {
            auraState.particles.push({ x: faceState.foreheadCenter.x + random(-fw * 0.3, fw * 0.3), y: faceState.foreheadCenter.y, vx: random(-1, 1), vy: random(-4, -1), life: 40, maxLife: 40, size: random(2, 5), hue: 50 });
        }
    }

    // Note: draw burst particles logic is handled in drawAura() or here depending on activity
    // In the original, it was duplicated to ensure they draw even if Aura mode is off.
    noStroke();
    for (let i = auraState.particles.length - 1; i >= 0; i--) {
        const p = auraState.particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        const t = p.life / p.maxLife;
        fill(p.hue, 70, 95, t * 60 * a);
        ellipse(p.x, p.y, p.size * t, p.size * t);
        if (p.life <= 0) auraState.particles.splice(i, 1);
    }
    if (auraState.particles.length > 300) auraState.particles.splice(0, auraState.particles.length - 300);
}
