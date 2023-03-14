<template>
  <div>
    <div class="topBar">
      <div class="Brandbar">
        <span v-b-toggle.sidebar-backdrop id="menuBTN"
          ><fa-icon icon="bars"
        /></span>
        <span id="brandName">{{ BrandName }}</span>
        <span id="SearchBTN"><fa-icon icon="magnifying-glass" /></span>
      </div>
      <div class="FillterBar">
        <nuxt-link :to="`/app`" class="item">گفتگوها</nuxt-link>
        <span class="item selected">اتاق ها</span>
      </div>
    </div>
    <b-container class="bv-example-row">
      <b-row>
        <b-col class="header__">
          <span style="font-size: 40px"> <b>دوربینو</b> </span>
          <span style="padding-top: 8%">سامانه اتصال امن </span>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="buttons">
          <b-button
            style="background-color: #2c6eff"
            @click="$router.push('viewer')"
            >ورود به اتاق</b-button
          >
          <b-button
            style="margin-top: 3%; background-color: #2c6eff"
            @click="Createroom"
            >ساخت اتاق</b-button
          >
        </b-col>
      </b-row>
    </b-container>
    <b-sidebar id="sidebar-backdrop" backdrop-variant="dark" backdrop shadow>
      <div class="px-2 py-2">a</div>
    </b-sidebar>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'App',
  data() {
    return {}
  },
  computed: {
    ...mapState(['BrandName', 'userid']),
  },
  components: {},

  methods: {
    async Createroom() {
      await this.$router.push(`sender`)
    },
  },
}
</script>
<style scoped>
body {
  background-color: #252b38;
}
@font-face {
  font-family: IRANSans;
  src: url('~/static/fonts/IRANSans.ttf');
}
.header__ {
  background-color: #2c6eff;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: space-evenly;
  padding: 45% 0 45% 0px;
  border-bottom-left-radius: 60px;
  border-bottom-right-radius: 60px;
  color: white;
}
.buttons {
  margin-top: 4%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: space-around;
  align-items: stretch;
}
</style>
