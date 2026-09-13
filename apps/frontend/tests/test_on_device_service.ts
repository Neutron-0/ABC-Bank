import assert from 'node:assert';
import { OnDeviceIntentService } from '../src/services/onDeviceIntentService.ts';

console.log('--- Testing OnDeviceIntentService.matchObviousRoute ---');

const bMatch = OnDeviceIntentService.matchObviousRoute('Please check my balance');
assert.ok(bMatch, 'Balance query should match');
assert.strictEqual(bMatch.intent, 'CHECK_BALANCE');
assert.strictEqual(bMatch.tab, 'home');
console.log('✔ matchObviousRoute("Please check my balance") -> CHECK_BALANCE, home');

const pMatch = OnDeviceIntentService.matchObviousRoute('send money to someone');
assert.ok(pMatch, 'Send money should match');
assert.strictEqual(pMatch.intent, 'SEND_MONEY');
assert.strictEqual(pMatch.tab, 'payments');
console.log('✔ matchObviousRoute("send money") -> SEND_MONEY, payments');

const cMatch = OnDeviceIntentService.matchObviousRoute('lock card immediately');
assert.ok(cMatch, 'Lock card should match');
assert.strictEqual(cMatch.intent, 'LOCK_CARD');
assert.strictEqual(cMatch.tab, 'profile');
assert.strictEqual(cMatch.journeyId, 'card_controls');
console.log('✔ matchObviousRoute("lock card") -> LOCK_CARD, profile, card_controls');

const eMatch = OnDeviceIntentService.matchObviousRoute('what is my upcoming emi');
assert.ok(eMatch, 'EMI check should match');
assert.strictEqual(eMatch.intent, 'CHECK_EMI');
assert.strictEqual(eMatch.tab, 'home');
assert.strictEqual(eMatch.journeyId, 'emi_details');
console.log('✔ matchObviousRoute("upcoming emi") -> CHECK_EMI, home, emi_details');

const mMatch = OnDeviceIntentService.matchObviousRoute('recharge metro card');
assert.ok(mMatch, 'Metro should match');
assert.strictEqual(mMatch.intent, 'PAY_METRO');
assert.strictEqual(mMatch.tab, 'payments');
assert.strictEqual(mMatch.journeyId, 'metro_recharge');
console.log('✔ matchObviousRoute("recharge metro") -> PAY_METRO, payments, metro_recharge');

const elMatch = OnDeviceIntentService.matchObviousRoute('electricity bill payment');
assert.ok(elMatch, 'Bill should match');
assert.strictEqual(elMatch.intent, 'PAY_BILL');
assert.strictEqual(elMatch.tab, 'payments');
assert.strictEqual(elMatch.journeyId, 'bill_pay');
console.log('✔ matchObviousRoute("electricity bill") -> PAY_BILL, payments, bill_pay');

const medMatch = OnDeviceIntentService.matchObviousRoute('hospital insurance claim help');
assert.ok(medMatch, 'Medical claim should match');
assert.strictEqual(medMatch.intent, 'MEDICAL_CLAIM_HELP');
assert.strictEqual(medMatch.tab, 'insights');
assert.strictEqual(medMatch.journeyId, 'medical_claim');
console.log('✔ matchObviousRoute("hospital insurance claim") -> MEDICAL_CLAIM_HELP, insights, medical_claim');

console.log('\n--- Testing OnDeviceIntentService.classifyIntent on Indian Hinglish & English ---');
const c1 = OnDeviceIntentService.classifyIntent('Please check my balance');
console.log('Result for "Please check my balance":', c1.intent, c1.confidence);
assert.strictEqual(c1.intent, 'CHECK_BALANCE');

const c2 = OnDeviceIntentService.classifyIntent('metro recharge ₹40');
console.log('Result for "metro recharge ₹40":', c2.intent, c2.entities);
assert.strictEqual(c2.intent, 'PAY_METRO');
assert.strictEqual(c2.entities.amount, 40);

console.log('\nAll OnDeviceIntentService tests passed successfully!');
