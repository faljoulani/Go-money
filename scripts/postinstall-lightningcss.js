// Make lightningcss available cross-platform without failing the build.
// 1) Try to load the native module.
// 2) If missing, run `npm rebuild lightningcss --foreground-scripts` to fetch it.
// 3) Try again. If still missing, warn and exit 0 (Docker/Linux stage will handle it).

const { execSync } = require("child_process");

function tryRequire() {
  try {
    // If this succeeds, the native .node was found for the current OS/arch.
    require("lightningcss");
    console.log("lightningcss OK");
    return true;
  } catch (e) {
    console.warn("lightningcss not ready:", e.message);
    return false;
  }
}

(async () => {
  if (tryRequire()) return;

  try {
    const cmd =
      process.platform === "win32"
        ? "npm.cmd rebuild lightningcss --foreground-scripts"
        : "npm rebuild lightningcss --foreground-scripts";
    console.log("Attempting to rebuild lightningcss…");
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    console.warn("Rebuild failed:", e.message);
  }

  if (!tryRequire()) {
    console.warn(
      "WARNING: lightningcss binary still missing. Proceeding anyway; " +
        "the Docker build stage also rebuilds/validates lightningcss."
    );
    // Do not throw—keep install green on Windows agents.
  }
})();