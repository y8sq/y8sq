import Vue from "vue";
import VueRouter from "vue-router";
import index from "@/views/index.vue";
import manage from "@/views/manage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "index",
    component: index,
  },
  {
    path: "/manage",
    name: "manage",
    component: manage,
  },
];

const router = new VueRouter({
  routes,
  base: "/y8sq",
  // mode: "history",
});

export default router;
