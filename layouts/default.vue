<template>
  <ClientOnly>
    <PromotionDialog />
    <GlobalAlert />
  </ClientOnly>
  <LayoutBase>
    <template #header>
      <MainAppBar />
    </template>
    <template #main>
      <slot />
    </template>
    <template #footer>
      <MainFooter />
    </template>
  </LayoutBase>
</template>
