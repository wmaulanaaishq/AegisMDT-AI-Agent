'use client';

import { useState, useEffect } from 'react';
import { Play, Square, FastForward, Rewind, Maximize, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const SCRIPT = [
  { time: '0:00', text: "Hi judges! We are presenting AegisMDT, a military-grade Virtual Tumor Board for Rare Oncology." },
  { time: '0:15', text: "The problem: Rare cancer cases are routinely misdiagnosed because multi-disciplinary teams (MDTs) are expensive and slow to assemble." },
  { time: '0:30', text: "Our solution: A multi-agent swarm using the Iterative Consensus Ensemble (ICE) protocol. Let's see it live." },
  { time: '0:45', text: "(ACTION: Click 'Fill Demo Patient' and submit)" },
  { time: '0:55', text: "As the case is submitted, our Privacy Agent first strips all PII to ensure strict HIPAA compliance." },
  { time: '1:10', text: "Then, the Magic happens. Four specialist agents running on Featherless AI connect via Band SDK WebSockets to debate the case in real-time." },
  { time: '1:30', text: "Notice the Agentic RAG in action. The Pathology and Prognostication agents aren't just guessing; they are pulling real-time literature from PubMed and Semantic Scholar via ChromaDB." },
  { time: '1:50', text: "But what if they disagree? The Moderator Agent enforces our ICE protocol, forcing them to argue until their confidence delta drops below 0.05." },
  { time: '2:15', text: "Once consensus is reached, it generates a Print-Ready Electronic Medical Record (EMR) PDF." },
  { time: '2:30', text: "(ACTION: Show the Print-Ready EMR)" },
  { time: '2:40', text: "Business Viability: We've integrated DOKU Payment Gateway to allow hospital subscriptions. VIP doctors bypass the paywall, guests subscribe." },
  { time: '2:55', text: "AegisMDT isn't just a prototype. It's an enterprise-ready, deeply regulated AI workflow designed to save lives today." },
  { time: '3:10', text: "Thank you!" },
];

export default function PitchGuide() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveLine(prev => (prev < SCRIPT.length - 1 ? prev + 1 : prev));
      }, 15000); // Advances every 15 seconds roughly
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b-4 border-white pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif font-black flex items-center">
              <Mic className="w-10 h-10 mr-4 text-primary" />
              Pitch Teleprompter
            </h1>
            <p className="font-mono text-gray-400 mt-2 uppercase tracking-widest">Confidential Presenter Mode</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveLine(prev => Math.max(0, prev - 1))} className="p-3 bg-gray-800 border-2 border-white hover:bg-gray-700">
              <Rewind className="w-6 h-6" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`p-3 border-2 border-white font-bold flex items-center ${isPlaying ? 'bg-red-500' : 'bg-green-500 text-black'}`}>
              {isPlaying ? <Square className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
              {isPlaying ? 'STOP' : 'START ROLLING'}
            </button>
            <button onClick={() => setActiveLine(prev => Math.min(SCRIPT.length - 1, prev + 1))} className="p-3 bg-gray-800 border-2 border-white hover:bg-gray-700">
              <FastForward className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="space-y-12 pb-64">
          {SCRIPT.map((line, idx) => {
            const isPast = idx < activeLine;
            const isCurrent = idx === activeLine;
            const isAction = line.text.startsWith('(ACTION:');

            return (
              <motion.div
                key={idx}
                animate={{
                  opacity: isCurrent ? 1 : isPast ? 0.3 : 0.5,
                  scale: isCurrent ? 1.05 : 1,
                  x: isCurrent ? 20 : 0
                }}
                className={`flex gap-8 items-start transition-all duration-500 ${isCurrent ? 'border-l-8 border-primary pl-6 py-4 bg-gray-900 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]' : 'pl-6'}`}
              >
                <div className="w-20 font-mono text-xl font-bold text-gray-500 shrink-0 pt-1">
                  [{line.time}]
                </div>
                <div className={`text-4xl font-serif font-bold leading-tight ${isAction ? 'text-yellow-400 italic' : isCurrent ? 'text-white' : 'text-gray-400'}`}>
                  {line.text}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
