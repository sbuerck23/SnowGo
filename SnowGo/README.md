# SnowGo

A modern web application connecting customers who need their driveways shoveled with local snow shovelers looking to earn money.

## Features

### For Customers

- **Quick Booking**: Book a shoveler in minutes
- **Verified Shovelers**: Access to rated and verified service providers
- **Transparent Pricing**: Know exactly what you'll pay upfront
- **Local Service**: Find shovelers available in your area

### For Shovelers

- **Flexible Hours**: Work on your own schedule
- **Competitive Earnings**: Keep 80% of earnings
- **Secure Payments**: Get paid safely through our platform
- **Build Reputation**: Establish ratings and reviews

## Tech Stack

- **Frontend**: React + TypeScript with Vite
- **Styling**: CSS with CSS Variables for theming
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/sbuerck23/SnowGo.git
cd SnowGo
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── App.tsx                 # Main app component with routing
├── App.css                 # Global app styles
├── main.tsx                # Application entry point
├── supabaseClient.ts       # Supabase client configuration
├── global.css              # Global CSS variables and theming
├── Booking/
│   ├── Booking.tsx         # Booking form component
│   └── Booking.css         # Booking page styles
├── Home/
│   ├── Home.tsx
│   └── Home.css
├── Landing/
│   ├── Landing.tsx
│   ├── Landing.css
│   ├── HeroSection.tsx
│   ├── HowItWorks.tsx
│   ├── ReviewsSection.tsx
│   ├── ServiceAreas.tsx
│   ├── StatsSection.tsx
│   ├── UserSections.tsx
│   └── [component styles]
├── Login/
│   ├── Login.tsx
│   └── Login.css
├── Register/
│   ├── Register.tsx
│   └── Register.css
└── ProtectedRoute/
    └── ProtectedRoute.tsx  # Route protection component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

### Bookings Table

The application uses a `bookings` table to store service requests:

- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `address` (TEXT) - Service address
- `city` (TEXT) - City name
- `zip_code` (TEXT) - ZIP code
- `preferred_date` (DATE) - Requested service date
- `preferred_time` (TIME) - Requested service time
- `driveway_size` (TEXT) - Size: small, medium, large, extra-large
- `additional_notes` (TEXT) - Special requests
- `status` (TEXT) - pending, accepted, completed, cancelled
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Features in Development

- Shoveler profile and assignment system
- Real-time notification system
- Payment processing integration
- User ratings and reviews
- Service history tracking
- Map-based service area visualization

## Authentication

The app uses Supabase Auth for user authentication. Users can:

- Register with email/password
- Log in securely
- Reset passwords
- Access protected routes

## Styling

The project uses CSS variables defined in `global.css` for consistent theming:

```css
--primary-color: #536ee4
--secondary-color: #9f9f9f
--text-dark: #333
--text-gray: #666
--bg-light: #f8f9fa
```

All components use these variables for easy theme customization.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please reach out to the development team.

## Roadmap

- [ ] Shoveler onboarding and verification
- [ ] Advanced booking filtering and search
- [ ] Real-time chat between customers and shovelers
- [ ] Payment integration (Stripe)
- [ ] Mobile app (React Native)
- [ ] Weather-triggered auto-booking
- [ ] Service area expansion tools
