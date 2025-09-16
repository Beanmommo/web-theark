<script setup lang="ts">
import type { Sport } from '~/types/sport';

const props = defineProps({
    sport: {
        type: Object as PropType<Sport>,
        required: true
    }
})

const backgroundImage = computed(() => props.sport.backgroundImage)

</script>

<template>
    <section class="sectionSports" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <SportCardItem :sport="sport" />
    </section>
</template>

<style lang="scss" scoped>
.sectionSports {
    background-repeat: no-repeat;
    background-size: cover;
    height: 500px;
    display: grid;
    justify-items: center;
    align-items: center;
}

.title__container {
    display: flex;
    align-items: center;
}

.venues__container {
    display: grid;
    grid-gap: $p-margin;
}
</style>
