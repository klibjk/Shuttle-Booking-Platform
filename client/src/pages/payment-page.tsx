import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PropertyHeader } from "@/components/property-header";
import { ProgressSteps } from "@/components/progress-steps";
import { StripePaymentForm } from "@/components/stripe-payment-form";
import { Button } from "@/components/ui/card";
import { Booking, Property, Trip } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import Footer from "@/components/layout/footer";
import { Loader2 } from "lucide-react";

// Stripe setup
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy_key');

type PaymentPageParams = {
  bookingId: string;
};

export default function PaymentPage() {
  const { bookingId } = useParams<PaymentPageParams>();
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState<string>("");
  
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
  const { data: trip } = useQuery<Trip & { availableSeats: number }>({
    queryKey: [`/api/trips/${booking?.tripId}`],
    enabled: !!booking,
  });
  
  // Create payment intent when booking is loaded
  useEffect(() => {
    if (booking) {
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest(
            "POST",
            "/api/create-payment-intent",
            { bookingId: booking.id }
          );
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error("Error creating payment intent:", error);
        }
      };
      
      createPaymentIntent();
    }
  }, [booking]);
  
  // Handle successful payment
  const handlePaymentSuccess = () => {
    navigate(`/confirmation/${bookingId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <PropertyHeader property={property} isLoading={isLoadingBooking} />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <ProgressSteps currentStep={2} />
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-6">Complete Your Payment</h2>
          
          {isLoadingBooking || !booking || !trip ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span className="text-xl">Loading payment details...</span>
            </div>
          ) : (
            <>
              <div className="border-2 border-neutral-200 rounded-xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">Booking Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-lg font-semibold mb-1">Trip Date:</p>
                    <p className="text-xl">{new Date(trip.departureDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold mb-1">Reservation Name:</p>
                    <p className="text-xl">{booking.customerName}</p>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold mb-1">Number of Seats:</p>
                    <p className="text-xl">{booking.numberOfSeats}</p>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold mb-1">Total Amount:</p>
                    <p className="text-xl text-primary font-bold">{formatCurrency(booking.totalAmount / 100)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">Payment Details</h3>
                
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Preparing payment form...</span>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-neutral-500 mt-6">
                <p className="mb-2">
                  Your card will be charged immediately. Cancellations made more than 48 hours before the trip are eligible for a full refund.
                </p>
                <p>
                  By proceeding with payment, you accept our <a href="#" className="text-primary underline">Terms and Conditions</a>.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
