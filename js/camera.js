export async function initCamera() {
    const videoEl = document.getElementById('webcam');
    const onboardingEl = document.getElementById('onboarding');
    const errorOverlay = document.getElementById('error-overlay');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        videoEl.srcObject = stream;
        await videoEl.play();
        return true; // camera ready
    } catch (e) {
        console.error('Camera:', e);
        if (onboardingEl) onboardingEl.classList.add('hidden');
        if (errorOverlay) errorOverlay.classList.remove('hidden');
        return false;
    }
}
