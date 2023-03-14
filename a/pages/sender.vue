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
      </div>
      <div class="btns">
        <b-button @click="Exit" class="btn__" style="margin-top: 2%"
          >بستن اتاق</b-button
        >
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
      videoStream: null,
      code: this.$route.query.id,
      peers: [],
      users: 0,
      Lock_Camera: true,
      Lock_Phone: true,
      Lock_Finger: true,
      Clock: '00:00',
      DateNow: 'Wed, March 8',
    }
  },
  mounted() {
    this.$root.$emit('CheckSystem')
    this.startVideo()
    socket.on('RedirectToAPP', async (data) => {
      await this.$router.push(`/`)
    })
    socket.on('redirect_', async (data) => {
      this.peers.forEach((element) => {
        element.RTC.close()
      })
      this.peers = []
      await this.$router.push(`/`)
    })
    socket.on('newUser', this.makecall)
    socket.on('answer-made', (data) => {
      const { RTCPeerConnection, RTCSessionDescription } = window
      for (const [index, element] of this.peers.entries()) {
        if (element.user == data.id) {
          console.log(index, element)
          return element.RTC.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          )
        }
      }
    })
  },
  methods: {
    LockScreen() {
      this.Lock_Camera = false
      this.Lock_Phone = false
      this.Lock_Finger = false
    },
    async Exit() {
      socket.emit('deleteRoom')
    },
    async makecall(userid) {
      const { RTCPeerConnection, RTCSessionDescription } = window
      for await (const [index, element] of this.peers.entries()) {
        if (element.user == userid) {
          await this.peers[index].RTC.close()
          this.peers.splice(index, 1)
        }
      }
      let RTC_ = new RTCPeerConnection()
      this.peers.push({
        user: userid,
        RTC: RTC_,
      })
      for (const track of this.videoStream.getTracks()) {
        RTC_.addTrack(track, this.videoStream)
      }
      let b = 0
      let a = setInterval(async () => {
        b++
        if (b > 2) {
          return clearInterval(a)
        }
        for (const [index, element] of this.peers.entries()) {
          if (element.user == userid) {
            element.RTC.createOffer().then((offer) => {
              element.RTC.setLocalDescription(offer)
              socket.emit('offer', { offer, to: userid })
            })
          }
        }
      }, 1000)
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
    socket.off('newUser')
    socket.off('answer-made')
    socket.off('redirect_')
    socket.off('RedirectToAPP')
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
