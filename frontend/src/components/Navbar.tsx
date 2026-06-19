"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./AuthProvider";
import { LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const isLandingPage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-8">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-3" href="/">
            <Image src="/logo.jpeg" alt="AegisMDT Logo" width={40} height={40} className="h-10 w-auto rounded-lg shadow-sm" />
            <span className="hidden font-serif text-2xl font-bold sm:inline-block text-foreground tracking-tight">AegisMDT</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* NAVIGATION LINKS */}
          {isLandingPage ? (
            <nav className="flex items-center space-x-6 text-sm font-bold uppercase tracking-widest font-mono">
              <Link className="transition-colors hover:text-primary text-foreground" href="#platform">
                Platform
              </Link>
              <Link className="transition-colors hover:text-primary text-foreground" href="#agents">
                Agents
              </Link>
              <Link className="transition-colors hover:text-primary text-foreground" href="#protocol">
                Protocol
              </Link>
              <Link className="transition-colors hover:text-primary text-foreground" href="/pricing">
                Pricing
              </Link>
            </nav>
          ) : (
            <nav className="flex items-center space-x-6 text-sm font-bold uppercase tracking-widest font-mono">
              <Link className="transition-colors hover:text-primary text-foreground" href="/dashboard">
                Dashboard
              </Link>
              <Link className="transition-colors hover:text-primary text-foreground" href="/cases">
                Active Cases
              </Link>
            </nav>
          )}
          
          {/* USER ACTIONS */}
          <div className="flex items-center ml-6 border-l border-slate-200 pl-6 space-x-4">
            {!isLoading && user ? (
              <>
                {!isLandingPage && (
                  <div className="flex items-center text-xs font-mono font-bold uppercase tracking-widest text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm max-w-[200px]">
                    <User className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span className="truncate">{user.id.split('@')[0]}</span>
                  </div>
                )}
                {isLandingPage ? (
                  <Link 
                    href="/dashboard"
                    className="bg-primary text-white font-bold uppercase tracking-wider rounded-xl border border-transparent px-5 py-2 hover:bg-orange-600 shadow-md hover:-translate-y-0.5 transition-all text-sm font-mono"
                  >
                    Go To App
                  </Link>
                ) : (
                  <button 
                    onClick={logout}
                    className="flex items-center text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest font-mono"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                )}
              </>
            ) : !isLoading && !user ? (
              <Link 
                href="/login"
                className="bg-primary text-white font-bold uppercase tracking-wider rounded-xl border border-transparent px-5 py-2 hover:bg-orange-600 shadow-md hover:-translate-y-0.5 transition-all text-sm font-mono"
              >
                Login
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
