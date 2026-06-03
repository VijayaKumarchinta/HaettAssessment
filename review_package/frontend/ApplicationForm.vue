<template>
  <form @submit.prevent="submitForm">
    <h2>Partner Application</h2>

    <input
      v-model="form.business_name"
      placeholder="Business Name"
    />

    <select v-model="form.partner_type">
      <option value="">
        Select Partner Type
      </option>

      <option>Affiliate</option>
      <option>Influencer</option>
      <option>Gym</option>
      <option>Corporate</option>
      <option>Partner Associate</option>
    </select>

    <input
      v-model="form.phone"
      placeholder="Phone"
    />

    <input
      v-model="form.website"
      placeholder="Website"
    />

    <input
      v-model="form.audience_size"
      placeholder="Audience Size"
      type="number"
    />

    <textarea
      v-model="form.description"
      placeholder="Description"
    />

    <button
      :disabled="
        !form.partner_type ||
        !form.business_name
      "
    >
      Submit
    </button>
  </form>
</template>

<script setup>
import { reactive } from "vue";

const emit = defineEmits(["submit"]);

const form = reactive({
  partner_type: "",
  business_name: "",
  phone: "",
  website: "",
  audience_size: "",
  description: "",
});

function submitForm() {
  emit("submit", { ...form });
}
</script>