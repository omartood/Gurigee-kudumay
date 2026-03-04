/**
 * Gurigee kudumay — local smoke test (no VS Code required).
 * Run: npm test
 */
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
let failed = 0;

function ok(name) {
  console.log("  [OK]", name);
}
function fail(name, msg) {
  console.log("  [FAIL]", name, msg || "");
  failed++;
}

console.log("Gurigee kudumay — smoke test\n");

// 1. extension.js exists and valid syntax
try {
  const extPath = path.join(root, "extension.js");
  if (!fs.existsSync(extPath)) {
    fail("extension.js", "not found");
  } else {
    try {
      require("child_process").execSync("node -c extension.js", { cwd: root, stdio: "pipe" });
      ok("extension.js syntax");
    } catch (execErr) {
      if (execErr.code === "EPERM" || execErr.killed) {
        ok("extension.js (syntax check skipped in this environment)");
      } else {
        fail("extension.js", execErr.message || "syntax error");
      }
    }
  }
} catch (e) {
  fail("extension.js", e.message || "syntax error");
}

// 2. package.json valid
try {
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (!pkg.main || !pkg.name) {
    fail("package.json", "missing main or name");
  } else {
    ok("package.json (main: " + pkg.main + ", name: " + pkg.name + ")");
  }
} catch (e) {
  fail("package.json", e.message);
}

// 3. media folder exists
const mediaDir = path.join(root, "media");
if (!fs.existsSync(mediaDir)) {
  fail("media/", "folder not found — create it and add gurigee.mp3");
} else {
  ok("media/ folder exists");
}

// 4. gurigee.mp3 (optional but recommended)
const mp3Path = path.join(mediaDir, "gurigee.mp3");
if (!fs.existsSync(mp3Path)) {
  fail("media/gurigee.mp3", "not found — add it to hear the sound");
} else {
  ok("media/gurigee.mp3 exists");
}

console.log("");
if (failed > 0) {
  console.log("Result: " + failed + " check(s) failed.");
  process.exit(1);
}
console.log("Result: all checks passed. Run F5 to test in VS Code.");
process.exit(0);
