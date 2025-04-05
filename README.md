# Peach State Casino Express Shuttle Booking Platform

A mobile-friendly shuttle booking platform for Peach State Casino Express, designed to provide a seamless and visually appealing transportation booking experience with advanced seat management and administrative tools.

![Peach State Casino Express](/attached_assets/image_1743416853012.png)

## Key Features

- **QR Code Access**: Seniors can scan QR codes at their communities to access personalized booking forms
- **Seat Reservation System**: Easy-to-use interface for selecting trips and reserving seats
- **Stripe Payment Integration**: Secure payment processing for trip bookings
- **Administrative Dashboard**: Tools for managing trips, viewing bookings, and generating trip manifests
- **Mobile-Responsive Design**: Fully responsive interface optimized for all devices
- **Casino-Themed UI**: Visually appealing interface with a theme appropriate for casino transportation

## Technology Stack

- **Frontend**: React, TailwindCSS, Shadcn UI components
- **Backend**: Express.js, Node.js
- **Database**: In-memory storage (can be extended to PostgreSQL)
- **Payment Processing**: Stripe integration
- **State Management**: TanStack React Query
- **Routing**: Wouter for lightweight page routing

## Quick Start

```bash
# Install dependencies
npm install

# Set up required environment variables
# Create a .env file with the following:
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
SESSION_SECRET=your_session_secret

# Start the development server
npm run dev
```

## User Flows

1. **Senior Resident Flow**:
   - Scan QR code at community center
   - View available trips and seats
   - Complete booking form with personal details
   - Make payment through Stripe
   - Receive booking confirmation

2. **Admin Flow**:
   - Login to administrative dashboard
   - Manage trips (create, edit, delete)
   - View bookings and generate trip manifests
   - Monitor booking statistics

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: Reusable UI components
  - `/src/pages`: Page components
  - `/src/hooks`: Custom React hooks
  - `/src/lib`: Utility functions and helpers
  - `/src/assets`: Static assets (images, etc.)
- `/server`: Backend Express server
  - `/routes.ts`: API route definitions
  - `/storage.ts`: Data storage interface
  - `/auth.ts`: Authentication logic
- `/shared`: Shared code between frontend and backend
  - `/schema.ts`: Database schema and type definitions

## Deployment

The application can be deployed using various platforms:

1. **Replit**: Already configured for one-click deployment
2. **Vercel/Netlify**: For frontend, with separate backend deployment
3. **Heroku/Railway**: For full-stack deployment

## Future Enhancements

- Waitlist management system
- Coupon/promo code functionality
- Support for multiple vehicles and trip types
- Email notification system
- Trip history and user profiles