# Peach State Casino Express Shuttle Booking Platform

A mobile-friendly shuttle booking platform for Peach State Casino Express, designed to provide a seamless and visually appealing transportation booking experience with advanced seat management and administrative tools.

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

# Start the development server
npm run dev
```

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