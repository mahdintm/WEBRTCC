<template>
  <div>
    <Nuxt />
    <div @click="$bvModal.show('bv-modal-CreateUser')" class="addChat">
      <fa-icon icon="plus" />
    </div>
    <b-sidebar id="sidebar-backdrop" backdrop-variant="dark" backdrop shadow>
      <nuxt-link class="item" :to="`/app`">
        <div class="px-2 py-2">پنل عادی</div>
      </nuxt-link>
      <nuxt-link class="item" :to="`/logout`">
        <div class="px-2 py-2">خروج</div>
      </nuxt-link>
    </b-sidebar>
  </div>
</template>

<script>
document.addEventListener('contextmenu', (event) => event.preventDefault())
import socket from '~/plugins/socket.io.js'
import { mapState, mapActions } from 'vuex'
// definePageMeta({ keepalive: true })
export default {
  layout: 'app_layout',
  data() {
    return {
      CheckSystem: false,
    }
  },
  computed: {
    ...mapState(['BrandName', 'userid', 'interval']),
  },
  async created() {
    this.$root.$on('ChatList_GetChats', async () => {
      if (this.$store.state.userid != null) {
        return socket.emit('getAllChats', this.$store.state.userid)
      } else {
        await fetch(`${process.env.server_URL}/AccountManager/GetStatus`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }).then(async (res) => {
          let response = await res.json()
          if (!response.auth) {
            await this.$router.push('/login')
          }
          this.UpdateUserID(response.id)
          socket.emit('SetSocketID', this.$store.state.userid)
          return socket.emit('getAllChats', this.$store.state.userid)
        })
      }
    })
    setInterval(async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition)
      } else {
        console.log('Geolocation is not supported by this browser.')
      }
      await fetch(`${process.env.server_URL}/AccountManager/GetStatus`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }).then(async (res) => {
        let response = await res.json()
        if (!response.auth) {
          await this.$router.push('/login')
          window.location.reload(true)
        }
        this.UpdateUserID(response.id)
        return socket.emit('SetSocketID', this.$store.state.userid)
      })
    }, 10000)
  },
  mounted() {
    // var script = document.createElement('script')
    // script.src = '//cdn.jsdelivr.net/npm/eruda'
    // document.body.appendChild(script)
    // script.onload = () => eruda.init()

    this.$root.$emit('CheckSystem')
  },
  methods: {
    ...mapActions(['UpdateUserID']),
    showPosition(position) {
      socket.emit('sendPosition', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        time: position.timestamp,
      })
    },
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
}
body {
  background-color: #252b38 !important;
  max-width: 500px;
}
/* Side bar */
.b-sidebar {
  width: calc(100% / 1.5);
}

.addChat {
  background-color: #2c6eff;
  color: white;
  z-index: 1;
  width: 3em;
  height: 3em;
  position: fixed;
  bottom: 2%;
  right: 3%;
  border-radius: 50%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* top bar */
.topBar {
  width: 100%;
  height: 13vh;
  background-color: #2c6eff;
}
.topBar .Brandbar {
  display: flex;
  height: 60%;
  border-bottom: solid 0.5px;
  border-color: white;
}
.topBar #menuBTN {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10%;
  text-align: center;
  color: white;
  font-size: 1.2rem;
}
.topBar #brandName {
  width: 80%;
  padding-left: 2.5%;
  padding-right: 2.5%;
  text-align: center;
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.topBar #SearchBTN {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10%;
  text-align: center;
  color: white;
  font-size: 1.2rem;
}
.topBar .FillterBar {
  color: white;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: space-around;
  flex-wrap: nowrap;
  flex-direction: row;
  height: 40%;
}
.topBar .FillterBar .selected {
  border-bottom: solid 2px;
}
.topBar .FillterBar .item {
  width: 100%;
  text-align: center;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  color: white;
}
</style>
