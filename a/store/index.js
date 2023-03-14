export const state = () => ({
  BrandName: process.env.BrandName,
  userid: null,
})

export const mutations = {
  UserId(state, value) {
    state.userid = value
  },
}

export const actions = {
  UpdateUserID({ commit }, value) {
    commit('UserId', value)
  },
}
