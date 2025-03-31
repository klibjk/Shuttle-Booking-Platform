import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PropertyHeader } from "@/components/property-header";
import { ProgressSteps } from "@/components/progress-steps";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Booking, Property, Trip } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Calendar, MapPin, Clock, Users, ArrowRight, HomeIcon } from "lucide-react";

type BookingConfirmationParams = {
  bookingId: string;
};

export default function BookingConfirmation() {
  const { bookingId } = useParams<BookingConfirmationParams>();
  
  // Fetch booking details
  const { data: booking, isLoading: isLoadingBooking } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
  });
  
  // Fetch property details if booking is loaded
  const { data: property } = useQuery<Property>({
    queryKey: [`/api/properties/${booking?.propertyId}`],
    enabled: !!booking,
  });
  
  // Fetch trip details if booking is loaded
  const { data: trip } = useQuery<Trip>({
    queryKey: [`/api/trips/${booking?.tripId}`],
    enabled: !!booking,
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <PropertyHeader property={property} isLoading={isLoadingBooking} />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <ProgressSteps currentStep={3} />
        
        <Card className="border-0 shadow-lg max-w-4xl mx-auto overflow-hidden">
          <div className="bg-primary text-white p-6 md:p-8">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-10 w-10 mr-3" />
              <h2 className="text-3xl font-bold">Booking Confirmed!</h2>
            </div>
            <p className="text-xl opacity-90">
              Thank you for booking with Peach State Casino Express. An email confirmation has been sent to your inbox.
            </p>
          </div>
          
          <CardContent className="p-6 md:p-8">
            {!booking || !trip ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-6 w-3/4"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-primary mb-2">Booking Details</h3>
                <p className="text-lg text-neutral-600 mb-8">Booking Reference: #{booking.id}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-neutral-50 p-5 rounded-lg">
                    <div className="flex items-start">
                      <Calendar className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-semibold mb-1">Trip Date</h4>
                        <p className="text-lg">{new Date(trip.departureDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 p-5 rounded-lg">
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-semibold mb-1">Meeting Point</h4>
                        <p className="text-lg">{property?.meetingPoint || trip.departureLocation}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 p-5 rounded-lg">
                    <div className="flex items-start">
                      <Clock className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-semibold mb-1">Schedule</h4>
                        <p className="text-lg">Departure: {trip.departureTime}</p>
                        <p className="text-lg">Return: {trip.returnTime}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 p-5 rounded-lg">
                    <div className="flex items-start">
                      <Users className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-semibold mb-1">Reservation</h4>
                        <p className="text-lg">{booking.customerName}</p>
                        <p className="text-lg">Seats: {booking.numberOfSeats}</p>
                        <p className="text-lg font-semibold">Total: {formatCurrency(booking.totalAmount / 100)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-secondary p-4 mb-8 rounded">
                  <h4 className="text-lg font-semibold mb-2">Important Information</h4>
                  <ul className="space-y-2 text-lg">
                    <li>Please arrive 15 minutes before departure time.</li>
                    <li>Bring a valid photo ID with you.</li>
                    <li>Food and non-alcoholic beverages are allowed on the shuttle.</li>
                    <li>For questions or changes, call us at (555) 123-4567.</li>
                  </ul>
                </div>
              </>
            )}
            
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full md:w-auto">
                  <HomeIcon className="mr-2 h-5 w-5" />
                  Return to Home
                </Button>
              </Link>
              
              <Link href={`/book/${property?.slug}`}>
                <Button size="lg" className="w-full md:w-auto">
                  Book Another Trip
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
