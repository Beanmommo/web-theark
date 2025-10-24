import { defineStore } from "pinia";
import {
  type BookedSlot,
  type InvoiceBooking,
  type GroupedTimeslots,
  type Presale,
  type AutomateSlot,
  type BookedSlotData,
  type PresaleBooking,
} from "../types/data";

export const useBookedSlotsStore = defineStore("bookedslots", () => {
  const dayjs = useDayjs();
  const bookedslots = ref([] as BookedSlot[]);
  const myBookedslots = ref({} as BookedSlotData);

  const fetchMyBookedslots = async (email: string) => {
    const bookedslotsData = await $fetch(`/api/bookedslots/email/${email}`);
    if (!bookedslotsData) return [];

    myBookedslots.value = bookedslotsData;
    return myBookedslots.value;
  };

  const fetchBookedSlots = async (location: string) => {
    const bookedSlots = await $fetch(`/api/bookedslots/${location}`);
    if (Object.keys(bookedSlots).length === 0) return;
    let bookedslotList: BookedSlot[] = [];
    Object.keys(bookedSlots).forEach((key) => {
      const { paymentMethod, paymentStatus, submittedDate } = bookedSlots[key];
      const expiryDate = dayjs(submittedDate)
        .tz("Asia/Singapore")
        .add(10, "minutes");
      if (
        paymentMethod === "PayNow" &&
        paymentStatus === "Unpaid" &&
        dayjs().isSameOrAfter(expiryDate)
      ) {
        return;
      }

      bookedslotList.push({
        key,
        ...(bookedSlots[key] as BookedSlot),
      });
    });
    bookedslots.value = bookedslotList;
    return bookedslotList;
  };

  const updateBookedSlots = async (
    invoiceData: InvoiceBooking,
    slotKeys: string[],
    bookingKey: string
  ) => {
    let automateSlots = [] as AutomateSlot[];
    const { slots, location, name, email, submittedDate, id } = invoiceData;
    const promises: Promise<any>[] = [];
    slots.forEach(async (slot, index) => {
      const slotKey = slotKeys[index];
      const slotPromise = $fetch(`/api/bookedslots/id/${slotKey}`, {
        method: "POST",
        body: JSON.stringify({
          paymentStatus: "Paid",
          invoiceKey: id,
          bookingKey,
        }),
      });
      promises.push(slotPromise);
      automateSlots.push({
        ...slot,
        slotKey: slotKey,
        bookingKey,
        location,
        name,
        email,
        submittedDate,
        color: null,
        typeOfSports: slot.typeOfSports?.toLowerCase() || "futsal",
      });
    });
    await Promise.all(promises);
    return automateSlots;
  };

  const addAutomateSlots = async (automateSlots: AutomateSlot[]) => {
    // Check environment - only run in production
    const config = useRuntimeConfig();
    const isProduction = config.public.env === "prod";

    if (!isProduction) {
      console.log(
        "🔧 [DEV] Skipping addAutomateSlots - not in production environment"
      );
      console.log(
        "🔧 [DEV] Would have created automated slots for:",
        automateSlots.length,
        "slots"
      );
      return []; // Return empty array to maintain function signature
    }

    console.log(
      "✅ [PROD] Running addAutomateSlots for",
      automateSlots.length,
      "slots"
    );

    const groupByPitch = useGroupBy(automateSlots, "pitch");

    let promises: Promise<any>[] = [];
    Object.keys(groupByPitch).map(async (pitch) => {
      const startSlot = groupByPitch[pitch][0];
      const endSlot = groupByPitch[pitch][groupByPitch[pitch].length - 1];
      let totalDuration = 0;
      groupByPitch[pitch].forEach((slot) => (totalDuration += slot.duration));
      const slotData = {
        slotKey: startSlot.slotKey,
        bookingKey: startSlot.bookingKey,
        date: dayjs(startSlot.date, "YYYY-MM-DD").tz("Asia/Singapore").format(),
        duration: totalDuration,
        end: endSlot.end,
        location: startSlot.location,
        name: startSlot.name,
        email: startSlot.email,
        pitch: `${startSlot.location.split(" ").join("_")}_${startSlot.pitch}`,
        rate: startSlot.rate,
        start: startSlot.start,
        status: "Paid",
        submittedDate: startSlot.submittedDate,
        typeOfSports: startSlot.typeOfSports?.toLowerCase() || "futsal",
      };
      const slotPromise = $fetch(`/api/automate`, {
        method: "POST",
        body: JSON.stringify(slotData),
      });
      promises.push(slotPromise);
    });
    const responses = await Promise.all(promises);

    console.log(
      "✅ [PROD] Successfully created",
      responses.length,
      "automated slots"
    );

    return responses;
  };

  const deleteAutomateSlots = async (automateSlots: AutomateSlot[]) => {
    // Check environment - only run in production
    const config = useRuntimeConfig();
    const isProduction = config.public.env === "prod";

    if (!isProduction) {
      console.log(
        "🔧 [DEV] Skipping deleteAutomateSlots - not in production environment"
      );
      console.log(
        "🔧 [DEV] Would have deleted automated slots for:",
        automateSlots.length,
        "slots"
      );
      return []; // Return empty array to maintain function signature
    }

    console.log(
      "✅ [PROD] Running deleteAutomateSlots for",
      automateSlots.length,
      "slots"
    );

    const groupByPitch = useGroupBy(automateSlots, "pitch");

    let promises: Promise<any>[] = [];
    Object.keys(groupByPitch).map(async (pitch) => {
      const startSlot = groupByPitch[pitch][0];

      const deletePromise = $fetch(`/api/automate.delete`, {
        method: "POST",
        body: JSON.stringify({
          bookedSlotsKey: startSlot.slotKey,
        }),
      });
      promises.push(deletePromise);
    });

    const responses = await Promise.all(promises);
    console.log(
      "✅ [PROD] Successfully deleted",
      responses.length,
      "automated slots"
    );

    return responses;
  };

  const addPendingBookedSlots = async (
    presaleData: PresaleBooking,
    groupedTimeslots: GroupedTimeslots
  ) => {
    const bookedSlots = formatPendingBookedslotsData(
      presaleData,
      groupedTimeslots
    );
    const bookedSlotsKey = await $fetch(`/api/bookedslots`, {
      method: "POST",
      body: JSON.stringify(bookedSlots),
    });
    if (!bookedSlotsKey) return [];
    return bookedSlotsKey;
  };

  function formatPendingBookedslotsData(
    presale: PresaleBooking,
    groupedTimeslots: GroupedTimeslots
  ) {
    let bookedslots: BookedSlot[] = [];
    const submittedDate = dayjs().format();
    Object.keys(groupedTimeslots).forEach((date) => {
      groupedTimeslots[date].forEach((slot) => {
        bookedslots.push({
          location: presale.location,
          submittedDate,
          contact: presale.contact,
          email: presale.email,
          name: presale.name,
          date,
          pitch: slot.pitch,
          start: slot.start,
          end: slot.end,
          rate: slot.rate,
          duration: slot.duration,
          type: slot.type,
          paymentMethod: presale.paymentMethod,
          paymentStatus: presale.paymentStatus,
          typeOfSports: slot.typeOfSports?.toLowerCase() || "futsal",
        });
      });
    });

    return bookedslots;
  }

  const fetchBookedSlotsByDate = async (
    date: string,
    location: string,
    sport?: string
  ) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    const bookedSlots = await $fetch<BookedSlotData>(
      `/api/bookedslots/date/${formattedDate}`
    );
    if (!bookedSlots || Object.keys(bookedSlots).length === 0) return [];

    let bookedslotList: BookedSlot[] = [];
    Object.keys(bookedSlots).forEach((key) => {
      const slot = bookedSlots[key];

      // Skip expired PayNow unpaid slots
      if (
        slot.paymentMethod === "PayNow" &&
        slot.paymentStatus === "Unpaid" &&
        dayjs()
          .tz("Asia/Singapore")
          .isSameOrAfter(
            dayjs(slot.submittedDate).tz("Asia/Singapore").add(10, "minutes")
          )
      ) {
        return;
      }

      // Filter by location
      if (location && slot.location !== location) {
        return;
      }

      // Filter by typeOfSports
      if (sport) {
        const normalizedSport = sport.toLowerCase();
        const slotSport = slot.typeOfSports?.toLowerCase() || "futsal";
        if (slotSport !== normalizedSport) {
          return;
        }
      }

      bookedslotList.push({
        key,
        ...slot,
      });
    });
    bookedslots.value = bookedslotList;
    return bookedslotList;
  };

  return {
    myBookedslots,
    bookedslots,
    fetchMyBookedslots,
    fetchBookedSlots,
    fetchBookedSlotsByDate,
    updateBookedSlots,
    addPendingBookedSlots,
    addAutomateSlots,
    deleteAutomateSlots,
  };
});
