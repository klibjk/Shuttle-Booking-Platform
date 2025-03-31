import { Link } from "wouter";
import { BusIcon } from "@/components/ui/icons";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <BusIcon className="h-8 w-8 mr-2 text-gold" />
              <h3 className="text-xl font-bold">Peach State Casino Express</h3>
            </div>
            <p className="mb-4 text-white/80">Luxury shuttle service for active adult communities in Georgia and North Carolina.</p>
            <p className="text-white/70">© {new Date().getFullYear()} Peach State Casino Express. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="flex items-center mb-2 text-white/80">
              <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-gold" />
              (555) 123-4567
            </p>
            <p className="flex items-center mb-2 text-white/80">
              <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-gold" />
              info@peachstatecasino.com
            </p>
            <p className="flex items-start mb-2 text-white/80">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-1 text-gold" />
              <span>123 Peach Boulevard<br />Atlanta, GA 30301</span>
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-white/80 hover:text-gold transition-colors duration-200">Home</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-white/80 hover:text-gold transition-colors duration-200">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-white/80 hover:text-gold transition-colors duration-200">Terms & Conditions</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-white/80 hover:text-gold transition-colors duration-200">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-white/80 hover:text-gold transition-colors duration-200">Cancellation Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/auth">
                  <a className="text-white/80 hover:text-gold transition-colors duration-200">Admin Login</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/20 text-center text-white/60 text-sm">
          <p>Luxury transportation to Harrah's Cherokee Casino, Harrah's Valley River Casino, and other destinations.</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
