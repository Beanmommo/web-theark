<script setup lang="ts">
import { useTheme } from 'vuetify';

const { logout, isLogin } = useAuth()
const router = useRouter()
const user = useAuthUser();
const message = 'Signing Out'
const loading = ref(false)
const displayName = computed(() => { return user.value?.displayName ? user.value?.displayName : "No Name" })

async function clickHandlerSignOut() {
  loading.value = true
  await logout()
  router.push('/')
  loading.value = false
}

function clickHandlerProfile() {
  router.push('/profile')
}

</script>

<template>
  <div class="userButton">
    <Loading :message="message" v-if="loading" />
    <v-menu location="bottom" v-if="isLogin" open-on-hover>
      <template v-slot:activator="{ props }">
        <IconButtonUser v-bind="props">{{ displayName }}</IconButtonUser>
      </template>
      <v-list>
        <v-list-item class="item" variant="plain" @click="clickHandlerProfile">
          <template v-slot:prepend>
            <v-icon icon="mdi-account-edit"></v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        <v-list-item class="item" variant="plain" @click="clickHandlerSignOut">
          <template v-slot:prepend>
            <v-icon icon="mdi-logout"></v-icon>
          </template>
          <v-list-item-title>Sign Out</v-list-item-title>
        </v-list-item>

      </v-list>
    </v-menu>

    <DialogSignIn v-else>
      <IconButtonUser>Sign In</IconButtonUser>
    </DialogSignIn>
  </div>
</template>

<style lang="scss" scoped>
.item {
  cursor: pointer;
}
</style>