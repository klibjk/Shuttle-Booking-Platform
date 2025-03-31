import { Link } from "wouter";
import { BusIcon } from "@/components/ui/icons";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <BusIcon className="h-8 w-8 mr-2" />
              <h3 className="text-xl font-bold">Peach State Casino Express</h3>
            </div>
            <p className="mb-4">Luxury shuttle service for active adult communities in Georgia and North Carolina.</p>
            <p>© {new Date().getFullYear()} Peach State Casino Express. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="flex items-center mb-2">
              <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
              (555) 123-4567
            </p>
            <p className="flex items-center mb-2">
              <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
              info@peachstatecasino.com
            </p>
            <p className="flex items-start mb-2">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
              <span>123 Peach Boulevard<br />Atlanta, GA 30301</span>
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-secondary transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-secondary transition-colors duration-200">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-secondary transition-colors duration-200">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
