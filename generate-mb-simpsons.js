const fs = require("fs");
const puppeteer = require("puppeteer");
const { exec } = require("child_process");

const TOTAL_WORKOUTS = 30;
const OUTPUT_FILE = "BIG_MOTHERBOARD_CARTOON_YELLOW.pdf";

const COLORS = ["#FED90F", "#70D1FE", "#F14E28", "#7AC943", "#FF7EB9", "#111111"];

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
    <div class="slope">
      <div class="snum">${esc(Math.round(Number(w.estimated_slope ?? 0)))}</div>
      <div class="slabel">SLOPE</div>
    </div>

    <div class="header">
      <div class="title">MOTHERBOARD</div>
      <div class="meta">
        TASKS ${esc(w.task_count)} · AVG ${esc(w.avg_point_per_rep)} · ROQ ${esc(w.estimated_roq)}
      </div>
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
    radial-gradient(circle at 10% 15%, #fff176 0, #fff176 9%, transparent 10%),
    radial-gradient(circle at 90% 10%, #70D1FE 0, #70D1FE 10%, transparent 11%),
    linear-gradient(135deg, #FED90F 0%, #fff7a8 35%, #ffffff 70%, #70D1FE 100%);
}

.header {
  text-align: center;
  margin-bottom: .15in;
}

.title {
  font-size: 48px;
  color: #111;
  letter-spacing: 3px;
  text-shadow: 4px 4px 0 #70D1FE, 7px 7px 0 #F14E28;
}

.meta {
  font-family: Arial, sans-serif;
  font-weight: bold;
  font-size: 11px;
  margin-top: .08in;
}

.slope {
  position: absolute;
  left: .2in;
  top: .22in;
  width: .78in;
  height: .78in;
  border: 3px solid #111;
  background: #FED90F;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.snum {
  font-size: 30px;
  line-height: 1;
}

.slabel {
  font-size: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .16in;
}

.card {
  min-height: 2in;
  background: rgba(255,255,255,.93);
  border: 3px solid #111;
  border-radius: 14px;
  padding: .09in;
  box-shadow: 6px 6px 0 var(--c);
  break-inside: avoid;
}

.c-title {
  color: #111;
  background: var(--c);
  border: 2px solid #111;
  border-radius: 10px;
  padding: 3px 8px;
  font-size: 21px;
  line-height: .95;
  margin-bottom: .05in;
}

.key {
  font-family: Arial, sans-serif;
  font-size: 8px;
  color: #333;
  margin-bottom: .06in;
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
  color: #F14E28;
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