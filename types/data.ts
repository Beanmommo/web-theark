export interface Venue {
  active: boolean;
  address: string;
  bcc: string;
  contact: string;
  description: string;
  email: string;
  gallery: string[];
  key: string;
  lat: string;
  lng: string;
  name: string;
  publicId: string;
  tillMidnight: string;
}

export interface VenuesData {
  [key: string]: Venue;
}

export interface Pitch {
  key: string;
  name: string;
  size: number;
  locationKey: string;
  typeOfSports: string;
}

export type Timeslot = {
  days: string[];
  endTime: string;
  key: string;
  location: string;
  locationKey: string;
  name: string;
  premiumRate: string;
  rate: string;
  startTime: string;
  timePerSlot: string;
  type: string;
  newRate: string;
  startDate: string;
  color: string;
};

export interface Holiday {
  date: string;
  name: string;
}

export type BookedSlot = {
  key?: string;
  bookingKey?: string;
  invoiceKey?: string;
  location: string;
  submittedDate: string;

  contact: string;
  email: string;
  name: string;

  date: string;
  pitch: number | string;
  start: string;
  end: string;
  rate: number;
  duration: number;
  type: string;

  paymentMethod: string;
  paymentStatus: string;
};

export type SlotDetails = {
  start: string;
  end: string;
  rate: number;
  duration: number;
  color: string | null;
  type: string;
};

export type BookingSlotDetails = SlotDetails & {
  date: string;
  pitch: number | string;
  typeOfSports: string;
};

export type GroupedTimeslots = {
  [key: string]: BookingSlotDetails[];
};

export type PromoCode = {
  key: string;
  locations: string[];
  name: string;
  promocode: string;
  startDate: string;
  timeslotTypes: string[];
  type: string;
  validTill: string;
  value: string;
  publishEnd: string;
  publishStart: string;
};

export type Blockout = {
  key: string;
  location: string;
  startDate: string;
  endDate: string;
};

export type ConfigTerm = {
  html: string;
  locations: string[];
};

export enum PaymentMethods {
  PAYNOW = "PayNow",
  CREDIT_CARD = "Credit Card",
  MEMBERSHIP_CREDIT = "Credit",
  REFUND = "Refund",
}

export type TotalCostData = {
  subtotal: number;
  total: number;
  gst: number;
  gstPercentage: number;
  totalPayable: number;
  discount: number;
  promocode: string;
  transactionPercentage: number;
  transactionFee: number;
};

export type CostData = {
  subtotal: number;
  total: number;
  gst: number;
  totalPayable: number;
  discount: number;
  transactionFee: number;
};

export type CustomerDetails = {
  name: string;
  contact: string;
  email: string;
  userId: string;
};

export type Booking = CustomerDetails &
  CostData & {
    location: string;
    slots: string[];
    paymentMethod: string;
    paymentStatus: string;
    submittedDate: string;
    invoiceKey?: string;
    key?: string;
    date: string;
    amount?: string;
    typeOfSports: string;
  };

export type BookingDetails = {
  location: string;
  slots: BookingSlotDetails[];
  bookingKey?: string;
  slotKeys?: string[];
  date: string;
  typeOfSports: string;
};

export type DBSPaymentDetails = {
  amtDtls: {
    txnAmt: number;
    txnCcy: string;
  };
  customerReference: string;
  receivingParty: {
    accountNo: string;
    name: string;
  };
  senderParty: {
    name: string;
    senderBankId: string;
  };
  txnDate: string;
  txnRefId: string;
  txnType: string;
  valueDt: string;
};

export type StripePaymentDetails = {
  paymentIntentId: string;
  paymentMethodId: string;
};

export enum InvoiceType {
  CREDITPACKAGE = "Credit Package",
  BOOKING = "Booking",
}

export type Invoice = TotalCostData &
  CustomerDetails &
  PaymentData & {
    id: string;
    paymentDetails?: DBSPaymentDetails | StripePaymentDetails;
    presaleId?: string;
    submittedDate: string;
    invoiceType: InvoiceType;
    location: string;
    date?: string;
    slots: InvoiceSlot[];
  };

export type InvoiceSlot = {
  pitch: number | string;
  start: string;
  end: string;
  rate: number;
  duration: number;
  type: string;
  date: string;
};

export type InvoiceBooking = Invoice & BookingDetails;
export type InvoicePackage = Invoice & PackageDetails;

export type Presale = TotalCostData &
  CustomerDetails &
  PaymentData & {
    id: string;
    submittedDate: string;
    invoiceType: InvoiceType;
  };

export type PresaleBooking = Presale & BookingDetails;
export type PresalePackage = Presale & PackageDetails;

export type CreditReceipt = BookingDetails & {
  id: string;
  submittedDate: string;
  creditPackageKeys: string[];
  remainingCredits: number;
  total: number;
};

export type PaymentData = {
  paymentMethod: PaymentMethods;
  paymentStatus: string;
};

export type BookedSlotData = { [key: string]: BookedSlot };

export type CreditPackageData = { [key: string]: CreditPackage };

export type BookingData = { [key: string]: Booking };

export type AutomateSlot = SlotDetails & {
  slotKey: string;
  bookingKey: string;
  name: string;
  email: string;
  submittedDate: string;
  location: string;
  pitch: number | string;
  date: string;
};

export type CreditPackage = {
  amount: string;
  creditsLeft: number;
  expiryDate: string;
  key?: string;
  userKey: string;
  value: string;
  paymentMethod: PaymentMethods;
  submittedDate: string;
  paymentStatus: string;
  name: string;
  email: string;
  contact: string;
  creditPackage: PackageDetails;
};

export type PackageDetails = {
  title: string;
  amount: string;
  expiryPeriod: number;
  type: string;
  unit: string;
  value: string;
  id: string;
  typeOfSports: string;
};

export type Config = {
  imgSrc: string;
  popup: boolean;
};

export type Page = {
  content: string;
  key: string;
  name: string;
  url: string;
  active: boolean;
};

export type User = {
  contact: string;
  name: string;
  email: string;
  uid: string;
};
