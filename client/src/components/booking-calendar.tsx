import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  isLoading?: boolean;
}

export default function BookingCalendar({ 
  availableDates = [], 
  selectedDate, 
  onSelectDate,
  isLoading = false
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Previous and next month navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(date, availableDate)
    );
  };
  
  // Days of week header
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysOfWeek.map(day => (
            <Skeleton key={day} className="h-10 w-full" />
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-primary">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-medium text-lg py-2 text-neutral-600">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const isAvailable = isDateAvailable(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toString()}
              className={cn(
                "text-xl border rounded-lg p-2 flex items-center justify-center aspect-square",
                isAvailable ? "hover:bg-neutral-100 cursor-pointer" : "text-neutral-400 cursor-not-allowed opacity-50",
                isSelected && "bg-primary text-white border-primary hover:bg-primary",
                !isSameMonth(day, currentMonth) && "opacity-30"
              )}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectDate(day)}
              aria-label={`${format(day, "MMMM d, yyyy")}${isAvailable ? ", Available" : ", Unavailable"}`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-sm text-neutral-500">
        <p>• Click on an available date to select it</p>
        <p>• Grayed out dates are unavailable</p>
      </div>
    </div>
  );
}

export { BookingCalendar };
