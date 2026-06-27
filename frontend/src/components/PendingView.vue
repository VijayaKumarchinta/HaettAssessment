<template>
  <div class="card pending-card" role="status" aria-live="polite">
    <div class="pending-icon" aria-hidden="true">⏳</div>
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
  padding: clamp(32px, 6vw, 60px) clamp(24px, 5vw, 40px);
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}
.pending-icon { font-size: clamp(36px, 6vw, 52px); }
.pending-card h2 { font-size: clamp(20px, 3.5vw, 24px); }
.pending-msg { color: #475569; line-height: 1.7; max-width: 400px; font-size: clamp(14px, 2vw, 15px); }
.pending-hint { color: #94a3b8; font-size: clamp(13px, 2vw, 14px); }
</style>
