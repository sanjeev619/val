// --- Elements ---
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const noArea = document.getElementById("noArea");
const result = document.getElementById("result");
const card = document.getElementById("card");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

let confettiRunning = false;
let confettiPieces = [];
let rafId = null;

// --- Helpers ---
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function setCanvasSize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = "100%";
  confettiCanvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function moveNoButton(cursorX, cursorY) {
  const cardRect = card.getBoundingClientRect();
  const areaRect = noArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const fallbackX = cardRect.left + cardRect.width / 2;
  const fallbackY = cardRect.top + cardRect.height / 2;
  const pointerX = cursorX ?? fallbackX;
  const pointerY = cursorY ?? fallbackY;

  const margin = 12;
  const minX = cardRect.left + margin;
  const maxX = cardRect.right - btnRect.width - margin;
  const minY = cardRect.top + margin;
  const maxY = cardRect.bottom - btnRect.height - margin;

  const currentCenterX = btnRect.left + btnRect.width / 2;
  const currentCenterY = btnRect.top + btnRect.height / 2;
  const dx = currentCenterX - pointerX;
  const dy = currentCenterY - pointerY;

  const boost = rand(90, 170);
  const jitterX = rand(-36, 36);
  const jitterY = rand(-36, 36);

  const targetViewportX = clamp(
    btnRect.left + dx * 0.65 + Math.sign(dx || 1) * boost + jitterX,
    minX,
    maxX,
  );
  const targetViewportY = clamp(
    btnRect.top + dy * 0.65 + Math.sign(dy || 1) * boost + jitterY,
    minY,
    maxY,
  );

  noBtn.style.left = `${targetViewportX - areaRect.left}px`;
  noBtn.style.top = `${targetViewportY - areaRect.top}px`;

  const rot = rand(-14, 14);
  noBtn.style.transform = `rotate(${rot}deg)`;
}

function showYesMessage() {
  result.innerHTML = `
    <div class="pop">
      <div class="big">Yaaay! <span class="heartbeat">💖</span></div>
      <div class="small">Okay, it’s official. You’re my Valentine! 🥹🌹</div>
    </div>
  `;
  // Make the card do a subtle bounce
  card.classList.remove("pop");
  void card.offsetWidth; // reflow
  card.classList.add("pop");
}

function showNoTease() {
  result.innerHTML = `
    <div class="pop">
      <div class="big">Nice try 😄</div>
      <div class="small">That button is… unavailable today 😈</div>
    </div>
  `;
}

// --- Confetti ---
function makeConfetti(count = 180) {
  confettiPieces = Array.from({ length: count }, () => ({
    x: rand(0, window.innerWidth),
    y: rand(-window.innerHeight, 0),
    w: rand(6, 12),
    h: rand(8, 16),
    vx: rand(-1.6, 1.6),
    vy: rand(2.2, 5.5),
    rot: rand(0, Math.PI),
    vr: rand(-0.14, 0.14),
    // random pastel-ish hsl
    hue: Math.floor(rand(0, 360)),
    alpha: rand(0.75, 1),
  }));
}

function drawConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of confettiPieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    // wrap
    if (p.y > window.innerHeight + 30) {
      p.y = rand(-100, -10);
      p.x = rand(0, window.innerWidth);
    }
    if (p.x < -30) p.x = window.innerWidth + 30;
    if (p.x > window.innerWidth + 30) p.x = -30;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `hsl(${p.hue} 90% 65%)`;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  rafId = requestAnimationFrame(drawConfetti);
}

function startConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;
  setCanvasSize();
  makeConfetti(220);
  drawConfetti();

  // stop after a while
  setTimeout(() => stopConfetti(), 4200);
}

function stopConfetti() {
  confettiRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

// --- Events ---
// Desktop: the No button runs from the cursor immediately
card.addEventListener("mousemove", (e) => {
  moveNoButton(e.clientX, e.clientY);
  showNoTease();
});

// Mobile: Touchstart makes it jump away before click
card.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  if (!t) return;
  moveNoButton(t.clientX, t.clientY);
  showNoTease();
}, { passive: true });

card.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (!t) return;
  moveNoButton(t.clientX, t.clientY);
  showNoTease();
}, { passive: true });

noBtn.addEventListener("mouseenter", (e) => {
  moveNoButton(e.clientX, e.clientY);
  showNoTease();
});

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButton();
  showNoTease();
});

// Yes: celebrate
yesBtn.addEventListener("click", () => {
  showYesMessage();
  startConfetti();

  // disable buttons after yes (optional)
  yesBtn.disabled = true;
  noBtn.disabled = true;
  yesBtn.style.opacity = "0.9";
  noBtn.style.opacity = "0.7";
});

// On load, place No randomly once
window.addEventListener("load", () => {
  moveNoButton();
  setCanvasSize();
});

// Keep canvas correct on resize / rotate
window.addEventListener("resize", () => {
  setCanvasSize();
});
