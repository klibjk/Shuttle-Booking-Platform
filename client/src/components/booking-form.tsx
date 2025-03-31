import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Trip, Property } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// Form schema
const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  numberOfSeats: z.string().transform(val => parseInt(val, 10)),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  notificationsAccepted: z.boolean().default(false),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  trip: Trip & { availableSeats?: number };
  property?: Property;
  onBookingCreated: (bookingId: number) => void;
}

export default function BookingForm({ trip, property, onBookingCreated }: BookingFormProps) {
  const [totalPrice, setTotalPrice] = useState<number>(trip.pricePerSeat);
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      numberOfSeats: "1",
      termsAccepted: false,
      notificationsAccepted: false,
    },
  });
  
  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return await res.json();
    },
    onSuccess: (data) => {
      onBookingCreated(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Error",
        description: error.message || "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: BookingFormValues) => {
    if (!trip || !property) {
      toast({
        title: "Error",
        description: "Missing trip or property information",
        variant: "destructive",
      });
      return;
    }
    
    const bookingData = {
      tripId: trip.id,
      propertyId: property.id,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      numberOfSeats: values.numberOfSeats,
      totalAmount: trip.pricePerSeat * values.numberOfSeats,
      paymentStatus: "pending",
      bookingStatus: "reserved",
    };
    
    bookingMutation.mutate(bookingData);
  };
  
  // Handle seat count change
  const handleSeatsChange = (value: string) => {
    const seats = parseInt(value, 10);
    setTotalPrice(trip.pricePerSeat * seats);
  };
  
  // Generate seat options based on availability
  const maxAvailableSeats = trip.availableSeats !== undefined 
    ? Math.min(trip.availableSeats, 4) // Limit to 4 seats per booking
    : 4;
  
  // Check if booking is possible
  const isTripAvailable = trip.availableSeats === undefined || trip.availableSeats > 0;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-bold text-primary mb-6">Your Information</h3>
        
        <div className="space-y-6 mb-8">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">Full Name:</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    className="text-xl p-6" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-lg" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">Phone Number:</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(555) 123-4567" 
                    className="text-xl p-6" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-lg" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">Email Address:</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    className="text-xl p-6" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-lg" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="numberOfSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-semibold">Number of Seats:</FormLabel>
                <Select
                  disabled={!isTripAvailable}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleSeatsChange(value);
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="text-xl p-6">
                      <SelectValue placeholder="Select number of seats" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: maxAvailableSeats }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()} className="text-lg">
                        {num} {num === 1 ? "Seat" : "Seats"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-lg" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="mb-8">
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="h-6 w-6 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-lg">
                    I agree to the <a href="#" className="text-primary underline">terms and conditions</a> and cancellation policy
                  </FormLabel>
                  <FormMessage className="text-lg" />
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notificationsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="h-6 w-6 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-lg">
                    Send me notifications about future trips
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="border-t-2 border-neutral-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-xl font-semibold">
                Total: <span className="text-2xl text-primary">{formatCurrency(totalPrice / 100)}</span>
              </p>
              <p className="text-neutral-500">Your seat will be reserved for 15 minutes while you complete payment</p>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto text-xl py-6 px-8 bg-yellow-400 hover:bg-yellow-500 text-primary font-bold shadow-lg"
              disabled={bookingMutation.isPending || !isTripAvailable}
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : !isTripAvailable ? (
                "No Seats Available"
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export { BookingForm };
