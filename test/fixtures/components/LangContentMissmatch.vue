<template>
  <p>This is OptionLangContentMissmatch component</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<i18n lang="yaml">
{
  ja: {
    hello: "hello"
  }
}
</i18n>
