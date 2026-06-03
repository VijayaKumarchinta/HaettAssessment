<template>
  <div class="container">
    <div v-if="auth.user" class="header">
      <div>
        <h3>
          {{ auth.user.name }}
        </h3>

        <p>
          Role:
          {{ auth.user.role }}
        </p>
      </div>

      <button class="btn btn-secondary" @click="logout">Logout</button>
    </div>

    <LandingView v-if="!auth.user" @login="showLogin = true" />

    <AdminPanel v-else-if="auth.user.role === 'ADMIN'" />

    <ApplicationForm v-else-if="!application" @submit="submitApplication" />

    <PendingView
      v-else-if="application.status === 'PENDING'"
      :application="application"
    />

    <RejectedView
      v-else-if="application.status === 'REJECTED'"
      :application="application"
      @reapply="reapply"
    />

    <PartnerDashboard
      v-else-if="application.status === 'APPROVED'"
      :codes="codes"
    />
    <div v-if="showLogin" class="login-box">
      <h3>Login</h3>

      <input v-model="email" placeholder="Email" />

      <input v-model="password" type="password" placeholder="Password" />

      <button @click="login">Login</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import api from "../services/api";

import { useAuthStore } from "../stores/auth";

import LandingView from "../components/LandingView.vue";
import ApplicationForm from "../components/ApplicationForm.vue";
import PendingView from "../components/PendingView.vue";
import RejectedView from "../components/RejectedView.vue";
import PartnerDashboard from "../components/PartnerDashboard.vue";
import AdminPanel from "../components/AdminPanel.vue";

const auth = useAuthStore();

const showLogin = ref(false);

const email = ref("");
const password = ref("");

const application = ref(null);

const codes = ref([]);

async function login() {
  await auth.login(email.value, password.value);

  await loadData();

  showLogin.value = false;
}

async function loadData() {
  try {
    const response = await api.get("/partner/application");

    application.value = response.data;
  } catch {}

  try {
    const response = await api.get("/partner/codes");

    codes.value = response.data;
  } catch {}
}

async function submitApplication(data) {
  await api.post("/partner/apply", data);

  await loadData();
}

function logout() {
  auth.logout();

  application.value = null;

  codes.value = [];

  showLogin.value = false;
}

async function reapply() {
  await api.post("/partner/reapply");

  await loadData();
}

onMounted(async () => {
  if (auth.token) {
    await auth.fetchUser();

    await loadData();
  }
});
</script>
