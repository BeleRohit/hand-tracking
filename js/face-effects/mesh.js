import { state, faceState } from '../state.js';

export function drawFaceMesh() {
    if (!faceState.landmarks) return;

    const a = faceState.fadeAlpha;
    const ctx = drawingContext; // p5.js global
    const lm = faceState.landmarks;
    const tc = p => ({ x: (1 - p.x) * state.W, y: p.y * state.H });

    // Tesselation triangles — draw as wireframe
    const meshColor = faceState.isMouthOpen ? 'rgba(255,0,170,' : 'rgba(0,245,255,';
    ctx.strokeStyle = meshColor + (0.25 * a) + ')';
    ctx.lineWidth = 0.5;

    // Draw connections between adjacent landmarks (simplified mesh grid)
    const meshPairs = [[10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10], [33, 133], [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133], [263, 362], [263, 466], [466, 388], [388, 387], [387, 386], [386, 385], [385, 384], [384, 398], [398, 362], [13, 14], [78, 308], [78, 191], [308, 415], [0, 17], [61, 291], [39, 269], [37, 267], [185, 405], [40, 270]];

    for (const [i, j] of meshPairs) {
        const a2 = tc(lm[i]), b2 = tc(lm[j]);
        ctx.beginPath();
        ctx.moveTo(a2.x, a2.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();
    }

    // Face contour
    ctx.strokeStyle = meshColor + (0.6 * a) + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < faceState.jawOutline.length; i++) {
        const p = faceState.jawOutline[i];
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    // Scanline
    const fw = faceState.faceWidth * 1.2, fh = faceState.faceHeight;
    const ft = faceState.foreheadCenter.y - fh * 0.1;
    const scanSpeed = faceState.isMouthOpen ? 6 : 2;
    const scanY = ft + ((state.frameCount * scanSpeed) % (fh * 1.2));
    ctx.strokeStyle = meshColor + (0.4 * a) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(faceState.center.x - fw / 2, scanY);
    ctx.lineTo(faceState.center.x + fw / 2, scanY);
    ctx.stroke();

    // Extra scanline on brow raise
    if (faceState.isBrowRaise) {
        const s2 = ft + ((state.frameCount * 3 + fh * 0.6) % (fh * 1.2));
        ctx.beginPath();
        ctx.moveTo(faceState.center.x - fw / 2, s2);
        ctx.lineTo(faceState.center.x + fw / 2, s2);
        ctx.stroke();
    }

    // Crosshair at nose tip
    if (Math.floor(state.frameCount / 30) % 2 === 0) {
        const n = faceState.noseTip;
        ctx.strokeStyle = 'rgba(0,245,255,' + (0.7 * a) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(n.x - 8, n.y); ctx.lineTo(n.x + 8, n.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(n.x, n.y - 8); ctx.lineTo(n.x, n.y + 8); ctx.stroke();
    }

    // Corner brackets
    const bx1 = faceState.center.x - fw / 2, by1 = ft, bx2 = faceState.center.x + fw / 2, by2 = ft + fh * 1.2;
    ctx.strokeStyle = 'rgba(0,245,255,' + (0.5 * a) + ')';
    ctx.lineWidth = 1;
    const bsz = 20;
    [[bx1, by1, bsz, 0, 0, bsz], [bx2, by1, -bsz, 0, 0, bsz], [bx1, by2, bsz, 0, 0, -bsz], [bx2, by2, -bsz, 0, 0, -bsz]].forEach(([x, y, dx1, dy1, dx2, dy2]) => {
        ctx.beginPath();
        ctx.moveTo(x + dx1, y + dy1);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx2, y + dy2);
        ctx.stroke();
    });
}
