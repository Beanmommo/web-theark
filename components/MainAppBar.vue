<script setup lang="ts">
import { useTheme } from 'vuetify/lib/composables/theme.mjs';


const router = useRouter();

const navItems = [
  { title: "Contact Us", to: "/contactus" },
  { title: "Our Pitches", to: "/pitches" },
  { title: "Packages", to: "/packages" }
]

function clickHandler(link: string) {
  router.push(link)
}

async function clickHandlerBookNow() {
  router.push("/booking")
}
const theme = useTheme()
const arkLogo = {
  "thearkTheme": "/Logo/theark.png",
  "futsalTheme": "/Logo/theark_futsal.svg",
  "pickleBallTheme": "/Logo/theark_pickleball.png",
}
const themeLogo = computed(() => {
  const key = theme.global.name.value as keyof typeof arkLogo;
  return arkLogo[key] ?? arkLogo["thearkTheme"];
})


</script>

<template>
  <div class="main-app-bar">
    <div class="main-app-bar-left">
      <img class="imgLogo" :src="themeLogo" alt="The Ark Logo" @click="clickHandler('/')" width="80px" />
      <div class="nav-items">
        <MainAppBarNavItem v-for="item in navItems" :key="item.title" @click="clickHandler(item.to)">{{ item.title }}
        </MainAppBarNavItem>
      </div>
    </div>
    <div class="main-app-bar-right">
      <UserButton class="user__button" />
      <Button @click="clickHandlerBookNow">Book Now</Button>
      <MainAppBarMobileMenu />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: $margin;

  &-left {
    display: flex;
    align-items: center;
    height: 100%;
    gap: $p-margin;
  }

  &-right {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    justify-items: end;
    grid-gap: 20px;
  }
}

.imgLogo {
  cursor: pointer;
}

.nav-items {
  display: none;

  @media (min-width: $desktop) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $unit;
  }
}


.user__button {
  display: none;

  @media (min-width: 418px) {
    display: inline-flex;
  }
}
</style>