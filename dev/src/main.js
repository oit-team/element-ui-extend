import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { TablePage } from '@oit/element-ui-plus'

Vue.use(ElementUI)
Vue.use(TablePage, {
  setFields: () => {
    if (sessionStorage.headTitString) {
      return JSON.parse(sessionStorage.headTitString)
    }
  }
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
