// ── Haett Partner Portal — Cloudflare Worker ──
// Replaces the original FastAPI backend.
// Uses D1 (SQLite) instead of PostgreSQL.
// JWT auth with HMAC-SHA256 via Web Crypto API.
// Password hashing with PBKDF2 via Web Crypto API.

const JWT_EXPIRY_HOURS = 24;
const PBKDF2_ITERATIONS = 100000;

function getJWTSecret(env) {
  if (!env.JWT_SECRET) throw new Error('JWT_SECRET env var required');
  return env.JWT_SECRET;
}

function getSalt(env) {
  if (!env.SALT) throw new Error('SALT env var required');
  return env.SALT;
}

// ── CORS Headers ──
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ detail: message }, status);
}

// ── Crypto Helpers ──

function base64url(str) {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromBase64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

async function hmacSHA256(message, key) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return base64url(String.fromCharCode(...new Uint8Array(sig)));
}

async function createJWT(payload, env) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY_HOURS * 3600,
  }));
  const signature = await hmacSHA256(`${header}.${body}`, getJWTSecret(env));
  return `${header}.${body}.${signature}`;
}

async function verifyJWT(token, env) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = await hmacSHA256(`${header}.${body}`, getJWTSecret(env));
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(fromBase64url(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hashPassword(password, env) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(getSalt(env)),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256
  );
  return base64url(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password, hash, env) {
  const hashed = await hashPassword(password, env);
  return hashed === hash;
}

// ── Auth Helpers ──

async function getUserFromRequest(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const payload = await verifyJWT(auth.slice(7), env);
  if (!payload || !payload.user_id) return null;
  const user = await env.DB.prepare('SELECT id, name, email, role FROM users WHERE id = ?')
    .bind(payload.user_id)
    .first();
  return user || null;
}

async function requireAuth(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) throw new Error('Unauthorized');
  return user;
}

async function requireAdmin(request, env) {
  const user = await requireAuth(request, env);
  if (user.role !== 'ADMIN') throw new Error('Admin access required');
  return user;
}

// ── Request Body Parsers ──

async function parseJSON(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

async function parseFormData(request) {
  const text = await request.text();
  const params = new URLSearchParams(text);
  return Object.fromEntries(params);
}

function generateDiscountCode(businessName) {
  const prefix = businessName.toUpperCase().replace(/\s/g, '').slice(0, 6);
  const suffix = Math.random().toString().slice(2, 6);
  return `${prefix}${suffix}`;
}

// ── Route Handlers ──

async function handleLogin(request, env) {
  const form = await parseFormData(request);
  const email = form.username || form.email;
  const password = form.password;
  if (!email || !password) return errorResponse('Email and password required');

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first();
  if (!user) return errorResponse('Invalid credentials', 401);

  const valid = await verifyPassword(password, user.password_hash, env);
  if (!valid) return errorResponse('Invalid credentials', 401);

  const token = await createJWT({ user_id: user.id, role: user.role }, env);
  return jsonResponse({ access_token: token, token_type: 'bearer' });
}

async function handleMe(request, env) {
  try {
    const user = await requireAuth(request, env);
    return jsonResponse(user);
  } catch (e) {
    return errorResponse(e.message, 401);
  }
}

async function handleApply(request, env) {
  try {
    const user = await requireAuth(request, env);
    const body = await parseJSON(request);

    const existing = await env.DB.prepare(
      `SELECT id FROM partner_applications WHERE user_id = ? AND status IN ('PENDING', 'APPROVED')`
    ).bind(user.id).first();

    if (existing) return errorResponse('Application already exists');

    const { partner_type, business_name, phone, website, audience_size, description } = body;
    if (!partner_type || !business_name) return errorResponse('partner_type and business_name required');

    const result = await env.DB.prepare(
      `INSERT INTO partner_applications (user_id, partner_type, business_name, phone, website, audience_size, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(user.id, partner_type, business_name, phone || null, website || null, audience_size || null, description || null)
     .run();

    const app = await env.DB.prepare(
      'SELECT * FROM partner_applications WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return jsonResponse(app, 201);
  } catch (e) {
    if (e.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse(e.message);
  }
}

async function handleGetApplication(request, env) {
  try {
    const user = await requireAuth(request, env);
    const app = await env.DB.prepare(
      'SELECT * FROM partner_applications WHERE user_id = ? ORDER BY applied_at DESC'
    ).bind(user.id).first();

    if (!app) return errorResponse('No application found', 404);
    return jsonResponse(app);
  } catch (e) {
    if (e.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse(e.message);
  }
}

async function handleGetCodes(request, env) {
  try {
    const user = await requireAuth(request, env);
    const app = await env.DB.prepare(
      "SELECT id FROM partner_applications WHERE user_id = ? AND status = 'APPROVED'"
    ).bind(user.id).first();

    if (!app) return jsonResponse([]);

    const codes = await env.DB.prepare(
      'SELECT * FROM discount_codes WHERE application_id = ?'
    ).bind(app.id).all();

    return jsonResponse(codes.results);
  } catch (e) {
    if (e.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse(e.message);
  }
}

async function handleReapply(request, env) {
  try {
    const user = await requireAuth(request, env);
    const app = await env.DB.prepare(
      'SELECT * FROM partner_applications WHERE user_id = ? ORDER BY applied_at DESC'
    ).bind(user.id).first();

    if (!app) return errorResponse('Application not found', 404);
    if (app.status !== 'REJECTED') return errorResponse('Only rejected applications can reapply');

    await env.DB.prepare(
      "UPDATE partner_applications SET status = 'PENDING', rejection_reason = NULL WHERE id = ?"
    ).bind(app.id).run();

    return jsonResponse({ message: 'Application resubmitted' });
  } catch (e) {
    if (e.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    return errorResponse(e.message);
  }
}

// ── Admin Handlers ──

async function handleAdminApplications(request, env) {
  try {
    await requireAdmin(request, env);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'ALL';
    const search = url.searchParams.get('search') || '';

    let query = 'SELECT * FROM partner_applications';
    const params = [];
    const conditions = [];

    if (status !== 'ALL') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('business_name LIKE ?');
      params.push(`%${search}%`);
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY applied_at DESC';

    const apps = await env.DB.prepare(query).bind(...params).all();
    return jsonResponse(apps.results);
  } catch (e) {
    if (e.message === 'Unauthorized' || e.message === 'Admin access required')
      return errorResponse(e.message, 403);
    return errorResponse(e.message);
  }
}

async function handleAdminApplicationCodes(request, env, appId) {
  try {
    await requireAdmin(request, env);
    const app = await env.DB.prepare('SELECT id FROM partner_applications WHERE id = ?')
      .bind(appId).first();
    if (!app) return errorResponse('Application not found', 404);

    const codes = await env.DB.prepare('SELECT * FROM discount_codes WHERE application_id = ?')
      .bind(appId).all();
    return jsonResponse(codes.results);
  } catch (e) {
    if (e.message === 'Unauthorized' || e.message === 'Admin access required')
      return errorResponse(e.message, 403);
    return errorResponse(e.message);
  }
}

async function handleAdminApprove(request, env, appId) {
  try {
    await requireAdmin(request, env);
    const app = await env.DB.prepare('SELECT * FROM partner_applications WHERE id = ?')
      .bind(appId).first();
    if (!app) return errorResponse('Application not found', 404);

    const now = new Date().toISOString();
    await env.DB.prepare(
      "UPDATE partner_applications SET status = 'APPROVED', approved_at = ? WHERE id = ?"
    ).bind(now, appId).run();

    const code = generateDiscountCode(app.business_name);
    await env.DB.prepare(
      'INSERT INTO discount_codes (application_id, code, discount_type, discount_value) VALUES (?, ?, ?, ?)'
    ).bind(appId, code, 'PERCENTAGE', 20).run();

    return jsonResponse({ message: 'Application approved' });
  } catch (e) {
    if (e.message === 'Unauthorized' || e.message === 'Admin access required')
      return errorResponse(e.message, 403);
    return errorResponse(e.message);
  }
}

async function handleAdminReject(request, env, appId) {
  try {
    await requireAdmin(request, env);
    const body = await parseJSON(request);
    if (!body.reason) return errorResponse('Reason is required');

    const app = await env.DB.prepare('SELECT id FROM partner_applications WHERE id = ?')
      .bind(appId).first();
    if (!app) return errorResponse('Application not found', 404);

    await env.DB.prepare(
      "UPDATE partner_applications SET status = 'REJECTED', rejection_reason = ? WHERE id = ?"
    ).bind(body.reason, appId).run();

    return jsonResponse({ message: 'Application rejected' });
  } catch (e) {
    if (e.message === 'Unauthorized' || e.message === 'Admin access required')
      return errorResponse(e.message, 403);
    return errorResponse(e.message);
  }
}

async function handleAdminToggleCode(request, env, codeId, activate) {
  try {
    await requireAdmin(request, env);
    const code = await env.DB.prepare('SELECT id FROM discount_codes WHERE id = ?')
      .bind(codeId).first();
    if (!code) return errorResponse('Code not found', 404);

    await env.DB.prepare(
      'UPDATE discount_codes SET is_active = ? WHERE id = ?'
    ).bind(activate ? 1 : 0, codeId).run();

    const updated = await env.DB.prepare('SELECT code, is_active FROM discount_codes WHERE id = ?')
      .bind(codeId).first();

    return jsonResponse({ code: updated.code, is_active: !!updated.is_active });
  } catch (e) {
    if (e.message === 'Unauthorized' || e.message === 'Admin access required')
      return errorResponse(e.message, 403);
    return errorResponse(e.message);
  }
}

async function handleAdminSummary(request, env) {
  try {
    await requireAdmin(request, env);

    const pending = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM partner_applications WHERE status = 'PENDING'"
    ).first();
    const approved = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM partner_applications WHERE status = 'APPROVED'"
    ).first();
    const rejected = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM partner_applications WHERE status = 'REJECTED'"
    ).first();
    const total = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM partner_applications'
    ).first();

    return jsonResponse({
      pending: pending.count,
      approved: approved.count,
      rejected: rejected.count,
      total: total.count,
    });
  } catch (e) {
    if (e.message === 'Unauthorized' || e.message === 'Admin access required')
      return errorResponse(e.message, 403);
    return errorResponse(e.message);
  }
}

// ── Seed on first run ──
// Tracks whether seeding has been done to avoid checking on every request
let seeded = false;

async function seedIfNeeded(env) {
  if (seeded) return;

  const adminExists = await env.DB.prepare(
    "SELECT id FROM users WHERE email = 'admin@haett.com'"
  ).first();

  if (!adminExists) {
    const adminHash = await hashPassword('Admin@123', env);
    const userHash = await hashPassword('User@123', env);

    await env.DB.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).bind('Admin User', 'admin@haett.com', adminHash, 'ADMIN').run();

    await env.DB.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).bind('Test User', 'user@haett.com', userHash, 'USER').run();
  }

  seeded = true;
}

// ── Main Router ──

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Seed test users on first request
      await seedIfNeeded(env);

      // Auth routes
      if (path === '/auth/login' && request.method === 'POST') return handleLogin(request, env);
      if (path === '/auth/me' && request.method === 'GET') return handleMe(request, env);

      // Partner routes
      if (path === '/partner/apply' && request.method === 'POST') return handleApply(request, env);
      if (path === '/partner/application' && request.method === 'GET') return handleGetApplication(request, env);
      if (path === '/partner/codes' && request.method === 'GET') return handleGetCodes(request, env);
      if (path === '/partner/reapply' && request.method === 'POST') return handleReapply(request, env);

      // Admin routes
      if (path === '/admin/applications' && request.method === 'GET') return handleAdminApplications(request, env);
      if (path === '/admin/summary' && request.method === 'GET') return handleAdminSummary(request, env);

      // Admin routes with params
      const appCodesMatch = path.match(/^\/admin\/applications\/(\d+)\/codes$/);
      if (appCodesMatch && request.method === 'GET') return handleAdminApplicationCodes(request, env, parseInt(appCodesMatch[1]));

      const approveMatch = path.match(/^\/admin\/applications\/(\d+)\/approve$/);
      if (approveMatch && request.method === 'POST') return handleAdminApprove(request, env, parseInt(approveMatch[1]));

      const rejectMatch = path.match(/^\/admin\/applications\/(\d+)\/reject$/);
      if (rejectMatch && request.method === 'POST') return handleAdminReject(request, env, parseInt(rejectMatch[1]));

      const activateMatch = path.match(/^\/admin\/codes\/(\d+)\/activate$/);
      if (activateMatch && request.method === 'POST') return handleAdminToggleCode(request, env, parseInt(activateMatch[1]), true);

      const deactivateMatch = path.match(/^\/admin\/codes\/(\d+)\/deactivate$/);
      if (deactivateMatch && request.method === 'POST') return handleAdminToggleCode(request, env, parseInt(deactivateMatch[1]), false);

      // Health / Root
      if (path === '/' || path === '/health') {
        return jsonResponse({ status: 'healthy', message: 'Haett API Running' });
      }

      return errorResponse('Not found', 404);
    } catch (e) {
      return errorResponse('Internal server error', 500);
    }
  },
};
