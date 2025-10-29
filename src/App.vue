<template>
  <div id="app">
    <img :src="logo" alt="smarty logo" width="268" height="75"/>
    <Autocomplete/>
  </div>
</template>

<script>
import Autocomplete from './components/Autocomplete.vue'

export default {
  name: 'App',
  components: {
    Autocomplete
  },
  data() {
    return {
      logo: new URL('./assets/smarty-logo-blue.png', import.meta.url).href
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
