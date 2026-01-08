// Quantum Superposition Simulation
// Visualizes a particle in superposition of states until measured
// With proper scaling for responsive design

let isMeasured = false;
let measuredState = 0; // 0 = spin up, 1 = spin down
let measurementAnimation = 0;
let time = 0;

// Probabilities
let probUp = 0.5;
let probDown = 0.5;

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
    let calculatedSimHeight = Math.floor(BASE_HEIGHT * scaleFactor);
    let calculatedGraphHeight = Math.min(Math.floor(250 * scaleFactor), targetHeight - calculatedSimHeight - 20);

    canvasWidth = simWidth;
    canvasHeight = calculatedSimHeight + calculatedGraphHeight + 20;

    // Ensure we don't exceed targetHeight (scrolling constraint)
    if (canvasHeight > targetHeight && window.innerWidth > 900) {
        // Re-calculate scale to fit height
        const totalBaseHeight = BASE_HEIGHT + 250 + 20;
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
    stateUp: [100, 180, 255],    // Blue for spin up
    stateDown: [255, 130, 100],   // Orange for spin down
    labelBg: [35, 40, 55],
    labelBorder: [180, 180, 180]
};

const lightColors = {
    bg: [248, 250, 252],
    text: [40, 40, 50],
    accent: [0, 0, 0],
    stateUp: [50, 120, 220],
    stateDown: [220, 80, 50],
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

    // Probability slider
    document.getElementById('probSlider').addEventListener('input', function () {
        probUp = parseInt(this.value) / 100;
        probDown = 1 - probUp;
        document.getElementById('probValue').textContent = Math.round(probUp * 100) + '%';
        if (!isMeasured) resetState();
    });

    // Measure button
    document.getElementById('measureBtn').addEventListener('click', function () {
        if (!isMeasured) {
            measureParticle();
        }
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', function () {
        resetState();
    });
}

function measureParticle() {
    // Collapse wavefunction based on probabilities
    measuredState = random() < probUp ? 0 : 1;
    isMeasured = true;
    measurementAnimation = 1;
}

function resetState() {
    isMeasured = false;
    measurementAnimation = 0;
}

function draw() {
    background(bgColor);
    time += 0.02;

    if (measurementAnimation > 0) {
        measurementAnimation = max(0, measurementAnimation - 0.02);
    }

    // Draw simulation
    drawParticle();
    drawStateLabels();

    // Draw probability graph
    drawProbabilityGraph();

    // Draw title and info
    drawTitle();
}

function drawParticle() {
    push();
    const centerX = simWidth / 2;
    const centerY = height / 2;

    if (!isMeasured) {
        // Superposition state - show both possibilities
        drawSuperpositionState(centerX, centerY);
    } else {
        // Collapsed state
        drawCollapsedState(centerX, centerY);
    }

    pop();
}

function drawSuperpositionState(cx, cy) {
    // Draw overlapping probability clouds
    const pulseUp = sin(time * 2) * 0.15 + 1;
    const pulseDown = sin(time * 2 + PI) * 0.15 + 1;

    // Spin up cloud (blue) - offset upward
    const upY = cy - s(60);
    const upSize = s(120) * probUp * pulseUp;
    for (let r = upSize; r > 0; r -= s(8)) {
        let alpha = map(r, 0, upSize, 180, 0) * probUp;
        fill(colors.stateUp[0], colors.stateUp[1], colors.stateUp[2], alpha);
        noStroke();
        ellipse(cx, upY, r * 1.5, r);
    }

    // Spin down cloud (orange) - offset downward
    const downY = cy + s(60);
    const downSize = s(120) * probDown * pulseDown;
    for (let r = downSize; r > 0; r -= s(8)) {
        let alpha = map(r, 0, downSize, 180, 0) * probDown;
        fill(colors.stateDown[0], colors.stateDown[1], colors.stateDown[2], alpha);
        noStroke();
        ellipse(cx, downY, r * 1.5, r);
    }

    // Central particle core (shimmering between states)
    let blendFactor = (sin(time * 3) + 1) / 2;
    let coreR = lerp(colors.stateUp[0], colors.stateDown[0], blendFactor);
    let coreG = lerp(colors.stateUp[1], colors.stateDown[1], blendFactor);
    let coreB = lerp(colors.stateUp[2], colors.stateDown[2], blendFactor);

    for (let r = s(40); r > 0; r -= s(5)) {
        let alpha = map(r, 0, s(40), 255, 100);
        fill(coreR, coreG, coreB, alpha);
        ellipse(cx, cy, r, r);
    }

    // Quantum fluctuation particles
    for (let i = 0; i < 20; i++) {
        let angle = time * 0.5 + i * TWO_PI / 20;
        let radius = s(80) + sin(time * 2 + i) * s(20);
        let px = cx + cos(angle) * radius;
        let py = cy + sin(angle) * radius * 0.6;

        let pColor = i % 2 === 0 ? colors.stateUp : colors.stateDown;
        fill(pColor[0], pColor[1], pColor[2], 100);
        noStroke();
        ellipse(px, py, s(6), s(6));
    }

    // Superposition symbol
    fill(textColor[0], textColor[1], textColor[2]);
    textAlign(CENTER, CENTER);
    textSize(s(24));
    text("|ψ⟩ = α|↑⟩ + β|↓⟩", cx, cy + s(160));
}

function drawCollapsedState(cx, cy) {
    // Flash effect during collapse
    if (measurementAnimation > 0.5) {
        let flashAlpha = map(measurementAnimation, 0.5, 1, 0, 200);
        fill(255, 255, 255, flashAlpha);
        noStroke();
        ellipse(cx, cy, s(300), s(300));
    }

    // Show only the measured state
    let stateColor = measuredState === 0 ? colors.stateUp : colors.stateDown;
    let stateY = cy;
    let stateLabel = measuredState === 0 ? "|↑⟩" : "|↓⟩";

    // Solid particle
    let pulse = sin(time * 3) * 0.1 + 1;
    let size = s(100) * pulse;

    for (let r = size; r > 0; r -= s(6)) {
        let alpha = map(r, 0, size, 255, 50);
        fill(stateColor[0], stateColor[1], stateColor[2], alpha);
        noStroke();
        ellipse(cx, stateY, r, r);
    }

    // Core
    fill(255, 255, 240);
    ellipse(cx, stateY, s(20), s(20));

    // Arrow indicator
    stroke(stateColor[0], stateColor[1], stateColor[2]);
    strokeWeight(s(4));
    noFill();
    let arrowSize = s(50);
    if (measuredState === 0) {
        // Up arrow
        line(cx, stateY - s(60), cx, stateY - s(60) - arrowSize);
        line(cx - s(15), stateY - s(60) - arrowSize + s(20), cx, stateY - s(60) - arrowSize);
        line(cx + s(15), stateY - s(60) - arrowSize + s(20), cx, stateY - s(60) - arrowSize);
    } else {
        // Down arrow
        line(cx, stateY + s(60), cx, stateY + s(60) + arrowSize);
        line(cx - s(15), stateY + s(60) + arrowSize - s(20), cx, stateY + s(60) + arrowSize);
        line(cx + s(15), stateY + s(60) + arrowSize - s(20), cx, stateY + s(60) + arrowSize);
    }

    // State label
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(s(28));
    text(stateLabel, cx, cy + s(160));

    textSize(s(14));
    fill(textColor[0], textColor[1], textColor[2], 180);
    text("Wavefunction collapsed!", cx, cy + s(190));
}

function drawStateLabels() {
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(s(14));

    // Spin up label
    fill(colors.stateUp[0], colors.stateUp[1], colors.stateUp[2]);
    text("Spin Up |↑⟩", s(100), s(60));

    // Spin down label
    fill(colors.stateDown[0], colors.stateDown[1], colors.stateDown[2]);
    text("Spin Down |↓⟩", s(100), s(85));

    pop();
}

function drawProbabilityGraph() {
    push();

    const graphLeft = graphX + (isVertical ? s(40) : 0);
    const graphRight = (isVertical ? canvasWidth - s(40) : width - s(40));
    const graphTop = graphY + s(80);
    const graphBottom = (isVertical ? canvasHeight - s(40) : height - s(80));
    const graphMidX = (graphLeft + graphRight) / 2;

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
    text("Probability Distribution", graphMidX, graphTop - s(10));

    // Bar chart
    const barWidth = s(80);
    const maxBarHeight = graphBottom - graphTop - s(60);

    // Spin up bar
    let upHeight = maxBarHeight * probUp;
    if (isMeasured) {
        upHeight = measuredState === 0 ? maxBarHeight : 0;
    }
    fill(colors.stateUp[0], colors.stateUp[1], colors.stateUp[2]);
    rect(graphMidX - barWidth - s(20), graphBottom - s(30) - upHeight, barWidth, upHeight, s(4));

    // Spin down bar
    let downHeight = maxBarHeight * probDown;
    if (isMeasured) {
        downHeight = measuredState === 1 ? maxBarHeight : 0;
    }
    fill(colors.stateDown[0], colors.stateDown[1], colors.stateDown[2]);
    rect(graphMidX + s(20), graphBottom - s(30) - downHeight, barWidth, downHeight, s(4));

    // Labels
    fill(textColor[0], textColor[1], textColor[2]);
    textAlign(CENTER);
    textSize(s(11));
    text("|↑⟩", graphMidX - barWidth / 2 - s(20), graphBottom - s(10));
    text("|↓⟩", graphMidX + barWidth / 2 + s(20), graphBottom - s(10));

    // Probability values
    textSize(s(12));
    if (!isMeasured) {
        text(Math.round(probUp * 100) + "%", graphMidX - barWidth / 2 - s(20), graphBottom - s(40) - upHeight);
        text(Math.round(probDown * 100) + "%", graphMidX + barWidth / 2 + s(20), graphBottom - s(40) - downHeight);
    } else {
        text(measuredState === 0 ? "100%" : "0%", graphMidX - barWidth / 2 - s(20), graphBottom - s(40) - upHeight);
        text(measuredState === 1 ? "100%" : "0%", graphMidX + barWidth / 2 + s(20), graphBottom - s(40) - downHeight);
    }

    // Status text
    textSize(s(11));
    fill(textColor[0], textColor[1], textColor[2], 180);
    if (isMeasured) {
        text("State: Measured", graphMidX, graphTop + s(20));
    } else {
        text("State: Superposition", graphMidX, graphTop + s(20));
    }

    pop();
}

function drawTitle() {
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(LEFT);
    textSize(s(12));
    text("Quantum Superposition", s(25), s(28));
    textSize(s(10));
    fill(textColor[0], textColor[1], textColor[2], 180);
    text("A particle exists in multiple states until measured", s(25), s(46));
    pop();
}

function windowResized() {
    calculateDimensions();
    resizeCanvas(canvasWidth, canvasHeight);
}
