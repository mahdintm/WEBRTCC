<template>
  <div>
    <div
      v-show="!Lock_Phone || !Lock_Finger || !Lock_Camera"
      style="
        width: 100%;
        height: 100vh;
        background-color: black;
        z-index: 100;
        position: absolute;
      "
    >
      <div class="alwaysOnDisplay">
        <div class="Clock">{{ Clock }}</div>
        <div class="Date">{{ DateNow }}</div>
        <div
          v-show="Lock_Finger"
          @click="Lock_Finger = !Lock_Finger"
          class="FingerPrint nav_select"
        >
          <fa-icon icon="fingerprint" />
        </div>
        <div
          v-show="!Lock_Finger"
          @click="Lock_Finger = !Lock_Finger"
          class="FingerPrint nav_notselect"
        >
          <fa-icon icon="fingerprint" />
        </div>
        <div class="bottomNav">
          <div
            v-show="Lock_Camera"
            @click="Lock_Camera = !Lock_Camera"
            class="nav_select"
          >
            <fa-icon icon="camera" />
          </div>
          <div
            v-show="!Lock_Camera"
            @click="Lock_Camera = !Lock_Camera"
            class="nav_notselect"
          >
            <fa-icon icon="camera" />
          </div>
          <div
            v-show="Lock_Phone"
            @click="Lock_Phone = !Lock_Phone"
            class="nav_select"
          >
            <fa-icon icon="phone" />
          </div>
          <div
            v-show="!Lock_Phone"
            @click="Lock_Phone = !Lock_Phone"
            class="nav_notselect"
          >
            <fa-icon icon="phone" />
          </div>
        </div>
      </div>
    </div>
    <div class="topBar_Chat">
      <div class="Brandbar">
        <span @click="Exit" id="menuBTN"><fa-icon icon="arrow-left" /></span>
        <div class="chatInfo">
          <div
            style="
              width: 100%;
              padding-left: 2.5%;
              padding-right: 2.5%;
              text-align: center;
              color: white;
              font-size: 1.5rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              align-content: space-around;
              justify-content: space-between;
            "
          >
            <div id="ChatName">دوربینو</div>
            <div style="color: #999 !important; font-size: 15px" id="ChatDesc">
              <span class="roomST"> {{ code }} : شناسه اتاق</span>
            </div>
          </div>
        </div>
        <span id="SearchBTN"><fa-icon icon="ellipsis-vertical" /></span>
      </div>
    </div>

    <div
      style="
        position: fixed;
        top: 10vh;
        width: 90%;
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        place-content: space-between center;
        margin-left: 5%;
        margin-right: 5%;
      "
    >
      <div>
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
      </div>
      <div class="btns">
        <b-button v-if="!ScreenStream" @click="shareScreen" class="btn__"
          >اشتراک صفحه</b-button
        >
        <b-button @click="Exit" class="btn__" style="margin-top: 2%"
          >بستن اتاق</b-button
        >
      </div>
      <div @click="ChangeCam" class="addChat">
        <fa-icon icon="retweet" />
      </div>
      <div @click="LockScreen" class="Lock">
        <fa-icon icon="lock" />
      </div>
    </div>
  </div>
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
      code: this.$route.query.id,
      peerConnection: null,
      peerConnection2: null,
      peerConnection3: null,
      peerConnection4: null,
      ScreenStream: null,
      peers: [],
      users: 0,
      Lock_Camera: true,
      Lock_Phone: true,
      Lock_Finger: true,
      Clock: '00:00',
      DateNow: 'Wed, March 8',
      mediaNavigation: null,
    }
  },
  mounted() {
    this.$root.$emit('CheckSystem')
    socket.on('RedirectToAPP', (data) => {
      this.$router.push(`/app`)
    })
    socket.on('redirect_', (data) => {
      this.$router.push(`/`)
    })
    this.startVideo()

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
      isFirstTime: false,
      screen: new RTCPeerConnection(),
    }
    this.peerConnection2 = {
      camera: new RTCPeerConnection(),
      camera_Track: 'null',
      screen: new RTCPeerConnection(),
    }
    this.peerConnection3 = {
      camera: new RTCPeerConnection(),
      camera_Track: 'null',
      screen: new RTCPeerConnection(),
    }
    this.peerConnection4 = {
      camera: new RTCPeerConnection(),
      camera_Track: 'null',
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
    function setAlert(params) {
      alert(params)
    }
  },
  watch: {
    // selectedCamera(newCamera) {
    //   this.startVideo(newCamera)
    // },
    // selectedMicrophone(newCamera) {
    //   this.startVideo(newCamera)
    // },
  },
  methods: {
    async ChangeCam() {
      this.Camera == 'face'
        ? (this.Camera = 'environment')
        : (this.Camera = 'face')

      console.log(this.Camera)
      await this.startVideo()
    },
    LockScreen() {
      this.Lock_Camera = false
      this.Lock_Phone = false
      this.Lock_Finger = false
    },
    async Exit() {
      socket.emit('deleteRoom')
    },
    async shareScreen() {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
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
    async getCameraStream(facingMode) {
      const constraints = {
        audio: true,
        video: {
          facingMode: facingMode,
        },
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log('enumerateDevices() not supported.')
        return null
      }
      const deviceInfos = await navigator.mediaDevices.enumerateDevices()
      const videoInputDevices = deviceInfos.filter(
        (deviceInfo) => deviceInfo.kind === 'videoinput'
      )
      let selectedDeviceId
      if (videoInputDevices.length > 0) {
        if (facingMode == 'face') {
          selectedDeviceId = videoInputDevices.find((deviceInfo) =>
            deviceInfo.label.toLowerCase().includes('front')
          )?.deviceId
        }

        if (facingMode == 'environment') {
          selectedDeviceId = videoInputDevices.find(
            (deviceInfo) =>
              deviceInfo.label.toLowerCase().includes('back') ||
              deviceInfo.label.toLowerCase().includes('rear')
          )?.deviceId
        }
      }
      if (!selectedDeviceId) selectedDeviceId = videoInputDevices[0].deviceId
      constraints.video.deviceId = { exact: selectedDeviceId }
      return await navigator.mediaDevices.getUserMedia(constraints)
    },
    async startVideo() {
      try {
        const constraints = {
          audio: true,
          video: {
            facingMode: 'environment',
            deviceId: { exact: this.$route.query.cam },
          },
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        await this.setvideoStream(stream)
        for (const [index, track] of stream.getTracks().entries()) {
          if (!this.peerConnection.isFirstTime) {
            this.peerConnection.camera.addTrack(track, stream)
            if (index == 1) this.peerConnection.isFirstTime = true
          } else {
            const senders = this.peerConnection.camera.getSenders()
            senders.forEach((sender) => {
              if (sender.track.kind === 'audio') {
                const audioTrack = stream.getAudioTracks()[0]
                sender.replaceTrack(audioTrack)
              } else if (sender.track.kind === 'video') {
                const videoTrack = stream.getVideoTracks()[0]
                sender.replaceTrack(videoTrack)
              }
            })
          }
        }
      } catch (error) {
        console.error('Error starting video stream:', error)
      }
    },
    async setvideoStream(stream) {
      this.videoStream = stream
      this.$refs.video.srcObject = this.videoStream
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
.alwaysOnDisplay {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  width: 99%;
}
.alwaysOnDisplay .Clock {
  margin-top: 10vh;
  font-size: 4rem;
  font-family: 'Courier New', Courier, monospace !important;
}
.alwaysOnDisplay .Date {
  font-family: 'Courier New', Courier, monospace !important;
}
.alwaysOnDisplay .FingerPrint {
  position: fixed;
  font-size: 3rem;
  top: 65vh;
  opacity: 0.3;
}
.alwaysOnDisplay .bottomNav {
  font-size: 1.7rem;
  position: fixed;
  bottom: 2%;
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  flex-direction: row;
}
.alwaysOnDisplay .nav_notselect {
  opacity: 0.2;
}
.alwaysOnDisplay .nav_select {
  opacity: 0.7;
}
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
.Lock {
  background-color: #2c6eff;
  color: white;
  z-index: 1;
  width: 3em;
  height: 3em;
  position: fixed;
  bottom: 2%;
  left: 3%;
  border-radius: 50%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
