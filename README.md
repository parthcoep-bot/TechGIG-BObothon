# NammaFix (ನಮ್ಮ ಫಿಕ್ಸ್)
> Autonomous Student Hostel & PG Infrastructure Maintenance Agent  
> **Built with IBM Bob & watsonx Orchestrate**  
> *IBM Bobathon: Build for Bengaluru 2026 — Student Innovation Award*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2ea44f?style=for-the-badge&logo=github)](https://parthcoep-bot.github.io/TechGIG-BObothon/)
[![GitHub Repo](https://img.shields.io/badge/Repository-parthcoep--bot%2FTechGIG--BObothon-blue?style=for-the-badge&logo=github)](https://github.com/parthcoep-bot/TechGIG-BObothon)
[![Built with IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-052FAD?style=for-the-badge&logo=IBM)](https://github.com/parthcoep-bot/TechGIG-BObothon)
[![watsonx Orchestrate](https://img.shields.io/badge/watsonx-Orchestrate-1F70C1?style=for-the-badge&logo=IBM)](https://github.com/parthcoep-bot/TechGIG-BObothon)
[![Category](https://img.shields.io/badge/Category-Student%20Innovation-red?style=for-the-badge)](#)
[![Location](https://img.shields.io/badge/Bengaluru-Koramangala%20%7C%20SG%20Palya%20%7C%20BTM-success?style=for-the-badge)](#)

---

## 🔗 Quick Links
* 🌐 **Public Live Demo:** [https://parthcoep-bot.github.io/TechGIG-BObothon/](https://parthcoep-bot.github.io/TechGIG-BObothon/)
* 📂 **GitHub Repository:** [https://github.com/parthcoep-bot/TechGIG-BObothon](https://github.com/parthcoep-bot/TechGIG-BObothon)
* 📑 **Official Submission Dossier:** [SUBMISSION.md](SUBMISSION.md)
* 📊 **Pitch Deck:** [PITCH_DECK.md](PITCH_DECK.md)
* 🎬 **Demo Walkthrough Script:** [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

---

## 🌟 Overview
**NammaFix (ನಮ್ಮ ಫಿಕ್ಸ್)** is an autonomous multi-agent maintenance grid designed for the **800,000+ students and interns** living in hostel clusters and PGs across Bengaluru (Koramangala, SG Palya / Christ University, BTM Layout, and Mathikere).

Powered by **IBM Bob**, **IBM watsonx Orchestrate**, and **IBM Granite 3.0**, NammaFix solves the chronic breakdown of shared student infrastructure (water heaters, borewell pumps, RO water purifiers, washing machines) by replacing passive complaint registers with an active, autonomous agent that:
* Ingests reports in **Kannada (ಕನ್ನಡ)**, English, Tanglish, and Hindi.
* Dispatches local technicians based on real Bengaluru corridor travel times.
* Exercises autonomous procurement within a strict 3-tier spend envelope (<= ₹2,000).
* **Guarantees zero phantom ticket closures** by enforcing mandatory independent student verification.

---

## 🚀 Instant Run (Zero Dependencies)
The complete application is contained in a single self-reliant file (`index.html`). No build tools, webpack, or external server configurations required:

1. **Option A: Direct in Browser**
   Simply double-click `index.html` or run:
   ```bash
   start index.html
   ```

2. **Option B: Local Static Server**
   ```bash
   npx serve .
   ```

3. **Option C: Public Web Link**
   Access the deployed application at [https://parthcoep-bot.github.io/TechGIG-BObothon/](https://parthcoep-bot.github.io/TechGIG-BObothon/)

---

## 📑 Key Features & Hackathon Pillars

1. **★ Built with IBM Bob (`#/bob-story`):**
   Full documentation of The Problem, The Prototype, The Bob Story, and Measurable Outcomes directly accessible inside the live app.
2. **Deterministic 22-State Machine:**
   Predictable lifecycle transitions with proactive autonomous timers (acknowledgement SLA, on-site arrival SLA, repair completion SLA).
3. **Safety First (P0 Hard-Override):**
   Immediate escalation for electrical hazards (`hoge` / ಹೊಗೆ, `kidi` / ಕಿಡಿ, `urita ide`, `karant`) preventing physical harm.
4. **Mandatory Independent Resident Verification:**
   A technician's "Done" status is classified as a claim. No ticket is marked `CLOSED` until the reporting student tests and verifies the fix.
5. **8 Interactive End-to-End Scenarios (`#/demo`):**
   Click-to-run simulations covering routine repairs, SLA breaches, spend approvals, and disputed closures.
6. **Append-Only Audit Ledger (`#/audit`):**
   Immutable history of every rupee disbursed, tool invoked, and state transitioned.

---

## 👥 Student Innovator
* **Category:** Student Category (Student Innovation Award)
* **City:** Bengaluru, Karnataka, India
* **Repository:** [https://github.com/parthcoep-bot/TechGIG-BObothon](https://github.com/parthcoep-bot/TechGIG-BObothon)
