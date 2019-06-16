// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import { routes } from "./router/index.js";
import VueRouter from "vue-router";

Vue.config.productionTip = false;

Vue.use(VueRouter);

export const EventBus = new Vue({
  methods: {
    getVariation(variation) {
      this.$emit("variation", variation);
    }
  }
});

const router = new VueRouter({
  routes,
  mode: "history"
});

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
