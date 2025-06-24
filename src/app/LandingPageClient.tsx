'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAnimation, useInView, AnimatePresence } from 'framer-motion';

const SQLPlaygroundIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="sqlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4338CA" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="sqlBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.7" />
      </linearGradient>
    </defs>

    <rect x="8" y="8" width="48" height="48" rx="6" fill="url(#sqlBgGradient)" />

    <motion.rect
      x="8" y="8" width="48" height="48" rx="6"
      fill="none"
      stroke="url(#sqlGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />

    <motion.path
      d="M16 20h32M16 32h32M16 44h21"
      stroke="url(#sqlGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
    />

    <motion.path
      d="M44 40l8 8M44 48l8-8"
      stroke="url(#sqlGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 1.5, ease: "easeInOut" }}
    />
  </svg>
);


const ERDiagramIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      {/* Outer background */}
      <linearGradient id="erOuterBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D1FAE5" />
        <stop offset="100%" stopColor="#A7F3D0" />
      </linearGradient>

      {/* Inner box background */}
      <linearGradient id="erInnerBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.9" />
      </linearGradient>

      {/* Stroke Gradient */}
      <linearGradient id="erGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>

    {/* Outer darker background */}
    <rect x="0" y="0" width="64" height="64" rx="6" fill="url(#erOuterBg)" />

    {/* Inner lighter area animated */}
    <motion.rect
      x="6" y="6" width="52" height="52" rx="4"
      fill="url(#erInnerBg)"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />

    {/* Boxes */}
    <motion.rect
      x="8" y="8" width="20" height="16" rx="2"
      fill="none" stroke="url(#erGradient)" strokeWidth="2.5" strokeLinecap="round"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "backOut" }}
    />
    <motion.rect
      x="36" y="8" width="20" height="16" rx="2"
      fill="none" stroke="url(#erGradient)" strokeWidth="2.5" strokeLinecap="round"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
    />
    <motion.rect
      x="8" y="40" width="20" height="16" rx="2"
      fill="none" stroke="url(#erGradient)" strokeWidth="2.5" strokeLinecap="round"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "backOut" }}
    />
    <motion.rect
      x="36" y="40" width="20" height="16" rx="2"
      fill="none" stroke="url(#erGradient)" strokeWidth="2.5" strokeLinecap="round"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6, ease: "backOut" }}
    />

    {/* Connecting lines */}
    <motion.path
      d="M28 16h8M18 24v16M46 24v16M28 48h8"
      stroke="url(#erGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
    />
  </svg>
);


const TheoryEngineIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="theoryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="theoryBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.7" />
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="64" height="64" rx="6" fill="url(#theoryBgGradient)" />

    {/* Rotating motion around center */}
    <motion.g
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, 360, 0] }}
      transition={{
        duration: 6,
        ease: "easeInOut",
        times: [0, 0.7, 1]
      }}
      style={{ transformOrigin: "center" }}
    >
      <motion.circle
        cx="32" cy="32" r="24"
        fill="none" stroke="url(#theoryGradient)" strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />
    </motion.g>

    {/* Cross axis lines */}
    <motion.path
      d="M32 8v16M32 40v16M8 32h16M40 32h16"
      stroke="url(#theoryGradient)" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
    />

    {/* Diagonal lines */}
    <motion.path
      d="M16 16l11 11M37 37l11 11M16 48l11-11M37 27l11-11"
      stroke="url(#theoryGradient)" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 2.5, ease: "easeInOut" }}
    />
  </svg>
);


const TransactionIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="transactionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="transactionBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="64" height="64" rx="6" fill="url(#transactionBgGradient)" />
    <motion.rect
      x="1" y="1" width="62" height="62" rx="4"
      fill="none" stroke="url(#transactionGradient)" strokeWidth="3.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.path
      d="M16 22h32M16 32h32M16 42h20"
      stroke="url(#transactionGradient)" strokeWidth="3.2" strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
    />
    <motion.path
      d="M44 38l4 4-4 4M48 42H16"
      stroke="url(#transactionGradient)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 3, ease: "easeInOut" }}
    />
  </svg>
);


const ChatbotIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="chatbotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BE185D" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="chatbotBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDF2F8" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#FBCFE8" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="64" height="64" rx="6" fill="url(#chatbotBgGradient)" />
    <motion.path
      d="M6 20c0-6.627 5.373-12 16-12h24c6.627 0 12 5.373 12 12v16c0 6.627-5.373 12-12 12h-4l-10 8-10-8h-4c-6.627 0-12-5.373-12-12V20z"
      fill="none" stroke="url(#chatbotGradient)" strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.circle
      cx="22" cy="28" r="3"
      fill="url(#chatbotGradient)"
      initial={{ scale: 0, y: 0 }}
      animate={{ 
        scale: 1,
        y: [0, -8, 0, -4, 0] 
      }}
      transition={{ 
        scale: { duration: 0.4, delay: 1.5 },
        y: { duration: 2.5, delay: 1.5, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeOut" }
      }}
    />
    <motion.circle
      cx="32" cy="28" r="3"
      fill="url(#chatbotGradient)"
      initial={{ scale: 0, y: 0 }}
      animate={{ 
        scale: 1,
        y: [0, -8, 0, -4, 0] 
      }}
      transition={{ 
        scale: { duration: 0.4, delay: 1.7 },
        y: { duration: 2.5, delay: 1.7, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeOut" }
      }}
    />
    <motion.circle
      cx="42" cy="28" r="3"
      fill="url(#chatbotGradient)"
      initial={{ scale: 0, y: 0 }}
      animate={{ 
        scale: 1,
        y: [0, -8, 0, -4, 0] 
      }}
      transition={{ 
        scale: { duration: 0.4, delay: 1.9 },
        y: { duration: 2.5, delay: 1.9, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeOut" }
      }}
    />
  </svg>
);
  
const LogoAnimation = () => (
  <svg className="w-28 h-28 mx-auto" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4338CA" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <motion.circle
      cx="60" cy="60" r="50"
      stroke="url(#logoGradient)" strokeWidth="3"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    <motion.path
      d="M40 40 L80 40 L80 80 L40 80 Z"
      stroke="url(#logoGradient)" strokeWidth="3"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
    />
    <motion.path
      d="M30 30 L90 30 M30 50 L90 50 M30 70 L90 70 M30 90 L90 90"
      stroke="url(#logoGradient)" strokeWidth="3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 1 }}
    />
    <motion.path
      d="M60 25 L60 95"
      stroke="url(#logoGradient)" strokeWidth="3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 1.5 }}
    />
  </svg>
);

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.8,
            delay: delay,
            ease: "easeOut" 
          } 
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const PrimaryButton = ({ 
  children, 
  href, 
  className = "" 
}: { 
  children: React.ReactNode, 
  href: string, 
  className?: string 
}) => {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full overflow-hidden shadow-lg transition-all duration-300 ${className}`}
      style={{ 
        minWidth: "160px", 
        fontFamily: "'Inter', sans-serif", 
        fontWeight: 600,
        textDecoration: "none" 
      }}
    >
      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
      <span className="relative flex items-center justify-center">
        {children}
      </span>
    </Link>
  );
};

const SecondaryButton = ({ 
  children, 
  href, 
  className = "",
  scrollToId,
  offset = -80
}: { 
  children: React.ReactNode, 
  href: string, 
  className?: string,
  scrollToId?: string,
  offset?: number
}) => {
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (scrollToId) {
      e.preventDefault();
      const element = document.getElementById(scrollToId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && scrollToId && window.location.hash === `#${scrollToId}`) {
      setTimeout(() => {
        const element = document.getElementById(scrollToId);
        if (element) {
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset + offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [scrollToId, offset]);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group relative inline-flex items-center justify-center px-8 py-3 font-medium text-indigo-600 bg-white border-2 border-indigo-600 hover:bg-indigo-50 rounded-full overflow-hidden shadow-lg transition-all duration-300 ${className}`}
      style={{ 
        minWidth: "160px", 
        fontFamily: "'Inter', sans-serif", 
        fontWeight: 600,
        textDecoration: "none" 
      }}
    >
      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-indigo-100 rounded-full group-hover:w-56 group-hover:h-56 opacity-50"></span>
      <span className="relative flex items-center justify-center">
        {children}
      </span>
    </Link>
  );
};

const ModuleCard = ({ 
  title, 
  description, 
  icon, 
  href, 
  gradient, 
  glowColor,
  index 
}: { 
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  href: string, 
  gradient: string,
  glowColor: string,
  index: number
}) => {
  return (
    <AnimatedSection delay={index * 0.1}>
      <motion.div 
        whileHover={{ 
          y: -8,
          boxShadow: `0 10px 25px -5px ${glowColor}30, 0 8px 10px -6px ${glowColor}20`
        }}
        className="group h-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg transition-all duration-300"
      >
        <div className="h-52 overflow-hidden relative">
          <div className={`absolute inset-0 ${gradient} opacity-90`}></div>
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="w-24 h-24 text-white">
              {icon}
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
          <p className="text-gray-600 mb-6 h-24 overflow-hidden">
            {description}
          </p>
          <Link 
            href={href}
            className="group inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 transition-colors duration-300"
            style={{ textDecoration: "none" }}
          >
            Know More
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </AnimatedSection>
  );
};

const FloatingElement = ({ 
  children, 
  delay = 0, 
  duration = 4, 
  y = 15 
}: { 
  children: React.ReactNode, 
  delay?: number, 
  duration?: number, 
  y?: number 
}) => {
  return (
    <motion.div
      animate={{ 
        y: [0, y, 0],
      }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "reverse", 
        duration: duration,
        delay: delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Fixed ParticleAnimation component to avoid hydration mismatch
const ParticleAnimation = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Generate particle configs with a seeded random function
  const particles = useMemo(() => {
    // Use a seeded random number generator for consistent values
    const seedRandom = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    
    const random = seedRandom(123); // Consistent seed
    
    // Small particles
    const smallParticles = Array(40).fill(0).map(() => ({
      width: random() * 8 + 2,
      height: random() * 8 + 2,
      top: random() * 100,
      left: random() * 100,
      opacity: random() * 0.5 + 0.1,
      yMovement: -(random() * 150 + 50),
      xMovement: (random() * 70 - 35),
      scale: random() * 0.8 + 0.5,
      opacityEnd: random() * 0.8 + 0.2,
      rotate: random() * 360,
      duration: random() * 15 + 10
    }));
    
    // Large orbs
    const largeOrbs = Array(5).fill(0).map(() => ({
      width: random() * 200 + 100,
      height: random() * 200 + 100,
      top: random() * 100,
      left: random() * 100,
      yMovement: random() * 100 - 50,
      xMovement: random() * 100 - 50,
      scale: random() * 0.5 + 1.2,
      duration: random() * 20 + 15
    }));
    
    return { smallParticles, largeOrbs };
  }, []);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {particles.smallParticles.map((config, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          style={{
            width: config.width + "px",
            height: config.height + "px",
            top: config.top + "%",
            left: config.left + "%",
            opacity: config.opacity,
            filter: "blur(1px)"
          }}
          animate={{
            y: [0, config.yMovement],
            x: [0, config.xMovement],
            scale: [1, config.scale, 1],
            opacity: [config.opacity, config.opacityEnd, 0],
            rotate: [0, config.rotate]
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {particles.largeOrbs.map((config, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-gradient-to-r from-indigo-400/20 to-purple-500/20"
          style={{
            width: config.width + "px",
            height: config.height + "px",
            top: config.top + "%",
            left: config.left + "%",
            filter: "blur(40px)"
          }}
          animate={{
            y: [0, config.yMovement],
            x: [0, config.xMovement],
            scale: [1, config.scale, 1],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};


export default function LandingPageClient() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const modules = [
    {
      id: 'sql-playground',
      title: 'SQL Playground',
      description: 'Interactive interface for writing, testing, and debugging SQL queries with NL2SQL conversion, debugging, visualization, and performance analysis.',
      icon: <SQLPlaygroundIcon />,
      href: '/editor', // Updated href
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      glowColor: '#6366F1'
    },
    {
      id: 'er-dfd-editor',
      title: 'ER and DFD Editor',
      description: 'Visually create and edit ER diagrams and DFDs with drag-and-drop functionality, automatic schema generation, and bidirectional sync.',
      icon: <ERDiagramIcon />,
      href: 'https://6000-firebase-studio-1747741097708.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev/', // Updated href
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
      glowColor: '#10B981'
    },
    {
      id: 'theory-engine',
      title: 'Theory Engine: FD & RA Toolkit',
      description: 'Comprehensive toolkit for functional dependencies, relational algebra, decomposition checking, and natural language conversions.',
      icon: <TheoryEngineIcon />,
      href: 'https://relationator.vercel.app/', // Updated href
      gradient: 'bg-gradient-to-br from-blue-500 to-sky-600',
      glowColor: '#3B82F6'
    },
    {
      id: 'transaction-evaluator',
      title: 'Transaction Evaluator',
      description: 'Analyze and validate transaction schedules, generate conflict graphs, check recoverability, and detect deadlocks in database systems.',
      icon: <TransactionIcon />,
      href: 'https://6000-firebase-studio-1747597818093.cluster-6dx7corvpngoivimwvvljgokdw.cloudworkstations.dev/', // Updated href
      gradient: 'bg-gradient-to-br from-amber-500 to-yellow-600',
      glowColor: '#F59E0B'
    },
    {
      id: 'chatbot-assistant',
      title: 'Chatbot Assistant',
      description: 'Context-aware AI assistant that provides textbook-grade answers for SQL and database theory questions with citation support.',
      icon: <ChatbotIcon />,
      href: 'https://ankits1802-eduquery.vercel.app/', // Updated href
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
      glowColor: '#EC4899'
    }
  ];

  const features = [
    {
      title: "Natural Language to SQL",
      description: "Convert plain English to syntactically correct SQL queries using advanced AI models.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      color: "text-indigo-600"
    },
    {
      title: "Interactive Diagrams",
      description: "Create and edit ER diagrams and DFDs with an intuitive drag-and-drop interface.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "text-emerald-600"
    },
    {
      title: "Functional Dependency Checker",
      description: "Validate FD rules, compute closures, and identify candidate keys automatically.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "text-blue-600"
    },
    {
      title: "Transaction Schedule Validator",
      description: "Check serializability, generate conflict graphs, and detect deadlocks.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "text-amber-600"
    },
    {
      title: "AI-Powered Assistant",
      description: "Get textbook-grade answers to database theory questions with citation support.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: "text-pink-600"
    },
    {
      title: "Performance Analysis",
      description: "Identify slow-running queries and get optimization suggestions automatically.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden">
      {/* Custom Keyframe Animations are now in tailwind.config.ts */}
      
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-50 to-blue-50 pt-16 pb-32">
      <ParticleAnimation />
        
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="animate-float animate-pulse-glow absolute w-96 h-96 rounded-full bg-indigo-200/30" style={{ top: '10%', left: '5%', filter: 'blur(80px)' }}></div>
          <div className="animate-float animate-pulse-glow absolute w-80 h-80 rounded-full bg-purple-200/30" style={{ top: '60%', left: '70%', filter: 'blur(70px)', animationDelay: '2s' }}></div>
          <div className="animate-float animate-pulse-glow absolute w-64 h-64 rounded-full bg-blue-200/30" style={{ top: '30%', left: '80%', filter: 'blur(60px)', animationDelay: '4s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatePresence>
            {isLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto"
              >
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-6 inline-block"
                  >
                    <LogoAnimation />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-5xl md:text-7xl font-extrabold mb-6"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                      AutoSQL
                    </span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-xl md:text-2xl mb-10 text-gray-700 max-w-3xl mx-auto"
                  >
                    A comprehensive platform for SQL development, database design, and theoretical database concepts
                  </motion.p>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex flex-wrap justify-center gap-4"
                  >
                    <PrimaryButton href="/dashboard"> {/* Updated href */}
                      Get Started
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </PrimaryButton>
                    
                    <SecondaryButton 
                      href="#powerfulModules" // Link to section ID
                      scrollToId="powerfulModules" 
                      offset={-100}
                    >
                      Explore Modules
                    </SecondaryButton>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  <FloatingElement delay={0} y={15}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                      <div className="w-12 h-12 text-indigo-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Design Databases</h3>
                      <p className="text-gray-600">Create ER diagrams and visualize your database structure with ease.</p>
                    </div>
                  </FloatingElement>
                  
                  <FloatingElement delay={0.2} y={15}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                      <div className="w-12 h-12 text-blue-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Write SQL Queries</h3>
                      <p className="text-gray-600">Convert natural language to SQL and debug your queries automatically.</p>
                    </div>
                  </FloatingElement>
                  
                  <FloatingElement delay={0.4} y={15}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                      <div className="w-12 h-12 text-emerald-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Validate Theory</h3>
                      <p className="text-gray-600">Check functional dependencies and verify transaction schedules.</p>
                    </div>
                  </FloatingElement>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 id="powerfulModules" className="text-3xl md:text-4xl font-bold text-center mb-16">
              Our <span className="text-indigo-600">Powerful</span> Modules
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                title={module.title}
                description={module.description}
                icon={module.icon}
                href={module.href} // Use updated href
                gradient={module.gradient}
                glowColor={module.glowColor}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Key <span className="text-indigo-600">Features</span>
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`w-12 h-12 mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              How <span className="text-indigo-600">It Works</span>
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Select a Module</h3>
                <p className="text-gray-600">Choose from our five specialized modules based on your database needs.</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Input Your Data</h3>
                <p className="text-gray-600">Enter your SQL queries, ER diagrams, or theoretical problems to solve.</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={0.3}>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-indigo-600">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Get Results</h3>
                <p className="text-gray-600">Receive instant feedback, visualizations, and optimizations for your database work.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your database experience?</h2>
              <p className="text-xl text-indigo-100 mb-10">
                Explore all the powerful features of AutoSQL and take your database development to the next level.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link 
                  href="/editor" // Updated href
                  className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg transition-all duration-300"
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontWeight: 600,
                    textDecoration: "none" 
                  }}
                >
                  Start Building Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};
