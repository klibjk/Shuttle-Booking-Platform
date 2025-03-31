import { pgTable, text, serial, integer, boolean, timestamp, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Admin table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").default("user").notNull(), // "admin" or "user"
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

// Properties table (communities with unique booking pages)
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // for URL e.g., "greenacres"
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  meetingPoint: text("meeting_point").notNull(),
});

export const insertPropertySchema = createInsertSchema(properties).pick({
  name: true,
  slug: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  contactPhone: true,
  contactEmail: true,
  meetingPoint: true,
});

// Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  departureDate: timestamp("departure_date").notNull(),
  returnDate: timestamp("return_date").notNull(),
  departureTime: text("departure_time").notNull(), // "9:00 AM"
  returnTime: text("return_time").notNull(), // "5:00 PM"
  maxCapacity: integer("max_capacity").default(30).notNull(),
  pricePerSeat: integer("price_per_seat").notNull(), // in cents
  isActive: boolean("is_active").default(true).notNull(),
  bookingCloseHours: integer("booking_close_hours").default(24).notNull(), // hours before trip closes for booking
  departureLocation: text("departure_location").notNull(),
  returnLocation: text("return_location").notNull(),
});

export const insertTripSchema = createInsertSchema(trips).pick({
  departureDate: true,
  returnDate: true,
  departureTime: true,
  returnTime: true,
  maxCapacity: true,
  pricePerSeat: true,
  isActive: true,
  bookingCloseHours: true,
  departureLocation: true,
  returnLocation: true,
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  propertyId: integer("property_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  numberOfSeats: integer("number_of_seats").default(1).notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paymentStatus: text("payment_status").default("pending").notNull(), // "pending", "paid", "refunded"
  bookingStatus: text("booking_status").default("reserved").notNull(), // "reserved", "confirmed", "cancelled", "waitlist"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  tripId: true,
  propertyId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  numberOfSeats: true,
  totalAmount: true,
  stripePaymentIntentId: true,
  paymentStatus: true,
  bookingStatus: true,
});

// Property-Trip relationship table
export const propertyTrips = pgTable("property_trips", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tripId: integer("trip_id").notNull(),
}, (table) => {
  return {
    unq: unique().on(table.propertyId, table.tripId),
  };
});

export const insertPropertyTripSchema = createInsertSchema(propertyTrips).pick({
  propertyId: true,
  tripId: true,
});

// Type Definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertPropertyTrip = z.infer<typeof insertPropertyTripSchema>;
export type PropertyTrip = typeof propertyTrips.$inferSelect;
