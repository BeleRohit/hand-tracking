import { state, particles, MAX_PARTICLES } from '../state.js';

export function updateParticles() {
    if (state.handVisible && state.speed > 2) {
        const c = Math.min(5, Math.floor(state.speed / 3) + 2);
        for (let i = 0; i < c; i++) spawnP(state.indexPos.x, state.indexPos.y, state.velocity.x * .3 + random(-1.5, 1.5), state.velocity.y * .3 + random(-1.5, 1.5), random(3, 7));
    }
    if (state.handVisible && state.isPinching && !state.wasPinching) {
        for (let i = 0; i < 40; i++) {
            const a = random(TWO_PI), s = random(2, 8);
            spawnP(state.indexPos.x, state.indexPos.y, cos(a) * s, sin(a) * s, random(4, 10));
        }
    }

    noStroke();
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= .97;
        p.vy *= .97;
        p.life--;

        const t = p.life / p.maxLife;
        // Uses p5.js global functions (fill, map, ellipse)
        fill(map(p.sp, 0, 30, 180, 300), 80, 95, t * 80);
        ellipse(p.x, p.y, p.size * t, p.size * t);

        if (p.life <= 0) particles.splice(i, 1);
    }
}

function spawnP(x, y, vx, vy, sz) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push({ x, y, vx, vy, life: 60, maxLife: 60, size: sz, sp: state.speed });
}
