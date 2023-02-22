<template>
  <div>
    <div class="top">
      <div class="top_items">
        <div class="sp1">دوربینو</div>
        <div class="sp2">سامانه اتصال امن</div>
      </div>
    </div>
    <div class="down">
      <div onclick="enterroom()">ورود به اتاق</div>
      <div
        @click="Createroom()"
        style="
          border: 3px solid #2c6eff;
          background-color: #ffffff;
          color: #2c6eff;
        "
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
@import url('~/static/css/index.css');
</style>
