<template>
  <div>
    <div class="card admin-header">
      <h2>Admin Dashboard</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-num">{{ summary.pending }}</span>
          <span class="summary-label">Pending</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ summary.approved }}</span>
          <span class="summary-label">Approved</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ summary.rejected }}</span>
          <span class="summary-label">Rejected</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ summary.total }}</span>
          <span class="summary-label">Total</span>
        </div>
      </div>

      <input v-model="search" @input="debouncedLoad" placeholder="Search by business name…" class="search-box" />

      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-btn', filter === tab.value ? 'tab-active' : '']"
          @click="changeFilter(tab.value)"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="spinner"></span> Loading applications…
    </div>

    <div v-else-if="applications.length === 0" class="empty-admin">
      No applications found.
    </div>

    <div v-for="app in applications" :key="app.id" class="card app-card">
      <div class="app-header">
        <div>
          <h3>{{ app.business_name }}</h3>
          <span :class="`badge badge-${app.status.toLowerCase()}`">{{ app.status }}</span>
        </div>
        <span class="partner-type-badge">{{ app.partner_type }}</span>
      </div>

      <div class="app-details">
        <div class="detail-row"><span>Name</span><span>{{ app.user_name || app.user?.name || "N/A" }}</span></div>
        <div class="detail-row"><span>Email</span><span>{{ app.user_email || app.user?.email || "N/A" }}</span></div>
        <div class="detail-row" v-if="app.website"><span>Website</span><a :href="app.website" target="_blank">{{ app.website }}</a></div>
        <div class="detail-row" v-if="app.audience_size"><span>Audience Size</span><span>{{ Number(app.audience_size).toLocaleString() }}</span></div>
        <div class="detail-row" v-if="app.description"><span>Description</span><span>{{ app.description }}</span></div>
      </div>

      <!-- Pending actions -->
      <div v-if="app.status === 'PENDING'" class="app-actions">
        <button class="btn btn-success" @click="approve(app.id)" :disabled="actionLoading === app.id">
          ✅ Approve
        </button>
        <button class="btn btn-danger" @click="startReject(app.id)">
          ❌ Reject
        </button>

        <div v-if="rejectingId === app.id" class="reject-form">
          <textarea
            v-model="rejectReason"
            placeholder="Enter a reason for rejection (required)…"
            rows="3"
          />
          <div class="reject-actions">
            <button
              class="btn btn-danger"
              :disabled="!rejectReason.trim() || actionLoading === app.id"
              @click="confirmReject(app.id)"
            >
              Confirm Reject
            </button>
            <button class="btn btn-secondary" @click="rejectingId = null">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Approved: show code toggles -->
      <div v-if="app.status === 'APPROVED'" class="codes-section">
        <h4>Discount Codes</h4>

        <div v-if="codesLoading[app.id]" class="codes-loading">Loading codes…</div>

        <div v-else-if="!appCodes[app.id] || appCodes[app.id].length === 0" class="codes-empty">
          No codes assigned to this partner yet.
        </div>

        <table v-else class="codes-mini-table">
          <thead>
            <tr><th>Code</th><th>Discount</th><th>Uses</th><th>Status</th><th>Toggle</th></tr>
          </thead>
          <tbody>
            <tr v-for="code in appCodes[app.id]" :key="code.id">
              <td class="mono">{{ code.code }}</td>
              <td>{{ code.discount_type === 'FLAT' ? `₹${code.discount_value}` : `${code.discount_value}%` }}</td>
              <td>{{ code.usage_count ?? 0 }}</td>
              <td>
                <span :class="code.is_active ? 'badge status-approved' : 'badge status-rejected'">
                  {{ code.is_active ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </td>
              <td>
                <button
                  :class="code.is_active ? 'btn btn-danger small-btn' : 'btn btn-success small-btn'"
                  @click="toggleCode(app.id, code.id, code.is_active)"
                >
                  {{ code.is_active ? "Deactivate" : "Activate" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import api from "../services/api";

const toast = useToast();

const applications = ref([]);
const filter = ref("ALL");
const search = ref("");
const rejectingId = ref(null);
const rejectReason = ref("");
const loading = ref(false);
const actionLoading = ref(null);
// Per-application codes: { [appId]: Code[] }
const appCodes = ref({});
const codesLoading = ref({});

const summary = ref({ pending: 0, approved: 0, rejected: 0, total: 0 });

const tabs = computed(() => [
  { value: "ALL", label: "All", count: summary.value.total },
  { value: "PENDING", label: "Pending", count: summary.value.pending },
  { value: "APPROVED", label: "Approved", count: summary.value.approved },
  { value: "REJECTED", label: "Rejected", count: summary.value.rejected },
]);

let searchTimer = null;
function debouncedLoad() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(load, 300);
}

async function load() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filter.value !== "ALL") params.set("status", filter.value);
    if (search.value.trim()) params.set("search", search.value.trim());
    const res = await api.get(`/admin/applications?${params}`);
    applications.value = res.data;

    const counts = await api.get("/admin/summary");
    summary.value = counts.data;

    // Fetch codes for every approved application
    for (const app of res.data) {
      if (app.status === "APPROVED") {
        fetchCodesForApp(app.id);
      }
    }
  } catch {
    toast.error("Failed to load applications");
  } finally {
    loading.value = false;
  }
}

async function fetchCodesForApp(appId) {
  codesLoading.value[appId] = true;
  try {
    const res = await api.get(`/admin/applications/${appId}/codes`);
    appCodes.value[appId] = res.data;
  } catch {
    // Fallback: try partner codes endpoint with app id param
    try {
      const res = await api.get(`/admin/partners/${appId}/codes`);
      appCodes.value[appId] = res.data;
    } catch {
      appCodes.value[appId] = [];
    }
  } finally {
    codesLoading.value[appId] = false;
  }
}

async function changeFilter(status) {
  filter.value = status;
  await load();
}

function startReject(id) {
  rejectingId.value = id;
  rejectReason.value = "";
}

async function approve(id) {
  actionLoading.value = id;
  try {
    await api.post(`/admin/applications/${id}/approve`);
    toast.success("Application approved and discount code created!");
    await load();
  } catch (e) {
    toast.error(e?.response?.data?.detail || "Approval failed");
  } finally {
    actionLoading.value = null;
  }
}

async function confirmReject(id) {
  if (!rejectReason.value.trim()) return;
  actionLoading.value = id;
  try {
    await api.post(`/admin/applications/${id}/reject`, { reason: rejectReason.value });
    toast.success("Application rejected");
    rejectReason.value = "";
    rejectingId.value = null;
    await load();
  } catch (e) {
    toast.error(e?.response?.data?.detail || "Rejection failed");
  } finally {
    actionLoading.value = null;
  }
}

async function toggleCode(appId, codeId, isActive) {
  try {
    const action = isActive ? "deactivate" : "activate";
    await api.post(`/admin/codes/${codeId}/${action}`);
    toast.success(`Code ${isActive ? "deactivated" : "activated"}`);
    // Refresh only this app's codes
    await fetchCodesForApp(appId);
  } catch (e) {
    toast.error("Failed to toggle code");
  }
}

onMounted(load);
</script>

<style scoped>
.admin-header { padding: 32px; margin-bottom: 24px; }
.admin-header h2 { font-size: 24px; margin-bottom: 20px; }
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.summary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-num { font-size: 28px; font-weight: 700; color: #0f172a; }
.summary-label { font-size: 13px; color: #64748b; }
.search-box {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  outline: none;
  margin-bottom: 16px;
}
.search-box:focus { border-color: #ff6b35; }
.filter-tabs { display: flex; gap: 10px; flex-wrap: wrap; }
.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.tab-active { background: #ff6b35; color: white; border-color: #ff6b35; }
.app-card { padding: 28px; margin-bottom: 16px; }
.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.app-header h3 { font-size: 18px; margin-bottom: 6px; }
.partner-type-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}
.app-details { margin-bottom: 16px; }
.detail-row {
  display: flex;
  gap: 16px;
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}
.detail-row span:first-child { color: #94a3b8; min-width: 110px; font-weight: 500; }
.detail-row a { color: #ff6b35; text-decoration: none; }
.app-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; margin-top: 16px; }
.reject-form { width: 100%; margin-top: 12px; }
.reject-form textarea {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #fca5a5;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
}
.reject-actions { display: flex; gap: 10px; margin-top: 10px; }
.codes-section { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
.codes-section h4 { font-size: 15px; margin-bottom: 12px; color: #374151; }
.codes-loading { color: #94a3b8; font-size: 13px; }
.codes-empty { color: #94a3b8; font-size: 13px; font-style: italic; }
.codes-mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.codes-mini-table th { background: #f8fafc; padding: 10px 12px; text-align: left; color: #64748b; }
.codes-mini-table td { padding: 10px 12px; border-top: 1px solid #e2e8f0; }
.mono { font-family: monospace; font-weight: 600; }
.loading-state { display: flex; align-items: center; gap: 10px; text-align: center; padding: 40px; color: #94a3b8; justify-content: center; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid #e2e8f0;
  border-top-color: #ff6b35;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-admin { text-align: center; padding: 60px; color: #94a3b8; background: white; border-radius: 16px; }
.small-btn { padding: 6px 12px; font-size: 12px; }
.btn { padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; border: none; }
.btn-success { background: #dcfce7; color: #166534; }
.btn-success:hover { background: #bbf7d0; }
.btn-danger { background: #fee2e2; color: #991b1b; }
.btn-danger:hover { background: #fecaca; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge-approved { background: #dcfce7; color: #166534; }
.badge-pending { background: #dbeafe; color: #1d4ed8; }
.badge-rejected { background: #fee2e2; color: #991b1b; }
.status-approved { background: #dcfce7; color: #166534; }
.status-rejected { background: #fee2e2; color: #991b1b; }
</style>
