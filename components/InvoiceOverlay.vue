<script setup lang="ts">
import { useInvoicesStore } from '~/stores/invoices'
import type { Invoice } from '~/types/data'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    invoiceKey: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        default: 'futsal'
    }
})

const emit = defineEmits(['update:modelValue'])

const invoicesStore = useInvoicesStore()
const dayjs = useDayjs()

const invoice = ref<Invoice | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Fetch invoice data when overlay opens
watch(() => props.modelValue, async (isOpen) => {
    if (isOpen && props.invoiceKey) {
        await fetchInvoiceData()
    }
})

// Fetch on mount if already open
onMounted(async () => {
    if (props.modelValue && props.invoiceKey) {
        await fetchInvoiceData()
    }
})

const fetchInvoiceData = async () => {
    loading.value = true
    error.value = null
    try {
        const data = await invoicesStore.fetchInvoiceByKey(props.invoiceKey)
        invoice.value = data as Invoice
    } catch (e) {
        error.value = 'Failed to load invoice data'
        console.error('Error fetching invoice:', e)
    } finally {
        loading.value = false
    }
}

const closeHandler = () => {
    emit('update:modelValue', false)
}

const formattedDate = computed(() => {
    if (!invoice.value?.submittedDate) return ''
    return dayjs(invoice.value.submittedDate).format('DD MMM YYYY, HH:mm')
})

const formattedBookingDate = computed(() => {
    if (!invoice.value?.date) return ''
    return dayjs(invoice.value.date).format('DD MMM YYYY')
})

const invoiceTypeLabel = computed(() => {
    return invoice.value?.invoiceType || 'Invoice'
})

const paymentStatusColor = computed(() => {
    if (!invoice.value) return 'grey'
    return invoice.value.paymentStatus === 'Paid' ? 'success' : 'warning'
})

const sportColor = computed(() => {
    if (props.sport === 'futsal') {
        return 'green'
    } else if (props.sport === 'pickleball') {
        return "#2282d6"
    }
    return ''
})

</script>


<template>
    <VDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="800"
        scrollable>
        <VCard>
            <!-- Header -->
            <VCardTitle class="d-flex justify-space-between align-center"
                :style="{ background: sportColor, color: 'white' }">
                <div class="text-h5">{{ invoiceTypeLabel }}</div>
                <VBtn icon="mdi-close" variant="text" @click="closeHandler" />
            </VCardTitle>

            <!-- Loading State -->
            <VCardText v-if="loading" class="text-center py-8">
                <VProgressCircular indeterminate color="primary" size="64" />
                <div class="mt-4">Loading invoice...</div>
            </VCardText>

            <!-- Error State -->
            <VCardText v-else-if="error" class="text-center py-8">
                <VIcon icon="mdi-alert-circle" color="error" size="64" />
                <div class="mt-4 text-error">{{ error }}</div>
                <VBtn color="primary" class="mt-4" @click="fetchInvoiceData">
                    Retry
                </VBtn>
            </VCardText>

            <!-- Invoice Content -->
            <VCardText v-else-if="invoice" class="invoice-content">
                <!-- Invoice Header Info -->
                <div class="invoice-header mb-6">
                    <VRow>
                        <VCol cols="12" md="6">
                            <div class="text-overline">Invoice Number</div>
                            <div class="text-h6">{{ invoice.id }}</div>
                        </VCol>
                        <VCol cols="12" md="6" class="text-md-right">
                            <div class="text-overline">Date Issued</div>
                            <div class="text-h6">{{ formattedDate }}</div>
                        </VCol>
                    </VRow>
                    <VRow class="mt-2">
                        <VCol cols="12" md="6">
                            <VChip :color="paymentStatusColor" variant="flat">
                                {{ invoice.paymentStatus }}
                            </VChip>
                        </VCol>
                        <VCol cols="12" md="6" class="text-md-right">
                            <div class="text-overline">Payment Method</div>
                            <div class="text-body-1">{{ invoice.paymentMethod }}</div>
                        </VCol>
                    </VRow>
                </div>

                <VDivider class="my-4" />

                <!-- Customer Details -->
                <div class="customer-details mb-6">
                    <div class="text-h6 mb-3">Customer Information</div>
                    <VRow>
                        <VCol cols="12" md="6">
                            <div class="detail-row">
                                <VIcon icon="mdi-account" size="small" class="mr-2" />
                                <span class="text-caption text-medium-emphasis">Name:</span>
                                <span class="ml-2">{{ invoice.name }}</span>
                            </div>
                        </VCol>
                        <VCol cols="12" md="6">
                            <div class="detail-row">
                                <VIcon icon="mdi-email" size="small" class="mr-2" />
                                <span class="text-caption text-medium-emphasis">Email:</span>
                                <span class="ml-2">{{ invoice.email }}</span>
                            </div>
                        </VCol>
                        <VCol cols="12" md="6">
                            <div class="detail-row">
                                <VIcon icon="mdi-phone" size="small" class="mr-2" />
                                <span class="text-caption text-medium-emphasis">Contact:</span>
                                <span class="ml-2">{{ invoice.contact }}</span>
                            </div>
                        </VCol>
                        <VCol cols="12" md="6" v-if="invoice.location">
                            <div class="detail-row">
                                <VIcon icon="mdi-map-marker" size="small" class="mr-2" />
                                <span class="text-caption text-medium-emphasis">Location:</span>
                                <span class="ml-2">{{ invoice.location }}</span>
                            </div>
                        </VCol>
                        <VCol cols="12" md="6" v-if="invoice.date">
                            <div class="detail-row">
                                <VIcon icon="mdi-calendar" size="small" class="mr-2" />
                                <span class="text-caption text-medium-emphasis">Booking Date:</span>
                                <span class="ml-2">{{ formattedBookingDate }}</span>
                            </div>
                        </VCol>
                    </VRow>
                </div>

                <VDivider class="my-4" />

                <!-- Booked Slots -->
                <div class="booked-slots mb-6" v-if="invoice.slots && invoice.slots.length > 0">
                    <div class="text-h6 mb-3">Booked Slots</div>

                    <VTable density="compact">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Pitch</th>
                                <th>Time</th>
                                <th>Duration</th>
                                <th class="text-right">Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(slot, index) in invoice.slots" :key="index">
                                <td>{{ dayjs(slot.date).format('DD MMM YYYY') }}</td>
                                <td>{{ slot.pitch }}</td>
                                <td>{{ slot.start }} - {{ slot.end }}</td>
                                <td>{{ slot.duration }}h</td>
                                <td class="text-right">${{ slot.rate.toFixed(2) }}</td>
                            </tr>
                        </tbody>
                    </VTable>
                </div>

                <VDivider class="my-4" v-if="invoice.slots && invoice.slots.length > 0" />

                <!-- Cost Breakdown -->
                <div class="cost-breakdown mb-4">
                    <div class="text-h6 mb-3">Payment Summary</div>

                    <div class="cost-row">
                        <span>Subtotal</span>
                        <span>${{ invoice.subtotal.toFixed(2) }}</span>
                    </div>

                    <div class="cost-row" v-if="invoice.discount > 0">
                        <span>
                            Discount
                            <span v-if="invoice.promocode" class="text-caption text-medium-emphasis">
                                ({{ invoice.promocode }})
                            </span>
                        </span>
                        <span class="text-success">-${{ invoice.discount.toFixed(2) }}</span>
                    </div>

                    <div class="cost-row">
                        <span>GST ({{ invoice.gstPercentage }}%)</span>
                        <span>${{ invoice.gst.toFixed(2) }}</span>
                    </div>

                    <div class="cost-row" v-if="invoice.transactionFee > 0">
                        <span>
                            Transaction Fee ({{ invoice.transactionPercentage }}%)
                        </span>
                        <span>${{ invoice.transactionFee.toFixed(2) }}</span>
                    </div>

                    <VDivider class="my-2" />

                    <div class="cost-row total-row">
                        <span class="text-h6">Total</span>
                        <span class="text-h6">${{ invoice.total.toFixed(2) }}</span>
                    </div>

                    <div class="cost-row total-payable-row">
                        <span class="text-h5">Amount Paid</span>
                        <span class="text-h5 text-primary">${{ invoice.totalPayable.toFixed(2) }}</span>
                    </div>
                </div>

                <!-- Additional Info -->
                <div v-if="invoice.presaleId" class="mt-4">
                    <div class="text-caption text-medium-emphasis">
                        Reference ID: {{ invoice.presaleId }}
                    </div>
                </div>
            </VCardText>

            <!-- Footer Actions -->
            <VCardActions v-if="invoice">
                <VSpacer />
                <VBtn color="primary" variant="text" @click="closeHandler">
                    Close
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<style scoped lang="scss">
.invoice-content {
    padding: 24px;
}

.detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.cost-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;

    &.total-row {
        padding-top: 12px;
        font-weight: 600;
    }

    &.total-payable-row {
        padding: 16px;
        margin: 8px -16px 0;
        background: rgba(var(--v-theme-primary), 0.05);
        border-radius: 8px;
        font-weight: 700;
    }
}

.invoice-header {
    background: rgba(var(--v-theme-surface), 0.5);
    padding: 16px;
    border-radius: 8px;
}
</style>