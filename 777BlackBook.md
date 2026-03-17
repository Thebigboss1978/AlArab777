# 777 Black Book 
**Master System Directory and Architecture Reference**

This constitutes the primary structural and operational manual for AlArab 777 Voice Interface. 
Any deployed AI or human agent returning to this structure must consult the Black Book to understand how the system's "joints" connect.

## 🏛 The Sovereign Architecture (Local Directory)

```
/Voice_Interface/
│
├── index.html                   ← The Main Shell (Loads UI and scripts)
│
├── css/
│   └── style.css                ← All UI Styles, Animations, Colors, Admin Panel Styles.
│
├── js/
│   ├── config.js                ← Static API Keys & System defaults.
│   ├── brain.js                 ← AI Pyramid Brain (Generic Cognitive Profiles)
│   ├── utils.js                 ← Audio encoding/playing helpers
│   ├── app.js                   ← Core Orchestrator (State, Event looping, Admin Auth)
│   │
│   └── providers/               ← The "Engines"
│       ├── openai.js            ← WebRTC logic for OpenAI
│       ├── gemini.js            ← WebSocket logic for Google Gemini
│       ├── elevenlabs.js        ← WebSocket logic for ElevenLabs
│       └── hume.js              ← WebSocket logic for Hume EVI
│
├── 777BlackBook.md              ← You are here. Master logic and guide.
└── Agent.md                     ← The Agent's Office (Rules of engagement for AI maintainers).
```

---

## ⚙️ The Admin Control Panel (Hidden Security)
To ensure safety and ease of updating without touching code:
- **Location:** At the bottom right of `index.html`, there is a nearly invisible "dot". 
- **Action:** Clicking it spawns the Admin Panel.
- **Passcode:** `777`
- **Capabilities:**
  1. Swap the **AI Persona** (e.g. Malika, Judy, Seven) from those defined in `js/brain.js`.
  2. Swap the **Voice Provider** (OpenAI, Gemini, etc.).
  3. Swap to a **Custom Provider** by dynamically injecting a new provider name and overriding the API key directly in local storage.

---

## 🧠 Modifying the Generic Mind (brain.js)
The brain operates like a "USB Flash Drive" reader for a single Persona at any time.

**Changing the Identity:**
Open `js/brain.js` and simply edit the `AGENT_BRAIN` object. No HTML editing is required. The system will automatically construct the prompt on boot based on this object.

```javascript
const AGENT_BRAIN = {
    name: "Malika",
    role: "The 'Nazlawi' smart host for Egypt tourism",
    identity: { origin: "Egypt", ... },
    ...
};
```

---

## 🔌 Re-Routing The API Providers
If you need to define logic for a Custom Provider, build `js/providers/custom.js` and link it in `index.html`. 
Inside `app.js`, look for `function startSession()`, and insert the logic to trigger your `startCustomProvider()` function under `case 'custom':`.

---

## 🛠 Troubleshooting (حل المشكلات)

### 1. I Can't Find The Admin Panel!
- Hover your mouse at the very bottom right corner of the page. You will see a slightly translucent dot.
- Click it. It will ask for a password (`777`).

### 2. The Voice Won't Connect / "API Key Missing" / 503 Service Unavailable
- **503 (Capacity Exhausted)**: If a model (like Gemini) returns a 503 error, the "Open Pipe" architecture allows for instant switching. 
    - **Action**: Open Admin Panel -> Override Model (e.g., from `gemini-2.0-flash` to `gemini-1.5-flash`) -> Apply & Reboot.
    - **Note**: The system is designed to "Eat the Tunnel," meaning it prioritizes your custom inputs over factory defaults.
- Ensure your API Keys are placed either in `/js/config.js` or via the Admin Panel under "Custom Provider".
- Check the on-screen UI Log (Click "System Logs" or check `console.log`).
- **Gemini Restriction:** If Gemini is rejecting the connection due to limits or blocking, you can use the override script:
   - Run: `python3 alarab_sync.py` in your terminal to force the environment to use your custom OpenAI balance.

### 3. I Changed The Persona but the Agent still thinks it's someone else
- Sometimes the browser caches JavaScript files aggressiveness.
- Hard refresh the page (`Cmd + Shift + R` on Mac, or `Ctrl + F5` on Windows).
- If that fails, make sure you properly clicked "Apply & Reboot" in the admin panel if you made Provider variations.

### 4. Audio is not playing (WebRTC issues)
- Make sure `index.html` is hosted on `localhost` or `https://` (a requirement for microphone access in web browsers). You cannot simply double-click the HTML file if you expect the microphone to connect successfully to WebRTC servers in some strict browsers.
