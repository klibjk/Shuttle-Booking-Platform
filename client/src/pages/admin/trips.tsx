import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trip } from "@shared/schema";
import { IconButton } from "@/components/ui/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Bus, 
  FileText, 
  PlusCircle, 
  ArrowRight, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  MapPin 
} from "lucide-react";

// Form schema for creating/editing trips
const tripFormSchema = z.object({
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().min(1, "Return date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  returnTime: z.string().min(1, "Return time is required"),
  maxCapacity: z.string().transform(val => parseInt(val, 10)).pipe(
    z.number().min(1, "Capacity must be at least 1").max(100, "Capacity cannot exceed 100")
  ),
  pricePerSeat: z.string().transform(val => parseInt(val, 10) * 100).pipe(
    z.number().min(100, "Price must be at least $1")
  ),
  isActive: z.boolean().default(true),
  bookingCloseHours: z.string().transform(val => parseInt(val, 10)).pipe(
    z.number().min(1, "Must be at least 1 hour").max(72, "Cannot exceed 72 hours")
  ),
  departureLocation: z.string().min(1, "Departure location is required"),
  returnLocation: z.string().min(1, "Return location is required"),
});

type TripFormValues = z.input<typeof tripFormSchema>;

export default function AdminTrips() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { toast } = useToast();
  
  // Fetch trips
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/admin/trips"],
  });
  
  // Trip creation mutation
  const createTripMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/trips", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trips"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Trip Created",
        description: "The trip has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Trip",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Trip update mutation
  const updateTripMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/trips/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trips"] });
      setSelectedTrip(null);
      toast({
        title: "Trip Updated",
        description: "The trip has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Trip",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create form hook
  const createForm = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      departureDate: "",
      returnDate: "",
      departureTime: "9:00 AM",
      returnTime: "5:00 PM",
      maxCapacity: "30",
      pricePerSeat: "35",
      isActive: true,
      bookingCloseHours: "24",
      departureLocation: "Community Center",
      returnLocation: "Casino Main Entrance",
    },
  });
  
  // Edit form hook
  const editForm = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
  });
  
  // Set form values when a trip is selected for editing
  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    editForm.reset({
      departureDate: format(new Date(trip.departureDate), "yyyy-MM-dd"),
      returnDate: format(new Date(trip.returnDate), "yyyy-MM-dd"),
      departureTime: trip.departureTime,
      returnTime: trip.returnTime,
      maxCapacity: trip.maxCapacity.toString(),
      pricePerSeat: (trip.pricePerSeat / 100).toString(),
      isActive: trip.isActive,
      bookingCloseHours: trip.bookingCloseHours.toString(),
      departureLocation: trip.departureLocation,
      returnLocation: trip.returnLocation,
    });
  };
  
  // Handle create form submission
  const onCreateSubmit = (data: TripFormValues) => {
    // Convert date strings to Date objects
    const departureDate = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);
    
    // Submit data to API
    createTripMutation.mutate({
      ...data,
      departureDate,
      returnDate,
    });
  };
  
  // Handle edit form submission
  const onEditSubmit = (data: TripFormValues) => {
    if (!selectedTrip) return;
    
    // Convert date strings to Date objects
    const departureDate = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);
    
    // Submit data to API
    updateTripMutation.mutate({
      id: selectedTrip.id,
      data: {
        ...data,
        departureDate,
        returnDate,
      },
    });
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
              <a className="flex items-center space-x-2 w-full p-2 bg-sidebar-accent text-sidebar-accent-foreground rounded-md">
                <IconButton icon={<Bus className="h-4 w-4" />} />
                <span>Manage Trips</span>
              </a>
            </Link>
            <Link href="/admin/manifests">
              <a className="flex items-center space-x-2 w-full p-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
                <IconButton icon={<FileText className="h-4 w-4" />} />
                <span>Manifests</span>
              </a>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Trips</h2>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Trip
            </Button>
          </div>
        </header>
        
        <main className="p-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search trips..." className="pl-9" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Time Period" />
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
              </div>
            </CardContent>
          </Card>
          
          {/* Trips Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Trips</CardTitle>
              <CardDescription>Manage and view all scheduled trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">Capacity</th>
                      <th className="text-left py-3 px-4 font-medium">Price</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">Loading trips...</td>
                      </tr>
                    ) : trips?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">No trips found</td>
                      </tr>
                    ) : (
                      trips?.map((trip) => (
                        <tr key={trip.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {format(new Date(trip.departureDate), "MMM dd, yyyy")}
                          </td>
                          <td className="py-3 px-4">{trip.departureTime} - {trip.returnTime}</td>
                          <td className="py-3 px-4">{trip.maxCapacity} seats</td>
                          <td className="py-3 px-4">${(trip.pricePerSeat / 100).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-sm ${trip.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {trip.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditTrip(trip)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Link href={`/admin/manifests/${trip.id}`}>
                                <Button variant="ghost" size="sm">
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
        </main>
      </div>
      
      {/* Create Trip Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
            <DialogDescription>
              Add a new casino shuttle trip to the schedule
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={createForm.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="departureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Time</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="returnTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Time</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="maxCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="pricePerSeat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Seat ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="bookingCloseHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Before Departure to Close Booking</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this trip available for booking
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="departureLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="returnLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createTripMutation.isPending}
                >
                  {createTripMutation.isPending ? "Creating..." : "Create Trip"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Trip Dialog */}
      <Dialog open={!!selectedTrip} onOpenChange={(open) => !open && setSelectedTrip(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>
              Update the details for this casino shuttle trip
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={editForm.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="departureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Time</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="returnTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Time</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="maxCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="pricePerSeat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Seat ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="bookingCloseHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Before Departure to Close Booking</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this trip available for booking
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="departureLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="returnLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTrip(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateTripMutation.isPending}
                >
                  {updateTripMutation.isPending ? "Updating..." : "Update Trip"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
