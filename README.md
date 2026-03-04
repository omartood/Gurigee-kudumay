# Gurigee kudamay 

<p align="center"><img src="caleyka.jpeg" width="120" /></p>


**Dhawaq Soomaali ah marka wax qalda** — a Somali sound when something goes wrong in VS Code.

*Gurigee kudamay* plays a sound (codka) when your terminal command fails, a task fails, or there are errors in your code. It’s the **Somali sound** extension for VS Code: one sound, one moment — *gurigee kudamay*.

---

## Features

- **Terminal failures** — dhawaq marka amaruu terminaalka uu ku guuro (non-zero exit)
- **Task failures** — dhawaq marka task (build, test, etc.) uu ku guuro
- **Build fail → daarmo** — marka build uu ku guuro, extension-ku wuu daarin karaa (stop) task-yada socda
- **Diagnostic errors** — dhawaq marka jirto qalad (lint/compile) workspace-ka
- **Configurable** — enable/disable, cooldown, sound file name, iyo waxa dhawaqa soo saara
- **Lightweight** — no extra runtime dependencies

---

## Requirements

- VS Code 1.109.0 or higher

---

## Extension settings (Gurigee kudamay)

| Setting | Description | Default |
|--------|-------------|--------|
| `gurigeeKudamay.enable` | Enable/disable Somali sound | `true` |
| `gurigeeKudamay.soundFileName` | Faylka dhawaqa ee folder-ka `media/` | `gurigee.mp3` |
| `gurigeeKudamay.cooldown` | Cooldown between sounds (ms) | `2000` |
| `gurigeeKudamay.soundOnTerminalFail` | Dhawaq marka terminal command uu ku guuro | `true` |
| `gurigeeKudamay.soundOnTaskFail` | Dhawaq marka task uu ku guuro | `true` |
| `gurigeeKudamay.soundOnDiagnostics` | Dhawaq marka diagnostic errors jiraan | `true` |
| `gurigeeKudamay.stopOnBuildFail` | Daarmo (stop) marka build uu ku guuro | `true` |
| `gurigeeKudamay.buildTaskNames` | Magacyada task-yada loo tixgeliyo "build" | `["build", "compile", "npm: build", ...]` |

---

## Usage

1. **Install** the extension.
2. **Add your sound file** — geli **`gurigee.mp3`** (ama faylka dhawaqa aad rabto) folder-ka **`media/`**.
3. The extension activates automatically — **dhawaq Soomaali ah** marka wax qalda.
4. **Test:** run in terminal: `exit 1` — you should hear the sound.

**Daarmo (stop on build fail):** When a build task fails, the extension plays the sound and can **stop** (daarmo) further execution if `gurigeeKudamay.stopOnBuildFail` is enabled.

---

## Testing

- **Terminal:** run `exit 1` in the terminal.
- **Task:** run a task that fails (e.g. a build).
- **Diagnostics:** open a file with a syntax error (e.g. `const x = ;`).

---

## Configuration

**File → Preferences → Settings** → search **“Gurigee kudamay”**.

Example:

```json
"gurigeeKudamay.enable": true,
"gurigeeKudamay.cooldown": 2000,
"gurigeeKudamay.soundFileName": "gurigee.mp3"
```

---

## Known issues

- **Linux:** player ayaa loo baahan (e.g. `mpg123`, `ffplay`, `paplay`, `aplay`). Tusaale: `sudo apt install mpg123`
- Dhawaq ma ciyaari doono haddii VS Code ama system volume la dumin (muted).

---

## License

MIT

---

**Gurigee kudamay** — *Somali sound for VS Code errors.*
