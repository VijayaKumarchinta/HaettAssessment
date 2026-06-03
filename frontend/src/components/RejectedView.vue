<template>
  <div class="card">
    <h2>Application Rejected</h2>

    <p>
      <span class="badge badge-rejected"> REJECTED </span>
    </p>

    <p>
      {{ application.rejection_reason }}
    </p>

    <button class="btn btn-primary" @click="$emit('reapply')">Reapply</button>
  </div>
</template>

<script setup>
defineProps({
  application: Object,
});
</script>
