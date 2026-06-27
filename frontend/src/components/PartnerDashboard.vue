<template>
  <div class="card dashboard-card">
    <h2 id="analytics-title">Partner Analytics</h2>

    <div class="stats-grid" role="list" aria-label="Analytics summary">
      <div class="card stat-card" role="listitem">
        <h3>{{ codes.length }}</h3>
        <p>Total Codes</p>
      </div>
      <div class="card stat-card" role="listitem">
        <h3>{{ totalUses }}</h3>
        <p>Total Uses</p>
      </div>
      <div class="card stat-card" role="listitem">
        <h3>₹{{ totalDiscount }}</h3>
        <p>Total Discount</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="codes.length === 0" class="empty-state" role="status" aria-live="polite">
      <div class="empty-icon" aria-hidden="true">🏷️</div>
      <p>No discount codes assigned yet.</p>
      <span>Your codes will appear here once an admin assigns them.</span>
    </div>

    <!-- Codes table -->
    <div v-else class="table-responsive">
      <table aria-label="Your discount codes">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Discount</th>
            <th scope="col">Uses</th>
            <th scope="col">Status</th>
            <th scope="col">Expires</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="code in codes" :key="code.id">
            <td class="code-cell">{{ code.code }}</td>
            <td>{{ formatDiscount(code) }}</td>
            <td>{{ code.usage_count ?? 0 }}</td>
            <td>
              <span :class="code.is_active ? 'badge status-approved' : 'badge status-rejected'">
                {{ code.is_active ? "ACTIVE" : "INACTIVE" }}
              </span>
            </td>
            <td>{{ code.expires_at ? new Date(code.expires_at).toLocaleDateString() : "—" }}</td>
            <td>
              <button class="primary-btn copy-btn" @click="copyCode(code.code)" :aria-label="`Copy code ${code.code}`">
                Copy
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();

const props = defineProps({
  codes: { type: Array, default: () => [] },
});

const totalUses = computed(() =>
  (props.codes || []).reduce((a, c) => a + (c.usage_count || 0), 0),
);

const totalDiscount = computed(() =>
  (props.codes || []).reduce((a, c) => a + (c.total_discount_given || 0), 0),
);

function formatDiscount(code) {
  if (code.discount_type === "FLAT") return `₹${code.discount_value} off`;
  return `${code.discount_value}% off`;
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    toast.success(`Code copied: ${code}`);
  }).catch(() => {
    toast.error("Failed to copy code");
  });
}
</script>

<style scoped>
.dashboard-card { padding: clamp(24px, 4vw, 40px); }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: clamp(12px, 2vw, 20px);
  margin: clamp(16px, 3vw, 25px) 0;
}
.stat-card { padding: clamp(16px, 3vw, 25px); }
.stat-card h3 { font-size: clamp(22px, 4vw, 28px); font-weight: 700; margin-bottom: 4px; }
.stat-card p { color: #64748b; font-size: clamp(13px, 2vw, 14px); }
.empty-state {
  text-align: center;
  padding: clamp(32px, 6vw, 60px) clamp(16px, 3vw, 20px);
  color: #94a3b8;
}
.empty-icon { font-size: clamp(36px, 6vw, 48px); margin-bottom: 16px; }
.empty-state p { font-size: clamp(14px, 2vw, 16px); font-weight: 600; color: #475569; margin-bottom: 6px; }
.empty-state span { font-size: clamp(13px, 2vw, 14px); }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
th { background: #f8fafc; text-align: left; padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px); font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
td { padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px); border-top: 1px solid #e2e8f0; font-size: clamp(13px, 2vw, 14px); }
.code-cell { font-family: monospace; font-weight: 600; letter-spacing: 0.05em; }
.copy-btn { padding: clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px); font-size: clamp(12px, 1.5vw, 13px); }
</style>
