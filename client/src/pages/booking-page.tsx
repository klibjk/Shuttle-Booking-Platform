import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Property, Trip } from "@shared/schema";
import PropertyHeader from "@/components/property-header";
import BookingCalendar from "@/components/booking-calendar";
import TripDetails from "@/components/trip-details";
import BookingForm from "@/components/booking-form";
import ProgressSteps from "@/components/progress-steps";
import Footer from "@/components/layout/footer";

type BookingPageParams = {
  propertySlug: string;
};

export default function BookingPage() {
  const { propertySlug } = useParams<BookingPageParams>();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  
  // Fetch property
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property>({
    queryKey: [`/api/properties/${propertySlug}`],
  });

  // Fetch trips for property
  const { data: trips, isLoading: isLoadingTrips } = useQuery<(Trip & { availableSeats: number })[]>({
    queryKey: [`/api/properties/${propertySlug}/trips`],
    enabled: !!propertySlug,
  });

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Find trip that matches the selected date
    if (trips) {
      const matchingTrip = trips.find(trip => {
        const tripDate = new Date(trip.departureDate);
        return tripDate.toDateString() === date.toDateString();
      });
      
      if (matchingTrip) {
        setSelectedTrip(matchingTrip);
      } else {
        setSelectedTrip(null);
      }
    }
  };

  // When trips load, set default selection if available
  useEffect(() => {
    if (trips && trips.length > 0 && !selectedTrip) {
      // Default to first available trip
      const availableTrip = trips.find(trip => trip.availableSeats > 0);
      if (availableTrip) {
        setSelectedTrip(availableTrip);
        setSelectedDate(new Date(availableTrip.departureDate));
      }
    }
  }, [trips, selectedTrip]);

  // Handle booking form submission
  const handleBookingSubmit = (bookingId: number) => {
    navigate(`/payment/${bookingId}`);
  };

  // Generate available dates from trips
  const availableDates = trips?.map(trip => new Date(trip.departureDate)) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <PropertyHeader property={property} isLoading={isLoadingProperty} />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <ProgressSteps currentStep={1} />
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-3xl font-bold text-primary mb-6">Book Your Casino Shuttle</h2>
          
          {/* Intro text */}
          <div className="bg-blue-50 border-l-4 border-primary p-4 mb-8 rounded">
            <p className="text-lg">Please select an available date for your trip to the casino. Each shuttle has a maximum capacity of 30 passengers.</p>
          </div>
          
          {/* Booking Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <BookingCalendar 
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                isLoading={isLoadingTrips}
              />
            </div>
            
            <div className="lg:col-span-2">
              {selectedTrip ? (
                <>
                  <TripDetails trip={selectedTrip} property={property} />
                  
                  <BookingForm 
                    trip={selectedTrip}
                    property={property}
                    onBookingCreated={handleBookingSubmit}
                  />
                </>
              ) : (
                <div className="p-8 text-center bg-neutral-100 rounded-lg">
                  <h3 className="text-xl font-semibold text-neutral-600 mb-2">No Trip Selected</h3>
                  <p className="text-lg">Please select an available date from the calendar to see trip details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
