<template>
  <!-- Skip-to-content link for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Navbar -->
  <header role="banner">
    <nav class="navbar" aria-label="Main navigation">
      <div class="navbar-left">
        <div class="navbar-brand">
          <span class="brand-logo" aria-hidden="true">🍱</span>
          <div class="brand-text">
            <span class="brand-name">Haett Partner Portal</span>
            <span class="brand-tagline">Grow your reach, earn rewards</span>
          </div>
        </div>
        <button
          class="about-btn"
          @click="showAbout = !showAbout"
          :aria-expanded="showAbout"
          :aria-label="`About this app${showAbout ? ' (close)' : ''}`"
          title="About this app"
        >
          <span class="about-icon" aria-hidden="true">ⓘ</span>
        </button>
      </div>

      <!-- About popover backdrop -->
      <div
        v-if="showAbout"
        class="about-backdrop"
        @click="showAbout = false"
        aria-hidden="true"
      ></div>

      <!-- About popover -->
      <transition name="fade">
        <div
          v-if="showAbout"
          class="about-popover card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
        >
          <div class="about-content">
            <h4 id="about-title">🌱 About Haett Partner Portal</h4>
            <p>
              This platform connects content creators, influencers, gyms, and businesses with
              <strong>Haett</strong> — a health & wellness brand. Partners apply to join the
              programme, get approved by admins, and receive exclusive discount codes to share
              with their audience. Every successful referral earns rewards.
            </p>
            <div class="about-highlights">
              <div><strong aria-hidden="true">🎯</strong><span class="sr-only">Target: </span>For Partners<br />Apply, share codes, earn commissions</div>
              <div><strong aria-hidden="true">🛠️</strong><span class="sr-only">Tools: </span>For Admins<br />Review, approve, manage codes in real-time</div>
            </div>
            <p class="about-footer">
              Built for the Haett Full-Stack Intern Assessment
            </p>
            <button class="about-close-btn" @click="showAbout = false">
              Got it
            </button>
          </div>
        </div>
      </transition>

      <div class="navbar-right">
        <template v-if="auth.user">
          <span class="nav-welcome">Welcome, {{ auth.user.name }}</span>
          <button class="btn btn-secondary" @click="logout" aria-label="Log out of your account">Logout</button>
        </template>
        <template v-else>
          <button class="primary-btn nav-login-btn" @click="showLogin = true" aria-label="Open login form">Login</button>
        </template>
      </div>
    </nav>
  </header>

  <!-- Main content -->
  <main id="main-content" role="main">
    <div class="container">

      <!-- Initial page load spinner -->
      <div v-if="initialLoading" class="page-loading" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <p>Loading…</p>
      </div>

      <template v-else>
        <!-- Not logged in: landing -->
        <LandingView v-if="!auth.user && !showLogin" @login="showLogin = true" />

        <!-- Login Modal -->
        <div
          v-if="!auth.user && showLogin"
          class="login-modal-overlay"
          @click.self="showLogin = false"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
        >
          <div class="card login-box">
            <h3 id="login-title">Login to Haett</h3>
            <p class="login-sub">Sign in to manage your partner account</p>
            <form novalidate @submit.prevent="login">
              <div class="form-group">
                <label for="login-email" class="sr-only">Email</label>
                <input id="login-email" v-model="email" placeholder="Email" type="email" class="form-input" autocomplete="email" />
              </div>
              <div class="form-group">
                <label for="login-password" class="sr-only">Password</label>
                <input id="login-password" v-model="password" type="password" placeholder="Password" class="form-input" autocomplete="current-password" />
              </div>
              <p v-if="loginError" class="error-msg" role="alert" aria-live="assertive">{{ loginError }}</p>
              <button class="primary-btn full-width" type="submit" :disabled="loginLoading" aria-busy="loginLoading">
                {{ loginLoading ? "Logging in…" : "Login" }}
              </button>
              <button type="button" class="text-btn" @click="showLogin = false" aria-label="Cancel login">Cancel</button>
            </form>
          </div>
        </div>

        <!-- Admin -->
        <AdminPanel v-else-if="auth.user && auth.user.role === 'ADMIN'" />

        <!-- Regular user views -->
        <div v-else-if="auth.user">

          <!-- No application yet, or reapplying -->
          <ApplicationForm
            v-if="!application || reapplying"
            @submitted="onApplicationSubmitted"
          />

          <PendingView
            v-else-if="application.status === 'PENDING'"
            :application="application"
          />

          <RejectedView
            v-else-if="application.status === 'REJECTED'"
            :application="application"
            @reapply="startReapply"
          />

          <div v-else-if="application.status === 'APPROVED'">
            <div class="card profile-card">
              <div class="profile-header">
                <div>
                  <h2>{{ application.business_name }}</h2>
                  <span class="badge status-approved">APPROVED</span>
                </div>
                <div class="profile-meta">
                  <p><strong>Partner Type:</strong> {{ application.partner_type }}</p>
                  <p v-if="application.approved_at">
                    <strong>Approved:</strong>
                    {{ new Date(application.approved_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) }}
                  </p>
                </div>
              </div>
            </div>
            <PartnerDashboard :codes="codes" />
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "vue-toastification";
import api from "../services/api";
import { useAuthStore } from "../stores/auth";
import LandingView from "../components/LandingView.vue";
import ApplicationForm from "../components/ApplicationForm.vue";
import PendingView from "../components/PendingView.vue";
import RejectedView from "../components/RejectedView.vue";
import PartnerDashboard from "../components/PartnerDashboard.vue";
import AdminPanel from "../components/AdminPanel.vue";

const auth = useAuthStore();
const toast = useToast();

const initialLoading = ref(false);
const showLogin = ref(false);
const showAbout = ref(false);
const loginError = ref("");
const loginLoading = ref(false);
const email = ref("");
const password = ref("");
const application = ref(null);
const codes = ref([]);
const reapplying = ref(false);

async function login() {
  loginError.value = "";
  loginLoading.value = true;
  try {
    await auth.login(email.value, password.value);
    await loadData();
    showLogin.value = false;
    email.value = "";
    password.value = "";
  } catch (e) {
    loginError.value = e?.response?.data?.detail || "Login failed. Check your credentials.";
  } finally {
    loginLoading.value = false;
  }
}

async function loadData() {
  try {
    const response = await api.get("/partner/application");
    application.value = response.data;
  } catch {
    application.value = null;
  }
  if (application.value?.status === "APPROVED") {
    try {
      const response = await api.get("/partner/codes");
      codes.value = response.data;
    } catch {
      codes.value = [];
    }
  }
}

async function onApplicationSubmitted() {
  reapplying.value = false;
  await loadData();
  toast.success("Application submitted successfully!");
}

function startReapply() {
  reapplying.value = true;
}

function logout() {
  auth.logout();
  application.value = null;
  codes.value = [];
  showLogin.value = false;
  reapplying.value = false;
}

function handleKeydown(e) {
  if (e.key === 'Escape' && showAbout.value) {
    showAbout.value = false;
  }
  if (e.key === 'Escape' && showLogin.value) {
    showLogin.value = false;
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  if (auth.token) {
    initialLoading.value = true;
    try {
      await auth.fetchUser();
      if (auth.user) await loadData();
    } finally {
      initialLoading.value = false;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(12px, 2.5vw, 16px) clamp(16px, 4vw, 40px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  gap: 12px;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 16px);
  min-width: 0;
}
.navbar-brand { display: flex; align-items: center; gap: clamp(6px, 1.5vw, 10px); min-width: 0; }
.brand-logo { font-size: clamp(22px, 4vw, 28px); flex-shrink: 0; }
.brand-text { display: flex; flex-direction: column; min-width: 0; }
.brand-name { font-size: clamp(14px, 2.5vw, 18px); font-weight: 700; color: #0f172a; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.brand-tagline { font-size: clamp(10px, 1.2vw, 11px); color: #94a3b8; font-weight: 500; letter-spacing: 0.02em; display: none; }

@media (min-width: 480px) {
  .brand-tagline { display: block; }
}

/* About button & popover */
.about-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  flex-shrink: 0;
}
.about-btn:hover {
  background: #f1f5f9;
  color: #ff6b35;
}
.about-icon { font-size: clamp(18px, 3vw, 20px); line-height: 1; }

/* Backdrop */
.about-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  z-index: 299;
}

.about-popover {
  position: fixed;
  top: clamp(70px, 10vh, 80px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  max-width: 520px;
  width: calc(100% - 32px);
  max-height: calc(100vh - 100px);
  padding: 0;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  overflow-y: auto;
}
.about-content {
  padding: clamp(20px, 4vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.about-content h4 {
  font-size: clamp(16px, 2.5vw, 18px);
  color: #0f172a;
}
.about-content > p {
  font-size: clamp(13px, 2vw, 14px);
  color: #475569;
  line-height: 1.8;
}
.about-highlights {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.about-highlights div {
  background: #f8fafc;
  border-radius: 10px;
  padding: clamp(12px, 2vw, 14px);
  font-size: clamp(12px, 1.5vw, 13px);
  color: #475569;
  line-height: 1.6;
}
.about-highlights div strong {
  color: #0f172a;
}
.about-footer {
  font-size: 12px !important;
  color: #94a3b8 !important;
  text-align: center;
  font-style: italic;
}
.about-close-btn {
  align-self: center;
  padding: clamp(8px, 2vw, 10px) clamp(24px, 4vw, 28px);
  border-radius: var(--radius-btn);
  border: none;
  background: linear-gradient(135deg, #ff6b35, #ff9f43);
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: clamp(13px, 2vw, 14px);
  transition: box-shadow 0.2s;
}
.about-close-btn:hover {
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-8px); }

.navbar-right { display: flex; align-items: center; gap: clamp(8px, 2vw, 16px); flex-shrink: 0; }
.nav-welcome { font-size: clamp(12px, 1.8vw, 14px); color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
.nav-login-btn { padding: clamp(8px, 1.5vw, 10px) clamp(16px, 3vw, 20px); font-size: clamp(13px, 2vw, 14px); }
.container { max-width: 1100px; margin: 0 auto; padding: clamp(24px, 4vw, 40px) clamp(16px, 3vw, 24px); }

.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 300px;
  color: #94a3b8;
}
.spinner {
  width: clamp(24px, 4vw, 32px); height: clamp(24px, 4vw, 32px);
  border: 3px solid #e2e8f0;
  border-top-color: #ff6b35;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.login-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}
.login-box {
  width: 100%;
  max-width: 420px;
  padding: clamp(24px, 4vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
.login-box h3 { font-size: clamp(18px, 3.5vw, 22px); margin: 0; }
.login-sub { color: #64748b; font-size: clamp(13px, 2vw, 14px); margin: 0; }
.form-group { display: flex; flex-direction: column; margin-bottom: 4px; }
.form-input {
  padding: clamp(10px, 2vw, 12px) clamp(14px, 2vw, 16px);
  border-radius: var(--radius-input);
  border: 1px solid var(--border);
  font-size: clamp(14px, 2vw, 15px);
  outline: none;
  font-family: inherit;
  transition: border 0.2s, box-shadow 0.2s;
}
.form-input:focus { border-color: var(--primary); }
.full-width { width: 100%; justify-content: center; }
.text-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: 14px; text-align: center; padding: 10px 0; }
.text-btn:hover { color: #475569; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; padding: 8px 12px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; }

.profile-card { padding: clamp(24px, 4vw, 32px); margin-bottom: 24px; }
.profile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.profile-header h2 { font-size: clamp(20px, 3.5vw, 24px); margin-bottom: 8px; }
.profile-meta p { margin: 4px 0; color: #475569; font-size: clamp(13px, 2vw, 14px); }

.btn { padding: clamp(8px, 1.5vw, 10px) clamp(16px, 2.5vw, 20px); border-radius: var(--radius-input); cursor: pointer; font-size: clamp(13px, 2vw, 14px); font-weight: 600; border: none; transition: background 0.2s; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }
.badge { padding: 6px 14px; border-radius: 999px; font-size: clamp(12px, 1.5vw, 13px); font-weight: 600; }
.status-approved { background: #dcfce7; color: #166534; }

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Mobile: stacked highlights */
@media (max-width: 480px) {
  .about-highlights {
    grid-template-columns: 1fr;
  }
}
</style>
