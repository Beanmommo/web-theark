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

  message.value = "Deleting Slot";
  loading.value = true;
  isDeletingSlot.value = true;

  try {
    const result = await cancelSlot(
      props.booking.key,
      slotToDeleteKey.value,
      "customer",
      false // Not admin - enforce 72-hour rule
    );

    if (!result.success) {
      showError(result.error || "Failed to delete slot");
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
      showSuccess(
        "Last slot deleted. Booking has been cancelled and credits refunded."
      );
    } else {
      showSuccess(
        result.message ||
          `Slot deleted. $${result.refundAmount} credited to your account.`
      );
    }
  } catch (error) {
    console.error("Delete slot failed:", error);
    showError("Failed to delete slot. Please try again or contact support.");
  } finally {
    loading.value = false;
    isDeletingSlot.value = false;
    message.value = "";
    slotToDelete.value = null;
    slotToDeleteKey.value = "";
    showDeleteSlotDialog.value = false;
    isDeleteSlotMode.value = false; // Exit delete mode after action
  }
}

// Check if booking has multiple slots (show delete option only for multi-slot bookings)
const hasMultipleSlots = computed(() => {
  return bookingSlots.value.length > 1;
});
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
        <div class="pitch-row">
          <span class="pitch">
            {{ pitchName }} {{ slot.pitch }} - {{ slot.start }} to
            {{ slot.end }}
          </span>
          <!-- Delete slot button (only shown in delete mode) -->
          <template v-if="isDeleteSlotMode">
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
    <div class="action">
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
            <VListItem @click="handleClickInvoice">
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
      :modelValue="showInvoice"
      :invoiceKey="booking.invoiceKey"
      @update:modelValue="showInvoice = false"
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
  <ConfirmDialog
    v-model="showDeleteSlotDialog"
    title="Delete Time Slot"
    message="Are you sure you want to delete this time slot?"
    :details="
      slotToDelete
        ? `${pitchName} ${slotToDelete.pitch} - ${slotToDelete.start} to ${
            slotToDelete.end
          }\n\nYou will receive $${
            slotToDelete.rate || 0
          } credits (GST not included) for this refund. Refund credit package valid for 1 month.`
        : ''
    "
    confirm-text="Yes, Delete Slot"
    cancel-text="No, Keep Slot"
    confirm-color="error"
    @confirm="handleConfirmDeleteSlot"
  />
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
