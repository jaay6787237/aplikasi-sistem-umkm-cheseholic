import test from 'node:test';
import assert from 'node:assert/strict';
import { DOMISILI_AREAS, findNearestOutletForArea } from './domisiliAreas';

test('DOMISILI_AREAS maps all 5 major Bandar Lampung regions', () => {
  assert.equal(DOMISILI_AREAS.length, 5);
  const outletIds = DOMISILI_AREAS.map((a) => a.nearestOutletId);
  assert.ok(outletIds.includes('kedaton'));
  assert.ok(outletIds.includes('pahoman'));
  assert.ok(outletIds.includes('uin'));
  assert.ok(outletIds.includes('korpri'));
  assert.ok(outletIds.includes('navara'));
});

test('findNearestOutletForArea returns correct recommendation for Kedaton', () => {
  const area = findNearestOutletForArea('area-kedaton');
  assert.ok(area);
  assert.equal(area.nearestOutletId, 'kedaton');
});
