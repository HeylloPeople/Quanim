// Double-Slit Experiment Simulation
// Educational 3D visualization with real wavelengths
// Rotated 90° clockwise: Source at top, barrier horizontal, screen at bottom

let wavelength = 550; // in nanometers
let slitSeparation = 80;
let waveSpeed = 5;
let slitWidth = 15;
let time = 0;

// Canvas dimensions - will be set dynamically
let canvasWidth = 1100;
let canvasHeight = 550;

// Layout
let simWidth = 700;
let graphWidth = 350;
let graphX = simWidth + 30;

function calculateDimensions() {
    const container = document.getElementById('canvas-container');
    const maxWidth = Math.min(window.innerWidth - 40, 1100);

    if (maxWidth < 800) {
        // Mobile: stack layout
        canvasWidth = maxWidth;
        canvasHeight = 700;
        simWidth = canvasWidth;
        graphWidth = canvasWidth - 60;
        graphX = 30;
    } else {
        // Desktop: side-by-side layout  
        canvasWidth = maxWidth;
        const ratio = maxWidth / 1100;
        canvasHeight = Math.floor(550 * ratio);
        simWidth = Math.floor(700 * ratio);
        graphWidth = Math.floor(350 * ratio);
        graphX = simWidth + 30;
    }
}

// Scene positions (now vertical - Y coordinates)
const barrierY = 180;
const screenY = 480;

// Colors
let bgColor, barrierColor, screenColor, textColor, accentColor;

const darkColors = {
    bg: [25, 30, 40],
    barrier: [100, 110, 130],
    screen: [80, 90, 110],
    text: [220, 220, 220],
    accent: [255, 255, 255],
    labelBg: [35, 40, 55],
    labelBorder: [180, 180, 180]
};

const lightColors = {
    bg: [248, 250, 252],
    barrier: [120, 130, 150],
    screen: [150, 160, 180],
    text: [40, 40, 50],
    accent: [0, 0, 0],
    labelBg: [255, 255, 255],
    labelBorder: [80, 80, 80]
};

let colors = lightColors;
let labelBgColor, labelBorderColor;

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
}

function draw() {
    background(bgColor);
    time += 0.05 * waveSpeed;

    const waveColor = wavelengthToColor(wavelength);
    const simWavelength = map(wavelength, 380, 780, 20, 50);

    const centerX = simWidth / 2;
    const slit1X = centerX - slitSeparation / 2;
    const slit2X = centerX + slitSeparation / 2;

    // Draw simulation (rotated 90° clockwise)
    drawWaveSource(waveColor);
    drawIncomingWaves(waveColor, simWavelength);
    drawCircularWaves(slit1X, slit2X, waveColor, simWavelength);
    drawSmoothInterference(slit1X, slit2X, waveColor, simWavelength);
    drawBarrier3D(slit1X, slit2X);
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
    const sourceY = 50;

    for (let r = 35; r > 0; r -= 5) {
        let alpha = map(r, 0, 35, 180, 0);
        fill(waveColor[0], waveColor[1], waveColor[2], alpha);
        noStroke();
        ellipse(sourceX, sourceY, r, r);
    }

    fill(255, 255, 240);
    ellipse(sourceX, sourceY, 12, 12);
    pop();
}

// Horizontal wave fronts moving downward
function drawIncomingWaves(waveColor, simWavelength) {
    push();
    stroke(waveColor[0], waveColor[1], waveColor[2], 60);
    strokeWeight(2);

    for (let y = 80; y < barrierY - 20; y += simWavelength) {
        let phase = (y - time * 3) % simWavelength;
        if (phase < 0) phase += simWavelength;
        let waveY = y - phase;

        if (waveY > 60 && waveY < barrierY - 25) {
            let alpha = map(waveY, barrierY - 80, barrierY - 25, 60, 10);
            alpha = constrain(alpha, 10, 60);
            stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
            line(80, waveY, simWidth - 80, waveY);
        }
    }
    pop();
}

// Circular waves expanding downward from slits
function drawCircularWaves(slit1X, slit2X, waveColor, simWavelength) {
    push();
    noFill();

    const maxRadius = screenY - barrierY + 50;

    for (let r = 0; r < maxRadius; r += simWavelength) {
        let radius = (r + time * 3) % maxRadius;

        if (radius > 10) {
            let alpha = map(radius, 0, maxRadius, 100, 0);
            alpha = constrain(alpha, 0, 100);

            stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
            strokeWeight(1.5);

            drawWaveArc(slit1X, barrierY + 15, radius);
            drawWaveArc(slit2X, barrierY + 15, radius);
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

        if (py > y && py < screenY - 10 && px > 45 && px < simWidth - 45) {
            vertex(px, py);
        }
    }
    endShape();
}

// Smooth interference using gradients (rotated)
function drawSmoothInterference(slit1X, slit2X, waveColor, simWavelength) {
    push();
    noStroke();

    const resX = 4;
    const resY = 4;

    for (let x = 50; x < simWidth - 50; x += resX) {
        for (let y = barrierY + 30; y < screenY - 15; y += resY) {
            let d1 = dist(x, y, slit1X, barrierY + 15);
            let d2 = dist(x, y, slit2X, barrierY + 15);

            let wave1 = sin(TWO_PI * (d1 / simWavelength - time * 0.3));
            let wave2 = sin(TWO_PI * (d2 / simWavelength - time * 0.3));
            let combined = (wave1 + wave2) / 2;

            let intensity = (combined + 1) / 2;

            let distFade = map(y, barrierY + 30, screenY - 15, 0.2, 0.8);
            let alpha = 40 * intensity * intensity * distFade;

            if (alpha > 2) {
                fill(waveColor[0], waveColor[1], waveColor[2], alpha);
                ellipse(x, y, resX * 1.5, resY * 1.5);
            }
        }
    }
    pop();
}

// Horizontal barrier with slits
function drawBarrier3D(slit1X, slit2X) {
    push();
    const wallThickness = 18;
    const depth3D = 22;
    const leftX = 40;
    const rightX = simWidth - 40;

    const frontCol = barrierColor;
    const topCol = [barrierColor[0] + 30, barrierColor[1] + 30, barrierColor[2] + 30];
    const sideCol = [barrierColor[0] - 15, barrierColor[1] - 15, barrierColor[2] - 15];

    // Left section
    drawHorizontalCuboidSection(leftX, barrierY, slit1X - slitWidth / 2 - leftX, wallThickness, depth3D, frontCol, topCol, sideCol);

    // Middle section (between slits)
    drawHorizontalCuboidSection(slit1X + slitWidth / 2, barrierY, slit2X - slitWidth / 2 - (slit1X + slitWidth / 2), wallThickness, depth3D, frontCol, topCol, sideCol);

    // Right section
    drawHorizontalCuboidSection(slit2X + slitWidth / 2, barrierY, rightX - (slit2X + slitWidth / 2), wallThickness, depth3D, frontCol, topCol, sideCol);

    // Slit glow
    const waveColor = wavelengthToColor(wavelength);
    noFill();
    for (let i = 0; i < 4; i++) {
        let alpha = map(i, 0, 4, 220, 0);
        stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
        strokeWeight(3 - i * 0.6);

        // Slit 1
        line(slit1X - slitWidth / 2 + 2, barrierY, slit1X + slitWidth / 2 - 2, barrierY);
        line(slit1X - slitWidth / 2 + 2, barrierY + wallThickness, slit1X + slitWidth / 2 - 2, barrierY + wallThickness);

        // Slit 2
        line(slit2X - slitWidth / 2 + 2, barrierY, slit2X + slitWidth / 2 - 2, barrierY);
        line(slit2X - slitWidth / 2 + 2, barrierY + wallThickness, slit2X + slitWidth / 2 - 2, barrierY + wallThickness);
    }
    pop();
}

// Draw horizontal cuboid section for barrier
function drawHorizontalCuboidSection(x, y, w, h, d, frontCol, topCol, sideCol) {
    if (w <= 0) return;

    // Front face
    fill(frontCol[0], frontCol[1], frontCol[2]);
    stroke(frontCol[0] - 30, frontCol[1] - 30, frontCol[2] - 30);
    strokeWeight(1);
    rect(x, y, w, h);

    // Top face
    fill(topCol[0], topCol[1], topCol[2]);
    stroke(topCol[0] - 20, topCol[1] - 20, topCol[2] - 20);
    beginShape();
    vertex(x, y);
    vertex(x + w, y);
    vertex(x + w + d * 0.5, y - d * 0.5);
    vertex(x + d * 0.5, y - d * 0.5);
    endShape(CLOSE);

    // Right side face
    fill(sideCol[0], sideCol[1], sideCol[2]);
    stroke(sideCol[0] - 20, sideCol[1] - 20, sideCol[2] - 20);
    beginShape();
    vertex(x + w, y);
    vertex(x + w + d * 0.5, y - d * 0.5);
    vertex(x + w + d * 0.5, y + h - d * 0.5);
    vertex(x + w, y + h);
    endShape(CLOSE);
}

// Horizontal screen at bottom with smooth gradient intensity
function drawScreen3D(slit1X, slit2X, waveColor, simWavelength) {
    push();
    const screenThickness = 15;
    const depth3D = 25;
    const leftX = 40;
    const rightX = simWidth - 40;
    const screenWidth = rightX - leftX;

    const frontCol = screenColor;
    const topCol = [screenColor[0] + 25, screenColor[1] + 25, screenColor[2] + 25];
    const sideCol = [screenColor[0] - 10, screenColor[1] - 10, screenColor[2] - 10];

    // Draw uniform screen base
    fill(frontCol[0], frontCol[1], frontCol[2]);
    stroke(frontCol[0] - 20, frontCol[1] - 20, frontCol[2] - 20);
    strokeWeight(1);
    rect(leftX, screenY, screenWidth, screenThickness);

    // Overlay smooth intensity pattern using thin vertical strips
    noStroke();
    for (let x = leftX; x < rightX; x += 1) {
        let posFromCenter = x - simWidth / 2;

        let d1 = dist(x, screenY, slit1X, barrierY + 15);
        let d2 = dist(x, screenY, slit2X, barrierY + 15);
        let pathDiff = d1 - d2;
        let phase = TWO_PI * pathDiff / simWavelength;
        let intensity = pow(cos(phase / 2), 2);

        // Diffraction envelope
        let theta = atan2(posFromCenter, screenY - barrierY);
        let beta = PI * slitWidth * sin(theta) / simWavelength;
        let envelope = 1;
        if (abs(beta) > 0.01) {
            envelope = pow(sin(beta) / beta, 2);
        }
        intensity *= envelope;
        intensity = constrain(intensity, 0, 1);

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

    // Border
    noFill();
    stroke(topCol[0], topCol[1], topCol[2]);
    strokeWeight(1.5);
    rect(leftX, screenY, screenWidth, screenThickness);

    pop();
}

// Wave intensity graph on the right side (vertical)
function drawWaveGraph(slit1X, slit2X, waveColor, simWavelength) {
    push();

    const graphLeft = graphX;
    const graphRight = width - 40;
    const graphTop = 60;
    const graphBottom = height - 60;
    const graphMidX = graphLeft + 60;

    // Graph background
    fill(colors.bg[0] - 5, colors.bg[1] - 5, colors.bg[2] - 5);
    stroke(barrierColor[0], barrierColor[1], barrierColor[2], 100);
    strokeWeight(1);
    rect(graphLeft - 10, graphTop - 20, graphRight - graphLeft + 20, graphBottom - graphTop + 40, 8);

    // Axis
    stroke(textColor[0], textColor[1], textColor[2], 150);
    strokeWeight(1);
    line(graphMidX, graphTop, graphMidX, graphBottom); // Y axis (position)
    line(graphMidX, graphBottom, graphRight - 10, graphBottom); // X axis (intensity)

    // Axis labels
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text("Intensity", (graphMidX + graphRight - 10) / 2, graphBottom + 25);

    push();
    translate(graphLeft + 20, (graphTop + graphBottom) / 2);
    rotate(-HALF_PI);
    textAlign(CENTER);
    text("Position on Screen", 0, 0);
    pop();

    // Draw intensity curve (horizontal bars from axis)
    noFill();
    stroke(waveColor[0], waveColor[1], waveColor[2]);
    strokeWeight(2.5);

    beginShape();
    for (let py = graphTop; py <= graphBottom; py += 2) {
        // Map graph y to screen x position
        let screenXPos = map(py, graphTop, graphBottom, 40, simWidth - 40);
        let posFromCenter = screenXPos - simWidth / 2;

        let d1 = dist(screenXPos, screenY, slit1X, barrierY + 15);
        let d2 = dist(screenXPos, screenY, slit2X, barrierY + 15);
        let pathDiff = d1 - d2;
        let phase = TWO_PI * pathDiff / simWavelength;
        let intensity = pow(cos(phase / 2), 2);

        // Diffraction envelope
        let theta = atan2(posFromCenter, screenY - barrierY);
        let beta = PI * slitWidth * sin(theta) / simWavelength;
        let envelope = 1;
        if (abs(beta) > 0.01) {
            envelope = pow(sin(beta) / beta, 2);
        }
        intensity *= envelope;
        intensity = constrain(intensity, 0, 1);

        let graphXVal = map(intensity, 0, 1, graphMidX + 5, graphRight - 20);
        vertex(graphXVal, py);
    }
    endShape();

    // Graph title
    textAlign(CENTER);
    textSize(11);
    fill(textColor[0], textColor[1], textColor[2]);
    text("Interference Pattern", (graphLeft + graphRight) / 2, graphTop - 5);

    pop();
}

function drawLabels(waveColor) {
    push();

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(LEFT);
    textSize(12);
    text(`λ = ${wavelength} nm`, 25, 28);

    // Color swatch
    fill(waveColor[0], waveColor[1], waveColor[2]);
    stroke(textColor[0], textColor[1], textColor[2]);
    strokeWeight(1);
    rect(110, 18, 14, 14, 2);

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    text(`d = ${slitSeparation} μm`, 25, 46);

    textAlign(RIGHT);
    textSize(12);
    text("Δ = d·sin(θ) = nλ", simWidth - 25, 28);
    textSize(10);
    text("(constructive interference)", simWidth - 25, 46);

    // Component labels
    drawLabelWithBox("Source", simWidth / 2, 28);
    drawLabelWithBox("Double Slit", simWidth / 2, barrierY + 36);
    drawLabelWithBox("Screen", simWidth / 2, screenY + 35);

    pop();
}

function drawLabelWithBox(txt, x, y) {
    push();

    textSize(11);
    let padding = 5;
    let boxW = textWidth(txt) + padding * 2;
    let boxH = 11 + padding * 2;

    let boxX = constrain(x, boxW / 2 + 15, simWidth - boxW / 2 - 15);

    fill(labelBgColor[0], labelBgColor[1], labelBgColor[2]);
    stroke(labelBorderColor[0], labelBorderColor[1], labelBorderColor[2]);
    strokeWeight(1);
    rectMode(CENTER);
    rect(boxX, y, boxW, boxH, 4);

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
