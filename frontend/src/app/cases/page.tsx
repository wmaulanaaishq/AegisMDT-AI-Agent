'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, CheckCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function ActiveCasesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetch('http://localhost:8000/api/cases')
        .then(res => res.json())
        .then(data => {
          setCases(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user, authLoading, router]);

  const getStatusColor = (status: string) => {
    if (status === 'approved') return 'text-green-500 bg-green-500/10';
    if (status === 'debating') return 'text-orange-500 bg-orange-500/10';
    if (status === 'error') return 'text-red-500 bg-red-500/10';
    return 'text-blue-500 bg-blue-500/10';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4 mr-1" />;
    if (status === 'debating' || status === 'error') return <AlertTriangle className="w-4 h-4 mr-1" />;
    return <Activity className="w-4 h-4 mr-1 animate-pulse" />;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Activity className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading active cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1000px] px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 flex items-center justify-between border-b border-border/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Cases</h1>
          <p className="text-muted-foreground mt-1">Manage and review ongoing medical board deliberations.</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium">
          Submit New Case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No active cases found</h3>
          <p className="text-muted-foreground mt-2">Submit a new patient case from the dashboard to begin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <Link href={`/cases/${c.id}`} key={c.id}>
              <div className="glass-panel p-5 rounded-xl hover:bg-secondary/30 transition-all group border border-border/50 hover:border-primary/50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                      ID: {c.id.split('-')[0]}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(c.status)}`}>
                      {getStatusIcon(c.status)}
                      {c.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-foreground/90">
                    <span className="font-semibold mr-2">{c.input_data.age || 'Unknown'}yo {c.input_data.sex || 'Unknown'}</span> 
                    <span className="font-mono text-[10px] text-green-500 bg-green-500/10 px-1 py-0.5 rounded mr-2">
                      0x{c.id.replace(/-/g, '').substring(0, 12)}...
                    </span>
                    <p className="line-clamp-2 mt-1 text-muted-foreground">{c.input_data.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-2 shrink-0 text-sm">
                  <div className="text-muted-foreground text-xs">
                    Submitted: {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    View Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
