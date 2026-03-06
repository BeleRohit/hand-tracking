import { state, faceState, pipelineState, SMOOTH_WINDOW, FACE_SMOOTH, CV_INTERVAL, dismissOnboarding } from './state.js';

let mpHands, mpFace;
const JAW_INDICES = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

export function initMediaPipe() {
    const locateFile = (f) => {
        if (f.includes('face_mesh')) return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`;
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}`;
    };

    mpHands = new window.Hands({ locateFile });
    mpHands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
    mpHands.onResults(onHandResults);

    mpFace = new window.FaceMesh({ locateFile });
    mpFace.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
    mpFace.onResults(onFaceResults);

    pipelineState.pipelineReady = true;
}

export async function sendFrameToCV(ts) {
    if (!pipelineState.pipelineReady || pipelineState.cvBusy) return;
    if (ts - pipelineState.lastCVTime < CV_INTERVAL) return;
    pipelineState.lastCVTime = ts;
    pipelineState.cvBusy = true;

    const videoEl = document.getElementById('webcam');
    if (!videoEl || videoEl.videoWidth === 0) {
        pipelineState.cvBusy = false;
        return;
    }

    try {
        await Promise.all([
            mpHands.send({ image: videoEl }),
            mpFace.send({ image: videoEl })
        ]);
    } catch (e) {
        console.error("MediaPipe Error:", e);
    }
    pipelineState.cvBusy = false;
}

function smoothLandmarks(history, count) {
    const n = history.length; if (n === 0) return [];
    const r = [];
    for (let i = 0; i < count; i++) {
        let sx = 0, sy = 0, sz = 0;
        for (let f = 0; f < n; f++) {
            sx += history[f][i].x; sy += history[f][i].y; sz += history[f][i].z
        }
        r.push({ x: sx / n, y: sy / n, z: sz / n })
    }
    return r;
}

function onHandResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        pipelineState.landmarkHistory.push(lm.map(l => ({ x: l.x, y: l.y, z: l.z })));
        if (pipelineState.landmarkHistory.length > SMOOTH_WINDOW) pipelineState.landmarkHistory.shift();

        const sm = smoothLandmarks(pipelineState.landmarkHistory, 21);
        const tc = p => ({ x: (1 - p.x) * state.W, y: p.y * state.H });

        state.prevIndexPos.x = state.indexPos.x; state.prevIndexPos.y = state.indexPos.y;
        const idx = tc(sm[8]); state.indexPos.x = idx.x; state.indexPos.y = idx.y;
        const th = tc(sm[4]); state.thumbPos.x = th.x; state.thumbPos.y = th.y;
        const md = tc(sm[12]); state.middlePos.x = md.x; state.middlePos.y = md.y;
        const rn = tc(sm[16]); state.ringPos.x = rn.x; state.ringPos.y = rn.y;
        const pk = tc(sm[20]); state.pinkyPos.x = pk.x; state.pinkyPos.y = pk.y;

        state.velocity.x = state.indexPos.x - state.prevIndexPos.x;
        state.velocity.y = state.indexPos.y - state.prevIndexPos.y;
        state.speed = Math.sqrt(state.velocity.x ** 2 + state.velocity.y ** 2);

        state.wasPinching = state.isPinching;
        state.isPinching = Math.sqrt((th.x - idx.x) ** 2 + (th.y - idx.y) ** 2) < 40;

        state.wasOpenPalm = state.isOpenPalm;
        const tips = [th, idx, md, rn, pk]; let ts2 = 0, pr = 0;
        for (let i = 0; i < 5; i++)for (let j = i + 1; j < 5; j++) { ts2 += Math.sqrt((tips[i].x - tips[j].x) ** 2 + (tips[i].y - tips[j].y) ** 2); pr++ }
        state.isOpenPalm = (ts2 / pr) > 120;

        state.handVisible = true;
        dismissOnboarding();
    } else {
        state.handVisible = false;
        state.isPinching = false;
        state.isOpenPalm = false;
    }
}

function onFaceResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const lm = results.multiFaceLandmarks[0];
        pipelineState.faceLmHistory.push(lm.map(l => ({ x: l.x, y: l.y, z: l.z })));
        if (pipelineState.faceLmHistory.length > FACE_SMOOTH) pipelineState.faceLmHistory.shift();

        const sm = smoothLandmarks(pipelineState.faceLmHistory, 468);
        const tc = p => ({ x: (1 - p.x) * state.W, y: p.y * state.H });

        faceState.prevCenter.x = faceState.center.x; faceState.prevCenter.y = faceState.center.y;
        faceState.center = tc(sm[168]); faceState.noseTip = tc(sm[1]);
        faceState.foreheadCenter = tc(sm[10]); faceState.chinCenter = tc(sm[152]);
        faceState.leftEye = tc(sm[33]); faceState.rightEye = tc(sm[263]);
        faceState.leftCheek = tc(sm[234]); faceState.rightCheek = tc(sm[454]);

        const ul = tc(sm[13]), ll = tc(sm[14]);
        faceState.mouthCenter = { x: (ul.x + ll.x) / 2, y: (ul.y + ll.y) / 2 };
        faceState.faceWidth = Math.sqrt((faceState.leftEye.x - faceState.rightEye.x) ** 2 + (faceState.leftEye.y - faceState.rightEye.y) ** 2);
        faceState.faceHeight = Math.sqrt((faceState.foreheadCenter.x - faceState.chinCenter.x) ** 2 + (faceState.foreheadCenter.y - faceState.chinCenter.y) ** 2);
        faceState.headTiltAngle = Math.atan2(faceState.rightEye.y - faceState.leftEye.y, faceState.rightEye.x - faceState.leftEye.x);

        const lipDist = Math.abs(ll.y - ul.y);
        faceState.mouthOpenRatio = faceState.faceHeight > 0 ? lipDist / faceState.faceHeight : 0;
        faceState.prevMouthOpen = faceState.isMouthOpen;
        faceState.isMouthOpen = faceState.mouthOpenRatio > 0.06;

        // Blink
        const eyeTop = sm[159].y, eyeBot = sm[145].y, eyeL = sm[33].x, eyeR = sm[133].x;
        const earL = Math.abs(eyeTop - eyeBot) / (Math.abs(eyeL - eyeR) || 0.001);
        faceState.prevBlinkLeft = faceState.blinkLeft; faceState.blinkLeft = earL < 0.15;
        const eyeTop2 = sm[386].y, eyeBot2 = sm[374].y, eyeL2 = sm[263].x, eyeR2 = sm[362].x;
        const earR = Math.abs(eyeTop2 - eyeBot2) / (Math.abs(eyeL2 - eyeR2) || 0.001);
        faceState.prevBlinkRight = faceState.blinkRight; faceState.blinkRight = earR < 0.15;

        // Brow raise
        const lbo = tc(sm[55]), leo = tc(sm[33]);
        faceState.eyebrowRaiseLeft = faceState.faceHeight > 0 ? (leo.y - lbo.y) / faceState.faceHeight : 0;
        const rbo = tc(sm[285]), reo = tc(sm[263]);
        faceState.eyebrowRaiseRight = faceState.faceHeight > 0 ? (reo.y - rbo.y) / faceState.faceHeight : 0;
        faceState.prevBrowRaise = faceState.isBrowRaise;
        faceState.isBrowRaise = faceState.eyebrowRaiseLeft > 0.12 || faceState.eyebrowRaiseRight > 0.12;
        faceState.headVelocity = Math.sqrt((faceState.center.x - faceState.prevCenter.x) ** 2 + (faceState.center.y - faceState.prevCenter.y) ** 2);

        faceState.landmarks = sm;
        faceState.jawOutline = JAW_INDICES.map(i => tc(sm[i]));

        faceState.detected = true;
        faceState.fadeAlpha = 1;
        dismissOnboarding();
    } else {
        faceState.detected = false;
    }
}
