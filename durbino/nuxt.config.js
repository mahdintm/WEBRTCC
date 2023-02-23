export default {
  ssr: false,
  head: {
    title: 'دوربینو',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  env: {
    WS_URL: 'http://localhost:3003',
  },
  css: [],
  plugins: [],
  components: true,
  buildModules: [],
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/pwa'],
  pwa: {
    manifest: {
      lang: 'en',
    },
  },
  build: {},
}
