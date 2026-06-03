<template>
  <div>
    <h2>Admin Panel</h2>

    <div
      v-for="app in applications"
      :key="app.id"
      style="border:1px solid #ccc;margin:10px;padding:10px;"
    >
      <p>
        {{ app.business_name }}
      </p>

      <p>
        {{ app.partner_type }}
      </p>

      <p>
        {{ app.status }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  applications:Array
});
</script>