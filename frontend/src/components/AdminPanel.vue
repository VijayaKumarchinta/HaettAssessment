<template>
  <div class="card">
    <h2>Admin Dashboard</h2>

    <div class="grid">
      <div class="card">
        <h3>{{ summary.pending }}</h3>
        <p>Pending</p>
      </div>

      <div class="card">
        <h3>{{ summary.approved }}</h3>
        <p>Approved</p>
      </div>

      <div class="card">
        <h3>{{ summary.rejected }}</h3>
        <p>Rejected</p>
      </div>

      <div class="card">
        <h3>{{ summary.total }}</h3>
        <p>Total</p>
      </div>
    </div>

    <div style="margin-bottom: 20px">
      <button class="btn btn-secondary" @click="changeFilter('ALL')">
        All ({{ summary.total }})
      </button>

      <button
        class="btn btn-secondary"
        @click="changeFilter('PENDING')"
        style="margin-left: 10px"
      >
        Pending ({{ summary.pending }})
      </button>

      <button
        class="btn btn-secondary"
        @click="changeFilter('APPROVED')"
        style="margin-left: 10px"
      >
        Approved ({{ summary.approved }})
      </button>

      <button
        class="btn btn-secondary"
        @click="changeFilter('REJECTED')"
        style="margin-left: 10px"
      >
        Rejected ({{ summary.rejected }})
      </button>
    </div>
  </div>

  <div v-for="app in applications" :key="app.id" class="card">
    <h3>{{ app.business_name }}</h3>

    <p>
      Partner Type:
      {{ app.partner_type }}
    </p>

    <div style="margin: 15px 0">
      <strong>Status:</strong>
      <span
        style="margin-left: 10px"
        :class="
          app.status === 'APPROVED'
            ? 'badge badge-approved'
            : app.status === 'REJECTED'
              ? 'badge badge-rejected'
              : 'badge badge-pending'
        "
      >
        {{ app.status }}
      </span>
    </div>

    <div v-if="app.status === 'PENDING'">
      <button class="btn btn-success" @click="approve(app.id)">Approve</button>

      <button
        class="btn btn-danger"
        style="margin-left: 10px"
        @click="rejectingId = app.id"
      >
        Reject
      </button>

      <div v-if="rejectingId === app.id" style="margin-top: 15px">
        <textarea v-model="rejectReason" placeholder="Enter rejection reason" />

        <button
          class="btn btn-danger"
          :disabled="!rejectReason.trim()"
          @click="confirmReject(app.id)"
        >
          Confirm Reject
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import api from "../services/api";

const applications = ref([]);
const filter = ref("ALL");
const rejectingId = ref(null);
const rejectReason = ref("");

const summary = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0,
});

async function load() {
  const apps = await api.get(`/admin/applications?status=${filter.value}`);

  applications.value = apps.data;

  const counts = await api.get("/admin/summary");

  summary.value = counts.data;
}

async function changeFilter(status) {
  filter.value = status;
  await load();
}

async function approve(id) {
  await api.post(`/admin/applications/${id}/approve`);
  toast("Application Approved");
  await load();
}

async function confirmReject(id) {
  if (!rejectReason.value.trim()) return;

  await api.post(`/admin/applications/${id}/reject`, {
    reason: rejectReason.value,
  });

  toast("Application Rejected");

  rejectReason.value = "";
  rejectingId.value = null;

  await load();
}

function toast(message) {
  alert(message);
}

onMounted(load);
</script>
