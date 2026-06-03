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
  </div>

  <div v-for="app in applications" :key="app.id" class="card">
    <h3>{{ app.business_name }}</h3>

    <p>
      Partner Type:
      {{ app.partner_type }}
    </p>

    <p>
      Status:

      <span
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
    </p>

    <div v-if="app.status === 'PENDING'">
      <button class="btn btn-success" @click="approve(app.id)">Approve</button>

      <button
        class="btn btn-danger"
        style="margin-left: 10px"
        @click="reject(app.id)"
      >
        Reject
      </button>
    </div>

    <div v-else>
      <span class="badge badge-approved"> Processed </span>
    </div>

    <span
      style="
        padding: 8px 14px;
        background: #e5e7eb;
        border-radius: 6px;
        font-weight: bold;
      "
    >
      Processed
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import api from "../services/api";

const applications = ref([]);

const summary = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0,
});

async function load() {
  const apps = await api.get("/admin/applications");

  applications.value = apps.data;

  const counts = await api.get("/admin/summary");

  summary.value = counts.data;
}

async function approve(id) {
  await api.post(`/admin/applications/${id}/approve`);

  await load();
}

async function reject(id) {
  const reason = prompt("Reason");

  if (!reason) return;

  await api.post(`/admin/applications/${id}/reject`, {
    reason,
  });

  await load();
}

onMounted(load);
</script>
