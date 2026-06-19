"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const isLandingPage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-background">
      <div className="container flex h-16 max-w-screen-2xl items-center px-8">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="h-8 w-8 rounded-none border-2 border-black bg-primary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-bold text-white text-xs">AE</span>
            </div>
            <span className="hidden font-serif text-2xl font-bold sm:inline-block text-foreground">AegisMDT</span>
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
          <div className="flex items-center ml-6 border-l-2 border-black pl-6 space-x-4">
            {!isLoading && user ? (
              <>
                {!isLandingPage && (
                  <div className="flex items-center text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-white border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] max-w-[200px]">
                    <User className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span className="truncate">{user.id.split('@')[0]}</span>
                  </div>
                )}
                {isLandingPage ? (
                  <Link 
                    href="/dashboard"
                    className="bg-primary text-white font-bold uppercase tracking-wider rounded-none border-2 border-black px-5 py-2 hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm font-mono"
                  >
                    Go To App
                  </Link>
                ) : (
                  <button 
                    onClick={logout}
                    className="flex items-center text-sm font-bold text-destructive hover:text-destructive/80 transition-colors uppercase tracking-widest font-mono"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                )}
              </>
            ) : !isLoading && !user ? (
              <Link 
                href="/login"
                className="bg-primary text-white font-bold uppercase tracking-wider rounded-none border-2 border-black px-5 py-2 hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm font-mono"
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
