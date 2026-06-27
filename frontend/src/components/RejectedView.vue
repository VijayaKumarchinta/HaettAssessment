<template>
  <div class="card rejected-card" role="status" aria-live="polite">
    <div class="rejected-icon" aria-hidden="true">❌</div>
    <h2>Application Not Approved</h2>
    <span class="badge status-rejected">REJECTED</span>
    <div class="reason-box" v-if="application.rejection_reason">
      <p class="reason-label" id="rejection-reason-label">Reason from reviewer:</p>
      <p class="reason-text" aria-labelledby="rejection-reason-label">{{ application.rejection_reason }}</p>
    </div>
    <p class="rejected-hint">
      You can update your details and submit a new application below.
    </p>
    <button class="primary-btn" @click="$emit('reapply')" aria-label="Submit a new application after rejection">
      Reapply Now
    </button>
  </div>
</template>

<script setup>
defineProps({ application: Object });
defineEmits(["reapply"]);
</script>

<style scoped>
.rejected-card {
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
.rejected-icon { font-size: clamp(36px, 6vw, 52px); }
.rejected-card h2 { font-size: clamp(20px, 3.5vw, 24px); }
.reason-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: clamp(12px, 3vw, 16px) clamp(16px, 3vw, 20px);
  text-align: left;
  max-width: 400px;
  width: 100%;
}
.reason-label { font-size: 12px; font-weight: 600; color: #991b1b; margin-bottom: 6px; }
.reason-text { color: #374151; font-size: clamp(14px, 2vw, 15px); line-height: 1.6; }
.rejected-hint { color: #94a3b8; font-size: clamp(13px, 2vw, 14px); max-width: 360px; }
.primary-btn { padding: clamp(12px, 2vw, 13px) clamp(24px, 4vw, 28px); }
</style>
