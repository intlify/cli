<template>
  <p>This is Multi component</p>
</template>

<i18n>
{
  en: {
    // comment
    name: "Name"
  }
}
</i18n>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<i18n>
ja:
  name: 名前
</i18n>

<docs>
# Multi component
</docs>

<style>
p {
  color: blue;
}
</style>
