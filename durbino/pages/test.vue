<template>
  <div>
    <button @click="shareScreen">Share Screen</button>
    <div ref="screenContainer"></div>
  </div>
</template>

<script>
export default {
  methods: {
    async shareScreen() {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      this.$refs.screenContainer.appendChild(video);
    },
  },
};
</script>
