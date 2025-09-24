Changes in Firebase

Add sport/
{
name: "Futsal",
slug: "futsal",
icon: "mdi-soccer",
startingRate: 60,
tag: "Indoor & Outdoor",
theme: "futsalTheme",
backgroundImage:
"https://res.cloudinary.com/thearksg/image/upload/f_auto/v1594089843/website/landingpage_image_slide1.png",
},

Add theme/
futsalTheme: {
dark: false,
colors: {
primary: "#000",
secondary: "#b0bec5",
accent: "#0A8A44",
error: "#b71c1c",
},
},

pitches:

1.  Add typeOfSports: string, sport.slug

packages:

1.  Add typeOfSports: string, sport.slug
2.  Add id: same as package image name in public/Images
