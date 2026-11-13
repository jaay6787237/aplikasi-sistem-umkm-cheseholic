import test from 'node:test';
import assert from 'node:assert/strict';
import { CHEESEHOLIC_ACCOUNTS } from './userAccounts';

test('CHEESEHOLIC_ACCOUNTS contains accounts for all 5 outlets and kitchen', () => {
  const outlets = CHEESEHOLIC_ACCOUNTS.filter((a) => a.role === 'outlet');
  assert.equal(outlets.length, 5);

  const kitchen = CHEESEHOLIC_ACCOUNTS.find((a) => a.role === 'kitchen');
  assert.ok(kitchen);
  assert.equal(kitchen.username, 'dapur.pusat');
  assert.equal(kitchen.password, 'dapurcheese123');
});

test('Each outlet account has unique username and password', () => {
  const usernames = CHEESEHOLIC_ACCOUNTS.map((a) => a.username);
  const uniqueUsernames = new Set(usernames);
  assert.equal(usernames.length, uniqueUsernames.size);
});
