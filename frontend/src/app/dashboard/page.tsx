'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, FileText, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {/* Dashboard Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Dashboard</h1>
          <p className="text-muted-foreground mt-1">Submit new cases or monitor ongoing AI medical board debates.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-7 glass-panel rounded-xl p-6"
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
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="e.g. 62"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sex</label>
                <select 
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                placeholder="Patient presented with persistent cytopenias for 6 months. Bone marrow biopsy showed 12% blasts with multilineage dysplasia. Cytogenetics revealed del(5q) and monosomy 7..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Whole Slide Image (WSI) URL <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="https://example.com/microscopy-slide.jpg"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || description.length < 20}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 h-11"
            >
              {isSubmitting ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Orchestrating Agents...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Convene Medical Board
                </>
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
          <div className="glass-panel rounded-xl p-5 border-l-4 border-l-primary">
            <h3 className="font-semibold mb-2">Agent Workflow</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium mr-3">1</span>
                <span><strong>Privacy Agent</strong> strips PII and generates latent vectors.</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium mr-3">2</span>
                <span><strong>Pathology & Prognostication Agents</strong> analyze the case in parallel via Band rooms.</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium mr-3">3</span>
                <span><strong>Moderator Agent</strong> enforces the ICE Protocol (Iterative Consensus Ensemble) if conflict arises.</span>
              </li>
            </ul>
          </div>
          
          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-semibold flex items-center mb-4">
              <Activity className="mr-2 h-4 w-4 text-green-400" /> 
              System Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Band Platform</span>
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Agents</span>
                <span className="font-medium text-foreground">5 / 5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Privacy Protocol</span>
                <span className="font-medium text-foreground">HIPAA Enforced</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
