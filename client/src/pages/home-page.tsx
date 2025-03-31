import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/footer";
import { MapPin, CalendarDays, Bus, ChevronRight, LogOut, User } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Peach State Casino Express</h1>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="secondary" className="font-semibold">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span className="mr-4">{user.username}</span>
              </div>
              <Button 
                variant="outline" 
                className="border-white text-white hover:text-primary"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="secondary" className="font-semibold">
                Login / Register
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-primary mb-4">Welcome to Peach State Casino Express</h2>
          <p className="text-xl max-w-3xl mx-auto text-neutral-600">
            Luxury shuttle service for active adult communities in Georgia and North Carolina.
            Choose your community below to book your next casino trip.
          </p>
        </section>

        <section className="mb-12 bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-primary mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">1</div>
              <h4 className="text-xl font-semibold mb-2">Select Your Community</h4>
              <p className="text-lg">Choose your residential community from our partner locations.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">2</div>
              <h4 className="text-xl font-semibold mb-2">Pick a Date</h4>
              <p className="text-lg">Browse available trips and select a date that works for you.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">3</div>
              <h4 className="text-xl font-semibold mb-2">Book & Pay</h4>
              <p className="text-lg">Complete your reservation with our secure payment system.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-primary mb-6">Our Partner Communities</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-2 animate-pulse">
                  <CardHeader className="bg-neutral-100 h-32"></CardHeader>
                  <CardContent className="p-6">
                    <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.map((property) => (
                <Card key={property.id} className="border-2 hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-primary">{property.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-start mb-4">
                      <MapPin className="h-5 w-5 text-primary mt-1 mr-2 flex-shrink-0" />
                      <p className="text-neutral-600">
                        {property.address}, {property.city}, {property.state} {property.zipCode}
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <Bus className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <p className="text-neutral-600">Pickup at {property.meetingPoint}</p>
                    </div>
                    <div className="flex items-center mb-6">
                      <CalendarDays className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <p className="text-neutral-600">Regular trips available</p>
                    </div>
                    
                    <Link href={`/book/${property.slug}`}>
                      <Button className="w-full">
                        View Available Trips
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
