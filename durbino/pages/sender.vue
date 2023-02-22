<template>
  <div>
    <div class="header bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80">
      دوربینو<br /><span class="roomST"
        >شناسه اتاق: <span id="roomid">{{ code }}</span>
      </span>
    </div>

    <div class="local-video">
      <video
        ref="video"
        autoplay
        playsinline
        muted
        :srcObject="videoStream"
      ></video>
    </div>
    <div class="input">
      <label for="camera">دوربین</label>
      <select
        style="width: 70%; margin-left: 10%" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        id="camera"
        v-model="selectedCamera"
      >
        <option
          v-for="camera in cameras"
          :key="camera.deviceId"
          :value="camera.deviceId"
        >
          {{ camera.label || `Camera` }}
        </option>
      </select>
    </div>
    <div class="input">
      <label for="camera">میکروفون</label>
      <select
        style="width: 70%; margin-left: 10%" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        id="camera"
        v-model="selectedMicrophone"
      >
        <option
          v-for="microphone in microphones"
          :key="microphone.deviceId"
          :value="microphone.deviceId"
        >
          {{ microphone.label || `Microphone` }}
        </option>
      </select>
    </div>
    <button onclick="leave()" class="btn text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">
  <span class="btn2 ">
      خروج
  </span>
</button>
    <!-- <div class="btn" onclick="leave()">خروج</div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      cameras: [],
      selectedCamera: null,
      videoStream: null,
      microphones: [],
      selectedMicrophone: null,
      code: new URLSearchParams(window.location.search).get('roomID'),
    }
  },
  mounted() {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const cameras = devices.filter((device) => device.kind === 'videoinput')
        this.cameras = cameras
        if (cameras.length > 0) {
          this.selectedCamera = cameras[0].deviceId
        }
        const Audio = devices.filter((device) => device.kind === 'audioinput')
        this.microphones = Audio
        if (Audio.length > 0) {
          this.selectedMicrophone = Audio[0].deviceId
        }
      })
      .catch((error) => {
        console.error('Error getting camera list:', error)
      })
  },
  watch: {
    selectedCamera(newCamera) {
      // this.startVideo(newCamera)
    },
    selectedMicrophone(newCamera) {
      // this.startVideo(newCamera)
    },
  },
  methods: {
    async startVideo(deviceId) {
      const constraints = {
        audio: {
          deviceId: this.selectedMicrophone,
          volume: 0,
        },
        video: {
          deviceId: this.selectedCamera,
        },
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.videoStream = stream
        this.$refs.video.srcObject = stream
      } catch (error) {
        console.error('Error starting video stream:', error)
      }
    },
  },
  beforeDestroy() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop())
    }
  },
}
</script>

<style>
video {
  width: 100%;
  height: 100%;
}
@font-face {
  font-family: IRANSans;
  src: url('~/static/fonts/IRANSans.ttf');
}
label{
  color: #ffffff;
}
:root {
  --height_top: 65%;
}
html {
  overscroll-behavior-x: none;
  height: 100%;
  max-width: 523px;
  margin: 0 auto;
}
body {
  overscroll-behavior-x: none;
  height: 100%;
  max-width: 523px;
  margin: 0 auto;
  direction: rtl;
  padding: 0;
  margin: 0;
  font-family: IRANSans !important;
  background-color:#252b38;
}
.local-video {
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  display: block;
  margin-top: 2%;
  border-radius: 15px;
}
.header {
  /* background-color: #2c6eff; */
  text-align: center;
  padding: 2% 0 2% 0;
  border-radius: 0px 0px 10px 10px;
  color: #ffffff;
  font-size: 18px;
  line-height: 150%;
}
.roomST {
  font-size: 15px;
}
.btn {
  /* background-color: #ff0000; */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /* padding: 3% 0; */
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  display: block;
  text-align: center;
  /* color: #ffffff; */
  /* gap: 10px; */
  /* margin-top: 3%; */
  /* border-radius: 6px; */
}
.btn2 {
  /* background-color: #ff0000; */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /* padding: 3% 0; */
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: block;
  text-align: center;
  /* color: #ffffff; */
  /* gap: 10px; */
  /* margin-top: 3%; */
  /* border-radius: 6px; */
}
.detail {
  margin-left: auto;
  margin-right: auto;
  display: block;
  width: 80%;
  padding-top: 5%;
  padding-bottom: 2%;
}
.input {
  margin-left: 10%;
  margin-right: 10%;
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: stretch;
  flex-direction: row;
  width: 80%;
  padding-top: 5%;
  padding-bottom: 2%;
}
</style>
