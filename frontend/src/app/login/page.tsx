"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ShieldAlert, Activity } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password })
      });
      
      const data = await res.json();
      if (data.token) {
        login(email, data.token, data.user);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    // Simulate OAuth Redirect & Token Exchange Delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // For the mock, we just hit the normal login endpoint with a demo account
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "dr.demo@hospital.org", password: "google_sso_mock" })
      });
      
      const data = await res.json();
      if (data.token) {
        // Override the email to show a Google Workspace style email
        login("dr.demo@hospital.org", data.token, data.user);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      
      <div className="relative w-full max-w-md p-8 glass-panel">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">AegisMDT</h1>
          <p className="text-sm font-mono text-muted-foreground mt-2 uppercase tracking-wider">Enterprise Orchestration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wide">Hospital Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-none px-4 py-3 text-foreground focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all font-mono text-sm"
              placeholder="dr.smith@hospital.org"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-none px-4 py-3 text-foreground focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all font-mono text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || isGoogleLoading || !email || !password}
            className="w-full bg-primary text-white font-bold uppercase tracking-wider rounded-none border-2 border-black px-4 py-3 hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <Activity className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            {isLoading ? "Authenticating..." : "Sign In to Platform"}
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-black font-bold uppercase tracking-widest text-xs">Or continue with</span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="mt-6 w-full flex items-center justify-center bg-white border-2 border-black rounded-none px-4 py-3 text-black font-bold uppercase hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Activity className="animate-spin h-5 w-5 mr-2 text-primary" />
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {isGoogleLoading ? "Connecting to Google Workspace..." : "Google Workspace"}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            For demonstration purposes, any email/password combination will work.
          </p>
        </div>
      </div>
    </div>
  );
}
