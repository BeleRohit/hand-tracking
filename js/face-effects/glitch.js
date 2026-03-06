import { state, faceState, glitchState } from '../state.js';

export function drawGlitch() {
    if (!faceState.landmarks) return;

    const a = faceState.fadeAlpha;
    const ctx = drawingContext;
    const jaw = faceState.jawOutline;

    // Chromatic aberration — 3 offset contours
    const offsets = [[3, 0, 'rgba(255,0,0,'], [0, 0, 'rgba(0,255,0,'], [-3, 0, 'rgba(0,100,255,']];
    const opacities = [0.4, 0.3, 0.4];

    offsets.forEach(([ox, oy, col], idx) => {
        ctx.strokeStyle = col + (opacities[idx] * a) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        jaw.forEach((p, i) => i === 0 ? ctx.moveTo(p.x + ox, p.y + oy) : ctx.lineTo(p.x + ox, p.y + oy));
        ctx.closePath();
        ctx.stroke();
    });

    // Glitch bars
    const glitchFreq = faceState.isMouthOpen ? 5 : 20;
    if (glitchState.timer <= 0) {
        glitchState.timer = Math.floor(random(15, glitchFreq + 10));
        glitchState.duration = Math.floor(random(4, 8));
        glitchState.bars = [];
        const n = Math.floor(random(3, 7));
        const ft = faceState.foreheadCenter.y - faceState.faceHeight * 0.1;
        for (let i = 0; i < n; i++) {
            glitchState.bars.push({
                y: ft + random() * faceState.faceHeight * 1.2,
                h: random(4, 14),
                color: ['#ff00aa', '#00f5ff', '#fff', '#ffd700'][Math.floor(random(4))],
                op: random(0.15, 0.4),
                jitter: 0
            });
        }
    }
    glitchState.timer--;

    if (glitchState.duration > 0) {
        glitchState.duration--;
        const fw = faceState.faceWidth * 1.3;
        glitchState.bars.forEach(b => {
            b.jitter = random(-8, 8);
            ctx.fillStyle = b.color;
            ctx.globalAlpha = b.op * a;
            ctx.fillRect(faceState.center.x - fw / 2 + b.jitter, b.y, fw, b.h);
        });
        ctx.globalAlpha = 1;
    }

    // Biometric text
    const tCol = 'rgba(0,245,255,' + (0.5 * a) + ')';
    ctx.fillStyle = tCol;
    ctx.font = "8px 'Courier New'";

    if (state.frameCount % 60 < 3) {
        glitchState.percents = ['' + (95 + Math.random() * 5).toFixed(1), '' + (95 + Math.random() * 5).toFixed(1)];
    }

    const flickerHide = Math.floor(random(0, 4));
    const flickerOn = (state.frameCount % 10) > 2;

    const texts = [
        [faceState.leftEye.x - 50, faceState.leftEye.y - 10, 'EYE-L: ' + glitchState.percents[0] + '%'],
        [faceState.rightEye.x + 10, faceState.rightEye.y - 10, 'EYE-R: ' + glitchState.percents[1] + '%'],
        [faceState.chinCenter.x - 30, faceState.chinCenter.y + 20, 'ID: [REDACTED]'],
        [faceState.foreheadCenter.x - 20, faceState.foreheadCenter.y - 15, 'SCAN: ACTIVE']
    ];

    if (faceState.isMouthOpen) {
        texts.forEach(t => {
            t[2] = t[2].split('').map(c => random() < 0.4 ? String.fromCharCode(33 + Math.floor(random() * 93)) : c).join('');
        });
    }

    texts.forEach((t, i) => {
        if (i === flickerHide && !flickerOn) return;
        ctx.fillText(t[2], t[0], t[1]);
    });

    // Blink flash
    if ((faceState.blinkLeft && !faceState.prevBlinkLeft) || (faceState.blinkRight && !faceState.prevBlinkRight)) {
        const fw2 = faceState.faceWidth * 1.2, fh2 = faceState.faceHeight * 1.2;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.25 * a) + ')';
        ctx.fillRect(faceState.center.x - fw2 / 2, faceState.foreheadCenter.y - fh2 * 0.1, fw2, fh2);
    }
}
