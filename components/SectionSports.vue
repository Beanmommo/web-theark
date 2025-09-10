<script setup lang="ts">
const sportsStore = useSportsStore()
const { sports } = storeToRefs(sportsStore)
</script>

<template>
    <SectionContainer>
        <div class="title__container">
            <h2>Sports</h2>
        </div>
        <div class="sports__container">
            <template v-for="sport in sports">
                <SportCardItem :sport="sport" />
            </template>
        </div>
    </SectionContainer>
</template>

<style lang="scss" scoped>
.title__container {
    display: flex;
    align-items: center;
}

.venues__container {
    display: grid;
    grid-gap: $p-margin;
}
</style>
