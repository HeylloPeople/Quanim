// Double-Slit Experiment Simulation
// Demonstrates wave interference patterns

let wavelength = 30;
let slitSeparation = 80;
let waveSpeed = 5;
let slitWidth = 15;
let time = 0;

// Canvas dimensions
const canvasWidth = 900;
const canvasHeight = 550;

// Barrier and screen positions
const barrierX = 200;
const screenX = 750;

// Colors - Notion-inspired black and white scheme
let bgColor, waveColor, barrierColor, screenColor, textColor, accentColor;

// Light mode colors (Simple Black & White)
const lightColors = {
    bg: [255, 255, 255],        // White
    wave: [0, 0, 0],            // Black
    barrier: [100, 100, 100],   // Grey
    screen: [200, 200, 200],    // Light Grey
    text: [0, 0, 0],            // Black
    accent: [0, 0, 0],          // Black
    constructive: [100, 100, 100],
    destructive: [200, 200, 200]
};

// Dark mode colors
const darkColors = {
    bg: [0, 0, 0],              // Black
    wave: [255, 255, 255],      // White
    barrier: [150, 150, 150],   // Light Grey
    screen: [50, 50, 50],       // Dark Grey
    text: [255, 255, 255],      // White
    accent: [255, 255, 255],    // White
    constructive: [200, 200, 200],
    destructive: [100, 100, 100]
};

// Current color set
let colors = lightColors;

function updateColors(theme) {
    colors = theme === 'dark' ? darkColors : lightColors;
    bgColor = colors.bg;
    waveColor = colors.wave;
    barrierColor = colors.barrier;
    screenColor = colors.screen;
    textColor = colors.text;
    accentColor = colors.accent;
}

// Initialize with saved theme or light
function initColors() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    updateColors(savedTheme);
}

function setup() {
    // Initialize colors based on saved theme
    initColors();

    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');

    // Setup event listeners for controls
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

    // Calculate slit positions
    const centerY = height / 2;
    const slit1Y = centerY - slitSeparation / 2;
    const slit2Y = centerY + slitSeparation / 2;

    // Draw wave source (left side)
    drawWaveSource();

    // Draw incoming plane waves
    drawPlaneWaves();

    // Draw the barrier with slits
    drawBarrier(slit1Y, slit2Y);

    // Draw interference pattern
    drawInterferencePattern(slit1Y, slit2Y);

    // Draw detection screen
    drawScreen();

    // Draw intensity graph
    drawIntensityGraph(slit1Y, slit2Y);

    // Draw labels
    drawLabels(slit1Y, slit2Y);
}

function drawWaveSource() {
    // Glowing wave source
    for (let r = 40; r > 0; r -= 5) {
        let alpha = map(r, 0, 40, 150, 0);
        fill(waveColor[0], waveColor[1], waveColor[2], alpha);
        noStroke();
        ellipse(30, height / 2, r, r);
    }

    // Core
    fill(accentColor[0], accentColor[1], accentColor[2]);
    noStroke();
    ellipse(30, height / 2, 8, 8);

    // Label
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(11);
    text("Source", 30, height / 2 + 35);
    pop();
}

function drawPlaneWaves() {
    // Draw plane waves before the barrier
    stroke(waveColor[0], waveColor[1], waveColor[2], 80);
    strokeWeight(2);

    for (let x = 60; x < barrierX; x += wavelength) {
        let phase = (x - time * 3) % wavelength;
        if (phase < 0) phase += wavelength;
        let waveX = x - phase;

        if (waveX > 50 && waveX < barrierX - 5) {
            // Fade near the barrier
            let alpha = map(waveX, barrierX - 50, barrierX, 80, 20);
            alpha = constrain(alpha, 20, 80);
            stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
            line(waveX, 30, waveX, height - 30);
        }
    }
}

function drawBarrier(slit1Y, slit2Y) {
    // Main barrier
    fill(barrierColor);
    noStroke();

    // Top section
    rect(barrierX - 8, 0, 16, slit1Y - slitWidth / 2);

    // Middle section (between slits)
    rect(barrierX - 8, slit1Y + slitWidth / 2, 16, slitSeparation - slitWidth);

    // Bottom section
    rect(barrierX - 8, slit2Y + slitWidth / 2, 16, height - (slit2Y + slitWidth / 2));

    // Slit highlighting (glowing edges)
    for (let i = 0; i < 3; i++) {
        let alpha = map(i, 0, 3, 100, 0);
        stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
        strokeWeight(2 - i * 0.5);

        // Slit 1
        line(barrierX - 8 + i, slit1Y - slitWidth / 2, barrierX + 8 - i, slit1Y - slitWidth / 2);
        line(barrierX - 8 + i, slit1Y + slitWidth / 2, barrierX + 8 - i, slit1Y + slitWidth / 2);

        // Slit 2
        line(barrierX - 8 + i, slit2Y - slitWidth / 2, barrierX + 8 - i, slit2Y - slitWidth / 2);
        line(barrierX - 8 + i, slit2Y + slitWidth / 2, barrierX + 8 - i, slit2Y + slitWidth / 2);
    }
}

function drawInterferencePattern(slit1Y, slit2Y) {
    // Draw circular waves emanating from each slit
    noFill();

    const maxRadius = screenX - barrierX + 100;

    for (let r = 0; r < maxRadius; r += wavelength) {
        let radius = (r + time * 3) % maxRadius;

        if (radius > 5) {
            // Calculate alpha based on distance
            let alpha = map(radius, 0, maxRadius, 120, 0);
            alpha = constrain(alpha, 0, 120);

            stroke(waveColor[0], waveColor[1], waveColor[2], alpha);
            strokeWeight(2);

            // Draw arcs from slit 1 (only the right half)
            drawWaveArc(barrierX, slit1Y, radius);

            // Draw arcs from slit 2 (only the right half)
            drawWaveArc(barrierX, slit2Y, radius);
        }
    }

    // Draw interference highlights
    drawInterferenceHighlights(slit1Y, slit2Y);
}

function drawWaveArc(x, y, radius) {
    // Draw semi-circular wave from a slit
    beginShape();
    for (let angle = -PI / 2; angle <= PI / 2; angle += 0.05) {
        let px = x + cos(angle) * radius;
        let py = y + sin(angle) * radius;

        // Only draw if within bounds and past the barrier
        if (px > barrierX + 10 && px < screenX && py > 20 && py < height - 20) {
            vertex(px, py);
        }
    }
    endShape();
}

function drawInterferenceHighlights(slit1Y, slit2Y) {
    // Show constructive/destructive interference points
    loadPixels();

    const resolution = 4;

    for (let x = barrierX + 30; x < screenX - 10; x += resolution) {
        for (let y = 30; y < height - 30; y += resolution) {
            // Calculate distances to each slit
            let d1 = dist(x, y, barrierX, slit1Y);
            let d2 = dist(x, y, barrierX, slit2Y);

            // Path difference
            let pathDiff = abs(d1 - d2);

            // Phase difference (normalized to wavelength)
            let phaseDiff = (pathDiff % wavelength) / wavelength;

            // Wave amplitude at this point
            let wave1 = sin(TWO_PI * (d1 / wavelength - time * 0.3));
            let wave2 = sin(TWO_PI * (d2 / wavelength - time * 0.3));
            let combinedAmplitude = (wave1 + wave2) / 2;

            // Color based on interference
            let intensity = map(combinedAmplitude, -1, 1, 0, 1);

            // Draw subtle interference field
            let alpha = 30 * intensity * intensity;
            let distFade = map(x, barrierX + 30, screenX - 10, 0.5, 1);
            alpha *= distFade;

            if (alpha > 5) {
                noStroke();
                if (combinedAmplitude > 0) {
                    fill(colors.constructive[0], colors.constructive[1], colors.constructive[2], alpha);
                } else {
                    fill(colors.destructive[0], colors.destructive[1], colors.destructive[2], alpha * 0.5);
                }
                rect(x, y, resolution, resolution);
            }
        }
    }
}

function drawScreen() {
    // Detection screen
    fill(screenColor);
    stroke(80, 80, 120);
    strokeWeight(2);
    rect(screenX - 5, 20, 10, height - 40, 3);

    // Screen glow
    for (let i = 0; i < 5; i++) {
        noFill();
        stroke(waveColor[0], waveColor[1], waveColor[2], 30 - i * 5);
        strokeWeight(1);
        rect(screenX - 5 - i, 20 - i, 10 + i * 2, height - 40 + i * 2, 3);
    }
}

function drawIntensityGraph(slit1Y, slit2Y) {
    // Draw intensity distribution on the screen
    const graphX = screenX + 20;
    const graphWidth = 100;

    // Background for graph
    fill(colors.bg[0], colors.bg[1], colors.bg[2], 230);
    noStroke();
    rect(graphX, 20, graphWidth, height - 40, 8);

    // Graph border
    stroke(waveColor[0], waveColor[1], waveColor[2], 100);
    strokeWeight(1);
    noFill();
    rect(graphX, 20, graphWidth, height - 40, 8);

    // Calculate and draw intensity
    beginShape();
    noFill();
    stroke(waveColor[0], waveColor[1], waveColor[2]);
    strokeWeight(2);

    for (let y = 30; y < height - 30; y += 2) {
        // Calculate interference intensity at this point on the screen
        let d1 = dist(screenX, y, barrierX, slit1Y);
        let d2 = dist(screenX, y, barrierX, slit2Y);

        let pathDiff = d1 - d2;
        let phase = TWO_PI * pathDiff / wavelength;

        // Intensity is proportional to cos^2(phase/2)
        let intensity = pow(cos(phase / 2), 2);

        // Add single slit diffraction envelope
        let theta1 = atan2(y - slit1Y, screenX - barrierX);
        let theta2 = atan2(y - slit2Y, screenX - barrierX);
        let avgTheta = (theta1 + theta2) / 2;

        let beta = PI * slitWidth * sin(avgTheta) / wavelength;
        let envelope = 1;
        if (abs(beta) > 0.01) {
            envelope = pow(sin(beta) / beta, 2);
        }

        intensity *= envelope;

        let graphValue = graphX + 10 + intensity * (graphWidth - 20);
        vertex(graphValue, y);
    }
    endShape();

    // Intensity label
    push();
    translate(graphX + graphWidth / 2, height - 10);
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(11);
    text("Intensity", 0, 0);
    pop();

    // Draw intensity bars on screen
    for (let y = 30; y < height - 30; y += 3) {
        let d1 = dist(screenX, y, barrierX, slit1Y);
        let d2 = dist(screenX, y, barrierX, slit2Y);

        let pathDiff = d1 - d2;
        let phase = TWO_PI * pathDiff / wavelength;
        let intensity = pow(cos(phase / 2), 2);

        // Add diffraction envelope
        let theta = atan2(y - height / 2, screenX - barrierX);
        let beta = PI * slitWidth * sin(theta) / wavelength;
        let envelope = 1;
        if (abs(beta) > 0.01) {
            envelope = pow(sin(beta) / beta, 2);
        }
        intensity *= envelope;

        // Draw on screen - grayscale based on intensity
        let brightness = intensity * 255;
        stroke(brightness, brightness, brightness, 220);
        strokeWeight(3);
        point(screenX, y);
    }
}

function drawLabels(slit1Y, slit2Y) {
    // Use push/pop to isolate text styling
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(11);

    // Barrier label
    text("Double Slit", barrierX, height - 10);
    pop();

    // Slit labels
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textSize(10);

    textAlign(CENTER);
    text("Slit 1", barrierX + 30, slit1Y - 10);
    text("Slit 2", barrierX + 30, slit2Y + 15);
    pop();

    // Screen label
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(10);
    text("Screen", screenX, height - 10);
    pop();

    // Physics info
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(LEFT);
    textSize(10);
    text(`λ = ${wavelength}px`, 15, 25);
    text(`d = ${slitSeparation}px`, 15, 40);
    pop();

    // Equation
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(RIGHT);
    textSize(11);
    text("Δ = d·sin(θ) = nλ", screenX - 30, 25);
    textSize(9);
    text("(constructive interference)", screenX - 30, 38);
    pop();
}

// Resize handling
function windowResized() {
    // Keep canvas at fixed size for consistent simulation
}
