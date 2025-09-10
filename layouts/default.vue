<template>
  <LayoutBase>
    <template #header>
      <ClientOnly>
        <MainAppBar />
      </ClientOnly>
    </template>
    <template #main>
      <!-- <VApp> -->
      <slot />
      <!-- </VApp> -->
    </template>
    <template #footer>
      <MainFooter />
    </template>
  </LayoutBase>
</template>