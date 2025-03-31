import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/footer";
import { MapPin, CalendarDays, Bus, ChevronRight, LogOut, User, Settings } from "lucide-react";
import { BusIcon, CasinoIcon, SeniorIcon } from "@/components/ui/icons";
import casinoBusImage from "../assets/casino-bus.png";

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
            <BusIcon className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">Peach State Casino Express</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Test menu - ONLY for development */}
            <Link href="/admin">
              <Button variant="secondary" className="font-semibold flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center">
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
                <Button variant="outline" className="border-white text-white hover:text-primary">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero section */}
        <section className="relative">
          {/* Background image */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark to-primary opacity-80"></div>
          <div className="w-full h-[500px] relative">
            <img 
              src={casinoBusImage} 
              alt="Peach State Casino Express Bus" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center text-white">
                <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">Luxury Casino Shuttle Service</h2>
                <p className="text-xl mb-8 drop-shadow-md">
                  Comfortable, convenient transportation from your active adult community 
                  to your favorite casino destinations in Georgia and North Carolina.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {properties && properties.length > 0 && (
                    <Link href={`/book/${properties[0].slug}`}>
                      <Button size="lg" className="text-lg px-8 py-6 bg-secondary hover:bg-secondary-dark text-white font-bold">
                        Book Your Trip Now
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <a href="#communities">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-white text-white font-bold hover:bg-white/20">
                      View Communities
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-primary mb-12">Why Choose Our Service</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BusIcon className="h-10 w-10 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">Comfortable Transportation</h4>
                <p className="text-neutral-600">
                  Luxury buses with comfortable seating, climate control, and onboard amenities for a pleasant journey.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SeniorIcon className="h-10 w-10 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">Community Focused</h4>
                <p className="text-neutral-600">
                  Designed specifically for active adult communities with convenient pickup locations.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CasinoIcon className="h-10 w-10 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">Casino Destinations</h4>
                <p className="text-neutral-600">
                  Regular trips to popular casino destinations with ample time for gaming and entertainment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Community section */}
        <section id="communities" className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-primary mb-12">Our Partner Communities</h3>
            
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
                      
                      <div className="flex gap-2">
                        <Link href={`/book/${property.slug}`} className="flex-1">
                          <Button className="w-full">
                            Book a Trip
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* For testing: Direct QR scan simulation */}
            <div className="mt-12 p-6 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
              <h4 className="text-xl font-bold mb-4 text-center">Testing: Direct QR Code Links</h4>
              <p className="text-center mb-6">These links simulate the QR codes that seniors would scan at their communities</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties?.map((property) => (
                  <Link key={property.id} href={`/book/${property.slug}`}>
                    <Button variant="outline" className="w-full">
                      {property.name} QR Link
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
