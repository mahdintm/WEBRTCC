<template>
  <div>
    <div class="botoom_box">
      <chat_list_item
        v-for="item in chatList"
        :key="item.id"
        :id="item.id"
        :title="item.name"
        :description="item.description"
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
  layout: 'app_layout',
  components: { chat_list_item },
  data() {
    return {
      chatList: [],
    }
  },

  async mounted() {
    this.$root.$emit('ChatList_GetChats')
    socket.on('GetAllChats', (chats) => {
      this.chatList = chats
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
