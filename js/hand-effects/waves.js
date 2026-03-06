import { state, rings, MAX_RINGS } from '../state.js';

export function updateWaves() {
    if (state.handVisible && state.speed > 1 && state.frameCount % 3 === 0) {
        spawnR(state.indexPos.x, state.indexPos.y);
    }

    if (state.handVisible && state.isOpenPalm && !state.wasOpenPalm) {
        [state.thumbPos, state.indexPos, state.middlePos, state.ringPos, state.pinkyPos].forEach(t => spawnR(t.x, t.y));
    }

    noFill();
    for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += 3;
        r.life--;

        const t = r.life / r.maxLife;
        for (let l = 0; l < 3; l++) {
            stroke(190, 10, 100, t * 80 * (1 - l * .3));
            strokeWeight((3 - l) * 1.5);
            ellipse(r.x, r.y, r.radius * 2, r.radius * 2);
        }

        if (r.life <= 0) rings.splice(i, 1);
    }
}

function spawnR(x, y) {
    if (rings.length >= MAX_RINGS) rings.shift();
    rings.push({ x, y, radius: 5, life: 60, maxLife: 60 });
}
