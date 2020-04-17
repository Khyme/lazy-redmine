<template>
  <div id="app">
    <Form />
    <div class="footer" />
  </div>
</template>

<script>
import Form from './components/Form.vue'

export default {
  name: 'App',
  components: {
    Form
  }
}
</script>

<style lang="scss">
@import "./main.scss";
</style>
