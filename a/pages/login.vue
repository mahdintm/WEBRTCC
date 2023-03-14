<template>
  <b-container class="body bv-example-row">
    <b-row>
      <b-col class="header__">
        <span style="font-size: 40px"> <b>دوربینو</b> </span>
        <span>سامانه اتصال امن </span>
      </b-col>
    </b-row>
    <b-row class="box_login" style="direction: rtl">
      <p
        style="
          padding-bottom: 5vh;
          font-size: 25px;
          padding-right: 2vh;
          padding-left: 2vh;
          text-align: center;
          color: white;
        "
      >
        برای ورود به سامانه ابتدا وارد شوید.
      </p>
      <label class="lable_inputs" for="input_username">نام کاربری</label>
      <b-form-input
        id="input_username"
        class="input_input"
        v-model="userName"
        placeholder="نام کاربری سامانه را وارد کنید"
      ></b-form-input>
      <label class="lable_inputs" for="input_password">کلمه عبور</label>
      <b-form-input
        id="input_password"
        class="input_input"
        v-model="passWord"
        placeholder="کلمه عبور سامانه را وارد کنید"
      ></b-form-input>
      <b-button
        @click="SingIn"
        style="margin-top: 2vh; background-color: #2c6eff"
        >ورود</b-button
      >
    </b-row>
  </b-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      userName: '',
      passWord: '',
    }
  },
  components: {},

  methods: {
    ...mapActions(['UpdateUserID']),
    async SingIn() {
      await fetch(`${process.env.server_URL}/AccountManager/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: this.userName,
          password: this.passWord,
          device: navigator.userAgent,
        }),
      }).then(async (res) => {
        let respo = await res.json()
        if (respo.status) {
          this.UpdateUserID(respo.id)
          await this.$router.push('/app')
        }
      })
    },
    async Createroom() {
      await this.$router.push(`sender`)
    },
  },
}
</script>
<style scoped>
.body {
  background-color: #252b38 !important;
  height: 100vh !important;
  width: 100% !important;
  max-width: 450px;
}

@font-face {
  font-family: IRANSans;
  src: url('~/static/fonts/IRANSans.ttf');
}
* {
  font-family: IRANSans !important;
}
.header__ {
  background-color: #2c6eff;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: space-evenly;
  padding: 2% 0 2% 0px;
  /* border-bottom-left-radius: 60px; */
  /* border-bottom-right-radius: 60px; */
  color: white;
}
.input_input {
  width: 80%;
}

.box_login {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
  flex-direction: column;
  align-items: center;
  padding-top: 10vh;
}

.lable_inputs {
  width: 80%;
  direction: rtl;
  text-align: right;
}
input {
  color: black !important;
}
</style>
