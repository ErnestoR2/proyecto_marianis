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

const MARGIN = 14;      // separación mínima con los bordes
const SAFE_DIST = 150;  // distancia mínima a la que quiere quedar del cursor
const TRIGGER = 110;    // distancia a la que empieza a huir

let lastPhrase = 0;
const pointer = { x: -9999, y: -9999 };

/* ==================================================================
   1) Sacamos el botón "No" de #main y lo colgamos de <body>.
      Motivo: si un padre tiene transform / filter / perspective,
      'position: fixed' se mide contra ESE padre y no contra la
      pantalla -> el botón se pierde. Colgado de <body> nunca pasa.
================================================================== */

// (a) Guardamos su apariencia ANTES de moverlo, porque reglas como
//     ".buttons button {...}" dejarían de aplicarle.
const cs = getComputedStyle(no);
const VISUALES = [
  "background-color", "background-image", "background-size", "background-position",
  "color", "border-top", "border-right", "border-bottom", "border-left",
  "border-radius", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "font-family", "font-size", "font-weight", "font-style", "line-height",
  "letter-spacing", "text-transform", "text-shadow", "box-shadow",
  "cursor", "width", "height", "min-width", "min-height", "box-sizing",
  "text-align", "white-space", "outline"
];
const apariencia = {};
VISUALES.forEach((p) => (apariencia[p] = cs.getPropertyValue(p)));

const startRect = no.getBoundingClientRect();

// (b) Hueco del mismo tamaño para que el botón "Chi" no se desacomode
const placeholder = document.createElement("span");
placeholder.style.display = "inline-block";
placeholder.style.width = startRect.width + "px";
placeholder.style.height = startRect.height + "px";
no.parentNode.insertBefore(placeholder, no);

// (c) Lo mudamos a <body>
document.body.appendChild(no);
no.setAttribute("tabindex", "-1"); // que no se alcance con Tab + Enter

// (d) Le devolvemos su apariencia y le fijamos la posición con !important
function lockStyles() {
  const s = no.style;
  for (const p in apariencia) s.setProperty(p, apariencia[p], "important");
  s.setProperty("position", "fixed", "important");
  s.setProperty("display", "inline-block", "important");
  s.setProperty("margin", "0", "important");
  s.setProperty("transform", "none", "important");
  s.setProperty("animation", "none", "important");
  s.setProperty("right", "auto", "important");
  s.setProperty("bottom", "auto", "important");
  s.setProperty("z-index", "99999", "important");
  s.setProperty("visibility", "visible", "important");
  s.setProperty("opacity", "1", "important");
  s.setProperty("pointer-events", "auto", "important");
  s.setProperty("touch-action", "manipulation", "important");
  s.setProperty("user-select", "none", "important");
  s.setProperty("-webkit-user-select", "none", "important");
  s.setProperty("-webkit-tap-highlight-color", "transparent", "important");
}
lockStyles();

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function limits() {
  const w = no.offsetWidth || startRect.width || 90;
  const h = no.offsetHeight || startRect.height || 44;
  return {
    w, h,
    minX: MARGIN,
    minY: MARGIN,
    maxX: Math.max(MARGIN, window.innerWidth - w - MARGIN),
    maxY: Math.max(MARGIN, window.innerHeight - h - MARGIN)
  };
}

/* Coloca el botón garantizando que quede DENTRO de la pantalla */
function placeAt(x, y) {
  const L = limits();
  const left =
    window.innerWidth - L.w < MARGIN * 2
      ? Math.max(0, (window.innerWidth - L.w) / 2)
      : clamp(x, L.minX, L.maxX);
  const top =
    window.innerHeight - L.h < MARGIN * 2
      ? Math.max(0, (window.innerHeight - L.h) / 2)
      : clamp(y, L.minY, L.maxY);

  lockStyles();
  no.style.setProperty("left", left + "px", "important");
  no.style.setProperty("top", top + "px", "important");
}

// Arranca justo donde estaba visualmente
placeAt(startRect.left, startRect.top);

/* ==================================================================
   2) Escapar del dedo / cursor
================================================================== */
function escapeFrom(px, py) {
  const L = limits();
  let best = { x: L.minX, y: L.minY };
  let bestDist = -1;

  for (let i = 0; i < 30; i++) {
    const x = L.minX + Math.random() * (L.maxX - L.minX);
    const y = L.minY + Math.random() * (L.maxY - L.minY);
    const d = Math.hypot(x + L.w / 2 - px, y + L.h / 2 - py);
    if (d > bestDist) { bestDist = d; best = { x, y }; }
    if (d > SAFE_DIST) break;
  }

  placeAt(best.x, best.y);

  const now = Date.now();
  if (now - lastPhrase > 400) {
    lastPhrase = now;
    msg.textContent = frases[Math.floor(Math.random() * frases.length)];
  }
}

function handlePointer(x, y) {
  pointer.x = x;
  pointer.y = y;
  const r = no.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (Math.hypot(x - cx, y - cy) < TRIGGER) escapeFrom(x, y);
}

document.addEventListener("pointermove", (e) => handlePointer(e.clientX, e.clientY), { passive: true });
document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (t) handlePointer(t.clientX, t.clientY);
}, { passive: true });

/* Si logra tocarlo, no pasa nada: se escapa igual */
["pointerdown", "mousedown", "touchstart", "click"].forEach((ev) => {
  no.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    const t = e.touches && e.touches[0];
    const x = e.clientX ?? (t ? t.clientX : pointer.x);
    const y = e.clientY ?? (t ? t.clientY : pointer.y);
    escapeFrom(x, y);
  }, { passive: false });
});

/* ==================================================================
   3) Vigilante: si queda fuera de la pantalla o invisible, vuelve
================================================================== */
function keepInside() {
  const r = no.getBoundingClientRect();
  const fuera =
    r.width === 0 || r.height === 0 ||
    r.left < 0 || r.top < 0 ||
    r.right > window.innerWidth || r.bottom > window.innerHeight;
  if (fuera) placeAt(r.left, r.top);
}

window.addEventListener("resize", keepInside);
window.addEventListener("scroll", keepInside);
window.addEventListener("orientationchange", () => setTimeout(keepInside, 300));
if (window.visualViewport) window.visualViewport.addEventListener("resize", keepInside);
setInterval(keepInside, 500); // red de seguridad

/* ==================================================================
   4) Al presionar "Chi"
================================================================== */
yes.onclick = async () => {
  if (typeof confetti === "function") {
    confetti({ particleCount: 250, spread: 120 });
  }
  no.style.setProperty("display", "none", "important");
  placeholder.remove();
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

/* ==================================================================
   5) Corazones flotando (dentro de #hearts, como espera tu CSS)
================================================================== */
const heartsBox = document.getElementById("hearts") || document.body;
for (let i = 0; i < 30; i++) {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "❤️";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.fontSize = 18 + Math.random() * 20 + "px";
  heart.style.animationDuration = 5 + Math.random() * 5 + "s";
  heart.style.animationDelay = Math.random() * 5 + "s";
  heartsBox.appendChild(heart);
}
