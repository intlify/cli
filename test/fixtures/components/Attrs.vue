<template>
  <p>This is Attrs component</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<i18n>
{
  ja: {
    hello: "hello"
  }
}
</i18n>
