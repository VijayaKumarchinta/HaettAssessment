<template>
  <div class="card form-card">
    <h2>Partner Application</h2>
    <p class="form-sub">Fill in your details to join the Haett Partner Programme</p>

    <div class="form-group">
      <label>Partner Type <span class="required">*</span></label>
      <select v-model="form.partner_type" class="form-input">
        <option value="">Select Partner Type</option>
        <option value="AFFILIATE">Affiliate</option>
        <option value="INFLUENCER">Influencer</option>
        <option value="GYM">Gym</option>
        <option value="CORPORATE">Corporate</option>
        <option value="PARTNER_ASSOCIATE">Partner Associate</option>
      </select>
    </div>

    <div class="form-group">
      <label>Business / Brand Name <span class="required">*</span></label>
      <input v-model="form.business_name" placeholder="e.g. Tech Channel" class="form-input" />
    </div>

    <div class="form-group">
      <label>Contact Phone <span class="optional">(optional)</span></label>
      <input v-model="form.phone" placeholder="+91 98765 43210" class="form-input" />
    </div>

    <div class="form-group">
      <label>Website / Social Link <span class="optional">(optional)</span></label>
      <input v-model="form.website" placeholder="https://youtube.com/yourchannel" class="form-input" />
    </div>

    <div class="form-group">
      <label>Audience Size <span class="optional">(optional)</span></label>
      <input v-model="form.audience_size" placeholder="e.g. 50000" type="number" class="form-input" />
    </div>

    <div class="form-group">
      <label>Description <span class="optional">(optional, max 500 chars)</span></label>
      <textarea
        v-model="form.description"
        placeholder="Tell us about yourself and your audience"
        maxlength="500"
        rows="4"
        class="form-input"
      />
      <span class="char-count">{{ form.description.length }}/500</span>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>

    <button
      class="primary-btn"
      :disabled="!form.partner_type || !form.business_name.trim() || submitting"
      @click="submitForm"
    >
      {{ submitting ? "Submitting…" : "Submit Application" }}
    </button>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import api from "../services/api";

const props = defineProps({
  clearOnMount: { type: Boolean, default: false },
});

const emit = defineEmits(["submitted"]);

const form = reactive({
  partner_type: "",
  business_name: "",
  phone: "",
  website: "",
  audience_size: "",
  description: "",
});

const error = ref("");
const submitting = ref(false);

// Always clear when mounted — handles both first apply AND reapply
onMounted(() => {
  form.partner_type = "";
  form.business_name = "";
  form.phone = "";
  form.website = "";
  form.audience_size = "";
  form.description = "";
  error.value = "";
});

async function submitForm() {
  error.value = "";
  submitting.value = true;
  try {
    await api.post("/partner/apply", { ...form });
    emit("submitted");
  } catch (e) {
    error.value = e?.response?.data?.detail || "Submission failed. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.form-card { padding: 40px; max-width: 620px; margin: 0 auto; }
.form-card h2 { font-size: 24px; margin-bottom: 6px; }
.form-sub { color: #64748b; margin-bottom: 28px; }
.form-group { display: flex; flex-direction: column; margin-bottom: 18px; gap: 6px; }
.form-group label { font-weight: 600; font-size: 14px; color: #374151; }
.form-input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  transition: border 0.2s;
}
.form-input:focus { border-color: #ff6b35; }
textarea.form-input { resize: vertical; }
.required { color: #ef4444; }
.optional { color: #94a3b8; font-weight: 400; }
.char-count { font-size: 12px; color: #94a3b8; text-align: right; }
.error-msg { color: #ef4444; font-size: 13px; margin-bottom: 10px; }
.primary-btn { padding: 13px 28px; font-size: 15px; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
</style>
