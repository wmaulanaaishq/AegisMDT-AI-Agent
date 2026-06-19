"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { CheckCircle2, Shield, Activity } from "lucide-react";
import Link from "next/link";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-slate-900 pt-16">
        <Activity className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-2xl font-bold">Activating your Hospital License...</h2>
        <p className="text-slate-500 mt-2">Validating payment with DOKU Secure Gateway.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-black mb-4 tracking-tight text-slate-900">AegisMDT Subscription</h1>
          <p className="text-lg font-medium text-slate-600 max-w-2xl mx-auto">
            Empower your clinical team with an autonomous Virtual Medical Board. Choose the scale that fits your hospital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Clinic Tier */}
          <div className="bg-white p-8 border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform">
            <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-4 text-slate-900">Clinic</h3>
            <div className="mb-6">
              <span className="text-5xl font-black text-slate-900">Rp0</span>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-8 h-10">Perfect for independent oncologists exploring AI assistance.</p>
            
            <Link href="/dashboard" className="w-full text-center py-3 bg-green-300 text-green-950 font-bold rounded-lg mb-8 hover:bg-green-400 transition-colors">
              Start Trial
            </Link>
            
            <ul className="space-y-4 text-sm font-medium text-slate-600 flex-1">
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> 3 Case Analyses per month</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Core Agent Swarm (Pathology & Moderator)</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Basic Semantic Scholar RAG</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Standard PDF EMR Export</li>
            </ul>
          </div>

          {/* Hospital Tier */}
          <div className="bg-white p-8 border-2 border-primary shadow-2xl shadow-primary/20 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</div>
            <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-4 text-slate-900">Hospital</h3>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900">Rp999rb</span>
              <span className="text-slate-500 font-medium"> /month</span>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-8 h-10">Ideal for regional hospitals & cancer treatment centers.</p>
            
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-3 bg-green-400 text-green-950 font-bold rounded-lg mb-8 hover:bg-green-500 transition-colors flex justify-center items-center"
            >
              {isLoading ? <Activity className="animate-spin mr-2 h-5 w-5" /> : <Shield className="mr-2 h-5 w-5" />}
              {isLoading ? "Processing..." : "Subscribe via DOKU"}
            </button>
            
            <ul className="space-y-4 text-sm font-medium text-slate-600 flex-1">
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> 50 Case Analyses per month</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Full ICE Protocol (All 4 Clinical Agents)</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Deep PubMed & Clinical Trial Graph API</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Doctor "Human-in-the-Loop" Intervention</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Formal White-label EMR PDF Export</li>
            </ul>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white p-8 border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform">
            <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-4 text-slate-900">Enterprise</h3>
            <div className="mb-6">
              <span className="text-3xl font-black text-slate-900 leading-tight">Get a custom quote</span>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-8 h-10">For national healthcare networks requiring maximum security.</p>
            
            <a href="mailto:sales@aegismdt.com" className="w-full text-center py-3 bg-green-300 text-green-950 font-bold rounded-lg mb-8 hover:bg-green-400 transition-colors block">
              Contact Sales
            </a>
            
            <ul className="space-y-4 text-sm font-medium text-slate-600 flex-1">
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Unlimited Case Analyses</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Direct HIS/EHR Integration (HL7 & FHIR)</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> Custom Local Fine-Tuned AI Models</li>
              <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-green-500 mr-2 shrink-0" /> 24/7 Priority Support & Legal Audit Logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
