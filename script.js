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

const MARGIN = 14;       // separación mínima con los bordes
const SAFE_DIST = 150;   // a qué distancia mínima quiere quedar del cursor
const TRIGGER = 100;     // a qué distancia empieza a huir

let moved = false;       // ya salió de su posición original?
let lastPhrase = 0;
const pointer = { x: -9999, y: -9999 };

no.setAttribute("tabindex", "-1"); // que no se pueda alcanzar con Tab + Enter

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* Límites reales de la ventana, recalculados cada vez (rotación, teclado, zoom...) */
function limits() {
  const w = no.offsetWidth;
  const h = no.offsetHeight;
  return {
    w,
    h,
    minX: MARGIN,
    minY: MARGIN,
    maxX: Math.max(MARGIN, window.innerWidth - w - MARGIN),
    maxY: Math.max(MARGIN, window.innerHeight - h - MARGIN)
  };
}

/* Coloca el botón asegurando que SIEMPRE quede visible */
function placeAt(x, y) {
  const L = limits();

  // Si la pantalla es más chica que el botón, lo centramos en vez de sacarlo
  const left =
    window.innerWidth - L.w < MARGIN * 2
      ? Math.max(0, (window.innerWidth - L.w) / 2)
      : clamp(x, L.minX, L.maxX);

  const top =
    window.innerHeight - L.h < MARGIN * 2
      ? Math.max(0, (window.innerHeight - L.h) / 2)
      : clamp(y, L.minY, L.maxY);

  no.style.position = "fixed";
  no.style.zIndex = "9999";
  no.style.left = `${left}px`;
  no.style.top = `${top}px`;
  moved = true;
}

/* Busca una posición aleatoria pero LEJOS del dedo/cursor */
function escapeFrom(px, py) {
  const L = limits();
  let best = { x: L.minX, y: L.minY };
  let bestDist = -1;

  for (let i = 0; i < 25; i++) {
    const x = L.minX + Math.random() * (L.maxX - L.minX);
    const y = L.minY + Math.random() * (L.maxY - L.minY);
    const d = Math.hypot(x + L.w / 2 - px, y + L.h / 2 - py);
    if (d > bestDist) {
      bestDist = d;
      best = { x, y };
    }
    if (d > SAFE_DIST) break; // ya está suficientemente lejos
  }

  placeAt(best.x, best.y);

  const now = Date.now();
  if (now - lastPhrase > 400) {
    lastPhrase = now;
    msg.textContent = frases[Math.floor(Math.random() * frases.length)];
  }
}

/* Huye del puntero (mouse, dedo o lápiz) */
function handlePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  const r = no.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (Math.hypot(x - cx, y - cy) < TRIGGER) escapeFrom(x, y);
}

document.addEventListener(
  "pointermove",
  (e) => handlePointer(e.clientX, e.clientY),
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (e) => {
    const t = e.touches[0];
    if (t) handlePointer(t.clientX, t.clientY);
  },
  { passive: true }
);

/* Si de alguna forma logra tocarlo, igual no pasa nada: se escapa */
["pointerdown", "mousedown", "touchstart", "click"].forEach((ev) => {
  no.addEventListener(
    ev,
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? pointer.x;
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? pointer.y;
      escapeFrom(x, y);
    },
    { passive: false }
  );
});

/* Reajuste al redimensionar / girar el móvil: nunca queda fuera */
function keepInside() {
  if (!moved) return;
  const r = no.getBoundingClientRect();
  placeAt(r.left, r.top);
}

window.addEventListener("resize", keepInside);
window.addEventListener("orientationchange", keepInside);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", keepInside);
}
// red de seguridad por si algo raro pasa
setInterval(keepInside, 1000);

/* Al presionar "Chi" */
yes.onclick = async () => {
  if (typeof confetti === "function") {
    confetti({ particleCount: 250, spread: 120 });
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

/* Corazones flotando */
for (let i = 0; i < 30; i++) {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "❤️";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.fontSize = 18 + Math.random() * 20 + "px";
  heart.style.animationDuration = 5 + Math.random() * 5 + "s";
  heart.style.animationDelay = Math.random() * 5 + "s";
  document.body.appendChild(heart);
}
