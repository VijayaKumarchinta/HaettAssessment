<script setup>
import { computed } from "vue";

const props = defineProps({
  codes: Array,
});

const totalUses = computed(() =>
  props.codes.reduce((a, c) => a + (c.usage_count || 0), 0),
);

const totalDiscount = computed(() =>
  props.codes.reduce((a, c) => a + (c.total_discount_given || 0), 0),
);

function copyCode(code) {
  navigator.clipboard.writeText(code);
  alert("Code copied");
}
</script>
