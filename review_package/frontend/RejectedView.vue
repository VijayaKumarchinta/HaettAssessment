<template>
  <div>
    <h2>Application Rejected</h2>

    <p>
      Reason:
      {{ application.rejection_reason }}
    </p>

    <button @click="$emit('reapply')">
      Reapply
    </button>
  </div>
</template>

<script setup>
defineProps({
  application: Object,
});
</script>