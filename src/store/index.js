import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    imageTab: "",
  },
  mutations: {
    getImageTab(state, imageTab) {
      return (state.imageTab = imageTab);
    },
  },
  actions: {},
  modules: {},
});
