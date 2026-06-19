"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { CheckCircle2, Shield, Zap, Activity } from "lucide-react";

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  
  const paymentStatus = searchParams.get("payment");
  const urlUsername = searchParams.get("username");

  useEffect(() => {
    if (paymentStatus === "success" && urlUsername) {
      activateSubscription(urlUsername);
    }
  }, [paymentStatus, urlUsername]);

  const activateSubscription = async (username: string) => {
    setIsActivating(true);
    try {
      await fetch("http://localhost:8000/api/payments/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      await refreshUser();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsActivating(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.id })
      });
      const data = await res.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  if (isActivating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <Activity className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-2xl font-bold">Activating your Enterprise License...</h2>
        <p className="text-zinc-400 mt-2">Validating payment with DOKU Secure Gateway.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Enterprise Medical Intelligence</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Upgrade your hospital's diagnostic capabilities with AegisMDT. Get unlimited access to our board of autonomous AI specialists.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">Clinic Tier</h3>
              <div className="text-4xl font-bold mb-2">Free<span className="text-lg text-zinc-500 font-normal">/forever</span></div>
              <p className="text-sm text-zinc-400">For small clinics evaluating the platform.</p>
            </div>
            
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-zinc-500 mr-3 shrink-0" /> <span className="text-zinc-300">1 Case Analysis per month</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-zinc-500 mr-3 shrink-0" /> <span className="text-zinc-300">Standard Pathologist Agent</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-zinc-500 mr-3 shrink-0" /> <span className="text-zinc-300">Community Support</span></li>
            </ul>
            
            <button className="w-full py-4 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors" disabled>
              Current Plan
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-3xl border border-primary/50 bg-primary/5 p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl font-medium text-sm">
              RECOMMENDED
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2 text-white">Hospital Enterprise</h3>
              <div className="text-4xl font-bold mb-2 text-white">IDR 50M<span className="text-lg text-zinc-400 font-normal">/year</span></div>
              <p className="text-sm text-zinc-400">Unlimited multi-agent medical boards.</p>
            </div>
            
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" /> <span className="text-zinc-200">Unlimited Case Submissions</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" /> <span className="text-zinc-200">Full Swarm (Pathology, Prognosis, Trials)</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" /> <span className="text-zinc-200">Moderator Agent Conflict Resolution</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" /> <span className="text-zinc-200">HIPAA/GDPR Compliant Data Anonymization</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" /> <span className="text-zinc-200">Priority Band Network Execution</span></li>
            </ul>
            
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex justify-center items-center"
            >
              {isLoading ? <Activity className="animate-spin mr-2 h-5 w-5" /> : <Shield className="mr-2 h-5 w-5" />}
              {isLoading ? "Processing..." : "Subscribe via DOKU"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
