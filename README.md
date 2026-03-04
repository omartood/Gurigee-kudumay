<h1 align="center">Gurigee Kudumay</h1>

<p align="center"><img src="caleyka.jpeg" width="140"/></p>

<p align="center"><b>The viral Somali meme sound for VS Code errors.</b></p>

---

## What is this?

**Gurigee Kudumay** is a fun VS Code extension that plays the viral Somali meme sound
**"Gurigee ku dumay!" (Caleyka)** when something goes wrong in your code.

When your build fails.
When your tests crash.
When your terminal returns an error.

You hear the sound.

**GURIGEE KU DUMAY.**

Because debugging is painful, so it might as well be funny.

---

## Features

- 🔊 **Terminal failure sound** — Plays the meme when a terminal command exits with an error.
- 🧪 **Task failure sound** — Build or test tasks that fail will trigger the sound.
- ❌ **Diagnostic errors** — If your workspace has compile or lint errors, the meme can play.
- 🧱 **Stop on build fail** — Optionally stop running tasks when a build fails.
- ⚙️ **Configurable settings** — Enable or disable features and change cooldown timing.
- 🪶 **Lightweight** — No extra runtime dependencies.

---

## Installation

1. Install the extension from the **VS Code Marketplace**.
2. Add your meme sound file inside:

```
media/gurigee.mp3
```

3. Run your code normally.

When something breaks...

**GURIGEE KU DUMAY.**

---

## Quick Test

Open the terminal in VS Code and run:

```
exit 1
```

If everything is set up correctly, the meme sound will play.

---

## Extension Settings

| Setting | Description | Default |
|--------|-------------|---------|
| `gurigeeKudumay.enable` | Enable or disable the extension | `true` |
| `gurigeeKudumay.soundFileName` | Sound file inside `media/` | `gurigee.mp3` |
| `gurigeeKudumay.cooldown` | Time between sounds (ms) | `2000` |
| `gurigeeKudumay.soundOnTerminalFail` | Play sound on terminal failure | `true` |
| `gurigeeKudumay.soundOnTaskFail` | Play sound on task failure | `true` |
| `gurigeeKudumay.soundOnDiagnostics` | Play sound on code errors | `true` |
| `gurigeeKudumay.stopOnBuildFail` | Stop tasks when build fails | `true` |

---

## Meme Mode

Coding normally:

```
Build succeeded
Tests passed
Everything works
```

Coding after installing this extension:

```
npm run build

❌ ERROR

GURIGEE KU DUMAY
```

Your code base collapses.
Your confidence collapses.
Your terminal screams the meme.

Perfect developer experience.

---

## Why this exists

Developers love meme extensions.

There are many already:
- error scream extensions
- funny build sounds
- random meme alerts

So we made a **Somali meme version**.

Because when the code breaks, the house also breaks.

**Gurigee ku dumay.**

---

## Known Issues

**Linux users** may need a sound player installed such as:

```
sudo apt install mpg123
```

No sound will play if the system or VS Code is muted.

---

## License

MIT

---

## Final words

If your code compiles:

good job.

If your code fails:

**GURIGEE KU DUMAY.**
