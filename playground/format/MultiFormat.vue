<template>
  <p>This is MultiFormat</p>
</template>

<i18n lang="json">
{
  "en": {
    "title": "The application"
  },
  "ja": {
    "title": "アプリケーション"
  }
}
</i18n>

<script>
export default {
  name: 'MultiFormat'
}
</script>

<i18n lang="yaml">
  en:
    login: "login"
  ja:
    login: "ログイン"
</i18n>

<style scoped>
#app {
  color: red;
}
</style>

<i18n lang="json5">{en:
     { login: "login" },
  ja: {
    login: "ログイン" }}
</i18n>
