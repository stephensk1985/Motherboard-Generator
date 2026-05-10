const fs = require("fs");
const puppeteer = require("puppeteer");

const TOTAL_WORKOUTS = 30;
const OUTPUT_FILE = "BIG_MOTHERBOARD.pdf";

const COLORS = ["#2f80ed", "#27ae60", "#eb5757", "#f2994a", "#9b51e0", "#00a6a6"];

function cleanName(name) {
  return String(name || "").replace(/\s+/g, " ").trim().toUpperCase();
}

function esc(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function makeCircuitHTML(c, index) {
  const color = COLORS[index % COLORS.length];

  return `
    <section class="circuit" style="--c:${color}">
      <div class="key">${esc(c.anonymous_task_list)}</div>
      <div class="circuit-title">${esc(cleanName(c.name))}</div>
      <div class="task-list">
        ${c.tasks.map(t => `
          <div class="task">
            <span>${esc(t.task_number)}.</span>
            ${esc(cleanName(t.name))}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function makePage(workout, pageNum) {
  return `
  <div class="page">
    <div class="copyright">Copyright Syphus Training, LLC ©2024. All Right Reserved.</div>

    <div class="slope-box">
      <div class="triangle"></div>
      <div class="date">AUTO ${pageNum}</div>
      <div class="slope-number">${esc(workout.estimated_slope ?? "")}</div>
      <div class="slope-label">SLOPE</div>
    </div>

    <div class="header">
      <div class="title">MOTHERBOARD</div>
      <div class="meta">
        TASKS: ${esc(workout.task_count)}
        &nbsp; | &nbsp;
        AVG: ${esc(workout.avg_point_per_rep)}
        &nbsp; | &nbsp;
        ROQ: ${esc(workout.estimated_roq)}
      </div>
    </div>

    <div class="grid">
      ${workout.circuits.map(makeCircuitHTML).join("")}
    </div>

    <div class="footer">Copyright Syphus Training, LLC ©2024. All Right Reserved.</div>
  </div>
  `;
}

const pages = [];

for (let i = 1; i <= TOTAL_WORKOUTS; i++) {
  const file = `generated_workout_${i}.json`;

  if (!fs.existsSync(file)) {
    console.log(`Skipped missing file: ${file}`);
    continue;
  }

  const workout = JSON.parse(fs.readFileSync(file, "utf8"));
  pages.push(makePage(workout, i));
}

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  @page {
    size: letter landscape;
    margin: 0;
  }

  body {
    margin: 0;
    background: white;
    font-family: Impact, "Arial Narrow", Arial, sans-serif;
    color: #111;
  }

  .page {
    width: 11in;
    height: 8.5in;
    position: relative;
    padding: 0.28in 0.35in;
    box-sizing: border-box;
    page-break-after: always;
  }

  .copyright {
    position: absolute;
    right: 0.13in;
    top: 0.25in;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 8px;
    letter-spacing: 0.4px;
  }

  .slope-box {
    position: absolute;
    left: 0.22in;
    top: 0.18in;
    width: 0.8in;
    height: 0.75in;
  }

  .triangle {
    width: 0;
    height: 0;
    border-left: 0.65in solid transparent;
    border-bottom: 0.65in solid #111;
    position: relative;
  }

  .triangle::after {
    content: "";
    position: absolute;
    left: -0.61in;
    top: 0.04in;
    width: 0;
    height: 0;
    border-left: 0.54in solid transparent;
    border-bottom: 0.54in solid white;
  }

  .slope-number {
    position: absolute;
    top: 0.31in;
    left: 0.43in;
    font-size: 18px;
    z-index: 2;
  }

  .date {
    position: absolute;
    top: 0.04in;
    left: 0.02in;
    font-size: 9px;
    transform: rotate(-28deg);
    z-index: 2;
  }

  .slope-label {
    position: absolute;
    top: 0.62in;
    left: 0.25in;
    font-size: 12px;
    letter-spacing: 1px;
  }

  .header {
    text-align: center;
    margin-top: -0.05in;
    margin-bottom: 0.12in;
  }

  .title {
    font-size: 32px;
    letter-spacing: 2px;
  }

  .meta {
    font-family: Arial, sans-serif;
    font-size: 10px;
    margin-top: 3px;
  }

  .grid {
    margin-top: 0.1in;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.16in 0.25in;
  }

  .circuit {
    min-height: 2.1in;
    break-inside: avoid;
  }

  .key {
    font-family: Arial, sans-serif;
    font-size: 9px;
    line-height: 1.12;
    max-height: 0.55in;
    overflow: hidden;
    margin-bottom: 0.05in;
    color: #111;
    white-space: pre-wrap;
  }

  .circuit-title {
    color: var(--c);
    font-size: 22px;
    line-height: 1;
    letter-spacing: 1px;
    margin-bottom: 0.07in;
  }

  .task-list {
    color: var(--c);
    font-size: 18px;
    line-height: 1.13;
  }

  .task {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task span {
    display: inline-block;
    min-width: 0.25in;
  }

  .footer {
    position: absolute;
    bottom: 0.12in;
    left: 0;
    right: 0;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 9px;
  }
</style>
</head>
<body>
  ${pages.join("")}
</body>
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
    margin: {
      top: "0in",
      right: "0in",
      bottom: "0in",
      left: "0in"
    }
  });

  await browser.close();

  console.log(`DONE — created ${OUTPUT_FILE} with ${pages.length} pages`);
})();