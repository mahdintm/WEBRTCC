<template>
  <div>
    <div class="topBar">
      <div class="Brandbar">
        <span v-b-toggle.sidebar-backdrop id="menuBTN"
          ><fa-icon icon="bars"
        /></span>
        <span id="brandName">ادمین</span>
        <span id="SearchBTN"><fa-icon icon="magnifying-glass" /></span>
      </div>
      <div class="FillterBar">
        <nuxt-link class="item" :to="`/admin/`"><span>کاربرها</span></nuxt-link>
        <nuxt-link class="item" :to="`/admin/bisim_rooms`"
          ><span>اتاق های بیسیم</span></nuxt-link
        >
        <span class="item selected">اتاق های تصویری</span>
      </div>
    </div>
    <div class="botoom_box">
      <chat_list_item
        v-for="item in userList"
        :key="item.id"
        :id="item.id"
        :title="item.Name"
        :description="item.Password"
        :time="item.time"
        :image="item.image"
      />
    </div>
  </div>
</template>
<script>
import chat_list_item from '@/components/chat_list_item.vue'
import socket from '~/plugins/socket.io.js'
export default {
  name: 'ChatList',
  layout: 'admin_layout',
  components: { chat_list_item },
  data() {
    return {
      userList: [],
    }
  },

  async mounted() {
    socket.emit('_GetAllVideoRooms')
    socket.on('GetAllVideoRooms', (chats) => {
      this.userList = chats
    })
  },
}
</script>

<style>
/* botoom box */
.botoom_box {
  width: 100%;
  height: 87vh;
}
.chatProfile {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  align-content: space-between;
  flex-wrap: nowrap;
}

.b-skeleton-avatar {
  width: 4em !important;
  height: 4em !important;
  border: solid 2px;
  background-color: #111111;
}
.botoom_box .chat_detail {
  padding-left: 3%;
  width: 80%;
}
.chat_list_item {
  padding: 2% 0 2% 2%;
  border-bottom: solid 1px black;
}
</style>
