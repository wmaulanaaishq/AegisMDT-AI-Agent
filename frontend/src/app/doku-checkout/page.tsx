"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export default function DokuCheckoutMock() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const invoice = searchParams.get("invoice") || "AEGIS-SUB-0000";
  const username = searchParams.get("username") || "hospital_user";
  const amountStr = searchParams.get("amount") || "50000000";
  
  // Format amount to IDR
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(parseInt(amountStr));

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate network delay for payment processing
    setTimeout(() => {
      // Redirect back to pricing page with success parameter
      router.push(`/pricing?payment=success&username=${username}`);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        {/* DOKU Header */}
        <div className="bg-[#E2211C] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="font-bold text-xl tracking-tight">DOKU</h2>
            <p className="text-white/80 text-xs">Payment Gateway</p>
          </div>
          <ShieldCheck className="h-8 w-8 text-white/90" />
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Payment</p>
            <h1 className="text-3xl font-bold text-gray-900">{formattedAmount}</h1>
            <p className="text-xs text-gray-400 mt-2">Invoice: {invoice}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-700 border-b pb-2">Merchant Details</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Merchant</span>
              <span className="text-sm font-medium text-gray-900">AegisMDT Enterprise</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Plan</span>
              <span className="text-sm font-medium text-gray-900">Hospital Enterprise License</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Account</span>
              <span className="text-sm font-medium text-gray-900">{username}</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center p-3 border border-[#E2211C] bg-red-50 rounded-lg cursor-pointer">
              <CreditCard className="text-[#E2211C] h-6 w-6 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Credit / Debit Card</p>
                <p className="text-xs text-gray-500">Visa, Mastercard, JCB</p>
              </div>
              <CheckCircle2 className="text-[#E2211C] h-5 w-5" />
            </div>
            
            <div className="flex items-center p-3 border border-gray-200 hover:bg-gray-50 rounded-lg opacity-50 cursor-not-allowed">
              <div className="bg-blue-800 text-white font-bold text-[10px] px-2 py-1 rounded mr-3">VA</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Virtual Account</p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-[#E2211C] hover:bg-[#c91d18] text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <Activity className="animate-spin mr-2 h-5 w-5" />
                Processing Payment...
              </>
            ) : (
              `Pay ${formattedAmount}`
            )}
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            Secured by DOKU Sandbox Environment. 
            <br/>This is a mock checkout page for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
