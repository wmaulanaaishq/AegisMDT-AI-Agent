"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Network, Microscope, UserCog, Scale, ArrowRight, ShieldCheck, Database, Layers, Lock, Activity, Cpu, Fingerprint, Printer } from 'lucide-react';
import Link from 'next/link';

const Marquee = () => (
  <div className="w-full bg-black text-white py-3 overflow-hidden border-b-2 border-black flex whitespace-nowrap z-20">
    <motion.div 
      className="flex font-mono font-bold uppercase tracking-widest text-sm"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="mx-4 flex items-center">
          <span className="text-primary mx-4">■</span> [ INITIATING ICE PROTOCOL ] 
          <span className="text-primary mx-4">■</span> [ SYNCING 4 SPECIALIST AGENTS ] 
          <span className="text-primary mx-4">■</span> [ MULTI-MODAL ANALYSIS ACTIVE ]
        </span>
      ))}
    </motion.div>
  </div>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const [terminalText, setTerminalText] = useState<string>('');
  const fullText = `> INITIATING AEGISMDT KERNEL...
> CONNECTING TO BAND SDK NETWORK...
> SYNCING SPECIALIST AGENTS:
  [OK] Privacy Agent
  [OK] Pathology Agent 
  [OK] Prognostication Agent
  [OK] Moderator Agent
> WAITING FOR PATIENT CASE INPUT...
_`;

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setTerminalText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(intervalId);
    }, 40);
    return () => clearInterval(intervalId);
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
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center relative overflow-hidden bg-background">
      <Marquee />
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      {/* Hero Section */}
      <motion.div 
        className="z-10 container max-w-5xl px-6 flex flex-col items-center justify-center mt-28 mb-32 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-primary text-white border-2 border-black px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold font-mono uppercase tracking-widest mb-10">
          <ShieldCheck className="w-4 h-4" />
          <span>Regulated Deep-Tech</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-tight relative">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 opacity-10 pointer-events-none mix-blend-multiply filter grayscale contrast-150 -z-10">
            {/* Public Domain DNA microscope image from Wikimedia Commons */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/HD.17.022_%2811949587665%29.jpg" alt="Abstract DNA Microscope" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="bg-white px-8 py-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block transform -rotate-1 animate-glitch cursor-default">
            AegisMDT
          </span>
          <br />
          <span className="text-foreground mt-8 inline-block">AI Medical Board.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-foreground font-medium max-w-3xl mb-12 leading-relaxed border-l-4 border-r-4 border-primary px-8 py-2">
          Secure, multi-agent orchestration for rare oncology. Powered by the Iterative Consensus Ensemble (ICE) protocol.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
          <Link href="/dashboard">
            <button className="group relative inline-flex h-14 items-center justify-center bg-primary px-8 font-bold font-mono uppercase tracking-widest text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              <span className="mr-3">Launch Platform</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          
          <a href="https://github.com/wmaulanaaishq/AegisMDT-AI-Agent" target="_blank" rel="noreferrer">
            <button className="inline-flex h-14 items-center justify-center bg-white px-8 font-bold font-mono uppercase tracking-widest text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              View Source
            </button>
          </a>
        </motion.div>

        {/* Live Terminal Demo */}
        <motion.div variants={itemVariants} className="mt-20 w-full max-w-2xl text-left bg-black text-green-400 font-mono text-sm p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto relative group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute -top-3 -right-3 bg-primary text-white border-2 border-black px-2 py-1 text-[10px] font-bold tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">LIVE STATUS</div>
          <div className="flex space-x-2 mb-4 border-b border-gray-800 pb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-black"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full border border-black"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed min-h-[140px] pt-2">{terminalText}</pre>
        </motion.div>

      </motion.div>

      <div id="platform" className="w-full max-w-6xl px-6 mb-32 z-10 pt-16">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left"
        >
          {/* Feature 1 */}
          <div className="glass-panel p-8">
            <div className="w-14 h-14 bg-primary text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
              <Scale className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-foreground">ICE Protocol</h3>
            <p className="text-foreground/80 font-medium leading-relaxed">
              Agents actively debate conflicting prognoses until a high-confidence consensus is reached, eliminating single-model hallucinations.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-8">
            <div className="w-14 h-14 bg-white text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
              <Microscope className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-foreground">Multi-Modal Vision</h3>
            <p className="text-foreground/80 font-medium leading-relaxed">
              Pathology agents process both unstructured medical texts and complex microscopic imagery to identify rare genomic mutations.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-8">
            <div className="w-14 h-14 bg-black text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
              <UserCog className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-foreground">Human-in-the-Loop</h3>
            <p className="text-foreground/80 font-medium leading-relaxed">
              Doctors retain ultimate control. Intervene mid-debate to steer the AI's clinical direction or request immediate literature revisions.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Meet The Agents Section */}
      <div id="agents" className="w-full bg-white border-y-4 border-black py-24 relative z-10 pt-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper-2.png')] opacity-10 pointer-events-none"></div>
        <div className="container max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-5xl md:text-7xl font-serif font-black mb-6">Meet The Ensemble</h2>
            <p className="text-xl font-medium text-foreground/80 max-w-2xl mx-auto">Four autonomous specialists powered by Featherless AI, synchronized seamlessly via Band SDK.</p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { role: "Privacy", icon: <Lock />, desc: "Strips PII & generates latent vector hashes.", color: "bg-blue-100" },
              { role: "Pathology", icon: <Microscope />, desc: "Analyzes morphology & WHO classification.", color: "bg-orange-100" },
              { role: "Prognosis", icon: <Activity />, desc: "Calculates IPSS-R & risk stratification.", color: "bg-green-100" },
              { role: "Moderator", icon: <Scale />, desc: "Enforces ICE debate protocol & consensus.", color: "bg-primary text-white" }
            ].map((agent, i) => (
              <motion.div key={i} variants={itemVariants} className={`border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${agent.color} hover:-translate-y-2 transition-transform duration-300`}>
                <div className="w-12 h-12 bg-white text-black border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {agent.icon}
                </div>
                <h4 className="text-xl font-bold font-serif mb-2">{agent.role} Agent</h4>
                <p className="font-mono text-xs leading-relaxed">{agent.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Hackathon Winning Features Section */}
      <div id="enterprise" className="w-full max-w-6xl px-6 z-10 relative pt-16 mt-16 text-left">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-4">Built for Production.</h2>
            <p className="text-lg font-medium text-foreground/80 max-w-2xl">Not just a prototype. We implemented rigorous data integrity and monetization channels.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div className="text-primary font-bold font-mono text-sm uppercase tracking-widest mb-4 flex items-center"><Cpu className="w-5 h-5 mr-2"/> Agentic RAG</div>
              <h4 className="text-xl font-bold font-serif mb-2">Semantic Scholar APIs</h4>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Agents don't hallucinate treatments. They fetch real-time clinical trials and oncology literature from PubMed/Semantic Scholar via ChromaDB vector retrieval to ground their debates.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div className="text-primary font-bold font-mono text-sm uppercase tracking-widest mb-4 flex items-center"><Fingerprint className="w-5 h-5 mr-2"/> Monetization</div>
              <h4 className="text-xl font-bold font-serif mb-2">DOKU Payment Gateway</h4>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Integrated with DOKU for seamless hospital subscriptions. Guest doctors hit a paywall, while VIP/Regulated accounts bypass it seamlessly. Real business viability.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div className="text-primary font-bold font-mono text-sm uppercase tracking-widest mb-4 flex items-center"><Printer className="w-5 h-5 mr-2"/> Enterprise Grade</div>
              <h4 className="text-xl font-bold font-serif mb-2">Print-Ready EMR</h4>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                The final consensus isn't just a UI component. It exports into a formal, print-ready Electronic Medical Record (PDF) with strict clinical formatting for hospital archives.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Tech Stack Banner */}
      <div id="protocol" className="mt-32 w-full max-w-5xl px-6 z-10 relative mb-32 pt-16">
        <div className="absolute left-1/2 top-10 -translate-x-1/2 bg-white border-2 border-black px-6 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20">
          <p className="text-xs font-bold font-mono text-black uppercase tracking-widest m-0">Powered By</p>
        </div>
        <div className="border-2 border-black bg-background p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-16">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center space-x-3"><Network className="w-8 h-8"/> <span className="text-2xl font-serif font-bold">Band SDK</span></div>
            <div className="flex items-center space-x-3"><Layers className="w-8 h-8"/> <span className="text-2xl font-serif font-bold">Featherless AI</span></div>
            <div className="flex items-center space-x-3"><Database className="w-8 h-8"/> <span className="text-2xl font-serif font-bold">ChromaDB</span></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-12 border-t-4 border-black z-10 relative mt-auto">
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
