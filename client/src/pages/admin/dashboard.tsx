import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trip } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconButton } from "@/components/ui/icons";
import { Footer } from "@/components/layout/footer";
import { format } from "date-fns";
import { 
  Bus, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  PlusCircle, 
  ArrowRight, 
  LogOut 
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  
  // Fetch upcoming trips
  const { data: upcomingTrips, isLoading: isLoadingTrips } = useQuery<(Trip & { availableSeats: number })[]>({
    queryKey: ["/api/admin/trips"]
  });
  
  // Sample data for charts
  const bookingsData = [
    { name: "Jan", bookings: 45 },
    { name: "Feb", bookings: 52 },
    { name: "Mar", bookings: 61 },
    { name: "Apr", bookings: 58 },
    { name: "May", bookings: 70 },
    { name: "Jun", bookings: 52 },
  ];
  
  const revenueData = [
    { name: "Jan", revenue: 1575 },
    { name: "Feb", revenue: 1820 },
    { name: "Mar", revenue: 2135 },
    { name: "Apr", revenue: 2030 },
    { name: "May", revenue: 2450 },
    { name: "Jun", revenue: 1820 },
  ];
  
  // Stats summary
  const stats = [
    { title: "Upcoming Trips", value: upcomingTrips?.length || 0, icon: <Calendar className="h-6 w-6" /> },
    { title: "Total Bookings", value: 286, icon: <Users className="h-6 w-6" /> },
    { title: "Active Properties", value: 6, icon: <Bus className="h-6 w-6" /> },
    { title: "Monthly Revenue", value: "$9,605", icon: <DollarSign className="h-6 w-6" /> },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border hidden md:block">
        <div className="p-4">
          <h1 className="text-xl font-bold text-sidebar-foreground mb-6">Admin Dashboard</h1>
          
          <nav className="space-y-2">
            <Link href="/admin">
              <a className="flex items-center space-x-2 w-full p-2 bg-sidebar-accent text-sidebar-accent-foreground rounded-md">
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
              <a className="flex items-center space-x-2 w-full p-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
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
            <h2 className="text-2xl font-bold">Dashboard</h2>
            
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.username}</span>
              
              <Button className="md:hidden" onClick={() => logoutMutation.mutate()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Overview</CardTitle>
                <CardDescription>Total bookings over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Monthly revenue in dollars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Trips */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Trips</CardTitle>
                <CardDescription>Your scheduled trips for the next 30 days</CardDescription>
              </div>
              
              <Link href="/admin/trips">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Trip
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">Capacity</th>
                      <th className="text-left py-3 px-4 font-medium">Bookings</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTrips ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">Loading trips...</td>
                      </tr>
                    ) : upcomingTrips?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">No upcoming trips found</td>
                      </tr>
                    ) : (
                      upcomingTrips?.map((trip) => (
                        <tr key={trip.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {format(new Date(trip.departureDate), "MMM dd, yyyy")}
                          </td>
                          <td className="py-3 px-4">{trip.departureTime}</td>
                          <td className="py-3 px-4">{trip.maxCapacity}</td>
                          <td className="py-3 px-4">
                            {trip.maxCapacity - trip.availableSeats} / {trip.maxCapacity}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-sm ${trip.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {trip.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/admin/trips/${trip.id}`}>
                              <Button variant="ghost" size="sm">
                                Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center mt-4">
                <Link href="/admin/trips">
                  <Button variant="outline">
                    View All Trips
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      </div>
      
      <Footer />
    </div>
  );
}
