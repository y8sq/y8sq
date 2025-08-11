import Vue from "vue";
import VueRouter from "vue-router";
import index from "@/views/index.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "index",
    component: index,
  },
];

const router = new VueRouter({
  routes,
  base: "/y8sq",
  mode: "history",
});

export default router;
