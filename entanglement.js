// Quantum Entanglement Simulation
// Visualizes two entangled particles with correlated measurements

let particleA = { measured: false, spin: 0 };
let particleB = { measured: false, spin: 0 };
let entangled = true;
let time = 0;
let distance = 300; // Distance between particles
let connectionAnimation = 0;

// Canvas dimensions
const canvasWidth = 1100;
const canvasHeight = 550;

// Layout
const simWidth = 700;
const graphWidth = 350;
const graphX = simWidth + 30;

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

    // Draw simulation
    drawConnection();
    drawParticleA();
    drawParticleB();
    drawLabels();

    // Draw correlation chart
    drawCorrelationChart();

    // Draw title
    drawTitle();
}

function drawConnection() {
    if (!entangled) return;

    push();
    const centerY = height / 2;
    const aX = simWidth / 2 - distance / 2;
    const bX = simWidth / 2 + distance / 2;

    // Wavy connection line
    noFill();

    if (!particleA.measured) {
        // Animated entanglement connection
        for (let i = 0; i < 3; i++) {
            let alpha = map(i, 0, 3, 150, 50) * connectionAnimation;
            stroke(colors.connection[0], colors.connection[1], colors.connection[2], alpha);
            strokeWeight(3 - i);

            beginShape();
            for (let x = aX + 40; x < bX - 40; x += 5) {
                let progress = (x - aX) / (bX - aX);
                let waveAmp = 15 * sin(progress * PI) * connectionAnimation;
                let y = centerY + sin(x * 0.05 + time * 3 + i) * waveAmp;
                vertex(x, y);
            }
            endShape();
        }

        // Floating particles along connection
        for (let i = 0; i < 8; i++) {
            let t = (time * 0.3 + i * 0.125) % 1;
            let x = lerp(aX + 40, bX - 40, t);
            let y = centerY + sin(x * 0.05 + time * 3) * 10 * sin(t * PI);

            fill(colors.connection[0], colors.connection[1], colors.connection[2], 150 * connectionAnimation);
            noStroke();
            ellipse(x, y, 6, 6);
        }
    } else {
        // Broken connection - dashed line
        stroke(colors.connection[0], colors.connection[1], colors.connection[2], 50);
        strokeWeight(1);
        drawingContext.setLineDash([5, 10]);
        line(aX + 40, centerY, bX - 40, centerY);
        drawingContext.setLineDash([]);
    }

    pop();
}

function drawParticleA() {
    push();
    const centerY = height / 2;
    const x = simWidth / 2 - distance / 2;

    // Particle glow
    if (!particleA.measured) {
        // Superposition glow
        let pulse = sin(time * 2) * 0.2 + 1;
        for (let r = 80 * pulse; r > 0; r -= 8) {
            let alpha = map(r, 0, 80, 150, 0);
            fill(colors.particleA[0], colors.particleA[1], colors.particleA[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Uncertainty ring
        noFill();
        stroke(colors.particleA[0], colors.particleA[1], colors.particleA[2], 100);
        strokeWeight(2);
        let ringSize = 60 + sin(time * 3) * 10;
        ellipse(x, centerY, ringSize, ringSize);
    } else {
        // Measured state
        let spinColor = particleA.spin === 1 ? colors.spinUp : colors.spinDown;
        let pulse = sin(time * 3) * 0.1 + 1;

        for (let r = 60 * pulse; r > 0; r -= 6) {
            let alpha = map(r, 0, 60, 200, 50);
            fill(spinColor[0], spinColor[1], spinColor[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Spin arrow
        stroke(255);
        strokeWeight(3);
        let arrowLen = 25;
        if (particleA.spin === 1) {
            line(x, centerY + 10, x, centerY - arrowLen);
            line(x - 8, centerY - arrowLen + 12, x, centerY - arrowLen);
            line(x + 8, centerY - arrowLen + 12, x, centerY - arrowLen);
        } else {
            line(x, centerY - 10, x, centerY + arrowLen);
            line(x - 8, centerY + arrowLen - 12, x, centerY + arrowLen);
            line(x + 8, centerY + arrowLen - 12, x, centerY + arrowLen);
        }
    }

    // Core
    fill(255, 255, 240);
    noStroke();
    ellipse(x, centerY, 16, 16);

    // Label
    fill(textColor[0], textColor[1], textColor[2]);
    textAlign(CENTER);
    textSize(14);
    text("Particle A", x, centerY + 70);

    if (particleA.measured) {
        textSize(12);
        fill(particleA.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleA.spin === 1 ? "Spin ↑" : "Spin ↓", x, centerY + 90);
    }

    pop();
}

function drawParticleB() {
    push();
    const centerY = height / 2;
    const x = simWidth / 2 + distance / 2;

    // Particle glow
    if (!particleB.measured) {
        // Superposition glow
        let pulse = sin(time * 2 + PI) * 0.2 + 1;
        for (let r = 80 * pulse; r > 0; r -= 8) {
            let alpha = map(r, 0, 80, 150, 0);
            fill(colors.particleB[0], colors.particleB[1], colors.particleB[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Uncertainty ring
        noFill();
        stroke(colors.particleB[0], colors.particleB[1], colors.particleB[2], 100);
        strokeWeight(2);
        let ringSize = 60 + sin(time * 3 + PI) * 10;
        ellipse(x, centerY, ringSize, ringSize);
    } else {
        // Measured state
        let spinColor = particleB.spin === 1 ? colors.spinUp : colors.spinDown;
        let pulse = sin(time * 3) * 0.1 + 1;

        for (let r = 60 * pulse; r > 0; r -= 6) {
            let alpha = map(r, 0, 60, 200, 50);
            fill(spinColor[0], spinColor[1], spinColor[2], alpha);
            noStroke();
            ellipse(x, centerY, r, r);
        }

        // Spin arrow
        stroke(255);
        strokeWeight(3);
        let arrowLen = 25;
        if (particleB.spin === 1) {
            line(x, centerY + 10, x, centerY - arrowLen);
            line(x - 8, centerY - arrowLen + 12, x, centerY - arrowLen);
            line(x + 8, centerY - arrowLen + 12, x, centerY - arrowLen);
        } else {
            line(x, centerY - 10, x, centerY + arrowLen);
            line(x - 8, centerY + arrowLen - 12, x, centerY + arrowLen);
            line(x + 8, centerY + arrowLen - 12, x, centerY + arrowLen);
        }
    }

    // Core
    fill(255, 255, 240);
    noStroke();
    ellipse(x, centerY, 16, 16);

    // Label
    fill(textColor[0], textColor[1], textColor[2]);
    textAlign(CENTER);
    textSize(14);
    text("Particle B", x, centerY + 70);

    if (particleB.measured) {
        textSize(12);
        fill(particleB.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleB.spin === 1 ? "Spin ↑" : "Spin ↓", x, centerY + 90);
    }

    pop();
}

function drawLabels() {
    push();

    // Distance indicator
    const centerY = height / 2;
    const aX = simWidth / 2 - distance / 2;
    const bX = simWidth / 2 + distance / 2;

    stroke(textColor[0], textColor[1], textColor[2], 100);
    strokeWeight(1);
    line(aX, centerY + 120, bX, centerY + 120);
    line(aX, centerY + 115, aX, centerY + 125);
    line(bX, centerY + 115, bX, centerY + 125);

    fill(textColor[0], textColor[1], textColor[2], 180);
    noStroke();
    textAlign(CENTER);
    textSize(11);
    text(distance + " units apart", simWidth / 2, centerY + 140);

    pop();
}

function drawCorrelationChart() {
    push();

    const graphLeft = graphX;
    const graphRight = width - 40;
    const graphTop = 60;
    const graphBottom = height - 60;
    const graphMidX = (graphLeft + graphRight) / 2;

    // Background
    fill(colors.bg[0] - 5, colors.bg[1] - 5, colors.bg[2] - 5);
    stroke(textColor[0], textColor[1], textColor[2], 50);
    strokeWeight(1);
    rect(graphLeft - 10, graphTop - 30, graphRight - graphLeft + 20, graphBottom - graphTop + 60, 8);

    // Title
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(12);
    text("Entanglement State", graphMidX, graphTop - 5);

    // State display
    const boxHeight = 80;
    const boxY = graphTop + 40;

    // Particle A box
    fill(colors.particleA[0], colors.particleA[1], colors.particleA[2], 30);
    stroke(colors.particleA[0], colors.particleA[1], colors.particleA[2]);
    strokeWeight(2);
    rect(graphLeft + 10, boxY, 140, boxHeight, 8);

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(11);
    text("Particle A", graphLeft + 80, boxY + 20);

    textSize(18);
    if (particleA.measured) {
        fill(particleA.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleA.spin === 1 ? "↑" : "↓", graphLeft + 80, boxY + 55);
    } else {
        fill(textColor[0], textColor[1], textColor[2], 150);
        text("?", graphLeft + 80, boxY + 55);
    }

    // Particle B box
    fill(colors.particleB[0], colors.particleB[1], colors.particleB[2], 30);
    stroke(colors.particleB[0], colors.particleB[1], colors.particleB[2]);
    strokeWeight(2);
    rect(graphRight - 150, boxY, 140, boxHeight, 8);

    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(CENTER);
    textSize(11);
    text("Particle B", graphRight - 80, boxY + 20);

    textSize(18);
    if (particleB.measured) {
        fill(particleB.spin === 1 ? colors.spinUp : colors.spinDown);
        text(particleB.spin === 1 ? "↑" : "↓", graphRight - 80, boxY + 55);
    } else {
        fill(textColor[0], textColor[1], textColor[2], 150);
        text("?", graphRight - 80, boxY + 55);
    }

    // Correlation indicator
    const corrY = boxY + boxHeight + 40;
    fill(textColor[0], textColor[1], textColor[2]);
    textSize(11);
    text("Correlation", graphMidX, corrY);

    // Correlation bar
    let corrWidth = 200;
    let corrHeight = 20;
    let corrX = graphMidX - corrWidth / 2;

    fill(colors.bg[0] + 20, colors.bg[1] + 20, colors.bg[2] + 20);
    stroke(textColor[0], textColor[1], textColor[2], 50);
    strokeWeight(1);
    rect(corrX, corrY + 10, corrWidth, corrHeight, 4);

    // Fill based on state
    if (particleA.measured && particleB.measured) {
        // Perfect anti-correlation
        fill(colors.connection[0], colors.connection[1], colors.connection[2]);
        noStroke();
        rect(corrX + 2, corrY + 12, corrWidth - 4, corrHeight - 4, 3);

        fill(255);
        textSize(10);
        text("100% Anti-correlated", graphMidX, corrY + 24);
    } else if (entangled) {
        // Entangled but not measured
        let pulseWidth = (corrWidth - 4) * (0.5 + sin(time * 2) * 0.3);
        fill(colors.connection[0], colors.connection[1], colors.connection[2], 100);
        noStroke();
        rect(corrX + (corrWidth - pulseWidth) / 2, corrY + 12, pulseWidth, corrHeight - 4, 3);
    }

    // Explanation
    textSize(10);
    fill(textColor[0], textColor[1], textColor[2], 150);
    textAlign(CENTER);

    let explanationY = corrY + 60;
    if (!particleA.measured && !particleB.measured) {
        text("Particles are entangled.", graphMidX, explanationY);
        text("Measure one to collapse both!", graphMidX, explanationY + 16);
    } else {
        text("Spins are always opposite!", graphMidX, explanationY);
        text("\"Spooky action at a distance\"", graphMidX, explanationY + 16);
    }

    // Legend
    let legendY = graphBottom - 60;
    textSize(10);
    textAlign(LEFT);

    fill(colors.spinUp[0], colors.spinUp[1], colors.spinUp[2]);
    ellipse(graphLeft + 20, legendY, 10, 10);
    fill(textColor[0], textColor[1], textColor[2]);
    text("Spin Up", graphLeft + 30, legendY + 4);

    fill(colors.spinDown[0], colors.spinDown[1], colors.spinDown[2]);
    ellipse(graphLeft + 20, legendY + 20, 10, 10);
    fill(textColor[0], textColor[1], textColor[2]);
    text("Spin Down", graphLeft + 30, legendY + 24);

    pop();
}

function drawTitle() {
    push();
    fill(textColor[0], textColor[1], textColor[2]);
    noStroke();
    textAlign(LEFT);
    textSize(12);
    text("Quantum Entanglement", 25, 28);
    textSize(10);
    fill(textColor[0], textColor[1], textColor[2], 180);
    text("Two particles, one quantum state", 25, 46);
    pop();
}

function windowResized() { }
