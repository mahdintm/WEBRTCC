<template>
  <b-container class="bv-example-row">
    <b-row>
      <b-col class="header__">
        <span style="font-size: 40px"> <b>دوربینو</b> </span>
        <span class="roomST"> {{ code }} : شناسه اتاق</span>
      </b-col>
    </b-row>
    <b-row>
      <video
        ref="video"
        autoplay
        class="camera"
        playsinline
        muted
        :srcObject="videoStream"
      ></video>

      <video
        ref="ScreenStream"
        v-show="ScreenStream"
        autoplay
        playsinline
        muted
        :srcObject="ScreenStream"
      ></video>
    </b-row>
    <b-row class="input_row">
      <div class="child_input_row">
        <label style="width: 20%" for="camera">دوربین</label>
        <select style="width: 60%" id="camera" v-model="selectedCamera">
          <option
            v-for="camera in cameras"
            :key="camera.deviceId"
            :value="camera.deviceId"
          >
            {{ camera.label || `Camera` }}
          </option>
        </select>
      </div>
      <div class="child_input_row">
        <label style="width: 20%" for="camera">میکروفون</label>
        <select style="width: 60%" id="camera" v-model="selectedMicrophone">
          <option
            v-for="microphone in microphones"
            :key="microphone.deviceId"
            :value="microphone.deviceId"
          >
            {{ microphone.label || `Microphone` }}
          </option>
        </select>
      </div>
    </b-row>
    <b-row class="btns">
      <b-button v-if="!ScreenStream" @click="shareScreen" class="btn__"
        >اشتراک صفحه</b-button
      >
      <b-button @click="Exit" class="btn__" style="margin-top: 2%"
        >خروج</b-button
      >
    </b-row>
  </b-container>
</template>

<script>
import socket from '~/plugins/socket.io.js'
export default {
  data() {
    return {
      cameras: [],
      selectedCamera: null,
      videoStream: null,
      microphones: [],
      selectedMicrophone: null,
      code: null,
      peerConnection: null,
      peerConnection2: null,
      peerConnection3: null,
      peerConnection4: null,
      ScreenStream: null,
      peers: [],
      users: 0,
    }
  },
  mounted() {
    socket.emit('CreateRoom')
    socket.on('TakeRoomId', (code) => {
      this.code = code
    })
    socket.on('redirect_', (code) => {
      console.log(11)
      window.location.href = code
    })
    socket.on('newUser', this.makecall)
    socket.on('ConnectTOScreen', this.callScreen)
    socket.on('answer-made', async (data) => {
      console.log('answer-made')
      for await (const [index, element] of this.peers.entries()) {
        if (element.user == data.id) {
          return await element.RTC.camera.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          )
        }
      }
    })
    socket.on('screen-answer-made', async (data) => {
      console.log('screen-answer-made')
      for await (const [index, element] of this.peers.entries()) {
        if (element.user == data.id) {
          return await element.RTC.screen.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          )
        }
      }
    })
    const { RTCPeerConnection, RTCSessionDescription } = window
    this.peerConnection = {
      camera: new RTCPeerConnection(),
      screen: new RTCPeerConnection(),
    }
    this.peerConnection2 = {
      camera: new RTCPeerConnection(),
      screen: new RTCPeerConnection(),
    }
    this.peerConnection3 = {
      camera: new RTCPeerConnection(),
      screen: new RTCPeerConnection(),
    }
    this.peerConnection4 = {
      camera: new RTCPeerConnection(),
      screen: new RTCPeerConnection(),
    }
    this.peers.push(
      { user: null, RTC: this.peerConnection },
      { user: null, RTC: this.peerConnection2 },
      { user: null, RTC: this.peerConnection3 },
      { user: null, RTC: this.peerConnection4 }
    )
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
      this.startVideo(newCamera)
    },
    selectedMicrophone(newCamera) {
      this.startVideo(newCamera)
    },
  },
  methods: {
    async Exit() {
      socket.emit('deleteRoom')
    },
    async shareScreen() {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          this.ScreenStream = null
          socket.emit('disableShareScreen')
        })
        this.ScreenStream = stream
        this.$refs.ScreenStream.srcObject = this.ScreenStream
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection.screen.addTrack(track, stream)
          )
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection2.screen.addTrack(track, stream)
          )
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection3.screen.addTrack(track, stream)
          )
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection4.screen.addTrack(track, stream)
          )
        socket.emit('enableShareScreen')
      } catch (error) {
        console.log(error)
      }
    },
    async makecall(userid) {
      const { RTCPeerConnection, RTCSessionDescription } = window
      let b = 0
      let a = setInterval(async () => {
        b++
        if (b > 2) {
          return clearInterval(a)
        }
        for (const [index, element] of this.peers.entries()) {
          if (element.user == userid) {
            const offer = await element.RTC.camera.createOffer()
            await element.RTC.camera.setLocalDescription(
              new RTCSessionDescription(offer)
            )
            return socket.emit('call-user', { offer, to: userid })
          } else if (element.user == null) {
            this.users++
            this.peers[index]['user'] = userid
            const offer = await element.RTC.camera.createOffer()
            await element.RTC.camera.setLocalDescription(
              new RTCSessionDescription(offer)
            )
            return socket.emit('call-user', { offer, to: userid })
          }
        }
      }, 1000)
    },
    async callScreen(userid) {
      const { RTCPeerConnection, RTCSessionDescription } = window
      let b = 0
      let a = setInterval(async () => {
        b++
        if (b > 2) {
          return clearInterval(a)
        }
        for (const [index, element] of this.peers.entries()) {
          if (element.user == userid) {
            const offer = await element.RTC.screen.createOffer()
            await element.RTC.screen.setLocalDescription(
              new RTCSessionDescription(offer)
            )
            return socket.emit('screen-call-user', { offer, to: userid })
          } else if (element.user == null) {
            this.peers[index]['user'] = userid
            const offer = await element.RTC.screen.createOffer()
            await element.RTC.screen.setLocalDescription(
              new RTCSessionDescription(offer)
            )
            return socket.emit('screen-call-user', { offer, to: userid })
          }
        }
      }, 1000)
    },
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
        this.$refs.video.srcObject = this.videoStream
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection.camera.addTrack(track, stream)
          )
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection2.camera.addTrack(track, stream)
          )
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection3.camera.addTrack(track, stream)
          )
        stream
          .getTracks()
          .forEach((track) =>
            this.peerConnection4.camera.addTrack(track, stream)
          )
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
  border-radius: 15px;
}
.camera {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg); /* Safari and Chrome */
  -moz-transform: rotateY(180deg); /* Firefox */
}
@font-face {
  font-family: IRANSans;
  src: url('~/static/fonts/IRANSans.ttf');
}
body {
  background-color: #252b38;
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
.header__ {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: space-between;
  flex-wrap: nowrap;
  background-color: #2c6eff;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 30px;
  margin-bottom: 3%;
  padding-bottom: 2%;
  color: white;
}
.btns {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: space-between;
  justify-content: center;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 5%;
}
.input_row {
  color: white;
}
.child_input_row {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-around;
  flex-wrap: nowrap;
  margin-top: 2%;
}
.btn__ {
  background-color: #2c6eff;
  font-family: IRANSans !important;
}
</style>
