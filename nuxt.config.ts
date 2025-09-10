import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
const ONE_DAY = 60 * 60 * 24 * 1000;
const ONE_WEEK = ONE_DAY * 7;

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Futsal Pitches in Singapore | Football/Street Soccer Court Booking',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: "The Ark futsal pitches in Funan, Orchid Country Club, Cuppage and Plaza 8 Singapore are great spots to play your favorite football game. Visit now for booking street soccer court!" },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [
        {
          src: `https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`,
          async: true,
          defer: true,
        },
      ],
    },
  },

  devtools: { enabled: false },
  build: {
    transpile: ['vuetify'],
  },

  css: [
    '@/assets/scss/main.scss',
  ],

  typescript: { shim: false },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/scss/global.scss";',
        },
      },
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  modules: [
    (_options, nuxt) =>
    {
      nuxt.hooks.hook('vite:extendConfig', (config) =>
      {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    "@nuxtjs/cloudinary",
    "nuxt-lodash",
    'dayjs-nuxt',
    '@pinia/nuxt',
    '@nuxt/fonts',
    'nuxt-security'
  ],

  dayjs: {
    plugins: ['relativeTime', 'utc', 'timezone', 'isSameOrAfter', 'isSameOrBefore', 'isBetween'],
    defaultLocale: 'en',
    defaultTimezone: 'Asia/Singapore',
  },
  security: {
    headers: false,
    corsHandler: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
      allowHeaders: ['Content-Type', 'Authorization'], // Allowed headers
      credentials: true, // Include credentials
    },

  },
  runtimeConfig: {
    stripeServerKey: process.env.STRIPE_SK,
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    firebaseadmin: {
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.PRIVATE_KEY,
      databaseURL: process.env.DATABASE_URL
    },
    public: {
      authCookieName: "__session",
      authCookieExpires: parseInt(ONE_WEEK.toString(), 10),
      firebase: {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID,
        databaseURL: process.env.DATABASE_URL
      },
      stripeKey: process.env.STRIPE_PK,
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
      apiKey: process.env.NUXT_API_KEY
    }
  },

  compatibilityDate: '2024-08-15'
});