<script setup lang="ts">
import type { Sport } from '../types/sport'
import type { PropType } from 'vue'

const props = defineProps({
    sport: {
        type: Object as PropType<Sport>,
        required: true
    }
})

const router = useRouter()

function clickHandlerViewVenues() {
    router.push(`/${props.sport.name}`)
}
</script>

<template>
    <div class="sportCardItem">
        <template v-if="props.sport">
            <div class="sport__icon">
                <VIcon :icon="props.sport.icon" />
            </div>
            <div class="item__content">
                <h3>{{ props.sport.name }}</h3>
                <p>From SGD ${{ props.sport.startingRate }}/hour</p>
                <sub>{{ props.sport.tag }}</sub>
                <div class="buttons__container">
                    <Button @click="clickHandlerViewVenues">View
                        Venues</Button>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.sportCardItem {
    display: grid;
    box-shadow: $box-shadow;
    grid-template-columns: 1fr;

    .sport__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: $margin;
        background: #0000009a;
        color: white;
    }

    .item__content {
        display: grid;
        grid-gap: $margin;
        color: black;
        padding: $margin;
        justify-self: center;
        text-align: center;
    }

    .buttons__container {
        margin-top: $margin;
        display: flex;
        justify-content: center;
    }
}
</style>
