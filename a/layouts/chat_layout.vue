<template>
  <div>
    <div class="topBar_Chat">
      <div class="Brandbar">
        <span @click="$router.go(-1)" id="menuBTN"
          ><fa-icon icon="arrow-left"
        /></span>
        <div class="chatInfo">
          <img
            style="
              width: 2em;
              height: 2em;
              background-color: #333333;
              border-radius: 50%;
            "
            src="~/static/img/profile.png"
            alt=""
          />
          <div
            style="
              display: flex;
              flex-direction: column;
              flex-wrap: wrap;
              align-content: flex-start;
              align-items: flex-start;
              justify-content: space-between;
              font-size: 0.9rem;
              padding-left: 3%;
            "
          >
            <div id="ChatName">{{ ChatName }}</div>
            <div style="color: #999 !important" id="ChatDesc">
              {{ `آخرین بازدید ${lastTime}` }}
            </div>
          </div>
        </div>
        <span id="SearchBTN"><fa-icon icon="ellipsis-vertical" /></span>
      </div>
    </div>

    <Nuxt />
    <div
      style="
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        align-content: center;
        align-items: center;
        justify-content: space-around;
        background-color: #777777;
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 6vh;
      "
    >
      <b-form-input
        style="
          width: 90%;
          color: black !important;
          background-color: #777777;
          border: none;
          border-right: solid 1px;
          border-radius: 0;
          direction: rtl;
        "
        v-model="Message"
        placeholder="پیام خود را وارد کنید"
      ></b-form-input>
      <div
        style="
          width: 10%;
          height: 100vh;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
          flex-direction: row;
        "
      >
        <div v-show="Message.length <= 0" id="menuBTN">
          <fa-icon icon="paperclip" />
        </div>
        <div v-show="Message.length > 0" id="menuBTN">
          <fa-icon icon="paper-plane" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
document.addEventListener('contextmenu', (event) => event.preventDefault())
import { mapState, mapActions } from 'vuex'
import socket from '~/plugins/socket.io.js'
import TimeAgo from 'javascript-time-ago'
import fa from 'javascript-time-ago/locale/fa'
TimeAgo.addDefaultLocale(fa)
export default {
  layout: 'app_layout',
  data() {
    return {
      Message: '',
      timeAgo: new TimeAgo('fa-IR'),
      lastTime: 0,
      ChatName: '',
    }
  },
  computed: {
    ...mapState(['BrandName', 'userid']),
  },
  methods: {
    ...mapActions(['UpdateUserID']),
    async GetOnlineChat(chatid, userid) {
      let { time } = await fetch(
        `${process.env.server_URL}/ApiService/GetOnlineChat?chatid=${chatid}&&userid=${userid}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      ).then(async (res) => await res.json())
      this.lastTime = this.timeAgo.format(new Date(parseInt(time)))
    },
    async GetNameChat(chatid, userid) {
      let { name } = await fetch(
        `${process.env.server_URL}/ApiService/GetNameChat?chatid=${chatid}&&userid=${userid}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      ).then(async (res) => await res.json())
      this.ChatName = name
    },
  },
  async mounted() {
    this.$root.$emit('CheckSystem')
    socket.on('RedirectToAPP', (data) => {
      this.$router.push(`/app`)
    })
    setTimeout(async () => {
      await this.GetOnlineChat(
        await this.$route.query.id,
        await this.$store.state.userid
      )
      await this.GetNameChat(
        await this.$route.query.id,
        await this.$store.state.userid
      )
    }, 500)
  },
  async created() {
    this.$root.$on('Chat_GetPMS', async () => {
      if (this.$store.state.userid != null) {
        return socket.emit(
          'getpms',
          this.$store.state.userid,
          this.$route.query.id
        )
      } else {
        await fetch(`${process.env.server_URL}/AccountManager/GetStatus`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }).then(async (res) => {
          let response = await res.json()
          await this.UpdateUserID(response.id)

          return socket.emit(
            'getpms',
            this.$store.state.userid,
            this.$route.query.id
          )
        })
      }
    })
  },
}
</script>
<style>
@font-face {
  font-family: IRANSans;
  src: url('~/static/fonts/IRANSans.ttf');
}
* {
  font-family: IRANSans !important;
  /*  */
}
body {
  background-color: #252b38 !important;
  max-width: 500px;
}
/* Side bar */
.b-sidebar {
  width: calc(100% / 1.5);
}
/* top bar */
.topBar_Chat {
  width: 100%;
  height: 9vh;
  background-color: #2c6eff;
  position: fixed;
  top: 0;
  z-index: 1;
  left: 0;
}
.topBar_Chat .Brandbar {
  display: flex;
  height: 100%;
  border-bottom: solid 0.5px;
}
.topBar_Chat #menuBTN {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10%;
  text-align: center;
  color: white;
  font-size: 1.2rem;
}
.topBar_Chat .chatInfo {
  width: 80%;
  padding-left: 2.5%;
  padding-right: 2.5%;
  text-align: center;
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.topBar_Chat #SearchBTN {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10%;
  text-align: center;
  color: white;
  font-size: 1.2rem;
}
::placeholder {
  color: #333333 !important;
  opacity: 1; /* Firefox */
}

:-ms-input-placeholder {
  color: #333333 !important;
}

::-ms-input-placeholder {
  color: #333333 !important;
}
</style>
