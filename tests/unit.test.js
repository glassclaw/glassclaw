'use strict';

/**
 * Unit tests for glassclaw.js — encryption, config, key storage, validation.
 *
 * Run from the skill root:
 *   cd skills/glassclaw
 *   npm test
 */

const { xchacha20poly1305 } = require('@noble/ciphers/chacha.js');
const { randomBytes }        = require('@noble/ciphers/utils.js');
const os   = require('os');
const fs   = require('fs');
const path = require('path');

const tool = require('../tools/glassclaw.js');
const {
    _setConfigDir,
    loadConfig, saveConfig, configGet, configSet,
    loadKey, saveKey, loadGroupKey, saveGroupKey, deleteGroupKey,
    encrypt, decrypt, _decryptResponse,
    validatePayload, _payloadHasForm,
} = tool._internals;

// Redirect config to a temp directory so tests never touch ~/.glassclaw.
const TEST_CONFIG_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'glassclaw-test-'));
_setConfigDir(TEST_CONFIG_DIR);
process.on('exit', () => { fs.rmSync(TEST_CONFIG_DIR, { recursive: true, force: true }); });

// ── Test helpers ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, msg) {
    if (condition) { passed++; console.log(`  ✓ ${msg}`); }
    else { failed++; console.error(`  ✗ ${msg}`); }
}

function assertEqual(actual, expected, msg) {
    if (actual === expected) { passed++; console.log(`  ✓ ${msg}`); }
    else { failed++; console.error(`  ✗ ${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

function assertThrows(fn, msg) {
    let threw = false;
    try { fn(); } catch { threw = true; }
    assert(threw, msg);
}

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return bytes;
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Browser-side encrypt/decrypt for cross-compat testing.
function browserEncrypt(plaintext, keyHex) {
    const key = hexToBytes(keyHex);
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(key, nonce);
    const ct = cipher.encrypt(new Uint8Array(Buffer.from(plaintext, 'utf8')));
    const out = new Uint8Array(nonce.length + ct.length);
    out.set(nonce);
    out.set(ct, nonce.length);
    return Buffer.from(out).toString('base64');
}

function browserDecrypt(encryptedBase64, keyHex) {
    const encrypted = new Uint8Array(Buffer.from(encryptedBase64, 'base64'));
    const nonce = encrypted.slice(0, 24);
    const ciphertext = encrypted.slice(24);
    const cipher = xchacha20poly1305(hexToBytes(keyHex), nonce);
    return Buffer.from(cipher.decrypt(ciphertext)).toString('utf8');
}

// ── Tests ───────────────────────────────────────────────────────────────────

console.log('\n=== Encryption roundtrip ===');
{
    const keyHex = bytesToHex(randomBytes(32));
    const plaintext = '{"version":"v0.9","createSurface":{"surfaceId":"test"}}';
    assertEqual(decrypt(encrypt(plaintext, keyHex), keyHex), plaintext, 'encrypt → decrypt roundtrip');
}

console.log('\n=== Cross-compatibility ===');
{
    const keyHex = bytesToHex(randomBytes(32));
    const plaintext = 'Hello from the skill tool!';
    assertEqual(browserDecrypt(encrypt(plaintext, keyHex), keyHex), plaintext, 'tool encrypt → browser decrypt');
    assertEqual(decrypt(browserEncrypt(plaintext, keyHex), keyHex), plaintext, 'browser encrypt → tool decrypt');
}

console.log('\n=== Wire format ===');
{
    const keyHex = bytesToHex(randomBytes(32));
    const plaintext = 'test payload';
    const encrypted = encrypt(plaintext, keyHex);
    const raw = Buffer.from(encrypted, 'base64');
    assert(raw.length > 24, 'ciphertext longer than nonce');
    assertEqual(raw.length, 24 + plaintext.length + 16, 'nonce(24) + plaintext + tag(16)');
}

console.log('\n=== Unicode / multi-byte ===');
{
    const keyHex = bytesToHex(randomBytes(32));
    const plaintext = '{"name":"日本語テスト","emoji":"🎉","desc":"Ñoño"}';
    assertEqual(decrypt(encrypt(plaintext, keyHex), keyHex), plaintext, 'unicode roundtrip');
    assertEqual(browserDecrypt(encrypt(plaintext, keyHex), keyHex), plaintext, 'unicode cross-compat');
}

console.log('\n=== Wrong key fails ===');
{
    const k1 = bytesToHex(randomBytes(32));
    const k2 = bytesToHex(randomBytes(32));
    assertThrows(() => decrypt(encrypt('secret', k1), k2), 'decrypt with wrong key throws');
}

console.log('\n=== Large payload (60KB) ===');
{
    const keyHex = bytesToHex(randomBytes(32));
    const plaintext = 'x'.repeat(60000);
    assertEqual(decrypt(encrypt(plaintext, keyHex), keyHex).length, 60000, 'large payload roundtrip');
}

console.log('\n=== _decryptResponse helper ===');
{
    const keyHex = bytesToHex(randomBytes(32));
    const plaintext = '{"event":"submit","data_model":{"name":"Alice"}}';
    const encrypted = encrypt(plaintext, keyHex);

    // Save a user key and test decryption via the helper.
    saveKey('test-user-999', keyHex);
    assertEqual(_decryptResponse(encrypted, null, 'test-user-999', false), plaintext, 'decrypts with user key');

    // Save a group key and test.
    saveGroupKey('test-surface-999', keyHex);
    assertEqual(_decryptResponse(encrypted, 'test-surface-999', null, true), plaintext, 'decrypts with group key');

    // Missing key throws.
    assertThrows(() => _decryptResponse(encrypted, null, 'nonexistent-user', false), 'throws on missing user key');
    assertThrows(() => _decryptResponse(encrypted, 'nonexistent-surface', null, true), 'throws on missing group key');
}

console.log('\n=== Config: get/set ===');
{
    // Save original config to restore later.
    const originalConfig = loadConfig();

    configSet('_test.nested.value', 'hello');
    assertEqual(configGet('_test.nested.value'), 'hello', 'configSet + configGet nested path');

    configSet('_test.simple', 42);
    assertEqual(configGet('_test.simple'), 42, 'configSet number value');

    assertEqual(configGet('_test.nonexistent'), undefined, 'configGet missing key returns undefined');

    // Clean up test keys.
    const cfg = loadConfig();
    delete cfg._test;
    saveConfig(cfg);

    // Restore original config.
    saveConfig(originalConfig);
}

console.log('\n=== Key storage (config-based) ===');
{
    const originalConfig = loadConfig();

    const testKey = bytesToHex(randomBytes(32));
    saveKey('test-ks-user', testKey);
    assertEqual(loadKey('test-ks-user'), testKey, 'saveKey + loadKey roundtrip');
    assertEqual(loadKey('nonexistent-ks-user'), null, 'loadKey missing returns null');

    const groupKey = bytesToHex(randomBytes(32));
    saveGroupKey('test-ks-surface', groupKey);
    assertEqual(loadGroupKey('test-ks-surface'), groupKey, 'saveGroupKey + loadGroupKey roundtrip');
    assertEqual(loadGroupKey('nonexistent-ks-surface'), null, 'loadGroupKey missing returns null');

    deleteGroupKey('test-ks-surface');
    assertEqual(loadGroupKey('test-ks-surface'), null, 'deleteGroupKey removes key');

    saveConfig(originalConfig);
}

console.log('\n=== Validation: valid payload ===');
{
    const valid = '{"version":"v0.9","createSurface":{"surfaceId":"test"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"test","components":[{"id":"root","component":"Column","children":["hdr"]},{"id":"hdr","component":"GlassHeader","title":"Hello"}]}}';
    let threw = false;
    try { validatePayload(valid); } catch { threw = true; }
    assert(!threw, 'valid payload passes validation');
}

console.log('\n=== Validation: missing createSurface ===');
{
    const bad = '{"version":"v0.9","updateComponents":{"components":[]}}';
    assertThrows(() => validatePayload(bad), 'rejects missing createSurface');
}

console.log('\n=== Validation: missing component id ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"component":"Text","text":"hi"}]}}';
    assertThrows(() => validatePayload(bad), 'rejects component without id');
}

console.log('\n=== Validation: unknown component ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"id":"x","component":"FakeWidget"}]}}';
    assertThrows(() => validatePayload(bad), 'rejects unknown component');
}

console.log('\n=== Validation: nested children ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"id":"root","component":"Column","children":[{"id":"nested","component":"Text"}]}]}}';
    assertThrows(() => validatePayload(bad), 'rejects nested children objects');
}

console.log('\n=== Validation: component ID collides with property value ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"id":"root","component":"Column","children":["body"]},{"id":"body","component":"Text","text":"hi","variant":"body"}]}}';
    assertThrows(() => validatePayload(bad), 'rejects ID/property collision (body)');
}

console.log('\n=== Catalog validation: unknown property ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"id":"nav","component":"GlassNavigator","targetSurfaceId":"page-2","child":"row"}]}}';
    assertThrows(() => validatePayload(bad), 'rejects unknown property (targetSurfaceId)');
}

console.log('\n=== Catalog validation: missing required property ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"id":"root","component":"Column"}]}}';
    assertThrows(() => validatePayload(bad), 'rejects missing required property (children on Column)');
}

console.log('\n=== Catalog validation: literalString wrapper ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"id":"hdr","component":"GlassHeader","title":{"literalString":"Hello"}}]}}';
    assertThrows(() => validatePayload(bad), 'rejects literalString wrapper');
}

console.log('\n=== Catalog validation: valid complex payload ===');
{
    // This payload uses premium components, so set tier to pro for validation.
    configSet('tier', 'pro');
    const valid = [
        '{"version":"v0.9","createSurface":{"surfaceId":"demo"}}',
        '{"version":"v0.9","updateDataModel":{"surfaceId":"demo","path":"/","value":{"inp-name":""}}}',
        '{"version":"v0.9","updateComponents":{"surfaceId":"demo","components":[' +
            '{"id":"root","component":"Column","children":["hdr","nav-item","inp","btn"]},' +
            '{"id":"hdr","component":"GlassHeader","title":"Demo","subtitle":"Test"},' +
            '{"id":"nav-item","component":"GlassNavigator","child":"list-row","action":{"functionCall":{"call":"navigateTo","args":{"surfaceId":"detail"}}}},' +
            '{"id":"list-row","component":"GlassListItem","primary":"Item","secondary":"Details","icon":"star"},' +
            '{"id":"inp","component":"GlassInput","label":"Name","value":{"path":"/inp-name"}},' +
            '{"id":"btn","component":"GlassButton","variant":"filled","children":["btn-label"],"action":{"name":"do_submit"}},' +
            '{"id":"btn-label","component":"Text","text":"Submit"}' +
        ']}}'
    ].join('\n');
    let threw = false;
    try { validatePayload(valid); } catch { threw = true; }
    assert(!threw, 'complex valid payload passes all catalog checks');
    configSet('tier', 'free'); // reset
}

console.log('\n=== Tier gating: free tier rejects premium components ===');
{
    configSet('tier', 'free');
    const payload = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n' +
        '{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[' +
        '{"id":"root","component":"Column","children":["s"]},' +
        '{"id":"s","component":"GlassStat","value":"42","label":"Users"}' +
        ']}}';
    assertThrows(() => validatePayload(payload), 'rejects premium component on free tier');
}

console.log('\n=== Tier gating: pro tier allows premium components ===');
{
    configSet('tier', 'pro');
    const payload = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n' +
        '{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[' +
        '{"id":"root","component":"Column","children":["s"]},' +
        '{"id":"s","component":"GlassStat","value":"42","label":"Users"}' +
        ']}}';
    let threw = false;
    try { validatePayload(payload); } catch { threw = true; }
    assert(!threw, 'allows premium component on pro tier');
    configSet('tier', 'free'); // reset
}

console.log('\n=== Catalog validation: type mismatch ===');
{
    const bad = '{"version":"v0.9","createSurface":{"surfaceId":"t"}}\n{"version":"v0.9","updateComponents":{"surfaceId":"t","components":[{"id":"g","component":"GlassGauge","value":"not-a-number","label":"CPU"}]}}';
    assertThrows(() => validatePayload(bad), 'rejects string where number expected (GlassGauge value)');
}

console.log('\n=== _payloadHasForm ===');
{
    const withForm = '{"version":"v0.9","updateComponents":{"components":[{"id":"btn","component":"GlassButton","action":{"name":"submit"}}]}}';
    const withoutForm = '{"version":"v0.9","updateComponents":{"components":[{"id":"btn","component":"GlassButton","action":{"functionCall":{"call":"navigateTo"}}}]}}';
    const noButton = '{"version":"v0.9","updateComponents":{"components":[{"id":"hdr","component":"GlassHeader","title":"Hi"}]}}';

    assert(_payloadHasForm(withForm), 'detects form with action name');
    assert(!_payloadHasForm(withoutForm), 'ignores navigation buttons');
    assert(!_payloadHasForm(noButton), 'returns false when no button');
}

console.log('\n=== Module exports ===');
{
    assert(typeof tool.setup === 'function', 'exports setup');
    assert(typeof tool.create_card === 'function', 'exports create_card');
    assert(typeof tool.update_card === 'function', 'exports update_card');
    assert(typeof tool.delete_card === 'function', 'exports delete_card');
    assert(typeof tool.poll_response === 'function', 'exports poll_response');
    assert(typeof tool.get_account === 'function', 'exports get_account');
    assert(typeof tool._internals === 'object', 'exports _internals for testing');
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
