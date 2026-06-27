<template>
  <div class="card form-card">
    <h2 id="form-title">Partner Application</h2>
    <p class="form-sub">Fill in your details to join the Haett Partner Programme</p>

    <form novalidate @submit.prevent="submitForm" aria-labelledby="form-title">
      <div class="form-group">
        <label for="partner-type">Partner Type <span class="required" aria-hidden="true">*</span><span class="sr-only">required</span></label>
        <select id="partner-type" v-model="form.partner_type" class="form-input" aria-required="true" :aria-invalid="!!error && !form.partner_type">
          <option value="">Select Partner Type</option>
          <option value="AFFILIATE">Affiliate</option>
          <option value="INFLUENCER">Influencer</option>
          <option value="GYM">Gym</option>
          <option value="CORPORATE">Corporate</option>
          <option value="PARTNER_ASSOCIATE">Partner Associate</option>
        </select>
      </div>

      <div class="form-group">
        <label for="business-name">Business / Brand Name <span class="required" aria-hidden="true">*</span><span class="sr-only">required</span></label>
        <input id="business-name" v-model="form.business_name" placeholder="e.g. Tech Channel" class="form-input" aria-required="true" :aria-invalid="!!error && !form.business_name.trim()" />
      </div>

      <div class="form-group">
        <label for="phone">Contact Phone <span class="optional">(optional)</span></label>
        <input id="phone" v-model="form.phone" placeholder="+91 98765 43210" class="form-input" type="tel" />
      </div>

      <div class="form-group">
        <label for="website">Website / Social Link <span class="optional">(optional)</span></label>
        <input id="website" v-model="form.website" placeholder="https://youtube.com/yourchannel" class="form-input" type="url" />
      </div>

      <div class="form-group">
        <label for="audience-size">Audience Size <span class="optional">(optional)</span></label>
        <input id="audience-size" v-model="form.audience_size" placeholder="e.g. 50000" type="number" class="form-input" />
      </div>

      <div class="form-group">
        <label for="description">Description <span class="optional">(optional, max 500 chars)</span></label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Tell us about yourself and your audience"
          maxlength="500"
          rows="4"
          class="form-input"
          aria-describedby="char-count"
        />
        <span id="char-count" class="char-count" role="status" aria-live="polite">{{ form.description.length }}/500</span>
      </div>

      <p v-if="error" class="error-msg" role="alert" aria-live="assertive">{{ error }}</p>

      <button
        class="primary-btn"
        :disabled="!form.partner_type || !form.business_name.trim() || submitting"
        type="submit"
        aria-busy="submitting"
      >
        {{ submitting ? "Submitting…" : "Submit Application" }}
      </button>
    </form>
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
.form-card { padding: clamp(24px, 4vw, 40px); max-width: 620px; margin: 0 auto; width: 100%; }
.form-card h2 { font-size: clamp(20px, 3.5vw, 24px); margin-bottom: 6px; }
.form-sub { color: #64748b; margin-bottom: clamp(20px, 3vw, 28px); font-size: clamp(13px, 2vw, 15px); }
.form-group { display: flex; flex-direction: column; margin-bottom: 18px; gap: 6px; }
.form-group label { font-weight: 600; font-size: 14px; color: #374151; }
.form-input {
  padding: clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px);
  border-radius: var(--radius-input);
  border: 1px solid var(--border);
  font-size: clamp(14px, 2vw, 15px);
  outline: none;
  font-family: inherit;
  transition: border 0.2s, box-shadow 0.2s;
}
.form-input:focus { border-color: var(--primary); }
textarea.form-input { resize: vertical; min-height: 100px; }
.required { color: #ef4444; }
.optional { color: #94a3b8; font-weight: 400; }
.char-count { font-size: 12px; color: #94a3b8; text-align: right; }
.error-msg { color: #ef4444; font-size: 13px; margin-bottom: 10px; padding: 10px 14px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; }
.primary-btn { padding: clamp(12px, 2vw, 13px) clamp(24px, 4vw, 28px); font-size: clamp(14px, 2vw, 15px); width: 100%; justify-content: center; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
