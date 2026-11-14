# Red Team Review
# NammaFix · IBM Bobathon: Build for Bengaluru
> **Live Demo:** [https://parthcoep-bot.github.io/TechGIG-BObothon/](https://parthcoep-bot.github.io/TechGIG-BObothon/)  
> **GitHub Repository:** [https://github.com/parthcoep-bot/TechGIG-BObothon](https://github.com/parthcoep-bot/TechGIG-BObothon)

The following are the hardest questions a judge or competitor might ask,
answered as directly as possible. Nothing here is softened.

---

## On the product

**1. "This is a better ticketing system, not an agent."**

A ticketing system waits for a human to advance every state. NammaFix does
not wait. The ack timer fires without a click; the re-page fires without a
click; the escalation fires without a click. Every timeout, re-assignment, and
SLA breach in the 54-test suite fires because time passed, not because someone
pressed a button. Run the "technician does not respond" scenario and watch a
machine re-assign the job with no human input. That is an agent.

**2. "Hostels already have maintenance workflows. Why would a warden adopt this?"**

The current workflow is a WhatsApp group and a register. The warden's problem is
not that they lack a system — it is that they lack visibility and accountability.
NammaFix does not replace the warden; it makes the warden's job legible. Every
pending decision, every SLA breach, every agent action is in one place. The
warden sees what the agent did and why before they are asked to approve anything.

**3. "A student will not talk to a voice agent. They will use WhatsApp."**

The voice interface is not a phone call — it is a text input that also accepts
speech, in the same session. The demo includes typed input, Indian English, Hindi
and Hinglish. The agent does not require voice; it offers it. And the insight is
the reverse: students *do not report* through forms — they give up. The question
is not "will they use our voice UI" but "what is the lowest-friction path to a
report that creates accountability?" One sentence is lower friction than a form.

**4. "Three failures in 90 days triggering a preventive schedule is not AI — it is a spreadsheet rule."**

Correct. That is intentional. The rule is transparent, auditable, and changeable
by the warden. It is documented as a rule, not claimed as a model prediction.
The value is not the intelligence — it is the institutional memory that makes the
rule possible. Without a persistent asset record, you cannot apply any rule,
however simple.

**5. "What happens when the agent is wrong?"**

Two answers. First: the agent cannot close a ticket without a human confirmation
(resident or warden). Being wrong about the repair only means the ticket stays
open and the verification step fails — which triggers a re-open and an exclusion
of the technician from reassignment. Second: every action is in the audit log
before the next line of code runs. A warden can see what the agent did, reverse
the consequence (re-open, re-assign, override the spend decision), and the
agent's record reflects the correction.

---

## On the rails

**6. "Your rails are all in DEMO mode. Why should we believe any of this works?"**

Every adapter is written to the documented API shape. The mode contract is
explicit: DEMO means no network call was made, and the response says so. SANDBOX
means a real call to the vendor's test environment succeeded. We have DEMO
because we had no credentials — not because the adapter does not exist. The
test suite covers the adapter logic, including the P3P challenge/capture shape
and the Bengaluru Logistics candidate-scoring path. The difference between DEMO and
SANDBOX is one environment variable.

**7. "You have not verified the Bengaluru Hyperlocal Logistics API paths."**

Confirmed. The paths in `.env.example` and the adapter are labeled CONFIG because
they were inferred from page-section anchors on the Bengaluru Hyperlocal Logistics reference
page, not from live API documentation. This is noted in the adapter header and
in the integration status response. It means the first live call may require a
path correction — which is why the paths are environment variables and not
hardcoded strings.

**8. "IBM Granite Multilingual Speech's outbound calling capability is not implemented."**

Confirmed. We found no public self-serve outbound-telephony endpoint in the
IBM Granite Multilingual Speech documentation. The adapter raises NOT_IMPLEMENTED rather than invent one.
The inbound and SSE paths are implemented. Outbound calling is noted as a gap in
the integration matrix.

**9. "P3P Escrow credential minting is not implemented."**

Confirmed. The P3P Escrow SDK does the signing; inventing a signing scheme would
be fabricating a security-critical operation. The challenge/capture flow is
implemented around that gap. Minting becomes a one-function wire-up once the
SDK is available with credentials.

**10. "The fourth rail (institutional authority) is just an idea."**

Yes. It is proposed and marked as such throughout the document and the demo. The
value of proposing it is the argument: the existing three rails have a gap that
no existing product fills, and the gap is the reason the agent has to stop at a
warden phone call rather than verifying authority programmatically. Naming the
gap is part of the submission.

---

## On the autonomy claim

**11. "Level 3 / Level 4 — you have not confirmed these definitions with IBM Bobathon."**

Confirmed. The L1–L4 definitions used are assumed from the brief text reproduced
in the instruction documents. The official brief PDF was not attached, and this
is disclosed at the top of `docs/ROUND2_ANSWERS.md`. Every autonomy claim is
defensible independently of whatever the official definitions say: the agent acts
without human input inside the spend envelope and stops outside it. That property
is demonstrable.

**12. "How do you prevent the agent from being gamed by a resident who keeps confirming false repairs?"**

The verification policy has a 48-hour cooldown before a resident can re-confirm
the same ticket. A re-opened ticket after a dispute excludes the confirming
resident from the next verification loop, and verification falls back to a
different resident or a warden sign-off.

**13. "A resident confirming 'it works' is not a reliable verification."**

It is better than a technician confirming 'it works'. The current baseline is
zero verification — the technician says fixed and the ticket is closed. Resident
confirmation requires the person who reported the failure to report its absence.
For hazard tickets, a warden must sign off — resident confirmation is
insufficient. The demo enforces both.

---

## On the data

**14. "All your demo data is invented. How do you know the agent would behave the same on real data?"**

The engine's behaviour is a function of the policies, which are deterministic
pure functions, not the data. The priority scoring would produce the same P1 for
any asset with three failures in 90 days and 46 residents. What would change is
whether a real hostel's MTBF looked like WH-03's — which is why every metric
in the demo is labeled DEMO DATA and every claim qualified as a design target.

**15. "You claimed a 60% reduction in MTTR. Is that a real number?"**

No. It is named as a design target in Q8 and qualified as 'we do not have a
measured current baseline'. The answer does not present it as a measured outcome.

---

## On the build itself

**16. "The code is ~3,800 lines. How do we know it actually runs?"**

The test suite (54 tests, 0 failures) is run with `npm test` against the real
engine. The HTTP server has been smoke-tested with `scripts/smoke.sh` — real
curl calls over the wire, the results of which are in the session transcript. The
published demo at the artifact link runs the same engine in the browser. All
three execution contexts — test runner, HTTP API, and browser — share the same
`src/core/` without modification.

**17. "You did not attach a IBM Bobathon screenshot or the official brief PDF."**

Confirmed. The uploads directory was empty when the build session started. This
is disclosed in the README, the answers document, and this red team. No visual
claim about the IBM Bobathon brand, the judging criteria, or the official brief is made
without the qualifier REQUIRES OFFICIAL CONFIRMATION. The submission is built
from the text in the instruction documents and the web research documented in the
session transcript.
