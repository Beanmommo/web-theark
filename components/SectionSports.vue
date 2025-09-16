<script setup lang="ts">
import type { Sport } from '~/types/sport';

defineProps({
    sport: {
        type: Object as PropType<Sport>,
        required: true
    }
})

</script>

<template>
    <section class="sectionSports">
        <SportCardItem :sport="sport" />
    </section>
</template>

<style lang="scss" scoped>
.sectionSports {
    background-image: url('https://res.cloudinary.com/thearksg/image/upload/f_auto/v1594089843/website/landingpage_image_slide1.png');
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
