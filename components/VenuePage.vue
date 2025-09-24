<template>
    <SectionContainer v-if="selectedVenue">
        <h2>{{ selectedVenue.name }}</h2>
        <VCarousel v-model="currentCarouselIndex" :show-arrows="carouselImages.length > 1" hide-delimiters
            class="venue-carousel" cycle :interval="15000" :height="carouselHeight">
            <VCarouselItem v-for="(image, index) in carouselImages" :key="index" :src="image" cover
                class="carousel-item">
            </VCarouselItem>
        </VCarousel>
        <div class="venue__info_container">
            <div class="venue-info">
                <SportVenueItem :locationKey="selectedVenue.key" :sportSlug="sport" />
                <VenueAddress :color="sportColor">{{ selectedVenue.address }}</VenueAddress>
            </div>
            <div class="venue-actions">
                <Button @click="clickHandlerBookNow">Book Now</Button>
            </div>
        </div>
        <!-- <div class="venue__details_container">
            <div>
                <h3 :style="{ color: sportColor }">About {{ selectedVenue.name }}</h3>
                <p>{{ selectedVenue.description }}</p>
            </div>
            <div class="venue__contact_info">
                <h3 :style="{ color: sportColor }">Contact Information</h3>
                <span class="contact_info__details">
                    <p>
                        <VIcon :color="sportColor" class="mr-2" icon="mdi-phone" />{{ selectedVenue.contact }}
                    </p>
                    <p>
                        <VIcon :color="sportColor" class="mr-2" icon="mdi-email" />{{ selectedVenue.email }}
                    </p>
                </span>
            </div>
        </div> -->
    </SectionContainer>
    <SectionContainer v-if="selectedVenue">
        <div>
            <h3 :style="{ color: sportColor }">About {{ selectedVenue.name }}</h3>
            <p>{{ selectedVenue.description }}</p>
        </div>
    </SectionContainer>
    <SectionContainer v-if="selectedVenue">
        <div class="venue__contact_info">
            <h3 :style="{ color: sportColor }">Contact Information</h3>
            <span class="contact_info__details">
                <p>
                    <VIcon :color="sportColor" class="mr-2" icon="mdi-phone" />{{ selectedVenue.contact }}
                </p>
                <p>
                    <VIcon :color="sportColor" class="mr-2" icon="mdi-email" />{{ selectedVenue.email }}
                </p>
            </span>
        </div>
    </SectionContainer>
</template>

<script setup lang="ts">

const route = useRoute()
const router = useRouter()
const venueKey = route.params.venuekey as string
const sport = route.query.sport as string

const locationsStore = useLocationsStore()
const selectedVenue = computed(() => {
    return locationsStore.getLocationByKey(venueKey)
})


// Theme and sport color

const sportColor = computed(() => {
    if (sport === 'futsal') {
        return 'green'
    } else if (sport === 'pickleball') {
        return "#2282d6"
    }
    return ''
})

// Operating hours computed property
// const operatingHours = computed(() => {
//     if (selectedVenue.value?.tillMidnight === 'true') {
//         return 'Open until midnight'
//     }
//     return 'Standard hours'
// })

// Carousel images - combine publicId and gallery images
const carouselHeight = computed(() => {
    if (!window) return '500'
    if (window.innerWidth > 768) {
        return '500'
    }
    return '300'
})
const carouselImages = computed(() => {
    const images: string[] = []

    // Add main publicId image first if it exists
    if (selectedVenue.value?.publicId) {
        images.push(`https://res.cloudinary.com/thearksg/image/upload/website/${selectedVenue.value.publicId}`)
    }

    // Add gallery images
    if (selectedVenue.value?.gallery && selectedVenue.value.gallery.length > 0) {
        selectedVenue.value.gallery.forEach((image) => {
            images.push(`https://res.cloudinary.com/thearksg/image/upload/${image}`)
        })
        // images.push(...selectedVenue.value.gallery)
        // images.push(`https://res.cloudinary.com/thearksg/image/upload/website/${selectedVenue.value.publicId}`)
    }

    // If no images at all, return empty array
    return images
})

// Carousel state
const currentCarouselIndex = ref(0)

// Gallery modal functionality
const showGalleryModal = ref(false)
const currentImageIndex = ref(0)

function openGalleryModal(index: number) {
    currentImageIndex.value = index
    showGalleryModal.value = true
}

function closeGalleryModal() {
    showGalleryModal.value = false
}

function nextImage() {
    if (selectedVenue.value && currentImageIndex.value < selectedVenue.value.gallery.length - 1) {
        currentImageIndex.value++
    }
}

function previousImage() {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--
    }
}

// Keyboard navigation for gallery
onMounted(() => {
    const handleKeydown = (event: KeyboardEvent) => {
        if (showGalleryModal.value) {
            switch (event.key) {
                case 'Escape':
                    closeGalleryModal()
                    break
                case 'ArrowLeft':
                    previousImage()
                    break
                case 'ArrowRight':
                    nextImage()
                    break
            }
        }
    }

    document.addEventListener('keydown', handleKeydown)

    onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown)
    })
})

// Book now functionality
function clickHandlerBookNow() {
    if (selectedVenue.value) {
        router.push(`/booking?sport=${sport}&venue=${selectedVenue.value.name}`)
    }
}
</script>

<style lang="scss" scoped>
.venue__info_container {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: $margin;

    @media (max-width: $mobile) {
        grid-template-columns: 1fr;
    }
}

.venue-info {
    display: flex;
    flex-direction: column;
    gap: $margin;

    @media (max-width: $mobile) {
        flex-direction: column;
        align-items: center;
    }
}

.venue-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: $margin;

    @media (max-width: $mobile) {
        justify-content: center;
    }
}

.venue__details_container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: $margin;

    @media (max-width: $mobile) {
        gap: $margin-md;
        grid-template-columns: 1fr;
    }
}

.venue__contact_info {
    display: flex;
    flex-direction: column;
    gap: $margin;

    .contact_info__details {
        display: flex;
        flex-direction: column;
        gap: $margin;
    }
}

.venue-page {
    width: 100%;
}

// Hero Carousel Section
.hero-carousel-container {
    position: relative;
    width: 100%;
}

.venue-carousel {

    .v-carousel__controls {
        background: rgba(0, 0, 0, 0.3) !important;
    }

    .v-carousel__controls__item {
        color: rgba(255, 255, 255, 0.7) !important;

        &--active {
            color: white !important;
        }
    }

    background: linear-gradient(to bottom,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.6) 100%);

}

.carousel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom,
            rgba(0, 0, 0, 0.2) 0%,
            rgba(0, 0, 0, 0.6) 100%);
    z-index: 1;
}

.venue-info {
    .venue-title {
        font-size: 2.5rem;
        font-weight: 600;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);

        @media (max-width: $mobile) {
            font-size: 2rem;
        }
    }

    .venue-address {
        font-size: 1.1rem;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }

    .venue-actions {
        @media (max-width: $mobile) {
            display: flex;
            flex-direction: column;
            gap: $margin;

            .v-btn {
                margin-right: 0 !important;
            }
        }
    }
}

// Contact Information
.contact-info {
    .contact-item {
        display: flex;
        align-items: center;

        .contact-link {
            color: inherit;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

// Gallery Modal
.gallery-dialog {
    .v-overlay__content {
        max-width: 95vw !important;
        max-height: 95vh !important;
    }
}

.gallery-modal-card {
    background: rgba(0, 0, 0, 0.95) !important;

    .v-toolbar {
        background: transparent !important;
    }
}

.modal-carousel {
    .v-carousel__controls {
        background: rgba(0, 0, 0, 0.5) !important;
    }

    .v-carousel__controls__item {
        color: rgba(255, 255, 255, 0.7) !important;

        &--active {
            color: white !important;
        }
    }
}

.modal-carousel-item {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>