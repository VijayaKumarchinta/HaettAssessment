<template>
  <!-- Navbar -->
  <nav class="navbar">
    <div class="navbar-brand">
      <span class="brand-logo">🍱</span>
      <span class="brand-name">Haett Partner Portal</span>
    </div>
    <div class="navbar-right">
      <template v-if="auth.user">
        <span class="nav-welcome">Welcome, {{ auth.user.name }}</span>
        <button class="btn btn-secondary" @click="logout">Logout</button>
      </template>
      <template v-else>
        <button class="primary-btn nav-login-btn" @click="showLogin = true">Login</button>
      </template>
    </div>
  </nav>

  <!-- Main content -->
  <div class="container">

    <!-- Initial page load spinner -->
    <div v-if="initialLoading" class="page-loading">
      <span class="spinner"></span>
      <p>Loading…</p>
    </div>

    <template v-else>
      <!-- Not logged in: landing -->
      <LandingView v-if="!auth.user && !showLogin" @login="showLogin = true" />

      <!-- Login Modal -->
      <div v-if="!auth.user && showLogin" class="login-modal-overlay" @click.self="showLogin = false">
        <div class="card login-box">
          <h3>Login to Haett</h3>
          <p class="login-sub">Sign in to manage your partner account</p>
          <div class="form-group">
            <input v-model="email" placeholder="Email" type="email" class="form-input" @keyup.enter="login" />
          </div>
          <div class="form-group">
            <input v-model="password" type="password" placeholder="Password" class="form-input" @keyup.enter="login" />
          </div>
          <p v-if="loginError" class="error-msg">{{ loginError }}</p>
          <button class="primary-btn full-width" @click="login" :disabled="loginLoading">
            {{ loginLoading ? "Logging in…" : "Login" }}
          </button>
          <button class="text-btn" @click="showLogin = false">Cancel</button>
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
</template>

<script setup>
import { ref, onMounted } from "vue";
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

onMounted(async () => {
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
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}
.navbar-brand { display: flex; align-items: center; gap: 10px; }
.brand-logo { font-size: 28px; }
.brand-name { font-size: 18px; font-weight: 700; color: #0f172a; }
.navbar-right { display: flex; align-items: center; gap: 16px; }
.nav-welcome { font-size: 14px; color: #64748b; }
.nav-login-btn { padding: 10px 20px; font-size: 14px; }
.container { max-width: 1100px; margin: 0 auto; padding: 40px 24px; }

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
  width: 32px; height: 32px;
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
}
.login-box {
  width: 420px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.login-box h3 { font-size: 22px; margin: 0; }
.login-sub { color: #64748b; font-size: 14px; margin: 0; }
.form-group { display: flex; flex-direction: column; }
.form-input {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  outline: none;
  transition: border 0.2s;
}
.form-input:focus { border-color: #ff6b35; }
.full-width { width: 100%; justify-content: center; }
.text-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: 14px; text-align: center; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }

.profile-card { padding: 32px; margin-bottom: 24px; }
.profile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.profile-header h2 { font-size: 24px; margin-bottom: 8px; }
.profile-meta p { margin: 4px 0; color: #475569; font-size: 14px; }

.btn { padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; border: none; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.badge { padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; }
.status-approved { background: #dcfce7; color: #166534; }
</style>
