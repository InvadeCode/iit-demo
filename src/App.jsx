import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  Menu, X, ArrowRight, MapPin, Phone, Mail, ArrowUpRight, Instagram, Linkedin, Plus, Minus, Play
} from 'lucide-react';

// --- CONTEXT FOR CUSTOM CURSOR ---
const CursorContext = createContext();

// --- CUSTOM CSS (Injected) ---
const ultraModernStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@100;200;300;400;500;600;700;800;900&display=swap');

  :root {
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1);
  }
  
  html, body {
    cursor: none; /* Hide default cursor for desktop */
    scroll-behavior: smooth;
    font-family: 'Urbanist', sans-serif;
  }

  /* Clip Path Unveil Animation */
  .clip-hidden {
    clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
  }
  .clip-visible {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  .clip-transition {
    transition: clip-path 1.5s var(--ease-in-out-quint);
  }

  /* Hide scrollbar for clean look */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #fafafa; }
  ::-webkit-scrollbar-thumb { background: #e4e4e7; }
  ::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }

  @media (max-width: 768px) {
    html, body { cursor: auto; }
    #custom-cursor { display: none !important; }
  }

  /* Hollow Text Effect */
  .text-hollow {
    color: transparent;
    -webkit-text-stroke: 1px #09090b; /* zinc-950 */
  }
  .text-hollow-white {
    color: transparent;
    -webkit-text-stroke: 1px #ffffff;
  }
  @media (min-width: 768px) {
    .text-hollow { -webkit-text-stroke: 2px #09090b; }
    .text-hollow-white { -webkit-text-stroke: 2px #ffffff; }
  }

  /* Seamless Marquee Animation */
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marquee 30s linear infinite;
  }
`;

// --- INTERACTIVE COMPONENTS ---

const CustomCursor = () => {
  const { isHovering } = useContext(CursorContext);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => setPosition({ x: e.clientX, y: e.clientY });
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      id="custom-cursor"
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[100] mix-blend-difference flex items-center justify-center transition-transform duration-300 ease-out"
      style={{ transform: `translate(${position.x - 16}px, ${position.y - 16}px)` }}
    >
      <div 
        className={`bg-white rounded-full transition-all duration-300 ${
          isHovering ? 'w-16 h-16 opacity-100' : (isClicking ? 'w-2 h-2 opacity-50' : 'w-4 h-4 opacity-100')
        }`}
      />
    </div>
  );
};

const Interactive = ({ children, className = '', onClick }) => {
  const { setIsHovering } = useContext(CursorContext);
  return (
    <div 
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const useOnScreen = (options) => {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.1, ...options });

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [options]);

  return [ref, isVisible];
};

const UnveilImage = ({ src, alt, className = '' }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.2 });
  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover clip-transition ${isVisible ? 'clip-visible scale-100' : 'clip-hidden scale-110'} transition-transform duration-[2s] ease-out`}
      />
    </div>
  );
};

const UnveilVideo = ({ src, className = '' }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.2 });
  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        src={src}
        className={`w-full h-full object-cover clip-transition ${isVisible ? 'clip-visible scale-100' : 'clip-hidden scale-110'} transition-transform duration-[2s] ease-out`}
      />
    </div>
  );
};

const HeroImageReveal = ({ src, alt, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`overflow-hidden relative ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover clip-transition ${isLoaded ? 'clip-visible scale-100' : 'clip-hidden scale-110'} transition-transform duration-[2s] ease-out`}
      />
    </div>
  );
};

const RevealText = ({ text, className = '', delay = 0 }) => {
  const [ref, isVisible] = useOnScreen();
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div 
        className={`transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[100%] opacity-0'}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {text}
      </div>
    </div>
  );
};

const Accordion = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-zinc-200">
      <Interactive>
        <button 
          onClick={onClick} 
          className="w-full py-8 flex justify-between items-center text-left focus:outline-none"
        >
          <span className="text-xl md:text-3xl font-light text-zinc-950">{question}</span>
          <span className="ml-4 flex-shrink-0 text-zinc-400">
            {isOpen ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </span>
        </button>
      </Interactive>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-lg md:text-xl font-light text-zinc-500 max-w-3xl leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

// --- LAYOUT WRAPPER ---
const Section = ({ children, className = '', innerClassName = '', noVerticalPadding = false }) => (
  <section className={`${noVerticalPadding ? '' : 'py-32 md:py-40'} px-[3%] ${className}`}>
    <div className={`max-w-[1600px] mx-auto w-full ${innerClassName}`}>
      {children}
    </div>
  </section>
);


// --- DUMMY CMS DATA ---
const projectsData = [
  { id: 1, title: 'Hobsonville Col.', location: 'Auckland', status: 'Completed', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  { id: 2, title: 'Epsom Arch.', location: 'Auckland', status: 'Completed', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' },
  { id: 3, title: 'Peninsula Terraces', location: 'Te Atatu', status: 'Selling Now', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80' }
];

const servicesData = [
  { 
    title: 'Development', 
    desc: 'From identifying great locations to thoughtfully planned residential communities. Full lifecycle management.', 
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    features: ['Site Acquisition', 'Feasibility Studies', 'Resource Consents', 'Community Planning']
  },
  { 
    title: 'Construction', 
    desc: 'Reliable, high-quality construction with absolute attention to detail, timelines, and cost control.', 
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    features: ['Fixed-Price Contracts', 'Rigorous Quality Assurance', 'Timely Execution', 'Health & Safety Compliance']
  },
  { 
    title: 'Custom Homes', 
    desc: 'Standalone homes tailored to modern lifestyles, combining smart architectural design with long-term value.', 
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    features: ['Bespoke Architectural Design', 'Premium Material Sourcing', 'Interior Design Consulting', 'Turnkey Solutions']
  },
  { 
    title: 'Project Management', 
    desc: 'From planning to subdivision, compliance, and completion, we handle every stage of the journey.', 
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    features: ['Timeline Management', 'Budget Control', 'Contractor Coordination', 'Final Certification']
  }
];

const valuesData = [
  { num: '01', title: 'Architectural Integrity', desc: 'We never compromise on design. Every home is built with a focus on spatial flow, natural light, and premium materials.' },
  { num: '02', title: 'Transparent Process', desc: 'From day one, our clients have full visibility into costs, timelines, and construction progress. No surprises.' },
  { num: '03', title: 'Enduring Quality', desc: 'We build homes that last generations. Our rigorous quality assurance guarantees excellence at every phase.' }
];

const processData = [
  { step: '01', title: 'Discovery', desc: 'We begin with a deep dive into your vision, site potential, and feasibility. We establish clear parameters for success.' },
  { step: '02', title: 'Architecture', desc: 'Our design team translates your brief into conceptual frameworks, managing all local council compliance and resource consents.' },
  { step: '03', title: 'Construction', desc: 'Execution with precision. Our experienced project managers and builders bring the architectural plans to life.' },
  { step: '04', title: 'Handover', desc: 'Rigorous quality assurance, final certifications, and the moment we hand over the keys to your completed property.' }
];

const faqData = [
  { q: "Do you handle both design and construction?", a: "Yes. Pillar Properties operates as an end-to-end partner. We manage the entire lifecycle from initial architectural concepts and council consents through to the final build and interior finishing." },
  { q: "What areas of Auckland do you service?", a: "We primarily operate across the greater Auckland region, with a strong focus on the central suburbs, North Shore, and emerging developments in the West and South." },
  { q: "Do you work with investors for multi-unit developments?", a: "Absolutely. A large portion of our portfolio consists of high-yield townhouse and terraced home developments tailored for property investors and syndicates." },
  { q: "How do you ensure projects stay on budget?", a: "We provide fixed-price contracts and highly detailed initial scoping. Our transparent procurement process and tight project management eliminate unexpected variations." }
];

const teamData = [
  { name: 'James Carter', role: 'Managing Director', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Elena Rostova', role: 'Head of Architecture', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Marcus Chen', role: 'Lead Developer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
];

const milestonesData = [
  { year: '2019', title: 'The Foundation', desc: 'Pillar Properties was established with a vision to redefine Auckland residential architecture.' },
  { year: '2021', title: 'First Major Project', desc: 'Completed the landmark Epsom Architectural series, setting a new benchmark for luxury.' },
  { year: '2023', title: 'Expansion & Growth', desc: 'Scaled operations to manage over 15 active sites simultaneously across the greater Auckland region.' },
  { year: '2026', title: 'Sustainable Future', desc: 'Committed to 100% passive heating integration and carbon-neutral construction practices.' }
];

const awardsData = [
  { year: '2024', title: 'NZIA Local Architecture Award', category: 'Housing - Multi Unit' },
  { year: '2025', title: 'Master Builders House of the Year', category: 'Gold Award' },
  { year: '2026', title: 'Sustainable Design Excellence', category: 'Innovation in Building' }
];

const insightsData = [
  { category: 'Architecture', date: 'March 2026', title: 'The Rise of Minimalist Concrete in Auckland Homes' },
  { category: 'Market Update', date: 'February 2026', title: 'Navigating Resource Consents for Multi-Unit Builds' },
  { category: 'Sustainability', date: 'January 2026', title: 'Integrating Passive Heating into Luxury Designs' }
];

const futureProjectsData = [
  { title: 'The Parnell Ascend', location: 'Parnell, Auckland', expected: 'Q3 2026' },
  { title: 'Orakei Basin Villas', location: 'Orakei, Auckland', expected: 'Q4 2026' },
  { title: 'Grey Lynn Urban', location: 'Grey Lynn, Auckland', expected: 'Q1 2027' }
];

const signatureDetails = [
  { title: "Bespoke Joinery", desc: "Custom cabinetry and shelving designed to blend seamlessly into the architectural form, eliminating visual clutter.", image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
  { title: "Polished Concrete", desc: "Thermal mass heating meets industrial elegance with our signature poured and ground floors.", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
  { title: "Spatial Harmony", desc: "Double-height voids and floor-to-ceiling glazing engineered to capture and maximize natural Auckland light.", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }
];

const galleryData = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1613490908677-62a26500ac13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1541888086925-0c13bb4229f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1576013551627-c0208f3216fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
];

// Marquee Text Loop
const marqueeItems = [
  "Residential Developers", "Architectural Builders", "Project Managers", "Investment Partners",
  "Residential Developers", "Architectural Builders", "Project Managers", "Investment Partners"
];

// --- AI HELPER FUNCTION ---
const generateAIBrief = async (userPrompt) => {
  const apiKey = "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const systemInstruction = `You are an expert architectural consultant for Pillar Properties, a premium residential developer in Auckland, New Zealand. 
The user will describe their dream home or investment project. 
Respond with a highly professional, minimalist, and structured architectural brief containing exactly these three sections:
CONCEPT SUMMARY: A 2-sentence sophisticated summary of the vision.
DESIGN DIRECTION: Recommended materials, architectural style, and spatial flow.
PROJECTED TIMELINE: A realistic high-level timeline for Auckland (e.g., Feasibility, Consent, Build).
Keep the tone ultra-premium, confident, and concise. Use simple plain text with capital letters for section headers. Do not use asterisks or markdown styling.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  let lastError = null;

  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No brief generated. Please try again.";
    } catch (error) {
      lastError = error;
      if (i < delays.length) {
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  }
  return "We are currently experiencing high demand. Please contact us directly to discuss your vision.";
};

// --- PAGES ---

const HomePage = ({ navigate }) => {
  const [hoveredProject, setHoveredProject] = useState(projectsData[0].image);
  const [activeDetail, setActiveDetail] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="animate-in fade-in duration-1000 bg-[#fafafa]">
      
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex flex-col w-full overflow-hidden justify-end pb-12 md:pb-16 px-[3%]">
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 z-0 bg-zinc-950">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 scale-105"
            src="https://video.wixstatic.com/video/548938_44a59f7f875641ef8e61ad3cc16fcdd0/1080p/mp4/file.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/40"></div>
        </div>

        {/* New Hero Content */}
        <div className="w-full max-w-[1600px] mx-auto z-10 flex flex-col">
          <RevealText text="AUCKLAND'S PREMIER RESIDENTIAL DEVELOPER" className="text-xs md:text-sm tracking-[0.3em] uppercase text-zinc-300 font-semibold mb-6" />
          <div className="text-5xl md:text-7xl lg:text-[7vw] font-light tracking-tight text-white mb-8 md:mb-16 max-w-5xl leading-[1.1]">
            <RevealText text="Crafting Auckland's" />
            <RevealText text="finest homes." delay={100} />
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-8 border-t border-white/20 pt-8">
             <RevealText text="Over 600 premium homes delivered with uncompromising architectural integrity. Built on trust, driven by design." className="text-lg md:text-xl font-light text-zinc-300 max-w-xl" delay={200} />
             <Interactive onClick={() => navigate('projects')} className="group flex items-center gap-4 cursor-pointer text-white">
                <div className="w-14 h-14 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-zinc-950 transition-colors duration-500">
                  <ArrowRight className="w-6 h-6 transition-colors duration-500" />
                </div>
                <span className="uppercase tracking-[0.2em] text-sm font-semibold">Explore Portfolio</span>
              </Interactive>
          </div>
        </div>
      </section>

      {/* Statement Section */}
      <Section className="bg-white">
        <div className="max-w-5xl">
          <div className="text-3xl md:text-5xl lg:text-7xl font-light leading-tight tracking-tight text-zinc-950">
            <RevealText text="We don't just build houses." />
            <RevealText text="We design, develop, and manage" delay={100} className="text-zinc-400" />
            <RevealText text="high-quality homes tailored" delay={200} />
            <RevealText text="to modern lifestyles." delay={300} />
          </div>
        </div>
        
        {/* Trust/Conversion Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 md:mt-32 border-t border-zinc-200 pt-12">
          {[
            { num: '600+', label: 'Homes Delivered' },
            { num: '07', label: 'Years Experience' },
            { num: '100%', label: 'Auckland Owned' },
            { num: '15+', label: 'Active Sites' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <RevealText text={stat.num} delay={i * 100} className="text-4xl md:text-5xl font-light text-zinc-950 mb-2" />
              <RevealText text={stat.label} delay={i * 100 + 50} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-zinc-400 font-semibold" />
            </div>
          ))}
        </div>
      </Section>

      {/* Infinite Marquee Section - Perfectly Seamless Loop */}
      <section className="py-8 bg-zinc-950 text-white overflow-hidden flex border-y border-zinc-800 w-full relative">
        <div className="animate-marquee text-[10px] md:text-sm tracking-[0.3em] uppercase font-semibold text-zinc-400 items-center">
          {/* First Block */}
          <div className="flex shrink-0 items-center">
            {marqueeItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="mx-8 whitespace-nowrap">{item}</span>
                <span className="mx-8 opacity-30 shrink-0">•</span>
              </React.Fragment>
            ))}
          </div>
          {/* Exact Duplicate Block for Seamless Looping */}
          <div className="flex shrink-0 items-center">
            {marqueeItems.map((item, idx) => (
              <React.Fragment key={`dup-${idx}`}>
                <span className="mx-8 whitespace-nowrap">{item}</span>
                <span className="mx-8 opacity-30 shrink-0">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section (Conversion Factor: Transparency) */}
      <Section className="bg-[#fafafa]">
        <RevealText text="METHODOLOGY" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-20" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {processData.map((process, idx) => (
            <div key={idx} className="border-t border-zinc-200 pt-8 group">
              <RevealText text={process.step} delay={idx * 100} className="text-5xl font-thin text-zinc-300 mb-8 group-hover:text-zinc-950 transition-colors duration-500" />
              <RevealText text={process.title} delay={idx * 100 + 50} className="text-2xl font-light text-zinc-950 mb-4" />
              <RevealText text={process.desc} delay={idx * 100 + 100} className="text-zinc-500 font-light leading-relaxed text-sm md:text-base" />
            </div>
          ))}
        </div>
      </Section>

      {/* Signature Details (Interactive Hover Gallery) */}
      <Section className="bg-white border-t border-zinc-200" innerClassName="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <RevealText text="SIGNATURE FINISHES" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-12" />
          <div className="flex flex-col gap-8">
            {signatureDetails.map((detail, idx) => (
              <div 
                key={idx} 
                onMouseEnter={() => setActiveDetail(idx)}
                className="cursor-pointer group border-b border-zinc-100 pb-8 last:border-0"
              >
                <h3 className={`text-4xl md:text-5xl lg:text-6xl font-light tracking-tight transition-colors duration-500 ${activeDetail === idx ? 'text-zinc-950' : 'text-zinc-300 group-hover:text-zinc-400'}`}>
                  {detail.title}
                </h3>
                <div className={`overflow-hidden transition-all duration-500 ease-out ${activeDetail === idx ? 'max-h-40 mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-zinc-500 font-light max-w-sm leading-relaxed">{detail.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 h-[500px] md:h-[700px] overflow-hidden relative bg-zinc-100 rounded-3xl shadow-sm">
          {signatureDetails.map((detail, idx) => (
            <img 
              key={idx}
              src={detail.image} 
              alt={detail.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeDetail === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
            />
          ))}
        </div>
      </Section>

      {/* Interactive Project Roster */}
      <Section className="bg-zinc-950 text-white relative" innerClassName="relative z-10">
        <div className="mb-20 flex justify-between items-end">
          <RevealText text="SELECTED WORKS" className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-semibold" />
          <Interactive onClick={() => navigate('projects')} className="hidden md:flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white transition-colors">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold">View Full Portfolio</span>
          </Interactive>
        </div>

        <div className="border-t border-zinc-800">
          {projectsData.map((project, idx) => (
            <Interactive key={project.id} onClick={() => navigate('projects')}>
              <div 
                className="group flex flex-col md:flex-row justify-between items-start md:items-center py-10 md:py-16 border-b border-zinc-800 cursor-pointer relative"
                onMouseEnter={() => setHoveredProject(project.image)}
              >
                {/* Hover Image Reveal for Mobile (Smoothly Animated) */}
                <div className="md:hidden w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-0 opacity-0 group-hover:max-h-[500px] group-hover:opacity-100 group-hover:mb-6 rounded-2xl">
                  <img src={project.image} alt={project.title} className="w-full h-64 object-cover" />
                </div>

                <RevealText text={`0${idx + 1}`} className="text-sm tracking-[0.2em] text-zinc-600 mb-4 md:mb-0 md:w-24" />
                
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
                  <h3 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight transform group-hover:translate-x-4 transition-all duration-500 ease-out text-zinc-300 group-hover:text-white inline-block">{project.title}</h3>
                  <div className="flex items-center gap-8 mt-4 md:mt-0 text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
                    <span className="text-[10px] md:text-xs tracking-widest uppercase font-semibold">{project.location}</span>
                    <ArrowUpRight className="w-6 h-6 opacity-0 -translate-y-4 translate-x-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 ease-out hidden md:block" />
                  </div>
                </div>
              </div>
            </Interactive>
          ))}
        </div>
        
        {/* Floating Desktop Image Follower (Bulletproof Crossfade) */}
        <div className="hidden md:block absolute top-1/2 right-0 -translate-y-1/2 w-[35vw] max-w-[500px] h-[60vh] max-h-[700px] pointer-events-none overflow-hidden rounded-3xl z-0 shadow-2xl">
          {projectsData.map((proj) => (
            <img 
              key={proj.id}
              src={proj.image} 
              alt={proj.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${hoveredProject === proj.image ? 'opacity-80' : 'opacity-0'}`}
            />
          ))}
        </div>
      </Section>

      {/* Services Minimal */}
      <Section className="bg-white">
        <RevealText text="EXPERTISE" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-20" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
          {servicesData.map((service, idx) => (
            <Interactive key={idx} onClick={() => navigate('services')} className="group cursor-pointer flex flex-col h-full">
              <div className="w-full aspect-[4/5] md:h-[450px] overflow-hidden mb-8 bg-zinc-100 rounded-3xl shadow-sm">
                <img src={service.image} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-out" alt={service.title} />
              </div>
              <RevealText text={service.title} className="text-2xl font-light mb-4 text-zinc-950 border-b border-zinc-200 pb-4 flex justify-between items-center group-hover:border-zinc-950 transition-colors duration-500">
                  {service.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
              </RevealText>
              <RevealText text={service.desc} delay={100} className="text-zinc-500 font-light leading-relaxed text-sm md:text-base" />
            </Interactive>
          ))}
        </div>
      </Section>

      {/* Testimonial Section (Social Proof) */}
      <Section className="bg-zinc-50 border-t border-zinc-200" innerClassName="flex flex-col items-center text-center">
        <div className="max-w-5xl">
          <RevealText text="CLIENT PERSPECTIVE" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
          <RevealText text="“Pillar Properties delivered our architectural build flawlessly. Their transparency regarding costs and absolute refusal to compromise on finish quality set them apart in the Auckland market.”" className="text-2xl md:text-4xl lg:text-5xl font-light text-zinc-950 leading-snug tracking-tight mb-12" delay={100} />
          <div className="flex flex-col items-center">
             <RevealText text="Sarah & James T." className="text-sm tracking-widest uppercase font-semibold text-zinc-950 mb-1" delay={200} />
             <RevealText text="Epsom Custom Build" className="text-xs tracking-widest uppercase text-zinc-400" delay={300} />
          </div>
        </div>
      </Section>

      {/* Cinematic Video Teaser */}
      <section className="py-12 md:py-24 px-[3%] bg-[#fafafa]">
        <div className="max-w-[1600px] mx-auto relative h-[60vh] md:h-[80vh] overflow-hidden group rounded-[2rem] md:rounded-[3rem] bg-zinc-950 w-full shadow-lg">
          <UnveilVideo 
            src="https://cdn.coverr.co/videos/coverr-walking-through-a-modern-house-2525/1080p.mp4" 
            className="absolute inset-0 w-full h-full opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[3s] ease-out pointer-events-none"
          />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Interactive>
              <button className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/30 backdrop-blur-md flex flex-col items-center justify-center group-hover:bg-white text-white group-hover:text-zinc-950 transition-all duration-500 hover:scale-110">
                <Play className="w-6 h-6 md:w-8 md:h-8 mb-1 ml-1" fill="currentColor" />
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold mt-1">Play Reel</span>
              </button>
            </Interactive>
          </div>
          <div className="absolute bottom-10 left-6 md:left-12 z-10 pointer-events-none">
            <RevealText text="THE PILLAR DIFFERENCE" className="text-xs tracking-[0.3em] uppercase text-white/70 font-semibold mb-3" />
            <RevealText text="Watch our brand film." className="text-2xl md:text-3xl font-light text-white" delay={100} />
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <Section className="bg-white">
        <div className="w-[90%] mx-auto">
          <RevealText text="FREQUENTLY ASKED" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
          <div className="border-t border-zinc-200">
            {faqData.map((faq, idx) => (
              <Accordion 
                key={idx} 
                question={faq.q} 
                answer={faq.a} 
                isOpen={openFaqIndex === idx}
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Insights / Journal Section */}
      <Section className="bg-zinc-50 border-t border-zinc-200">
        <div className="flex justify-between items-end mb-20">
          <RevealText text="JOURNAL & INSIGHTS" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold" />
          <Interactive className="hidden md:flex items-center gap-2 cursor-pointer text-zinc-950 hover:opacity-50 transition-opacity">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold">Read All</span>
          </Interactive>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {insightsData.map((insight, idx) => (
            <Interactive key={idx} className="group cursor-pointer border-t border-zinc-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <RevealText text={insight.category} delay={idx * 100} className="text-[10px] tracking-widest uppercase font-semibold text-zinc-400" />
                <RevealText text={insight.date} delay={idx * 100 + 50} className="text-[10px] tracking-widest uppercase font-semibold text-zinc-400" />
              </div>
              <RevealText text={insight.title} delay={idx * 100 + 100} className="text-2xl font-light text-zinc-950 group-hover:text-zinc-500 transition-colors duration-500 pr-8" />
            </Interactive>
          ))}
        </div>
      </Section>

      {/* NEW: Partner / Press Section */}
      <Section className="bg-white border-t border-zinc-200 text-center" noVerticalPadding>
         <div className="py-24 md:py-32">
            <RevealText text="AS FEATURED IN" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-12" />
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
                <span className="text-2xl md:text-3xl font-bold tracking-tighter">ArchDigest</span>
                <span className="text-2xl md:text-3xl font-serif italic">Home & Garden</span>
                <span className="text-2xl md:text-3xl font-light uppercase tracking-widest">Dwell</span>
                <span className="text-2xl md:text-3xl font-black tracking-tight">VOGUE<span className="font-light">LIVING</span></span>
            </div>
         </div>
      </Section>

      {/* Massive CTA Section */}
      <Section className="bg-[#fafafa] border-t border-zinc-200" innerClassName="flex flex-col items-center text-center">
        <RevealText text="START YOUR PROJECT" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
        <Interactive onClick={() => navigate('contact')}>
          <h2 className="text-6xl md:text-8xl lg:text-[10vw] font-light tracking-tighter cursor-pointer hover:opacity-50 transition-opacity duration-500 text-zinc-950 mb-12 leading-none">
            Let's Talk.
          </h2>
        </Interactive>
        <p className="text-zinc-500 text-lg md:text-xl font-light max-w-md">Schedule a complimentary consultation to discuss your land, vision, or investment strategy.</p>
      </Section>
    </div>
  );
};

const AboutPage = () => (
  <div className="animate-in fade-in duration-1000 bg-white min-h-screen pt-32 md:pt-48 pb-32">
    <Section noVerticalPadding>
      <RevealText text="OUR STORY" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
      <RevealText text="Building foundations" className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950" />
      <RevealText text="for the future." className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950 mb-24" delay={100} />

      <div className="grid lg:grid-cols-2 gap-16 items-start mb-32">
        <div>
          <RevealText text="Pillar Properties Ltd is a premier residential development and construction company based in the heart of Auckland." className="text-2xl font-light text-zinc-950 leading-relaxed mb-8" />
          <RevealText text="While our brand name is new to the market, the foundation of our company is built on extensive industry experience. For over seven years, our dedicated team has been instrumental in delivering more than 600 homes across the region." className="text-lg text-zinc-500 font-light leading-relaxed mb-8" delay={100} />
          <RevealText text="We don't just build houses; we design, develop, build, and manage high-quality homes that cater to modern lifestyles. Our core philosophy ensures that every project we undertake is functional, aesthetically pleasing, and above all, affordable without compromising on the premium feel." className="text-lg text-zinc-500 font-light leading-relaxed" delay={200} />
        </div>
        <div className="w-full h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-sm">
          <UnveilImage src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Architectural Structure" className="w-full h-full object-cover" />
        </div>
      </div>

      <RevealText text="CORE PHILOSOPHY" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
      <div className="grid md:grid-cols-3 gap-12 border-t border-zinc-200 pt-16">
        {valuesData.map((val, idx) => (
          <div key={idx}>
            <RevealText text={val.num} className="text-4xl font-thin text-zinc-300 mb-6" />
            <RevealText text={val.title} className="text-2xl font-light text-zinc-950 mb-4" />
            <RevealText text={val.desc} className="text-zinc-500 font-light leading-relaxed" />
          </div>
        ))}
      </div>

      <div className="mt-40">
        <RevealText text="LEADERSHIP" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
        <div className="grid md:grid-cols-3 gap-12 border-t border-zinc-200 pt-16">
          {teamData.map((member, idx) => (
            <Interactive key={idx} className="group">
              <div className="w-full aspect-[3/4] overflow-hidden mb-6 bg-zinc-100 rounded-3xl shadow-sm">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" />
              </div>
              <RevealText text={member.name} className="text-2xl font-light text-zinc-950 mb-1" />
              <RevealText text={member.role} className="text-xs tracking-widest uppercase text-zinc-400 font-semibold" delay={100} />
            </Interactive>
          ))}
        </div>
      </div>

      <div className="mt-40">
        <RevealText text="MILESTONES" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
        <div className="border-t border-zinc-200 pt-16 space-y-16">
          {milestonesData.map((milestone, idx) => (
            <div key={idx} className="grid md:grid-cols-4 gap-8 md:gap-12 items-start group">
              <RevealText text={milestone.year} className="text-4xl md:text-5xl font-thin text-zinc-300 group-hover:text-zinc-950 transition-colors duration-500" />
              <div className="md:col-span-3 border-l border-zinc-200 pl-8 md:pl-12">
                <RevealText text={milestone.title} className="text-2xl font-light text-zinc-950 mb-4" />
                <RevealText text={milestone.desc} className="text-zinc-500 font-light leading-relaxed max-w-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-40">
        <RevealText text="RECOGNITION" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
        <div className="grid md:grid-cols-3 gap-8 border-t border-zinc-200 pt-16">
          {awardsData.map((award, idx) => (
            <div key={idx} className="bg-[#fafafa] p-8 md:p-12 rounded-3xl border border-zinc-100 hover:border-zinc-300 transition-colors duration-500">
              <RevealText text={award.year} className="text-xs tracking-[0.2em] uppercase text-zinc-400 font-semibold mb-6" />
              <RevealText text={award.title} className="text-xl md:text-2xl font-light text-zinc-950 mb-4" />
              <RevealText text={award.category} className="text-sm text-zinc-500 font-light" />
            </div>
          ))}
        </div>
      </div>
    </Section>

    <Section className="bg-zinc-950 text-white mt-32 md:mt-40 rounded-[2rem] md:rounded-[3rem] shadow-xl mx-4 md:mx-12 lg:mx-16" innerClassName="flex flex-col md:flex-row gap-16 items-center">
      <div className="w-full md:w-1/2">
        <RevealText text="SUSTAINABILITY" className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-semibold mb-8" />
        <RevealText text="Building for the next century." className="text-4xl md:text-6xl font-light tracking-tight mb-8 text-zinc-200" />
        <RevealText text="Our commitment extends beyond aesthetics. We integrate passive heating, solar readiness, and ethically sourced timber into our standard specifications, ensuring a minimal footprint and maximum efficiency." className="text-lg text-zinc-400 font-light leading-relaxed mb-8" delay={100} />
      </div>
      <div className="w-full md:w-1/2 h-[400px] rounded-3xl overflow-hidden">
          <UnveilImage src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Sustainable details" className="w-full h-full object-cover opacity-80" />
      </div>
    </Section>

    {/* NEW: Culture & Community */}
    <Section className="bg-white mt-32 md:mt-40">
      <RevealText text="CULTURE" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1 h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm">
           <UnveilImage src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Team Culture" className="w-full h-full object-cover" />
        </div>
        <div className="order-1 md:order-2">
          <RevealText text="Beyond the blueprint." className="text-4xl md:text-6xl font-light tracking-tight text-zinc-950 mb-8" />
          <RevealText text="We foster a collaborative environment where architects, project managers, and builders work side-by-side. Our commitment extends to the local Auckland community through active sponsorship of sustainable design initiatives and youth trade apprenticeships." className="text-lg text-zinc-500 font-light leading-relaxed" />
        </div>
      </div>
    </Section>

    <Section className="bg-[#fafafa] border-t border-zinc-200 mt-32 md:mt-40 text-center" innerClassName="flex flex-col items-center">
        <RevealText text="CAREERS" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
        <RevealText text="Build with us." className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950 mb-8" />
        <RevealText text="We are always looking for visionary architects, rigorous project managers, and master builders to join our growing team." className="text-xl text-zinc-500 font-light max-w-2xl leading-relaxed mb-12" delay={100} />
        <Interactive>
          <button className="bg-zinc-950 text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-2">
            View Open Positions <ArrowRight className="w-4 h-4" />
          </button>
        </Interactive>
    </Section>
  </div>
);

const ServicesPage = () => (
  <div className="animate-in fade-in duration-1000 bg-[#fafafa] min-h-screen pt-32 md:pt-48 pb-32">
    <Section noVerticalPadding>
      <RevealText text="OUR EXPERTISE" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
      <RevealText text="End-to-end" className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950" />
      <RevealText text="development." className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950 mb-32" delay={100} />

      <div className="space-y-32">
        {servicesData.map((service, idx) => (
          <div key={idx} className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24`}>
            <div className="w-full lg:w-1/2 h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm">
              <UnveilImage src={service.image} alt={service.title} className="w-full h-full object-cover" />
            </div>
            <div className="w-full lg:w-1/2">
              <RevealText text={`0${idx + 1}`} className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-6" />
              <RevealText text={service.title} className="text-4xl md:text-5xl font-light text-zinc-950 mb-6" />
              <RevealText text={service.desc} className="text-xl text-zinc-500 font-light leading-relaxed mb-8" />
              <ul className="space-y-4 border-t border-zinc-200 pt-8">
                {service.features?.map((item, i) => (
                   <li key={i} className="flex items-center text-zinc-600 font-light">
                      <span className="w-1.5 h-1.5 bg-zinc-950 rounded-full mr-4"></span>
                      <RevealText text={item} delay={i * 50} />
                   </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-40 border-t border-zinc-200 pt-32">
        <RevealText text="THE PILLAR ADVANTAGE" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
        <div className="grid md:grid-cols-2 gap-24">
          <div>
             <RevealText text="Why partner with us." className="text-4xl md:text-6xl font-light tracking-tight text-zinc-950 mb-8" />
             <RevealText text="We eliminate the friction typically associated with property development. By consolidating design, consent, and construction under one roof, we drastically reduce timelines and mitigate financial risk." className="text-xl text-zinc-500 font-light leading-relaxed" delay={100} />
          </div>
          <div className="space-y-12">
            {[
              { label: 'Single Point of Contact', desc: 'No more juggling architects, engineers, and builders.' },
              { label: 'Fixed Price Certainty', desc: 'Comprehensive scoping means no unexpected variations.' },
              { label: 'Speed to Market', desc: 'Parallel processing of consents and procurement saves months.' }
            ].map((adv, idx) => (
              <div key={idx} className="border-b border-zinc-200 pb-8">
                <RevealText text={adv.label} className="text-2xl font-light text-zinc-950 mb-2" delay={idx * 100} />
                <RevealText text={adv.desc} className="text-zinc-500 font-light" delay={idx * 100 + 50} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW: Featured Case Study */}
      <div className="mt-40 border-t border-zinc-200 pt-32">
        <RevealText text="CASE STUDY" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
        <div className="bg-zinc-950 rounded-3xl overflow-hidden text-white flex flex-col md:flex-row shadow-xl">
          <div className="w-full md:w-1/2 p-12 md:p-16 lg:p-24 flex flex-col justify-center">
             <RevealText text="The Epsom Transformation" className="text-3xl md:text-5xl font-light tracking-tight mb-6" />
             <RevealText text="How we took a subdivided 400sqm site and delivered a multi-award winning luxury family home within a strict 9-month timeframe, completely managing the resource consent process." className="text-zinc-400 font-light leading-relaxed mb-8" delay={100} />
             <Interactive>
               <button className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold hover:text-zinc-300 transition-colors">
                 Read Full Study <ArrowRight className="w-4 h-4" />
               </button>
             </Interactive>
          </div>
          <div className="w-full md:w-1/2 h-[400px] md:h-auto relative group">
             <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Case Study" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
          </div>
        </div>
      </div>
    </Section>

    <Section className="bg-zinc-50 border-t border-zinc-200 mt-32 md:mt-40 text-center">
      <RevealText text="OUR PARTNERS" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16 text-center" />
      <div className="grid md:grid-cols-3 gap-12 text-center">
        {[
          { title: 'Private Homebuyers', desc: 'Families looking for bespoke, architectural standalone homes.' },
          { title: 'Property Investors', desc: 'Individuals seeking high-yield, low-maintenance townhouses.' },
          { title: 'Landowners', desc: 'Owners looking to unlock the equity in their land via subdivision.' }
        ].map((type, idx) => (
            <div key={idx}>
              <RevealText text={type.title} className="text-2xl font-light text-zinc-950 mb-4" />
              <RevealText text={type.desc} className="text-zinc-500 font-light leading-relaxed" />
            </div>
        ))}
      </div>
    </Section>
  </div>
);

const ProjectsPage = () => (
  <div className="animate-in fade-in duration-1000 bg-[#fafafa] min-h-screen pt-32 md:pt-48 pb-32">
    <Section noVerticalPadding>
      <RevealText text="PORTFOLIO" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
      <RevealText text="Selected Works." className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950 mb-24" />

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
        {projectsData.map((project, idx) => (
          <Interactive key={project.id} className="group cursor-pointer">
            <div className={`w-full ${idx % 2 === 1 ? 'md:mt-32' : ''}`}>
              <UnveilImage src={project.image} alt={project.title} className="w-full aspect-[4/5] md:aspect-[3/4] mb-8 rounded-3xl shadow-sm" />
              <div className="flex justify-between items-start border-t border-zinc-200 pt-6">
                <div>
                  <h3 className="text-2xl font-light text-zinc-950 mb-2">{project.title}</h3>
                  <p className="text-zinc-500 text-sm">{project.location}</p>
                </div>
                <span className="text-xs tracking-widest uppercase text-zinc-400 font-semibold">{project.status}</span>
              </div>
            </div>
          </Interactive>
        ))}
      </div>

      <div className="mt-40 pt-32 border-t border-zinc-200">
        <RevealText text="ON THE HORIZON" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
        <RevealText text="Future Developments." className="text-4xl md:text-6xl font-light tracking-tight text-zinc-950 mb-16" />
        
        <div className="flex flex-col">
          {futureProjectsData.map((proj, idx) => (
            <div key={idx} className="group flex flex-col md:flex-row justify-between items-start md:items-center py-8 border-b border-zinc-200 hover:bg-zinc-50 transition-colors px-4 -mx-4 cursor-default">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full">
                <RevealText text={proj.title} delay={idx * 50} className="text-2xl md:text-3xl font-light text-zinc-950" />
                <RevealText text={proj.location} delay={idx * 50 + 50} className="text-sm tracking-widest uppercase text-zinc-500 font-semibold" />
              </div>
              <div className="mt-4 md:mt-0 flex-shrink-0">
                <RevealText text={`Expected ${proj.expected}`} delay={idx * 50 + 100} className="text-xs tracking-[0.2em] uppercase text-zinc-400 font-semibold bg-white border border-zinc-200 px-4 py-2 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: Project Statistics / Impact */}
      <div className="mt-40 pt-32 border-t border-zinc-200">
         <RevealText text="OUR IMPACT" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
         <div className="grid md:grid-cols-4 gap-12 bg-zinc-950 rounded-3xl p-12 lg:p-16 text-white shadow-xl">
            {[
              { val: '$200M+', label: 'Gross Development Value' },
              { val: '600+', label: 'Dwellings Completed' },
              { val: '12', label: 'Suburbs Transformed' },
              { val: '100%', label: 'Delivery Rate' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <RevealText text={stat.val} delay={idx * 100} className="text-4xl md:text-5xl lg:text-6xl font-light text-zinc-200 mb-4" />
                <RevealText text={stat.label} delay={idx * 100 + 50} className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-zinc-500 font-semibold" />
              </div>
            ))}
         </div>
      </div>
    </Section>
  </div>
);

const GalleryPage = () => (
  <div className="animate-in fade-in duration-1000 bg-[#fafafa] min-h-screen pt-32 md:pt-48 pb-32">
    <Section noVerticalPadding>
      <RevealText text="GALLERY" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
      <RevealText text="Visual Archive." className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950 mb-24" />

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {galleryData.map((src, idx) => (
          <Interactive key={idx} className="break-inside-avoid relative group overflow-hidden block rounded-2xl md:rounded-3xl bg-zinc-200 shadow-sm">
            <UnveilImage src={src} alt={`Gallery Image ${idx + 1}`} className="w-full h-auto object-cover transition-transform duration-[2.5s] group-hover:scale-105 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/30 transition-colors duration-500 flex items-center justify-center">
              <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100" strokeWidth={1} />
            </div>
          </Interactive>
        ))}
      </div>

      {/* NEW: Motion / Cinematic */}
      <div className="mt-40 pt-32 border-t border-zinc-200">
        <RevealText text="IN MOTION" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16" />
        <div className="w-full aspect-video md:h-[700px] rounded-3xl overflow-hidden relative group bg-zinc-950 shadow-sm">
           <UnveilVideo 
             src="https://cdn.coverr.co/videos/coverr-walking-through-a-modern-house-2525/1080p.mp4" 
             className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-1000"
           />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-transform duration-500 group-hover:scale-110">
                 <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
           </div>
        </div>
      </div>
    </Section>
  </div>
);
  
const ContactPage = () => {
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [activeTab, setActiveTab] = useState('direct');

  const handleGenerate = async () => {
    if (!aiInput.trim()) return;
    setIsGenerating(true);
    setAiOutput('');
    const result = await generateAIBrief(aiInput);
    setAiOutput(result);
    setIsGenerating(false);
  };

  const attachToEnquiry = () => {
    setEnquiryMessage(`AI GENERATED BRIEF:\n${aiOutput}\n\nADDITIONAL NOTES:\n`);
    setActiveTab('direct');
  };

  return (
    <div className="animate-in fade-in duration-1000 bg-white min-h-screen pt-32 md:pt-48 pb-32">
      <Section noVerticalPadding>
        <div className="grid lg:grid-cols-2 gap-24">
          
          {/* Left Column: Info & Tab Toggles */}
          <div>
            <RevealText text="CONTACT" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
            <RevealText text="Start the" className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950" />
            <RevealText text="conversation." className="text-5xl md:text-7xl font-light tracking-tight text-zinc-950 mb-16" delay={100} />
            
            <div className="flex gap-8 border-b border-zinc-200 mb-12">
              <Interactive>
                <button 
                  onClick={() => setActiveTab('direct')}
                  className={`pb-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors relative ${activeTab === 'direct' ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  Direct Enquiry
                  {activeTab === 'direct' && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-950"></span>}
                </button>
              </Interactive>
              <Interactive>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`pb-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors relative flex items-center gap-2 ${activeTab === 'ai' ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  ✨ AI Architect
                  {activeTab === 'ai' && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-950"></span>}
                </button>
              </Interactive>
            </div>

            <div className="space-y-12">
              {[
                { label: 'Visit', val: '123 Architecture Way\nAuckland CBD 1010' },
                { label: 'Call', val: '+64 9 123 4567' },
                { label: 'Email', val: 'info@pillarproperties.co.nz' }
              ].map((item, idx) => (
                <div key={idx} className="border-t border-zinc-200 pt-6">
                  <RevealText text={item.label} className="text-xs tracking-[0.2em] uppercase text-zinc-400 font-semibold mb-4" />
                  <RevealText text={item.val} className="text-xl md:text-2xl font-light text-zinc-950 whitespace-pre-line" delay={100} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Dynamic Form / AI Interface */}
          <div className="lg:mt-32 bg-[#fafafa] p-8 md:p-16 border border-zinc-100 min-h-[600px] flex flex-col rounded-3xl shadow-sm">
            {activeTab === 'direct' ? (
              <form className="space-y-12 animate-in fade-in duration-500" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <input type="text" placeholder="Name" required className="w-full bg-transparent border-b border-zinc-300 py-4 text-xl font-light text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors" />
                </div>
                <div className="relative">
                  <input type="email" placeholder="Email Address" required className="w-full bg-transparent border-b border-zinc-300 py-4 text-xl font-light text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors" />
                </div>
                <div className="relative">
                  <select defaultValue="" className="w-full bg-transparent border-b border-zinc-300 py-4 text-xl font-light text-zinc-400 focus:outline-none focus:border-zinc-950 focus:text-zinc-950 transition-colors appearance-none cursor-pointer">
                    <option value="" disabled>Nature of Enquiry</option>
                    <option value="buy">Buying a Home</option>
                    <option value="dev">Development Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="relative">
                  <textarea 
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Project Details" 
                    rows={4} 
                    required 
                    className="w-full bg-transparent border-b border-zinc-300 py-4 text-xl font-light text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors resize-none"
                  ></textarea>
                </div>
                <Interactive>
                  <button type="submit" className="w-full bg-zinc-950 text-white py-6 text-sm tracking-[0.2em] uppercase font-semibold hover:bg-zinc-800 transition-colors rounded-2xl">
                    Submit Enquiry
                  </button>
                </Interactive>
              </form>
            ) : (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500">
                <h3 className="text-2xl font-light text-zinc-950 mb-4">Vision to Reality.</h3>
                <p className="text-zinc-500 font-light mb-8">Describe your ideal property, lifestyle requirements, or investment goals. Our AI Architect will instantly draft a preliminary project brief tailored to Auckland.</p>
                
                <textarea 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g. A 4-bedroom minimalist home in Epsom with a pool, focusing on natural light and concrete materials..." 
                  rows={4} 
                  className="w-full bg-transparent border-b border-zinc-300 py-4 text-xl font-light text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors resize-none mb-8"
                ></textarea>
                
                {!aiOutput && !isGenerating && (
                  <Interactive>
                    <button 
                      onClick={handleGenerate}
                      className="w-full bg-zinc-100 text-zinc-950 border border-zinc-200 py-6 text-sm tracking-[0.2em] uppercase font-semibold hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2 rounded-2xl"
                    >
                      ✨ Generate Brief
                    </button>
                  </Interactive>
                )}

                {isGenerating && (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-950 rounded-full animate-spin"></div>
                    <span className="ml-4 text-xs tracking-widest uppercase text-zinc-400 font-semibold animate-pulse">Consulting Architect...</span>
                  </div>
                )}

                {aiOutput && !isGenerating && (
                  <div className="flex-1 flex flex-col animate-in fade-in duration-700">
                    <div className="flex-1 bg-white p-6 border border-zinc-200 overflow-y-auto mb-8 rounded-2xl">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-600 leading-relaxed">
                        {aiOutput}
                      </pre>
                    </div>
                    <Interactive>
                      <button 
                        onClick={attachToEnquiry}
                        className="w-full bg-zinc-950 text-white py-6 text-sm tracking-[0.2em] uppercase font-semibold hover:bg-zinc-800 transition-colors flex justify-center items-center gap-2 rounded-2xl"
                      >
                        Attach to Enquiry <ArrowRight className="w-4 h-4" />
                      </button>
                    </Interactive>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Map & Locations Section */}
      <Section className="bg-white border-t border-zinc-200 mt-16 md:mt-32" noVerticalPadding>
        <div className="py-24 md:py-32 grid lg:grid-cols-3 gap-16 items-start">
          <div className="lg:col-span-1">
            <RevealText text="OUR LOCATIONS" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-8" />
            <RevealText text="Find us across Auckland." className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 mb-12" />
            
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-medium text-zinc-950 mb-2">Head Office</h4>
                <p className="text-sm text-zinc-500 font-light">123 Architecture Way<br/>Auckland CBD 1010</p>
              </div>
              <div className="border-t border-zinc-200 pt-8">
                <h4 className="text-lg font-medium text-zinc-950 mb-4">Active Development Sites</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-zinc-500 font-light">
                    <MapPin className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
                    Parnell Ascend, Parnell
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-500 font-light">
                    <MapPin className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
                    Orakei Basin Villas, Orakei
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-500 font-light">
                    <MapPin className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
                    Grey Lynn Urban, Grey Lynn
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-500 font-light">
                    <MapPin className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
                    Peninsula Terraces, Te Atatu
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 h-[400px] md:h-[600px] bg-zinc-100 rounded-3xl overflow-hidden shadow-sm relative grayscale-[50%] hover:grayscale-0 transition-all duration-700">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102148.9740618037!2d174.68652391054366!3d-36.86214309320956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d0d47e6736a4ceb%3A0x500ef6143a29917!2sAuckland%2C%20New%20Zealand!5e0!3m2!1sen!2sus!4v1709214000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full object-cover"
              title="Auckland Map"
            ></iframe>
          </div>
        </div>
      </Section>

      {/* NEW: Newsletter / Stay Connected */}
      <Section className="bg-zinc-950 text-white border-t border-zinc-800 text-center" innerClassName="py-24 md:py-32 flex flex-col items-center">
         <RevealText text="STAY UPDATED" className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-semibold mb-8" />
         <RevealText text="Subscribe to our journal." className="text-4xl md:text-5xl font-light tracking-tight text-white mb-8" />
         <RevealText text="Get the latest insights on Auckland's property market, architectural trends, and exclusive early access to upcoming developments." className="text-zinc-400 font-light max-w-xl leading-relaxed mb-12" delay={100} />
         
         <form className="w-full max-w-md flex relative" onSubmit={(e) => e.preventDefault()}>
           <input type="email" placeholder="Enter your email" className="w-full bg-transparent border-b border-zinc-700 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors pr-12" required />
           <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-2">
             <ArrowRight className="w-5 h-5" />
           </button>
         </form>
      </Section>

      {/* What Happens Next Section */}
      <Section className="border-t border-zinc-200 bg-zinc-50 text-center">
        <div className="max-w-5xl mx-auto">
          <RevealText text="THE PROCESS" className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-semibold mb-16 text-center" />
          <RevealText text="What happens next?" className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 mb-20 text-center" />
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[1px] bg-zinc-200 -z-10"></div>
            
            {[
              { step: '01', title: 'Review', desc: 'Our architecture and development team reviews your enquiry and initial requirements within 24 hours.' },
              { step: '02', title: 'Consultation', desc: 'We schedule a complimentary 45-minute discovery call to discuss site feasibility and your architectural vision.' },
              { step: '03', title: 'Proposal', desc: 'We present a high-level conceptual brief, projected timelines, and a structural fee estimate.' }
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center px-6">
                <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-xs tracking-widest font-semibold text-zinc-950 mb-8">
                  <RevealText text={item.step} delay={idx * 100} />
                </div>
                <RevealText text={item.title} className="text-2xl font-light text-zinc-950 mb-4" delay={idx * 100 + 50} />
                <RevealText text={item.desc} className="text-sm text-zinc-500 font-light leading-relaxed" delay={idx * 100 + 100} />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = ultraModernStyles;
    document.head.appendChild(styleSheet);
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.head.removeChild(styleSheet);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIsMenuOpen(false);
  }, [currentPage]);

  const navLinks = ['home', 'about', 'services', 'projects', 'gallery', 'contact'];

  return (
    <CursorContext.Provider value={{ isHovering, setIsHovering }}>
      <div className="min-h-screen flex flex-col font-sans text-zinc-950 selection:bg-zinc-950 selection:text-white bg-[#fafafa] overflow-x-hidden relative">
        
        <CustomCursor />

        {/* Minimal Header with Uniform Padding Container */}
        <header className={`fixed w-full z-50 transition-all duration-700 ease-out px-[3%] ${scrolled ? 'py-2 md:py-4 bg-white/95 backdrop-blur-sm shadow-sm' : 'py-4 md:py-6'}`}>
          <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex items-center z-10">
              <Interactive onClick={() => setCurrentPage('home')}>
                <img 
                  src="https://static.wixstatic.com/media/548938_1509800225e542a4a2d4144aa68163e9~mv2.png" 
                  alt="Pillar Properties" 
                  className={`w-auto cursor-pointer object-contain transition-all duration-700 ${scrolled ? 'h-6 md:h-7' : 'h-7 md:h-9'} ${!scrolled && currentPage === 'home' ? 'brightness-0 invert' : ''}`}
                />
              </Interactive>
            </div>

            {/* Universal Menu Toggle (Hamburger) */}
            <Interactive className={`z-10 transition-colors duration-500 flex items-center justify-end flex-1 ${!scrolled && currentPage === 'home' ? 'text-white' : 'text-zinc-950'}`}>
              <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-3 p-2 -mr-2 group hover:opacity-70 transition-opacity">
                <span className="text-[10px] md:text-xs tracking-widest uppercase font-medium hidden sm:block mt-0.5">Menu</span>
                <Menu className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            </Interactive>
          </div>
        </header>

        {/* Menu Backdrop Overlay */}
        <div 
          className={`fixed inset-0 bg-zinc-950/30 backdrop-blur-sm z-[90] transition-opacity duration-700 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Right Side Slide-Out Menu Panel */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-zinc-950 z-[100] flex flex-col p-8 md:p-12 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-semibold">Navigation</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-white hover:text-zinc-400 transition-colors p-2 -mr-2">
              <X className="w-8 h-8" />
            </button>
          </div>
          
          <div className="flex flex-col items-start justify-center gap-8 mt-12 mb-12 flex-1 w-full">
            {navLinks.map((link, i) => (
              <div 
                key={link} 
                onClick={() => setCurrentPage(link)} 
                className={`text-4xl md:text-5xl font-light tracking-tight text-white uppercase cursor-pointer text-left transition-colors duration-500 hover:text-zinc-400 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
                style={{ transitionDelay: `${100 + (i * 75)}ms`, transitionProperty: 'opacity, transform, color' }}
              >
                {link}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-4 mt-auto pt-12 border-t border-zinc-800 text-left w-full">
             <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-semibold mb-2">Get in touch</span>
             <a href="mailto:info@pillarproperties.co.nz" className="text-white hover:text-zinc-400 transition-colors font-light text-lg">info@pillarproperties.co.nz</a>
             <a href="tel:+6491234567" className="text-white hover:text-zinc-400 transition-colors font-light text-lg">+64 9 123 4567</a>
          </div>
        </div>

        {/* Persistent Floating CTA */}
        {scrolled && currentPage !== 'contact' && (
           <Interactive className="fixed bottom-8 right-6 md:right-12 lg:right-16 z-40 animate-in slide-in-from-bottom-10 fade-in duration-500 hidden md:block">
              <button 
                onClick={() => setCurrentPage('contact')} 
                className="bg-zinc-950 text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold rounded-full shadow-2xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                Inquire Now <ArrowUpRight className="w-4 h-4" />
              </button>
           </Interactive>
        )}

        {/* Dynamic Page Rendering */}
        <main className="flex-grow z-10 bg-[#fafafa]">
          {currentPage === 'home' && <HomePage navigate={setCurrentPage} />}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'services' && <ServicesPage />}
          {currentPage === 'projects' && <ProjectsPage />}
          {currentPage === 'gallery' && <GalleryPage />}
          {currentPage === 'contact' && <ContactPage />}
        </main>

        {/* Architectural Footer */}
        <footer className="bg-zinc-950 text-zinc-400 py-24 px-[3%] relative z-20">
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-zinc-800 pb-20">
              <div className="mb-12 md:mb-0">
                <Interactive onClick={() => setCurrentPage('home')}>
                  <img 
                    src="https://static.wixstatic.com/media/548938_7808033ca9fd4a2c9b9240e3e3f945e2~mv2.png" 
                    alt="Pillar Properties" 
                    className="h-12 md:h-16 w-auto mb-6 cursor-pointer object-contain" 
                  />
                </Interactive>
                <div className="flex gap-6 mt-12">
                  <Interactive><Instagram className="w-5 h-5 text-zinc-500 hover:text-white transition-colors cursor-pointer" /></Interactive>
                  <Interactive><Linkedin className="w-5 h-5 text-zinc-500 hover:text-white transition-colors cursor-pointer" /></Interactive>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 md:gap-32">
                <div>
                  <h4 className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-semibold text-zinc-600 mb-8">Navigation</h4>
                  <ul className="space-y-4 text-sm md:text-base">
                    {navLinks.map(link => (
                      <li key={link}>
                        <Interactive onClick={() => setCurrentPage(link)}>
                          <span className="hover:text-white transition-colors capitalize cursor-pointer font-light">{link}</span>
                        </Interactive>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-semibold text-zinc-600 mb-8">Contact</h4>
                  <ul className="space-y-4 font-light text-sm md:text-base">
                    <li>Auckland CBD</li>
                    <li>+64 9 123 4567</li>
                    <li>info@pillarproperties.co.nz</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs tracking-widest uppercase font-semibold text-zinc-600">
              <p className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} PILLAR PROPERTIES</p>
              <div className="flex gap-8">
                <Interactive><span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy</span></Interactive>
                <Interactive><span className="hover:text-zinc-400 cursor-pointer transition-colors">Terms</span></Interactive>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </CursorContext.Provider>
  );
}
