import Vue from 'vue'
import VCalendar from 'v-calendar'
import Notifications from 'vue-notification'
import App from './App.vue'
import vSelect from 'vue-select'

Vue.component('vselect', vSelect)
Vue.config.productionTip = false
Vue.use(VCalendar)
Vue.use(Notifications)

new Vue({
  render: (h) => h(App)
}).$mount('#app')
