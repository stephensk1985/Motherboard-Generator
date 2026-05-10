const fs = require("fs");
const puppeteer = require("puppeteer");

const TOTAL_WORKOUTS = 30;

async function createPDF(inputFile, outputFile) {
  if (!fs.existsSync(inputFile)) {
    console.log(`Skipped missing file: ${inputFile}`);
    return;
  }

  const workout = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  const html = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 28px;
        color: #111;
      }

      h1 {
        text-align: center;
        font-size: 30px;
        margin-bottom: 8px;
      }

      .meta {
        text-align: center;
        font-size: 14px;
        margin-bottom: 22px;
      }

      .circuit {
        border: 2px solid #111;
        padding: 10px;
        margin-bottom: 14px;
        page-break-inside: avoid;
      }

      .circuit-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .pattern {
        font-size: 10px;
        color: #555;
        margin-bottom: 8px;
      }

      .tasks {
        columns: 2;
        column-gap: 25px;
        font-size: 11px;
      }

      .task {
        break-inside: avoid;
        margin-bottom: 3px;
      }
    </style>
  </head>

  <body>
    <h1>MOTHERBOARD</h1>

    <div class="meta">
      <b>Tasks:</b> ${workout.task_count}
      &nbsp; | &nbsp;
      <b>Avg:</b> ${workout.avg_point_per_rep}
      &nbsp; | &nbsp;
      <b>Slope:</b> ${workout.estimated_slope}
      &nbsp; | &nbsp;
      <b>ROQ:</b> ${workout.estimated_roq}
    </div>

    ${workout.circuits.map((c, i) => `
      <div class="circuit">
        <div class="circuit-title">${i + 1}. ${c.name}</div>
        <div class="pattern">${c.anonymous_task_list}</div>

        <div class="tasks">
          ${c.tasks.map(t => `
            <div class="task">
              ${t.task_number}. ${t.name}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("")}
  </body>
  </html>
  `;

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: outputFile,
    format: "letter",
    printBackground: true,
    margin: {
      top: "0.25in",
      right: "0.25in",
      bottom: "0.25in",
      left: "0.25in"
    }
  });

  await page.close();
  console.log(`Created ${outputFile}`);
}

let browser;

(async () => {
  browser = await puppeteer.launch();

  for (let i = 1; i <= TOTAL_WORKOUTS; i++) {
    await createPDF(
      `generated_workout_${i}.json`,
      `workout_${i}.pdf`
    );
  }

  await browser.close();
  console.log("DONE — PDFs created");
})();