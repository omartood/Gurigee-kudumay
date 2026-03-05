/**
 * Gurigee kudumay — Somali Sound Extension
 * Plays a sound when commands/tasks fail in VS Code.
 * When a BUILD fails, can optionally STOP further execution (fail-fast).
 * License: MIT
 */

const vscode = require("vscode");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

let lastPlayed = 0;
let statusBarItem = null;
let diagnosticsDebounceTimer = null;
let currentSoundProcess = null;
const DIAGNOSTICS_DEBOUNCE_MS = 800;

function getConfig() {
  const config = vscode.workspace.getConfiguration("gurigeeKudumay");
  return {
    enabled: config.get("enable", true),
    cooldown: config.get("cooldown", 2000),
    soundFileName: config.get("soundFileName", "gurigee-kudumay.mp3"),
    soundOnTerminalFail: config.get("soundOnTerminalFail", true),
    soundOnTaskFail: config.get("soundOnTaskFail", true),
    soundOnDiagnostics: config.get("soundOnDiagnostics", true),
    stopOnBuildFail: config.get("stopOnBuildFail", true),
    buildTaskNames: config.get("buildTaskNames", ["build", "compile", "npm: build", "yarn: build"]),
  };
}

function isBuildLikeTask(task) {
  const cfg = getConfig();
  const name = (task && task.name && task.name.toLowerCase()) || "";
  const definition = task && task.definition;
  const type = (definition && definition.type) || "";
  if (cfg.buildTaskNames.some((n) => name.includes(n.toLowerCase()))) return true;
  if (type === "npm" && (name.includes("build") || (definition && definition.script === "build"))) return true;
  if (type === "shell" && name.includes("build")) return true;
  return false;
}

function getSoundPath(context) {
  const config = getConfig();
  const mediaDir = path.join(context.extensionPath, "media");
  const primary = path.join(mediaDir, config.soundFileName || "gurigee-kudumay.mp3");
  if (fs.existsSync(primary)) return primary;
  const fallback = path.join(mediaDir, "gurigee-kudumay.mp3");
  if (fs.existsSync(fallback)) return fallback;
  return null;
}

let soundRestartTimer = null;

function stopCurrentSound() {
  if (soundRestartTimer) {
    clearTimeout(soundRestartTimer);
    soundRestartTimer = null;
  }
  if (currentSoundProcess) {
    try {
      currentSoundProcess.kill("SIGTERM");
    } catch (e) {}
    currentSoundProcess = null;
  }
  // Force-kill any lingering player processes on Linux/Mac
  const platform = process.platform;
  if (platform === "linux") {
    try { exec("pkill -f 'mpg123|paplay|aplay|ffplay' 2>/dev/null"); } catch (e) {}
  } else if (platform === "darwin") {
    try { exec("pkill -f afplay 2>/dev/null"); } catch (e) {}
  }
}

function startPlayer(soundPath, platform) {
  function tryPlay(cmd, fallbacks, index) {
    if (index >= (fallbacks || []).length && !cmd) return;
    const c = cmd || (fallbacks && fallbacks[index]);
    if (!c) return;
    const proc = exec(c, (error) => {
      if (currentSoundProcess === proc) currentSoundProcess = null;
      if (error && error.killed) return;
      if (error && fallbacks && index + 1 < fallbacks.length) {
        tryPlay(null, fallbacks, index + 1);
      } else if (error) {
        console.error("Gurigee kudumay Error:", error);
      }
    });
    currentSoundProcess = proc;
  }

  if (platform === "darwin") {
    tryPlay(`afplay "${soundPath}"`);
  } else if (platform === "win32") {
    const psScript = `Add-Type -AssemblyName presentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([System.Uri]::new('${soundPath.replace(/\\/g, "/")}', [System.UriKind]::Absolute)); $player.Play(); Start-Sleep -Seconds 3`;
    tryPlay(`powershell -c "${psScript.replace(/"/g, '\\"')}"`);
  } else {
    tryPlay(null, [
      `mpg123 -q "${soundPath}"`,
      `paplay "${soundPath}"`,
      `aplay "${soundPath}"`,
      `ffplay -nodisp -autoexit "${soundPath}" 2>/dev/null`,
    ], 0);
  }
}

function playSound(context) {
  const config = getConfig();
  if (!config.enabled) {
    console.log("Gurigee kudumay: Sound disabled in settings");
    return;
  }

  const soundPath = getSoundPath(context);
  if (!soundPath) {
    console.warn("Gurigee kudumay: No sound file in media/ — add gurigee-kudumay.mp3");
    return;
  }

  const platform = process.platform;

  // Stop whatever is playing right now
  stopCurrentSound();

  console.log("Gurigee kudumay: Restarting sound from beginning!");
  updateStatusBar("Gurigee kudumay — Error!", true);

  // Short pause so audio device releases, then restart fresh from beginning
  soundRestartTimer = setTimeout(() => {
    soundRestartTimer = null;
    lastPlayed = Date.now();
    startPlayer(soundPath, platform);
  }, 80);
}

function updateStatusBar(text, isError) {
  if (!statusBarItem) return;
  statusBarItem.text = text;
  statusBarItem.tooltip = isError ? "An error occurred (Gurigee kudumay)" : "Gurigee kudumay";
  statusBarItem.show();
}

function stopRunningTasks() {
  // Daarmo: when build/command fails, terminate all running tasks (wax walba ay joogaan).
  var cmd = "workbench.action.tasks.terminate";
  // Try "terminateAll" first to kill all tasks, then plain terminate for active task.
  vscode.commands.executeCommand(cmd, "terminateAll").then(
    () => console.log("Gurigee kudumay: Terminated all tasks (daarmo)."),
    function () {
      vscode.commands.executeCommand(cmd).then(
        () => console.log("Gurigee kudumay: Terminated task (daarmo)."),
        function (err) { console.warn("Gurigee kudumay: Could not terminate:", err); }
      );
    }
  );
}

function activate(context) {
  try {
    return doActivate(context);
  } catch (err) {
    console.error("Gurigee kudumay: activate failed", err);
    throw err;
  }
}

function doActivate(context) {
  try {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);
    updateStatusBar("Gurigee kudumay", false);
  } catch (e) {
    console.warn("Gurigee kudumay: Status bar init failed", e);
  }

  try {
    if (typeof vscode.window.onDidCloseTerminal === "function") {
      context.subscriptions.push(
        vscode.window.onDidCloseTerminal(function (terminal) {
          const cfg = getConfig();
          if (!cfg.soundOnTerminalFail && !cfg.stopOnBuildFail) return;
          var exitStatus = terminal.exitStatus;
          if (exitStatus && exitStatus.code !== 0) {
            console.log("Gurigee kudumay: Terminal failed with code:", exitStatus.code);
            if (cfg.soundOnTerminalFail) playSound(context);
            if (cfg.stopOnBuildFail) stopRunningTasks();
          }
        })
      );
    }
  } catch (e) {
    console.warn("Gurigee kudumay: onDidCloseTerminal failed", e);
  }

  try {
    if (typeof vscode.window.onDidEndTerminalShellExecution === "function") {
      context.subscriptions.push(
        vscode.window.onDidEndTerminalShellExecution(function (event) {
          const cfg = getConfig();
          if (!cfg.soundOnTerminalFail && !cfg.stopOnBuildFail) return;
          if (event.exitCode != null && event.exitCode !== 0) {
            console.log("Gurigee kudumay: Command failed with code:", event.exitCode);
            if (cfg.soundOnTerminalFail) playSound(context);
            if (cfg.stopOnBuildFail) stopRunningTasks();
          }
        })
      );
    }
  } catch (e) {
    console.warn("Gurigee kudumay: onDidEndTerminalShellExecution failed", e);
  }

  try {
    if (typeof vscode.tasks.onDidEndTaskProcess === "function") {
      context.subscriptions.push(
        vscode.tasks.onDidEndTaskProcess(function (event) {
          const cfg = getConfig();
          if (!cfg.soundOnTaskFail && !cfg.stopOnBuildFail) return;
          const failed = event.exitCode != null && event.exitCode !== 0;
          if (!failed) return;
          var exec = event.execution;
          const isBuild = exec && exec.task ? isBuildLikeTask(exec.task) : false;
          if (isBuild) {
            console.log("Gurigee kudumay: Build task failed with code:", event.exitCode);
            if (cfg.soundOnTaskFail) playSound(context);
            if (cfg.stopOnBuildFail) stopRunningTasks();
          } else {
            if (cfg.soundOnTaskFail) {
              console.log("Gurigee kudumay: Task failed with code:", event.exitCode);
              playSound(context);
            }
          }
        })
      );
    }
  } catch (e) {
    console.warn("Gurigee kudumay: onDidEndTaskProcess failed", e);
  }

  try {
    if (typeof vscode.languages.onDidChangeDiagnostics === "function" && typeof vscode.languages.getDiagnostics === "function") {
      context.subscriptions.push(
        vscode.languages.onDidChangeDiagnostics(function () {
          const cfg = getConfig();
          if (!cfg.soundOnDiagnostics) return;
          if (diagnosticsDebounceTimer) clearTimeout(diagnosticsDebounceTimer);
          diagnosticsDebounceTimer = setTimeout(function () {
            diagnosticsDebounceTimer = null;
            try {
              const diagnostics = vscode.languages.getDiagnostics();
              const hasErrors = diagnostics.some(function (item) {
                var diag = item[1];
                return diag && diag.some(function (d) { return d.severity === vscode.DiagnosticSeverity.Error; });
              });
              if (hasErrors) {
                console.log("Gurigee kudumay: Diagnostic errors detected");
                playSound(context);
              }
            } catch (err) {
              console.warn("Gurigee kudumay: getDiagnostics failed", err);
            }
          }, DIAGNOSTICS_DEBOUNCE_MS);
        })
      );
    }
  } catch (e) {
    console.warn("Gurigee kudumay: diagnostics listener failed", e);
  }

  console.log("Gurigee kudumay extension activated");
}

function deactivate() {
  if (diagnosticsDebounceTimer) clearTimeout(diagnosticsDebounceTimer);
  if (statusBarItem) statusBarItem.dispose();
  stopCurrentSound();
  lastPlayed = 0;
}

module.exports = {
  activate,
  deactivate,
};
