<script setup lang="ts">
const pagesStore = usePagesStore()
const route = useRoute()
useAsyncData(() => pagesStore.getPageByUrl(route.params.url as string))
const { page } = storeToRefs(pagesStore)
</script>

<template>
  <div>
    <PageBannerContent>{{ page?.name }}</PageBannerContent>
    <ClientOnly>
      <div class="container" v-if="page">
        <div v-html="page.content"></div>
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.container {
  margin: 20px auto 60px auto;
  max-width: 1144px;
  padding: $margin;
}
</style>