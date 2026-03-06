export const state = {
  W: 0, H: 0,
  activeHandMode: 1, activeFaceMode: 0,
  onboardingDismissed: false,
  indexPos: { x: 0, y: 0 }, prevIndexPos: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, speed: 0,
  isPinching: false, wasPinching: false, isOpenPalm: false, wasOpenPalm: false,
  handVisible: false, frameCount: 0,
  thumbPos: { x: 0, y: 0 }, middlePos: { x: 0, y: 0 }, ringPos: { x: 0, y: 0 }, pinkyPos: { x: 0, y: 0 }
};

export const faceState = {
  detected: false, landmarks: null, fadeAlpha: 0,
  center: { x: 0, y: 0 }, prevCenter: { x: 0, y: 0 }, foreheadCenter: { x: 0, y: 0 }, chinCenter: { x: 0, y: 0 },
  leftEye: { x: 0, y: 0 }, rightEye: { x: 0, y: 0 }, leftCheek: { x: 0, y: 0 }, rightCheek: { x: 0, y: 0 },
  mouthCenter: { x: 0, y: 0 }, noseTip: { x: 0, y: 0 },
  faceWidth: 0, faceHeight: 0, headTiltAngle: 0, headVelocity: 0,
  mouthOpenRatio: 0, eyebrowRaiseLeft: 0, eyebrowRaiseRight: 0,
  blinkLeft: false, blinkRight: false,
  prevBlinkLeft: false, prevBlinkRight: false,
  prevMouthOpen: false, isMouthOpen: false,
  prevBrowRaise: false, isBrowRaise: false,
  jawOutline: []
};

// Pipeline Internal State
export const pipelineState = {
  pipelineReady: false,
  cvBusy: false,
  lastCVTime: 0,
  landmarkHistory: [],
  faceLmHistory: []
};

export const SMOOTH_WINDOW = 10;
export const FACE_SMOOTH = 5;
export const CV_INTERVAL = 1000 / 20;

// Hand Graphics state
export const MAX_PARTICLES = 500;
export const particles = [];
export const MAX_RINGS = 30;
export const rings = [];
export const INK_COLS = 40;
export const INK_ROWS = 30;
export const inkState = { grid: [], nextGrid: [] };

// Face Graphics state
export const auraState = { particles: [], arcs: [] };
export const MAX_HALO = 120;
export const haloState = { particles: [], inited: false };
export const glitchState = { timer: 0, duration: 0, bars: [], textFlicker: 0, percents: ['98.2', '97.8'] };
export const portalState = { stars: [], tendrils: [], cosmicParts: [], inited: false };

export function dismissOnboarding() {
  if (!state.onboardingDismissed) {
    state.onboardingDismissed = true;
    const el = document.getElementById('onboarding');
    if (el) el.classList.add('hidden');
  }
}
