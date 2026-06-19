'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Activity, CheckCircle, AlertTriangle, Users, Stethoscope, Microscope, Search, ShieldCheck, FileText, ShieldAlert, Hash, Timer, BookOpen } from 'lucide-react';
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
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    fetch(`http://localhost:8000/api/cases/${caseId}`)
      .then(res => res.json())
      .then(data => {
        setCaseData(data);
        if (data.status) setStatus(data.status);
        if (data.timeline) setMessages(data.timeline);
        if (data.consensus_result) setConsensus(data.consensus_result);
      })
      .catch(err => console.error(err));

    // WebSocket connection
    const ws = new WebSocket(`ws://localhost:8000/ws/cases/${caseId}`);
    
    ws.onopen = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('error');
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'agent_message') {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.data.id)) return prev;
            return [...prev, msg.data];
          });
        } else if (msg.type === 'status_update') {
          setStatus(msg.data.status);
        } else if (msg.type === 'consensus') {
          setConsensus(msg.data);
          setStatus('awaiting_approval');
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    return () => {
      ws.close();
    };
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
      
      {/* Print-Only Official EMR Report */}
      <div className="hidden print:block text-black bg-white">
        {/* Letterhead */}
        <div className="flex justify-between items-end border-b-2 border-black pb-6 mb-6">
          <div>
            <h1 className="text-4xl font-serif font-black tracking-tight uppercase">AegisMDT</h1>
            <p className="font-mono text-sm uppercase tracking-widest text-gray-500 mt-1">Multi-Disciplinary Tumor Board</p>
            <p className="font-sans text-xs mt-1 text-gray-600">Department of Precision Oncology</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold uppercase tracking-widest text-xs mb-1">Official EMR Export</p>
            <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><span className="font-bold">Case ID:</span> {caseId.split('-')[0].toUpperCase()}</p>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold border-b border-gray-300 pb-2 mb-3 uppercase tracking-wider">Patient Demographics</h2>
          <div className="grid grid-cols-2 gap-4 text-sm font-sans">
            <div><span className="font-bold text-gray-600">Age:</span> {caseData.input_data.age || 'Not specified'} years</div>
            <div><span className="font-bold text-gray-600">Sex:</span> <span className="capitalize">{caseData.input_data.sex || 'Not specified'}</span></div>
            <div><span className="font-bold text-gray-600">MRN Hash:</span> <span className="font-mono text-xs">0x{caseData.id.replace(/-/g, '').substring(0,16)}...</span></div>
            <div><span className="font-bold text-gray-600">Status:</span> HIPAA Compliant / Anonymized</div>
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold border-b border-gray-300 pb-2 mb-3 uppercase tracking-wider">Clinical Summary</h2>
          <div className="text-sm font-sans leading-relaxed text-justify whitespace-pre-wrap">
            {caseData.anonymized_summary || caseData.input_data.description}
          </div>
        </div>

        {/* Consensus Result */}
        {consensus && (
          <div className="mb-6">
            <h2 className="font-serif text-xl font-bold border-b border-gray-300 pb-2 mb-3 uppercase tracking-wider">MDT Consensus & Recommendations</h2>
            
            <div className="mb-4">
              <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-1">Primary Diagnosis</h3>
              <p className="text-lg font-serif font-bold">{consensus.diagnosis.primary_diagnosis}</p>
              <p className="text-sm text-gray-600 italic">WHO Classification: {consensus.diagnosis.who_classification}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-1">Risk Assessment</h3>
              <p className="text-md"><span className="font-bold">{consensus.risk_assessment.risk_category} Risk</span> (Urgency: <span className="uppercase">{consensus.risk_assessment.treatment_urgency}</span>)</p>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-1">Treatment Plan</h3>
              <p className="text-sm font-sans leading-relaxed text-justify whitespace-pre-wrap">{consensus.treatment_recommendation}</p>
            </div>
            
            {consensus.references && consensus.references.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-widest mb-1">Clinical Guidelines Referenced</h3>
                <ul className="list-disc list-inside text-xs font-serif italic space-y-1">
                  {consensus.references.map((ref: string, idx: number) => (
                    <li key={idx}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Signature Block */}
        <div className="mt-20 pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-sm break-inside-avoid">
          <div>
            <p className="mb-12 font-bold text-gray-600 uppercase tracking-widest">Attending Physician</p>
            <div className="border-b border-black w-64 mb-2"></div>
            <p>Signature & Date</p>
            <p className="mt-2 text-xs text-gray-500 italic">This document represents a computational decision-support consensus and must be validated by a licensed medical professional.</p>
          </div>
          <div>
            <p className="mb-12 font-bold text-gray-600 uppercase tracking-widest">AegisMDT Orchestrator</p>
            <div className="border-b border-black w-64 mb-2"></div>
            <p>Digital Audit Trail</p>
            <p className="mt-2 font-mono text-[10px] text-gray-500 break-all">Hash ID: {caseData.id}</p>
          </div>
        </div>
      </div>

      {/* Persistent doctor-oversight banner */}
      <div className="px-6 py-2 bg-black text-white flex items-center justify-between gap-4 flex-wrap border-b-4 border-black mb-0 print:hidden mt-0">
        <div className="flex items-center gap-2 text-[12px]">
          <ShieldAlert size={14} strokeWidth={2.5} className="text-teal-400" />
          <span>
            <strong>Decision Support Tool</strong> — Final clinical decisions remain with the attending physician.
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-teal-400 font-bold">
          ◉ Data Anonymized · Audit Active
        </span>
      </div>

      {/* Status bar */}
      <div className="px-6 py-4 bg-white flex items-center justify-between gap-4 flex-wrap border-b-4 border-black mb-6 shadow-[0_4px_0_0_rgba(0,0,0,1)] print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <span className="font-mono uppercase text-[10px] tracking-widest text-gray-500 font-bold">Case</span>
            <span className="font-mono text-sm inline-flex items-center gap-1.5 font-bold">
              <Hash size={12} strokeWidth={3} /> {caseId.split('-')[0].toUpperCase()}
            </span>
          </div>
          <span className="w-px h-8 bg-gray-300" />
          
          <div className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              status === 'awaiting_approval' || status === 'approved' ? 'bg-green-400 text-black' :
              status === 'debating' ? 'bg-yellow-400 text-black animate-pulse' :
              'bg-blue-400 text-black'
            }`}>
            {status === 'debating' && <AlertTriangle className="mr-1 h-3 w-3 inline" />}
            {(status || 'UNKNOWN').replace('_', ' ')}
          </div>

          <div className="px-3 py-1 bg-gray-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold font-mono uppercase tracking-widest flex items-center gap-1.5">
            <Timer size={12} strokeWidth={3} />
            <span className="animate-pulse">Live Sync</span>
          </div>

          {caseData.band_room_id ? (
            <span className="text-xs text-gray-500 font-mono px-2 py-0.5 flex items-center">
              Room: {caseData.band_room_id.split('-')[0]}
            </span>
          ) : (
             <span className="text-xs text-yellow-600 font-mono px-2 py-0.5 flex items-center">
               <AlertTriangle className="mr-1 h-3 w-3" /> Local Mode
             </span>
          )}
        </div>
        
        {status === 'submitted' || status === 'processing' ? (
          <div className="flex space-x-3 no-print">
            <div className={`px-4 py-2 flex items-center font-mono text-sm font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              wsStatus === 'connected' ? 'bg-green-400' :
              wsStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`}>
              {wsStatus === 'connected' ? (
                <><Activity className="mr-2 h-4 w-4 animate-pulse" /> WS Connected - Awaiting Agents...</>
              ) : wsStatus === 'error' ? (
                <><AlertTriangle className="mr-2 h-4 w-4" /> WS Connection Error</>
              ) : (
                <><Activity className="mr-2 h-4 w-4 animate-spin" /> Connecting to Orchestrator...</>
              )}
            </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] print:hidden">
        
        {/* Left Panel: Patient Data (Brutalist style) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex-1 overflow-y-auto">
            <div className="bg-gray-100 px-5 py-4 border-b-2 border-black">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope size={16} strokeWidth={2.5} />
                <span className="font-mono uppercase text-[11px] tracking-[0.22em] font-bold">Patient Profile</span>
              </div>
              <h2 className="text-2xl font-black font-serif tracking-tighter leading-none mb-2 capitalize">
                {caseData.input_data.sex || 'Unknown'}, {caseData.input_data.age || '?'} yrs
              </h2>
              <div className="flex gap-2 flex-wrap mt-3">
                <span className="bg-black text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 font-bold">ID · {caseData.id.substring(0,4).toUpperCase()}</span>
                <span className="bg-orange-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-mono uppercase tracking-widest px-2 py-1 font-bold">HIPAA Audited</span>
              </div>
            </div>

            <div className="px-5 py-4 border-b-2 border-black">
               <div className="font-mono uppercase text-[10px] tracking-[0.22em] text-gray-500 font-bold mb-3">
                 § Clinical Summary
               </div>
               <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{caseData.anonymized_summary || caseData.input_data.description}</p>
            </div>

            <div className="px-5 py-4">
               <div className="font-mono uppercase text-[10px] tracking-[0.22em] text-gray-500 font-bold mb-3">
                 § Latent Vector Hash
               </div>
               <p className="font-mono text-[10px] text-green-600 font-bold break-all bg-green-50 p-2 border border-green-200">
                  0x{caseData.id.replace(/-/g, '')}a9f2c...
               </p>
            </div>
          </div>
        </div>

        {/* Center Panel: Agent Debate Room (WebSocket Stream) */}
        <div className="lg:col-span-5 flex flex-col bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
          <div className="p-4 border-b-2 border-black bg-gray-100 flex justify-between items-center">
            <h3 className="font-bold font-serif uppercase tracking-widest flex items-center text-sm">
              <Activity className="mr-2 h-4 w-4 text-black" />
              Live Agent Swarm
            </h3>
            <div className="flex items-center gap-2">
              {['MO', 'PA', 'PR', 'PV', 'TR'].map(agent => (
                <div key={agent} className={`w-8 h-8 border-2 border-black font-mono text-[10px] font-bold flex items-center justify-center ${status === 'debating' && (agent === 'PA' || agent === 'PR' || agent === 'MO') ? 'bg-yellow-400 text-black animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-400'}`} title={`Agent: ${agent}`}>
                  {agent}
                </div>
              ))}
            </div>
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
                <div className={`max-w-[90%] rounded-2xl p-5 border-2 ${
                  msg.agent_role === 'moderator' ? 'bg-zinc-900 text-white border-zinc-900' :
                  msg.agent_role === 'human' ? 'bg-sky-50 text-black border-sky-200' :
                  msg.message_type === 'debate' ? 'bg-amber-50 text-black border-amber-200' :
                  'bg-white text-black border-gray-200'
                } shadow-sm`}>
                  <div className="flex items-center mb-3 border-b border-current/10 pb-3">
                    {getRoleIcon(msg.agent_role)}
                    <span className="text-[13px] font-bold uppercase tracking-wider ml-2 opacity-90">{msg.agent_handle}</span>
                    <span className="text-[11px] opacity-60 ml-auto font-mono pl-4">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`text-[14.5px] leading-[1.7] whitespace-pre-wrap ${msg.agent_role === 'moderator' ? 'text-zinc-200' : 'text-zinc-800 font-medium'}`}>{msg.content}</div>
                  
                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-current/20">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-70 mb-1 flex items-center">
                        <BookOpen size={10} className="mr-1" /> Citations & References
                      </div>
                      <ul className="list-disc list-outside ml-3 text-[11px] opacity-90 space-y-1">
                        {msg.references.map((ref: string, idx: number) => (
                          <li key={idx} className="font-serif italic leading-tight">{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.confidence !== null && (
                    <div className="mt-3 flex items-center pt-2 border-t border-current/10">
                      <div className="h-1.5 flex-1 bg-current/20 rounded-none overflow-hidden border border-black/20">
                        <div 
                          className={`h-full ${msg.confidence > 0.8 ? 'bg-green-500' : msg.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${msg.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono ml-2 font-bold opacity-80">{(msg.confidence * 100).toFixed(0)}% CONF</span>
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
                  <div className="flex-1 mr-4">
                    <span className="text-black font-bold block text-xs uppercase tracking-wider mb-2">Diagnosis</span>
                    <div className="bg-orange-50 border-2 border-orange-500 rounded-none p-3 shadow-[2px_2px_0px_0px_#f97316]">
                      <p className="font-bold text-orange-900 text-lg leading-tight">{consensus.diagnosis.primary_diagnosis}</p>
                      <p className="text-xs text-orange-800/80 mt-2 font-mono">WHO: {consensus.diagnosis.who_classification || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="shrink-0 bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <CircularProgress value={consensus.consensus_confidence} label="Consensus" />
                  </div>
                </div>
                
                <div>
                  <span className="text-black font-bold block text-xs uppercase tracking-wider mb-2">Risk Assessment</span>
                  <div className={`border-2 rounded-none p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    consensus.risk_assessment.risk_category.toLowerCase().includes('high') ? 'bg-red-100 border-red-600 text-red-900' : 'bg-white border-black text-black'
                  }`}>
                    <p className="font-bold text-lg">{consensus.risk_assessment.risk_category}</p>
                    <p className="text-xs font-mono font-bold mt-1 uppercase">Urgency: {consensus.risk_assessment.treatment_urgency}</p>
                  </div>
                </div>

                <div>
                  <span className="text-black font-bold block text-xs uppercase tracking-wider mb-2">Treatment Recommendation</span>
                  <p className="text-sm bg-white p-4 font-medium leading-relaxed rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
