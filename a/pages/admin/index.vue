<template>
  <div>
    <b-modal
      :no-close-on-backdrop="true"
      id="bv-modal-CreateUser"
      hide-footer
      centered
      title="ساخت اتاق"
    >
      <div class="d-block text-center">
        <b-row class="my-1 row__">
          <b-col sm="4">
            <label for="input-valid">نام </label>
          </b-col>
          <input
            type="text"
            placeholder="username"
            v-model="NEW.username"
            style="direction: rtl"
            required
          />
        </b-row>
        <b-row class="my-1 row__">
          <b-col sm="4">
            <label for="input-valid"> کلمه عبور</label>
          </b-col>
          <input
            style="direction: rtl"
            type="text"
            placeholder="password"
            required
            v-model="NEW.password"
          />
        </b-row>
        <b-row class="my-1 row__">
          <b-col sm="4">
            <label for="input-valid"> ادمین</label>
          </b-col>
          <select
            style="width: 60%; color: black !important"
            id="camera"
            v-model="NEW.acl"
          >
            <option
              v-for="acls in acl"
              :key="acls.id"
              :value="{ id: acls.id, label: acls.label }"
              style="color: black !important"
            >
              {{ acls.label || `Camera` }}
            </option>
          </select>
        </b-row>
      </div>
      <b-button
        :disabled="!NEW.username || !NEW.password ? true : false"
        style="background-color: #2c6eff"
        @click="CreateUser"
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
        <span id="brandName">ادمین</span>
        <span id="SearchBTN"><fa-icon icon="magnifying-glass" /></span>
      </div>
      <div class="FillterBar">
        <span class="item selected">کاربرها</span>
        <nuxt-link class="item" :to="`/admin/bisim_rooms`"
          ><span>اتاق های بیسیم</span></nuxt-link
        >
        <nuxt-link class="item" :to="`/admin/video_rooms`"
          ><span>اتاق های تصویری</span></nuxt-link
        >
      </div>
    </div>
    <div class="botoom_box">
      <chat_list_item
        v-for="item in userList"
        :key="item.id"
        :id="item.id"
        :title="item.username"
        :description="item.password"
        :image="item.image"
      />
    </div>
  </div>
</template>
<script>
import chat_list_item from '@/components/chat_list_item.vue'
import socket from '~/plugins/socket.io.js'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ChatList',
  layout: 'admin_layout',
  components: { chat_list_item },
  data() {
    return {
      NEW: { username: '', password: '', acl: 0 },
      acl: [
        { id: 0, label: 'ادمین نباشه' },
        { id: 1, label: 'ادمین باشه' },
      ],
      userList: [],
    }
  },
  computed: {
    ...mapState(['BrandName', 'userid', 'interval']),
  },
  async mounted() {
    socket.emit('_getStateAdmin', this.$store.state.userid)
    socket.once('getStateAdmin', (state) => {
      this.isAdmin = state
      state == 1 ? 0 : this.$router.push('/')
    })

    socket.emit('_GetAllUsers')
    socket.on('GetAllUsers', (chats) => {
      this.userList = chats
    })
  },
  methods: {
    CreateUser() {
      socket.emit('CreateUser', this.NEW)
    },
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
