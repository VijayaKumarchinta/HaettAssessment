<template>
  <div class="card pending-card">
    <div class="pending-icon">⏳</div>
    <h2>Application Under Review</h2>
    <span class="badge status-pending">UNDER REVIEW</span>
    <p class="pending-msg">
      Your application was submitted on <strong>{{ formattedDate }}</strong>.
      We'll review it shortly and get back to you within a few business days.
    </p>
    <p class="pending-hint">No action needed from your side — sit tight!</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({ application: Object });

const formattedDate = computed(() => {
  const d = props.application?.applied_at || props.application?.created_at;
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
});
</script>

<style scoped>
.pending-card {
  padding: 60px 40px;
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.pending-icon { font-size: 52px; }
.pending-card h2 { font-size: 24px; }
.pending-msg { color: #475569; line-height: 1.7; max-width: 400px; }
.pending-hint { color: #94a3b8; font-size: 14px; }
</style>
