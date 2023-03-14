<template>
  <div>
    <h2>Available Cameras:</h2>
    <ul>
      <li v-for="camera in cameras" :key="camera.deviceId">
        {{ camera.label }}
        <button @click="selectCamera(camera.deviceId)">Select</button>
      </li>
    </ul>
    <h2>Video Stream:</h2>
    <video ref="video" autoplay></video>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cameras: [],
    }
  },
  async mounted() {
    this.cameras = await this.getAvailableCameras()
  },
  methods: {
    async getAvailableCameras() {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((device) => device.kind === 'videoinput')
      return cameras
    },
    async switchCameraSource() {
      const constraints = {
        audio: true,
        video: { facingMode: 'environment' },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      const video = this.$refs.video
      video.srcObject = stream
      await video.play()
    },
    selectCamera(cameraId) {
      this.selectedCameraId = cameraId
      this.switchCameraSource()
    },
  },
}
</script>
