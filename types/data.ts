/**
 * Credit Transaction Types - Main Ledger
 */
export type CreditTransactionType =
  | "PURCHASE" // Credit package purchased
  | "USAGE" // Credits used for booking
  | "REFUND" // Credits refunded (full booking cancellation)
  | "PARTIAL_REFUND" // Credits refunded (partial slot cancellation)
  | "EXPIRY" // Credits expired
  | "ADJUSTMENT"; // Manual adjustment by admin

export type CreditTransactionSlot = {
  start: string;
  end: string;
  rate: number;
  duration: number;
  color?: string;
  type: string;
  pitch: string;
  date: string;
  typeOfSports: string;
};

export type CreditType = "PACKAGE" | "REFUND";

export type CreditTransaction = {
  id: string;
  key?: string;
  userKey: string;
  email: string;
  name: string;
  contact: string;
  type: CreditTransactionType;
  creditType?: CreditType; // Which type of credit was used (for USAGE transactions)
  timestamp: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  bookingKey?: string;
  packageKey?: string;
  description: string;
  notes?: string;
  createdBy?: string;
  bookingDate?: string;
  location?: string;
  slots?: CreditTransactionSlot[];
  slotKeys?: string[];
};

export type CreditTransactionData = {
  [key: string]: CreditTransaction;
};

/**
 * Package Allocation Types - Detail Ledger
 */
export type PackageAllocation = {
  id: string;
  key?: string;
  transactionId: string;
  packageKey: string;
  collection: "creditPackages" | "creditRefunds"; // Which collection this credit is from
  amount: number; // Negative for usage, positive for refund/purchase
  packageBalanceBefore: number;
  packageBalanceAfter: number;
  timestamp: string;
  userKey: string;
  email: string;
};

export type PackageAllocationData = {
  [key: string]: PackageAllocation;
};

// Sport-specific gallery data structure
export interface SportsGallery {
  gallery: string[];
  public_id: string;
}

// Record of sport names to their galleries (e.g., "Futsal", "Pickleball")
export type SportsGalleries = Record<string, SportsGallery>;

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
  sportsGalleries?: SportsGalleries; // Optional: sport-specific image galleries
}

export interface VenuesData {
  [key: string]: Venue;
}

export type Pitch = {
  key: string;
  locationKey: string;
  name: string;
  size: number;
  id?: string;
  typeOfSports: string;
  startDate: string;
  endDate: string;
  active: boolean;
  websiteActive?: boolean;
  websiteStartDate?: string;
  websiteEndDate?: string;
  backendActive?: boolean;
  backendStartDate?: string;
  backendEndDate?: string;
  automatePitchId?: string;
  allowCancellation?: boolean; // Default: true. If false, hide cancel/delete on customer website
};

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
  typeOfSports: string;
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
  typeOfSports: string;
  automatePitchId?: string;
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
  automatePitchId?: string;
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
  targetPitches?: string[];
  targetSpecificPitches?: boolean;
  typeOfSports?: string[];
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

/**
 * Partial Cancellation record - tracks individual slot deletions
 */
export type PartialCancellation = {
  slotKey: string;
  slotRate: number;
  cancelledDate: string;
  cancelledBy: string;
  creditRefundKey?: string;
};

export type Booking = CustomerDetails &
  CostData & {
    location: string;
    slots: string[];
    paymentMethod: string;
    paymentStatus: string;
    submittedDate: string;
    invoiceKey?: string;
    creditReceiptKey?: string;
    key?: string;
    date: string;
    amount?: string;
    typeOfSports: string;

    // Partial cancellation fields
    cancelledSlots?: string[]; // Slot keys that were partially cancelled
    refundAmount?: number; // Cumulative refund amount (slot.rate values)
    partialCancellations?: PartialCancellation[]; // Audit trail for partial cancellations
    pendingCancelledSlots?: string[]; // Slot keys pending cancellation approval
  };

export type BookingDetails = {
  location: string;
  slots: BookingSlotDetails[];
  bookingKey?: string;
  slotKeys?: string[];
  date: string;
  typeOfSports: string;
};

export interface CancelledBooking extends Booking {
  cancelledBy: string;
  cancelledDate: string;
  status: "cancelled";
}

export type CancelledBookingData = { [key: string]: CancelledBooking };

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

export type DatabaseVersion = "rtdb" | "firestore";

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
    bookingKey?: string;
    creditPackageKey?: string;
    creditRefundKey?: string;
    originalBookingKey?: string;
    typeOfSports?: string;
    databaseVersion?: DatabaseVersion;
  };

export type InvoiceSlot = {
  pitch: number | string;
  start: string;
  end: string;
  rate: number;
  duration: number;
  type: string;
  date: string;
  typeOfSports: string;
  automatePitchId?: string;
};

export type InvoiceBooking = Invoice & BookingDetails;
export type InvoicePackage = Invoice & PackageDetails;

export type Presale = TotalCostData &
  CustomerDetails &
  PaymentData & {
    id: string;
    submittedDate: string;
    invoiceType: InvoiceType;
    typeOfSports?: string;
    databaseVersion?: DatabaseVersion;
  };

export type PresaleBooking = Presale & BookingDetails;
export type PresalePackage = Presale & PackageDetails;

export type CreditReceipt = BookingDetails & {
  id: string;
  name: string;
  contact: string;
  email: string;
  userKey: string; // Using userKey to match existing credit receipt data in database
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
  automatePitchId?: string;
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

  // Optional fields for refund credits stored in creditPackages (legacy)
  invoiceKey?: string;
  originalBookingKey?: string;
  cancelledDate?: string;
  cancelledBy?: string;
};

export type CreditRefund = {
  // Customer Details
  name: string;
  contact: string;
  email: string;
  userKey: string;

  // Credit Details
  amount: string;
  value: string;
  creditsLeft: number;
  expiryDate: string;
  key?: string;

  // Payment/Status
  paymentMethod: PaymentMethods.REFUND;
  paymentStatus: string;
  submittedDate: string;

  // Refund Metadata (optional for backward compatibility with legacy refunds)
  refundInvoiceKey?: string;
  originalBookingKey?: string;
  cancelledDate?: string;
  cancelledBy?: string;

  // Package Details
  creditPackage: PackageDetails;
};

export type CreditRefundData = { [key: string]: CreditRefund };

export type PackageDetails = {
  title: string;
  name?: string; // Legacy field from database
  amount: string;
  expiryPeriod: number;
  type: string;
  unit: string;
  value: string;
  id: string;
  typeOfSports: string;
  image?: string;
};

export type Config = {
  popup: ConfigPopup[];
  sportsTypes: SportType[];
};

export type ConfigPopup = {
  typeOfSports: string;
  imgSrc: string;
  route: string;
  popup: boolean;
};

export type SportType = {
  active: boolean;
  name: string;
  terminology: {
    plural: string;
    singular: string;
  };
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
