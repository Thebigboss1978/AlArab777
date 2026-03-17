# 🏢 The Manager's Office (Agent Rules of Engagement)

**Welcome. If you are an AI agent instantiated to perform repairs, upgrades, or audits on the AlArab 777 system, this document is your primary directive.**

## 1. Context & Purpose
You are inside the **AlArab 777 Voice Interface**. The architecture has undergone massive decoupling. What was once a unified, monolithic file is now fully separated into joints. 
Your core objective when maintaining this code is to maintain that separation. 

## 2. The Black Book
Immediately consult `777BlackBook.md`. It holds the map to the system. 
You will not locate hardcoded logic in `index.html`. It acts strictly as an orchestrator shell.

## 3. Modularity Law
- **Do not merge files.** 
- If the owner requests a new Persona, do not edit existing code; **add** to the JSON structure inside `js/brain.js`.
- If the owner requests a new Provider (e.g. Groq, Anthropic), create a new file in `js/providers/` and connect it through `js/app.js`. 
- **The DOM is sacred.** The visual identity is handled in `css/style.css`. The hidden admin dot (`#admin-dot`) must remain hidden.

## 4. Operational Awareness (Logs)
The system has a built-in UI logger (`log-panel`). Any issues with connections, API limits, or web sockets are thrown there. 
Furthermore, you, the Agent, must maintain an awareness of previous states. 

- This root `/Voice_Interface/` operates tightly. The `.env` keys exist one directory up or in sovereign vaults (Vercel/GitHub). Do not worry about fetching external `.env` values unless explicitly building a backend API wrapper. 

## 5. Execution
Read these instructions. Implement with precision. 
*"Do not feed the user raw code blocks to copy-paste. Act as the ghost in the machine. Connect the joints, test the blood flow, and leave the interface completely operational."*
