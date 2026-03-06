/**
 * Devizly Marketing Kit Generator
 * Generates LinkedIn, Twitter, and Website hero images
 *
 * Usage: node scripts/generate-marketing.mjs
 */

import { createCanvas, registerFont } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "marketing");
mkdirSync(OUT, { recursive: true });

/* ── Brand tokens ─────────────────────────────────── */
const COLORS = {
  bg: "#0A0A0A",
  violet: "#6366F1",
  emerald: "#22D3A5",
  white: "#FFFFFF",
  whiteAlpha: "rgba(255,255,255,0.7)",
  whiteAlpha2: "rgba(255,255,255,0.15)",
  gradientStart: "#6366F1",
  gradientEnd: "#22D3A5",
};

/* ── Helpers ──────────────────────────────────────── */

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGradientBg(ctx, w, h) {
  // Solid dark bg
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  // Bottom gradient glow
  const glow = ctx.createRadialGradient(w * 0.5, h * 1.1, 0, w * 0.5, h * 1.1, w * 0.6);
  glow.addColorStop(0, "rgba(99,102,241,0.25)");
  glow.addColorStop(0.5, "rgba(34,211,165,0.10)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Top-left subtle glow
  const glow2 = ctx.createRadialGradient(w * 0.15, h * 0.2, 0, w * 0.15, h * 0.2, w * 0.35);
  glow2.addColorStop(0, "rgba(99,102,241,0.12)");
  glow2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, w, h);
}

function drawLogo(ctx, x, y, size) {
  const s = size / 48;

  // Rounded square
  ctx.save();
  drawRoundedRect(ctx, x, y, size, size, 12 * s);
  ctx.fillStyle = COLORS.emerald;
  ctx.fill();

  // Document
  ctx.beginPath();
  ctx.moveTo(x + 16 * s, y + 10 * s);
  ctx.lineTo(x + 27 * s, y + 10 * s);
  ctx.lineTo(x + 34 * s, y + 17 * s);
  ctx.lineTo(x + 34 * s, y + 36 * s);
  ctx.quadraticCurveTo(x + 34 * s, y + 38 * s, x + 32 * s, y + 38 * s);
  ctx.lineTo(x + 16 * s, y + 38 * s);
  ctx.quadraticCurveTo(x + 14 * s, y + 38 * s, x + 14 * s, y + 36 * s);
  ctx.lineTo(x + 14 * s, y + 12 * s);
  ctx.quadraticCurveTo(x + 14 * s, y + 10 * s, x + 16 * s, y + 10 * s);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();

  // Lightning bolt
  ctx.beginPath();
  ctx.moveTo(x + 25 * s, y + 18 * s);
  ctx.lineTo(x + 20 * s, y + 26 * s);
  ctx.lineTo(x + 24 * s, y + 26 * s);
  ctx.lineTo(x + 22 * s, y + 34 * s);
  ctx.lineTo(x + 29 * s, y + 24 * s);
  ctx.lineTo(x + 25 * s, y + 24 * s);
  ctx.lineTo(x + 27 * s, y + 18 * s);
  ctx.closePath();
  ctx.fillStyle = COLORS.emerald;
  ctx.fill();
  ctx.restore();
}

function drawLogoWithText(ctx, x, y, iconSize, fontSize) {
  drawLogo(ctx, x, y, iconSize);
  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText("Devizly", x + iconSize + fontSize * 0.4, y + iconSize / 2);
}

function drawDashboardMockup(ctx, x, y, w, h) {
  // Card background
  drawRoundedRect(ctx, x, y, w, h, 16);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const pad = 20;
  const innerW = w - pad * 2;

  // Title bar
  ctx.fillStyle = COLORS.whiteAlpha;
  ctx.font = "bold 14px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("Tableau de bord", x + pad, y + pad);

  // Dots (window controls)
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(x + w - pad - i * 16, y + pad + 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = ["#EF4444", "#F59E0B", "#22C55E"][i];
    ctx.fill();
  });

  // Stat cards row
  const cardY = y + 50;
  const cardW = (innerW - 20) / 3;
  const cardH = 60;
  const stats = [
    { label: "Devis ce mois", value: "24", color: COLORS.emerald },
    { label: "En attente", value: "8", color: COLORS.violet },
    { label: "CA", value: "12 450 EUR", color: COLORS.emerald },
  ];
  stats.forEach((stat, i) => {
    const cx = x + pad + i * (cardW + 10);
    drawRoundedRect(ctx, cx, cardY, cardW, cardH, 8);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px sans-serif";
    ctx.fillText(stat.label, cx + 12, cardY + 12);

    ctx.fillStyle = stat.color;
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(stat.value, cx + 12, cardY + 34);
  });

  // Table rows
  const tableY = cardY + cardH + 20;
  const rows = [
    { client: "Restaurant Le Zinc", amount: "2 400 EUR", status: "Accepte" },
    { client: "Studio Photo Max", amount: "1 850 EUR", status: "En attente" },
    { client: "Cabinet Dupont", amount: "3 200 EUR", status: "Envoye" },
    { client: "Agence WebFlow", amount: "4 100 EUR", status: "Accepte" },
  ];

  // Table header
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("Client", x + pad, tableY);
  ctx.fillText("Montant", x + pad + innerW * 0.5, tableY);
  ctx.fillText("Statut", x + pad + innerW * 0.78, tableY);

  rows.forEach((row, i) => {
    const ry = tableY + 22 + i * 28;

    // Subtle row bg
    if (i % 2 === 0) {
      drawRoundedRect(ctx, x + pad - 4, ry - 4, innerW + 8, 24, 4);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fill();
    }

    ctx.fillStyle = COLORS.whiteAlpha;
    ctx.font = "13px sans-serif";
    ctx.fillText(row.client, x + pad, ry);

    ctx.fillStyle = COLORS.white;
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(row.amount, x + pad + innerW * 0.5, ry);

    // Status pill
    const statusColors = {
      "Accepte": COLORS.emerald,
      "En attente": "#F59E0B",
      "Envoye": COLORS.violet,
    };
    const pillColor = statusColors[row.status] || COLORS.whiteAlpha;
    const pillX = x + pad + innerW * 0.78;
    ctx.font = "bold 10px sans-serif";
    const pillW = ctx.measureText(row.status).width + 16;
    drawRoundedRect(ctx, pillX, ry - 3, pillW, 18, 9);
    ctx.fillStyle = pillColor + "22";
    ctx.fill();
    ctx.fillStyle = pillColor;
    ctx.fillText(row.status, pillX + 8, ry + 1);
  });
}

function drawPhoneMockup(ctx, x, y, w, h) {
  // Phone outline
  drawRoundedRect(ctx, x, y, w, h, 24);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Notch
  const notchW = w * 0.35;
  drawRoundedRect(ctx, x + (w - notchW) / 2, y + 6, notchW, 14, 7);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fill();

  // Screen content
  const pad = 16;
  const screenY = y + 30;

  // Header
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 13px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("Nouveau devis", x + pad, screenY + 8);

  // Input fields
  const fields = ["Client: Restaurant Le Zinc", "Prestation: Site vitrine 5p", "Montant: 2 400 EUR"];
  fields.forEach((field, i) => {
    const fy = screenY + 40 + i * 36;
    drawRoundedRect(ctx, x + pad, fy, w - pad * 2, 28, 6);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "11px sans-serif";
    ctx.fillText(field, x + pad + 8, fy + 8);
  });

  // CTA button
  const btnY = screenY + 40 + 3 * 36 + 12;
  drawRoundedRect(ctx, x + pad, btnY, w - pad * 2, 32, 8);
  const btnGrad = ctx.createLinearGradient(x + pad, btnY, x + w - pad, btnY);
  btnGrad.addColorStop(0, COLORS.violet);
  btnGrad.addColorStop(1, COLORS.emerald);
  ctx.fillStyle = btnGrad;
  ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 12px sans-serif";
  const btnText = "Generer avec l'IA";
  const btnTextW = ctx.measureText(btnText).width;
  ctx.fillText(btnText, x + (w - btnTextW) / 2, btnY + 10);
}

function drawMetricsPills(ctx, x, y, fontSize) {
  const pills = [
    { text: "+80% plus rapide", color: COLORS.emerald },
    { text: "3x signatures", color: COLORS.violet },
  ];

  let currentX = x;
  pills.forEach((pill, i) => {
    ctx.font = `bold ${fontSize}px sans-serif`;
    const textW = ctx.measureText(pill.text).width;
    const pillW = textW + 24;
    const pillH = fontSize + 16;

    drawRoundedRect(ctx, currentX, y, pillW, pillH, pillH / 2);
    ctx.fillStyle = pill.color + "20";
    ctx.fill();
    ctx.strokeStyle = pill.color + "40";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = pill.color;
    ctx.textBaseline = "middle";
    ctx.fillText(pill.text, currentX + 12, y + pillH / 2);

    currentX += pillW + 12;
  });

  return currentX - x;
}

function drawCTA(ctx, x, y, text, fontSize) {
  ctx.font = `${fontSize}px sans-serif`;
  const textW = ctx.measureText(text).width;
  const pillW = textW + 24;
  const pillH = fontSize + 14;

  drawRoundedRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = COLORS.whiteAlpha;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 12, y + pillH / 2);
}

function saveCanvas(canvas, filename) {
  const buf = canvas.toBuffer("image/png");
  const path = join(OUT, filename);
  writeFileSync(path, buf);
  const kb = Math.round(buf.length / 1024);
  console.log(`  ${filename} (${canvas.width}x${canvas.height}, ${kb}KB)`);
}

/* ── 1. LinkedIn Profile Picture (400x400) ────────── */
function generateLinkedInProfile() {
  const W = 400, H = 400;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  drawGradientBg(ctx, W, H);

  // Centered logo
  const logoSize = 120;
  drawLogo(ctx, (W - logoSize) / 2, (H - logoSize) / 2 - 30, logoSize);

  // Brand name
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Devizly", W / 2, H / 2 + 70);

  // Tagline
  ctx.fillStyle = COLORS.whiteAlpha;
  ctx.font = "16px sans-serif";
  ctx.fillText("Devis IA en 30s", W / 2, H / 2 + 120);

  // Subtle border ring
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 185, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(99,102,241,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();

  saveCanvas(canvas, "linkedin-profile-pic.png");
}

/* ── 2. LinkedIn Banner (1584x396) ────────────────── */
function generateLinkedInBanner() {
  const W = 1584, H = 396;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  drawGradientBg(ctx, W, H);

  // Grid pattern overlay
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = 0; gy < H; gy += 40) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // Left side: Logo + text
  const leftX = 80;
  drawLogoWithText(ctx, leftX, 60, 52, 36);

  // Tagline
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 48px sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("Devis IA 30s", leftX, 140);

  // Gradient text line
  const gradText = ctx.createLinearGradient(leftX, 0, leftX + 400, 0);
  gradText.addColorStop(0, COLORS.violet);
  gradText.addColorStop(1, COLORS.emerald);
  ctx.fillStyle = gradText;
  ctx.font = "bold 48px sans-serif";
  ctx.fillText("Payes direct", leftX, 196);

  // Metrics pills
  ctx.textAlign = "left";
  drawMetricsPills(ctx, leftX, 270, 16);

  // CTA
  drawCTA(ctx, leftX, 320, "devizly.com", 14);

  // Right side: Dashboard mockup
  drawDashboardMockup(ctx, W - 620, 30, 540, 340);

  saveCanvas(canvas, "linkedin-banner.png");
}

/* ── 3. Twitter/X Header (1500x500) ───────────────── */
function generateTwitterHeader() {
  const W = 1500, H = 500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  drawGradientBg(ctx, W, H);

  // Decorative circles
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.3, 200, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(99,102,241,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.3, 260, 0, Math.PI * 2);
  ctx.stroke();

  // Left: Logo + text
  const leftX = 100;
  drawLogoWithText(ctx, leftX, 70, 56, 38);

  // Main headline
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 56px sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("Vos devis pros", leftX, 160);

  const gradText = ctx.createLinearGradient(leftX, 0, leftX + 500, 0);
  gradText.addColorStop(0, COLORS.violet);
  gradText.addColorStop(1, COLORS.emerald);
  ctx.fillStyle = gradText;
  ctx.font = "bold 56px sans-serif";
  ctx.fillText("en 30 secondes", leftX, 224);

  // Metrics
  drawMetricsPills(ctx, leftX, 310, 18);

  // CTA
  drawCTA(ctx, leftX, 380, "devizly.com", 16);

  // Right: Phone mockup
  drawPhoneMockup(ctx, W - 280, 50, 180, 400);

  saveCanvas(canvas, "twitter-header.png");
}

/* ── 4. Website Hero (1920x1080) ──────────────────── */
function generateWebsiteHero() {
  const W = 1920, H = 1080;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  drawGradientBg(ctx, W, H);

  // Larger grid
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 60) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = 0; gy < H; gy += 60) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // Decorative arcs
  [300, 420, 540].forEach((r) => {
    ctx.beginPath();
    ctx.arc(W * 0.75, H * 0.45, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(99,102,241,0.04)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Top bar with logo
  drawLogoWithText(ctx, 80, 40, 48, 32);

  // Main content centered-left
  const contentX = 120;

  // Badge
  const badgeY = 200;
  drawRoundedRect(ctx, contentX, badgeY, 320, 36, 18);
  ctx.fillStyle = "rgba(99,102,241,0.15)";
  ctx.fill();
  ctx.strokeStyle = "rgba(99,102,241,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COLORS.violet;
  ctx.font = "bold 14px sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("IA Mistral — 100% hebergee en France", contentX + 16, badgeY + 18);

  // Headline
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 72px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("Vos devis", contentX, 260);
  ctx.fillText("professionnels en", contentX, 342);

  const gradHL = ctx.createLinearGradient(contentX, 0, contentX + 600, 0);
  gradHL.addColorStop(0, COLORS.violet);
  gradHL.addColorStop(1, COLORS.emerald);
  ctx.fillStyle = gradHL;
  ctx.font = "bold 72px sans-serif";
  ctx.fillText("30 secondes", contentX, 424);

  // Subheadline
  ctx.fillStyle = COLORS.whiteAlpha;
  ctx.font = "22px sans-serif";
  ctx.fillText("Decrivez votre prestation, l'IA genere un devis complet.", contentX, 520);
  ctx.fillText("Envoyez par WhatsApp, email ou SMS.", contentX, 550);

  // Metrics pills
  drawMetricsPills(ctx, contentX, 610, 20);

  // CTA buttons
  const ctaY = 690;
  // Primary
  drawRoundedRect(ctx, contentX, ctaY, 260, 56, 12);
  const ctaGrad = ctx.createLinearGradient(contentX, ctaY, contentX + 260, ctaY);
  ctaGrad.addColorStop(0, COLORS.violet);
  ctaGrad.addColorStop(1, COLORS.emerald);
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 18px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("Debuter gratuitement  ->", contentX + 28, ctaY + 28);

  // Secondary
  drawRoundedRect(ctx, contentX + 280, ctaY, 200, 56, 12);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COLORS.whiteAlpha;
  ctx.font = "16px sans-serif";
  ctx.fillText("Sans carte bancaire", contentX + 310, ctaY + 28);

  // Right side: dashboard + phone
  drawDashboardMockup(ctx, W - 760, 160, 620, 400);
  drawPhoneMockup(ctx, W - 260, 340, 200, 440);

  // Bottom URL
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("devizly.com", W / 2, H - 30);

  saveCanvas(canvas, "website-hero.png");
}

/* ── Run ──────────────────────────────────────────── */
console.log("Generating Devizly marketing kit...\n");

generateLinkedInProfile();
generateLinkedInBanner();
generateTwitterHeader();
generateWebsiteHero();

console.log("\nDone! Files in public/marketing/");
