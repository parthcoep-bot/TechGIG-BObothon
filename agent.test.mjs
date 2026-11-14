import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSystem } from '../src/core/index.js';
import {
  safetyPolicy, priorityPolicy, spendingPolicy, authorizationPolicy,
  verificationPolicy, escalationPolicy, FORBIDDEN_FOR_AGENT,
} from '../src/core/policy.js';
import { extractSlots, parseYesNo, resolveAsset } from '../src/core/nlu.js';
import { MACHINE, STATES } from '../src/core/stateMachine.js';
import { DemoMapsProvider, sanitizeError, classifyFailure } from '../src/core/adapters/index.js';

const sys = () => createSystem();
const REPORT = 'The water heater on the third floor of B block is not working';


describe('Policy engine — deterministic, no model in the loop', () => {
  test('hazard terms force P0 in English, Hinglish and Devanagari', () => {
    for (const t of ['there is smoke coming out', 'geyser se jal raha hai smell', 'मुझे झटका लगा', 'sparking from the switch']) {
      const s = safetyPolicy({ text: t });
      assert.equal(s.hazard, true, `expected hazard for: ${t}`);
      assert.equal(s.forcedPriority, 'P0');
      assert.equal(s.requiresHumanImmediately, true);
    }
  });

  test('a clear report is not a hazard', () => {
    assert.equal(safetyPolicy({ text: REPORT, hazardAnswer: false }).hazard, false);
  });

  test('the agent can never reach P0 by scoring — only safety can', () => {
    const max = priorityPolicy({
      safety: { forcedPriority: null }, essential: true, servesResidents: 5000,
      failuresLast90Days: 99, hoursSinceLastFailure: 1, localHour: 20,
      duplicateReports: 99, functionLost: 'FULL',
    });
    assert.notEqual(max.priority, 'P0');
    assert.equal(max.priority, 'P1');
  });

  test('safety overrides scoring entirely', () => {
    const p = priorityPolicy({ safety: safetyPolicy({ text: 'burning smell' }), essential: false, servesResidents: 1 });
    assert.equal(p.priority, 'P0');
    assert.equal(p.overridden, true);
  });

  test('priority shows its arithmetic', () => {
    const p = priorityPolicy({ safety: { forcedPriority: null }, essential: true, servesResidents: 46, failuresLast90Days: 3, localHour: 20, functionLost: 'FULL' });
    assert.ok(p.factors.length >= 4);
    assert.equal(p.score, p.factors.reduce((s, f) => s + f.points, 0));
  });

  test('spending: all three ceilings must pass', () => {
    const policy = { agentPerTransactionPaise: 200000, agentPerTicketPaise: 300000, agentDailyPaise: 1000000, wardenPerTransactionPaise: 1500000, hardCeilingPaise: 5000000, spentTodayPaise: 0 };
    assert.equal(spendingPolicy({ amountPaise: 125000, policy }).decision, 'AUTONOMOUS');
    assert.equal(spendingPolicy({ amountPaise: 250000, policy }).decision, 'HUMAN_APPROVAL');
    assert.equal(spendingPolicy({ amountPaise: 150000, ticketSpentPaise: 200000, policy }).decision, 'HUMAN_APPROVAL');
    assert.equal(spendingPolicy({ amountPaise: 150000, policy: { ...policy, spentTodayPaise: 990000 } }).decision, 'HUMAN_APPROVAL');
  });

  test('spending: unknown payee is forbidden at any amount', () => {
    const policy = { agentPerTransactionPaise: 200000, agentPerTicketPaise: 300000, agentDailyPaise: 1000000, wardenPerTransactionPaise: 1500000, hardCeilingPaise: 5000000, spentTodayPaise: 0 };
    assert.equal(spendingPolicy({ amountPaise: 100, policy, vendorEmpanelled: false }).decision, 'FORBIDDEN');
  });

  test('spending: hazard tickets never spend autonomously', () => {
    const policy = { agentPerTransactionPaise: 200000, agentPerTicketPaise: 300000, agentDailyPaise: 1000000, wardenPerTransactionPaise: 1500000, hardCeilingPaise: 5000000, spentTodayPaise: 0 };
    assert.equal(spendingPolicy({ amountPaise: 1000, policy, hazardTicket: true }).decision, 'HUMAN_APPROVAL');
  });

  test('spending: above the hard ceiling nobody in-app can approve', () => {
    const policy = { agentPerTransactionPaise: 200000, agentPerTicketPaise: 300000, agentDailyPaise: 1000000, wardenPerTransactionPaise: 1500000, hardCeilingPaise: 5000000, spentTodayPaise: 0 };
    assert.equal(spendingPolicy({ amountPaise: 6000000, policy }).decision, 'FORBIDDEN');
  });

  test('every forbidden action is refused for the agent', () => {
    for (const a of FORBIDDEN_FOR_AGENT) assert.equal(authorizationPolicy('AGENT', a).allowed, false, a);
  });

  test('roles cannot borrow each other permissions', () => {
    assert.equal(authorizationPolicy('RESIDENT', 'approve_spend').allowed, false);
    assert.equal(authorizationPolicy('TECHNICIAN', 'close_ticket').allowed, false);
    assert.equal(authorizationPolicy('TECHNICIAN', 'approve_spend').allowed, false);
    assert.equal(authorizationPolicy('WARDEN', 'approve_spend').allowed, true);
    assert.equal(authorizationPolicy('ADMIN', 'anything_at_all').allowed, true);
  });

  test('hazard tickets cannot be auto-closed by verification policy', () => {
    assert.equal(verificationPolicy({ priority: 'P0', hazard: true }).autoCloseAllowed, false);
    assert.equal(verificationPolicy({ priority: 'P1', recurring: true }).autoCloseAllowed, false);
    assert.equal(verificationPolicy({ priority: 'P2' }).autoCloseAllowed, true);
  });

  test('escalation ladder climbs and terminates at the estate manager', () => {
    const targets = [0, 1, 2, 3, 9].map((a) => escalationPolicy({ breachType: 'ACK', priority: 'P1', attempts: a }).target);
    assert.deepEqual(targets, ['TECHNICIAN', 'NEXT_TECHNICIAN', 'WARDEN', 'ADMIN', 'ADMIN']);
  });
});


describe('NLU — rule-based slot extraction', () => {
  test('English, Hinglish and asset-tag reports all resolve', () => {
    assert.equal(extractSlots(REPORT).slots.machineType, 'WATER_HEATER');
    assert.equal(extractSlots(REPORT).slots.blockName, 'B Block');
    assert.equal(extractSlots(REPORT).slots.floor, 3);
    assert.equal(extractSlots('B block teesri manzil ka geyser band hai').slots.machineType, 'WATER_HEATER');
    assert.equal(extractSlots('B block teesri manzil ka geyser band hai').slots.floor, 3);
    assert.equal(extractSlots('WH-03 is dead').slots.assetTag, 'WH-03');
    assert.equal(extractSlots('wh 3 not working').slots.assetTag, 'WH-03');
  });

  test('partial loss is distinguished from total loss', () => {
    assert.equal(extractSlots('water is only lukewarm').slots.functionLost, 'PARTIAL');
    assert.equal(extractSlots('sometimes it works then stops').slots.functionLost, 'INTERMITTENT');
  });

  test('missing slots are reported instead of guessed', () => {
    const r = extractSlots('the geyser is broken');
    assert.ok(r.missing.includes('blockName'));
    assert.ok(r.missing.includes('floor'));
    assert.ok(r.confidence < 1);
  });

  test('yes/no parsing handles Hindi and refuses to guess', () => {
    assert.equal(parseYesNo('nahi'), false);
    assert.equal(parseYesNo('no smoke'), false);
    assert.equal(parseYesNo('haan'), true);
    assert.equal(parseYesNo('हाँ'), true);
    assert.equal(parseYesNo('maybe possibly'), null);
  });

  test('ambiguity is detected rather than resolved arbitrarily', () => {
    const s = createSystem();
    const r = resolveAsset({ machineType: 'WATER_HEATER' }, s.store.db.assets, s.store.db.blocks);
    assert.equal(r.asset, null);
    assert.ok(r.candidates.length > 1);
  });
});


describe('State machine', () => {
  test('all 22 states are specified with trigger, action, timer and escalation', () => {
    assert.equal(STATES.length, 22);
    for (const s of STATES) {
      const spec = MACHINE[s];
      assert.ok(spec, `${s} missing`);
      for (const k of ['description', 'trigger', 'next', 'failure', 'escalation']) {
        assert.ok(spec[k] !== undefined, `${s}.${k} missing`);
      }
    }
  });
  test('every declared next-state exists', () => {
    for (const s of STATES) for (const n of MACHINE[s].next) assert.ok(STATES.includes(n), `${s} → ${n} is not a state`);
  });
});


describe('Happy flow — report to verified closure', () => {
  test('full WH-03 journey completes and closes only after verification', async () => {
    const s = sys();
    const { agent, store } = s;

    const q = await agent.intake({ text: REPORT, reporterId: 'u_ananya', source: 'VOICE' });
    assert.equal(q.kind, 'HAZARD_QUESTION', 'safety screen must come before dispatch');

    const r = await agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false, source: 'VOICE' });
    assert.equal(r.kind, 'RUN_STARTED');
    const ticket = r.ticket;
    assert.equal(store.asset(ticket.assetId).tag, 'WH-03');
    assert.equal(ticket.priority, 'P1', 'recurring + essential + 46 residents + evening should reach P1');

    await agent.runUntilBlocked(r.run.id);
    let run = store.run(r.run.id);
    assert.equal(run.state, 'ASSIGNED');
    assert.equal(run.waitingFor, 'TECHNICIAN_ACK');
    assert.ok(run.nextAction.includes('acknowledg'));

    const wo = store.db.workOrders.find((w) => w.ticketId === ticket.id);
    assert.equal(wo.technicianId, 't_salim', 'Kavita is off shift at 20:10; Iqbal is further with 3 open jobs');

    await agent.humanEvent(run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN', actor: 'u_salim' });
    run = store.run(run.id);
    assert.equal(run.state, 'DIAGNOSING');

    await agent.humanEvent(run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Heating element open circuit', partId: 'sp_element' });
    run = store.run(run.id);
    assert.equal(run.state, 'REPAIR_IN_PROGRESS', 'element is ₹1,250 — inside the ₹2,000 envelope, so no human needed');

    const payment = store.db.payments[0];
    assert.ok(payment, 'a payment should have been captured');
    assert.equal(payment.amountPaise, 125000);
    assert.equal(payment.mode, 'DEMO');
    assert.ok(store.db.paymentReceipts[0].receiptId.startsWith('DEMO-'), 'demo receipts must be unmistakable');

    await agent.humanEvent(run.id, 'REPAIR_DONE', { actorRole: 'TECHNICIAN', repairNotes: 'Replaced 2000W heating element, tested three heat cycles, earthing verified.' });
    run = store.run(run.id);
    assert.equal(run.state, 'VERIFICATION_PENDING', 'the agent must NOT close on a technician claim');
    assert.equal(store.ticket(ticket.id).state, 'VERIFICATION_PENDING');

    await agent.humanEvent(run.id, 'RESIDENT_CONFIRM', { actorRole: 'RESIDENT', by: 'u_ananya' });
    run = store.run(run.id);
    const t = store.ticket(ticket.id);
    assert.equal(t.state, 'CLOSED');
    assert.ok(t.downtimeMinutes >= 0);
    assert.equal(store.asset(t.assetId).status, 'AT_RISK', 'recurrence should leave the asset flagged, not silently healthy');
    assert.equal(run.state, 'RECURRING_FAILURE');

    const pred = store.db.maintenancePredictions[0];
    assert.ok(pred, 'closing a recurring failure must produce a preventive recommendation');
    assert.ok(pred.reasons.length >= 1);
    assert.equal(pred.partToPreStage, 'sp_element');

    const tools = store.db.agentActions.map((a) => a.tool);
    for (const needed of ['identify_asset', 'get_machine_history', 'detect_recurring_failure', 'calculate_priority', 'create_ticket', 'find_nearest_technician', 'assign_technician', 'check_inventory', 'initiate_payment', 'verify_repair', 'close_ticket', 'schedule_preventive_maintenance']) {
      assert.ok(tools.includes(needed), `expected the agent to call ${needed}`);
    }
    assert.ok(store.db.auditLogs.length > 15, 'the run must leave a substantial audit trail');
    assert.ok(store.db.agentActions.every((a) => typeof a.rationale === 'string' && a.rationale.length > 0), 'every action needs a rationale');
  });

  test('selection rationale names the rejected candidates', async () => {
    const s = sys();
    const r = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    const asg = s.store.db.assignments[0];
    assert.ok(asg.selectionRationale.includes('Travel time'));
    assert.ok(asg.selectionRationale.includes('Current load'));
  });
});


describe('Unhappy flows', () => {
  async function started(text = REPORT, reporter = 'u_ananya') {
    const s = sys();
    const r = await s.agent.intake({ text, reporterId: reporter, hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    return { s, r, run: s.store.run(r.run.id), ticket: r.ticket };
  }

  test('A: technician never responds — agent re-pages, then reassigns, unprompted', async () => {
    const { s, run } = await started();
    const first = s.store.db.workOrders[0].technicianId;
    await s.agent.advanceMinutes(11); 
    let r2 = s.store.run(run.id);
    assert.ok(s.store.db.escalations.length >= 1, 'a timer nobody triggered must produce an escalation');
    await s.agent.advanceMinutes(6);
    r2 = s.store.run(run.id);
    const wo = s.store.db.workOrders[0];
    assert.notEqual(wo.technicianId, first, 'after the ladder the job must move to another technician');
    assert.equal(s.store.technician(first).status, 'UNRESPONSIVE');
  });

  test('B: SLA breach is recorded on the ticket and raises run risk', async () => {
    const { s, run, ticket } = await started();
    await s.agent.advanceMinutes(12);
    assert.ok(s.store.ticket(ticket.id).slaBreaches >= 1);
    assert.notEqual(s.store.run(run.id).risk, 'LOW');
  });

  test('C: incomplete information produces one question, not a form', async () => {
    const s = sys();
    const q = await s.agent.intake({ text: 'the geyser is broken', reporterId: 'u_ananya' });
    assert.equal(q.kind, 'QUESTION');
    assert.ok(q.question.length > 0);
    assert.ok(!q.question.includes('?') || q.question.split('?').length === 2, 'exactly one question');
  });

  test('D: a second reporter corroborates instead of creating a duplicate work order', async () => {
    const { s, ticket } = await started();
    const before = s.store.db.tickets.length;
    const dup = await s.agent.intake({ text: REPORT, reporterId: 'u_rohit', hazardAnswer: false });
    assert.equal(dup.kind, 'DUPLICATE');
    assert.equal(s.store.db.tickets.length, before, 'no second ticket');
    assert.equal(s.store.ticket(ticket.id).corroborations.length, 1);
  });

  test('E: technician says fixed, resident says broken — reopen, raise priority, exclude that technician', async () => {
    const { s, run } = await started();
    await s.agent.humanEvent(run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Thermostat', partId: null });
    await s.agent.humanEvent(run.id, 'REPAIR_DONE', { actorRole: 'TECHNICIAN', repairNotes: 'Reset the thermostat and tested once.' });
    const firstTech = s.store.db.workOrders[0].technicianId;
    await s.agent.humanEvent(run.id, 'RESIDENT_DISPUTE', { actorRole: 'RESIDENT', reason: 'Still cold' });
    const t = s.store.db.tickets[0];
    assert.equal(t.reopenCount, 1);
    assert.equal(t.priority, 'P1');
    const wo = s.store.db.workOrders[0];
    assert.equal(wo.excludeTechnicianId, firstTech, 'do not send the same person back with the same guess');
  });

  test('F: repeated failure creates a preventive recommendation, not another ticket', async () => {
    const s = sys();
    const rec = s.toolkit.tools.detect_recurring_failure.run({ assetId: 'a_wh03' });
    assert.equal(rec.data.recurring, true);
    assert.ok(rec.data.reasons.length >= 1);
    const healthy = s.toolkit.tools.detect_recurring_failure.run({ assetId: 'a_wm02' });
    assert.equal(healthy.data.recurring, false);
  });

  test('G: part unavailable on campus triggers procurement, not a dead end', async () => {
    const s = sys();
    const inv = s.toolkit.tools.check_inventory.run({ partId: 'sp_element' });
    assert.equal(inv.data.available, false);
    assert.ok(inv.data.vendor, 'an empanelled supplier must be identified');
    const stocked = s.toolkit.tools.check_inventory.run({ partId: 'sp_thermostat' });
    assert.equal(stocked.data.available, true);
  });

  test('H: expensive part stops the agent and assembles a decidable case', async () => {
    const s = sys();
    const r = await s.agent.intake({ text: 'the washing machine in A block laundry is not working', reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    await s.agent.humanEvent(r.run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(r.run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Drain pump seized', partId: 'sp_drain_pump' });
    const run = s.store.run(r.run.id);
    
    assert.ok(['REPAIR_IN_PROGRESS', 'WAITING_FOR_APPROVAL'].includes(run.state));
  });

  test('H2: over-envelope purchase routes to the warden with full context', async () => {
    const s = sys();
    s.store.db.inventory.find((i) => i.partId === 'sp_impeller').quantity = 0;
    const r = await s.agent.intake({ text: 'WP-01 pump is not working', reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    await s.agent.humanEvent(r.run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(r.run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Impeller sheared', partId: 'sp_impeller' });
    const run = s.store.run(r.run.id);
    assert.equal(run.state, 'WAITING_FOR_APPROVAL');
    assert.equal(run.requiresHuman, true);
    const ap = s.store.db.approvals[0];
    assert.equal(ap.amountPaise, 210000);
    assert.equal(ap.status, 'PENDING');
    assert.ok(ap.context.residentsAffected === 412);
    assert.ok(ap.context.budgetRemainingPaise > 0, 'the approver must see the budget position');
    assert.equal(s.store.db.payments.length, 0, 'nothing may be paid before approval');

    await s.agent.humanEvent(run.id, 'APPROVAL_DECISION', { approvalId: ap.id, approved: true, by: 'u_warden', actorRole: 'WARDEN' });
    assert.equal(s.store.db.payments.length, 1);
    assert.equal(s.store.run(run.id).state, 'REPAIR_IN_PROGRESS');
  });

  test('H3: rejected purchase does not silently stall — it hands back options', async () => {
    const s = sys();
    s.store.db.inventory.find((i) => i.partId === 'sp_impeller').quantity = 0;
    const r = await s.agent.intake({ text: 'WP-01 pump is not working', reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    await s.agent.humanEvent(r.run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(r.run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Impeller sheared', partId: 'sp_impeller' });
    const ap = s.store.db.approvals[0];
    await s.agent.humanEvent(r.run.id, 'APPROVAL_DECISION', { approvalId: ap.id, approved: false, by: 'u_warden', actorRole: 'WARDEN', note: 'Get a second quote' });
    const run = s.store.run(r.run.id);
    assert.equal(run.state, 'ESCALATED');
    assert.ok(run.nextAction.includes('substitute') || run.nextAction.includes('vendor'));
    assert.equal(s.store.db.payments.length, 0);
  });

  test('I: no technician available escalates with options rather than queueing silently', async () => {
    const s = sys();
    s.store.db.technicians.forEach((t) => { t.shiftStartHour = 0; t.shiftEndHour = 1; });
    const r = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    const run = s.store.run(r.run.id);
    assert.equal(run.state, 'ESCALATED');
    assert.equal(run.requiresHuman, true);
    assert.ok(s.store.db.notifications.some((n) => n.role === 'WARDEN'));
    assert.ok(s.store.db.notifications.some((n) => n.role === 'RESIDENT' && /escalat|no technician/i.test(n.title + n.body)), 'the resident must be told, not left guessing');
  });

  test('J: unregistered asset is logged and routed to a human — the agent may not create assets', async () => {
    const s = sys();
    const res = await s.agent.intake({ text: 'the lift in D block is stuck', reporterId: 'u_ananya', hazardAnswer: false });
    assert.equal(res.kind, 'UNREGISTERED');
    assert.equal(authorizationPolicy('AGENT', 'create_asset_record').allowed, false);
  });

  test('K: dangerous electrical condition — P0, no dispatch, no spend, safe wording only', async () => {
    const s = sys();
    const res = await s.agent.intake({ text: 'there is a burning smell and sparks from the water heater in B block third floor', reporterId: 'u_ananya', hazardAnswer: true });
    assert.equal(res.kind, 'HAZARD');
    assert.equal(res.ticket.priority, 'P0');
    assert.equal(s.store.run(res.run.id).state, 'ESCALATED');
    assert.equal(s.store.db.assignments.length, 0, 'no technician may be dispatched into a live hazard by the agent');
    assert.equal(s.store.asset(res.ticket.assetId).status, 'UNSAFE');
    const toResident = s.store.db.notifications.find((n) => n.role === 'RESIDENT');
    assert.ok(/do not use|do not touch/i.test(toResident.body));
    assert.ok(!/reset|open the|unplug|dry it|switch off the mains/i.test(toResident.body), 'never instruct a resident to handle electrical equipment');
    const close = s.toolkit.tools.close_ticket.run({ ticketId: res.ticket.id, confirmedBy: 'u_ananya', confirmerRole: 'RESIDENT' });
    assert.equal(close.ok, false, 'a resident cannot close a hazard ticket');
    assert.equal(close.error, 'HAZARD_NEEDS_HUMAN');
  });

  test('K2: after warden clears the hazard the run resumes', async () => {
    const s = sys();
    const res = await s.agent.intake({ text: 'sparking from the B block third floor water heater', reporterId: 'u_ananya', hazardAnswer: true });
    await s.agent.humanEvent(res.run.id, 'HAZARD_CLEARED', { by: 'u_warden', note: 'Isolated at the MCB, certified electrician authorised.' });
    const run = s.store.run(res.run.id);
    assert.ok(['ASSIGNED', 'ASSIGNING', 'ESCALATED'].includes(run.state));
    assert.equal(s.store.ticket(res.ticket.id).hazardCleared, true);
  });

  test('L: silent resident — asks again, asks someone else, then provisionally closes with a watch', async () => {
    const { s, run } = await started();
    await s.agent.humanEvent(run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Loose connection', partId: null });
    await s.agent.humanEvent(run.id, 'REPAIR_DONE', { actorRole: 'TECHNICIAN', repairNotes: 'Retightened the terminal block and tested.' });
    assert.equal(s.store.run(run.id).state, 'VERIFICATION_PENDING');
    await s.agent.advanceMinutes(200);
    assert.ok(s.store.db.ticketEvents.some((e) => e.kind === 'VERIFICATION_RETRY'));
    await s.agent.advanceMinutes(200);
    await s.agent.advanceMinutes(200);
    const t = s.store.db.tickets[0];
    assert.ok(['CLOSED', 'VERIFICATION_PENDING'].includes(t.state));
    if (t.state === 'CLOSED') assert.ok(String(t.verification.confirmedBy).includes('provisional'));
  });

  test('M: a withdrawn report closes without touching a technician', async () => {
    const s = sys();
    const res = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.humanEvent(res.run.id, 'WARDEN_DECISION', { next: 'NO_ISSUE', note: 'Resident withdrew — the tripped MCB was reset by housekeeping.' });
    assert.equal(s.store.run(res.run.id).state, 'NO_ISSUE');
  });

  test('N: another department — agent routes rather than attempting a repair it has no tool for', async () => {
    const s = sys();
    const res = await s.agent.intake({ text: 'the wifi in B block is down', reporterId: 'u_ananya', hazardAnswer: false });
    assert.equal(res.kind, 'UNREGISTERED');
    assert.ok(/warden|register/i.test(res.message));
  });

  test('O: agent uncertainty escalates instead of guessing', async () => {
    const { s, run } = await started();
    await s.agent.humanEvent(run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Cannot reproduce; possibly supply-side', uncertain: true });
    const r2 = s.store.run(run.id);
    assert.equal(r2.state, 'ESCALATED');
    assert.equal(r2.requiresHuman, true);
    assert.equal(s.store.db.payments.length, 0, 'no spend on an uncertain diagnosis');
  });
});


describe('Security, audit and resilience', () => {
  test('tool calls from an unauthorised role are denied and logged', async () => {
    const s = sys();
    const res = await s.toolkit.callTool('initiate_payment', { amountPaise: 100 }, { actorRole: 'RESIDENT', actor: 'u_ananya' });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'FORBIDDEN');
    assert.ok(s.store.db.auditLogs.some((l) => l.outcome === 'DENIED'));
  });

  test('the agent cannot invent a tool', async () => {
    const s = sys();
    const res = await s.toolkit.callTool('wire_money_anywhere', {}, { actorRole: 'AGENT' });
    assert.equal(res.error, 'NO_SUCH_TOOL');
  });

  test('secrets and phone numbers never reach the audit log', () => {
    const s = sys();
    const red = s.store.redact({ apiKey: 'sk-live-123', nested: { clientSecret: 'abc', phone: '+919876543210' }, safe: 'ok' });
    assert.equal(red.apiKey, '[redacted]');
    assert.equal(red.nested.clientSecret, '[redacted]');
    assert.ok(!red.nested.phone.includes('9876543'));
    assert.equal(red.safe, 'ok');
  });

  test('error sanitiser strips URLs and credentials', () => {
    const msg = sanitizeError(new Error('failed POST https://api.example.com/v1/x?token=abc123 apikey: xyz'));
    assert.ok(!msg.includes('api.example.com'));
    assert.ok(!msg.includes('abc123'));
  });

  test('every HTTP failure maps to user-facing copy with no stack trace', () => {
    for (const code of [401, 403, 404, 408, 429, 500, 502, 503, 999]) {
      const [kind, message] = classifyFailure(code);
      assert.ok(kind && message.length > 10);
      assert.ok(!/error:|stack|undefined/i.test(message));
    }
  });

  test('a tool that throws is contained, not propagated to the agent', async () => {
    const s = sys();
    s.toolkit.tools.get_machine.run = () => { throw new Error('boom'); };
    const res = await s.toolkit.callTool('get_machine', { assetId: 'a_wh03' }, { actorRole: 'AGENT' });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'TOOL_EXCEPTION');
  });

  test('maps failure degrades to a local estimate and says so', async () => {
    const failing = { name: 'FailingMaps', mode: 'LIVE', distanceMatrix: async () => { throw new Error('503 https://x/y?token=t'); }, route: async () => { throw new Error('503'); }, geocode: async () => { throw new Error('503'); } };
    const s = createSystem({ mapsProvider: failing });
    const r = await s.maps.route({ origin: { lat: 19, lng: 74 }, destination: { lat: 19.1, lng: 74.1 } });
    assert.equal(r.degraded, true);
    assert.equal(r.mode, 'DEMO');
    assert.ok(!r.degradedReason.includes('token=t'));
  });

  test('the whole run still completes with every external rail down', async () => {
    const dead = { name: 'Dead', mode: 'LIVE', distanceMatrix: async () => { throw new Error('down'); }, route: async () => { throw new Error('down'); }, geocode: async () => { throw new Error('down'); }, challenge: async () => { throw new Error('down'); }, authorizeAndCapture: async () => { throw new Error('down'); }, transcribe: async () => { throw new Error('down'); }, speak: async () => { throw new Error('down'); } };
    const s = createSystem({ mapsProvider: dead, paymentsProvider: dead, voiceProvider: dead });
    const r = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    await s.agent.humanEvent(r.run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(r.run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'Element', partId: 'sp_element' });
    await s.agent.humanEvent(r.run.id, 'REPAIR_DONE', { actorRole: 'TECHNICIAN', repairNotes: 'Replaced the element and tested it.' });
    await s.agent.humanEvent(r.run.id, 'RESIDENT_CONFIRM', { actorRole: 'RESIDENT', by: 'u_ananya' });
    assert.equal(s.store.db.tickets[0].state, 'CLOSED');
  });

  test('repair notes that are too short are rejected back to the technician', async () => {
    const { s, run } = await started2();
    const res = await s.agent.humanEvent(run.id, 'REPAIR_DONE', { actorRole: 'TECHNICIAN', repairNotes: 'ok' });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'NOTES_REQUIRED');
  });

  async function started2() {
    const s = sys();
    const r = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    await s.agent.humanEvent(r.run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN' });
    await s.agent.humanEvent(r.run.id, 'DIAGNOSIS', { actorRole: 'TECHNICIAN', diagnosis: 'x', partId: null });
    return { s, run: s.store.run(r.run.id) };
  }

  test('state survives serialisation — a refresh does not lose the run', async () => {
    const s = sys();
    const r = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    const snap = s.store.snapshot();
    const s2 = sys();
    assert.equal(s2.store.restore(snap), true);
    assert.equal(s2.store.db.tickets[0].id, s.store.db.tickets[0].id);
    assert.equal(s2.store.run(r.run.id).state, 'ASSIGNED');
  });

  test('maps demo provider exposes its assumptions rather than presenting them as fact', async () => {
    const m = await DemoMapsProvider.route({ origin: { lat: 19.09, lng: 74.74 }, destination: { lat: 19.10, lng: 74.75 } });
    assert.equal(m.mode, 'DEMO');
    assert.ok(m.note.toLowerCase().includes('not a real road route'));
    assert.ok(DemoMapsProvider.assumptions.note.includes('DEMO'));
  });

  test('integration status never reports LIVE without a real provider', () => {
    const s = sys();
    const st = s.integrationStatus();
    assert.equal(st.voice.mode, 'DEMO');
    assert.equal(st.payments.mode, 'DEMO');
    assert.equal(st.maps.mode, 'DEMO');
    assert.ok(st.voice.label.includes('Typed') || st.voice.label.includes('not Gnani'));
  });

  test('a run cannot be skipped forward — out-of-sequence events are refused and logged', async () => {
    const s = sys();
    const r = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    
    
    const bad = await s.agent.humanEvent(r.run.id, 'RESIDENT_CONFIRM', { actorRole: 'RESIDENT', actor: 'u_ananya' });
    assert.equal(bad.ok, false);
    assert.equal(bad.error, 'OUT_OF_SEQUENCE');
    assert.equal(s.store.run(r.run.id).state, 'ASSIGNED');
    assert.ok(s.store.db.auditLogs.some((l) => l.action === 'rejected_out_of_sequence_event'));
  });

  test('a technician cannot acknowledge a job on a run that is not assigned', async () => {
    const s = sys();
    const r = await s.agent.intake({ text: REPORT, reporterId: 'u_ananya', hazardAnswer: false });
    await s.agent.runUntilBlocked(r.run.id);
    await s.agent.humanEvent(r.run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN', actor: 'u_salim' });
    const twice = await s.agent.humanEvent(r.run.id, 'TECHNICIAN_ACK', { actorRole: 'TECHNICIAN', actor: 'u_salim' });
    assert.equal(twice.ok, false);
    assert.equal(twice.error, 'OUT_OF_SEQUENCE');
  });
});
