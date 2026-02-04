// --- Elements ---
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");
const card = document.getElementById("card");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

let confettiRunning = false;
let confettiPieces = [];
let rafId = null;

// --- Helpers ---
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

window.addEventListener("load", () => {
  noBtn.classList.add("offscreen");
  noBtn.disabled = true;
  noBtn.setAttribute("aria-hidden", "true");
  noBtn.tabIndex = -1;
  setCanvasSize();
});

// Keep canvas correct on resize / rotate
window.addEventListener("resize", () => {
  setCanvasSize();
});
