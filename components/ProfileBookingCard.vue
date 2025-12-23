<script setup lang="ts">
import { useTheme } from "vuetify";
import { useBookedSlotsStore } from "../stores/bookedslots";
import { useBookingsStore } from "../stores/bookings";
import { useCreditsStore } from "../stores/credits";
import { usePitchesStore } from "../stores/pitches";
import { useLocationsStore } from "../stores/locations";
import type { Booking, BookedSlot } from "../types/data";
import { VTooltip } from "vuetify/components";

const props = defineProps({
  booking: {
    type: Object as PropType<Booking>,
    required: true,
  },
});

const dayjs = useDayjs();
const bookedslotsStore = useBookedSlotsStore();
const { myBookedslots } = storeToRefs(bookedslotsStore);
const bookingsStore = useBookingsStore();
const creditsStore = useCreditsStore();
const pitchesStore = usePitchesStore();
const locationsStore = useLocationsStore();
const user = useAuthUser();
const { canDeleteSlot, cancelSlot } = usePartialCancellation();

const bookingSlots = ref<BookedSlot[]>([]);
onMounted(() => {
  initialiseData();
});

function initialiseData() {
  if (!props.booking.slots) return;
  props.booking.slots.forEach((slotKey) => {
    if (!myBookedslots.value[slotKey]) return;
    bookingSlots.value.push(myBookedslots.value[slotKey]);
  });
}

const theme = useTheme();
const accentColor = computed(() => {
  return theme.current.value.colors.accent;
});

// Get sport type from booking or fallback to first slot's sport type
const sportType = computed(() => {
  if (props.booking.typeOfSports) return props.booking.typeOfSports;
  // Fallback: get from first booking slot if available
  if (bookingSlots.value.length > 0 && bookingSlots.value[0].typeOfSports) {
    return bookingSlots.value[0].typeOfSports;
  }
  return null;
});

const iconColor = computed(() => {
  if (!sportType.value) return accentColor.value;
  if (sportType.value === "futsal") {
    return "#0A8A44";
  } else if (sportType.value === "pickleball") {
    return "#5A9AD2";
  }
  return accentColor.value;
});

const formatSport = computed(() => {
  if (!sportType.value) return "Unknown";
  return sportType.value.charAt(0).toUpperCase() + sportType.value.slice(1);
});

const showInvoice = ref(false);

function handleClickInvoice() {
  showInvoice.value = true;
}

const isCancelling = ref(false);
const showCancelDialog = ref(false);
const { showSuccess, showError } = useAlert();

function handleClickCancel() {
  if (!props.booking.key) return;
  showCancelDialog.value = true;
}

async function handleConfirmCancel() {
  if (!props.booking.key) return;
  message.value = "Cancelling Booking";

  try {
    loading.value = true;
    isCancelling.value = true;

    // Call the cancellation function
    await bookingsStore.cancelBooking(props.booking.key);

    // Refresh bookings list and credits
    if (user.value) {
      await bookingsStore.fetchMyBookings(user.value.email);
      await bookedslotsStore.fetchMyBookedslots(user.value.email);
      await creditsStore.fetchUserCreditsAndRefunds();
    }
    // Show success message
    showSuccess(
      "Booking cancelled successfully. Credits have been added to your account."
    );
  } catch (error) {
    loading.value = false;
    console.error("Cancellation failed:", error);
    showError("Failed to cancel booking. Please try again or contact support.");
  } finally {
    isCancelling.value = false;
    loading.value = false;
    message.value = "";
  }
}

const isCancellable = computed(() => {
  // Make sure dayjs is configured with timezone plugin and "Asia/Singapore"
  return dayjs()
    .tz("Asia/Singapore")
    .isBefore(
      dayjs(props.booking.date).tz("Asia/Singapore").subtract(72, "hours")
    );
});

const isPastBooking = computed(() => {
  // Check if booking date is before today
  return dayjs(props.booking.date)
    .tz("Asia/Singapore")
    .isBefore(dayjs().tz("Asia/Singapore"), "day");
});

// Only allow cancellation for specific payment methods
const CANCELLABLE_PAYMENT_METHODS = ["PayNow", "Credit Card", "Credit"];
const isCancellablePaymentMethod = computed(() => {
  const paymentMethod = props.booking.paymentMethod;
  return CANCELLABLE_PAYMENT_METHODS.includes(paymentMethod);
});

// Check if any slot's pitch has allowCancellation set to false
// If so, hide cancel/delete options on the customer website
const isPitchCancellationAllowed = computed(() => {
  if (bookingSlots.value.length === 0) return true; // Default to allow if no slots

  // Get the location key for this booking
  const location = locationsStore.getLocation(props.booking.location);
  if (!location) return true; // Default to allow if location not found

  // Check each slot's pitch
  for (const slot of bookingSlots.value) {
    // Find the pitch matching this slot
    // Match by: locationKey, pitch name, and typeOfSports
    const pitch = pitchesStore.pitches.find(
      (p) =>
        p.locationKey === location.key &&
        p.name === String(slot.pitch) &&
        p.typeOfSports?.toLowerCase() === slot.typeOfSports?.toLowerCase()
    );

    // If pitch found and has allowCancellation explicitly set to false, disallow
    if (pitch && pitch.allowCancellation === false) {
      return false;
    }
  }

  return true; // Default: allow cancellation
});

const configStore = useConfigStore();

const pitchName = computed(() => {
  return configStore.getSportTerminology(
    sportType.value || "futsal", // Default to futsal if no sport type
    "singular"
  );
});

const loading = ref(false);
const message = ref("");

// Partial slot cancellation state
const showDeleteSlotDialog = ref(false);
const slotToDelete = ref<BookedSlot | null>(null);
const slotToDeleteKey = ref<string>("");
const isDeletingSlot = ref(false);
const isDeleteSlotMode = ref(false); // Toggle to show/hide delete buttons
const cancellationReason = ref<string>("");
const otherReason = ref<string>("");

// Cancellation reasons
const cancellationReasons = [
  "Change of plans",
  "Weather concerns",
  "Found another venue",
  "Personal emergency",
  "Other",
];

// Check if a slot can be deleted (72-hour rule)
function getSlotDeletability(slot: BookedSlot) {
  return canDeleteSlot(slot);
}

// Enter delete slot mode (show delete buttons)
function handleClickDeleteSlotMode() {
  isDeleteSlotMode.value = true;
}

// Exit delete slot mode
function handleCancelDeleteSlotMode() {
  isDeleteSlotMode.value = false;
}

// Handle delete slot click
function handleClickDeleteSlot(slot: BookedSlot, slotKey: string) {
  slotToDelete.value = slot;
  slotToDeleteKey.value = slotKey;
  showDeleteSlotDialog.value = true;
}

// Handle confirm delete slot
async function handleConfirmDeleteSlot() {
  if (!slotToDelete.value || !slotToDeleteKey.value || !props.booking.key)
    return;

  // Validate cancellation reason
  if (!cancellationReason.value) {
    showError("Please select a cancellation reason");
    return;
  }

  if (cancellationReason.value === "Other" && !otherReason.value.trim()) {
    showError("Please provide details for 'Other' reason");
    return;
  }

  message.value = "Submitting Cancellation Request";
  loading.value = true;
  isDeletingSlot.value = true;

  try {
    const result = await cancelSlot(
      props.booking.key,
      slotToDeleteKey.value,
      user.value?.email || "customer",
      cancellationReason.value,
      cancellationReason.value === "Other" ? otherReason.value : undefined,
      false // Not admin - enforce 72-hour rule
    );

    if (!result.success) {
      showError(result.error || "Failed to submit cancellation request");
      return;
    }

    // Refresh data
    if (user.value) {
      await bookingsStore.fetchMyBookings(user.value.email);
      await bookedslotsStore.fetchMyBookedslots(user.value.email);
      await creditsStore.fetchUserCreditsAndRefunds();
    }

    // Refresh local slot list
    bookingSlots.value = [];
    initialiseData();

    if (result.isLastSlot) {
      showSuccess("This is the last slot. Please use Cancel Booking option.");
    } else {
      showSuccess(
        result.message ||
          "Slot cancellation request submitted. Pending admin approval."
      );
    }
  } catch (error) {
    console.error("Delete slot failed:", error);
    showError(
      "Failed to submit cancellation request. Please try again or contact support."
    );
  } finally {
    loading.value = false;
    isDeletingSlot.value = false;
    message.value = "";
    slotToDelete.value = null;
    slotToDeleteKey.value = "";
    cancellationReason.value = "";
    otherReason.value = "";
    showDeleteSlotDialog.value = false;
    isDeleteSlotMode.value = false; // Exit delete mode after action
  }
}

// Check if booking has multiple slots (show delete option only for multi-slot bookings)
const hasMultipleSlots = computed(() => {
  return bookingSlots.value.length > 1;
});

// Check if menu should be shown (has at least one visible item)
const shouldShowMenu = computed(() => {
  // Check if cancel/delete options should be shown
  const showCancelOptions =
    !isPastBooking.value &&
    isCancellablePaymentMethod.value &&
    isPitchCancellationAllowed.value;

  // Check if View Invoice should be shown
  const showInvoiceOption = !!props.booking.invoiceKey;

  // Show menu if either cancel options or invoice option is available
  return showCancelOptions || showInvoiceOption;
});

// Check if slot is pending cancellation
function isSlotPending(slotKey: string): boolean {
  return props.booking.pendingCancelledSlots?.includes(slotKey) || false;
}
</script>

<template>
  <Loading :message="message" v-if="loading" />
  <div class="profileBookingCard">
    <img
      src="/Icon/activity_booking_icon.svg"
      alt="Booking Icon"
      class="icon"
      :style="{ background: iconColor }"
    />
    <div class="location__date">
      <b>{{ booking.location }}</b>
      <div>{{ dayjs(booking.date).format("DD MMM YYYY") }}</div>
    </div>
    <div class="sport">
      {{ formatSport }}
    </div>
    <div class="total__slots">
      <div>
        ${{ booking.totalPayable ? booking.totalPayable : booking.amount }}
        <span v-if="booking.refundAmount" class="refund-amount">
          (Refunded: ${{ booking.refundAmount }})
        </span>
      </div>
      <template v-for="(slot, index) in bookingSlots" :key="slot.key || index">
        <div
          class="pitch-row"
          :class="{
            'pitch-pending': isSlotPending(booking.slots?.[index] || ''),
          }"
        >
          <v-chip
            v-if="isSlotPending(booking.slots?.[index] || '')"
            color="warning"
            size="x-small"
            class="pending-badge"
          >
            Pending
          </v-chip>
          <span class="pitch">
            {{ pitchName }} {{ slot.pitch }} - {{ slot.start }} to
            {{ slot.end }}
          </span>
          <!-- Delete slot button (only shown in delete mode and not pending) -->
          <template
            v-if="
              isDeleteSlotMode && !isSlotPending(booking.slots?.[index] || '')
            "
          >
            <VTooltip
              v-if="!getSlotDeletability(slot).canDelete"
              location="left"
            >
              <template #activator="{ props: tooltipProps }">
                <VBtn
                  v-bind="tooltipProps"
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="text"
                  color="grey"
                  disabled
                  class="delete-slot-btn"
                />
              </template>
              <span>{{ getSlotDeletability(slot).reason }}</span>
            </VTooltip>
            <VBtn
              v-else
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              class="delete-slot-btn"
              @click.stop="
                handleClickDeleteSlot(slot, booking.slots?.[index] || '')
              "
            />
          </template>
        </div>
      </template>
      <!-- Cancel delete mode button -->
      <div v-if="isDeleteSlotMode" class="cancel-delete-mode">
        <VBtn
          size="x-small"
          variant="text"
          color="grey"
          @click="handleCancelDeleteSlotMode"
        >
          Cancel
        </VBtn>
      </div>
    </div>
    <div class="action" v-if="shouldShowMenu">
      <div>
        <VBtn icon="mdi-dots-vertical" density="compact" variant="plain" />
        <VMenu activator="parent">
          <VList density="compact">
            <!-- Hide cancel/delete options for past bookings, non-cancellable payment methods, or pitches with cancellation disabled -->
            <template
              v-if="
                !isPastBooking &&
                isCancellablePaymentMethod &&
                isPitchCancellationAllowed
              "
            >
              <!-- Delete Time Slot option (only for multi-slot bookings) -->
              <VListItem
                v-if="hasMultipleSlots"
                @click="handleClickDeleteSlotMode"
              >
                <template #prepend>
                  <VIcon icon="mdi-calendar-remove" color="orange" />
                </template>
                <VListItemTitle>Delete Time Slot</VListItemTitle>
              </VListItem>

              <!-- Cancel Booking option -->
              <VTooltip v-if="!isCancellable" location="right">
                <template #activator="{ props }">
                  <div v-bind="props">
                    <VListItem disabled>
                      <template #prepend>
                        <VIcon icon="mdi-close" color="red" />
                      </template>
                      <VListItemTitle color="red">
                        Cancel Booking
                      </VListItemTitle>
                    </VListItem>
                  </div>
                </template>
                <span
                  >Cancellation is not allowed 72 hours before the booking
                  date</span
                >
              </VTooltip>
              <VListItem v-else @click="handleClickCancel">
                <template #prepend>
                  <VIcon icon="mdi-close" color="red" />
                </template>
                <VListItemTitle color="red"> Cancel Booking </VListItemTitle>
              </VListItem>
            </template>
            <VListItem v-if="booking.invoiceKey" @click="handleClickInvoice">
              <template #prepend>
                <VIcon icon="mdi-invoice-text-outline" />
              </template>
              <VListItemTitle>View Invoice</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </div>
    </div>
  </div>
  <template v-if="booking.invoiceKey">
    <InvoiceOverlay
      v-model="showInvoice"
      :invoiceKey="booking.invoiceKey"
      :sport="sportType || 'futsal'"
    />
  </template>

  <!-- Cancel Booking Confirmation Dialog -->
  <ConfirmDialog
    v-model="showCancelDialog"
    title="Cancel Booking"
    message="Are you sure you want to cancel this booking?"
    :details="`You will receive $${booking.subtotal} credits (GST + transaction fee not included) for this booking refund. Refund credit package valid for 1 month.`"
    confirm-text="Yes, Cancel Booking"
    cancel-text="No, Keep Booking"
    confirm-color="error"
    @confirm="handleConfirmCancel"
  />

  <!-- Delete Slot Confirmation Dialog -->
  <VDialog v-model="showDeleteSlotDialog" max-width="500" persistent>
    <VCard>
      <VCardTitle class="text-h6">Request Slot Cancellation?</VCardTitle>
      <VCardText v-if="slotToDelete">
        <p class="mb-3">
          This will submit a cancellation request for admin approval.
        </p>
        <div class="slot-details-box">
          <strong>{{ pitchName }} {{ slotToDelete.pitch }}</strong
          ><br />
          {{ slotToDelete.start }} to {{ slotToDelete.end }}<br />
          <span class="refund-text"
            >Refund: ${{ slotToDelete.rate || 0 }} (GST not included)</span
          >
        </div>

        <!-- Cancellation Reason Selection -->
        <VSelect
          v-model="cancellationReason"
          :items="cancellationReasons"
          label="Cancellation Reason *"
          variant="outlined"
          density="compact"
          class="mt-4"
        />

        <!-- Other Reason Text Field -->
        <VTextField
          v-if="cancellationReason === 'Other'"
          v-model="otherReason"
          label="Please specify *"
          variant="outlined"
          density="compact"
          class="mt-2"
        />

        <VAlert type="warning" density="compact" class="mt-3">
          This request requires admin approval. The slot will remain booked
          until approved.
        </VAlert>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="showDeleteSlotDialog = false"
          :disabled="isDeletingSlot"
        >
          Cancel
        </VBtn>
        <VBtn
          color="warning"
          variant="flat"
          @click="handleConfirmDeleteSlot"
          :loading="isDeletingSlot"
        >
          Submit Request
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.profileBookingCard {
  display: grid;
  align-items: center;
  grid-template-columns: 100px 30% 15% 1fr 50px;
  column-gap: 1rem;
  box-shadow: $box-shadow;
  padding: $margin;

  .icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    padding: $unit;
  }
}

.total__slots {
  justify-self: end;
  text-align: right;

  .refund-amount {
    font-size: 0.75rem;
    color: #0a8a44;
    font-weight: 500;
  }
}

.pitch-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &.pitch-pending {
    background-color: #fff3e0;
  }

  .pending-badge {
    font-size: 0.65rem;
    height: 18px;
    font-weight: 600;
  }

  .pitch {
    font-size: 0.7rem;
  }

  .delete-slot-btn {
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
      opacity: 1;
    }
  }
}

.slot-details-box {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;

  .refund-text {
    color: #ff6b00;
    font-weight: 600;
  }
}

.cancel-delete-mode {
  margin-top: 0.25rem;
}

.pitch {
  font-size: 0.7rem;
}

.action {
  justify-self: end;
}
</style>
