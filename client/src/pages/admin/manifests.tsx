import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trip } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ManifestGenerator } from "@/components/admin/manifest-generator";
import { IconButton } from "@/components/ui/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Bus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  SearchIcon,
  LogOut
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface ManifestsPageParams {
  id?: string;
}

export default function ManifestsPage() {
  const { id } = useParams<ManifestsPageParams>();
  const { user, logoutMutation } = useAuth();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(id ? parseInt(id) : null);
  
  // Fetch all trips for dropdown
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/admin/trips"],
  });
  
  // Get upcoming trips
  const upcomingTrips = trips?.filter(trip => new Date(trip.departureDate) >= new Date()) || [];
  
  // Handle trip selection
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(parseInt(tripId));
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border hidden md:block">
        <div className="p-4">
          <h1 className="text-xl font-bold text-sidebar-foreground mb-6">Admin Dashboard</h1>
          
          <nav className="space-y-2">
            <Link href="/admin">
              <a className="flex items-center space-x-2 w-full p-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
                <IconButton icon={<Calendar className="h-4 w-4" />} />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/admin/trips">
              <a className="flex items-center space-x-2 w-full p-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
                <IconButton icon={<Bus className="h-4 w-4" />} />
                <span>Manage Trips</span>
              </a>
            </Link>
            <Link href="/admin/manifests">
              <a className="flex items-center space-x-2 w-full p-2 bg-sidebar-accent text-sidebar-accent-foreground rounded-md">
                <IconButton icon={<FileText className="h-4 w-4" />} />
                <span>Manifests</span>
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-4 left-4">
          <Button 
            variant="outline" 
            className="text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/50"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Trip Manifests</h2>
            
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.username}</span>
              
              <Button className="md:hidden" onClick={() => logoutMutation.mutate()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Passenger Manifests</h3>
              <p className="text-muted-foreground">
                Generate and download passenger manifests for your trips
              </p>
            </div>
            
            <div className="w-full md:w-auto">
              <Select
                value={selectedTripId?.toString() || ""}
                onValueChange={handleTripChange}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a trip" />
                </SelectTrigger>
                <SelectContent>
                  <div className="pb-2 mb-1 border-b">
                    <div className="px-2 py-1.5 text-sm font-semibold">Upcoming Trips</div>
                  </div>
                  {upcomingTrips.map(trip => (
                    <SelectItem key={trip.id} value={trip.id.toString()}>
                      {format(new Date(trip.departureDate), "MMM dd, yyyy")} - {trip.departureTime}
                    </SelectItem>
                  ))}
                  
                  {trips && trips.length > upcomingTrips.length && (
                    <>
                      <div className="py-2 my-1 border-y">
                        <div className="px-2 py-1.5 text-sm font-semibold">Past Trips</div>
                      </div>
                      {trips
                        .filter(trip => new Date(trip.departureDate) < new Date())
                        .map(trip => (
                          <SelectItem key={trip.id} value={trip.id.toString()}>
                            {format(new Date(trip.departureDate), "MMM dd, yyyy")} - {trip.departureTime}
                          </SelectItem>
                        ))
                      }
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedTripId ? (
            <ManifestGenerator tripId={selectedTripId} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Trip Selected</h3>
              <p className="text-neutral-600 mb-6">
                Please select a trip from the dropdown above to view and generate a manifest.
              </p>
              <Link href="/admin/trips">
                <Button>
                  View All Trips
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
