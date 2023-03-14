<template>
  <div id="messagesContainer" ref="messagesContainer" class="imessage">
    <div
      v-for="pm in pms"
      :key="pm.id"
      :id="pm.id"
      :value="pm.name"
      :timestamp="pm.timestamp"
      :status="pm.status"
      :class="pm.from == $store.state.userid ? 'from-me' : 'from-them'"
    >
      <div class="Messege-From">{{ pm.fromName }}</div>
      <div class="chat-Message">{{ pm.value }}</div>
      <div class="Messege-status">
        <div class="time">
          {{
            [
              new Date(parseInt(pm.timestamp)).getFullYear(),
              new Date(parseInt(pm.timestamp)).getMonth() + 1,
              new Date(parseInt(pm.timestamp)).getDate(),
            ].join('/') +
            ' | ' +
            [
              new Date(parseInt(pm.timestamp)).getHours(),
              new Date(parseInt(pm.timestamp)).getMinutes(),
            ].join(':')
          }}
        </div>
        <div v-show="!pm.status" class="status" style="padding: 0">
          <fa-icon icon="check" />
        </div>
        <div v-show="pm.status" class="status" style="padding: 0">
          <fa-icon icon="check-double" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import socket from '~/plugins/socket.io.js'

export default {
  name: 'ChatList',
  layout: 'chat_layout',
  data: () => ({
    pms: [],
  }),
  async mounted() {
    this.$root.$emit('Chat_GetPMS')
    socket.on('GetPMS', async (chats) => {
      this.pms = await chats
      await this.scrollToEnd()
    })
  },
  methods: {
    async scrollToEnd() {
      setTimeout(() => {
        let scroll_to_bottom = document.getElementById('messagesContainer')
        scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight
      }, 100)
    },
  },
}
</script>

<style>
.imessage {
  scroll-margin-bottom: 20px;
  height: 85vh;
  position: fixed;
  top: 9vh;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  font-family: 'SanFrancisco';
  font-size: 1.25rem;
  margin: 0 auto 1rem;
  width: 100%;
  padding: 0.5rem 1.5rem;
  overflow: auto;
}
.imessage div {
  border-radius: 1.15rem;
  line-height: 1.25;
  padding: 0.5rem 0.4rem;
  position: relative;
  word-wrap: break-word;
}
.imessage div::before,
.imessage div::after {
  bottom: -0.1rem;
  content: '';
  height: 1rem;
  position: absolute;
}
div.from-me {
  align-self: flex-end;
  direction: rtl;
  background-color: #248bf5;
  color: #fff;
  text-align: right;
}
div.from-me::before {
  border-bottom-left-radius: 0.8rem 0.7rem;
  border-right: 1rem solid #248bf5;
  right: -0.35rem;
  transform: translate(0, -0.1rem);
}
div.from-me::after {
  background-color: #252b38;
  border-bottom-left-radius: 0.5rem;
  right: -40px;
  transform: translate(-30px, -2px);
  width: 10px;
}
div[class^='from-'] {
  margin: 0.5rem 0;
  width: fit-content;
}
div.from-me ~ div.from-me {
  margin: 0.25rem 0 0;
}
div.from-me ~ div.from-me:not(:last-child) {
  margin: 0.25rem 0 0;
}
div.from-me ~ div.from-me:last-child {
  margin-bottom: 0.5rem;
}
div.from-them {
  align-items: flex-start;
  background-color: #e5e5ea;
  color: #000 !important;
}
div.from-them:before {
  border-bottom-right-radius: 0.8rem 0.7rem;
  border-left: 1rem solid #e5e5ea;
  left: -0.35rem;
  transform: translate(0, -0.1rem);
}
div.from-them::after {
  background-color: #252b38;
  border-bottom-right-radius: 0.5rem;
  left: 20px;
  transform: translate(-30px, -2px);
  width: 10px;
}
.Messege-From {
  font-size: 10px;
}
.from-them .Messege-status {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 9px 7px 0px 0px;
  font-size: 14px;
  text-align: left !important;
  color: black !important;
}
.from-them .Messege-status .time {
  padding: 0px 6px 0 0px;
}
.from-them div {
  color: black !important;
}
.from-them .chat-Message {
  padding-top: 0;
  padding-bottom: 0;
  text-align: right;
}
.from-me .Messege-status {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  padding: 0px 7px 0px 0px;
  font-size: 14px;
  align-items: center;
}
.from-them .Messege-status .time {
  padding: 0px 6px 0 0px;
}
.from-them .status {
  display: none;
}
.from-me .chat-Message {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
