// Quantum Entanglement Simulation
// Visualizes two entangled particles with correlated measurements
// With proper scaling for responsive design

let particleA = { measured: false, spin: 0 };
let particleB = { measured: false, spin: 0 };
let entangled = true;
let time = 0;
let distance = 300; // Distance between particles
let connectionAnimation = 0;

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

function calculateDimensions() {
    const containerWidth = window.innerWidth - 40;

    // Check for vertical layout (mobile/narrow screens)
    isVertical = containerWidth < 900;

    if (isVertical) {
        // Vertical layout logic
        scaleFactor = containerWidth / BASE_SIM_WIDTH;

        simWidth = Math.floor(BASE_SIM_WIDTH * scaleFactor);

        // In vertical mode, graph goes below simulation
        graphWidth = simWidth; // Graph takes full width
        let graphHeight = Math.floor(250 * scaleFactor);

        canvasWidth = simWidth;
        canvasHeight = Math.floor(BASE_HEIGHT * scaleFactor) + graphHeight + 20;

        graphX = 0;
        graphY = Math.floor(BASE_HEIGHT * scaleFactor) + 20;

    } else {
        // Horizontal layout logic (original)
        if (containerWidth >= BASE_WIDTH) {
            scaleFactor = 1;
        } else {
            scaleFactor = containerWidth / BASE_WIDTH;
        }

        canvasWidth = Math.floor(BASE_WIDTH * scaleFactor);
        canvasHeight = Math.floor(BASE_HEIGHT * scaleFactor);
        simWidth = Math.floor(BASE_SIM_WIDTH * scaleFactor);
        graphWidth = Math.floor(BASE_GRAPH_WIDTH * scaleFactor);
        graphX = simWidth + Math.floor(30 * scaleFactor);
        graphY = 0;
    }
}

// Helper function to scale values
function s(value) {
    return value * scaleFactor;
}

// Colors
let bgColor, textColor, accentColor;

const darkColors = {
    bg: [25, 30, 40],
    text: [220, 220, 220],
    accent: [255, 255, 255],
    particleA: [100, 180, 255],    // Blue
    particleB: [255, 130, 180],    // Pink
    spinUp: [80, 200, 120],        // Green
    spinDown: [255, 100, 100],     // Red
    connection: [180, 130, 255],   // Purple
    labelBg: [35, 40, 55],
    labelBorder: [180, 180, 180]
};

const lightColors = {
    bg: [248, 250, 252],
    text: [40, 40, 50],
    accent: [0, 0, 0],
    particleA: [50, 120, 220],
    particleB: [220, 80, 150],
    spinUp: [40, 160, 80],
    spinDown: [200, 60, 60],
    connection: [140, 80, 200],
    labelBg: [255, 255, 255],
    labelBorder: [80, 80, 80]
};

let colors = lightColors;

function updateColors(theme) {
    colors = theme === 'dark' ? darkColors : lightColors;
    bgColor = colors.bg;
    textColor = colors.text;
    accentColor = colors.accent;
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

    // Distance slider
    document.getElementById('distanceSlider').addEventListener('input', function () {
        distance = parseInt(this.value);
        document.getElementById('distanceValue').textContent = this.value + ' units';
    });

    // Generate pair button
    document.getElementById('generateBtn').addEventListener('click', function () {
        generatePair();
    });

    // Measure A button
    document.getElementById('measureABtn').addEventListener('click', function () {
        if (entangled && !particleA.measured) {
            measureParticle('A');
        }
    });

    // Measure B button
    document.getElementById('measureBBtn').addEventListener('click', function () {
        if (entangled && !particleB.measured) {
            measureParticle('B');
        }
    });
}

function generatePair() {
    particleA = { measured: false, spin: 0 };
    particleB = { measured: false, spin: 0 };
    entangled = true;
    connectionAnimation = 1;
}

function measureParticle(which) {
    // Random measurement result
    let result = random() < 0.5 ? 1 : -1; // Spin up or down

    if (which === 'A') {
        particleA.measured = true;
        particleA.spin = result;
        // Entangled particle B gets opposite spin
        particleB.measured = true;
        particleB.spin = -result;
    } else {
        particleB.measured = true;
        particleB.spin = result;
        // Entangled particle A gets opposite spin
        particleA.measured = true;
        particleA.spin = -result;
    }

    connectionAnimation = 0;
}

function draw() {
    background(bgColor);
    time += 0.02;

    // Update connection animation
    if (entangled && !particleA.measured && connectionAnimation < 1) {
        connectionAnimation = min(1, connectionAnimation + 0.02);
    }

    // Scale distance for drawing
    const scaledDistance = s(distance);

    // Draw simulation
    drawConnection(scaledDistance);
    drawParticleA(scaledDistance);
    drawParticleB(scaledDistance);
    drawDistanceLabels(scaledDistance);

    // Draw correlation chart
    drawCorrelationChart();

    // Draw title
    drawTitle();
}

function drawConnection(scaledDistance) {
    if (!entangled) return;

    push();
    const centerY = height / 2;
    const aX = simWidth / 2 - scaledDistance / 2;
    const bX = simWidth / 2 + scaledDistance / 2;

    // Wavy connection line
    noFill();

    if (!particleA.measured) {
        // Animated entanglement connection
        for (let i = 0; i < 3; i++) {
            let alpha = map(i, 0, 3, 150, 50) * connectionAnimation;
            stroke(colors.connection[0], colors.connection[1], colors.connection[2], alpha);
            strokeWeight(s(3) - i);

            beginShape();
            for (let x = aX + s(40); x < bX - s(40); x += s(5)) {
                let progress = (x - aX) / (bX - aX);
                let waveAmp = s(15) * sin(progress * PI) * connectionAnimation;
                let y = centerY + sin(x * 0.05 / scaleFactor + time * 3 + i) * waveAmp;
                vertex(x, y);
            }
            endShape();
        }

        // Floating particles along connection
        for (let i = 0; i < 8; i++) {
            let t = (time * 0.3 + i * 0.125) % 1;
            let x = lerp(aX + s(40), bX - s(40), t);
            let y = centerY + sin(x * 0.05 / scaleFactor + time * 3) * s(10) * sin(t * PI);

            fill(colors.connection[0], colors.connection[1], colors.connection[2], 150 * connectionAnimation);
            noStroke();
            ellipse(x, y, s(6), s(6));
        }
    } else {
        // Broken connection - dashed line
        stroke(colors.connection[0], colors.connection[1], colors.connection[2], 50);
        strokeWeight(1);
        drawingContext.setLineDash([s(5), s(10)]);
        line(aX + s(40), centerY, bX - s(40), centerY);
        drawingContext.setLineDash([]);
    }

    pop();
}

function drawParticleA(scaledDistance) {
    push();
    const centerY = height / 2;
    const x = simWidth / 2 - scaledDistance / 2;

    // Particle glow
    if (!particleA.measured) {
        // Superposition glow
        let pulse = sin(time * 2) * 0.2 + 1;
        for (let r = s(80) * pulse; r > 0; r -= s(8)) {
            let alpha = map(r, 0, s(80), 150, 0);
            fill(colors.particleA[0], colors.particleA[1], colors.particleA[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Uncertainty ring
        noFill();
        stroke(colors.particleA[0], colors.particleA[1], colors.particleA[2], 100);
        strokeWeight(s(2));
        let ringSize = s(60) + sin(time * 3) * s(10);
        ellipse(x, centerY, ringSize, ringSize);
    } else {
        // Measured state
        let spinColor = particleA.spin === 1 ? colors.spinUp : colors.spinDown;
        let pulse = sin(time * 3) * 0.1 + 1;

        for (let r = s(60) * pulse; r > 0; r -= s(6)) {
            let alpha = map(r, 0, s(60), 200, 50);
            fill(spinColor[0], spinColor[1], spinColor[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Spin arrow
        stroke(255);
        strokeWeight(s(3));
        let arrowLen = s(25);
        if (particleA.spin === 1) {
            line(x, centerY + s(10), x, centerY - arrowLen);
            line(x - s(8), centerY - arrowLen + s(12), x, centerY - arrowLen);
            line(x + s(8), centerY - arrowLen + s(12), x, centerY - arrowLen);
        } else {
            line(x, centerY - s(10), x, centerY + arrowLen);
            line(x - s(8), centerY + arrowLen - s(12), x, centerY + arrowLen);
            line(x + s(8), centerY + arrowLen - s(12), x, centerY + arrowLen);
        }
    }

    // Core
    fill(255, 255, 240);
    noStroke();
    ellipse(x, centerY, s(16), s(16));

    // Label
    fill(textColor[0], textColor[1], textColor[2]);
    textAlign(CENTER);
    textSize(s(14));
    text("Particle A", x, centerY + s(70));

    if (particleA.measured) {
        textSize(s(12));
        fill(particleA.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleA.spin === 1 ? "Spin ↑" : "Spin ↓", x, centerY + s(90));
    }

    pop();
}

function drawParticleB(scaledDistance) {
    push();
    const centerY = height / 2;
    const x = simWidth / 2 + scaledDistance / 2;

    // Particle glow
    if (!particleB.measured) {
        // Superposition glow
        let pulse = sin(time * 2 + PI) * 0.2 + 1;
        for (let r = s(80) * pulse; r > 0; r -= s(8)) {
            let alpha = map(r, 0, s(80), 150, 0);
            fill(colors.particleB[0], colors.particleB[1], colors.particleB[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Uncertainty ring
        noFill();
        stroke(colors.particleB[0], colors.particleB[1], colors.particleB[2], 100);
        strokeWeight(s(2));
        let ringSize = s(60) + sin(time * 3 + PI) * s(10);
        ellipse(x, centerY, ringSize, ringSize);
    } else {
        // Measured state
        let spinColor = particleB.spin === 1 ? colors.spinUp : colors.spinDown;
        let pulse = sin(time * 3) * 0.1 + 1;

        for (let r = s(60) * pulse; r > 0; r -= s(6)) {
            let alpha = map(r, 0, s(60), 200, 50);
            fill(spinColor[0], spinColor[1], spinColor[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Spin arrow
        stroke(255);
        strokeWeight(s(3));
        let arrowLen = s(25);
        if (particleB.spin === 1) {
            line(x, centerY + s(10), x, centerY - arrowLen);
            line(x - s(8), centerY - arrowLen + s(12), x, centerY - arrowLen);
            line(x + s(8), centerY - arrowLen + s(12), x, centerY - arrowLen);
        } else {
            line(x, centerY - s(10), x, centerY + arrowLen);
            line(x - s(8), centerY + arrowLen - s(12), x, centerY + arrowLen);
            line(x + s(8), centerY + arrowLen - s(12), x, centerY + arrowLen);
        }
    }

    // Core
    fill(255, 255, 240);
    noStroke();
    ellipse(x, centerY, s(16), s(16));

    // Label
    fill(textColor[0], textColor[1], textColor[2]);
    textAlign(CENTER);
    textSize(s(14));
    text("Particle B", x, centerY + s(70));

    if (particleB.measured) {
        textSize(s(12));
        fill(particleB.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleB.spin === 1 ? "Spin ↑" : "Spin ↓", x, centerY + s(90));
    }

    pop();
}

function drawDistanceLabels(scaledDistance) {
    push();

    // Distance indicator
    const centerY = height / 2;
    const aX = simWidth / 2 - scaledDistance / 2;
    const bX = simWidth / 2 + scaledDistance / 2;

    stroke(textColor[0], textColor[1], textColor[2], 100);
    strokeWeight(1);
    line(aX, centerY + s(120), bX, centerY + s(120));
    line(aX, centerY + s(115), aX, centerY + s(125));
    line(bX, centerY + s(115), bX, centerY + s(125));

    fill(textColor[0], textColor[1], textColor[2], 180);
    noStroke();
    textAlign(CENTER);
    textSize(s(11));
    text(distance + " units apart", simWidth / 2, centerY + s(140));

    pop();
}

function drawCorrelationChart() {
    push();

    const graphLeft = graphX + (isVertical ? s(40) : 0);
    const graphRight = (isVertical ? canvasWidth - s(40) : width - s(40));
    const graphTop = graphY + s(60);
    const graphBottom = (isVertical ? canvasHeight - s(40) : height - s(60));
    const graphMidX = (graphLeft + graphRight) / 2;

    // Background
    fill(colors.bg[0] - 5, colors.bg[1] - 5, colors.bg[2] - 5);
    stroke(textColor[0], textColor[1], textColor[2], 50);
    strokeWeight(1);
    rect(graphLeft - s(10), graphTop - s(30), graphRight - graphLeft + s(20), graphBottom - graphTop + s(60), s(8));

    // Title
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(s(12));
    text("Entanglement State", graphMidX, graphTop - s(5));

    // State display
    const boxHeight = s(80);
    const boxY = graphTop + s(40);
    const boxWidth = s(120);

    // Particle A box
    fill(colors.particleA[0], colors.particleA[1], colors.particleA[2], 30);
    stroke(colors.particleA[0], colors.particleA[1], colors.particleA[2]);
    strokeWeight(s(2));
    rect(graphLeft + s(10), boxY, boxWidth, boxHeight, s(8));

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(s(11));
    text("Particle A", graphLeft + s(10) + boxWidth / 2, boxY + s(20));

    textSize(s(18));
    if (particleA.measured) {
        fill(particleA.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleA.spin === 1 ? "↑" : "↓", graphLeft + s(10) + boxWidth / 2, boxY + s(55));
    } else {
        fill(textColor[0], textColor[1], textColor[2], 150);
        text("?", graphLeft + s(10) + boxWidth / 2, boxY + s(55));
    }

    // Particle B box
    fill(colors.particleB[0], colors.particleB[1], colors.particleB[2], 30);
    stroke(colors.particleB[0], colors.particleB[1], colors.particleB[2]);
    strokeWeight(s(2));
    rect(graphRight - boxWidth - s(10), boxY, boxWidth, boxHeight, s(8));

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(s(11));
    text("Particle B", graphRight - s(10) - boxWidth / 2, boxY + s(20));

    textSize(s(18));
    if (particleB.measured) {
        fill(particleB.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleB.spin === 1 ? "↑" : "↓", graphRight - s(10) - boxWidth / 2, boxY + s(55));
    } else {
        fill(textColor[0], textColor[1], textColor[2], 150);
        text("?", graphRight - s(10) - boxWidth / 2, boxY + s(55));
    }

    // Correlation indicator
    const corrY = boxY + boxHeight + s(40);
    fill(textColor[0], textColor[1], textColor[2]);
    textSize(s(11));
    text("Correlation", graphMidX, corrY);

    // Correlation bar
    let corrWidth = s(180);
    let corrHeight = s(20);
    let corrX = graphMidX - corrWidth / 2;

    fill(colors.bg[0] + 20, colors.bg[1] + 20, colors.bg[2] + 20);
    stroke(textColor[0], textColor[1], textColor[2], 50);
    strokeWeight(1);
    rect(corrX, corrY + s(10), corrWidth, corrHeight, s(4));

    // Fill based on state
    if (particleA.measured && particleB.measured) {
        // Perfect anti-correlation
        fill(colors.connection[0], colors.connection[1], colors.connection[2]);
        noStroke();
        rect(corrX + 2, corrY + s(12), corrWidth - 4, corrHeight - 4, s(3));

        fill(255);
        textSize(s(10));
        text("100% Anti-correlated", graphMidX, corrY + s(24));
    } else if (entangled) {
        // Entangled but not measured
        let pulseWidth = (corrWidth - 4) * (0.5 + sin(time * 2) * 0.3);
        fill(colors.connection[0], colors.connection[1], colors.connection[2], 100);
        noStroke();
        rect(corrX + (corrWidth - pulseWidth) / 2, corrY + s(12), pulseWidth, corrHeight - 4, s(3));
    }

    // Explanation
    textSize(s(10));
    fill(textColor[0], textColor[1], textColor[2], 150);
    textAlign(CENTER);

    let explanationY = corrY + s(60);
    if (!particleA.measured && !particleB.measured) {
        text("Particles are entangled.", graphMidX, explanationY);
        text("Measure one to collapse both!", graphMidX, explanationY + s(16));
    } else {
        text("Spins are always opposite!", graphMidX, explanationY);
        text("\"Spooky action at a distance\"", graphMidX, explanationY + s(16));
    }

    // Legend
    let legendY = graphBottom - s(50);
    textSize(s(10));
    textAlign(LEFT);

    fill(colors.spinUp[0], colors.spinUp[1], colors.spinUp[2]);
    ellipse(graphLeft + s(20), legendY, s(10), s(10));
    fill(textColor[0], textColor[1], textColor[2]);
    text("Spin Up", graphLeft + s(30), legendY + s(4));

    fill(colors.spinDown[0], colors.spinDown[1], colors.spinDown[2]);
    ellipse(graphLeft + s(20), legendY + s(20), s(10), s(10));
    fill(textColor[0], textColor[1], textColor[2]);
    text("Spin Down", graphLeft + s(30), legendY + s(24));

    pop();
}

function drawTitle() {
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(LEFT);
    textSize(s(12));
    text("Quantum Entanglement", s(25), s(28));
    textSize(s(10));
    fill(textColor[0], textColor[1], textColor[2], 180);
    text("Two particles, one quantum state", s(25), s(46));
    pop();
}

function windowResized() {
    calculateDimensions();
    resizeCanvas(canvasWidth, canvasHeight);
}
