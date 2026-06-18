"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Network, Microscope, UserCog, Scale, ArrowRight, ShieldCheck, Database, Layers } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
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
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center relative overflow-hidden pb-20">
      {/* Background ambient elements */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="absolute w-[800px] h-[800px] border border-primary/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[600px] h-[600px] border border-primary/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute w-[400px] h-[400px] border border-primary/30 rounded-full animate-[spin_20s_linear_infinite]" />
      </div>

      <motion.div 
        className="z-10 container max-w-6xl px-6 flex flex-col items-center text-center mt-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <ShieldCheck className="w-4 h-4" />
          <span>Track 3: Regulated & High-Stakes Workflows</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">
            AegisMDT
          </span>
          <br />
          <span className="text-foreground">AI Medical Board.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10 leading-relaxed">
          Secure, multi-agent orchestration for rare oncology. Powered by the Iterative Consensus Ensemble (ICE) protocol and Human-in-the-Loop steering.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-24">
          <Link href="/dashboard">
            <button className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              <span className="mr-2 text-lg">Launch Platform</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          
          <a href="https://github.com/wmaulanaaishq/AegisMDT-AI-Agent" target="_blank" rel="noreferrer">
            <button className="inline-flex h-14 items-center justify-center rounded-full border border-border bg-background/50 px-8 font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background backdrop-blur-sm">
              View Source Code
            </button>
          </a>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          {/* Feature 1 */}
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">ICE Protocol</h3>
            <p className="text-muted-foreground leading-relaxed">
              Agents actively debate conflicting prognoses until a high-confidence consensus is reached, eliminating single-model hallucinations.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mb-6">
              <Microscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Multi-Modal Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              Pathology agents process both unstructured medical texts and complex microscopic imagery to identify rare genomic mutations.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
              <UserCog className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Human-in-the-Loop</h3>
            <p className="text-muted-foreground leading-relaxed">
              Doctors retain ultimate control. Intervene mid-debate to steer the AI's clinical direction or request immediate literature revisions.
            </p>
          </div>
        </motion.div>

        {/* Tech Stack Banner */}
        <motion.div variants={itemVariants} className="mt-24 pt-12 border-t border-border/50 w-full">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8 text-center">Powered By</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center space-x-2"><Network className="w-6 h-6"/> <span className="text-xl font-bold">Band SDK</span></div>
            <div className="flex items-center space-x-2"><Layers className="w-6 h-6"/> <span className="text-xl font-bold">Featherless AI</span></div>
            <div className="flex items-center space-x-2"><Database className="w-6 h-6"/> <span className="text-xl font-bold">ChromaDB</span></div>
            <div className="flex items-center space-x-2 text-xl font-bold">FastAPI & Next.js</div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
