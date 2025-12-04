<script setup lang="ts">
import { useTheme } from "vuetify/lib/composables/theme.mjs";

const router = useRouter();
const route = useRoute();
const sportSlug = route.params.sportSlug as string;

// TODO: Make navItems dynamic
const navItems = computed(() => {
  if (sportSlug === "futsal") {
    return [
      { title: "Pickleball", to: "/pickleball" },
      { title: "Packages", to: `/${sportSlug}/packages` },
      { title: "Contact Us", to: `/${sportSlug}/contactus` },
    ];
  }
  if (sportSlug === "pickleball") {
    return [
      { title: "Futsal", to: "/futsal" },
      { title: "Packages", to: `/${sportSlug}/packages` },
      { title: "Contact Us", to: `/${sportSlug}/contactus` },
    ];
  }
  return [
    { title: "Futsal", to: "/futsal" },
    { title: "Pickelball", to: "/pickleball" },
    { title: "Contact Us", to: "/contactus" },
  ];
});

// Conditional rendering of Book Now button - only show when on a sport-specific page
const showBookNowButton = computed(() => {
  return !!sportSlug;
});

function clickHandler(link: string) {
  router.push(link);
}

function handleBookNow() {
  if (sportSlug) {
    router.push(`/${sportSlug}/booking`);
  }
}

const theme = useTheme();
const arkLogo = {
  thearkTheme: "/Logo/theark.png",
  futsalTheme: "/Logo/theark_futsal.svg",
  pickleBallTheme: "/Logo/theark_pickleball.png",
};
const themeLogo = computed(() => {
  const key = theme.global.name.value as keyof typeof arkLogo;
  return arkLogo[key] ?? arkLogo["thearkTheme"];
});

watch(
  () => route.params.sportSlug,
  (newVal) => {}
);
</script>

<template>
  <div class="main-app-bar">
    <div class="main-app-bar-left">
      <img
        class="imgLogo"
        :src="themeLogo"
        alt="The Ark Logo"
        @click="clickHandler('/')"
        width="80px"
      />
      <div class="nav-items">
        <MainAppBarNavItem
          v-for="item in navItems"
          :key="item.title"
          @click="clickHandler(item.to)"
          >{{ item.title }}
        </MainAppBarNavItem>
      </div>
    </div>
    <div class="main-app-bar-right">
      <!-- Book Now Button: Only show when on a sport-specific page -->
      <Button
        v-if="showBookNowButton"
        class="booknow__button form__container--button"
        @click="handleBookNow"
      >
        Book Now</Button
      >
      <ClientOnly>
        <UserButton class="user__button" />
        <MainAppBarMobileMenu />
      </ClientOnly>
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

.booknow__button {
  display: none;

  @media (min-width: 418px) {
    display: inline-flex;
  }
}
</style>
