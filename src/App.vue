<template>
  <div class="app_box">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>
<style lang="scss" scoped>
.app_box {
  width: 100%;
  min-height: 100vh;
}
</style>
