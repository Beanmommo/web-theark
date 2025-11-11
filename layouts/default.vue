<template>
  <ClientOnly>
    <PromotionDialog />
  </ClientOnly>
  <LayoutBase>
    <template #header>
      <ClientOnly>
        <MainAppBar />
      </ClientOnly>
    </template>
    <template #main>
      <slot />
    </template>
    <template #footer>
      <MainFooter />
    </template>
  </LayoutBase>
</template>