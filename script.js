const no = document.getElementById("no");
const yes = document.getElementById("yes");
const msg = document.getElementById("msg");

const frases = [
    "🥺 ¿Segura?",
    "❤️ Mejor piénsalo otra vez",
    "😭 No seas así",
    "💕 Dale al botón de al lado",
    "✨ Ese botón no funciona jeje",
    "🥹 Andaleee",
    "😢 No me atraparás",
    "😂 Casi..."
];

let lastMove = 0;

// Mueve el botón a una posición aleatoria SIEMPRE dentro de la pantalla
function move() {

    const now = Date.now();

    // Evita que se mueva demasiadas veces por segundo
    if (now - lastMove < 200) return;

    lastMove = now;

    const margin = 20;

    const maxX = window.innerWidth - no.offsetWidth - margin;
    const maxY = window.innerHeight - no.offsetHeight - margin;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    no.style.position = "fixed";
    no.style.left = `${x}px`;
    no.style.top = `${y}px`;

    msg.textContent =
        frases[Math.floor(Math.random() * frases.length)];
}

// Hace que escape cuando el cursor está cerca
document.addEventListener("mousemove", (e) => {

    const rect = no.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // Solo escapa cuando realmente estás cerca
    if (distance < 90) {
        move();
    }
});

// Para dispositivos móviles
no.addEventListener("touchstart", (e) => {
    e.preventDefault();
    move();
});

// Al presionar "Chi"
yes.onclick = async () => {

    if (typeof confetti === "function") {
        confetti({
            particleCount: 250,
            spread: 120
        });
    }

    document.getElementById("main").classList.add("hidden");
    document.getElementById("letter").classList.remove("hidden");

    try {

        const response = await fetch("carta.md");
        const texto = await response.text();

        document.getElementById("content").textContent = texto;

    } catch {

        document.getElementById("content").textContent =
            "Escribe aquí tu carta en el archivo carta.md ❤️";
    }
};

// Corazones flotando
for (let i = 0; i < 30; i++) {

    const heart = document.createElement("div");

    heart.className = "heart";
    heart.textContent = "❤️";

    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = (18 + Math.random() * 20) + "px";
    heart.style.animationDuration = (5 + Math.random() * 5) + "s";
    heart.style.animationDelay = Math.random() * 5 + "s";

    document.body.appendChild(heart);
}
