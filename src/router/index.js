import Vue from "vue";
import VueRouter from "vue-router";
import index from "@/views/index.vue";
import manage from "@/views/manage.vue";
import jsonPreview from "@/views/jsonPreview.vue";

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
  {
    path: "/json-preview",
    name: "jsonPreview",
    component: jsonPreview,
  },
];

const router = new VueRouter({
  routes,
  base: "/y8sq",
  // mode: "history",
});

export default router;
