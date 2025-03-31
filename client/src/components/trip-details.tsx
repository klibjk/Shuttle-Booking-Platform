import { Trip, Property } from "@shared/schema";
import { Clock, MapPin, Users, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TripDetailsProps {
  trip: Trip & { availableSeats?: number };
  property?: Property;
}

export default function TripDetails({ trip, property }: TripDetailsProps) {
  const formattedDate = new Date(trip.departureDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const availableSeats = trip.availableSeats !== undefined 
    ? trip.availableSeats 
    : trip.maxCapacity;
  
  return (
    <Card className="border-2 border-neutral-200 rounded-xl mb-8">
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold text-primary mb-4">
          Trip Details: {formattedDate}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="font-semibold text-xl mb-2">Departure</p>
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
              <span className="text-xl">{trip.departureTime}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
              <span className="text-xl">
                {property?.meetingPoint || trip.departureLocation}
              </span>
            </div>
          </div>
          
          <div>
            <p className="font-semibold text-xl mb-2">Return</p>
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
              <span className="text-xl">{trip.returnTime}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
              <span className="text-xl">{trip.returnLocation}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-neutral-100 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
            <span className="text-xl font-medium">
              Available Seats: {availableSeats}
            </span>
            {availableSeats <= 5 && availableSeats > 0 && (
              <Badge variant="destructive" className="ml-2">Limited Seats</Badge>
            )}
            {availableSeats === 0 && (
              <Badge variant="destructive" className="ml-2">Sold Out</Badge>
            )}
          </div>
          <div>
            <span className="text-xl font-semibold">
              {formatCurrency(trip.pricePerSeat / 100)}
            </span>
            <span className="text-lg text-neutral-600 ml-1">per person</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { TripDetails };
