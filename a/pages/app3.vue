<template>
  <div>
    <b-modal
      :no-close-on-backdrop="true"
      id="bv-modal-CreateRoom"
      hide-footer
      centered
      title="ساخت اتاق"
    >
      <div class="d-block text-center">
        <b-row class="my-1 row__">
          <b-col sm="4">
            <label for="input-valid">نام اتاق</label>
          </b-col>
          <input
            type="text"
            placeholder="اتاق شماره 1"
            v-model="NEW.RoomName"
            style="direction: rtl"
            required
          />
        </b-row>
        <b-row class="my-1 row__">
          <b-col sm="4">
            <label for="input-valid"> کلمه عبور اتاق</label>
          </b-col>
          <input
            style="direction: rtl"
            type="text"
            placeholder="کلمه عبور"
            required
            v-model="NEW.Password"
          />
        </b-row>
        <b-row class="my-1 row__">
          <b-col sm="4">
            <label for="input-valid"> میکروفون</label>
          </b-col>
          <select
            style="width: 60%; color: black !important"
            id="camera"
            v-model="NEW.selectedCamera"
          >
            <option
              v-for="camera in cameras"
              :key="camera.deviceId"
              :value="{ deviceId: camera.deviceId, label: camera.label }"
              style="color: black !important"
            >
              {{ camera.label || `Camera` }}
            </option>
          </select>
        </b-row>
      </div>
      <b-button
        :disabled="!NEW.RoomName || !NEW.Password ? true : false"
        style="background-color: #2c6eff"
        @click="Createroom"
        class="mt-3"
        block
        >ساختن</b-button
      >
    </b-modal>
    <div class="topBar">
      <div class="Brandbar">
        <span v-b-toggle.sidebar-backdrop id="menuBTN"
          ><fa-icon icon="bars"
        /></span>
        <span id="brandName">{{ BrandName }}</span>
        <span id="SearchBTN"><fa-icon icon="magnifying-glass" /></span>
      </div>
      <div class="FillterBar">
        <nuxt-link :to="`/app`" class="item">گفتگوها</nuxt-link>
        <span class="item selected">بیسیم</span>
        <nuxt-link class="item" :to="`/app2`"><span>اتاق ها</span></nuxt-link>
      </div>
    </div>
    <div>
      <div class="botoom_box">
        <b-modal
          v-for="it in RoomsList"
          :key="it.roomID"
          :id="it.roomID"
          :no-close-on-backdrop="true"
          hide-footer
          centered
          :title="`${it.Name} اتاق`"
        >
          <div class="d-block text-center">
            <b-row class="my-1 row__">
              <b-col sm="4">
                <label for="input-valid"> کلمه عبور اتاق</label>
              </b-col>
              <input
                style="direction: rtl"
                type="password"
                placeholder="کلمه عبور"
                required
                v-model="valid_Password"
              />
            </b-row>
          </div>
          <b-row class="my-1 row__">
            <b-col sm="4">
              <label for="input-valid"> میکروفون</label>
            </b-col>
            <select
              style="width: 60%; color: black !important"
              id="camera"
              v-model="valid_Mic"
            >
              <option
                v-for="camera in cameras"
                :key="camera.deviceId"
                :value="{ deviceId: camera.deviceId, label: camera.label }"
                style="color: black !important"
              >
                {{ camera.label || `Camera` }}
              </option>
            </select>
          </b-row>
          <b-button
            :disabled="!valid_Password ? true : false"
            style="background-color: #2c6eff"
            @click="enterRoom(it.roomID)"
            class="mt-3"
            block
            >ورود</b-button
          >
        </b-modal>
        <div
          v-for="item in RoomsList"
          :key="item.roomID"
          :id="item.roomID"
          @click="$bvModal.show(item.roomID)"
        >
          <div class="chat_list_item">
            <div class="chatProfile">
              <div style="color: white" class="chat_detail">
                <div><fa-icon icon="door-open" /> {{ item.Name }}</div>
                <div><fa-icon icon="user" /> {{ item.Streamer }}</div>
                <div><fa-icon icon="eye" /> {{ item.users }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div @click="$bvModal.show('bv-modal-CreateRoom')" class="addChat">
      <fa-icon icon="plus" />
    </div>
    <b-sidebar id="sidebar-backdrop" backdrop-variant="dark" backdrop shadow>
      <div class="px-2 py-2">a</div>
    </b-sidebar>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import socket from '~/plugins/socket.io.js'

export default {
  name: 'App',
  data() {
    return {
      NEW: { RoomName: '', Password: '', selectedCamera: '' },
      cameras: [],
      RoomsList: [],
      valid_Password: '',
      valid_Mic: '',
    }
  },
  computed: {
    ...mapState(['BrandName', 'userid']),
  },
  components: {},
  async mounted() {
    this.$root.$emit('CheckSystem')
    socket.emit('GetAllRooms__Mic')
    socket.on('GetAllRooms_Mic', (data) => {
      this.RoomsList = data
    })
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const cameras = devices.filter((device) => device.kind === 'audioinput')
        this.cameras = cameras
        if (cameras.length > 0) {
          this.NEW.selectedCamera = {
            deviceId: cameras[0].deviceId,
            label: cameras[0].label,
          }
        }
      })
      .catch((error) => {
        console.error('Error getting camera list:', error)
      })
    socket.on('Create_GotoRoom_Bisim', (data) => {
      this.$router.push(`/bisim?mic=${data.mic}&id=${data.id}`)
    })
    socket.on('RedirectToAPP', (data) => {
      this.$router.push(`/app`)
    })
    socket.on('GotoRoom_Bisim', (data) => {
      this.$router.push(`/bisim?mic=${data.mic}&id=${data.id}`)
    })
  },
  methods: {
    async Createroom() {
      socket.emit('CreateRoom_Bisim', {
        Name: this.NEW.RoomName,
        Password: this.NEW.Password,
        selectedMic: this.NEW.selectedCamera,
      })
    },
    async enterRoom(roomid) {
      socket.emit('EnterRoom_Mic', roomid, this.valid_Password, this.valid_Mic)
    },
  },
}
</script>
<style>
body {
  background-color: #252b38;
}
@font-face {
  font-family: IRANSans;
  src: url('~/static/fonts/IRANSans.ttf');
}
.header__ {
  background-color: #2c6eff;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: space-evenly;
  padding: 45% 0 45% 0px;
  border-bottom-left-radius: 60px;
  border-bottom-right-radius: 60px;
  color: white;
}
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
  flex-direction: row-reverse;
  justify-content: center;
}
.buttons {
  margin-top: 4%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: space-around;
  align-items: stretch;
}
.modal-title {
  color: black !important;
}
.close {
  color: black !important;
}
.d-block {
  color: black !important;
}
.d-block label {
  color: black !important;
}
.d-block input {
  color: black !important;
}
</style>
