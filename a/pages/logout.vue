<template></template>

<script>
export default {
  async mounted() {
    await fetch(`${process.env.server_URL}/AccountManager/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: this.userName,
        password: this.passWord,
        device: navigator.userAgent,
      }),
    }).then(async (res) => {
      await this.$router.push('/login')
    })
  },
}
</script>
