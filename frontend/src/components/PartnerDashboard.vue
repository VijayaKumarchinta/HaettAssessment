<template>
  <div class="card">
    <h2>Partner Dashboard</h2>

    <div class="grid">
      <div class="card">
        <h3>{{ codes.length }}</h3>
        <p>Total Codes</p>
      </div>

      <div class="card">
        <h3>{{ totalUses }}</h3>
        <p>Total Uses</p>
      </div>

      <div class="card">
        <h3>₹{{ totalDiscount }}</h3>
        <p>Total Discount Given</p>
      </div>
    </div>

    <div v-if="codes.length === 0" class="card">
      <h3>No Codes Assigned</h3>
      <p>No discount codes have been assigned yet.</p>
    </div>

    <div v-for="code in codes" :key="code.id" class="card">
      <h3>{{ code.code }}</h3>

      <p>
        Discount:
        {{ code.discount_value }}%
      </p>

      <p>
        Uses:
        {{ code.usage_count || 0 }}
      </p>

      <p>
        Expiry:
        {{ code.expiry_date || "No Expiry" }}
      </p>

      <p>
        <span
          :class="
            code.is_active ? 'badge badge-approved' : 'badge badge-rejected'
          "
        >
          {{ code.is_active ? "ACTIVE" : "INACTIVE" }}
        </span>
      </p>

      <button class="btn btn-primary" @click="copyCode(code.code)">
        Copy Code
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  codes: {
    type: Array,
    default: () => [],
  },
});

const totalUses = computed(() =>
  (props.codes || []).reduce((a, c) => a + (c.usage_count || 0), 0),
);

const totalDiscount = computed(() =>
  (props.codes || []).reduce((a, c) => a + (c.total_discount_given || 0), 0),
);

function copyCode(code) {
  navigator.clipboard.writeText(code);
  alert("Code copied");
}
</script>
