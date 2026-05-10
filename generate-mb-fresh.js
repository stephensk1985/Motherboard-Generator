const fs = require("fs");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");

const TOTAL_WORKOUTS = 30;
const OUTPUT_FILE = "BIG_MOTHERBOARD_FRESH.pdf";
const COLORS = ["#ff4d00", "#0077ff", "#00a86b", "#9b35ff", "#ffb000", "#00a6a6"];

function esc(x) {
  return String(x ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function name(x) {
  return esc(
    String(x ?? "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\{[^}]*\}/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase()
  );
}
function openPDF(file) {
  exec(`cmd /c start "" "${file}"`);
}

function circuitHTML(c, i) {
  return `
  <div class="card" style="--c:${COLORS[i % COLORS.length]}">
    <div class="bar"></div>
    <div class="c-title">${name(c.name)}</div>
    <div class="key">${esc(c.anonymous_task_list)}</div>
    <div class="tasks">
      ${c.tasks.map(t => `<div><b>${esc(t.task_number)}.</b> ${name(t.name)}</div>`).join("")}
    </div>
  </div>`;
}

const pages = [];

for (let i = 1; i <= TOTAL_WORKOUTS; i++) {
  const file = `generated_workout_${i}.json`;
  if (!fs.existsSync(file)) continue;

  const w = JSON.parse(fs.readFileSync(file, "utf8"));

  pages.push(`
  <section class="page">
    <div class="header">
      <div class="month">AUTO BOARD ${i}</div>
      <div class="title">MOTHERBOARD</div>
      <div class="meta">
        TASKS ${esc(w.task_count)} · AVG ${esc(w.avg_point_per_rep)} · ROQ ${esc(w.estimated_roq)}
      </div>
    </div>

    <div class="slope">
      <div class="snum">${esc(Math.round(Number(w.estimated_slope ?? 0)))}</div>
      <div class="slabel">SLOPE</div>
    </div>

    <div class="grid">
      ${w.circuits.map(circuitHTML).join("")}
    </div>

    <div class="footer">Copyright Syphus Training, LLC ©2025. All Right Reserved.</div>
  </section>`);
}

const html = `
<html>
<head>
<style>
@page { size: letter landscape; margin: 0; }

body {
  margin: 0;
  background: #0b0b0b;
  font-family: Impact, "Arial Narrow", Arial, sans-serif;
}

.page {
  width: 11in;
  height: 8.5in;
  position: relative;
  box-sizing: border-box;
  padding: .28in .35in;
  page-break-after: always;
  background:
    radial-gradient(circle at top left, rgba(255,77,0,.18), transparent 40%),
    linear-gradient(135deg, #101010, #ffffff 16%, #ffffff 84%, #101010);
}

.header {
  text-align: center;
  margin-bottom: .15in;
}

.month {
  font-size: 20px;
  color: #111;
  letter-spacing: 3px;
}

.title {
  font-size: 46px;
  color: #ff4d00;
  letter-spacing: 3px;
  border: 4px solid #111;
  display: inline-block;
  padding: .04in .28in;
  box-shadow: 0 0 0 3px #ff4d00;
}

.meta {
  font-family: Arial, sans-serif;
  font-size: 10px;
  margin-top: .08in;
  letter-spacing: 1px;
}

.slope {
  position: absolute;
  left: .2in;
  top: .25in;
  width: .75in;
  height: .75in;
  border: 4px solid #111;
  transform: rotate(-12deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
}

.snum {
  font-size: 28px;
  line-height: 1;
}

.slabel {
  font-size: 10px;
  letter-spacing: 1px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .16in;
}

.card {
  min-height: 2in;
  background: rgba(255,255,255,.92);
  border: 2px solid #111;
  padding: .09in;
  box-shadow: 5px 5px 0 var(--c);
  break-inside: avoid;
}

.bar {
  height: 7px;
  background: var(--c);
  margin-bottom: .06in;
}

.c-title {
  color: var(--c);
  font-size: 22px;
  line-height: .95;
}

.key {
  font-family: Arial, sans-serif;
  color: #333;
  font-size: 8px;
  margin: .04in 0 .06in;
  max-height: .35in;
  overflow: hidden;
}

.tasks {
  color: #111;
  font-size: 15.5px;
  line-height: 1.08;
}

.tasks div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tasks b {
  color: var(--c);
}

.footer {
  position: absolute;
  bottom: .12in;
  left: 0;
  right: 0;
  text-align: center;
  font-family: Arial, sans-serif;
  font-size: 9px;
}
</style>
</head>
<body>${pages.join("")}</body>
</html>
`;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: OUTPUT_FILE,
    format: "letter",
    landscape: true,
    printBackground: true,
    margin: { top: "0in", right: "0in", bottom: "0in", left: "0in" }
  });

  await browser.close();
  console.log(`DONE — created ${OUTPUT_FILE}`);
  openPDF(OUTPUT_FILE);
})();