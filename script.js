const noBtn = document.getElementById("no");
const msg = document.getElementById("msg");

const frases = [
    "🥺 ¿Segura?",
    "❤️ Mejor piénsalo otra vez",
    "😭 No seas así",
    "💕 Dale al botón de al lado",
    "✨ Ese botón no funciona jeje",
    "🥹 Andaleee"
];

let lastMove = 0;

function moverBoton() {

    const now = Date.now();

    // evita que se mueva demasiadas veces por segundo
    if (now - lastMove < 250) return;

    lastMove = now;

    const margin = 20;

    const maxX = window.innerWidth - noBtn.offsetWidth - margin;
    const maxY = window.innerHeight - noBtn.offsetHeight - margin;

    let x = Math.random() * maxX;
    let y = Math.random() * maxY;

    noBtn.style.position = "fixed";
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;

    msg.textContent =
        frases[Math.floor(Math.random() * frases.length)];
}

// Detectar cuando el cursor se acerca
document.addEventListener("mousemove", (e) => {

    const rect = noBtn.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const distancia = Math.sqrt(dx * dx + dy * dy);

    if (distancia < 100) {
        moverBoton();
    }
});

// En celular
noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moverBoton();
});
