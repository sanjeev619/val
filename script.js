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

function moveNoButton() {
  const areaRect = noArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  // Compute movement bounds inside noArea
  const maxX = areaRect.width - btnRect.width;
  const maxY = areaRect.height - btnRect.height;

  // If area is too small, just nudge
  const x = clamp(rand(0, maxX), 0, Math.max(0, maxX));
  const y = clamp(rand(0, maxY), 0, Math.max(0, maxY));

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  // Fun tiny rotation
  const rot = rand(-10, 10);
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
// Desktop: Hover/move anywhere on the card makes it run away
card.addEventListener("mousemove", () => {
  moveNoButton();
  showNoTease();
});

// Mobile: Touchstart makes it jump away before click
card.addEventListener("touchstart", (e) => {
  e.preventDefault(); // prevent "click" from firing reliably
  moveNoButton();
  showNoTease();
}, { passive: false });

card.addEventListener("touchmove", (e) => {
  e.preventDefault();
  moveNoButton();
  showNoTease();
}, { passive: false });

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
