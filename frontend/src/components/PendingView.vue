<template>
  <div class="card">
    <h2>Application Under Review</h2>

    <p>
      <span class="badge badge-pending"> UNDER REVIEW </span>
    </p>

    <p>
      Applied:
      {{ application?.applied_at }}
    </p>

    <p>You will hear back within a few business days.</p>
  </div>
</template>

<script setup>
defineProps({
  application: Object,
});
</script>
