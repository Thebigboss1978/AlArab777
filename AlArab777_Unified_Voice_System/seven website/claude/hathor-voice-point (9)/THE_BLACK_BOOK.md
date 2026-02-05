
# THE BLACK BOOK (الكتاب الأسود)
**Official Manual of AlArab Club 777 Digital Infrastructure**
*Restricted Access | Nazlet El-Semman Headquarters*

---

## 1. THE ARCHITECTURE (المنظومة)
The system is built as a "Closed Fortress" (قلعة مغلقة).

### A. The Core (The Brain)
We use a **Multi-Tunnel Architecture**. The Frontend is a React 19 Shell that acts as a receiver. The logic lives in the Cloud (Google Gemini Live).

### B. The Files (الملفات)
*   **Closed Source Logic:** All crucial logic is obfuscated during the build process.
*   **`judyConfig.ts`**: This is the HEART. It contains the personality and the keys.
*   **`useVoiceAgent.ts`**: This is the NERVOUS SYSTEM. It carries the audio signals.

---

## 2. THE TUNNELS (الأنفاق) - "APIs"
We do not call them APIs. We call them Tunnels.

### Tunnel 1: GOOGLE (Gemini) - *ACTIVE*
*   **Code Name:** `gemini-2.5-flash-native-audio`
*   **Role:** The main driver. Fast, intelligent, handles the "Logic".
*   **Wake Word:** "Hey Google" or "Gemini".

### Tunnel 2: GPT (OpenAI) - *STANDBY*
*   **Code Name:** `gpt-4o-realtime-preview`
*   **Role:** The Artist. Used for creative writing or very complex reasoning.
*   **Wake Word:** "Hey GPT".

### Tunnel 3: ELEVENLABS - *STANDBY*
*   **Code Name:** `eleven-turbo-v2`
*   **Role:** The Singer. Pure voice synthesis.
*   **Wake Word:** "ElevenLabs".

*How to Switch Tunnels?*
Go to `config/judyConfig.ts` and change `ACTIVE_PROVIDER`.

---

## 3. SECURITY PROTOCOLS (التأمين)
We have engaged the **777 Shield**:
1.  **Right-Click Disabled:** Prevents basic "Save As".
2.  **DevTools Detection:** Pressing F12 triggers a Red Alert Screen ("Access Denied").
3.  **Console Clearing:** The console is wiped constantly to hide logs from amateurs.
4.  **Code Obfuscation:** Variable names like `HotelGenerator` become `a`, `b`, `x` in the final build.

*Note: A true High-Tech Hacker can enter, but they are our friends. The 'Normal People' cannot steal this.*

---

## 4. THE LIVE DEPLOYMENT (كيفية الرفع أونلاين)
**Follow this map carefully, friend:**

1.  **The Keys:** Ensure your `.env` file has the `API_KEY`.
2.  **The Satellite (GitHub):** Push this code to a Private Repository.
3.  **The Broadcast (Vercel):**
    *   Connect Vercel to GitHub.
    *   Import the Project.
    *   **CRITICAL:** Go to Settings -> Environment Variables. Add `API_KEY` there.
    *   Click "Deploy".

---

## 5. THE MENU (القائمة الكاملة)
This is what the system serves:

1.  **Automated Landing Pages:** Just paste a Map Link -> Get a Website.
2.  **Smart Pricing:** Auto-calculates the "777 Discount" (No Booking.com fees).
3.  **Judy Voice:** The Floating Orb that speaks Arabic & English.
4.  **Security Shield:** Protects your intellectual property.
5.  **Tasks Board:** Tracks the progress of the mission.

---

**Signed:**
*The Guard*
*AlArab Club 777*
