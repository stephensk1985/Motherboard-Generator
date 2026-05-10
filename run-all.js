const { execSync } = require("child_process");

function run(command) {
  console.log(`\n▶ ${command}`);
  execSync(command, { stdio: "inherit" });
}

try {
  run("node generate.js");
  run("node generate-mb-exact.js");
  run("node generate-mb-fresh.js");

  console.log("\n✅ DONE — workouts + exact PDF + fresh PDF created");
} catch (err) {
  console.error("\n❌ Something failed:");
  console.error(err.message);
}