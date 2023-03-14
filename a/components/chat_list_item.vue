<template>
  <nuxt-link :to="`chat?id=${id}`">
    <div class="chat_list_item">
      <div class="chatProfile">
        <img
          class="b-skeleton-avatar"
          :src="image != null ? image : default_no_photo"
          alt="img_profile"
        />
        <div style="color: white" class="chat_detail">
          <div>{{ title }}</div>
          <div>{{ description }}</div>
        </div>
      </div>
    </div>
  </nuxt-link>
</template>
<script>
export default {
  data() {
    return {
      register_COUNT: {},
      default_no_photo: `${process.env.server_URL}/private/img/no-photo.png`,
    }
  },
  name: 'chat_list_item',
  props: ['id', 'title', 'description', 'image', 'time'],
}
</script>
