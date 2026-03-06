import { state, faceState, particles, rings, inkState, auraState, haloState, glitchState, portalState } from './state.js';

let handDot, faceDot, handStatusEl, faceStatusEl, fpsCounter;
let fpsTimes = [];

export function initUI() {
    handDot = document.getElementById('hand-dot');
    faceDot = document.getElementById('face-dot');
    handStatusEl = document.getElementById('hand-status');
    faceStatusEl = document.getElementById('face-status');
    fpsCounter = document.getElementById('fps-counter');

    document.querySelectorAll('[data-hand]').forEach(b => b.addEventListener('click', () => setHandMode(parseInt(b.dataset.hand))));
    document.querySelectorAll('[data-face]').forEach(b => b.addEventListener('click', () => setFaceMode(parseInt(b.dataset.face))));
    document.addEventListener('keydown', e => {
        if (e.key >= '1' && e.key <= '3') setHandMode(parseInt(e.key));
        else if (e.key >= '4' && e.key <= '8') setFaceMode(parseInt(e.key));
        else if (e.key === '0') { setHandMode(0); setFaceMode(0); }
    });
}

function initInkGrid() {
    import('./hand-effects/ink.js').then(module => module.initInkGrid());
}

export function setHandMode(m) {
    state.activeHandMode = m;
    particles.length = 0;
    rings.length = 0;
    if (m === 3) initInkGrid();
    document.querySelectorAll('[data-hand]').forEach(b => b.classList.toggle('active-hand', parseInt(b.dataset.hand) === m));
}

export function setFaceMode(m) {
    state.activeFaceMode = m;
    auraState.particles.length = 0;
    auraState.arcs.length = 0;
    haloState.inited = false;
    portalState.inited = false;
    glitchState.timer = 0;
    document.querySelectorAll('[data-face]').forEach(b => b.classList.toggle('active-face', parseInt(b.dataset.face) === m));
}

export function updateUIStatus() {
    if (!handDot || !faceDot) return;

    handDot.classList.toggle('on', state.handVisible);
    faceDot.classList.toggle('on-face', faceState.detected || faceState.fadeAlpha > 0);

    let hst = 'HAND: ' + (state.handVisible ? 'TRACKING' : '--');
    if (state.handVisible) {
        if (state.isPinching) hst += ' · PINCH';
        else if (state.isOpenPalm) hst += ' · OPEN PALM';
    }
    handStatusEl.textContent = hst;

    let fst = 'FACE: ' + (faceState.detected ? 'DETECTED' : '--');
    if (faceState.detected) {
        if (faceState.isMouthOpen) fst += ' · MOUTH OPEN';
        if (faceState.isBrowRaise) fst += ' · BROW UP';
    }
    faceStatusEl.textContent = fst;

    // FPS
    const now = performance.now();
    fpsTimes.push(now);
    while (fpsTimes.length > 0 && fpsTimes[0] < now - 1000) fpsTimes.shift();
    if (state.frameCount % 15 === 0) fpsCounter.textContent = fpsTimes.length + ' fps';
}
