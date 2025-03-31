import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes - sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Initialize Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key';
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    const properties = await storage.getAllProperties();
    res.json(properties);
  });

  app.get("/api/properties/:slug", async (req, res) => {
    const { slug } = req.params;
    const property = await storage.getPropertyBySlug(slug);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json(property);
  });

  // Trips routes
  app.get("/api/properties/:slug/trips", async (req, res) => {
    const { slug } = req.params;
    const property = await storage.getPropertyBySlug(slug);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    const trips = await storage.getTripsByProperty(property.id);
    const tripsWithAvailability = await Promise.all(trips.map(async (trip) => {
      const availableSeats = await storage.getSeatsAvailableForTrip(trip.id);
      return {
        ...trip,
        availableSeats
      };
    }));
    
    res.json(tripsWithAvailability);
  });

  app.get("/api/trips/:id", async (req, res) => {
    const tripId = parseInt(req.params.id);
    const trip = await storage.getTrip(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    const availableSeats = await storage.getSeatsAvailableForTrip(tripId);
    
    res.json({
      ...trip,
      availableSeats
    });
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      // Validate request
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check trip existence
      const trip = await storage.getTrip(bookingData.tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      // Check property existence
      const property = await storage.getProperty(bookingData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check seat availability
      const availableSeats = await storage.getSeatsAvailableForTrip(trip.id);
      if (availableSeats < bookingData.numberOfSeats) {
        return res.status(400).json({ message: "Not enough seats available" });
      }
      
      // Create booking
      const booking = await storage.createBooking(bookingData);
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    const bookingId = parseInt(req.params.id);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  });

  // Stripe payment integration
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { bookingId } = req.body;
      
      // Get booking
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: booking.totalAmount,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          bookingId: booking.id.toString(),
          customerName: booking.customerName,
          customerEmail: booking.customerEmail
        }
      });
      
      // Update booking with payment intent ID
      await storage.updateBookingPayment(booking.id, paymentIntent.id, "pending");
      
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error.message 
      });
    }
  });

  // Webhook for Stripe events (payment confirmations)
  app.post("/api/webhook", async (req, res) => {
    let event;
    
    try {
      // Verify webhook signature if in production
      if (process.env.NODE_ENV === "production" && process.env.STRIPE_WEBHOOK_SECRET) {
        const signature = req.headers["stripe-signature"] as string;
        event = stripe.webhooks.constructEvent(
          req.body, 
          signature, 
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        // For development, just parse the event
        event = req.body;
      }
      
      // Handle specific events
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const bookingId = parseInt(paymentIntent.metadata.bookingId);
        
        // Update booking status
        await storage.updateBookingPayment(bookingId, paymentIntent.id, "paid");
        await storage.updateBookingStatus(bookingId, "confirmed");
      }
      
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error(`Webhook error: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/trips", ensureAdmin, async (req, res) => {
    const activeTrips = await storage.getActiveTrips();
    res.json(activeTrips);
  });

  app.get("/api/admin/trips/:id/bookings", ensureAdmin, async (req, res) => {
    const tripId = parseInt(req.params.id);
    const bookings = await storage.getBookingsByTrip(tripId);
    res.json(bookings);
  });

  app.get("/api/admin/trips/:id/manifest", ensureAdmin, async (req, res) => {
    const tripId = parseInt(req.params.id);
    const manifest = await storage.generateTripManifest(tripId);
    res.json(manifest);
  });

  app.post("/api/admin/trips", ensureAdmin, async (req, res) => {
    try {
      const trip = await storage.createTrip(req.body);
      res.status(201).json(trip);
    } catch (error) {
      res.status(400).json({ message: "Failed to create trip" });
    }
  });

  app.put("/api/admin/trips/:id", ensureAdmin, async (req, res) => {
    const tripId = parseInt(req.params.id);
    const updatedTrip = await storage.updateTrip(tripId, req.body);
    
    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
    res.json(updatedTrip);
  });

  app.post("/api/admin/trips/:id/property", ensureAdmin, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const { propertyId } = req.body;
      
      const propertyTrip = await storage.assignTripToProperty({
        tripId,
        propertyId
      });
      
      res.status(201).json(propertyTrip);
    } catch (error) {
      res.status(400).json({ message: "Failed to assign trip to property" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

// Middleware to ensure user is an admin
function ensureAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  
  next();
}
