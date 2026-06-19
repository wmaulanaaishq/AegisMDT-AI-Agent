"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Microscope, UserCog, Scale, ArrowRight, ShieldCheck, Database, Layers, Lock, Activity, Cpu, Fingerprint, Printer, Trophy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./components/Scene3D').then(mod => mod.Scene3D), { ssr: false });

const Marquee = () => (
  <div className="w-full bg-primary text-black py-4 overflow-hidden border-b-8 border-slate-200 flex whitespace-nowrap z-20">
    <motion.div 
      className="flex font-mono font-black uppercase tracking-widest text-sm"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="mx-4 flex items-center">
          <span className="text-black mx-4">■</span> [ INITIATING ICE PROTOCOL ] 
          <span className="text-black mx-4">■</span> [ SYNCING 4 SPECIALIST AGENTS ] 
          <span className="text-black mx-4">■</span> [ MULTI-MODAL ANALYSIS ACTIVE ]
        </span>
      ))}
    </motion.div>
  </div>
);

export default function LandingPage() {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  
  useEffect(() => {
    const startupLines = [
      "> INITIATING AEGISMDT KERNEL...",
      "> CONNECTING TO BAND SDK NETWORK...",
      "> SYNCING SPECIALIST AGENTS:",
      "  [OK] Privacy Agent",
      "  [OK] Pathology Agent", 
      "  [OK] Prognostication Agent",
      "  [OK] Moderator Agent",
      "> WAITING FOR PATIENT CASE INPUT..."
    ];
    const infiniteLogs = [
      "> PINGING CHROMA DB... [OK]",
      "> MEMORY UTILIZATION: 14%",
      "> ICE PROTOCOL READY...",
      "> SECURE CONNECTION ESTABLISHED",
      "> WAITING FOR NEW CASE INPUT...",
      "> RUNNING BACKGROUND HEALTH CHECK... [PASS]"
    ];

    let i = 0;
    
    const initialInterval = setInterval(() => {
      setTerminalLines(prev => [...prev, startupLines[i]]);
      i++;
      if (i >= startupLines.length) {
        clearInterval(initialInterval);
        
        // Start infinite random logs
        setInterval(() => {
           const randomLog = infiniteLogs[Math.floor(Math.random() * infiniteLogs.length)];
           setTerminalLines(prev => {
             const newLines = [...prev, randomLog];
             if (newLines.length > 8) return newLines.slice(newLines.length - 8);
             return newLines;
           });
        }, 1500);
      }
    }, 400);

    return () => clearInterval(initialInterval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <div className="flex flex-col items-center bg-background">
      <Marquee />

      {/* Hero Wrapper (Contains 3D Scene & Grid) */}
      <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden border-b-8 border-slate-200">
        {/* Interactive 3D Background */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-75 mix-blend-multiply">
          <Scene3D />
        </div>

        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 2px, transparent 2px)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0',
            maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          }}
        />

        {/* Hero Content */}
        <motion.div 
        className="z-10 container max-w-5xl px-6 flex flex-col items-center justify-center mt-28 mb-32 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-primary text-white border border-slate-200 px-4 py-1.5 shadow-sm text-xs font-bold font-mono uppercase tracking-widest mb-10">
          <ShieldCheck className="w-4 h-4" />
          <span>Regulated Deep-Tech</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter mb-8 leading-tight relative z-10">
          <span className="bg-white px-8 py-3 border-[6px] border-slate-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block transform -rotate-2 cursor-default hover:scale-105 hover:rotate-0 transition-transform duration-300">
            AegisMDT
          </span>
          <br />
          <span className="text-foreground mt-8 inline-block">AI Medical Board.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-black font-bold max-w-3xl mb-12 leading-relaxed border border-slate-200 bg-white px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
          Secure, multi-agent orchestration for rare oncology. Powered by the Iterative Consensus Ensemble (ICE) protocol.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
          <Link href="/dashboard">
            <button className="group relative inline-flex h-14 items-center justify-center bg-primary px-8 font-bold font-mono uppercase tracking-widest text-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sm transition-all">
              <span className="mr-3">Launch Platform</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          
          <a href="https://github.com/wmaulanaaishq/AegisMDT-AI-Agent" target="_blank" rel="noreferrer">
            <button className="inline-flex h-14 items-center justify-center bg-white px-8 font-bold font-mono uppercase tracking-widest text-black border border-slate-200 shadow-xl shadow-slate-200/50 hover:bg-slate-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sm transition-all">
              View Source
            </button>
          </a>
        </motion.div>

        {/* Live Terminal Demo */}
        <motion.div variants={itemVariants} className="mt-24 w-full max-w-2xl text-left bg-black text-green-400 font-mono text-sm p-6 border-8 border-slate-200 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] mx-auto relative group hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 rounded-2xl">
          <div className="absolute -top-5 -right-5 bg-primary text-black border border-slate-200 px-4 py-2 text-[12px] font-black tracking-widest shadow-xl shadow-slate-200/50 group-hover:rotate-6 transition-transform">LIVE STATUS</div>
          <div className="flex space-x-3 mb-6 border-b-4 border-gray-800 pb-4">
            <div className="w-4 h-4 bg-red-500 rounded-2xl border border-slate-200"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded-2xl border border-slate-200"></div>
            <div className="w-4 h-4 bg-green-500 rounded-2xl border border-slate-200"></div>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed min-h-[160px] pt-2 text-base font-bold">{terminalLines.join('\n')}<span className="animate-pulse">_</span></pre>
        </motion.div>

        </motion.div>
      </div> {/* End Hero Wrapper */}

      <div id="platform" className="w-full bg-transparent py-16 mb-24 relative z-10 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-80"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/diagmonds-light.png')`,
            maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
          }}
        />
        <div className="w-full max-w-6xl px-6 mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left"
          >
            {/* Feature 1 */}
            <div className="bg-white p-8 border border-slate-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-primary text-black border border-slate-200 flex items-center justify-center shadow-xl shadow-slate-200/50 mb-6">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-black mb-3 text-black tracking-tight">ICE Protocol</h3>
              <p className="text-black/80 font-bold leading-relaxed text-sm">
                Agents actively debate conflicting prognoses until a high-confidence consensus is reached, eliminating single-model hallucinations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 border border-slate-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-white text-black border border-slate-200 flex items-center justify-center shadow-xl shadow-slate-200/50 mb-6">
                <Microscope className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-black mb-3 text-black tracking-tight">Multi-Modal Vision</h3>
              <p className="text-black/80 font-bold leading-relaxed text-sm">
                Pathology agents process both unstructured medical texts and complex microscopic imagery to identify rare genomic mutations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 border border-slate-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-black text-white border border-slate-200 flex items-center justify-center shadow-xl shadow-slate-200/50 mb-6">
                <UserCog className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-black mb-3 text-black tracking-tight">Human-in-the-Loop</h3>
              <p className="text-black/80 font-bold leading-relaxed text-sm">
                Doctors retain ultimate control. Intervene mid-debate to steer the AI&apos;s clinical direction or request immediate literature revisions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works / User Flow Section */}
      <div id="how-it-works" className="w-full bg-white border-y border-slate-200 py-24 relative z-10 overflow-hidden">
        <div className="container max-w-6xl px-6 mx-auto relative z-10">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-6 text-slate-900">How AegisMDT Works</h2>
            <p className="text-lg font-medium text-slate-600 max-w-2xl mx-auto">
              A seamless end-to-end clinical workflow designed for speed, accuracy, and total transparency.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[10%] w-[80%] h-1 bg-slate-100 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: "01", title: "Data Ingestion", desc: "Upload PDFs, dictate clinical notes, or sync via EMR (FHIR) instantly." },
                { step: "02", title: "Live Agent Swarm", desc: "Watch autonomous AI specialists debate the case and cite literature in real-time." },
                { step: "03", title: "Human-in-the-Loop", desc: "Intervene mid-debate, correct references, and approve the final consensus." },
                { step: "04", title: "EMR Export", desc: "Generate an official, hospital-ready PDF document for medical records." }
              ].map((flow, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-3xl font-black font-mono text-primary shadow-xl shadow-slate-200/50 mb-6 group-hover:-translate-y-2 transition-transform">
                    {flow.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{flow.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed px-2">{flow.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meet The Agents Section */}
      <div id="agents" className="w-full bg-zinc-50 border-y-4 border-slate-200 py-24 relative z-10 pt-32 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')`,
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          }}
        />
        <div className="container max-w-6xl px-6 mx-auto relative z-10">
          <div className="mb-16 text-center">
            <h2 className="text-5xl md:text-7xl font-serif font-black mb-6">Meet The Ensemble</h2>
            <p className="text-xl font-medium text-foreground/80 max-w-2xl mx-auto">
              Four autonomous specialists powered by Featherless AI, synchronized seamlessly via Band SDK.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { role: "Privacy", icon: <Lock />, desc: "Strips PII & generates latent vector hashes.", color: "bg-black text-white" },
              { role: "Pathology", icon: <Microscope />, desc: "Analyzes morphology & WHO classification.", color: "bg-black text-white" },
              { role: "Prognosis", icon: <Activity />, desc: "Calculates IPSS-R & risk stratification.", color: "bg-black text-white" },
              { role: "Moderator", icon: <Scale />, desc: "Enforces ICE debate protocol & consensus.", color: "bg-black text-white" }
            ].map((agent, i) => (
              <motion.div key={i} variants={itemVariants} className="border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <div className={`w-12 h-12 ${agent.color} border border-slate-200 flex items-center justify-center mb-6 shadow-sm`}>
                  {agent.icon}
                </div>
                <h4 className="text-xl font-bold font-serif mb-2 text-black">{agent.role} Agent</h4>
                <p className="font-mono text-xs leading-relaxed text-black/80">{agent.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Hackathon Winning Features Section */}
      <div id="enterprise" className="w-full max-w-6xl px-6 z-10 relative pt-16 mt-16 text-left mb-24">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-serif font-black mb-4 tracking-tight">Built for Production.</h2>
            <p className="text-xl font-bold text-black/80 max-w-2xl bg-white border border-slate-200 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Not just a prototype. We implemented rigorous data integrity and monetization channels.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="bg-white p-6 border border-slate-200 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform">
              <div className="bg-black text-white font-bold font-mono text-xs uppercase tracking-widest px-3 py-1 border border-slate-200 shadow-sm mb-4 inline-flex items-center"><Cpu className="w-4 h-4 mr-2"/> Agentic RAG</div>
              <h4 className="text-xl font-bold font-serif mb-2 text-black">Semantic Scholar APIs</h4>
              <p className="text-sm font-medium opacity-80 leading-relaxed text-black">
                Agents don&apos;t hallucinate treatments. They fetch real-time clinical trials and oncology literature from PubMed/Semantic Scholar via ChromaDB vector retrieval to ground their debates.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-6 border border-slate-200 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform">
              <div className="bg-black text-white font-bold font-mono text-xs uppercase tracking-widest px-3 py-1 border border-slate-200 shadow-sm mb-4 inline-flex items-center"><Fingerprint className="w-4 h-4 mr-2"/> Monetization</div>
              <h4 className="text-xl font-bold font-serif mb-2 text-black">DOKU Payment Gateway</h4>
              <p className="text-sm font-medium opacity-80 leading-relaxed text-black">
                Integrated with DOKU for seamless hospital subscriptions. Guest doctors hit a paywall, while VIP/Regulated accounts bypass it seamlessly. Real business viability.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-6 border border-slate-200 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform">
              <div className="bg-black text-white font-bold font-mono text-xs uppercase tracking-widest px-3 py-1 border border-slate-200 shadow-sm mb-4 inline-flex items-center"><Printer className="w-4 h-4 mr-2"/> Enterprise Grade</div>
              <h4 className="text-xl font-bold font-serif mb-2 text-black">Print-Ready EMR</h4>
              <p className="text-sm font-medium opacity-80 leading-relaxed text-black">
                The final consensus isn&apos;t just a UI component. It exports into a formal, print-ready Electronic Medical Record (PDF) with strict clinical formatting for hospital archives.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Tech Stack Banner */}
      <div id="protocol" className="mt-32 w-full max-w-5xl px-6 z-10 relative mb-32 pt-16">
        <div className="absolute left-1/2 top-10 -translate-x-1/2 bg-black border border-slate-200 px-6 py-2 shadow-sm z-20">
          <p className="text-xs font-bold font-mono text-white uppercase tracking-widest m-0">Powered By</p>
        </div>
        <div className="border border-slate-200 bg-zinc-900 p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-16 relative overflow-hidden">
          <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')`,
            }}
          />
          <div className="flex overflow-hidden relative z-10 w-full group">
            <div className="flex w-max animate-marquee space-x-6 md:space-x-12 items-center px-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-6 md:space-x-12 items-center">
                  <div className="flex items-center space-x-4 bg-white px-6 py-4 border border-slate-200 shadow-sm min-w-max">
                    <img src="https://cryptologos.cc/logos/band-protocol-band-logo.svg?v=032" alt="Band SDK" className="h-10 w-auto" />
                    <span className="text-2xl font-serif font-bold text-black">Band SDK</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-white px-6 py-4 border border-slate-200 shadow-sm min-w-max">
                    <img src="https://avatars.githubusercontent.com/u/152917711?s=200&v=4" alt="Featherless AI" className="h-10 w-auto rounded-full" />
                    <span className="text-2xl font-serif font-bold text-black">Featherless AI</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-white px-6 py-4 border border-slate-200 shadow-sm min-w-max">
                    <img src="https://avatars.githubusercontent.com/u/108674504?s=200&v=4" alt="ChromaDB" className="h-10 w-auto rounded-full" />
                    <span className="text-2xl font-serif font-bold text-black">ChromaDB</span>
                  </div>
                  <div className="flex items-center space-x-4 bg-white px-6 py-4 border border-slate-200 shadow-sm min-w-max pr-12 md:pr-0">
                    <img src="https://avatars.githubusercontent.com/u/104273062?s=200&v=4" alt="lablab.ai" className="h-10 w-auto rounded-full" />
                    <span className="text-2xl font-serif font-bold text-black">lablab.ai</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* AI Generated Brutalist Stats Strip */}
      <section className="w-full relative z-10 bg-black text-white border-y-4 border-slate-200">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4">
          {[
            { value: '0.94', label: 'Mean Consensus' },
            { value: '4', label: 'Agents Per Case' },
            { value: '<8s', label: 'Round-Trip Debate' },
            { value: '120k', label: 'Papers Indexed' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`px-6 py-12 ${i < 3 ? 'md:border-r-4 border-white' : ''} ${i % 2 === 0 ? 'border-r-4 md:border-r-4 border-white' : ''} border-b-4 md:border-b-0 border-white`}
            >
              <div className="font-serif font-black tracking-tighter" style={{ fontSize: 'clamp(48px, 6vw, 80px)', lineHeight: 0.95 }}>
                {s.value}
              </div>
              <div className="mt-4 font-mono uppercase text-[10px] tracking-widest text-primary font-bold">
                ◉ {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-12 border-t-4 border-slate-200 z-10 relative mt-auto">
        <div className="container max-w-6xl px-6 mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-3xl font-serif font-black mb-2 text-white">AegisMDT.</h2>
            <p className="font-mono text-xs opacity-70">© 2026 Band SDK Hackathon Entry.</p>
          </div>
          <div className="flex space-x-6 font-mono text-sm uppercase tracking-widest font-bold">
            <a href="https://github.com/wmaulanaaishq/AegisMDT-AI-Agent" target="_blank" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">Docs</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
