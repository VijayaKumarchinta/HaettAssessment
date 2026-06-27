<template>
  <div>
    <div class="card admin-header">
      <h2>Admin Dashboard</h2>
      <div class="summary-grid" role="list" aria-label="Application summary">
        <div class="summary-card" role="listitem">
          <span class="summary-num">{{ summary.pending }}</span>
          <span class="summary-label">Pending</span>
        </div>
        <div class="summary-card" role="listitem">
          <span class="summary-num">{{ summary.approved }}</span>
          <span class="summary-label">Approved</span>
        </div>
        <div class="summary-card" role="listitem">
          <span class="summary-num">{{ summary.rejected }}</span>
          <span class="summary-label">Rejected</span>
        </div>
        <div class="summary-card" role="listitem">
          <span class="summary-num">{{ summary.total }}</span>
          <span class="summary-label">Total</span>
        </div>
      </div>

      <label for="admin-search" class="sr-only">Search applications by business name</label>
      <input id="admin-search" v-model="search" @input="debouncedLoad" placeholder="Search by business name…" class="search-box" />

      <div class="filter-tabs" role="tablist" aria-label="Filter applications by status">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-btn', filter === tab.value ? 'tab-active' : '']"
          @click="changeFilter(tab.value)"
          role="tab"
          :aria-selected="filter === tab.value"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span> Loading applications…
    </div>

    <div v-else-if="applications.length === 0" class="empty-admin" role="status">
      No applications found.
    </div>

    <div v-for="app in applications" :key="app.id" class="card app-card" :aria-label="`Application: ${app.business_name}`">
      <div class="app-header">
        <div>
          <h3>{{ app.business_name }}</h3>
          <span :class="`badge badge-${app.status.toLowerCase()}`">{{ app.status }}</span>
        </div>
        <span class="partner-type-badge">{{ app.partner_type }}</span>
      </div>

      <div class="app-details" role="list" aria-label="Application details">
        <div class="detail-row" role="listitem"><span>Name</span><span>{{ app.user_name || app.user?.name || "N/A" }}</span></div>
        <div class="detail-row" role="listitem"><span>Email</span><span>{{ app.user_email || app.user?.email || "N/A" }}</span></div>
        <div class="detail-row" role="listitem" v-if="app.website"><span>Website</span><a :href="app.website" target="_blank" rel="noopener noreferrer">{{ app.website }}</a></div>
        <div class="detail-row" role="listitem" v-if="app.audience_size"><span>Audience Size</span><span>{{ Number(app.audience_size).toLocaleString() }}</span></div>
        <div class="detail-row" role="listitem" v-if="app.description"><span>Description</span><span>{{ app.description }}</span></div>
      </div>

      <!-- Pending actions -->
      <div v-if="app.status === 'PENDING'" class="app-actions">
        <button class="btn btn-success" @click="approve(app.id)" :disabled="actionLoading === app.id" aria-label="Approve application">
          <span aria-hidden="true">✅</span> Approve
        </button>
        <button class="btn btn-danger" @click="startReject(app.id)" aria-label="Reject application">
          <span aria-hidden="true">❌</span> Reject
        </button>

        <div v-if="rejectingId === app.id" class="reject-form" role="region" aria-label="Rejection reason">
          <label for="reject-reason" class="sr-only">Reason for rejection</label>
          <textarea
            id="reject-reason"
            v-model="rejectReason"
            placeholder="Enter a reason for rejection (required)…"
            rows="3"
            aria-required="true"
          />
          <div class="reject-actions">
            <button
              class="btn btn-danger"
              :disabled="!rejectReason.trim() || actionLoading === app.id"
              @click="confirmReject(app.id)"
              aria-label="Confirm rejection"
            >
              Confirm Reject
            </button>
            <button class="btn btn-secondary" @click="rejectingId = null" aria-label="Cancel rejection">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Approved: show code toggles -->
      <div v-if="app.status === 'APPROVED'" class="codes-section" role="region" :aria-label="`Discount codes for ${app.business_name}`">
        <h4>Discount Codes</h4>

        <div v-if="codesLoading[app.id]" class="codes-loading" role="status" aria-live="polite">Loading codes…</div>

        <div v-else-if="!appCodes[app.id] || appCodes[app.id].length === 0" class="codes-empty" role="status">
          No codes assigned to this partner yet.
        </div>

        <div v-else class="table-responsive">
          <table class="codes-mini-table" :aria-label="`Discount codes for ${app.business_name}`">
            <thead>
              <tr><th scope="col">Code</th><th scope="col">Discount</th><th scope="col">Uses</th><th scope="col">Status</th><th scope="col">Toggle</th></tr>
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
                    :aria-label="`${code.is_active ? 'Deactivate' : 'Activate'} code ${code.code}`"
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
.admin-header { padding: clamp(24px, 4vw, 32px); margin-bottom: 24px; }
.admin-header h2 { font-size: clamp(20px, 3.5vw, 24px); margin-bottom: 20px; }
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: clamp(12px, 2vw, 16px);
  margin-bottom: 20px;
}
.summary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: clamp(12px, 2vw, 16px);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-num { font-size: clamp(22px, 4vw, 28px); font-weight: 700; color: #0f172a; }
.summary-label { font-size: clamp(12px, 1.5vw, 13px); color: #64748b; }
.search-box {
  width: 100%;
  padding: clamp(10px, 2vw, 12px) clamp(14px, 2vw, 16px);
  border-radius: var(--radius-input);
  border: 1px solid var(--border);
  font-size: clamp(14px, 2vw, 15px);
  outline: none;
  margin-bottom: 16px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-box:focus { border-color: var(--primary); }
.filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: clamp(13px, 2vw, 14px);
  transition: all 0.2s;
  font-weight: 500;
}
.tab-btn:hover:not(.tab-active) { background: #f8fafc; border-color: #cbd5e1; }
.tab-active { background: #ff6b35; color: white; border-color: #ff6b35; }
.app-card { padding: clamp(20px, 3.5vw, 28px); margin-bottom: 16px; }
.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}
.app-header h3 { font-size: clamp(16px, 2.5vw, 18px); margin-bottom: 6px; }
.partner-type-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: clamp(12px, 1.5vw, 13px);
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
.app-details { margin-bottom: 16px; }
.detail-row {
  display: flex;
  gap: clamp(12px, 2vw, 16px);
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: clamp(13px, 2vw, 14px);
  flex-wrap: wrap;
}
.detail-row span:first-child { color: #94a3b8; min-width: 100px; font-weight: 500; flex-shrink: 0; }
.detail-row a { color: #ff6b35; text-decoration: none; word-break: break-all; }
.app-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; margin-top: 16px; }
.reject-form { width: 100%; margin-top: 12px; }
.reject-form textarea {
  width: 100%;
  padding: clamp(10px, 2vw, 12px);
  border-radius: var(--radius-input);
  border: 1px solid #fca5a5;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}
.reject-form textarea:focus { border-color: #ef4444; }
.reject-actions { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.codes-section { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
.codes-section h4 { font-size: clamp(14px, 2vw, 15px); margin-bottom: 12px; color: #374151; }
.codes-loading { color: #94a3b8; font-size: 13px; }
.codes-empty { color: #94a3b8; font-size: 13px; font-style: italic; }
.codes-mini-table { width: 100%; border-collapse: collapse; font-size: clamp(12px, 1.5vw, 13px); min-width: 450px; }
.codes-mini-table th { background: #f8fafc; padding: 10px 12px; text-align: left; color: #64748b; }
.codes-mini-table td { padding: 10px 12px; border-top: 1px solid #e2e8f0; }
.mono { font-family: monospace; font-weight: 600; }
.loading-state { display: flex; align-items: center; gap: 10px; text-align: center; padding: 40px; color: #94a3b8; justify-content: center; font-size: 14px; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid #e2e8f0;
  border-top-color: #ff6b35;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-admin { text-align: center; padding: clamp(32px, 6vw, 60px) clamp(24px, 4vw, 40px); color: #94a3b8; background: white; border-radius: 16px; font-size: 14px; }
.small-btn { padding: 6px 12px; font-size: 12px; }
.btn { padding: clamp(8px, 1.5vw, 10px) clamp(16px, 2.5vw, 20px); border-radius: 10px; cursor: pointer; font-size: clamp(13px, 2vw, 14px); font-weight: 600; border: none; transition: background 0.2s; }
.btn-success { background: #dcfce7; color: #166534; }
.btn-success:hover:not(:disabled) { background: #bbf7d0; }
.btn-danger { background: #fee2e2; color: #991b1b; }
.btn-danger:hover:not(:disabled) { background: #fecaca; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge-approved { background: #dcfce7; color: #166534; }
.badge-pending { background: #dbeafe; color: #1d4ed8; }
.badge-rejected { background: #fee2e2; color: #991b1b; }
.status-approved { background: #dcfce7; color: #166534; }
.status-rejected { background: #fee2e2; color: #991b1b; }

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
</style>
