import { state, faceState } from './state.js';
import { initCamera } from './camera.js';
import { initMediaPipe, sendFrameToCV } from './pipeline.js';
import { initUI, updateUIStatus } from './ui.js';

// Import effects
import { updateParticles } from './hand-effects/particles.js';
import { updateWaves } from './hand-effects/waves.js';
import { updateInk } from './hand-effects/ink.js';

import { drawFaceMesh } from './face-effects/mesh.js';
import { drawAura } from './face-effects/aura.js';
import { drawHalo } from './face-effects/halo.js';
import { drawGlitch } from './face-effects/glitch.js';
import { drawPortal } from './face-effects/portal.js';

// Setup p5.js lifecycle methods and link them to window for global mode
window.setup = function () {
    state.W = windowWidth;
    state.H = windowHeight;
    createCanvas(state.W, state.H);
    colorMode(HSB, 360, 100, 100, 100);

    initUI();
    initCamera().then(success => {
        if (success) {
            initMediaPipe();
        }
    });
};

window.windowResized = function () {
    state.W = windowWidth;
    state.H = windowHeight;
    resizeCanvas(state.W, state.H);

    // Re-init ink grid if active to prevent index out of bounds on resize
    if (state.activeHandMode === 3) {
        import('./hand-effects/ink.js').then(m => m.initInkGrid());
    }
};

window.draw = function () {
    state.frameCount++;
    sendFrameToCV(performance.now());

    // Fade alpha for face
    if (!faceState.detected && faceState.fadeAlpha > 0) {
        faceState.fadeAlpha = Math.max(0, faceState.fadeAlpha - 1 / 20);
    }

    updateUIStatus();

    // Render
    background(3, 10, 3);

    if (state.activeHandMode === 1) updateParticles();
    else if (state.activeHandMode === 2) updateWaves();
    else if (state.activeHandMode === 3) updateInk();

    if (state.activeFaceMode >= 4 && faceState.fadeAlpha > 0) {
        if (state.activeFaceMode === 4) drawFaceMesh();
        else if (state.activeFaceMode === 5) drawAura();
        else if (state.activeFaceMode === 6) drawHalo();
        else if (state.activeFaceMode === 7) drawGlitch();
        else if (state.activeFaceMode === 8) drawPortal();
    }
};
