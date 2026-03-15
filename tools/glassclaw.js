'use strict';

/**
 * glassclaw.js — OpenClaw skill tool for Glass Claw.
 *
 * Exposes six tools that agents can call to interact with the Glass Claw
 * encrypted card hosting service:
 *
 *   setup          — one-time key exchange for a private chat
 *   create_card    — encrypt + store a surface, send mini-app button
 *   update_card    — encrypt + update an existing surface
 *   delete_card    — delete a surface
 *   poll_response  — long-poll for an encrypted form response
 *   get_account    — fetch account tier / limits
 *
 * Dependencies: @noble/ciphers (encryption only). All network calls use
 * the built-in fetch() available in Node 18+.
 */

const fs   = require('fs');
const path = require('path');
const { xchacha20poly1305 } = require('@noble/ciphers/chacha.js');
const { randomBytes }        = require('@noble/ciphers/utils.js');

const SKILL_VERSION = 1;

// ── Configuration ─────────────────────────────────────────────────────────────
// All config lives in ~/.glassclaw/glassclaw.json.
// No environment variables — everything is read from this file.

const homedir = require('os').homedir();
let CONFIG_DIR = path.join(homedir, '.glassclaw');
let CONFIG_FILE = path.join(CONFIG_DIR, 'glassclaw.json');
let LOGS_DIR = path.join(CONFIG_DIR, 'logs');

function _setConfigDir(dir) {
    CONFIG_DIR = dir;
    CONFIG_FILE = path.join(dir, 'glassclaw.json');
    LOGS_DIR = path.join(dir, 'logs');
}

function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
}

function ensureLogsDir() {
    if (!fs.existsSync(LOGS_DIR)) {
        fs.mkdirSync(LOGS_DIR, { recursive: true, mode: 0o700 });
    }
}

function loadConfig() {
    ensureConfigDir();
    if (!fs.existsSync(CONFIG_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveConfig(config) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
}

/**
 * Get a config value by dotted path (e.g. "telegram.botToken").
 */
function configGet(key) {
    const config = loadConfig();
    const parts = key.split('.');
    let val = config;
    for (const p of parts) {
        if (val == null || typeof val !== 'object') return undefined;
        val = val[p];
    }
    return val;
}

/**
 * Set a config value by dotted path (e.g. "telegram.botToken", "some-value").
 */
function configSet(key, value) {
    const config = loadConfig();
    const parts = key.split('.');
    let obj = config;
    for (let i = 0; i < parts.length - 1; i++) {
        if (obj[parts[i]] == null || typeof obj[parts[i]] !== 'object') {
            obj[parts[i]] = {};
        }
        obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    saveConfig(config);
}

/**
 * Resolve the Telegram bot token from config.
 * Priority: telegram.botToken > telegram.source file > default ~/.openclaw/openclaw.json
 */
function resolveBotToken() {
    const config = loadConfig();

    // 1. Explicit bot token in config.
    if (config.telegram?.botToken) return config.telegram.botToken;

    // 2. Source file specified in config.
    if (config.telegram?.source) {
        const token = _readTokenFromFile(config.telegram.source);
        if (token) return token;
    }

    // 3. Default OpenClaw config location.
    const defaultPath = path.join(homedir, '.openclaw', 'openclaw.json');
    const token = _readTokenFromFile(defaultPath);
    if (token) return token;

    return null;
}

function _readTokenFromFile(filePath) {
    try {
        const resolved = filePath.startsWith('~') ? path.join(homedir, filePath.slice(1)) : filePath;
        if (!fs.existsSync(resolved)) return null;
        const data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
        return data?.telegram?.botToken
            || data?.env?.TELEGRAM_BOT_TOKEN
            || data?.skills?.entries?.glassclaw?.env?.TELEGRAM_BOT_TOKEN
            || null;
    } catch {
        return null;
    }
}

// Resolve config values.
const config = loadConfig();
const API_KEY   = config.apiKey || null;
const BOT_TOKEN = resolveBotToken();
const BASE_URL  = (config.baseUrl || 'https://glassclaw.app').replace(/\/$/, '');

// Don't throw on missing config during CLI config commands — they need to run
// before config is set up. The check happens in the tool functions instead.
function requireConfig() {
    if (!API_KEY)   throw new Error('Glass Claw API key not configured. Run: node glassclaw.js config set apiKey <key>');
    if (!BOT_TOKEN) throw new Error('Telegram bot token not configured. Run: node glassclaw.js config set telegram.botToken <token>');
}

// ── Internal: key storage ─────────────────────────────────────────────────────
// Keys are stored in ~/.glassclaw/glassclaw.json under "keys" and "groupKeys".

function loadKey(userId) {
    const cfg = loadConfig();
    return cfg.keys?.[String(userId)] || null;
}

function saveKey(userId, keyHex) {
    const cfg = loadConfig();
    if (!cfg.keys) cfg.keys = {};
    cfg.keys[String(userId)] = keyHex;
    saveConfig(cfg);
}

function loadGroupKey(surfaceId) {
    const cfg = loadConfig();
    return cfg.groupKeys?.[surfaceId] || null;
}

function saveGroupKey(surfaceId, keyHex) {
    const cfg = loadConfig();
    if (!cfg.groupKeys) cfg.groupKeys = {};
    cfg.groupKeys[surfaceId] = keyHex;
    saveConfig(cfg);
}

function deleteGroupKey(surfaceId) {
    const cfg = loadConfig();
    if (cfg.groupKeys) {
        delete cfg.groupKeys[surfaceId];
        saveConfig(cfg);
    }
}

// ── Internal: encryption ──────────────────────────────────────────────────────

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypt plaintext with XChaCha20-Poly1305.
 * Wire format: base64( nonce(24) || ciphertext+tag )
 */
function encrypt(plaintext, keyHex) {
    const key      = hexToBytes(keyHex);
    const nonce    = randomBytes(24);
    const cipher   = xchacha20poly1305(key, nonce);
    const ct       = cipher.encrypt(Buffer.from(plaintext, 'utf8'));
    const out      = new Uint8Array(24 + ct.length);
    out.set(nonce, 0);
    out.set(ct, 24);
    return Buffer.from(out).toString('base64');
}

/**
 * Decrypt a base64-encoded XChaCha20-Poly1305 ciphertext.
 * Wire format: base64( nonce(24) || ciphertext+tag )
 */
function decrypt(ciphertextBase64, keyHex) {
    const key  = hexToBytes(keyHex);
    const raw  = Buffer.from(ciphertextBase64, 'base64');
    const nonce = raw.subarray(0, 24);
    const ct    = raw.subarray(24);
    const cipher = xchacha20poly1305(key, nonce);
    const plain  = cipher.decrypt(ct);
    return Buffer.from(plain).toString('utf8');
}

/**
 * Decrypt an encrypted response using the appropriate key (group or user).
 */
function _decryptResponse(encryptedData, surfaceId, userId, group) {
    const keyHex = group ? loadGroupKey(surfaceId) : loadKey(userId);
    if (!keyHex) {
        throw new Error(group
            ? `No group key found for surface ${surfaceId}.`
            : `No key found for user ${userId}. Run setup first.`);
    }
    return decrypt(encryptedData, keyHex);
}

// ── Catalog-based validation (Ajv) ───────────────────────────────────────────
// Load catalogs and derive premium component set.
const Ajv = require('ajv');
const CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalogs', 'glassclaw-pro.json'), 'utf8'));
const FREE_CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalogs', 'glassclaw-free.json'), 'utf8'));
const CATALOG_COMPONENTS = CATALOG.components || {};
const FREE_COMPONENTS = new Set(Object.keys(FREE_CATALOG.components || {}));
const PREMIUM_COMPONENTS = new Set(
    Object.keys(CATALOG_COMPONENTS).filter(c => !FREE_COMPONENTS.has(c))
);

// Build per-component Ajv validators.
// We inject additionalProperties: false recursively so unknown props are rejected
// at every level (component-level AND nested item objects like timeline items).
function _addAdditionalPropertiesFalse(schema) {
    if (schema.type === 'object' && schema.properties && !('additionalProperties' in schema)) {
        schema.additionalProperties = false;
    }
    if (schema.properties) {
        for (const prop of Object.values(schema.properties)) {
            _addAdditionalPropertiesFalse(prop);
            // Handle array items that are objects.
            if (prop.items && typeof prop.items === 'object') {
                _addAdditionalPropertiesFalse(prop.items);
            }
        }
    }
}

// Allow data binding objects {path: "/..."} wherever a simple string or number is expected.
// Skip properties that already use oneOf (they handle data binding in the catalog).
function _allowDataBinding(schema) {
    if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
            if (prop.oneOf) continue; // already has alternatives defined
            if (prop.type === 'string' || prop.type === 'number') {
                const binding = { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false };
                const alternatives = [{ ...prop }, binding];
                // Also allow numbers for string fields (they get auto-converted).
                if (prop.type === 'string') alternatives.splice(1, 0, { type: 'number' });
                schema.properties[key] = { oneOf: alternatives, description: prop.description };
            }
        }
    }
}

const ajv = new Ajv({ allErrors: true, strict: false });
const _validators = {};

for (const [compName, schema] of Object.entries(CATALOG_COMPONENTS)) {
    // Clone to avoid mutating the original catalog.
    const s = JSON.parse(JSON.stringify(schema));

    // Add standard component fields that aren't in the catalog.
    s.properties = s.properties || {};
    s.properties.id = { type: 'string' };
    s.properties.component = { type: 'string' };

    // Allow data binding {path: "/..."} for string/number props.
    _allowDataBinding(s);

    // Inject additionalProperties: false at every object level.
    _addAdditionalPropertiesFalse(s);

    _validators[compName] = ajv.compile(s);
}

/**
 * Validate a single component against the catalog schema using Ajv.
 * Returns an array of error strings (empty if valid).
 */
function _validateComponent(comp, lineNum) {
    const errors = [];
    const compName = comp.component || comp.type;
    if (!compName) return errors;

    const validate = _validators[compName];
    if (!validate) {
        errors.push(`Component "${comp.id || '?'}" in line ${lineNum}: unknown component "${compName}". Valid components: ${Object.keys(CATALOG_COMPONENTS).join(', ')}.`);
        return errors;
    }

    // Check for {literalString: ...} wrappers before Ajv (better error message).
    for (const [key, val] of Object.entries(comp)) {
        if (key === 'id' || key === 'component') continue;
        if (val && typeof val === 'object' && !Array.isArray(val) && 'literalString' in val) {
            errors.push(`Component "${comp.id || '?'}" property "${key}": uses {"literalString":"..."} wrapper. Use a plain string instead: "${key}": "${val.literalString}".`);
        }
    }

    if (!validate(comp)) {
        for (const err of validate.errors) {
            const propPath = err.instancePath || '';
            if (err.keyword === 'additionalProperties') {
                const validProps = err.parentSchema?.properties ? Object.keys(err.parentSchema.properties).filter(k => k !== 'id' && k !== 'component') : [];
                const hint = validProps.length > 0 ? ` Valid properties: ${validProps.join(', ')}.` : '';
                errors.push(`Component "${comp.id || '?'}" in line ${lineNum}: unknown property "${err.params.additionalProperty}" on ${compName}${propPath}.${hint}`);
            } else if (err.keyword === 'required') {
                errors.push(`Component "${comp.id || '?'}" in line ${lineNum}: missing required property "${err.params.missingProperty}" on ${compName}.`);
            } else if (err.keyword === 'enum') {
                errors.push(`Component "${comp.id || '?'}" in line ${lineNum}${propPath}: ${err.message}. Allowed values: ${err.params.allowedValues.join(', ')}.`);
            } else {
                errors.push(`Component "${comp.id || '?'}" in line ${lineNum}${propPath}: ${err.message}.`);
            }
        }
    }

    // Form input components must have a value with data binding path.
    const FORM_COMPONENTS = new Set([
        'GlassInput', 'GlassTextarea', 'GlassSelect',
        'GlassCheckbox', 'GlassSwitch', 'GlassRating', 'GlassSlider',
    ]);
    if (FORM_COMPONENTS.has(compName)) {
        const val = comp.value;
        if (!val || typeof val !== 'object' || !('path' in val)) {
            errors.push(
                `Component "${comp.id || '?'}" in line ${lineNum}: ${compName} requires a "value" property with a data binding path. ` +
                `Example: "value": {"path": "/fieldName"}. Without this, form data will not be captured on submit.`
            );
        }
    }

    return errors;
}

// ── Internal: HTTP helpers ────────────────────────────────────────────────────

/**
 * Call the Glass Claw API.
 * Returns the parsed JSON body (or null for 204).
 * Throws on non-2xx with an error containing the status code.
 */
let _upgradeNudged = false;

async function glassclaw(method, urlPath, body) {
    const url = `${BASE_URL}${urlPath}`;
    const opts = {
        method,
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type':  'application/json',
            'X-Skill-Version': String(SKILL_VERSION),
        },
    };
    if (body !== undefined) {
        opts.body = JSON.stringify(body);
    }
    let res;
    try {
        res = await fetch(url, opts);
    } catch (fetchErr) {
        throw new Error(`glassclaw ${method} ${urlPath}: ${fetchErr.cause?.message || fetchErr.message}`);
    }

    // Nudge once per session if the server says a newer skill version is available.
    if (!_upgradeNudged && res.headers.get('X-Min-Skill-Version')) {
        _upgradeNudged = true;
        console.log(`[glassclaw] A newer version of the Glass Claw skill is available. Please update from https://github.com/glassclaw/glassclaw.git`);
    }

    if (res.status === 204) return null;
    const text = await res.text();
    if (!res.ok) {
        const err = new Error(`glassclaw ${method} ${urlPath} → ${res.status}: ${text}`);
        err.status = res.status;
        throw err;
    }
    return text ? JSON.parse(text) : null;
}

/**
 * Call the Telegram Bot API.
 * Returns the parsed result field from the response.
 * Throws on error.
 */
async function telegram(method, body) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    let res;
    try {
        res = await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body),
        });
    } catch (fetchErr) {
        throw new Error(`telegram.${method}: ${fetchErr.cause?.message || fetchErr.message}`);
    }
    const data = await res.json();
    if (!data.ok) {
        throw new Error(`telegram.${method} failed: ${data.description}`);
    }
    return data.result;
}


// ── Tool: setup ───────────────────────────────────────────────────────────────

/**
 * Generate a fresh XChaCha20-Poly1305 key for this user, persist it locally,
 * and send an inline web_app button to the private chat so the user can
 * store the key in Telegram CloudStorage.
 *
 * Only valid for private chats (chatId === userId).
 *
 * @param {object} params
 * @param {number} params.chatId  — Telegram chat ID (must be the user's private chat)
 * @param {number} params.userId  — Telegram user ID
 * @returns {object} { keyHex, message: "setup link sent" }
 */
async function setup({ chatId, userId }) {
    requireConfig();
    const keyBytes = randomBytes(32);
    const keyHex   = bytesToHex(keyBytes);

    saveKey(userId, keyHex);

    const setupUrl = `${BASE_URL}/app/setup#key=${keyHex}`;

    await telegram('sendMessage', {
        chat_id:      chatId,
        text:         'Tap the button below to link this bot to Glass Claw. This only needs to happen once.',
        reply_markup: {
            inline_keyboard: [[
                { text: 'Set up Glass Claw', web_app: { url: setupUrl } },
            ]],
        },
    });

    return { keyHex, message: 'setup link sent' };
}

// ── Internal: JSONL validation ────────────────────────────────────────────────

/**
 * Validate that a payload is well-formed A2UI v0.9 JSONL.
 * Throws with a descriptive message if invalid.
 */
function validatePayload(payload) {
    if (!payload || typeof payload !== 'string') {
        throw new Error('Payload is empty or not a string.');
    }
    const lines = payload.split('\n').filter(l => l.trim());
    if (lines.length === 0) {
        throw new Error('Payload has no JSONL lines.');
    }

    let hasCreateSurface = false;
    let createSurfaceCount = 0;
    let hasUpdateComponents = false;
    const createdSurfaceIds = new Set();
    const componentSurfaceIds = new Set();
    const errors = [];

    // Collect all defined component IDs, child references, and data model keys.
    const definedIds = new Set();
    const childRefs = [];  // { ref, parentId, parentComponent }
    const dataModelKeys = new Set();
    const allStringValues = new Set();
    const usedComponents = new Set();
    let hasFormComponents = false;
    let hasDataModel = false;

    for (let i = 0; i < lines.length; i++) {
        let msg;
        try {
            msg = JSON.parse(lines[i]);
        } catch (e) {
            throw new Error(`JSONL line ${i + 1} is not valid JSON: ${e.message}\nLine: ${lines[i].substring(0, 100)}`);
        }
        if (typeof msg !== 'object' || msg === null) {
            throw new Error(`JSONL line ${i + 1} is not a JSON object.`);
        }
        if (!msg.version) {
            errors.push(`Line ${i + 1}: missing "version" field. All messages must include "version": "v0.9".`);
        }

        // Validate createSurface
        if (msg.createSurface) {
            hasCreateSurface = true;
            createSurfaceCount++;
            if (!msg.createSurface.surfaceId) {
                errors.push(`Line ${i + 1}: createSurface must have "surfaceId" (not "id"). Example: {"createSurface":{"surfaceId":"my-card"}}`);
            } else {
                createdSurfaceIds.add(msg.createSurface.surfaceId);
            }
        }

        // Collect data model keys
        if (msg.updateDataModel) {
            hasDataModel = true;
            const val = msg.updateDataModel.value;
            if (val && typeof val === 'object') {
                for (const key of Object.keys(val)) {
                    dataModelKeys.add(key);
                }
            }
        }

        // Validate updateComponents
        if (msg.updateComponents) {
            hasUpdateComponents = true;
            if (msg.updateComponents.surfaceId) {
                componentSurfaceIds.add(msg.updateComponents.surfaceId);
            }
            const comps = msg.updateComponents.components;
            if (!Array.isArray(comps)) {
                errors.push(`Line ${i + 1}: updateComponents.components must be an array.`);
                continue;
            }
            for (let j = 0; j < comps.length; j++) {
                const comp = comps[j];

                // Must have "id"
                if (!comp.id) {
                    errors.push(`Component ${j + 1} in line ${i + 1}: missing "id" field. Every component needs a unique "id".`);
                } else {
                    definedIds.add(comp.id);
                }

                // Track component names for tier gating.
                if (comp.component) usedComponents.add(comp.component);

                // Must use "component", not "type"
                if (comp.type && !comp.component) {
                    errors.push(`Component "${comp.id || j + 1}" in line ${i + 1}: uses "type" instead of "component". Use "component": "${comp.type}".`);
                } else if (!comp.component) {
                    errors.push(`Component "${comp.id || j + 1}" in line ${i + 1}: missing "component" field (e.g. "component": "GlassHeader").`);
                }

                // Validate against catalog schema.
                errors.push(..._validateComponent(comp, i + 1));

                // Track if there are form input components.
                const FORM_INPUT_NAMES = ['GlassInput', 'GlassTextarea', 'GlassSelect', 'GlassCheckbox', 'GlassSwitch', 'GlassRating', 'GlassSlider'];
                if (FORM_INPUT_NAMES.includes(comp.component)) hasFormComponents = true;

                // Children must be string IDs, not nested objects
                if (Array.isArray(comp.children)) {
                    for (let k = 0; k < comp.children.length; k++) {
                        const child = comp.children[k];
                        if (typeof child === 'object') {
                            errors.push(
                                `Component "${comp.id || j + 1}" in line ${i + 1}: children[${k}] is a nested object. ` +
                                `Children must be string IDs referencing other components. ` +
                                `Use a flat component list with "children": ["child-id-1", "child-id-2"].`
                            );
                        } else if (typeof child === 'string') {
                            childRefs.push({ ref: child, parentId: comp.id, parentComponent: comp.component || comp.type });
                        }
                    }
                }

                // Single child must be a string ID
                if (comp.child !== undefined) {
                    if (typeof comp.child === 'object') {
                        errors.push(
                            `Component "${comp.id || j + 1}" in line ${i + 1}: "child" is a nested object. ` +
                            `It must be a string ID referencing another component.`
                        );
                    } else if (typeof comp.child === 'string') {
                        childRefs.push({ ref: comp.child, parentId: comp.id, parentComponent: comp.component || comp.type });
                    }
                }

                // Collect all string property values for collision detection later.
                for (const [key, val] of Object.entries(comp)) {
                    if (key === 'id' || key === 'component' || key === 'type' || key === 'children' || key === 'child') continue;
                    if (typeof val === 'string') allStringValues.add(val);
                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                        for (const nested of Object.values(val)) {
                            if (typeof nested === 'string') allStringValues.add(nested);
                        }
                    }
                }
            }
        }
    }

    if (!hasCreateSurface) {
        errors.push('Payload is missing a createSurface message. Every card needs at least one.');
    }
    if (!hasUpdateComponents) {
        errors.push('Payload is missing an updateComponents message. Cards need components to render.');
    }
    // Check for surfaces that were created but have no components.
    for (const sid of createdSurfaceIds) {
        if (!componentSurfaceIds.has(sid)) {
            errors.push(`Surface "${sid}" has a createSurface but no updateComponents. It will render as a blank page. Add an updateComponents message for this surface.`);
        }
    }

    if (hasFormComponents && !hasDataModel) {
        errors.push('Payload has form input components but no updateDataModel message. Add an updateDataModel with initial values for each form field. Example: {"version":"v0.9","updateDataModel":{"surfaceId":"...","path":"/","value":{"fieldName":""}}}');
    }

    // Check that every child reference points to a defined component.
    for (const { ref, parentId, parentComponent } of childRefs) {
        if (!definedIds.has(ref)) {
            errors.push(`Missing component "${ref}" (referenced by ${parentComponent} "${parentId}").`);
        }
    }

    // Check for component ID / data model key collisions.
    // A2UI uses the same namespace for both, which causes circular dependency errors.
    const dmCollisions = [];
    for (const id of definedIds) {
        if (dataModelKeys.has(id)) {
            dmCollisions.push(id);
        }
    }
    if (dmCollisions.length > 0) {
        errors.push(
            `Component IDs collide with data model field names: ${dmCollisions.map(c => `"${c}"`).join(', ')}. ` +
            `This causes circular dependency errors. Use prefixed IDs like "chk-${dmCollisions[0]}" instead of "${dmCollisions[0]}".`
        );
    }

    // Check for component ID / string property value collisions.
    // A2UI resolves ANY string property value as a potential component ID reference.
    // If a string value matches a component ID, it causes circular dependency errors.
    // This catches: action names ("submit"), variant values ("body"), and any other string prop.
    const propCollisions = [];
    for (const id of definedIds) {
        if (allStringValues.has(id)) {
            propCollisions.push(id);
        }
    }
    if (propCollisions.length > 0) {
        errors.push(
            `Component IDs collide with property values: ${propCollisions.map(c => `"${c}"`).join(', ')}. ` +
            `This causes circular dependency errors. Use prefixed IDs (e.g. "txt-body" instead of "body", "btn-submit" instead of "submit").`
        );
    }

    // Tier gating: reject premium features if the user is on the free tier.
    const tier = configGet('tier') || 'free';
    if (tier === 'free') {
        const usedPremium = [...usedComponents].filter(c => PREMIUM_COMPONENTS.has(c));
        if (usedPremium.length > 0) {
            errors.push(
                `Free tier does not support these components: ${usedPremium.join(', ')}. ` +
                `DO NOT create a card. Instead, tell the user they need Glass Claw Pro for this feature and suggest they message @GlassClawBot and tap /upgrade. Ask if they'd like to see a demo of what Pro looks like — if yes, call show_pro_demo.`
            );
        }
        if (createSurfaceCount > 1) {
            errors.push(
                `Free tier does not support multi-page cards (${createSurfaceCount} surfaces). Use a single createSurface instead. ` +
                `DO NOT create a card. Instead, tell the user they need Glass Claw Pro for multi-page cards and suggest they message @GlassClawBot and tap /upgrade. Ask if they'd like to see a demo of what Pro looks like — if yes, call show_pro_demo.`
            );
        }
    }

    if (errors.length > 0) {
        throw new Error(
            `A2UI JSONL validation failed (${errors.length} error${errors.length > 1 ? 's' : ''}):\n\n` +
            errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n') +
            '\n\nSee component docs for correct format examples.'
        );
    }
}

// ── Tool: create_card ─────────────────────────────────────────────────────────

/**
 * Create a new Glass Claw surface and send an InlineKeyboardButton (web_app)
 * to the chat. The payload is encrypted unless group is true.
 *
 * @param {object} params
 * @param {number}  params.chatId    — Telegram chat ID to send the button to
 * @param {number}  params.userId    — Telegram user ID (used for key lookup)
 * @param {string}  params.title     — Surface title
 * @param {string}  params.payload   — A2UI v0.9 JSONL payload
 * @param {boolean} [params.group]   — If true, send as plain JSONL (no encryption)
 * @returns {object} Surface creation response from Glass Claw API
 */
async function create_card({ chatId, userId, title, payload, group = false }) {
    requireConfig();
    validatePayload(payload);

    let storedPayload;
    let groupKeyHex = null;
    if (group) {
        groupKeyHex = bytesToHex(randomBytes(32));
        storedPayload = encrypt(payload, groupKeyHex);
    } else {
        const keyHex = loadKey(userId);
        if (!keyHex) throw new Error(`No key found for user ${userId}. Run setup first.`);
        storedPayload = encrypt(payload, keyHex);
    }

    const result = await glassclaw('POST', '/api/surfaces', {
        title,
        payload: storedPayload,
    });

    if (groupKeyHex) {
        saveGroupKey(result.id, groupKeyHex);
    }

    let appUrl = result.url || `${BASE_URL}/app/${result.id}`;
    if (groupKeyHex) {
        appUrl += `#key=${groupKeyHex}`;
    }

    const sentMsg = await telegram('sendMessage', {
        chat_id:      chatId,
        text:         title || 'Open card',
        reply_markup: {
            inline_keyboard: [[
                { text: title || 'Open card', web_app: { url: appUrl } },
            ]],
        },
    });

    const messageId = sentMsg.message_id;

    // If the card has a form, spawn a background watcher that polls for the
    // response and reacts to the card message when it arrives.
    if (_payloadHasForm(payload)) {
        _spawnResponseWatcher({
            surfaceId: result.id,
            chatId,
            userId,
            messageId,
            group: !!group,
        });
    }

    // Return only the surface ID and metadata — NOT the URL.
    // The card button was already sent to the chat. Never share card URLs
    // directly — they only work inside Telegram's mini-app viewer.
    return {
        id: result.id,
        title: result.title,
        message: 'Card sent. Tell the user in one short sentence that the card is ready — do NOT describe its contents, list components, or share the URL.',
    };
}

/**
 * Check if a JSONL payload contains a form (a GlassButton with an action name).
 */
function _payloadHasForm(payload) {
    try {
        const lines = payload.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const msg = JSON.parse(line);
            const comps = msg.updateComponents?.components;
            if (!Array.isArray(comps)) continue;
            for (const comp of comps) {
                if ((comp.component === 'GlassButton' || comp.type === 'GlassButton') && comp.action?.name) {
                    return true;
                }
            }
        }
    } catch { /* ignore */ }
    return false;
}

/**
 * Spawn a detached background process that polls for a form response.
 * On success: reacts to the card message with an emoji to wake the agent.
 * On poll limit exceeded (429): sends a text message asking the user to confirm.
 */
function _spawnResponseWatcher({ surfaceId, chatId, userId, messageId, group }) {
    const { spawn } = require('child_process');
    const child = spawn(process.execPath, [
        __filename, '_watch_response',
        '--surfaceId', String(surfaceId),
        '--chatId', String(chatId),
        '--userId', String(userId),
        '--messageId', String(messageId),
        '--group', String(group),
    ], {
        detached: true,
        stdio: 'ignore',
        env: process.env,
    });
    child.unref();
}

// ── Tool: update_card ─────────────────────────────────────────────────────────

/**
 * Update an existing Glass Claw surface. The payload is encrypted unless
 * group is true.
 *
 * @param {object} params
 * @param {string}  params.surfaceId  — Surface ID to update
 * @param {number}  params.userId     — Telegram user ID (used for key lookup)
 * @param {string}  params.payload    — New A2UI v0.9 JSONL payload
 * @param {string}  [params.title]    — New title (optional)
 * @param {boolean} [params.group]    — If true, send as plain JSONL (no encryption)
 * @returns {object} Surface update response from Glass Claw API
 */
async function update_card({ surfaceId, userId, payload, title = '', group = false }) {
    requireConfig();
    validatePayload(payload);

    let storedPayload;
    if (group) {
        const groupKeyHex = loadGroupKey(surfaceId);
        if (!groupKeyHex) throw new Error(`No group key found for surface ${surfaceId}. Was it created with group: true?`);
        storedPayload = encrypt(payload, groupKeyHex);
    } else {
        const keyHex = loadKey(userId);
        if (!keyHex) throw new Error(`No key found for user ${userId}. Run setup first.`);
        storedPayload = encrypt(payload, keyHex);
    }

    return glassclaw('PUT', `/api/surfaces/${surfaceId}`, {
        title,
        payload: storedPayload,
    });
}

// ── Tool: delete_card ─────────────────────────────────────────────────────────

/**
 * Delete a Glass Claw surface.
 *
 * @param {object} params
 * @param {string} params.surfaceId — Surface ID to delete
 * @returns {null}
 */
async function delete_card({ surfaceId }) {
    requireConfig();
    await glassclaw('DELETE', `/api/surfaces/${surfaceId}`);
    deleteGroupKey(surfaceId);
    return null;
}

// ── Tool: poll_response ───────────────────────────────────────────────────────

/**
 * Long-poll for an encrypted form response. Retries on 204 (no response yet).
 * Returns null when the surface expires (410) or when the timeout is reached.
 *
 * @param {object} params
 * @param {string}  params.surfaceId  — Surface ID to poll
 * @param {number}  params.userId     — Telegram user ID (used for key lookup)
 * @param {boolean} [params.group]    — If true, use group key instead of user key
 * @param {number}  [params.timeout]  — Max seconds to wait (default 600 = 10 minutes)
 * @returns {object|null} Decrypted response payload, or null if expired/timed out
 */
async function poll_response({ surfaceId, userId, group = false, timeout = 600 }) {
    requireConfig();
    const deadline = Date.now() + timeout * 1000;

    while (Date.now() < deadline) {
        let data;
        try {
            data = await glassclaw('GET', `/api/surfaces/${surfaceId}/response`);
        } catch (err) {
            if (err.status === 410) return null;
            if (err.status === 429) return null; // poll limit exceeded
            // Server error — do NOT retry. Return null and let the user confirm manually.
            return null;
        }

        // 204 — no response yet, server already held for up to 30s; retry.
        if (data === null) continue;

        const plaintext = _decryptResponse(data.encrypted_data, surfaceId, userId, group);
        return {
            data:       JSON.parse(plaintext),
            created_at: data.created_at,
        };
    }

    // Timeout reached — no response received.
    return null;
}

// ── Tool: get_account ─────────────────────────────────────────────────────────

/**
 * Fetch Glass Claw account tier and usage information.
 *
 * @returns {object} Account info (tier, active_surfaces, max_surfaces, features)
 */
async function get_account() {
    requireConfig();
    const account = await glassclaw('GET', '/api/account');
    // Cache the tier so validation can gate premium components.
    if (account && account.tier) {
        configSet('tier', account.tier);
    }
    return account;
}

// ── Tool: show_pro_demo ───────────────────────────────────────────────────────

/**
 * Send the user a button to view the Glass Claw Pro demo dashboard.
 * This is a hardcoded route on the server — no API key, encryption, or
 * surface creation needed.
 *
 * @param {object} params
 * @param {number} params.chatId — Telegram chat ID to send the button to
 * @returns {object} Confirmation message
 */
async function show_pro_demo({ chatId }) {
    requireConfig();
    const demoUrl = `${BASE_URL}/app/demo`;
    await telegram('sendMessage', {
        chat_id: chatId,
        text: 'Here\'s a preview of what Glass Claw Pro looks like:',
        reply_markup: {
            inline_keyboard: [[
                { text: 'View Pro Demo', web_app: { url: demoUrl } },
            ]],
        },
    });
    return {
        message: 'Demo card sent. The user can tap the button to see a Pro dashboard preview.',
    };
}

// ── Internal: background response watcher ─────────────────────────────────────

/**
 * Handle a 429 (poll limit exceeded) by sending a text message
 * asking the user to let the agent know when they've submitted.
 */
async function _handlePollLimitExceeded(chatId, _userId, log, iteration) {
    try {
        await telegram('sendMessage', {
            chat_id: chatId,
            text: 'Let me know when you\'ve finished filling out the form.',
        });
        log(`POLL #${iteration} — timeout message sent. Exiting.`);
    } catch (err) {
        log(`POLL #${iteration} — failed to send timeout message: ${err.message}. Exiting.`);
    }
}

/**
 * Look up the OpenClaw agent session for the given chatId and deliver
 * the decrypted form data to it.
 */
function _deliverToAgent(surfaceId, chatId, formData, log, iteration) {
    const messageText = `Glass Claw: Form response received for surface ${surfaceId}.\n\nForm data:\n${JSON.stringify(formData, null, 2)}\n\nProcess this response and reply to the user. Do NOT call poll_response — the data is above.`;
    const { execSync } = require('child_process');

    try {
        const sessionsCmd = 'openclaw sessions --json';
        log(`POLL #${iteration} — running: ${sessionsCmd}`);
        const sessionsJson = execSync(sessionsCmd, { timeout: 60000 }).toString();
        const parsed = JSON.parse(sessionsJson);
        const sessions = parsed.sessions || parsed;
        const suffix = ':' + String(chatId);

        let matchingKey, matchingSession;
        if (Array.isArray(sessions)) {
            const entry = sessions.find(s => (s.key || '').endsWith(suffix));
            if (entry) { matchingKey = entry.key; matchingSession = entry; }
        } else {
            matchingKey = Object.keys(sessions).find(k => k.endsWith(suffix));
            if (matchingKey) matchingSession = sessions[matchingKey];
        }

        if (!matchingKey || !matchingSession?.sessionId) {
            const keys = Array.isArray(sessions) ? sessions.map(s => s.key) : Object.keys(sessions);
            log(`POLL #${iteration} — no matching session found for chatId=${chatId}. Session keys: ${keys.join(', ')}. Exiting.`);
            return;
        }

        const sessionId = matchingSession.sessionId;
        log(`POLL #${iteration} — found session: key=${matchingKey} sessionId=${sessionId}`);

        const deliverCmd = `openclaw agent --message ${JSON.stringify(messageText)} --session-id ${sessionId} --deliver`;
        log(`POLL #${iteration} — running: ${deliverCmd}`);
        execSync(deliverCmd, { stdio: 'ignore', timeout: 60000 });
        log(`POLL #${iteration} — message delivered to session ${sessionId}. Exiting.`);
    } catch (err) {
        log(`POLL #${iteration} — delivery failed: ${err.message}. Exiting.`);
    }
}

/**
 * Background process that polls for a form response.
 * - On 200 (response received): reacts to the card message with ⚡ emoji.
 * - On 429 (poll limit exceeded): sends a text message asking the user to confirm.
 * - On 410 (surface expired): exits silently.
 *
 * Spawned by create_card as a detached child process.
 */
async function _watchResponse({ surfaceId, chatId, userId, messageId, group = false }) {
    ensureLogsDir();
    const logFile = path.join(LOGS_DIR, `watcher_${surfaceId}.log`);

    function log(msg) {
        const line = `[${new Date().toISOString()}] ${msg}\n`;
        fs.appendFileSync(logFile, line);
    }

    log(`START surfaceId=${surfaceId} chatId=${chatId} userId=${userId} messageId=${messageId} group=${group}`);

    let iteration = 0;
    while (true) {
        iteration++;
        log(`POLL #${iteration} — fetching ${BASE_URL}/api/surfaces/${surfaceId}/response`);

        let data;
        try {
            data = await glassclaw('GET', `/api/surfaces/${surfaceId}/response`);
        } catch (err) {
            if (err.status === 410) {
                log(`POLL #${iteration} — surface expired/deleted (410). Exiting.`);
                return;
            }
            if (err.status === 429) {
                log(`POLL #${iteration} — poll limit exceeded (429). Sending reply keyboard.`);
                await _handlePollLimitExceeded(chatId, userId, log, iteration);
                return;
            }
            log(`POLL #${iteration} — ERROR: ${err.message}. Retrying in 5s.`);
            await new Promise(r => setTimeout(r, 5000));
            continue;
        }

        // 204 — no response yet.
        if (data === null) {
            log(`POLL #${iteration} — no response yet (204). Looping.`);
            continue;
        }

        // 200 — response received. Decrypt it.
        log(`POLL #${iteration} — RESPONSE RECEIVED. Decrypting.`);
        let plaintext;
        try {
            plaintext = _decryptResponse(data.encrypted_data, surfaceId, userId, group);
        } catch (decErr) {
            log(`POLL #${iteration} — DECRYPT FAILED: ${decErr.message}. Exiting.`);
            return;
        }

        const formData = JSON.parse(plaintext);
        log(`POLL #${iteration} — decrypted successfully. Data: ${plaintext.substring(0, 200)}`);

        // Send ⚡ reaction on the card message.
        try {
            await telegram('setMessageReaction', {
                chat_id: chatId,
                message_id: messageId,
                reaction: [{ type: 'emoji', emoji: '⚡' }],
            });
            log(`POLL #${iteration} — emoji reaction sent.`);
        } catch (reactErr) {
            log(`POLL #${iteration} — emoji reaction FAILED: ${reactErr.message}.`);
        }

        _deliverToAgent(surfaceId, chatId, formData, log, iteration);
        return;
    }
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
    setup,
    create_card,
    update_card,
    delete_card,
    poll_response,
    get_account,
    show_pro_demo,
    // Internals exposed for testing only.
    _internals: {
        loadConfig, saveConfig, configGet, configSet,
        _setConfigDir,
        loadKey, saveKey, loadGroupKey, saveGroupKey, deleteGroupKey,
        encrypt, decrypt, _decryptResponse,
        validatePayload, _validateComponent, _payloadHasForm,
    },
};

// ── CLI interface ────────────────────────────────────────────────────────────
// Allows OpenClaw agents to invoke tools via:
//   node glassclaw.js <command> --param value --param2 value2
//   node glassclaw.js create_card --chatId 123 --userId 123 --title "My Card" --payloadFile card.jsonl

if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.error('Usage: node glassclaw.js <command> [--param value ...]');
        console.error('Commands: config, setup, create_card, update_card, delete_card, poll_response, get_account, show_pro_demo');
        process.exit(1);
    }

    // Config commands — run before anything else (don't require full config).
    if (command === 'config') {
        const sub = args[1];
        const key = args[2];
        const val = args[3];
        if (sub === 'get' && key) {
            const result = configGet(key);
            if (result !== undefined) {
                console.log(typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
            } else {
                console.log('(not set)');
            }
        } else if (sub === 'set' && key && val !== undefined) {
            configSet(key, val);
            console.log(`Set ${key} = ${val}`);
        } else if (sub === 'show') {
            console.log(JSON.stringify(loadConfig(), null, 2));
        } else if (sub === 'path') {
            console.log(CONFIG_FILE);
        } else {
            console.error('Usage:');
            console.error('  node glassclaw.js config get <key>       — get a config value');
            console.error('  node glassclaw.js config set <key> <val> — set a config value');
            console.error('  node glassclaw.js config show             — show full config');
            console.error('  node glassclaw.js config path             — show config file path');
            console.error('');
            console.error('Keys: apiKey, baseUrl, telegram.botToken, telegram.source');
        }
        process.exit(0);
    }

    // Parse --key value pairs into an object.
    function parseArgs(args) {
        const params = {};
        for (let i = 1; i < args.length; i++) {
            if (args[i].startsWith('--') && i + 1 < args.length) {
                const key = args[i].slice(2);
                let val = args[i + 1];
                // Auto-convert numbers.
                if (/^\d+$/.test(val)) val = parseInt(val, 10);
                // Auto-convert booleans.
                if (val === 'true') val = true;
                if (val === 'false') val = false;
                params[key] = val;
                i++;
            }
        }
        return params;
    }

    const params = parseArgs(args);

    // Handle --payloadFile: read file contents into params.payload, then delete the file.
    let payloadFilePath = null;
    if (params.payloadFile) {
        payloadFilePath = path.resolve(params.payloadFile);
        if (!fs.existsSync(payloadFilePath)) {
            console.error(`File not found: ${payloadFilePath}`);
            process.exit(1);
        }
        params.payload = fs.readFileSync(payloadFilePath, 'utf8').trim();
        delete params.payloadFile;
    }

    // Internal command: background response watcher (not user-facing).
    if (command === '_watch_response') {
        _watchResponse(params).then(() => process.exit(0)).catch(() => process.exit(1));
        return;
    }

    const commands = { setup, create_card, update_card, delete_card, poll_response, get_account, show_pro_demo };
    const fn = commands[command];
    if (!fn) {
        console.error(`Unknown command: ${command}`);
        console.error('Available: ' + Object.keys(commands).join(', '));
        process.exit(1);
    }

    fn(params)
        .then(result => {
            // Clean up the payload file after successful send.
            if (payloadFilePath) {
                try { fs.unlinkSync(payloadFilePath); } catch { /* ignore */ }
            }
            if (result !== null && result !== undefined) {
                console.log(JSON.stringify(result, null, 2));
            }
        })
        .catch(err => {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        });
}
