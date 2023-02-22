<template>
    <div>
    <div class="header bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80">
      دوربینو<br /><span class="roomST"
        >
      </span>
    </div>
    <div class="rooms" v-for="room in rooms" :key="room.code">
        <div class="room" >
            <div v-if="room.webcam" class="webcam"></div>
            <div v-if="room.screenshare" class="screen"></div>
        </div>

    </div>
</div>
</template>
<script>
let rooms=[
    {code:"345346",webcam:true,screenshare:false},
    {code:"345346",webcam:true,screenshare:true},
    {code:"345346",webcam:true,screenshare:false},
    {code:"345346",webcam:true,screenshare:true}
]
export default {
    data(){
        return {
            rooms:rooms
        }
    }
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

.rooms{
    margin-top: 96px;
    width:360px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;

}
.rooms .room{
    margin-top: 15px;
}
.rooms .room .webcam{
    margin-left: auto;
    margin-right: auto;
    height: 203px;
    background: #fff;
}
.rooms .room .screen{
    margin-left: auto;
    margin-right: auto;
    height: 203px;
    background: #f2f;
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
