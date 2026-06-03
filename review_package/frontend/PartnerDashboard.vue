<template>
  <div>
    <h2>Partner Dashboard</h2>

    <div v-if="codes.length">
      <div
        v-for="code in codes"
        :key="code.id"
      >
        <p>
          {{ code.code }}
        </p>

        <p>
          {{ code.discount_value }}%
        </p>

        <p>
          {{ code.is_active ? 'Active' : 'Inactive' }}
        </p>
      </div>
    </div>

    <div v-else>
      No discount codes assigned yet.
    </div>
  </div>
</template>

<script setup>
defineProps({
  codes:Array
});
</script>