<template>
  <div class="card rejected-card">
    <div class="rejected-icon">❌</div>
    <h2>Application Not Approved</h2>
    <span class="badge status-rejected">REJECTED</span>
    <div class="reason-box" v-if="application.rejection_reason">
      <p class="reason-label">Reason from reviewer:</p>
      <p class="reason-text">{{ application.rejection_reason }}</p>
    </div>
    <p class="rejected-hint">
      You can update your details and submit a new application below.
    </p>
    <button class="primary-btn" @click="$emit('reapply')">Reapply Now</button>
  </div>
</template>

<script setup>
defineProps({ application: Object });
defineEmits(["reapply"]);
</script>

<style scoped>
.rejected-card {
  padding: 60px 40px;
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.rejected-icon { font-size: 52px; }
.rejected-card h2 { font-size: 24px; }
.reason-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px 20px;
  text-align: left;
  max-width: 400px;
  width: 100%;
}
.reason-label { font-size: 12px; font-weight: 600; color: #991b1b; margin-bottom: 6px; }
.reason-text { color: #374151; font-size: 15px; line-height: 1.6; }
.rejected-hint { color: #94a3b8; font-size: 14px; max-width: 360px; }
.primary-btn { padding: 13px 28px; }
</style>
