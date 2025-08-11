import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

//导入npm install moment --save
import moment from "moment";
import "./assets/css/base.css";

Vue.prototype.$moment = moment;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
