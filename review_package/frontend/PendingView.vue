<template>
  <div>
    <h2>Application Under Review</h2>

    <p>
      Applied:
      {{ application.applied_at }}
    </p>

    <p>
      We will review your application shortly.
    </p>
  </div>
</template>

<script setup>
defineProps({
  application: Object,
});
</script>