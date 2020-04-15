import Vue from 'vue'
import App from './App.vue'
import VCalendar from 'v-calendar'
import Notifications from 'vue-notification'

Vue.config.productionTip = false
Vue.use(VCalendar)
Vue.use(Notifications)

new Vue({
  render: h => h(App),
}).$mount('#app')
