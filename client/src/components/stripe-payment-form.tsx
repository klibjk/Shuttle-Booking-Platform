import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface StripePaymentFormProps {
  onSuccess: () => void;
}

export function StripePaymentForm({ onSuccess }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/confirmation", // This isn't used due to redirect: "if_required"
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setPaymentStatus("error");
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      } else {
        // The payment has been processed!
        setPaymentStatus("success");
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setPaymentStatus("error");
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {paymentStatus === "success" ? (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
            <p className="text-green-600">Your booking has been confirmed.</p>
          </div>
        </div>
      ) : paymentStatus === "error" ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-1">Payment Failed</h3>
              <p className="text-red-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      ) : (
        <PaymentElement className="mb-6" />
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-neutral-500">Your card will be charged immediately upon submission</p>
        
        {paymentStatus !== "success" && (
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing || paymentStatus === "success"}
            className="text-lg py-6 px-8 bg-secondary hover:bg-secondary-dark text-white font-bold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              "Complete Payment"
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
