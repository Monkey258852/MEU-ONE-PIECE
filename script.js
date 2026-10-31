
const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");

const intro = document.getElementById("intro");
const ready = document.getElementById("ready");
const startButton = document.getElementById("startButton");
const mysteryBox = document.getElementById("mysteryBox");
const universe = document.getElementById("universe");
const astronaut = document.getElementById("astronaut");
const message = document.getElementById("message");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let phase = "initialComets";
let stars = [];
let comets = [];
let particles = [];

let currentMessage = 0;
let typingTimer = null;
let messageTimer = null;

const messages = [
    "Como Luffy procura o One Piece, eu procuro você.",
    "You are the best thing that has happened in my life.",
    "Quando nos separamos, a saudade que sinto de ti é imensa. Não consigo deixar de pensar em ti nem por um segundo.",
    "Your smell is so nice that it stays in my mind even when we are far apart.",
    "I like you.",
    "I want you.",
    "I miss you.",
    "I LOVE YOU ❤️"
];

// ===================================
// 1. CONFIGURAÇÃO DO CANVAS
// ===================================

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    createStars();
}

window.addEventListener("resize", resizeCanvas);

// ===================================
// 2. CRIAR ESTRELAS
// ===================================

function createStars() {
    stars = [];

    for (let i = 0; i < 180; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.4,
            speed: Math.random() * 0.5 + 0.1,
            alpha: Math.random()
        });
    }
}

function drawSpace() {
    const gradient = ctx.createLinearGradient(
        0, 0, width, height
    );

    gradient.addColorStop(0, "#020014");
    gradient.addColorStop(0.5, "#10052d");
    gradient.addColorStop(1, "#020014");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    stars.forEach(star => {
        star.alpha += (Math.random() - 0.5) * 0.04;

        star.alpha = Math.max(
            0.2,
            Math.min(1, star.alpha)
        );

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fill();

        star.y += star.speed;

        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
    });
}

// ===================================
// 3. SISTEMA DOS COMETAS
// ===================================

function createComet(startX, startY, targetX, targetY, color) {
    return {
        x: startX,
        y: startY,
        startX,
        startY,
        targetX,
        targetY,
        progress: 0,
        speed: 0.012,
        color,
        trail: []
    };
}

function drawComet(comet) {
    if (comet.progress < 1) {
        comet.progress += comet.speed;
    }

    const t = Math.min(comet.progress, 1);

    comet.x = comet.startX +
        (comet.targetX - comet.startX) * t;

    comet.y = comet.startY +
        (comet.targetY - comet.startY) * t;

    comet.trail.push({
        x: comet.x,
        y: comet.y
    });

    if (comet.trail.length > 20) {
        comet.trail.shift();
    }

    // Desenhar a cauda
    for (let i = 0; i < comet.trail.length; i++) {
        const point = comet.trail[i];
        const alpha = i / comet.trail.length;

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            2 + alpha * 4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = comet.color;
        ctx.globalAlpha = alpha * 0.7;
        ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Cabeça brilhante do cometa
    ctx.save();

    ctx.shadowBlur = 25;
    ctx.shadowColor = comet.color;

    ctx.beginPath();

    ctx.arc(
        comet.x,
        comet.y,
        6,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();

    return comet.progress >= 1;
}

// ===================================
// 4. PRIMEIRA COLISÃO
// ===================================

function launchInitialComets() {
    const centerX = width / 2;
    const centerY = height / 2;

    comets = [
        createComet(
            0,
            height * 0.15,
            centerX,
            centerY,
            "#55cfff"
        ),

        createComet(
            width,
            height * 0.85,
            centerX,
            centerY,
            "#bd68ff"
        )
    ];
}

// ===================================
// 5. EXPLOSÃO
// ===================================

function createExplosion(x = width / 2, y = height / 2) {
    particles = [];

    for (let i = 0; i < 140; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 1;

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1,
            life: 1,
            color: Math.random() > 0.5
                ? "#9b5cff"
                : "#54dfff"
        });
    }
}

function drawExplosion() {
    let alive = false;

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        p.life -= 0.012;

        if (p.life > 0) {
            alive = true;

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();

            ctx.globalAlpha = 1;
        }
    });

    return !alive;
}

// ===================================
// 6. MOSTRAR A PERGUNTA
// ===================================

function showReady() {
    phase = "black";

    intro.style.display = "flex";
    universe.style.display = "none";
    mysteryBox.style.display = "none";

    ready.textContent = "Are you ready?";

    startButton.textContent = "Start the Journey ✨";
    startButton.style.display = "block";
    startButton.style.visibility = "visible";
}

// ===================================
// 7. BOTÃO E CAIXA MISTERIOSA
// ===================================

function startJourney() {
    if (phase !== "black") {
        return;
    }

    phase = "box";

    intro.style.display = "none";
    mysteryBox.style.display = "flex";

    mysteryBox.classList.remove("open");
    mysteryBox.classList.remove("shake");

    void mysteryBox.offsetWidth;

    mysteryBox.classList.add("shake");

    // A caixa vibra durante algum tempo
    setTimeout(() => {
        if (phase !== "box") return;

        mysteryBox.classList.remove("shake");
        mysteryBox.classList.add("open");

    }, 2200);

    // Depois de abrir, os cometas aparecem
    setTimeout(() => {
        if (phase !== "box") return;

        mysteryBox.style.display = "none";

        launchBoxComets();

        phase = "secondComets";

    }, 3200);
}

// ===================================
// 8. SEGUNDA COLISÃO
// ===================================

function launchBoxComets() {
    const centerX = width / 2;
    const centerY = height / 2;

    // Os dois cometas partem de junto da caixa
    comets = [
        createComet(
            centerX - 100,
            centerY,
            centerX,
            centerY,
            "#55cfff"
        ),

        createComet(
            centerX + 100,
            centerY,
            centerX,
            centerY,
            "#bd68ff"
        )
    ];

    comets.forEach(comet => {
        comet.speed = 0.018;
    });
}

// ===================================
// 9. ENTRAR NO UNIVERSO
// ===================================

function showUniverse() {
    phase = "universe";

    intro.style.display = "none";
    mysteryBox.style.display = "none";
    universe.style.display = "block";

    currentMessage = 0;

    astronaut.style.left = "10%";
    astronaut.style.top = "60%";

    showMessage();
}

// ===================================
// 10. ESCREVER AS MENSAGENS
// ===================================

function showMessage() {
    clearInterval(typingTimer);
    clearTimeout(messageTimer);

    if (currentMessage >= messages.length) {
        showFinal();
        return;
    }

    const text = messages[currentMessage];

    message.textContent = "";

    let index = 0;

    typingTimer = setInterval(() => {
        message.textContent += text[index];

        index++;

        if (index >= text.length) {
            clearInterval(typingTimer);

            messageTimer = setTimeout(() => {
                currentMessage++;

                if (currentMessage < messages.length) {
                    const nextPosition = 10 + currentMessage * 10;

                    astronaut.style.left =
                        Math.min(nextPosition, 85) + "%";

                    astronaut.style.top =
                        (60 - (currentMessage % 3) * 12) + "%";
                }

                showMessage();

            }, 2500);
        }

    }, 65);
}

// ===================================
// 11. CENA FINAL
// ===================================

function showFinal() {
    phase = "final";

    message.textContent = "I LOVE YOU ❤️";

    astronaut.style.left = "50%";
    astronaut.style.top = "40%";

    const heart = document.createElement("div");

    heart.className = "final-heart";
    heart.textContent = "❤️";

    universe.appendChild(heart);
}

// ===================================
// 12. ANIMAÇÃO PRINCIPAL
// ===================================

function animate() {
    requestAnimationFrame(animate);

    // Ecrã preto enquanto aparece a pergunta
    if (phase === "black") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        return;
    }

    drawSpace();

    // PRIMEIROS COMETAS
    if (phase === "initialComets") {
        let finished = 0;

        comets.forEach(comet => {
            if (drawComet(comet)) {
                finished++;
            }
        });

        if (finished === comets.length) {
            createExplosion();
            phase = "initialExplosion";
        }
    }

    // PRIMEIRA EXPLOSÃO
    else if (phase === "initialExplosion") {
        if (drawExplosion()) {
            showReady();
        }
    }

    // COMETAS QUE SAEM DA CAIXA
    else if (phase === "secondComets") {
        let finished = 0;

        comets.forEach(comet => {
            if (drawComet(comet)) {
                finished++;
            }
        });

        if (finished === comets.length) {
            createExplosion();
            phase = "secondExplosion";
        }
    }

    // SEGUNDA EXPLOSÃO
    else if (phase === "secondExplosion") {
        if (drawExplosion()) {
            showUniverse();
        }
    }

    // A CAIXA ESTÁ A VIBRAR
    else if (phase === "box") {
        // O fundo espacial continua visível.
    }

    // UNIVERSO E CENA FINAL
    else if (phase === "universe" || phase === "final") {
        // O espaço continua animado por trás do conteúdo.
    }
}

// ===================================
// 13. INICIAR
// ===================================

createStars();
launchInitialComets();
animate();
