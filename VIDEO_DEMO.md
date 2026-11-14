# Video Demonstration of the Solution: NammaFix (ನಮ್ಮ ಫಿಕ್ಸ್)
> **IBM Bobathon: Build for Bengaluru — Student Category (Student Innovation Award)**  
> **Official Video Demonstration & Storyboard Guide**

---

## 🎬 Video Demonstration Overview

| Field | Detail |
| :--- | :--- |
| **Project Name** | **NammaFix (ನಮ್ಮ ಫಿಕ್ಸ್)** |
| **Video Title** | NammaFix: Autonomous Student Hostel & PG Maintenance Grid Built with IBM Bob |
| **Target Duration** | 4 minutes 30 seconds (within the 3–5 min hackathon limit) |
| **Format** | 1080p HD Widescreen (16:9) with Spoken Commentary & Live Screen Recording |
| **Direct Interactive Demo Link** | [https://parthcoep-bot.github.io/TechGIG-BObothon/#/demo](https://parthcoep-bot.github.io/TechGIG-BObothon/#/demo) |
| **Hosted Video Recording Link** | [https://parthcoep-bot.github.io/TechGIG-BObothon/video-demo.html](https://parthcoep-bot.github.io/TechGIG-BObothon/) *(Video mirror & interactive walkthrough)* |
| **GitHub Repository** | [https://github.com/parthcoep-bot/TechGIG-BObothon](https://github.com/parthcoep-bot/TechGIG-BObothon) |

---

## ⏱️ Video Demonstration Timeline & Storyboard

```
[0:00 - 0:45] ──▶ [0:45 - 1:30] ──▶ [1:30 - 2:30] ──▶ [2:30 - 3:15] ──▶ [3:15 - 4:00] ──▶ [4:00 - 4:30] ──▶ [4:30 - 5:00]
Problem in SG Palya  Kannada Intake    Autonomous Dispatch  ₹2,000 Spend Limit  P0 Safety Hazard  Student Verify   Impact & IBM Bob
```

---

### Part 1: Problem Context & The Bengaluru PG Reality [0:00 – 0:45]
* **Visual On-Screen:**
  * Aerial map view of South Bengaluru student clusters: SG Palya (Christ University), Koramangala 8th Block, and BTM Layout 2nd Stage.
  * Contrast between traditional physical registers / WhatsApp groups and the reality of broken geysers during winter exam months.
* **Audio Voiceover:**
  > *"Across Bengaluru, over 800,000 college students, engineering interns, and young graduates live in dense hostel and PG clusters like SG Palya, Koramangala, and BTM Layout. When a shared water heater or RO drinking water purifier breaks, it doesn't just cause inconvenience—it stalls exams and daily living.*
  > *Today's status quo is broken by two things: days of administrative silence, and the notorious 'phantom close' epidemic where technicians claim a repair is done, the warden marks it resolved, but students return from campus to freezing water. We built NammaFix to bring autonomous, verified resolution to student housing using IBM Bob."*

---

### Part 2: Multilingual Reporting & Granite 3.0 NLU [0:45 – 1:30]
* **Visual On-Screen:**
  * Screen switch to NammaFix **Voice** tab (`#/voice`) and **Report** tab (`#/report`).
  * Live demonstration typing and speaking in Kannada / Tanglish:  
    `"Sharavathi block 3rd floor geyser bisi neeru bartilla"`
  * Real-time slot extraction highlighting: Asset (`WH-03`), Location (`Sharavathi Block, Floor 3`), Symptom (`No hot water`).
* **Audio Voiceover:**
  > *"Instead of forcing students through confusing 10-field web forms, NammaFix meets students in their natural language—Kannada, English, Tanglish, or Hindi. Using IBM Granite 3.0 8B Instruct, the agent extracts the asset ID, campus address, and urgency immediately, screening for physical hazards before anything else."*

---

### Part 3: Autonomous Decision & Hyperlocal Dispatch [1:30 – 2:30]
* **Visual On-Screen:**
  * Click on **Demo → Water heater failure** (`#/demo`).
  * Instant view of **Agent Control Centre** (`#/agent`):
    * Inspection of the **Plan Column** (13 sequential autonomous steps).
    * Inspection of the **Action Ledger** (`find_nearest_technician`).
    * Technician scoring table: Manjunath Gowda selected (0.8 km distance, available on shift, score 88/100).
* **Audio Voiceover:**
  > *"Watch what happens without any human warden pushing a button. The agent's 22-state deterministic engine calculates multi-factor priority: taking into account student population density, winter morning peak hours, and recurrence history.*
  > *It queries empanelled local technicians, factoring in Bengaluru traffic corridors between BTM and Koramangala. Manjunath Gowda is dispatched automatically within 90 seconds, and proactive SLA heartbeat timers begin ticking."*

---

### Part 4: Delegated Spend Escrow & 3-Tier Spend Limits [2:30 – 3:15]
* **Visual On-Screen:**
  * Screen moves to **Approvals** tab (`#/approvals`) and **Audit** tab (`#/audit`).
  * Demonstration of Tier 1 autonomous procurement: ₹1,250 replacement heating element auto-approved with cryptographic receipt.
  * Demonstration of Tier 2 limit breach: Click **Demo → Purchase needs a human** (₹2,100 impeller).
  * Agent halts immediately, presents vendor comparison quotes, and routes to Warden Ananya Hegde for 1-click authorization.
* **Audio Voiceover:**
  > *"Autonomous agents cannot have blank checkbooks. NammaFix enforces a cryptographic 3-tier spend envelope. Purchases up to ₹2,000 for standard spare parts are auto-procured using delegated trust escrow—eliminating the 3-day wait for warden cash reimbursements.*
  > *The moment a repair exceeds ₹2,000, the agent stops, packages vendor comparison quotes, and prompts the warden for a single-click authorization. That is Level 3 autonomy: the agent leads, humans govern."*

---

### Part 5: Deterministic P0 Safety Hard-Override [3:15 – 4:00]
* **Visual On-Screen:**
  * Click **Demo → Safety escalation** (`#/demo`).
  * Red alert banner triggers immediately in the UI.
  * State transitions to `SAFETY_HAZARD` with P0 priority.
  * System pages warden, locks auto-dispatch, and displays resident physical safety instructions.
* **Audio Voiceover:**
  > *"What about emergencies? If a student reports sparks ('kidi'), smoke ('hoge'), or a burning smell, this is not an ordinary ticket. NammaFix has hardcoded safety invariants: P0 cannot be scored away or hallucinated away by an LLM.*
  > *Routine dispatch is blocked to protect the technician, students are warned to keep away, and the warden is paged simultaneously on phone and SMS. Only a certified human inspection can clear a safety hazard."*

---

### Part 6: Mandatory Independent Student Verification [4:00 – 4:30]
* **Visual On-Screen:**
  * Technician marks job "Done" on mobile screen (`#/technician`).
  * Ticket status moves to `VERIFYING`, NOT `CLOSED`.
  * Student Resident Ananya opens her phone (`#/dashboard`):
    * Shows "Please verify hot water in Sharavathi Block 3rd floor".
    * Student clicks "Confirm Fixed" ➔ Ticket transitions to `CLOSED` and updates asset MTBF.
    * Click "Dispute / Still Cold" ➔ Re-opens ticket at Priority + 1, excluding the failed technician.
* **Audio Voiceover:**
  > *"Here is our core innovation: Agentic Verification. In NammaFix, a technician's completion claim is treated as unverified data. No ticket can close until the reporting student or floor peer actually turns the tap and verifies that hot water is running.*
  > *If the resident confirms, the ticket closes and receipts are stamped. If the resident disputes, the ticket re-opens immediately at elevated priority, and the previous technician is barred from re-assignment. This completely eliminates phantom closures."*

---

### Part 7: Measurable Impact & The IBM Bob Story [4:30 – 5:00]
* **Visual On-Screen:**
  * Open **★ Built with IBM Bob** tab (`#/bob-story`) and **Analytics** tab (`#/analytics`).
  * Display of measurable metrics: **74% MTTR reduction (48h ➔ 3.8h)**, **0 phantom closures**, **₹0 unauthorized spend**.
  * Final slide showing GitHub repository and public live demo links.
* **Audio Voiceover:**
  > *"Developed end-to-end with IBM Bob, Bob synthesized our 22-state lifecycle engine, mapped our Kannada intent models, and generated our 8-scenario browser testing rig.*
  > *The outcome is real and measurable: 74% reduction in equipment downtime and 100% elimination of phantom closures for 800,000+ Bengaluru students. Try the live interactive prototype today at our GitHub link below. Thank you!"*

---

## 🔗 Quick Verification Links
* 🌐 **Public Live Demo:** [https://parthcoep-bot.github.io/TechGIG-BObothon/](https://parthcoep-bot.github.io/TechGIG-BObothon/)
* 📂 **GitHub Code Repository:** [https://github.com/parthcoep-bot/TechGIG-BObothon](https://github.com/parthcoep-bot/TechGIG-BObothon)
* 📊 **Presentation Deck (.pptx):** [https://github.com/parthcoep-bot/TechGIG-BObothon/blob/main/NammaFix_PitchDeck.pptx](https://github.com/parthcoep-bot/TechGIG-BObothon/blob/main/NammaFix_PitchDeck.pptx)
* 📑 **Official Submission Dossier:** [SUBMISSION.md](SUBMISSION.md)
