<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="search-wrapper">
    <svg class="icon" viewBox="0 0 20 20" fill="none">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <input
      type="search"
      class="search"
      :value="modelValue"
      :placeholder="placeholder ?? 'Search Pokémon…'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.search-wrapper {
  position: relative;
  width: 100%;
}

.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-muted);
  pointer-events: none;
}

.search {
  width: 100%;
  padding: 9px 12px 9px 36px;
  background: var(--color-surface-1);
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-text);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.search::placeholder {
  color: var(--color-muted);
}

.search:focus {
  border-color: var(--color-primary);
}

.search::-webkit-search-cancel-button {
  cursor: pointer;
}
</style>
