'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Activity, CheckCircle, AlertTriangle, Users, Stethoscope, Microscope, Search, ShieldCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CircularProgress = ({ value, label }: { value: number, label: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - value * circumference;
  const color = value > 0.8 ? '#22c55e' : value > 0.5 ? '#eab308' : '#ef4444';
  return (
    <div className="flex items-center space-x-3">
      <div className="relative h-12 w-12">
        <svg className="h-full w-full -rotate-90 transform drop-shadow-md" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-muted/30" />
          <circle cx="20" cy="20" r={radius} stroke={color} strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color }}>{(value * 100).toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

type CaseStatus = 'submitted' | 'processing' | 'debating' | 'consensus_reached' | 'awaiting_approval' | 'approved' | 'revised';

export default function CaseDashboard() {
  const params = useParams();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<CaseStatus>('submitted');
  const [consensus, setConsensus] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    fetch(`http://localhost:8000/api/cases/${caseId}`)
      .then(res => res.json())
      .then(data => {
        setCaseData(data);
        setStatus(data.status);
        setMessages(data.timeline || []);
        if (data.consensus_result) setConsensus(data.consensus_result);
      })
      .catch(err => console.error(err));

    // WebSocket connection
    const ws = new WebSocket(`ws://localhost:8000/ws/cases/${caseId}`);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'agent_message') {
        setMessages(prev => {
          // Prevent duplicates by ID
          if (prev.some(m => m.id === msg.data.id)) return prev;
          return [...prev, msg.data];
        });
      } else if (msg.type === 'status_update') {
        setStatus(msg.data.status);
      } else if (msg.type === 'consensus') {
        setConsensus(msg.data);
      }
    };

    return () => ws.close();
  }, [caseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleApprove = async (approved: boolean) => {
    try {
      const res = await fetch(`http://localhost:8000/api/cases/${caseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, doctor_notes: approved ? null : feedback })
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setShowFeedbackInput(false);
        setFeedback('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startMockDemo = () => {
    setStatus('processing');
    setMessages([]);
    setConsensus(null);
    
    const sequence = [
      { id: '1', timestamp: new Date().toISOString(), agent_role: 'privacy', agent_handle: 'Privacy Agent', content: 'PII stripped successfully. Generating latent vector hashes for genomic data.', message_type: 'log', confidence: 0.99 },
      { id: '2', timestamp: new Date().toISOString(), agent_role: 'pathology', agent_handle: 'Pathology Agent', content: 'Analyzing whole slide image. Medium-sized blastoid cells detected. IHC profile: CD4+, CD56+, CD123+.', message_type: 'log', confidence: 0.94 },
      { id: '3', timestamp: new Date().toISOString(), agent_role: 'prognostication', agent_handle: 'Prognostication Agent', content: 'Initial diagnosis: Blastic plasmacytoid dendritic cell neoplasm (BPDCN). However, MYC-BCL2 fusion suggests aggressive double-hit lymphoma.', message_type: 'debate', confidence: 0.75 },
      { id: '4', timestamp: new Date().toISOString(), agent_role: 'pathology', agent_handle: 'Pathology Agent', content: 'Disagree. CD123 and CD303 positivity are hallmark for BPDCN. The fusion is secondary.', message_type: 'debate', confidence: 0.96 },
      { id: '5', timestamp: new Date().toISOString(), agent_role: 'moderator', agent_handle: 'Moderator', content: 'Conflicting diagnoses detected. Invoking Iterative Consensus Ensemble (ICE) protocol. Re-evaluating literature for MYC-BCL2 in BPDCN.', message_type: 'log', confidence: 0.99 },
      { id: '6', timestamp: new Date().toISOString(), agent_role: 'prognostication', agent_handle: 'Prognostication Agent', content: 'Acknowledged. Literature confirms rare subset of BPDCN with 8q24 abnormalities. Revising risk stratification to ultra-high risk BPDCN.', message_type: 'debate', confidence: 0.92 },
      { id: '7', timestamp: new Date().toISOString(), agent_role: 'moderator', agent_handle: 'Moderator', content: 'Consensus reached: Ultra-high risk BPDCN with complex karyotype. Generating final report.', message_type: 'log', confidence: 0.99 }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        if (i === 2 || i === 3 || i === 5) setStatus('debating');
        else if (i === 4) setStatus('processing');
        setMessages(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
        setStatus('awaiting_approval');
        setConsensus({
          diagnosis: "Blastic plasmacytoid dendritic cell neoplasm (BPDCN) with MYC-BCL2 rearrangement",
          confidence: 0.94,
          reasoning: "Morphology and IHC (CD4+, CD56+, CD123+) confirm BPDCN. Initial conflict regarding MYC-BCL2 resolved via ICE protocol, establishing it as an ultra-high risk variant.",
          treatment_recommendations: [
            "Tagraxofusp (CD123-directed cytotoxin) induction",
            "Prepare for allogeneic hematopoietic stem cell transplantation (allo-HSCT)"
          ]
        });
      }
    }, 2500);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'moderator': return <Users className="h-5 w-5 text-blue-400" />;
      case 'pathology': return <Microscope className="h-5 w-5 text-purple-400" />;
      case 'prognostication': return <Stethoscope className="h-5 w-5 text-orange-400" />;
      case 'clinical_trial': return <Search className="h-5 w-5 text-teal-400" />;
      case 'privacy': return <ShieldCheck className="h-5 w-5 text-green-400" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (!caseData || caseData.detail) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {caseData?.detail ? (
            <>
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground">{caseData.detail}. (Note: Data may be lost if server restarted).</p>
            </>
          ) : (
            <>
              <Activity className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Connecting to AegisMDT Network...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Case Dashboard <span className="text-muted-foreground font-normal ml-2 text-sm font-mono">{caseId.split('-')[0]}</span>
          </h1>
          <div className="flex items-center mt-2 space-x-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === 'awaiting_approval' || status === 'approved' ? 'bg-green-500/10 text-green-500' :
              status === 'debating' ? 'bg-orange-500/10 text-orange-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              {status === 'debating' && <AlertTriangle className="mr-1 h-3 w-3" />}
              {(status || 'UNKNOWN').replace('_', ' ').toUpperCase()}
            </span>
            {caseData.band_room_id ? (
              <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded flex items-center">
                Band Room: {caseData.band_room_id.split('-')[0]}
              </span>
            ) : (
              <span className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded flex items-center" title="Band Cloud integration failed or API keys missing. Operating via Local Orchestrator.">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Local Fallback Mode
              </span>
            )}
          </div>
        </div>
        
        {status === 'submitted' || status === 'processing' || status === 'debating' ? (
          <div className="flex space-x-3 no-print">
            <button 
              onClick={startMockDemo}
              className="px-6 py-2 bg-primary text-white font-bold uppercase tracking-wider rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm font-mono flex items-center">
              <Activity className="mr-2 h-4 w-4 animate-pulse" />
              Start ICE Demo
            </button>
          </div>
        ) : null}

        {status === 'awaiting_approval' && (
          <div className="flex space-x-3 no-print">
            {!showFeedbackInput ? (
              <button 
                onClick={() => setShowFeedbackInput(true)}
                className="px-4 py-2 bg-destructive/20 text-destructive border border-destructive/50 rounded hover:bg-destructive/30 transition-colors text-sm font-medium">
                Request Revision
              </button>
            ) : (
              <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-4">
                <input 
                  type="text" 
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Medical feedback for agents..."
                  className="px-3 py-2 bg-background/80 border border-border rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button 
                  onClick={() => handleApprove(false)}
                  disabled={!feedback.trim()}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded text-sm font-medium disabled:opacity-50 hover:bg-destructive/90">
                  Submit
                </button>
                <button 
                  onClick={() => setShowFeedbackInput(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm font-medium hover:bg-secondary/80">
                  Cancel
                </button>
              </div>
            )}
            <button 
              onClick={() => handleApprove(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Consensus
            </button>
          </div>
        )}
        
        {status === 'approved' && (
          <div className="flex space-x-3 no-print">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center shadow-lg">
              <FileText className="mr-2 h-4 w-4" />
              Download EMR Report (PDF)
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* Left Panel: Patient Data */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="glass-panel p-5 flex-1 overflow-y-auto">
            <h3 className="font-semibold mb-4 border-b border-border/50 pb-2">Anonymized Profile</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Age / Sex</span>
                <p className="font-medium">{caseData.input_data.age || 'Unknown'} / {caseData.input_data.sex || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Latent Vector Hash</span>
                <p className="font-mono text-[10px] text-green-400 break-all">
                  0x{caseData.id.replace(/-/g, '')}a9f2c...
                </p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Clinical Description</span>
                <p className="text-foreground/90 whitespace-pre-wrap">{caseData.anonymized_summary || caseData.input_data.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Agent Debate Room (WebSocket Stream) */}
        <div className="lg:col-span-5 flex flex-col glass-panel overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-background/50 flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <Activity className="mr-2 h-4 w-4 text-primary" />
              Live Agent Collaboration
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className={`flex flex-col ${msg.agent_role === 'moderator' ? 'items-center' : 'items-start'}`}
              >
                <div className={`max-w-[90%] rounded-none p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  msg.agent_role === 'moderator' ? 'bg-primary text-white' :
                  msg.message_type === 'debate' ? 'bg-yellow-400 text-black' :
                  'bg-white text-black'
                }`}>
                  <div className="flex items-center mb-1">
                    {getRoleIcon(msg.agent_role)}
                    <span className="text-xs font-semibold ml-2 text-foreground/80">{msg.agent_handle}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto pl-4">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-2">{msg.content}</p>
                  
                  {msg.confidence !== null && (
                    <div className="mt-2 flex items-center">
                      <div className="h-1 flex-1 bg-background/50 rounded overflow-hidden">
                        <div 
                          className={`h-full ${msg.confidence > 0.8 ? 'bg-green-500' : msg.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${msg.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] ml-2 text-muted-foreground">{(msg.confidence * 100).toFixed(0)}% Conf</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            {['processing', 'debating'].includes(status) && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center space-x-3 text-muted-foreground text-xs p-2"
              >
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="animate-pulse">Agents are analyzing and debating literature...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right Panel: Consensus Results */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="glass-panel rounded-xl p-5 flex-1 overflow-y-auto">
            <h3 className="font-semibold mb-4 border-b border-border/50 pb-2">Final Consensus</h3>
            
            {consensus ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Diagnosis</span>
                    <div className="bg-primary/5 border border-primary/20 rounded p-3 shadow-inner">
                      <p className="font-semibold text-primary">{consensus.diagnosis.primary_diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-1">WHO: {consensus.diagnosis.who_classification || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 bg-background/50 p-2 rounded border border-border">
                    <CircularProgress value={consensus.consensus_confidence} label="Consensus" />
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Risk Assessment</span>
                  <div className={`border rounded p-3 ${
                    consensus.risk_assessment.risk_category.toLowerCase().includes('high') ? 'bg-destructive/10 border-destructive/30 text-destructive-foreground' : 'bg-secondary border-border'
                  }`}>
                    <p className="font-semibold">{consensus.risk_assessment.risk_category}</p>
                    <p className="text-xs opacity-80 mt-1">Urgency: {consensus.risk_assessment.treatment_urgency}</p>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Treatment Recommendation</span>
                  <p className="text-sm bg-background/50 p-3 rounded border border-border">
                    {consensus.treatment_recommendation}
                  </p>
                </div>
                
                {consensus.clinical_trials && consensus.clinical_trials.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Top Clinical Trials</span>
                    <div className="space-y-2">
                      {consensus.clinical_trials.slice(0, 2).map((trial: any, i: number) => (
                        <div key={i} className="text-xs bg-secondary/40 p-2 rounded border border-border flex justify-between items-center">
                          <span className="font-medium">{trial.trial_id}</span>
                          <span className="text-teal-400">{(trial.eligibility_match_score * 100).toFixed(0)}% Match</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Board is currently deliberating...</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
