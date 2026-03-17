
# PHASE 2: THE SHADOW NETWORK (OFFLINE & PRIVATE)
**Security Level: 777 Eyes Only (AlArab Club Admin)**

---

## 1. THE OBJECTIVE (الهدف)
To create a mirrored version of Judy OS that runs **OFFLINE** on a local MacBook Pro M1, disconnected from the public internet, but synchronized with a private **Google Drive Memory Bank**.

## 2. THE ARCHITECTURE (OFFLINE BRIDGE)

This web app (Frontend) cannot run Llama 3 directly in the browser (it's too heavy). We need a "Bridge".

### A. The Setup (Local Server)
We will install a local brain on your Mac using **Ollama** or **LM Studio**.
*   **Engine:** Ollama (runs Llama 3, Gemma, Qwen locally).
*   **Bridge:** A small Python script (FastAPI) that acts as the "Tunnel" between this website and your Mac's Processor.

**The Flow:**
`Website (Localhost)` <---> `Python Bridge` <---> `Ollama (M1 Chip)`

### B. The Memory (Google Drive JSON)
Instead of storing chat history in the browser, we will link to your Google Drive.
1.  **Google Drive API:** The Python Bridge will have permission to read/write a file named `judy_memory.json` in a specific folder.
2.  **Sync:**
    *   *Start Session:* Bridge downloads `judy_memory.json`.
    *   *During Chat:* Bridge updates memory locally.
    *   *End Session:* Bridge uploads `judy_memory.json` back to Cloud.

## 3. HOW TO EXECUTE (STEPS)

### Step 1: Install the Brain (On Mac)
1.  Download **Ollama** for macOS.
2.  Terminal: `ollama run llama3` (or `gemma:7b`).

### Step 2: The Bridge Code (Future Build)
I will provide you with a `server.py` script. You will run this in your terminal:
```bash
python3 server.py
```

### Step 3: Update Judy Config
We will add a new Provider in `judyConfig.ts`:
```typescript
export const JUDY_SETTINGS = {
  ACTIVE_PROVIDER: 'LOCAL_M1', // New Switch
  // ...
}
```

## 4. VERSION CONTROL (THE SAVE POINT)

### v1.0 (GOLD EDITION) - *CURRENT*
*   **Status:** ONLINE (Live).
*   **Brain:** Google Gemini (Cloud).
*   **Memory:** Session-based (Temporary).
*   **Access:** Public Web.

### v2.0 (SHADOW EDITION) - *PLANNED*
*   **Status:** OFFLINE (Local).
*   **Brain:** Llama 3 / Gemma (Local M1).
*   **Memory:** Google Drive JSON (Persistent).
*   **Access:** Password Protected (Localhost).

---

**STATUS:**
Phase 1 (Gold) is COMPLETE and STABLE.
Mic is now "Open Line" (Always Listening).
Waiting for signal to build the Python Bridge.

**Signed:**
*The Guard*
