<template>
  <p>This is Yaml component: {{ count }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<i18n>
en:
  message: my message
</i18n>
