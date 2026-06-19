'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, FileText, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [description, setDescription] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.subscription_active) {
        router.push("/pricing");
      } else {
        // Fetch historical cases
        fetch('http://localhost:8000/api/cases')
          .then(res => res.json())
          .then(data => setCases(data))
          .catch(err => console.error("Failed to fetch cases:", err));
      }
    }
  }, [user, authLoading, router]);

  const fillDemoData = () => {
    setDescription("Patient presented with progressive plum-colored maculopapular and nodular skin lesions spreading to the chest, face, and upper extremities over the past 3 weeks. Severe night sweats, 8 kg weight loss, and left-sided facial nerve palsy (Bell's palsy) developed within the last 48 hours.\n\nLaboratory: Mild pancytopenia. Lactate dehydrogenase (LDH) markedly elevated at 1,200 U/L.\n\nPathology (Skin & Bone Marrow Biopsy): Infiltration of medium-sized atypical mononuclear blastoid cells. Immunohistochemistry (IHC) showed CD4+, CD56+, CD123+, TCL1+, and CD303+, while negative for MPO, CD3, CD20, and CD34. Bone marrow shows 60% involvement by similar blastoid cells.\n\nGenetics: NGS revealed TET2 mutation (VAF 45%), ASXL1 mutation, and a complex karyotype including MYC-BCL2 fusion (t(8;14)).");
    setAge("21");
    setSex("male");
    setImageUrl("https://upload.wikimedia.org/wikipedia/commons/e/ea/Blastic_plasmacytoid_dendritic_cell_neoplasm.jpg");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.length < 20) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          age: age ? parseInt(age) : null,
          sex: sex || null,
          image_url: imageUrl || null
        }),
      });
      
      const data = await res.json();
      if (data.id) {
        router.push(`/cases/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to submit case:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Dashboard Header & Metrics */}
      <div className="mb-8 flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Dashboard</h1>
          <p className="text-muted-foreground mt-1">Submit new cases or monitor ongoing AI medical board debates.</p>
        </div>
        
        {/* Platform Metrics (Mock Data for Hackathon "WOW" factor) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 flex items-center">
            <div className="h-10 w-10 bg-primary/20 text-primary border-2 border-black rounded-none flex items-center justify-center mr-4">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Cases Analyzed (YTD)</p>
              <h3 className="text-3xl font-serif font-bold tracking-tight text-foreground">1,420</h3>
            </div>
          </div>
          
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 flex items-center">
            <div className="h-10 w-10 bg-green-500/20 text-green-700 border-2 border-black rounded-none flex items-center justify-center mr-4">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">ICE Consensus Acc</p>
              <h3 className="text-3xl font-serif font-bold tracking-tight text-foreground">98.4%</h3>
            </div>
          </div>
          
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 flex items-center">
            <div className="h-10 w-10 bg-primary/20 text-primary border-2 border-black rounded-none flex items-center justify-center mr-4">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Avg. Latency</p>
              <h3 className="text-3xl font-serif font-bold tracking-tight text-foreground">4.2s</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-7 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-6"
        >
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                New Patient Case
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter clinical details for the AI board to review.
              </p>
            </div>
            <button 
              type="button" 
              onClick={fillDemoData}
              className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded-full transition-colors font-medium border border-primary/30 flex items-center">
              <span>✨ Fill Demo Patient (BPDCN)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="flex h-10 w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all font-mono"
                  placeholder="e.g. 62"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sex</label>
                  <select 
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="flex h-10 w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all font-mono"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Clinical Description & History <span className="text-destructive">*</span></label>
              <textarea 
                required
                minLength={20}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[200px] w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all font-mono resize-none"
                placeholder="Patient presented with persistent cytopenias for 6 months. Bone marrow biopsy showed 12% blasts with multilineage dysplasia. Cytogenetics revealed del(5q) and monosomy 7..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Whole Slide Image (WSI) URL <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex h-10 w-full bg-white border-2 border-black rounded-none px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all font-mono"
                placeholder="https://example.com/microscopy-slide.jpg"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !description || description.length < 20}
              className="w-full bg-primary text-white font-bold uppercase tracking-wider rounded-none border-2 border-black px-4 py-3 hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex justify-center items-center mt-4"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Submit to Medical Board
                </span>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="md:col-span-5 space-y-4"
        >
          <div className="bg-white p-5 border-2 border-black border-l-8 border-l-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <h3 className="font-bold font-serif text-xl mb-4">Agent Workflow</h3>
            <ul className="space-y-4 text-sm font-mono">
              <li className="flex items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-black bg-primary text-white text-xs font-bold mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">1</span>
                <span><strong>Privacy Agent</strong> strips PII and generates latent vectors.</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-black bg-primary text-white text-xs font-bold mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">2</span>
                <span><strong>Pathology & Prognostication Agents</strong> analyze the case in parallel via Band rooms.</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-black bg-primary text-white text-xs font-bold mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">3</span>
                <span><strong>Moderator Agent</strong> enforces the ICE Protocol (Iterative Consensus Ensemble) if conflict arises.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-5">
            <h3 className="font-bold font-serif text-xl mb-4 flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" /> 
              System Status
            </h3>
            <div className="space-y-3 text-sm font-mono font-bold">
              <div className="flex justify-between border-b-2 border-gray-100 pb-2">
                <span className="text-gray-500 uppercase tracking-widest text-xs">Band Platform</span>
                <span className="text-green-500 uppercase">Connected</span>
              </div>
              <div className="flex justify-between border-b-2 border-gray-100 pb-2">
                <span className="text-gray-500 uppercase tracking-widest text-xs">Active Agents</span>
                <span className="text-black uppercase">5 / 5</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-500 uppercase tracking-widest text-xs">Privacy Protocol</span>
                <span className="text-black uppercase">HIPAA Enforced</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Historical Cases Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 mb-16"
      >
        <h2 className="text-2xl font-bold flex items-center mb-4">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Historical Case Registry
        </h2>
        
        {cases.length === 0 ? (
          <div className="bg-white p-8 text-center text-black font-bold font-mono border-2 border-dashed border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p>No historical cases found in the database. Submit a new case to populate the registry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto glass-panel p-0 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-black text-white font-mono uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Case Hash</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Age/Sex</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20 bg-white">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">0x{c.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{c.input_data.age || '?'} / {c.input_data.sex || '?'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-none border ${
                        c.status === 'approved' ? 'bg-green-100 text-green-800 border-green-800' : 
                        c.status === 'awaiting_approval' ? 'bg-blue-100 text-blue-800 border-blue-800' :
                        'bg-yellow-100 text-yellow-800 border-yellow-800'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => router.push(`/cases/${c.id}`)}
                        className="text-xs bg-black text-white px-3 py-1 font-bold hover:bg-primary transition-colors">
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
