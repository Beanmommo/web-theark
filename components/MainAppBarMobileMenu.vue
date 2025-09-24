<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const { isLogin, logout } = useAuth()
const showSidebar = ref(false)

/* Set the width of the side navigation to 0 or 250px */
function clickHandler() {
  showSidebar.value = !showSidebar.value
}

async function clickHandlerSignOut() {
  await logout()
}

const theme = useTheme()
const arkLogo = {
  "thearkTheme": "/Logo/theark.png",
  "futsalTheme": "/Logo/theark_futsal.svg",
  "pickleBallTheme": "/Logo/theark_pickleball.png",
}

const accentColor = computed(() => {
  return theme.current.value.colors.accent
})

const themeLogo = computed(() => {
  const key = theme.global.name.value as keyof typeof arkLogo;
  return arkLogo[key] ?? arkLogo["thearkTheme"];
})
</script>

<template>
  <div class="mobileMenu">
    <div class="hamburger" @click="clickHandler">
      <IconHamburger />
    </div>
    <div class="overlay" v-show="showSidebar" @click="clickHandler" />
    <transition name="section">
      <div id="mySidenav" class="sidenav" v-show="showSidebar">
        <div class="header">
          <img :src="themeLogo" alt="The Ark Logo" width="72px" />
          <div class="closebtn" :style="{ color: accentColor }" @click="clickHandler">
            <IconClose />
          </div>
        </div>
        <div class="content">
          <a href="/contactus">Contact Us</a>
          <div class="content--inner">
            <template v-if="isLogin">
              <NuxtLink to="/profile" v-if="isLogin">Your Profile</NuxtLink>
              <div class="signout" @click="clickHandlerSignOut">Sign Out</div>
            </template>
            <DialogSignIn v-else>
              <IconButtonUser>Sign In</IconButtonUser>
            </DialogSignIn>
          </div>

        </div>

      </div>
    </transition>

  </div>
</template>

<style lang="scss" scoped>
.mobileMenu {
  z-index: 99;
}

.overlay {
  align-items: center;
  border-radius: inherit;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), z-index 1ms;
  background: rgba(0, 0, 0, 0.7);
}

.sidenav {
  height: 100%;
  width: 300px;
  position: fixed;
  top: 0;
  right: 0;
  background-color: $functional-white;
  padding: $margin;


  a,
  .signout {
    text-decoration: none;
    font-size: 1.3rem;
    color: black;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background: #f1f1f1;
    }
  }

  h3 {
    font-size: 1.2rem;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $unit;

  >img {
    width: 150px;
  }
}

.content {
  margin-top: $p-margin;
  display: flex;
  flex-direction: column;
  gap: $p-margin;
  padding-left: $margin;

  &--inner {
    margin-top: $margin;
    display: flex;
    flex-direction: column;
    gap: $margin;
  }

}

/* Position and style the close button (top right corner) */
.closebtn {
  cursor: pointer;
  width: 30px;
}

.hamburger {
  cursor: pointer;
  width: 30px;
  height: 30px;
}

.userSignIn {
  display: flex;
  align-items: center;
  color: $primary-green;
  gap: $margin;
  cursor: pointer;

  >h5 {
    font-weight: 500;
    font-size: 1.2rem;
    margin: 0;
  }

  &Icon {
    width: 40px;
  }

}


// Transition for Drawer Slide In/out
.section-leave-active {
  transition: .2s ease;
}

.section-enter-active {
  transition: .5s ease;
}

.section-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.section-enter-to {
  opacity: 100;
}

.section-leave-to {
  transform: translateX(100%);
}
</style>