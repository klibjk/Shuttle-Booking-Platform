import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trip } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, FileText, Search, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TripListProps {
  onEditTrip?: (trip: Trip) => void;
}

export default function TripList({ onEditTrip }: TripListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  
  // Fetch trips
  const { data: allTrips, isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/admin/trips"],
  });
  
  // Filter trips based on search query and filters
  const filteredTrips = allTrips?.filter((trip) => {
    // Search query filter
    const searchMatches = 
      format(new Date(trip.departureDate), "MMMM d, yyyy").toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.departureTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.returnTime.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const statusMatches = 
      statusFilter === "all" || 
      (statusFilter === "active" && trip.isActive) || 
      (statusFilter === "inactive" && !trip.isActive);
    
    // Time filter
    const today = new Date();
    const tripDate = new Date(trip.departureDate);
    
    let timeMatches = true;
    if (timeFilter === "upcoming") {
      timeMatches = tripDate >= today;
    } else if (timeFilter === "past") {
      timeMatches = tripDate < today;
    } else if (timeFilter === "this-month") {
      timeMatches = 
        tripDate.getMonth() === today.getMonth() && 
        tripDate.getFullYear() === today.getFullYear();
    } else if (timeFilter === "last-month") {
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);
      timeMatches = 
        tripDate.getMonth() === lastMonth.getMonth() && 
        tripDate.getFullYear() === lastMonth.getFullYear();
    }
    
    return searchMatches && statusMatches && timeMatches;
  }) || [];
  
  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <CardTitle>Trips</CardTitle>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search trips..." 
              className="pl-9 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={timeFilter} 
            onValueChange={setTimeFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Time</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Capacity</th>
                <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Price</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <div className="flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      Loading trips...
                    </div>
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    {searchQuery || statusFilter !== "all" || timeFilter !== "all" ? (
                      <>No trips match your search criteria. <Button variant="link" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setTimeFilter("all"); }}>Clear filters</Button></>
                    ) : (
                      "No trips found"
                    )}
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      {format(new Date(trip.departureDate), "MMM dd, yyyy")}
                    </td>
                    <td className="py-3 px-4">
                      {trip.departureTime}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {trip.maxCapacity} seats
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {formatCurrency(trip.pricePerSeat / 100)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${trip.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {trip.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEditTrip && onEditTrip(trip)}
                          title="Edit Trip"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Link href={`/admin/trips/${trip.id}`}>
                          <Button variant="ghost" size="sm" title="View Trip Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Link href={`/admin/manifests/${trip.id}`}>
                          <Button variant="ghost" size="sm" title="View Manifest">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export { TripList };
