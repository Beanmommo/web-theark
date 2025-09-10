export type Sport = {
  name: string;
  slug: string;
  tag: string;
  startingRate: number;
  icon: string;
  theme: Theme;
};

export type Theme = {
  dark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    error: string;
  };
};
