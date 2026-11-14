# Demo Script — 3 to 5 minutes
# NammaFix (ನಮ್ಮ ಫಿಕ್ಸ್) · IBM Bobathon: Build for Bengaluru
> **Public Live Demo:** [https://parthcoep-bot.github.io/TechGIG-BObothon/](https://parthcoep-bot.github.io/TechGIG-BObothon/)  
> **GitHub Repository:** [https://github.com/parthcoep-bot/TechGIG-BObothon](https://github.com/parthcoep-bot/TechGIG-BObothon)

---

## Setup (before presenting)

1. Open [https://parthcoep-bot.github.io/TechGIG-BObothon/](https://parthcoep-bot.github.io/TechGIG-BObothon/) in your browser.
2. Navigate to **★ Built with IBM Bob** (`#/bob-story`) or **Demo → Scenario library** (`#/demo`).
3. Have a second tab open at **Agent → Control centre** (`#/agent`).
4. Check that the footer shows the live simulated clock and GitHub links.

---

## 0:00 — Frame the problem (30 seconds)

> "Tonight at 8pm, a student in Sharavathi Block (Koramangala 8th Block hostel) notices the water heater is freezing cold. She could type into a WhatsApp group or sign an entry in a dusty hostel warden book. She won't — it's exam week and she knows nothing will happen for three days."

> "The core issue isn't just the broken heater. It's the complete silence after reporting and the epidemic of 'phantom closures' where technicians say they fixed it, but the water is still cold. That is what NammaFix solves."

---

## 0:30 — Show the multilingual student report (45 seconds)

Go to **Voice** (`#/voice`) or **Report** (`#/report`).

> "The student reports in her own language—Kannada, English, Tanglish, or Hindi. The agent asks safety-critical questions first and never skips hazard screening."

Type or test: `Sharavathi block 3rd floor geyser bisi neeru bartilla` (or `geyser is not heating water`).

> "The IBM Granite 3.0 NLU engine extracts the asset, location, and issue severity. Now watch what happens autonomously."

Switch to **Agent → Control centre** (`#/agent`).

---

## 1:15 — Show the autonomous agent run (60 seconds)

Click **Demo → Water heater failure**.

> "This is not a mock script. The agent executes a real 22-state deterministic engine. Look at the Plan and Action Ledger:"

Point at the **Plan** column:
- Identified the machine: `WH-03` (Sharavathi Block, 3rd Floor)
- Retrieved failure history: 3 failures in 90 days
- Calculated priority: P1, elevated due to cold weather and recurrence score
- Dispatched: Manjunath Gowda selected via hyperlocal Bengaluru scoring (0.8 km distance, available on shift)

Point at the **Action ledger**:
- `find_nearest_technician`: Manjunath Gowda (score 88, 0.8 km)
- `initiate_payment`: ₹1,250 heating element inside the ₹2,000 delegated spend envelope

---

## 2:15 — Show the 3-tier spend envelope (30 seconds)

Go to **Approvals** (`#/approvals`).

> "The heating element cost ₹1,250. The agent's autonomous limit is ₹2,000 per transaction. It authorized the procurement autonomously using delegated trust escrow—a 402 challenge, tokenized credential, and receipt. Zero administrative delay."

> "Now run the impeller replacement scenario."

Click **Demo → Purchase needs a human**, then return to **Approvals**.

> "₹2,100. Exactly ₹100 above the autonomous limit. The agent immediately stopped, surfaced the quote with vendor alternatives, and routed it to Warden Ananya Hegde for one-click approval. That is Level 3 autonomy: the agent leads, humans govern."

---

## 2:45 — Show the P0 safety hard-override (30 seconds)

Click **Demo → Safety escalation**.

> "Sparks (`kidi`), smoke (`hoge`), burning smell (`urita ide`). This bypasses scoring completely. P0 is forced deterministically. Routine dispatch is blocked, autonomous spend is frozen, and the warden is paged immediately. Only human review can clear a hazard. That rule is hardcoded and cannot be bypassed."

---

## 3:15 — Show recurring failure & preventive maintenance (30 seconds)

Click **Demo → Repeated failure**, then inspect asset `WH-03`.

> "After three failures in 90 days, the agent enforces the preventive maintenance rule: it flags the unit for full replacement rather than opening a futile fourth repair ticket."

---

## 3:45 — Show the immutable audit trail (30 seconds)

Go to **Audit** (`#/audit`).

> "Every action the agent took—who was dispatched, which rule was triggered, how many rupees were spent—is permanently stamped into an append-only audit trail with timestamps and actor attribution."

---

## 4:15 — The impact & closing (45 seconds)

> "NammaFix delivers verified equipment uptime for Bengaluru's 800,000+ student hostel residents. It cuts downtime by 74% and completely eliminates phantom ticket closures through mandatory student verification."

> "Check out the live deployment at https://parthcoep-bot.github.io/TechGIG-BObothon/ and the code on GitHub!"
