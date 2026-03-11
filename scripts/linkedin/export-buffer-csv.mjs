/**
 * Export LinkedIn posts as Buffer-compatible CSV
 *
 * Buffer permet l'import CSV en bulk :
 *   Settings → Import → CSV Upload
 *
 * Format : Text, Date, Time
 *
 * Usage:
 *   node scripts/linkedin/export-buffer-csv.mjs
 *   → Génère scripts/linkedin/buffer-import.csv
 *   → Upload dans Buffer : publish.buffer.com → Settings → Import
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const posts = JSON.parse(readFileSync(join(__dirname, "posts.json"), "utf-8"));

// ═══════════════════════════════════════════════════
// PLANNING: 4 posts/semaine starting next Tuesday
// ═══════════════════════════════════════════════════

const SCHEDULE_MAP = {
  "Mardi 9h": { dayOfWeek: 2, hour: "09:00" },
  "Mercredi 11h": { dayOfWeek: 3, hour: "11:00" },
  "Jeudi 14h": { dayOfWeek: 4, hour: "14:00" },
  "Dimanche 18h": { dayOfWeek: 0, hour: "18:00" },
};

function getNextDate(dayOfWeek, startFrom) {
  const d = new Date(startFrom);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ═══════════════════════════════════════════════════
// FORMAT POST TEXT (LinkedIn optimized)
// ═══════════════════════════════════════════════════

function formatPostText(post) {
  const lines = [];

  // Hook (slide 1) — clean up prefix
  lines.push(post.slides[0].replace(/^HOOK:\s*/i, ""));
  lines.push("");

  // Content slides (2 to N-1)
  for (let i = 1; i < post.slides.length - 1; i++) {
    lines.push(post.slides[i]);
    lines.push("");
  }

  lines.push("—");
  lines.push("");

  // CTA (last slide)
  lines.push(post.slides[post.slides.length - 1]);
  lines.push("");

  // Hashtags
  lines.push(post.hashtags);

  return lines.join("\n");
}

// ═══════════════════════════════════════════════════
// GENERATE CSV
// ═══════════════════════════════════════════════════

const csvRows = [["Text", "Date", "Time"]];
let cursor = new Date();

for (const post of posts) {
  const schedule = SCHEDULE_MAP[post.hour];
  if (!schedule) {
    console.warn(`⚠️ Jour ${post.day}: heure "${post.hour}" non reconnue, skip`);
    continue;
  }

  cursor = getNextDate(schedule.dayOfWeek, cursor);
  const text = formatPostText(post);

  // CSV escape: wrap in quotes, double any internal quotes
  const escaped = `"${text.replace(/"/g, '""')}"`;
  csvRows.push([escaped, formatDate(cursor), schedule.hour]);
}

const csv = csvRows.map((row) => row.join(",")).join("\n");
const outPath = join(__dirname, "buffer-import.csv");
writeFileSync(outPath, csv, "utf-8");

console.log(`✅ ${posts.length} posts exportés → ${outPath}`);
console.log("");
console.log("📋 Import dans Buffer :");
console.log("   1. Ouvrir publish.buffer.com");
console.log("   2. Settings → Import & Export → Upload CSV");
console.log("   3. Sélectionner buffer-import.csv");
console.log("   4. Mapper: Text → Text, Date → Date, Time → Time");
console.log("   5. Choisir le profil @devizlyfr");
console.log("   6. Confirmer l'import");
console.log("");
console.log("📅 Planning :");

let week = 1;
let lastWeekStart = null;
for (let i = 0; i < posts.length; i++) {
  const row = csvRows[i + 1]; // skip header
  if (!row) continue;
  const dateStr = row[1];
  const weekStart = new Date(dateStr);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  if (!lastWeekStart || weekStart.getTime() !== lastWeekStart.getTime()) {
    console.log(`\n   Semaine ${week}:`);
    week++;
    lastWeekStart = weekStart;
  }
  console.log(`   ${row[1]} ${row[2]} — Jour ${posts[i].day}: ${posts[i].title.slice(0, 50)}...`);
}
