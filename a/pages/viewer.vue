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
    <b-row>
      <div class="rooms" v-for="room in rooms" :key="room.code">
        <div class="room">
          <div v-if="room.webcam" class="webcam">
            <video
              autoplay
              class="remote-video camera"
              id="remote-video"
            ></video>
          </div>
          <div v-if="room.screenshare" class="screen"></div>
        </div>
      </div>
    </b-row>
    <div>
      <input type="text" v-model="roomid" />
      <button style="width: 50px" @click="sub()">sub</button>
    </div>
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
      peerConnection: null,
      rooms: [{ code: null, webcam: true, screenshare: true }],
      ScreenStream: null,
    }
  },
  mounted() {
    const { RTCPeerConnection, RTCSessionDescription } = window
    this.peerConnection = new RTCPeerConnection()
    this.peerConnection.ontrack = function ({ streams: [stream] }) {
      const remoteVideo = document.getElementById('remote-video')
      remoteVideo.srcObject = stream
    }
    socket.on('errorValidationRoom', () => {
      console.log('slm')
      this.errorText = 'کد اتاق اشتباه است'
      this.showAlert()
    })
    socket.on('errorEnterRoom', () => {
      console.log('slm')
      this.errorText = 'شما در این اتاق هستید!'
      this.showAlert()
    })
    socket.on('call-made', async (data) => {
      console.log('call-made')
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      )
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(
        new RTCSessionDescription(answer)
      )
      socket.emit('make-answer', {
        answer,
        to: data.socket,
      })
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
  border: 2px solid;
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
</style>
