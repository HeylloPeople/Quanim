// Double-Slit Experiment Simulation
// Educational 3D visualization with real wavelengths
// Features: Observer effect, properly scaled elements, rectangular slit cutouts

let wavelength = 550; // in nanometers
let slitSeparation = 80;
let waveSpeed = 5;
let slitWidth = 15;
let time = 0;

// Observer state
let observerActive = false;
let observerAnimation = 0;
let particleMode = false; // When observer is active, show particles instead of waves

// Canvas dimensions - base dimensions at scale 1.0
const BASE_WIDTH = 1100;
const BASE_HEIGHT = 550;
const BASE_SIM_WIDTH = 700;
const BASE_GRAPH_WIDTH = 350;

// Actual canvas dimensions (scaled)
let canvasWidth = BASE_WIDTH;
let canvasHeight = BASE_HEIGHT;
let simWidth = BASE_SIM_WIDTH;
let graphWidth = BASE_GRAPH_WIDTH;
let graphX = simWidth + 30;
let graphY = 0; // New variable for graph Y position
let scaleFactor = 1;
let isVertical = false; // New flag for layout mode

// Scene positions (base values at scale 1.0)
const BASE_BARRIER_Y = 180;
const BASE_SCREEN_Y = 480;
const BASE_SOURCE_Y = 50;

// Scaled scene positions
let barrierY = BASE_BARRIER_Y;
let screenY = BASE_SCREEN_Y;
let sourceY = BASE_SOURCE_Y;

function calculateDimensions() {
    // New layout logic:
    // Controls take up 20% area on the right (min 260px)
    // Left Padding is 10%
    // Right padding is minimal (20px)

    // Determine controls width based on CSS logic (20% or min 260px)
    let controlsWidth = 0;
    if (window.innerWidth > 900) {
        controlsWidth = Math.max(window.innerWidth * 0.20, 260);
    }

    const paddingLeft = window.innerWidth * 0.10;
    const paddingRight = 20; // Minimal right padding
    const gap = 24;

    // Canvas width is remaining space
    let targetWidth;
    let targetHeight;

    if (window.innerWidth > 900) {
        targetWidth = Math.floor(window.innerWidth - paddingLeft - paddingRight - controlsWidth - gap);
        targetHeight = window.innerHeight - 180; // height minus header/padding
    } else {
        // Mobile/Tablet: Stacked layout (90% width approx)
        targetWidth = Math.floor(window.innerWidth * 0.90);
        targetHeight = 500; // Fixed height
    }

    scaleFactor = targetWidth / BASE_SIM_WIDTH;
    simWidth = targetWidth;

    // Graph below simulation inside canvas
    graphWidth = simWidth;
    // Calculate graph height based on remaining space in targetHeight
    // Base Sim Height uses up some portion.. let's try to fit it all
    // Or just let height be determined by scale and ensure it fits?

    // Actually, let's fix height to targetHeight and scale contents to fit?
    // Or just set canvasHeight to targetHeight and layout components inside.

    // Let's stick to the scaling logic but constrain height
    let calculatedSimHeight = Math.floor(BASE_HEIGHT * scaleFactor);
    let calculatedGraphHeight = Math.min(Math.floor(250 * scaleFactor), targetHeight - calculatedSimHeight - 20);

    // If graph height is too small, we might need to reduce scale
    if (calculatedGraphHeight < 100) {
        // Scale is too big for height, recalculate based on height
        // This serves as a "contain" fit
        const maxContentHeight = targetHeight - 120; // 100px min for graph
        const contentBaseHeight = BASE_HEIGHT;
        // simplistic re-scale if needed, but width-based usually works fine for wide layouts
    }

    canvasWidth = simWidth;
    canvasHeight = calculatedSimHeight + calculatedGraphHeight + 20;

    // Ensure we don't exceed targetHeight (scrolling constraint)
    if (canvasHeight > targetHeight && window.innerWidth > 900) {
        // Re-calculate scale to fit height
        const totalBaseHeight = BASE_HEIGHT + 250 + 20; // sim + graph + gap
        // Max height available
        const maxH = targetHeight;
        scaleFactor = maxH / totalBaseHeight;

        // Re-apply widths
        simWidth = Math.floor(BASE_SIM_WIDTH * scaleFactor);
        canvasWidth = simWidth;
        canvasHeight = maxH;

        // update heights
        calculatedSimHeight = Math.floor(BASE_HEIGHT * scaleFactor);
        calculatedGraphHeight = maxH - calculatedSimHeight - 20;
    }

    graphX = 0;
    graphY = calculatedSimHeight + 20;

    // Update positions
    barrierY = Math.floor(BASE_BARRIER_Y * scaleFactor);
    screenY = Math.floor(BASE_SCREEN_Y * scaleFactor);
    sourceY = Math.floor(BASE_SOURCE_Y * scaleFactor);
}

// Helper function to scale values
function s(value) {
    return value * scaleFactor;
}

// Colors
let bgColor, barrierColor, screenColor, textColor, accentColor;
let labelBgColor, labelBorderColor;

const darkColors = {
    bg: [25, 30, 40],
    barrier: [100, 110, 130],
    screen: [80, 90, 110],
    text: [220, 220, 220],
    accent: [255, 255, 255],
    labelBg: [35, 40, 55],
    labelBorder: [180, 180, 180],
    observer: [255, 200, 100]
};

const lightColors = {
    bg: [248, 250, 252],
    barrier: [120, 130, 150],
    screen: [150, 160, 180],
    text: [40, 40, 50],
    accent: [0, 0, 0],
    labelBg: [255, 255, 255],
    labelBorder: [80, 80, 80],
    observer: [200, 150, 50]
};

let colors = lightColors;

// Convert wavelength (nm) to RGB
function wavelengthToColor(wl) {
    let r, g, b;

    if (wl >= 380 && wl < 440) {
        r = -(wl - 440) / (440 - 380);
        g = 0;
        b = 1;
    } else if (wl >= 440 && wl < 490) {
        r = 0;
        g = (wl - 440) / (490 - 440);
        b = 1;
    } else if (wl >= 490 && wl < 510) {
        r = 0;
        g = 1;
        b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
        r = (wl - 510) / (580 - 510);
        g = 1;
        b = 0;
    } else if (wl >= 580 && wl < 645) {
        r = 1;
        g = -(wl - 645) / (645 - 580);
        b = 0;
    } else if (wl >= 645 && wl <= 780) {
        r = 1;
        g = 0;
        b = 0;
    } else {
        r = 0; g = 0; b = 0;
    }

    let factor;
    if (wl >= 380 && wl < 420) {
        factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
    } else if (wl >= 420 && wl <= 700) {
        factor = 1.0;
    } else if (wl > 700 && wl <= 780) {
        factor = 0.3 + 0.7 * (780 - wl) / (780 - 700);
    } else {
        factor = 0;
    }

    return [
        Math.round(r * factor * 255),
        Math.round(g * factor * 255),
        Math.round(b * factor * 255)
    ];
}

function updateColors(theme) {
    colors = theme === 'dark' ? darkColors : lightColors;
    bgColor = colors.bg;
    barrierColor = colors.barrier;
    screenColor = colors.screen;
    textColor = colors.text;
    accentColor = colors.accent;
    labelBgColor = colors.labelBg;
    labelBorderColor = colors.labelBorder;
}

function initColors() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    updateColors(savedTheme);
}

function setup() {
    initColors();
    calculateDimensions();
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');

    // Slider event listeners
    document.getElementById('wavelengthSlider').addEventListener('input', function () {
        wavelength = parseInt(this.value);
        document.getElementById('wavelengthValue').textContent = this.value;
    });

    document.getElementById('slitSepSlider').addEventListener('input', function () {
        slitSeparation = parseInt(this.value);
        document.getElementById('slitSepValue').textContent = this.value;
    });

    document.getElementById('speedSlider').addEventListener('input', function () {
        waveSpeed = parseInt(this.value);
        document.getElementById('speedValue').textContent = this.value;
    });

    document.getElementById('slitWidthSlider').addEventListener('input', function () {
        slitWidth = parseInt(this.value);
        document.getElementById('slitWidthValue').textContent = this.value;
    });

    // Observer toggle
    const observerBtn = document.getElementById('observerBtn');
    if (observerBtn) {
        observerBtn.addEventListener('click', function () {
            observerActive = !observerActive;
            observerAnimation = 1;
            this.textContent = observerActive ? '👁 Observer ON' : '👁 Observer OFF';
            this.classList.toggle('active', observerActive);
        });
    }
}

function windowResized() {
    calculateDimensions();
    resizeCanvas(canvasWidth, canvasHeight);
}

function draw() {
    background(bgColor);
    time += 0.05 * waveSpeed;

    // Update observer animation
    if (observerAnimation > 0) {
        observerAnimation -= 0.03;
    }

    const waveColor = wavelengthToColor(wavelength);
    const simWavelength = map(wavelength, 380, 780, s(20), s(50));

    // Scale slit positions
    const scaledSlitSep = s(slitSeparation);
    const centerX = simWidth / 2;
    const slit1X = centerX - scaledSlitSep / 2;
    const slit2X = centerX + scaledSlitSep / 2;

    // Draw simulation
    drawWaveSource(waveColor);

    if (observerActive) {
        // Particle behavior when observed
        drawParticles(slit1X, slit2X, waveColor);
        drawObserver(slit1X, slit2X);
    } else {
        // Wave behavior when not observed
        drawIncomingWaves(waveColor, simWavelength);
        drawCircularWaves(slit1X, slit2X, waveColor, simWavelength);
        drawSmoothInterference(slit1X, slit2X, waveColor, simWavelength);
    }

    drawBarrier3D(slit1X, slit2X, waveColor);
    drawScreen3D(slit1X, slit2X, waveColor, simWavelength);

    // Draw graph on the right side
    drawWaveGraph(slit1X, slit2X, waveColor, simWavelength);

    // Labels
    drawLabels(waveColor);
}

// Wave source at top center
function drawWaveSource(waveColor) {
    push();
    const sourceX = simWidth / 2;

    for (let r = s(35); r > 0; r -= s(5)) {
        let alpha = map(r, 0, s(35), 180, 0);
        fill(waveColor[0], waveColor[1], waveColor[2], alpha);
        noStroke();
        ellipse(sourceX, sourceY, r, r);
    }

    fill(255, 255, 240);
    ellipse(sourceX, sourceY, s(12), s(12));
    pop();
}

// Horizontal wave fronts moving downward
function drawIncomingWaves(waveColor, simWavelength) {
    push();
    stroke(waveColor[0], waveColor[1], waveColor[2], 60);
    strokeWeight(s(2));

    for (let y = s(80); y < barrierY - s(20); y += simWavelength) {
        let phase = (y - time * s(3)) % simWavelength;
        if (phase < 0) phase += simWavelength;
        let waveY = y - phase;

        if (waveY > s(60) && waveY < barrierY - s(25)) {
            let alpha = map(waveY, barrierY - s(80), barrierY - s(25), 60, 10);
            alpha = constrain(alpha, 10, 60);
            stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
            line(s(80), waveY, simWidth - s(80), waveY);
        }
    }
    pop();
}

// Circular waves expanding downward from slits
function drawCircularWaves(slit1X, slit2X, waveColor, simWavelength) {
    push();
    noFill();

    const maxRadius = screenY - barrierY + s(50);
    const slitExitY = barrierY + s(18);

    for (let r = 0; r < maxRadius; r += simWavelength) {
        let radius = (r + time * s(3)) % maxRadius;

        if (radius > s(10)) {
            let alpha = map(radius, 0, maxRadius, 100, 0);
            alpha = constrain(alpha, 0, 100);

            stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
            strokeWeight(s(1.5));

            drawWaveArc(slit1X, slitExitY, radius);
            drawWaveArc(slit2X, slitExitY, radius);
        }
    }
    pop();
}

// Draw wave arc expanding downward
function drawWaveArc(x, y, radius) {
    beginShape();
    for (let angle = 0; angle <= PI; angle += 0.03) {
        let px = x + cos(angle - HALF_PI) * radius;
        let py = y + sin(angle - HALF_PI) * radius;

        if (py > y && py < screenY - s(10) && px > s(45) && px < simWidth - s(45)) {
            vertex(px, py);
        }
    }
    endShape();
}

// Smooth interference pattern
function drawSmoothInterference(slit1X, slit2X, waveColor, simWavelength) {
    push();
    noStroke();

    const resX = s(4);
    const resY = s(4);
    const slitExitY = barrierY + s(18);

    for (let x = s(50); x < simWidth - s(50); x += resX) {
        for (let y = barrierY + s(30); y < screenY - s(15); y += resY) {
            let d1 = dist(x, y, slit1X, slitExitY);
            let d2 = dist(x, y, slit2X, slitExitY);

            let wave1 = sin(TWO_PI * (d1 / simWavelength - time * 0.3));
            let wave2 = sin(TWO_PI * (d2 / simWavelength - time * 0.3));
            let combined = (wave1 + wave2) / 2;

            let intensity = (combined + 1) / 2;

            let distFade = map(y, barrierY + s(30), screenY - s(15), 0.2, 0.8);
            let alpha = 40 * intensity * intensity * distFade;

            if (alpha > 2) {
                fill(waveColor[0], waveColor[1], waveColor[2], alpha);
                ellipse(x, y, resX * 1.5, resY * 1.5);
            }
        }
    }
    pop();
}

// Draw particles when observer is active
function drawParticles(slit1X, slit2X, waveColor) {
    push();

    // Draw particle streams going through ONE slit (random choice per particle)
    const numParticles = 15;

    for (let i = 0; i < numParticles; i++) {
        // Each particle has a consistent random seed based on time
        let seed = (time * 0.5 + i * 0.7) % 1;
        let particleTime = (time + i * 0.3) % 3;

        // Choose which slit (deterministic based on seed)
        let chosenSlit = seed < 0.5 ? slit1X : slit2X;

        // Particle trajectory
        let startY = sourceY + s(20);
        let endY = screenY - s(5);
        let progress = particleTime / 3;

        if (progress < 1) {
            let particleY;
            let particleX;

            if (progress < 0.35) {
                // Moving toward barrier
                particleY = lerp(startY, barrierY - s(5), progress / 0.35);
                particleX = lerp(simWidth / 2, chosenSlit, progress / 0.35);
            } else if (progress < 0.45) {
                // Through the slit
                particleY = lerp(barrierY - s(5), barrierY + s(20), (progress - 0.35) / 0.1);
                particleX = chosenSlit;
            } else {
                // After slit - straight line to screen
                let afterProgress = (progress - 0.45) / 0.55;
                particleY = lerp(barrierY + s(20), endY, afterProgress);
                // Small random spread after slit
                let spread = (seed - 0.5) * s(30) * afterProgress;
                particleX = chosenSlit + spread;
            }

            // Draw particle with glow
            for (let r = s(12); r > 0; r -= s(3)) {
                let alpha = map(r, 0, s(12), 200, 0);
                fill(waveColor[0], waveColor[1], waveColor[2], alpha);
                noStroke();
                ellipse(particleX, particleY, r, r);
            }

            fill(255, 255, 240);
            ellipse(particleX, particleY, s(4), s(4));
        }
    }

    pop();
}

// Draw observer (eye icon) near the slits
function drawObserver(slit1X, slit2X) {
    push();

    const observerX = simWidth / 2;
    const observerY = barrierY - s(50);
    const eyeSize = s(40);

    // Glow effect
    let pulseSize = 1; // Removed pulsation: + sin(time * 3) * 0.1;

    for (let r = eyeSize * 1.5; r > 0; r -= s(5)) {
        let alpha = map(r, 0, eyeSize * 1.5, 80, 0);
        fill(colors.observer[0], colors.observer[1], colors.observer[2], alpha);
        noStroke();
        ellipse(observerX, observerY, r * pulseSize, r * 0.6 * pulseSize);
    }

    // Eye shape
    fill(255, 255, 255);
    stroke(colors.observer[0], colors.observer[1], colors.observer[2]);
    strokeWeight(s(2));
    ellipse(observerX, observerY, eyeSize * pulseSize, eyeSize * 0.6 * pulseSize);

    // Pupil
    fill(40, 40, 50);
    noStroke();
    ellipse(observerX, observerY, eyeSize * 0.4 * pulseSize, eyeSize * 0.4 * pulseSize);

    // Highlight
    fill(255);
    ellipse(observerX - s(5), observerY - s(3), s(6), s(6));

    // Observation lines to slits
    stroke(colors.observer[0], colors.observer[1], colors.observer[2], 100);
    strokeWeight(s(1));
    drawingContext.setLineDash([s(5), s(5)]);
    line(observerX, observerY + eyeSize * 0.3, slit1X, barrierY);
    line(observerX, observerY + eyeSize * 0.3, slit2X, barrierY);
    drawingContext.setLineDash([]);

    // Label
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(s(10));
    text("Observer", observerX, observerY - eyeSize * 0.5);

    pop();
}

function drawBarrier3D(slit1X, slit2X, waveColor) {
    push();
    const wallThickness = s(20);
    const depth3D = s(25);
    const leftX = s(40);
    const rightX = simWidth - s(40);
    const scaledSlitWidth = s(slitWidth);

    const frontCol = barrierColor;
    const topCol = [barrierColor[0] + 30, barrierColor[1] + 30, barrierColor[2] + 30];
    const sideCol = [barrierColor[0] - 15, barrierColor[1] - 15, barrierColor[2] - 15];

    // Helper to draw a 3D cuboid
    function drawCuboid(x, y, w, h, d) {
        // Top face
        fill(topCol[0], topCol[1], topCol[2]);
        stroke(topCol[0] - 20, topCol[1] - 20, topCol[2] - 20);
        strokeWeight(1);
        beginShape();
        vertex(x, y);
        vertex(x + w, y);
        vertex(x + w + d * 0.5, y - d * 0.5);
        vertex(x + d * 0.5, y - d * 0.5);
        endShape(CLOSE);

        // Front face
        fill(frontCol[0], frontCol[1], frontCol[2]);
        stroke(frontCol[0] - 30, frontCol[1] - 30, frontCol[2] - 30);
        rect(x, y, w, h);

        // Right side face (visible if we are on the left or looking right)
        // For simple blocks, we always draw the right side for 3D effect?
        // Actually, we should only draw the side if it's an end block or creates a gap.

        fill(sideCol[0], sideCol[1], sideCol[2]);
        stroke(sideCol[0] - 20, sideCol[1] - 20, sideCol[2] - 20);
        beginShape();
        vertex(x + w, y);
        vertex(x + w + d * 0.5, y - d * 0.5);
        vertex(x + w + d * 0.5, y + h - d * 0.5);
        vertex(x + w, y + h);
        endShape(CLOSE);
    }

    // 1. Left Cuboid (from left edge to slit 1 start)
    drawCuboid(leftX, barrierY, slit1X - scaledSlitWidth / 2 - leftX, wallThickness, depth3D);

    // 2. Middle Cuboid (between slits)
    drawCuboid(slit1X + scaledSlitWidth / 2, barrierY, slit2X - scaledSlitWidth / 2 - (slit1X + scaledSlitWidth / 2), wallThickness, depth3D);

    // 3. Right Cuboid (from slit 2 end to right edge)
    drawCuboid(slit2X + scaledSlitWidth / 2, barrierY, rightX - (slit2X + scaledSlitWidth / 2), wallThickness, depth3D);

    pop();
}

// Horizontal screen at bottom with interference pattern
function drawScreen3D(slit1X, slit2X, waveColor, simWavelength) {
    push();
    const screenThickness = s(15);
    const depth3D = s(25);
    const leftX = s(40);
    const rightX = simWidth - s(40);
    const screenWidth = rightX - leftX;
    const slitExitY = barrierY + s(18);

    const frontCol = screenColor;
    const topCol = [screenColor[0] + 25, screenColor[1] + 25, screenColor[2] + 25];
    const sideCol = [screenColor[0] - 10, screenColor[1] - 10, screenColor[2] - 10];

    // Draw uniform screen base
    fill(frontCol[0], frontCol[1], frontCol[2]);
    stroke(frontCol[0] - 20, frontCol[1] - 20, frontCol[2] - 20);
    strokeWeight(1);
    rect(leftX, screenY, screenWidth, screenThickness);

    // Overlay intensity pattern
    noStroke();
    for (let x = leftX; x < rightX; x += 1) {
        let posFromCenter = x - simWidth / 2;
        let intensity;

        if (observerActive) {
            // When observed: two bands (no interference)
            let dist1 = abs(x - slit1X);
            let dist2 = abs(x - slit2X);
            let bandWidth = s(40);
            intensity = exp(-pow(dist1 / bandWidth, 2)) + exp(-pow(dist2 / bandWidth, 2));
            intensity = constrain(intensity, 0, 1);
        } else {
            // Normal interference pattern
            let d1 = dist(x, screenY, slit1X, slitExitY);
            let d2 = dist(x, screenY, slit2X, slitExitY);
            let pathDiff = d1 - d2;
            let phase = TWO_PI * pathDiff / simWavelength;
            intensity = pow(cos(phase / 2), 2);

            // Diffraction envelope
            let theta = atan2(posFromCenter, screenY - barrierY);
            let beta = PI * s(slitWidth) * sin(theta) / simWavelength;
            let envelope = 1;
            if (abs(beta) > 0.01) {
                envelope = pow(sin(beta) / beta, 2);
            }
            intensity *= envelope;
            intensity = constrain(intensity, 0, 1);
        }

        // Blend colors
        let r = lerp(frontCol[0], waveColor[0] + 100, intensity);
        let g = lerp(frontCol[1], waveColor[1] + 100, intensity);
        let b = lerp(frontCol[2], waveColor[2] + 100, intensity);
        r = constrain(r, 0, 255);
        g = constrain(g, 0, 255);
        b = constrain(b, 0, 255);

        fill(r, g, b);
        rect(x, screenY, 1, screenThickness);
    }

    // Top face
    fill(topCol[0], topCol[1], topCol[2]);
    stroke(topCol[0] - 20, topCol[1] - 20, topCol[2] - 20);
    strokeWeight(1);
    beginShape();
    vertex(leftX, screenY);
    vertex(rightX, screenY);
    vertex(rightX + depth3D * 0.5, screenY - depth3D * 0.5);
    vertex(leftX + depth3D * 0.5, screenY - depth3D * 0.5);
    endShape(CLOSE);

    // Right side face
    fill(sideCol[0], sideCol[1], sideCol[2]);
    stroke(sideCol[0] - 20, sideCol[1] - 20, sideCol[2] - 20);
    beginShape();
    vertex(rightX, screenY);
    vertex(rightX + depth3D * 0.5, screenY - depth3D * 0.5);
    vertex(rightX + depth3D * 0.5, screenY + screenThickness - depth3D * 0.5);
    vertex(rightX, screenY + screenThickness);
    endShape(CLOSE);

    pop();
}

// Wave intensity graph
function drawWaveGraph(slit1X, slit2X, waveColor, simWavelength) {
    push();

    // Force vertical layout params
    const graphLeft = graphX + s(40);
    const graphRight = canvasWidth - s(40);
    const graphTop = graphY + s(40);
    const graphBottom = canvasHeight - s(40);
    const graphMidY = graphBottom; // Intensity 0 is at the bottom
    const splitExitY = barrierY + s(18);

    // Graph background
    fill(colors.bg[0] - 5, colors.bg[1] - 5, colors.bg[2] - 5);
    stroke(barrierColor[0], barrierColor[1], barrierColor[2], 100);
    strokeWeight(1);
    rect(graphLeft - s(10), graphTop - s(20), graphRight - graphLeft + s(20), graphBottom - graphTop + s(30), s(8));

    // Axis
    stroke(textColor[0], textColor[1], textColor[2], 150);
    strokeWeight(1);
    // X-axis (Position)
    line(graphLeft, graphBottom, graphRight, graphBottom);
    // Y-axis (Intensity)
    line(graphLeft, graphBottom, graphLeft, graphTop);

    // Axis labels
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textSize(s(10));
    textAlign(CENTER);
    text("Position on Screen", (graphLeft + graphRight) / 2, graphBottom + s(20));

    push();
    translate(graphLeft - s(20), (graphTop + graphBottom) / 2);
    rotate(-HALF_PI);
    textAlign(CENTER);
    text("Intensity", 0, 0);
    pop();

    // Draw intensity curve
    noFill();
    stroke(waveColor[0], waveColor[1], waveColor[2]);
    strokeWeight(s(2.5));

    beginShape();
    for (let px = graphLeft; px <= graphRight; px += 2) {
        // Map graph X back to Simulation X (Screen Width)
        // Ensure misalignment is minimized by mapping graph width to sim width
        let screenXPos = map(px, graphLeft, graphRight, s(40), simWidth - s(40));
        let posFromCenter = screenXPos - simWidth / 2;
        let intensity;

        if (observerActive) {
            // Two bands pattern
            let dist1 = abs(screenXPos - slit1X);
            let dist2 = abs(screenXPos - slit2X);
            let bandWidth = s(40);
            intensity = exp(-pow(dist1 / bandWidth, 2)) + exp(-pow(dist2 / bandWidth, 2));
            intensity = constrain(intensity, 0, 1);
        } else {
            let d1 = dist(screenXPos, screenY, slit1X, splitExitY);
            let d2 = dist(screenXPos, screenY, slit2X, splitExitY);
            let pathDiff = d1 - d2;
            let phase = TWO_PI * pathDiff / simWavelength;
            intensity = pow(cos(phase / 2), 2);

            let theta = atan2(posFromCenter, screenY - barrierY);
            let beta = PI * s(slitWidth) * sin(theta) / simWavelength;
            let envelope = 1;
            if (abs(beta) > 0.01) {
                envelope = pow(sin(beta) / beta, 2);
            }
            intensity *= envelope;
            intensity = constrain(intensity, 0, 1);
        }

        // Map intensity (0-1) to Y position (Bottom to Top)
        let graphYPos = map(intensity, 0, 1, graphBottom - s(2), graphTop + s(20));
        vertex(px, graphYPos);
    }
    endShape();

    // Graph title
    textAlign(CENTER);
    textSize(s(11));
    noStroke();
    fill(textColor[0], textColor[1], textColor[2]);
    let title = observerActive ? "Particle Pattern (Observed)" : "Interference Pattern";
    text(title, (graphLeft + graphRight) / 2, graphTop - s(5));

    pop();
}

function drawLabels(waveColor) {
    push();

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(LEFT);
    textSize(s(12));
    text(`λ = ${wavelength} nm`, s(25), s(28));

    // Color swatch
    fill(waveColor[0], waveColor[1], waveColor[2]);
    stroke(textColor[0], textColor[1], textColor[2]);
    strokeWeight(1);
    rect(s(110), s(18), s(14), s(14), s(2));

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    text(`d = ${slitSeparation} μm`, s(25), s(46));

    textAlign(RIGHT);
    textSize(s(12));
    text("Δ = d·sin(θ) = nλ", simWidth - s(25), s(28));
    textSize(s(10));
    text("(constructive interference)", simWidth - s(25), s(46));

    // Component labels
    drawLabelWithBox("Source", simWidth / 2, s(28));
    drawLabelWithBox("Double Slit", simWidth / 2, barrierY + s(40));
    drawLabelWithBox("Screen", simWidth / 2, screenY + s(30));

    pop();
}

function drawLabelWithBox(txt, x, y) {
    push();

    textSize(s(11));
    let padding = s(5);
    let boxW = textWidth(txt) + padding * 2;
    let boxH = s(11) + padding * 2;

    let boxX = constrain(x, boxW / 2 + s(15), simWidth - boxW / 2 - s(15));

    fill(labelBgColor[0], labelBgColor[1], labelBgColor[2]);
    stroke(labelBorderColor[0], labelBorderColor[1], labelBorderColor[2]);
    strokeWeight(1);
    rectMode(CENTER);
    rect(boxX, y, boxW, boxH, s(4));

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER, CENTER);
    text(txt, boxX, y + 1);

    pop();
}

function windowResized() {
    calculateDimensions();
    resizeCanvas(canvasWidth, canvasHeight);
}
