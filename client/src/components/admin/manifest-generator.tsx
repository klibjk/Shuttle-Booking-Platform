import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Trip } from "@shared/schema";
import { Download, Printer, FileText, RefreshCw, Clipboard } from "lucide-react";
import { generatePDF, downloadFile } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ManifestGeneratorProps {
  tripId: number;
}

interface ManifestItem {
  name: string;
  email: string;
  phone: string;
  seats: number;
  property: string;
  paymentStatus: string;
  bookingId: number;
}

export default function ManifestGenerator({ tripId }: ManifestGeneratorProps) {
  const { toast } = useToast();
  const [fileType, setFileType] = useState<"pdf" | "excel">("pdf");
  
  // Fetch trip details
  const { data: trip, isLoading: isLoadingTrip } = useQuery<Trip>({
    queryKey: [`/api/trips/${tripId}`],
  });
  
  // Fetch manifest data
  const { data: manifest, isLoading: isLoadingManifest } = useQuery<ManifestItem[]>({
    queryKey: [`/api/admin/trips/${tripId}/manifest`],
  });
  
  // Calculate totals
  const totalPassengers = manifest?.reduce((sum, item) => sum + item.seats, 0) || 0;
  const paidPassengers = manifest?.filter(item => item.paymentStatus === "paid").reduce((sum, item) => sum + item.seats, 0) || 0;
  
  // Generate and download manifest
  const generateManifest = () => {
    if (!manifest || !trip) return;
    
    try {
      const tripDate = format(new Date(trip.departureDate), "yyyy-MM-dd");
      const filename = `manifest_trip_${tripId}_${tripDate}`;
      
      if (fileType === "pdf") {
        const pdfBlob = generatePDF({
          title: `Trip Manifest - ${format(new Date(trip.departureDate), "MMMM d, yyyy")}`,
          departureTime: trip.departureTime,
          returnTime: trip.returnTime,
          passengers: manifest,
        });
        
        downloadFile(pdfBlob, `${filename}.pdf`);
      } else {
        // For Excel, we'd typically use a library like exceljs
        // This is a simplified implementation
        let csvContent = "Name,Email,Phone,Seats,Property,Payment Status\n";
        
        manifest.forEach(item => {
          csvContent += `"${item.name}","${item.email}","${item.phone}",${item.seats},"${item.property}","${item.paymentStatus}"\n`;
        });
        
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(csvBlob, `${filename}.csv`);
      }
      
      toast({
        title: "Manifest Generated",
        description: `The manifest has been downloaded as a ${fileType.toUpperCase()} file.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate manifest. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Copy passenger list to clipboard
  const copyToClipboard = () => {
    if (!manifest) return;
    
    try {
      const text = manifest.map(item => 
        `${item.name} - ${item.seats} seat(s) - ${item.phone} - ${item.property}`
      ).join('\n');
      
      navigator.clipboard.writeText(text);
      
      toast({
        title: "Copied to Clipboard",
        description: "Passenger list has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Manifest</CardTitle>
        <CardDescription>
          {trip ? (
            <>
              Trip Date: {format(new Date(trip.departureDate), "MMMM d, yyyy")} - Departure: {trip.departureTime}
            </>
          ) : isLoadingTrip ? (
            "Loading trip details..."
          ) : (
            "Trip not found"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingManifest ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !manifest || manifest.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Passengers</h3>
            <p className="text-neutral-500">
              There are no confirmed bookings for this trip yet.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Total Passengers</p>
                <p className="text-2xl font-bold text-blue-800">{totalPassengers}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-800">{paidPassengers}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{totalPassengers - paidPassengers}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Seats</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Phone</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Property</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {manifest.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4">{item.seats}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{item.phone}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">{item.email}</td>
                      <td className="py-3 px-4">{item.property}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${item.paymentStatus === "paid" ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Format:</label>
                <select 
                  className="border rounded px-2 py-1"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as "pdf" | "excel")}
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel/CSV</option>
                </select>
              </div>
              
              <Button onClick={generateManifest} className="flex-shrink-0">
                <Download className="mr-2 h-4 w-4" />
                Download Manifest
              </Button>
              
              <Button variant="outline" onClick={() => window.print()} className="flex-shrink-0">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              
              <Button variant="outline" onClick={copyToClipboard} className="flex-shrink-0">
                <Clipboard className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export { ManifestGenerator };
