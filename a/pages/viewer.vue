<template>
  <b-container class="bv-example-row">
    <b-alert
      :show="dismissCountDown"
      dismissible
      variant="warning"
      @dismissed="dismissCountDown = 0"
      @dismiss-count-down="countDownChanged"
    >
      <p>{{ errorText }}</p>
      <b-progress
        variant="warning"
        :max="dismissSecs"
        :value="dismissCountDown"
        height="4px"
      ></b-progress>
    </b-alert>
    <b-modal
      :no-close-on-backdrop="true"
      id="bv-modal-AddRoom"
      hide-footer
      centered
      title="اضافه کردن اتاق"
    >
      <div class="d-block text-center">
        <b-row class="my-1 row__">
          <b-col sm="4">
            <label for="input-valid"> شماره اتاق</label>
          </b-col>
          <input type="text" v-model="roomid" />
        </b-row>
      </div>
      <b-button
        style="background-color: #2c6eff"
        @click="validateroom"
        class="mt-3"
        block
        >ذخیره</b-button
      >
    </b-modal>
    <b-row>
      <b-col class="header__">
        <span style="font-size: 40px"> <b>دوربینو</b> </span>
      </b-col>
    </b-row>
    <b-row class="rooww">
      <div class="rooms" v-for="room in rooms" :key="room.code">
        <div class="room">
          <div v-show="room.webcam" class="webcam">
            <video
              autoplay
              controls
              class="remote-video camera"
              :id="`remote-video_${room.id}`"
            ></video>
          </div>
          <div v-show="room.screenshare" class="screen">
            <video
              autoplay
              controls
              class="remote-video screenshare"
              :id="`screen-video_${room.id}`"
            ></video>
          </div>
        </div>
      </div>
    </b-row>
    <b-button @click="$bvModal.show('bv-modal-AddRoom')" class="addItem"
      >+</b-button
    >
  </b-container>
</template>
<script>
import socket from '~/plugins/socket.io.js'
export default {
  data() {
    return {
      dismissSecs: 5,
      dismissCountDown: 0,
      errorText: '',
      roomid: '',
      rooms: [
        { id: 0, user: null, webcam: false, screenshare: false },
        { id: 1, user: null, webcam: false, screenshare: false },
        { id: 2, user: null, webcam: false, screenshare: false },
        { id: 3, user: null, webcam: false, screenshare: false },
      ],
      ScreenStream: null,
      peerConnection: null,
      peerConnection2: null,
      peerConnection3: null,
      peerConnection4: null,
      peers: [],
    }
  },
  mounted() {
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
    this.peerConnection.camera.ontrack = function ({ streams: [stream] }) {
      const remoteVideo = document.getElementById('remote-video_0')
      remoteVideo.srcObject = stream
    }
    this.peerConnection.screen.ontrack = function ({ streams: [stream] }) {
      const remoteVideo = document.getElementById('screen-video_0')
      remoteVideo.srcObject = stream
    }
    this.peerConnection2.camera.ontrack = function ({ streams: [stream] }) {
      const remoteVideo = document.getElementById('remote-video_1')
      remoteVideo.srcObject = stream
    }
    this.peerConnection3.camera.ontrack = function ({ streams: [stream] }) {
      const remoteVideo = document.getElementById('remote-video_2')
      remoteVideo.srcObject = stream
    }
    this.peerConnection4.camera.ontrack = function ({ streams: [stream] }) {
      const remoteVideo = document.getElementById('remote-video_3')
      remoteVideo.srcObject = stream
    }
    socket.on('errorValidationRoom', () => {
      console.log('slm')
      this.errorText = 'کد اتاق اشتباه است'
      this.showAlert()
    })
    socket.on('disableUserShareScreen', () => {})
    socket.on('errorEnterRoom', () => {
      console.log('slm')
      this.errorText = 'شما در این اتاق هستید!'
      this.showAlert()
    })
    socket.on('call-made', async (data) => {
      console.log('call-made')

      for (const [index, element] of this.peers.entries()) {
        if (element.user == data.socket) {
          console.log('in1', index)
          this.peers[index]['user'] = data.socket
          await element.RTC.camera.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          )
          const answer = await element.RTC.camera.createAnswer()
          await element.RTC.camera.setLocalDescription(
            new RTCSessionDescription(answer)
          )
          return socket.emit('make-answer', {
            answer,
            to: data.socket,
          })
        } else if (element.user == null) {
          console.log('in2', index)
          this.rooms[index].webcam = true
          this.peers[index]['user'] = data.socket
          await element.RTC.camera.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          )
          const answer = await element.RTC.camera.createAnswer()
          await element.RTC.camera.setLocalDescription(
            new RTCSessionDescription(answer)
          )
          return socket.emit('make-answer', {
            answer,
            to: data.socket,
          })
        }
      }
    })
    socket.on('screen-call-made', async (data) => {
      console.log('screen-call-made')
      for (const [index, element] of this.peers.entries()) {
        if (element.user == data.socket) {
          this.rooms[index].screenshare = true
          console.log('scin1', index)
          this.peers[index]['user'] = data.socket
          await element.RTC.screen.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          )
          const answer = await element.RTC.screen.createAnswer()
          await element.RTC.screen.setLocalDescription(
            new RTCSessionDescription(answer)
          )
          return socket.emit('screen-make-answer', {
            answer,
            to: data.socket,
          })
        }
      }
    })
  },
  methods: {
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs
    },
    sub() {
      this.rooms.push({ code: null, webcam: true, screenshare: true })
    },
    validateroom() {
      socket.emit('validation_room', this.roomid)
    },
  },
}
</script>
<style>
.camera {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg); /* Safari and Chrome */
  -moz-transform: rotateY(180deg); /* Firefox */
  width: calc(100vh / 2);
  border-radius: 18px;
}
.screenshare {
  width: calc(100vh / 2);
  border-radius: 18px;
}
@font-face {
  font-family: IRANSans;
  src: url('~/static/fonts/IRANSans.ttf');
}
body {
  background-color: #252b38;
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
  padding-bottom: 4%;
  color: white;
}
.room {
  color: white;
  /* border: 2px solid; */
  margin-top: 4%;
}
.row {
  justify-content: space-around !important;
}
.addItem {
  position: fixed;
  bottom: 3%;
  right: 3%;
  border-radius: 70%;
  font-size: 20px;
  height: 50px;
  width: 50px;
  background-color: #2c6eff;
  padding: 5px;
}
.row__ {
  flex-direction: row-reverse !important;
}
.rooww {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
  justify-content: flex-start;
  flex-direction: row-reverse;
  align-items: center;
}
</style>
