export type Sport = {
  name: string;
  slug: string;
  tag: string;
  startingRate: number;
  icon: string;
  theme: string;
  backgroundImage: string;
  websitePublishDate?: string; // ISO datetime when sport page goes live
  bookingPublishDate?: string; // ISO datetime when booking becomes available
};
