<template>
  <p>This is Nested resources</p>
</template>

<script>
export default {
  name: 'App'
}
</script>

<i18n lang="json" global>
{
  "en": {
    "title": "The application",
    "menu": {
      "sub2": "this is sub2 placeholder",
      "sub1": {
        "menu1": "menu 1",
        "menu2": {
          "menu2": "this is sub menu2",
          "menu1": "this is sub menu1",
          "1menu": "this is sub 1menu"
        }
      },
      "sub3": "this is sub3 placeholder",
      "sub4": {
        "menu10": "menu 10",
        "menu1": {
          "menu1": "this is sub menu1",
          "menu2": "this is sub menu2"
        },
        "0menu": "this is sub 0menu"
      }
    },
    "footer": "this is footer placeholder"
  }
}
</i18n>

<style scoped>
#app {
  color: red;
}
</style>
