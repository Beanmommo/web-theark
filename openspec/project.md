# Project Context

## Purpose

The Ark is a multi-sports venue booking platform for Singapore, enabling users to book sports facilities (primarily Futsal and Pickleball) at various locations. The platform provides:

- Online booking system for sports courts/pitches
- Credit package purchases for discounted rates
- User authentication and profile management
- Payment processing via Stripe and PayNow QR
- Venue information and availability management

## Tech Stack

### Frontend

- **Nuxt 3** (v3.12.4) - Vue.js meta-framework with SSR/SSG capabilities
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vuetify 3** (v3.5.0) - Material Design component framework
- **Pinia** (v2.1.7) - State management
- **SCSS/Sass** - CSS preprocessing with global styles

### Backend/API

- **Nuxt Server API** - Server-side API routes
- **Firebase Realtime Database** - Primary data storage
- **Firebase Firestore** - Secondary data storage
- **Firebase Authentication** - User authentication
- **Firebase Admin SDK** (v11.8.0) - Server-side Firebase operations

### Payment & Services

- **Stripe** (v15.9.0) - Credit card payment processing
- **PayNow QR** (paynowqr v1.1.2) - Singapore PayNow QR code generation
- **Google reCAPTCHA v3** - Bot protection

### Utilities & Plugins

- **Day.js** (via dayjs-nuxt) - Date/time manipulation (Asia/Singapore timezone)
- **Lodash** (via nuxt-lodash) - Utility functions
- **Cloudinary** (@nuxtjs/cloudinary) - Image hosting and optimization
- **V-Calendar** (v3.1.2) - Date picker component
- **Material Design Icons** (@mdi/font) - Icon library
- **Nuxt Security** (v2.1.5) - Security headers and CORS

### Development

- **Node.js 22** - Runtime environment
- **npm 10.9.3** - Package manager
- **Vite** - Build tool and dev server

## Project Conventions

### Code Style

- **TypeScript**: Strict typing disabled (`shim: false`), but types are used throughout
- **Naming Conventions**:
  - Components: PascalCase (e.g., `BookingFormPage1.vue`, `MainAppBar.vue`)
  - Composables: camelCase with `use` prefix (e.g., `useAuth`, `useAuthUser`)
  - Stores: camelCase with `Store` suffix (e.g., `useSportsStore`, `useLocationsStore`)
  - Types/Interfaces: PascalCase (e.g., `Venue`, `BookingSlotDetails`)
  - API routes: kebab-case or camelCase (e.g., `bookings.ts`, `contactUs.post.ts`)
- **File Organization**:
  - Components are flat in `/components` directory
  - Pages use dynamic routing with `[sportSlug]` parameter
  - Server API routes mirror REST conventions with HTTP method suffixes (`.post.ts`, `.get.ts`)
- **Formatting**: SCSS with global variables imported via `@use "~/assets/scss/global.scss"`

### Architecture Patterns

#### Multi-Sport Architecture

- **Sport-based routing**: Routes are prefixed with sport slug (e.g., `/futsal/booking`, `/pickleball/packages`)
- **Dynamic theming**: Each sport has its own Vuetify theme (futsalTheme, pickleBallTheme, thearkTheme)
- **Sport filtering**: Data (pitches, packages, timeslots) filtered by `typeOfSports` field

#### State Management (Pinia)

- **Store per domain entity**: Separate stores for sports, locations, pitches, timeslots, bookings, credits, packages, etc.
- **Stores location**: `/stores` directory
- **Common pattern**: Stores fetch data from Firebase and provide computed getters for filtering

#### Component Architecture

- **Multi-step forms**: Booking and package purchase flows use numbered page components (Page1, Page2, Page3)
- **Step progression**: Parent components manage step state and emit events for navigation
- **Shared components**: Reusable UI components (Button, FieldInputSelect, Loading, etc.)

#### API Layer

- **Server API routes**: Located in `/server/api` with nested structure
- **Firebase integration**: Server-side Firebase Admin SDK for secure operations
- **CORS handling**: Explicit CORS configuration for production domains (theark.sg) and localhost

#### Authentication Flow

- **Client-side**: Firebase Auth with Google Sign-In and email/password
- **Session management**: Cookie-based sessions (`__session` cookie, 1-week expiry)
- **Middleware**: Auth middleware protects `/profile` route
- **User data**: Stored in Firebase Realtime Database under `users/{uid}`

#### Data Model

- **Firebase Realtime Database structure**:
  - `users/` - User profiles
  - `locations/` - Venue information
  - `pitches/` - Court/pitch details
  - `timeslots/` - Available time slots
  - `bookedSlots/` - Booked time slots
  - `bookings/` - Booking records
  - `packages/` - Credit packages
  - `creditPackages/` - Purchased credits
  - `invoices/` - Payment records
  - `promocodes/` - Promotional codes
  - `holidays/` - Holiday dates
  - `blockouts/` - Blocked time periods

### Testing Strategy

- **Current state**: No formal testing framework configured
- **Manual testing**: Development testing via `npm run dev`
- **Production testing**: Preview builds via `npm run preview`
- **Future consideration**: Add unit/integration tests for critical booking and payment flows

### Git Workflow

- **Repository**: https://github.com/Beanmommo/web-theark.git
- **Main branch**: `main` (also default branch)
- **Current user**: marsbaa (ray@marsbaa.com)
- **Git user**: ray.yee@qiksolve.com
- **Deployment**: Likely via Procfile (suggests Heroku or similar platform)

## Domain Context

### Sports Supported

1. **Futsal** (slug: `futsal`)

   - Indoor & Outdoor courts
   - Starting rate: $60/hour
   - Theme: futsalTheme (primary: #000, accent: #0A8A44)
   - Icon: mdi-soccer

2. **Pickleball** (slug: `pickleball`)
   - Indoor courts only
   - Starting rate: $25/hour
   - Theme: pickleBallTheme
   - Icon: mdi-tennis

### Venues/Locations

- Funan
- Orchid Country Club
- Cuppage
- Plaza 8
- (All in Singapore)

### Booking Flow

1. **Selection** (Page1): Choose venue, date, and time slots
2. **Authentication** (Page2): Sign in or create account
3. **Payment** (Page3): Enter details, select payment method (Credit Card/PayNow), apply promo codes
4. **Confirmation**: QR code for PayNow or Stripe payment processing

### Package Purchase Flow

1. **Selection** (Page1): Choose credit package
2. **Authentication** (Page2): Sign in or create account
3. **Payment** (Page3): Enter details and complete payment
4. **Confirmation**: Credits added to user account (6-month validity)

### Payment Methods

- **Credit Card**: Stripe integration with payment intents
- **PayNow**: Singapore's instant payment system via QR code
- **Credits**: Pre-purchased credits for discounted bookings

### Business Rules

- Timezone: Asia/Singapore
- Phone numbers: Singapore format (+65 followed by 8 digits starting with 6, 8, or 9)
- Package validity: 6 months from purchase
- Premium rates: Applied for certain time slots
- Promo codes: Location-specific discounts

## Important Constraints

### Technical Constraints

- **Node version**: Must use Node.js 22
- **npm version**: Must use npm 10.9.3
- **SSR considerations**: Firebase client-side only (plugins use `.client.ts` suffix)
- **Chunk size**: Vite build configured with 2000kb warning limit
- **CORS**: Strict origin checking for Stripe endpoints (theark.sg, www.theark.sg, localhost:3000)

### Security Constraints

- **reCAPTCHA**: Required for form submissions
- **Firebase Rules**: Database requires `.indexOn` for `creditPackages` on `userKey`
- **Authentication**: Protected routes require valid session cookie
- **Payment security**: Server-side Stripe secret key handling

### Business Constraints

- **Singapore-focused**: Phone number validation, timezone, PayNow payment method
- **Multi-tenant**: Single codebase serves multiple sports with different branding
- **Real-time availability**: Booking system must reflect current slot availability

### Performance Constraints

- **Image optimization**: Cloudinary for responsive images
- **Bundle size**: Vuetify transpilation required, chunk size monitoring
- **Database queries**: Firebase queries need proper indexing

## External Dependencies

### Firebase Services

- **Firebase Realtime Database**: Primary data store (DATABASE_URL)
- **Firebase Firestore**: Secondary data store
- **Firebase Authentication**: User management
- **Firebase Admin SDK**: Server-side operations
- **Configuration**: Requires PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY, API_KEY, AUTH_DOMAIN, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID

### Payment Providers

- **Stripe**: Credit card processing
  - Public key: STRIPE_PK
  - Server key: STRIPE_SK
  - Customer creation and payment intent APIs
- **PayNow**: Singapore instant payment (QR code generation)

### Third-Party Services

- **Cloudinary**: Image hosting and optimization (res.cloudinary.com/thearksg)
- **Google reCAPTCHA v3**: Bot protection
  - Site key: RECAPTCHA_SITE_KEY
  - Secret key: RECAPTCHA_SECRET_KEY

### Infrastructure

- **Deployment platform**: Likely Heroku (based on Procfile)
- **Production domains**: theark.sg, www.theark.sg
- **Development**: localhost:3000

### Environment Variables Required

```
# Firebase
API_KEY
AUTH_DOMAIN
PROJECT_ID
STORAGE_BUCKET
MESSAGING_SENDER_ID
APP_ID
DATABASE_URL
CLIENT_EMAIL
PRIVATE_KEY

# Stripe
STRIPE_PK
STRIPE_SK

# reCAPTCHA
RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY

# Application
NUXT_API_KEY
ENV (dev || prod)
```
