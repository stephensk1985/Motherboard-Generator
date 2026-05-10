const fs = require("fs");

// load your big file
const workouts = JSON.parse(
  fs.readFileSync("all_workouts.json", "utf8")
);

// 🔥 NEW SIZE
const BATCH_SIZE = 150;

for (let i = 0; i < workouts.length; i += BATCH_SIZE) {
  const batch = workouts.slice(i, i + BATCH_SIZE);
  const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

  fs.writeFileSync(
    `workouts_batch_${batchNumber}.json`,
    JSON.stringify(batch, null, 2)
  );

  console.log(
    `Created workouts_batch_${batchNumber}.json (${batch.length} workouts)`
  );
}

console.log("✅ Done splitting into 150-size batches");