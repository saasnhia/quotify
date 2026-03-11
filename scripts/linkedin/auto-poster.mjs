/**
 * LinkedIn Auto-Poster for Devizly
 *
 * Posts carousel content to LinkedIn on a schedule.
 * Uses LinkedIn API v2 (OAuth 2.0 + UGC Posts).
 *
 * Setup:
 *   1. Create a LinkedIn App: https://www.linkedin.com/developers/apps
 *   2. Request "w_member_social" scope (Share on LinkedIn)
 *   3. Get an access token via OAuth 2.0 flow
 *   4. Set env vars in .env.linkedin
 *
 * Usage:
 *   node scripts/linkedin/auto-poster.mjs          # Run once (next scheduled post)
 *   node scripts/linkedin/auto-poster.mjs --cron    # Start cron scheduler
 *   node scripts/linkedin/auto-poster.mjs --dry-run # Preview without posting
 *   node scripts/linkedin/auto-poster.mjs --day 5   # Post a specific day
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const POSTS_FILE = join(__dirname, "posts.json");
const STATE_FILE = join(__dirname, ".post-state.json");

// Load env from .env.linkedin if exists
const envFile = join(__dirname, ".env.linkedin");
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN; // "urn:li:person:XXXXX"
const LINKEDIN_ORG_URN = process.env.LINKEDIN_ORG_URN; // "urn:li:organization:XXXXX" (optional, for company page)

// ═══════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════

function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  }
  return { lastPostedDay: 0, history: [] };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════
// LINKEDIN API
// ═══════════════════════════════════════════════════

async function getLinkedInProfile() {
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`LinkedIn API error: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Post text content to LinkedIn using UGC API
 */
async function postToLinkedIn(text) {
  const authorUrn = LINKEDIN_ORG_URN || LINKEDIN_PERSON_URN;

  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LinkedIn post failed: ${res.status} ${errText}`);
  }

  return res.json();
}

// ═══════════════════════════════════════════════════
// FORMAT POST
// ═══════════════════════════════════════════════════

function formatPostText(post) {
  // For text-only posts (carrousel images would need separate upload)
  // Format: Hook + content from slides + hashtags
  const lines = [];

  // Slide 1 = Hook (attention grabber)
  lines.push(post.slides[0].replace(/^HOOK:\s*/i, ""));
  lines.push("");

  // Slides 2-4 = Content (abbreviated for text post)
  for (let i = 1; i < post.slides.length - 1; i++) {
    lines.push(post.slides[i]);
    lines.push("");
  }

  // Slide 5 = CTA
  lines.push("---");
  lines.push("");
  lines.push(post.slides[post.slides.length - 1]);
  lines.push("");

  // Hashtags
  lines.push(post.hashtags);

  return lines.join("\n");
}

// ═══════════════════════════════════════════════════
// SCHEDULING LOGIC
// ═══════════════════════════════════════════════════

/**
 * Publishing schedule (LinkedIn algo 2026):
 *   Mardi 9h    → Contenu éducatif
 *   Mercredi 11h → Cas d'usage
 *   Jeudi 14h   → Storytelling
 *   Dimanche 18h → Inspiration
 *
 * = 4 posts/semaine, ~30 posts over ~8 weeks
 */
const SCHEDULE = [
  { day: 2, hour: 9, minute: 0 },   // Mardi 9h
  { day: 3, hour: 11, minute: 0 },  // Mercredi 11h
  { day: 4, hour: 14, minute: 0 },  // Jeudi 14h
  { day: 0, hour: 18, minute: 0 },  // Dimanche 18h
];

function getNextScheduledSlot() {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, ...
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next slot
  for (const slot of SCHEDULE) {
    if (
      slot.day > currentDay ||
      (slot.day === currentDay && slot.hour * 60 + slot.minute > currentMinutes)
    ) {
      return slot;
    }
  }
  // Wrap to next week
  return SCHEDULE[0];
}

function msUntilNextSlot(slot) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(slot.hour, slot.minute, 0, 0);

  let daysAhead = slot.day - now.getDay();
  if (daysAhead < 0 || (daysAhead === 0 && target <= now)) {
    daysAhead += 7;
  }
  target.setDate(target.getDate() + daysAhead);

  return target.getTime() - now.getTime();
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isCron = args.includes("--cron");
const dayIdx = args.indexOf("--day");
const specificDay = dayIdx >= 0 ? parseInt(args[dayIdx + 1], 10) : null;

const posts = JSON.parse(readFileSync(POSTS_FILE, "utf-8"));
const state = loadState();

async function postNext(dayOverride) {
  const nextDay = dayOverride || state.lastPostedDay + 1;

  if (nextDay > posts.length) {
    console.log("✅ Tous les 30 posts ont été publiés !");
    return;
  }

  const post = posts.find((p) => p.day === nextDay);
  if (!post) {
    console.error(`❌ Post jour ${nextDay} introuvable`);
    return;
  }

  const text = formatPostText(post);

  console.log(`\n📅 JOUR ${post.day} — ${post.title}`);
  console.log(`🕒 ${post.hour} | 🔥 Viralité: ${post.virality}`);
  console.log(`📝 Type: ${post.type}`);
  console.log("─".repeat(50));
  console.log(text.slice(0, 500) + (text.length > 500 ? "\n..." : ""));
  console.log("─".repeat(50));

  if (isDryRun) {
    console.log("🔍 DRY RUN — pas de publication");
    return;
  }

  if (!LINKEDIN_ACCESS_TOKEN) {
    console.error("❌ LINKEDIN_ACCESS_TOKEN manquant. Créez scripts/linkedin/.env.linkedin");
    console.log("\nContenu du fichier .env.linkedin :");
    console.log("LINKEDIN_ACCESS_TOKEN=votre_token");
    console.log("LINKEDIN_PERSON_URN=urn:li:person:XXXXX");
    console.log("# Optionnel pour page entreprise :");
    console.log("# LINKEDIN_ORG_URN=urn:li:organization:XXXXX");
    return;
  }

  try {
    const result = await postToLinkedIn(text);
    console.log(`✅ Publié ! ID: ${result.id || "OK"}`);

    state.lastPostedDay = nextDay;
    state.history.push({
      day: nextDay,
      postedAt: new Date().toISOString(),
      title: post.title,
    });
    saveState(state);
  } catch (err) {
    console.error(`❌ Erreur publication: ${err.message}`);
  }
}

if (isCron) {
  console.log("🤖 Devizly LinkedIn Auto-Poster — Mode CRON activé");
  console.log(`📊 Posts restants: ${posts.length - state.lastPostedDay}/${posts.length}`);
  console.log("");

  async function scheduleNext() {
    const slot = getNextScheduledSlot();
    const ms = msUntilNextSlot(slot);
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    console.log(
      `⏰ Prochain post: ${days[slot.day]} ${slot.hour}h${String(slot.minute).padStart(2, "0")} (dans ${Math.round(ms / 3600000)}h)`
    );

    setTimeout(async () => {
      await postNext();
      scheduleNext();
    }, ms);
  }

  scheduleNext();
} else {
  await postNext(specificDay);
}
