import { Property } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BusIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyHeaderProps {
  property?: Property;
  isLoading?: boolean;
}

export default function PropertyHeader({ property, isLoading = false }: PropertyHeaderProps) {
  return (
    <header className="bg-white py-4 shadow-md border-b border-gold/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <BusIcon className="h-12 w-12 mr-3 text-gold" />
            
            {isLoading ? (
              <div>
                <Skeleton className="h-7 w-48 bg-navy/20 mb-1" />
                <Skeleton className="h-5 w-36 bg-navy/20" />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-navy">Peach State Casino Express</h1>
                <p className="text-navy/70 text-lg">
                  {property?.name || "Book Your Trip"}
                </p>
              </div>
            )}
          </div>
          
          <Link href="/">
            <Button variant="outline" className="border-gold text-navy font-medium hidden md:flex hover:bg-gold/10">
              Back to Home
            </Button>
          </Link>
          
          <button className="block md:hidden bg-gold/20 p-2 rounded text-navy" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export { PropertyHeader };
