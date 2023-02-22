<template>
  <div>
    <div class="header bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80">
      دوربینو<br /><span class="roomST"
        >سامانه اتصال امن 
      </span>
    </div>
    <div class="down mt-44 ml-1">
      <div onclick="enterroom()" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-5 text-center mr-2 mb-2">ورود به اتاق</div>
      <div
        @click="Createroom()"
        class="mt-3 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-5 text-center mr-2 mb-2"
      >
        ساخت اتاق
      </div>
    </div>
  </div>
</template>

<script>
import socket from '~/plugins/socket.io.js'
export default {
  name: 'App',
  components: {},
  async mounted() {
    socket.on('SendRoomCode', async (result) => {
      await this.$router.push(`sender?roomID=${result.code}`)
    })
  },
  methods: {
    Createroom() {
      socket.emit('GetRoomCode', { id: socket.id })
    },
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
  /* zoom:150% */
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
