import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  trips, type Trip, type InsertTrip,
  bookings, type Booking, type InsertBooking,
  propertyTrips, type PropertyTrip, type InsertPropertyTrip
} from "@shared/schema";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

// Interface for all storage operations
export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Property operations
  getProperty(id: number): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  // Trip operations
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByDateRange(startDate: Date, endDate: Date): Promise<Trip[]>;
  getActiveTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<Trip>): Promise<Trip | undefined>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByTrip(tripId: number): Promise<Booking[]>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  updateBookingPayment(id: number, paymentIntentId: string, status: string): Promise<Booking | undefined>;
  
  // Property-Trip operations
  assignTripToProperty(propertyTripData: InsertPropertyTrip): Promise<PropertyTrip>;
  getTripsByProperty(propertyId: number): Promise<Trip[]>;
  getPropertyTrips(propertyId: number): Promise<PropertyTrip[]>;
  getPropertyByTrip(tripId: number): Promise<Property[]>;
  
  // Dashboard & Reports
  getUpcomingTrips(limit: number): Promise<Trip[]>;
  generateTripManifest(tripId: number): Promise<any[]>;
  countBookingsByStatus(status: string): Promise<number>;
  getSeatsAvailableForTrip(tripId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private trips: Map<number, Trip>;
  private bookings: Map<number, Booking>;
  private propertyTrips: Map<number, PropertyTrip>;
  
  sessionStore: session.Store;
  
  private currentUserId: number;
  private currentPropertyId: number;
  private currentTripId: number;
  private currentBookingId: number;
  private currentPropertyTripId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.trips = new Map();
    this.bookings = new Map();
    this.propertyTrips = new Map();
    
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentTripId = 1;
    this.currentBookingId = 1;
    this.currentPropertyTripId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h in ms
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Helper methods for password hashing
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const hashedPassword = await this.hashPassword(insertUser.password);
    
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword
    };
    
    this.users.set(id, user);
    return user;
  }

  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    return Array.from(this.properties.values()).find(
      (property) => property.slug === slug,
    );
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const newProperty: Property = { ...property, id };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  // Trip operations
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripsByDateRange(startDate: Date, endDate: Date): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      (trip) => new Date(trip.departureDate) >= startDate && new Date(trip.departureDate) <= endDate,
    );
  }

  async getActiveTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      (trip) => trip.isActive && new Date(trip.departureDate) >= new Date(),
    );
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = this.currentTripId++;
    const newTrip: Trip = { ...trip, id };
    this.trips.set(id, newTrip);
    return newTrip;
  }

  async updateTrip(id: number, tripData: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    
    const updatedTrip = { ...trip, ...tripData };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByTrip(tripId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.tripId === tripId,
    );
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.propertyId === propertyId,
    );
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { 
      ...booking, 
      bookingStatus: status,
      updatedAt: new Date()
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async updateBookingPayment(id: number, paymentIntentId: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { 
      ...booking, 
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: status,
      updatedAt: new Date()
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Property-Trip operations
  async assignTripToProperty(propertyTripData: InsertPropertyTrip): Promise<PropertyTrip> {
    const id = this.currentPropertyTripId++;
    const newPropertyTrip: PropertyTrip = { ...propertyTripData, id };
    this.propertyTrips.set(id, newPropertyTrip);
    return newPropertyTrip;
  }

  async getTripsByProperty(propertyId: number): Promise<Trip[]> {
    const propertyTripIds = Array.from(this.propertyTrips.values())
      .filter(pt => pt.propertyId === propertyId)
      .map(pt => pt.tripId);
    
    return Array.from(this.trips.values())
      .filter(trip => propertyTripIds.includes(trip.id) && trip.isActive);
  }

  async getPropertyTrips(propertyId: number): Promise<PropertyTrip[]> {
    return Array.from(this.propertyTrips.values())
      .filter(pt => pt.propertyId === propertyId);
  }

  async getPropertyByTrip(tripId: number): Promise<Property[]> {
    const propertyIds = Array.from(this.propertyTrips.values())
      .filter(pt => pt.tripId === tripId)
      .map(pt => pt.propertyId);
    
    return Array.from(this.properties.values())
      .filter(property => propertyIds.includes(property.id));
  }

  // Dashboard & Reports
  async getUpcomingTrips(limit: number): Promise<Trip[]> {
    return Array.from(this.trips.values())
      .filter(trip => new Date(trip.departureDate) >= new Date() && trip.isActive)
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())
      .slice(0, limit);
  }

  async generateTripManifest(tripId: number): Promise<any[]> {
    const bookings = await this.getBookingsByTrip(tripId);
    const trip = await this.getTrip(tripId);
    
    if (!trip) return [];
    
    const properties = await this.getPropertyByTrip(tripId);
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    
    return bookings
      .filter(booking => booking.bookingStatus === "confirmed" || booking.bookingStatus === "reserved")
      .map(booking => {
        const property = propertyMap.get(booking.propertyId);
        return {
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          seats: booking.numberOfSeats,
          property: property?.name || "Unknown",
          paymentStatus: booking.paymentStatus,
          bookingId: booking.id
        };
      });
  }

  async countBookingsByStatus(status: string): Promise<number> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.bookingStatus === status)
      .length;
  }

  async getSeatsAvailableForTrip(tripId: number): Promise<number> {
    const trip = await this.getTrip(tripId);
    if (!trip) return 0;
    
    const bookings = await this.getBookingsByTrip(tripId);
    const bookedSeats = bookings
      .filter(b => b.bookingStatus === "confirmed" || b.bookingStatus === "reserved")
      .reduce((total, booking) => total + booking.numberOfSeats, 0);
    
    return Math.max(0, trip.maxCapacity - bookedSeats);
  }

  // Sample data initialization
  private async initializeSampleData() {
    // Create admin user
    await this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@peachstatecasino.com",
      role: "admin"
    });
    
    // Create Green Acres property
    const greenAcres = await this.createProperty({
      name: "Green Acres Community",
      slug: "greenacres",
      address: "123 Green Acres Ln",
      city: "Atlanta",
      state: "GA",
      zipCode: "30301",
      contactPhone: "555-123-4567",
      contactEmail: "info@greenacres.com",
      meetingPoint: "Green Acres Community Center"
    });
    
    // Create Sunnydale property
    const sunnydale = await this.createProperty({
      name: "Sunnydale Retirement Community",
      slug: "sunnydale",
      address: "456 Sunny Way",
      city: "Savannah",
      state: "GA",
      zipCode: "31401",
      contactPhone: "555-987-6543",
      contactEmail: "info@sunnydale.com",
      meetingPoint: "Sunnydale Main Lobby"
    });

    // Create sample trips
    const now = new Date();
    const may15 = new Date(2025, 4, 15, 9, 0, 0);
    const may15Return = new Date(2025, 4, 15, 17, 0, 0);
    
    const trip1 = await this.createTrip({
      departureDate: may15,
      returnDate: may15Return,
      departureTime: "9:00 AM",
      returnTime: "5:00 PM",
      maxCapacity: 30,
      pricePerSeat: 3500, // $35.00
      isActive: true,
      bookingCloseHours: 24,
      departureLocation: "Community Center",
      returnLocation: "Casino Main Entrance"
    });

    const may22 = new Date(2025, 4, 22, 9, 0, 0);
    const may22Return = new Date(2025, 4, 22, 17, 0, 0);
    
    const trip2 = await this.createTrip({
      departureDate: may22,
      returnDate: may22Return,
      departureTime: "9:00 AM",
      returnTime: "5:00 PM",
      maxCapacity: 30,
      pricePerSeat: 3500, // $35.00
      isActive: true,
      bookingCloseHours: 24,
      departureLocation: "Community Center",
      returnLocation: "Casino Main Entrance"
    });

    // Assign trips to properties
    await this.assignTripToProperty({
      propertyId: greenAcres.id,
      tripId: trip1.id
    });
    
    await this.assignTripToProperty({
      propertyId: greenAcres.id,
      tripId: trip2.id
    });
    
    await this.assignTripToProperty({
      propertyId: sunnydale.id,
      tripId: trip1.id
    });

    // Create sample bookings
    await this.createBooking({
      tripId: trip1.id,
      propertyId: greenAcres.id,
      customerName: "John Smith",
      customerEmail: "john@example.com",
      customerPhone: "555-111-2222",
      numberOfSeats: 2,
      totalAmount: 7000, // $70.00
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      stripePaymentIntentId: "pi_mock_123456"
    });
    
    await this.createBooking({
      tripId: trip1.id,
      propertyId: greenAcres.id,
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      customerPhone: "555-333-4444",
      numberOfSeats: 1,
      totalAmount: 3500, // $35.00
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      stripePaymentIntentId: "pi_mock_789012"
    });
  }
}

export const storage = new MemStorage();
