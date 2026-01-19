// Quantum Entanglement Simulation
// Visualizes entangled particle pairs and their correlated measurements
// With proper scaling for responsive design

let particleA = null;
let particleB = null;
let isEntangled = false;
let isMeasuredA = false;
let isMeasuredB = false;
let measuredStateA = 0; // 0 = spin up, 1 = spin down
let measuredStateB = 0;
let measurementAnimationA = 0;
let measurementAnimationB = 0;
let entanglementAnimation = 0;
let time = 0;
let distance = 300;

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
let graphY = 0;
let scaleFactor = 1;

// Connection particles
let connectionParticles = [];

function calculateDimensions() {
    const padding = 40;
    const container = document.getElementById('canvas-container');
    const containerWidth = container ? container.offsetWidth : window.innerWidth - padding;
    let targetWidth = Math.min(containerWidth, 960);

    scaleFactor = targetWidth / BASE_SIM_WIDTH;
    simWidth = targetWidth;
    graphWidth = simWidth;

    let calculatedSimHeight = Math.floor(BASE_HEIGHT * scaleFactor);
    let calculatedGraphHeight = Math.floor(200 * scaleFactor);

    canvasWidth = simWidth;
    canvasHeight = calculatedSimHeight + calculatedGraphHeight + Math.floor(60 * scaleFactor);

    graphX = 0;
    graphY = calculatedSimHeight + 20;
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
    particleA: [96, 165, 250],     // Blue for particle A
    particleB: [244, 114, 182],    // Pink for particle B
    entanglement: [167, 139, 250], // Purple for entanglement connection
    labelBg: [35, 40, 55],
    labelBorder: [180, 180, 180]
};

const lightColors = {
    bg: [248, 250, 252],
    text: [40, 40, 50],
    accent: [0, 0, 0],
    particleA: [59, 130, 246],     // Blue for particle A
    particleB: [236, 72, 153],     // Pink for particle B
    entanglement: [139, 92, 246],  // Purple for entanglement connection
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

    // Initialize connection particles
    for (let i = 0; i < 30; i++) {
        connectionParticles.push({
            t: random(1),
            offset: random(-1, 1),
            speed: random(0.002, 0.008),
            size: random(2, 5)
        });
    }

    // Distance slider
    document.getElementById('distanceSlider').addEventListener('input', function () {
        distance = parseInt(this.value);
        document.getElementById('distanceValue').textContent = distance + ' units';
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', function () {
        generateEntangledPair();
    });

    // Measure A button
    document.getElementById('measureABtn').addEventListener('click', function () {
        if (isEntangled && !isMeasuredA) {
            measureParticle('A');
        }
    });

    // Measure B button
    document.getElementById('measureBBtn').addEventListener('click', function () {
        if (isEntangled && !isMeasuredB) {
            measureParticle('B');
        }
    });
}

function generateEntangledPair() {
    isEntangled = true;
    isMeasuredA = false;
    isMeasuredB = false;
    measurementAnimationA = 0;
    measurementAnimationB = 0;
    entanglementAnimation = 1;
    measuredStateA = 0;
    measuredStateB = 0;

    particleA = {
        x: canvasWidth / 2 - s(distance / 2),
        y: graphY / 2
    };

    particleB = {
        x: canvasWidth / 2 + s(distance / 2),
        y: graphY / 2
    };
}

function measureParticle(which) {
    // Wavefunction collapse - both particles collapse together
    if (!isMeasuredA && !isMeasuredB) {
        // First measurement determines both states
        measuredStateA = random() < 0.5 ? 0 : 1;
        measuredStateB = 1 - measuredStateA; // Always opposite (anti-correlated)
    }

    if (which === 'A') {
        isMeasuredA = true;
        measurementAnimationA = 1;
        // B also collapses instantly
        isMeasuredB = true;
        measurementAnimationB = 0.8;
    } else {
        isMeasuredB = true;
        measurementAnimationB = 1;
        // A also collapses instantly
        isMeasuredA = true;
        measurementAnimationA = 0.8;
    }
}

function draw() {
    background(bgColor);
    time += 0.02;

    // Update animations
    if (measurementAnimationA > 0) {
        measurementAnimationA = max(0, measurementAnimationA - 0.02);
    }
    if (measurementAnimationB > 0) {
        measurementAnimationB = max(0, measurementAnimationB - 0.02);
    }
    if (entanglementAnimation > 0) {
        entanglementAnimation = max(0, entanglementAnimation - 0.015);
    }

    // Update particle positions based on distance
    if (isEntangled) {
        particleA.x = canvasWidth / 2 - s(distance / 2);
        particleB.x = canvasWidth / 2 + s(distance / 2);
    }

    // Draw entanglement connection
    if (isEntangled) {
        drawEntanglementConnection();
    }

    // Draw particles
    drawParticles();

    // Draw state labels
    drawStateLabels();

    // Draw correlation graph
    drawCorrelationGraph();

    // Draw title
    drawTitle();
}

function drawEntanglementConnection() {
    if (!particleA || !particleB) return;

    push();

    // Draw wavy connection line
    let connectionAlpha = isMeasuredA && isMeasuredB ? 50 : 150;

    // Main connection path with wave
    stroke(colors.entanglement[0], colors.entanglement[1], colors.entanglement[2], connectionAlpha);
    strokeWeight(s(2));
    noFill();

    beginShape();
    for (let i = 0; i <= 100; i++) {
        let t = i / 100;
        let x = lerp(particleA.x, particleB.x, t);
        let waveAmp = s(20) * sin(t * PI) * (1 - entanglementAnimation);
        let y = particleA.y + sin(time * 2 + t * TWO_PI * 3) * waveAmp;
        vertex(x, y);
    }
    endShape();

    // Quantum particles flowing along the connection
    if (!isMeasuredA || !isMeasuredB) {
        for (let p of connectionParticles) {
            p.t += p.speed;
            if (p.t > 1) p.t = 0;

            let x = lerp(particleA.x, particleB.x, p.t);
            let waveAmp = s(20) * sin(p.t * PI);
            let y = particleA.y + sin(time * 2 + p.t * TWO_PI * 3) * waveAmp + p.offset * s(10);

            let alpha = sin(p.t * PI) * 200;
            fill(colors.entanglement[0], colors.entanglement[1], colors.entanglement[2], alpha);
            noStroke();
            ellipse(x, y, s(p.size), s(p.size));
        }
    }

    pop();
}

function drawParticles() {
    if (!isEntangled) {
        // Draw placeholder particles
        drawPlaceholderParticle(canvasWidth / 2 - s(distance / 2), graphY / 2, 'A');
        drawPlaceholderParticle(canvasWidth / 2 + s(distance / 2), graphY / 2, 'B');
    } else {
        drawParticle(particleA.x, particleA.y, 'A', isMeasuredA, measuredStateA, measurementAnimationA);
        drawParticle(particleB.x, particleB.y, 'B', isMeasuredB, measuredStateB, measurementAnimationB);
    }
}

function drawPlaceholderParticle(x, y, label) {
    push();

    // Dim placeholder
    stroke(colors.text[0], colors.text[1], colors.text[2], 50);
    strokeWeight(s(2));
    noFill();
    ellipse(x, y, s(80), s(80));

    // Dashed circle
    for (let i = 0; i < 12; i++) {
        let angle = i * TWO_PI / 12;
        let x1 = x + cos(angle) * s(40);
        let y1 = y + sin(angle) * s(40);
        let x2 = x + cos(angle + TWO_PI / 24) * s(40);
        let y2 = y + sin(angle + TWO_PI / 24) * s(40);
        line(x1, y1, x2, y2);
    }

    // Label
    fill(colors.text[0], colors.text[1], colors.text[2], 100);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(s(24));
    text(label === 'A' ? 'A' : 'B', x, y);

    textSize(s(12));
    text('Not generated', x, y + s(60));

    pop();
}

function drawParticle(x, y, label, isMeasured, measuredState, animationValue) {
    push();

    let particleColor = label === 'A' ? colors.particleA : colors.particleB;

    if (!isMeasured) {
        // Superposition state - show probability cloud
        let pulse = sin(time * 2 + (label === 'A' ? 0 : PI)) * 0.15 + 1;

        // Outer glow
        for (let r = s(100) * pulse; r > 0; r -= s(8)) {
            let alpha = map(r, 0, s(100) * pulse, 150, 0);
            fill(particleColor[0], particleColor[1], particleColor[2], alpha);
            noStroke();
            ellipse(x, y, r, r);
        }

        // Quantum fluctuations
        for (let i = 0; i < 8; i++) {
            let angle = time + i * TWO_PI / 8 + (label === 'A' ? 0 : PI / 8);
            let radius = s(50) + sin(time * 3 + i) * s(15);
            let px = x + cos(angle) * radius;
            let py = y + sin(angle) * radius;

            fill(particleColor[0], particleColor[1], particleColor[2], 100);
            noStroke();
            ellipse(px, py, s(6), s(6));
        }

        // Core
        fill(255, 255, 255, 200);
        ellipse(x, y, s(20), s(20));

        // Superposition indicators (up and down arrows fading in/out)
        let upAlpha = (sin(time * 2) + 1) / 2 * 150 + 50;
        let downAlpha = (sin(time * 2 + PI) + 1) / 2 * 150 + 50;

        stroke(particleColor[0], particleColor[1], particleColor[2], upAlpha);
        strokeWeight(s(2));
        // Up arrow
        line(x, y - s(30), x, y - s(50));
        line(x - s(8), y - s(42), x, y - s(50));
        line(x + s(8), y - s(42), x, y - s(50));

        stroke(particleColor[0], particleColor[1], particleColor[2], downAlpha);
        // Down arrow
        line(x, y + s(30), x, y + s(50));
        line(x - s(8), y + s(42), x, y + s(50));
        line(x + s(8), y + s(42), x, y + s(50));

    } else {
        // Measurement flash
        if (animationValue > 0.5) {
            let flashAlpha = map(animationValue, 0.5, 1, 0, 255);
            fill(255, 255, 255, flashAlpha);
            noStroke();
            ellipse(x, y, s(150), s(150));
        }

        // Collapsed state
        let pulse = sin(time * 3) * 0.1 + 1;
        let size = s(80) * pulse;

        for (let r = size; r > 0; r -= s(6)) {
            let alpha = map(r, 0, size, 255, 50);
            fill(particleColor[0], particleColor[1], particleColor[2], alpha);
            noStroke();
            ellipse(x, y, r, r);
        }

        // Core
        fill(255, 255, 240);
        ellipse(x, y, s(18), s(18));

        // Arrow for measured state
        stroke(255, 255, 255, 220);
        strokeWeight(s(3));
        let arrowSize = s(35);

        if (measuredState === 0) {
            // Spin up
            line(x, y - s(30), x, y - s(30) - arrowSize);
            line(x - s(10), y - s(30) - arrowSize + s(12), x, y - s(30) - arrowSize);
            line(x + s(10), y - s(30) - arrowSize + s(12), x, y - s(30) - arrowSize);
        } else {
            // Spin down
            line(x, y + s(30), x, y + s(30) + arrowSize);
            line(x - s(10), y + s(30) + arrowSize - s(12), x, y + s(30) + arrowSize);
            line(x + s(10), y + s(30) + arrowSize - s(12), x, y + s(30) + arrowSize);
        }
    }

    // Particle label
    fill(particleColor[0], particleColor[1], particleColor[2]);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(s(14));
    textStyle(BOLD);
    text('Particle ' + label, x, y + s(85));
    textStyle(NORMAL);

    // State label
    textSize(s(12));
    fill(colors.text[0], colors.text[1], colors.text[2], 180);
    if (isMeasured) {
        text(measuredState === 0 ? 'Spin: ↑ (Up)' : 'Spin: ↓ (Down)', x, y + s(102));
    } else {
        text('State: |↑⟩ + |↓⟩', x, y + s(102));
    }

    pop();
}

function drawStateLabels() {
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER, CENTER);

    // Entanglement state indicator
    let stateX = canvasWidth / 2;
    let stateY = s(45);

    textSize(s(14));
    if (!isEntangled) {
        fill(colors.text[0], colors.text[1], colors.text[2], 100);
        text('Click "Generate Entangled Pair" to begin', stateX, stateY);
    } else if (!isMeasuredA && !isMeasuredB) {
        fill(colors.entanglement[0], colors.entanglement[1], colors.entanglement[2]);
        text('Entanglement State: |↑↓⟩ - |↓↑⟩', stateX, stateY);
        textSize(s(11));
        fill(colors.text[0], colors.text[1], colors.text[2], 150);
        text('(Anti-correlated superposition)', stateX, stateY + s(18));
    } else {
        fill(colors.entanglement[0], colors.entanglement[1], colors.entanglement[2]);
        let stateLabel = measuredStateA === 0 ? '|↑↓⟩' : '|↓↑⟩';
        text('Collapsed State: ' + stateLabel, stateX, stateY);
        textSize(s(11));
        fill(colors.text[0], colors.text[1], colors.text[2], 150);
        text('Wavefunction collapsed - spins are anti-correlated!', stateX, stateY + s(18));
    }

    pop();
}

function drawCorrelationGraph() {
    push();

    const graphLeft = s(20);
    const graphRight = canvasWidth - s(20);
    const graphTop = graphY + s(20);
    const graphBottom = canvasHeight - s(40);
    const graphMidX = canvasWidth / 2;

    // Graph background
    fill(colors.bg[0] - 5, colors.bg[1] - 5, colors.bg[2] - 5);
    stroke(textColor[0], textColor[1], textColor[2], 50);
    strokeWeight(1);
    rect(graphLeft - s(10), graphTop - s(30), graphRight - graphLeft + s(20), graphBottom - graphTop + s(60), s(8));

    // Title
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(s(12));
    text('Measurement Correlation', graphMidX, graphTop - s(10));

    // Bar chart for particle A and B states
    const barWidth = s(50);
    const maxBarHeight = graphBottom - graphTop - s(70);
    const barGap = s(60);

    // Particle A section
    const aCenter = graphMidX - barGap - barWidth;

    // Particle A label
    fill(colors.particleA[0], colors.particleA[1], colors.particleA[2]);
    textSize(s(11));
    text('Particle A', aCenter, graphTop + s(15));

    // A bars
    let aUpHeight = maxBarHeight * 0.5;
    let aDownHeight = maxBarHeight * 0.5;
    if (isMeasuredA) {
        aUpHeight = measuredStateA === 0 ? maxBarHeight : 0;
        aDownHeight = measuredStateA === 1 ? maxBarHeight : 0;
    }

    // Up bar
    fill(colors.particleA[0], colors.particleA[1], colors.particleA[2], 200);
    rect(aCenter - barWidth / 2 - s(15), graphBottom - s(30) - aUpHeight, barWidth / 2 - s(2), aUpHeight, s(3));

    // Down bar
    fill(colors.particleA[0], colors.particleA[1], colors.particleA[2], 120);
    rect(aCenter + s(2), graphBottom - s(30) - aDownHeight, barWidth / 2 - s(2), aDownHeight, s(3));

    // Labels
    fill(textColor[0], textColor[1], textColor[2]);
    textSize(s(9));
    text('↑', aCenter - barWidth / 4 - s(8), graphBottom - s(15));
    text('↓', aCenter + barWidth / 4 + s(2), graphBottom - s(15));

    // Particle B section
    const bCenter = graphMidX + barGap + barWidth;

    // Particle B label
    fill(colors.particleB[0], colors.particleB[1], colors.particleB[2]);
    textSize(s(11));
    text('Particle B', bCenter, graphTop + s(15));

    // B bars
    let bUpHeight = maxBarHeight * 0.5;
    let bDownHeight = maxBarHeight * 0.5;
    if (isMeasuredB) {
        bUpHeight = measuredStateB === 0 ? maxBarHeight : 0;
        bDownHeight = measuredStateB === 1 ? maxBarHeight : 0;
    }

    // Up bar
    fill(colors.particleB[0], colors.particleB[1], colors.particleB[2], 200);
    rect(bCenter - barWidth / 2 - s(15), graphBottom - s(30) - bUpHeight, barWidth / 2 - s(2), bUpHeight, s(3));

    // Down bar
    fill(colors.particleB[0], colors.particleB[1], colors.particleB[2], 120);
    rect(bCenter + s(2), graphBottom - s(30) - bDownHeight, barWidth / 2 - s(2), bDownHeight, s(3));

    // Labels
    fill(textColor[0], textColor[1], textColor[2]);
    textSize(s(9));
    text('↑', bCenter - barWidth / 4 - s(8), graphBottom - s(15));
    text('↓', bCenter + barWidth / 4 + s(2), graphBottom - s(15));

    // Correlation indicator in center
    fill(colors.entanglement[0], colors.entanglement[1], colors.entanglement[2], 150);
    textSize(s(10));
    textAlign(CENTER, CENTER);

    if (isEntangled) {
        if (isMeasuredA && isMeasuredB) {
            text('Correlation: 100%', graphMidX, graphTop + s(40));
            text('Always opposite!', graphMidX, graphTop + s(55));
        } else {
            text('Correlation: Pending', graphMidX, graphTop + s(40));
            text('Measure to see', graphMidX, graphTop + s(55));
        }
    } else {
        fill(textColor[0], textColor[1], textColor[2], 100);
        text('Generate pair', graphMidX, graphTop + s(40));
        text('to see correlation', graphMidX, graphTop + s(55));
    }

    pop();
}

function drawTitle() {
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(LEFT);
    textSize(s(12));
    text('Quantum Entanglement', s(25), s(28));
    pop();
}

function windowResized() {
    calculateDimensions();
    resizeCanvas(canvasWidth, canvasHeight);

    // Update particle positions
    if (isEntangled && particleA && particleB) {
        particleA.x = canvasWidth / 2 - s(distance / 2);
        particleB.x = canvasWidth / 2 + s(distance / 2);
        particleA.y = graphY / 2;
        particleB.y = graphY / 2;
    }
}
