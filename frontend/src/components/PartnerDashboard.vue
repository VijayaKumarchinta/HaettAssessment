<template>
  <div class="card">
    <h2>Partner Dashboard</h2>

    <div v-for="code in codes" :key="code.id" class="card">
      <h3>{{ code.code }}</h3>

      <p>
        Discount:
        <strong> {{ code.discount_value }}% </strong>
      </p>

      <p>
        Status:

        <span
          :class="
            code.is_active ? 'badge badge-approved' : 'badge badge-rejected'
          "
        >
          {{ code.is_active ? "ACTIVE" : "INACTIVE" }}
        </span>
      </p>

      <br />

      <button class="btn btn-primary" @click="copyCode(code.code)">
        Copy Code
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  codes: Array,
});

function copyCode(code) {
  navigator.clipboard.writeText(code);

  alert("Code copied");
}
</script>
