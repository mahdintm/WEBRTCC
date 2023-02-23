<template>
  <b-container class="bv-example-row">
    <b-row>
      <b-col class="header__">
        <span style="font-size: 40px"> <b>دوربینو</b> </span>
        <span class="roomST"> {{ code }} : شناسه اتاق</span>
      </b-col>
    </b-row>
    <b-row
      ><div class="rooms" v-for="room in rooms" :key="room.code">
        <div class="room">
          <div v-if="room.webcam" class="webcam">
            <video src=""></video>
          </div>
          <div v-if="room.screenshare" class="screen"></div>
        </div>
      </div>
      <div>
        <input type="text" v-model="roomid" />
        <button style="width: 50px" @click="sub()">sub</button>
      </div></b-row
    >
  </b-container>
</template>
<script>
export default {
  data() {
    return {
      roomid: '',
      rooms: [{ code: null, webcam: true, screenshare: true }],
    }
  },
  methods: {
    sub() {
      this.rooms.push({ code: null, webcam: true, screenshare: true })
    },
  },
}
</script>
<style>
video {
  width: 100%;
  height: 100%;
  border-radius: 15px;
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
