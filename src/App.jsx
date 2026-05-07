import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

// --- Theme / Version Context ---
const VersionContext = createContext('v1');

const useVersion = () => {
  const v = useContext(VersionContext);
  const isV2 = v === 'v2';
  return {
    isV2,
    bg: isV2 ? 'bg-[#e8d5b5]' : 'bg-[#fdf6e4]',
    bg90: isV2 ? 'bg-[#e8d5b5]/90' : 'bg-[#fdf6e4]/90',
    bg80: isV2 ? 'bg-[#e8d5b5]/80' : 'bg-[#fdf6e4]/80',
    text: isV2 ? 'text-[#e8d5b5]' : 'text-[#fdf6e4]',
    from: isV2 ? 'from-[#e8d5b5]/90' : 'from-[#fdf6e4]/90',
    via: isV2 ? 'via-[#e8d5b5]/60' : 'via-[#fdf6e4]/60',
    to: isV2 ? 'to-[#e8d5b5]/95' : 'to-[#fdf6e4]/95',
    border: isV2 ? 'border-[#e8d5b5]' : 'border-[#fdf6e4]',
    hex: isV2 ? '#e8d5b5' : '#fdf6e4'
  };
};

// --- Reusable Scroll Reveal Component ---
const Reveal = ({ children, delay = 0, active = true, className = "", threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    if (!active) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold, rootMargin: '0px 0px -50px 0px' });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, [active, threshold]);

  return (
    <div 
      ref={domRef} 
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Animated Counter Component ---
const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const domRef = useRef();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let start = null;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          // Ease out quart equation for smooth deceleration
          const easeProgress = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(easeProgress * target));
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={domRef}>{count}</span>;
};

// --- Custom Hook for Leaflet ---
const useLeaflet = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.L) { setLoaded(true); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);
  return loaded;
};

// --- Real-time Leaflet Map Component ---
const LeafletMap = () => {
  const isLoaded = useLeaflet();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  // Simulated live API state
  const [liveGrids, setLiveGrids] = useState([
    { id: 'nr', name: "Northern Grid", lat: 28.6139, lng: 77.2090, baseCap: 64.2, capacity: 64.2, limit: 70, trend: "+1.2%" },
    { id: 'wr', name: "Western Grid", lat: 19.0760, lng: 72.8777, baseCap: 58.8, capacity: 58.8, limit: 65, trend: "+0.8%" },
    { id: 'sr', name: "Southern Grid", lat: 12.9716, lng: 77.5946, baseCap: 52.1, capacity: 52.1, limit: 60, trend: "+1.5%" },
    { id: 'er', name: "Eastern Grid", lat: 22.5726, lng: 88.3639, baseCap: 23.9, capacity: 23.9, limit: 30, trend: "+0.5%" },
    { id: 'ner', name: "NE Grid", lat: 26.1445, lng: 91.7362, baseCap: 3.2, capacity: 3.2, limit: 5, trend: "+0.2%" },
  ]);

  // Initial Map Setup
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance.current) {
      const L = window.L;
      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([22.5937, 78.9629], 4.5);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      liveGrids.forEach(grid => {
        const marker = L.circleMarker([grid.lat, grid.lng], {
          color: '#3376c6', fillColor: '#3376c6', fillOpacity: 0.4, radius: 10, weight: 3
        }).addTo(map);
        
        markersRef.current[grid.id] = marker;
      });

      mapInstance.current = map;
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoaded]);

  // Real-time API Polling Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGrids(prev => prev.map(g => {
        const fluctuation = (Math.random() - 0.5) * 1.5; // +/- 0.75 GW
        return { ...g, capacity: Math.max(g.baseCap * 0.8, Math.min(g.baseCap * 1.2, g.capacity + fluctuation)) };
      }));
    }, 2500); // Poll every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  // Update Markers when Data Changes
  useEffect(() => {
    if (!mapInstance.current) return;
    
    liveGrids.forEach(grid => {
      const marker = markersRef.current[grid.id];
      if (marker) {
        // Change color based on load severity
        const loadRatio = grid.capacity / grid.limit;
        let color = '#3376c6'; // Normal
        if (loadRatio > 0.85) color = '#f5a623'; // Warning
        if (loadRatio > 0.95) color = '#ef4444'; // Critical
        
        marker.setStyle({ color, fillColor: color });

        const popupContent = `
          <div style="font-family: 'Uto', sans-serif; padding: 4px; min-width: 140px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${color}; box-shadow: 0 0 6px ${color};"></div>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #7e848e; font-weight: bold;">Live Node</div>
            </div>
            <strong style="font-size: 15px; color: #111827; display: block; margin-bottom: 10px;">${grid.name}</strong>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #eee; padding-top: 8px;">
              <div><span style="font-size: 10px; color: #7e848e; font-weight: 600;">Current Load</span><br/><strong style="color: ${color}; font-size: 14px;">${grid.capacity.toFixed(2)} <span style="font-size:10px;">GW</span></strong></div>
            </div>
          </div>
        `;
        
        // Update popup content cleanly
        if (marker.getPopup()) {
          marker.setPopupContent(popupContent);
        } else {
          marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
        }
      }
    });
  }, [liveGrids]);

  if (!isLoaded) return <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 animate-pulse rounded-2xl"><div className="w-8 h-8 border-4 border-[#3376c6] border-t-transparent rounded-full animate-spin"></div><span className="mt-4 text-xs font-semibold text-[#7e848e]">Connecting to Real-time Grid Services...</span></div>;
  
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-[#7e848e]/20 relative z-0 bg-[#e5e7eb]">
      <div ref={mapRef} className="w-full h-full z-0 leaflet-container-custom"></div>
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md border border-white/40 p-3 rounded-xl shadow-lg pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Live Grid Status</span>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px] font-semibold text-[#7e848e]">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3376c6]"></span> Optimal Load</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#f5a623]"></span> High Demand</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Near Capacity</div>
        </div>
      </div>
    </div>
  );
};

// --- Advanced Real-time Area Chart (Frequency) ---
const LiveFrequencyChart = () => {
  const t = useVersion();
  const [hoverX, setHoverX] = useState(null);
  
  // Initial state representing trailing 10 periods
  const [data, setData] = useState([49.95, 49.98, 50.02, 49.99, 49.91, 49.96, 50.04, 50.01, 49.97, 50.00]);
  
  // Real-time API Polling Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newArr = [...prev.slice(1)];
        const lastVal = newArr[newArr.length - 1];
        // Target 50.0Hz with realistic grid fluctuations
        const variance = (Math.random() - 0.5) * 0.08;
        const pullToCenter = (50.0 - lastVal) * 0.1;
        const nextVal = Number((lastVal + variance + pullToCenter).toFixed(3));
        newArr.push(Math.max(49.5, Math.min(50.5, nextVal))); // Hard limits
        return newArr;
      });
    }, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const width = 800; const height = 300;
  const padding = 20;
  const minData = 49.8; // Chart Y-axis bounds
  const maxData = 50.2;
  const range = maxData - minData;
  
  const points = data.map((val, i) => ({
    val,
    x: padding + (i * ((width - padding * 2) / (data.length - 1))),
    y: height - padding - (((val - minData) / range) * (height - padding * 2))
  }));

  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
    const cp1y = points[i - 1].y;
    const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
    const cp2y = points[i].y;
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
  }
  const areaPath = `${path} L ${points[points.length-1].x},${height-padding} L ${points[0].x},${height-padding} Z`;

  // Draw 50Hz reference line
  const refY = height - padding - (((50.0 - minData) / range) * (height - padding * 2));

  return (
    <div className="w-full h-full relative" onMouseLeave={() => setHoverX(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="freqGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3376c6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3376c6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* 50Hz Target Line */}
        <line x1={padding} y1={refY} x2={width-padding} y2={refY} stroke="#7c9074" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <text x={width - padding + 5} y={refY + 3} fill="#7c9074" fontSize="10" fontWeight="bold">50.0 Hz</text>

        <path d={areaPath} fill="url(#freqGradient)" className="transition-all duration-500 ease-linear" />
        <path d={path} fill="none" stroke="#3376c6" strokeWidth="3" strokeLinecap="round" className="transition-all duration-500 ease-linear" />
        
        {points.map((p, i) => {
          const isIEGCViolation = p.val < 49.90 || p.val > 50.05;
          const color = isIEGCViolation ? '#f5a623' : '#3376c6';
          return (
            <g key={i} className="cursor-crosshair" onMouseEnter={() => setHoverX(i)}>
              {hoverX === i && <line x1={p.x} y1={padding} x2={p.x} y2={height-padding} stroke="#7e848e" strokeWidth="1" strokeDasharray="4 4" />}
              <circle cx={p.x} cy={p.y} r={hoverX === i ? 6 : 3} fill={t.hex} stroke={color} strokeWidth="2.5" className="transition-all duration-300" />
            </g>
          );
        })}
      </svg>
      {hoverX !== null && (
        <div className="absolute bg-white/95 backdrop-blur-md border border-[#7e848e]/20 p-3 rounded-xl shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-200 z-10 w-max" style={{ left: `${(hoverX / (data.length - 1)) * 100}%`, top: `${(1 - ((points[hoverX].val - minData)/range)) * 100}%`, marginTop: '-15px' }}>
          <div className="text-[10px] uppercase font-bold text-[#7e848e] mb-1">Trailing T-{data.length - hoverX - 1}</div>
          <div className="text-gray-900 font-bold">{points[hoverX].val.toFixed(3)} Hz</div>
        </div>
      )}
    </div>
  );
};

// --- Advanced Multi-Series Bar Chart (Live Rolling Mix) ---
const LiveGenerationChart = () => {
  // 40 points for a smooth continuous scrolling effect
  const [data, setData] = useState(() => {
    return Array.from({length: 40}, (_, i) => ({
      solar: 35 + Math.sin(i*0.2)*3 + (Math.random() * 0.5),
      wind: 25 + Math.cos(i*0.1)*5 + (Math.random() * 1.5),
      hydro: 42 + Math.sin(i*0.05)*1 + (Math.random() * 0.5)
    }));
  });

  // Fast 1-second polling to simulate a live telemetry stream
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const last = next[next.length - 1];
        next.push({
          solar: Math.max(10, Math.min(60, last.solar + (Math.random() - 0.5) * 1.5)),
          wind: Math.max(10, Math.min(50, last.wind + (Math.random() - 0.5) * 2.5)),
          hydro: Math.max(20, Math.min(60, last.hydro + (Math.random() - 0.5) * 0.8))
        });
        return next;
      });
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  const width = 800; const height = 220; const padding = 10;
  const maxScale = 70; // 0 to 70 GW scale per source

  // Calculate smooth curves for the data streams
  const getBezierPath = (key) => {
    if (data.length === 0) return { path: "", areaPath: "", endY: 0 };
    const points = data.map((d, i) => ({
      x: padding + (i * ((width - padding * 2) / (data.length - 1))),
      y: height - padding - ((d[key] / maxScale) * (height - padding * 2))
    }));
    
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cp1y = points[i - 1].y;
      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cp2y = points[i].y;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
    }
    const areaPath = `${path} L ${points[points.length-1].x},${height-padding} L ${points[0].x},${height-padding} Z`;
    return { path, areaPath, endY: points[points.length - 1].y };
  };

  const solarData = getBezierPath('solar');
  const windData = getBezierPath('wind');
  const hydroData = getBezierPath('hydro');
  const endX = width - padding;
  const lastPoint = data[data.length - 1];

  return (
    <div className="w-full h-full flex flex-col relative pt-4">
      {/* Live Data HUD */}
      <div className="flex items-center gap-6 md:gap-8 mb-6 px-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-[#7e848e] flex items-center gap-1.5 uppercase tracking-wider"><div className="w-2 h-2 rounded-sm bg-[#7c9074]"></div>Hydro</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums leading-none">{lastPoint.hydro.toFixed(1)} <span className="text-[10px] text-[#7e848e] ml-0.5">GW</span></span>
        </div>
        <div className="w-px h-8 bg-[#7e848e]/20"></div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-[#7e848e] flex items-center gap-1.5 uppercase tracking-wider"><div className="w-2 h-2 rounded-sm bg-[#f5a623]"></div>Solar</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums leading-none">{lastPoint.solar.toFixed(1)} <span className="text-[10px] text-[#7e848e] ml-0.5">GW</span></span>
        </div>
        <div className="w-px h-8 bg-[#7e848e]/20"></div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-[#7e848e] flex items-center gap-1.5 uppercase tracking-wider"><div className="w-2 h-2 rounded-sm bg-[#3376c6]"></div>Wind</span>
          <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums leading-none">{lastPoint.wind.toFixed(1)} <span className="text-[10px] text-[#7e848e] ml-0.5">GW</span></span>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible absolute inset-0">
          <defs>
            <linearGradient id="hydroGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c9074" stopOpacity="0.4" /><stop offset="100%" stopColor="#7c9074" stopOpacity="0" /></linearGradient>
            <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5a623" stopOpacity="0.4" /><stop offset="100%" stopColor="#f5a623" stopOpacity="0" /></linearGradient>
            <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3376c6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3376c6" stopOpacity="0" /></linearGradient>
          </defs>

          {/* Background Grid Lines for SCADA feel */}
          {[0.25, 0.5, 0.75].map(ratio => (
            <line key={ratio} x1={padding} y1={height - padding - (height-padding*2)*ratio} x2={width-padding} y2={height - padding - (height-padding*2)*ratio} stroke="#7e848e" strokeWidth="1" strokeDasharray="2 6" opacity="0.2" />
          ))}

          {/* Data Streams (Areas) */}
          <path d={hydroData.areaPath} fill="url(#hydroGrad)" className="transition-all duration-1000 ease-linear mix-blend-multiply" />
          <path d={solarData.areaPath} fill="url(#solarGrad)" className="transition-all duration-1000 ease-linear mix-blend-multiply" />
          <path d={windData.areaPath} fill="url(#windGrad)" className="transition-all duration-1000 ease-linear mix-blend-multiply" />

          {/* Data Streams (Lines) */}
          <path d={hydroData.path} fill="none" stroke="#7c9074" strokeWidth="2.5" className="transition-all duration-1000 ease-linear" />
          <path d={solarData.path} fill="none" stroke="#f5a623" strokeWidth="2.5" className="transition-all duration-1000 ease-linear" />
          <path d={windData.path} fill="none" stroke="#3376c6" strokeWidth="2.5" className="transition-all duration-1000 ease-linear" />
          
          {/* Pulsing Live Dots at the lead of the line */}
          <circle cx={endX} cy={hydroData.endY} r="4" fill="#7c9074" className="transition-all duration-1000 ease-linear shadow-[0_0_10px_#7c9074]" />
          <circle cx={endX} cy={solarData.endY} r="4" fill="#f5a623" className="transition-all duration-1000 ease-linear shadow-[0_0_10px_#f5a623]" />
          <circle cx={endX} cy={windData.endY} r="4" fill="#3376c6" className="transition-all duration-1000 ease-linear shadow-[0_0_10px_#3376c6]" />
        </svg>
      </div>
    </div>
  );
};

// --- Experts Carousel Component ---
const ExpertsCarousel = () => {
  const t = useVersion();
  const experts = [
    { name: "Dr. Abhijit R. Abhyankar", title: "Dean of Infrastructure", org: "IIT Delhi", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", details: "Specializing in Power System Restructuring, Smart Grids, and developing robust Regulatory Policy frameworks." },
    { name: "Prof. Ashu Verma", title: "Professor, Dept. of Energy", org: "IIT Delhi", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", details: "Leading research on Renewable Energy Integration, Microgrid operational planning, and distribution systems." },
    { name: "Dr. B. K. Panigrahi", title: "Head, CART", org: "IIT Delhi", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80", details: "Forefront expert in AI applications in Power Systems, optimization, and Cyber-Physical grid security." },
    { name: "Jishnu Barua", title: "Chairperson", org: "CERC", image: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=600&q=80", details: "Driving national regulatory policies, tariff structures, and facilitating market-based economic dispatch initiatives." },
    { name: "S. R. Narasimhan", title: "CMD", org: "Grid India", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80", details: "Pioneering the modernization of national grid operations, balancing markets, and reliability standards." },
    { name: "Harpreet Singh Pruthi", title: "Secretary", org: "CERC", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", details: "Overseeing regulatory compliance, intricate tariff design, and vast stakeholder coordination at CERC." }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        return prev >= experts.length - itemsPerView ? 0 : prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [itemsPerView, experts.length]);

  return (
    <div className="relative w-full overflow-hidden pb-12 mt-8">
      <div 
        className="flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
      >
        {experts.map((expert, i) => (
          <div key={i} className="flex-shrink-0 px-3 md:px-4" style={{ width: `${100 / itemsPerView}%` }}>
            <div className="group relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all duration-500">
              <img src={expert.image} alt={expert.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <div className="transform translate-y-16 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <div className="flex flex-col items-start gap-2 mb-4">
                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-sm">{expert.org}</span>
                    <h4 className="text-xl md:text-2xl font-semibold text-white leading-tight mt-2">{expert.name}</h4>
                    <p className={`text-xs md:text-sm font-medium ${t.text}`}>{expert.title}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                    <p className="text-xs md:text-sm text-white/80 leading-relaxed border-t border-white/20 pt-4 mt-2">{expert.details}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Dots */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
         {Array.from({length: experts.length - itemsPerView + 1}).map((_, i) => (
            <div key={i} onClick={() => setCurrentIndex(i)} className={`h-2 rounded-full cursor-pointer transition-all duration-500 ${currentIndex === i ? 'bg-[#3376c6] w-8' : 'bg-[#7e848e]/30 w-2 hover:bg-[#7e848e]/60'}`}></div>
         ))}
      </div>
    </div>
  );
};

// --- Preloader Component ---
const Preloader = ({ onComplete }) => {
  const t = useVersion();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Grid Operations...");

  useEffect(() => {
    let animationFrameId;
    const startTime = Date.now();
    let isCompleted = false;

    const animate = () => {
      if (isCompleted) return;
      const elapsed = Date.now() - startTime;
      let newProgress = 0;

      if (elapsed < 600) { newProgress = (elapsed / 600) * 15; setStatus("Initializing Grid Operations..."); } 
      else if (elapsed < 1400) { newProgress = 15; setStatus("Peak Demand Analyzing..."); } 
      else if (elapsed < 2400) {
        const p = (elapsed - 1400) / 1000;
        newProgress = 15 + ((1 - Math.pow(1 - p, 3)) * 70);
        if (newProgress > 30 && newProgress < 60) setStatus("Synchronizing Market Dispatch...");
        else if (newProgress >= 60) setStatus("Evaluating Resource Adequacy...");
      } 
      else if (elapsed < 3400) { newProgress = 85 + ((elapsed - 2400) / 1000) * 14; setStatus("Validating Regulatory Frameworks..."); } 
      else if (elapsed < 3800) { newProgress = 100; setStatus("Powering Clarity."); } 
      else {
        newProgress = 100; isCompleted = true; setProgress(100);
        setTimeout(() => { if (onComplete) onComplete(); }, 400); 
        return; 
      }
      setProgress(Math.min(newProgress, 100));
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className={`absolute inset-0 ${t.bg} flex flex-col items-center justify-center z-[9999] overflow-hidden`}>
      <div className="absolute inset-0 bg-draft-grid opacity-70"></div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#f0f2f5] border border-white/60 p-8 rounded-[1.25rem] shadow-[0_20px_60px_rgba(126,132,142,0.15)] flex flex-col">
           <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold text-[#7e848e] tracking-widest uppercase">System Load Forecast</span>
              <div className="w-8 h-8 rounded-full border-2 border-[#7e848e]/20 flex items-center justify-center bg-white/50 shadow-sm">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3376c6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
           </div>
           <div className={`w-full h-3 ${t.bg} rounded-full overflow-hidden mb-6 shadow-inner`}>
              <div className="h-full bg-[#3376c6] transition-all duration-75 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
           </div>
           <p className="text-lg md:text-xl font-semibold text-[#7e848e] tracking-tight">{status}</p>
        </div>
        <div className="absolute bottom-[-80px] left-0 right-0 flex justify-center items-center gap-3 opacity-60">
           <div className="w-6 h-6 bg-[#3376c6] rounded flex items-center justify-center"><span className={`${t.text} font-bold text-[9px]`}>IIT</span></div>
           <span className="text-xs font-bold text-[#7e848e] tracking-widest uppercase">Centre of Excellence RA</span>
        </div>
      </div>
    </div>
  );
};

// --- Hero Showcase Component ---
const HeroShowcase = () => {
  const t = useVersion();
  const { isV2 } = t;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  // Enhance the scale factor significantly for V2
  const scaleFactor = isV2 ? 1.15 : 1;

  return (
    <div 
      className="relative w-full h-full min-h-[300px] lg:min-h-[450px] flex items-center justify-center overflow-visible cursor-crosshair group/hero"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setMousePos({ x: 0, y: 0 }); setIsHovered(false); }}
    >
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0 opacity-0 group-hover/hero:opacity-100"
        style={{
          backgroundImage: `radial-gradient(circle 300px at ${50 + mousePos.x * 50}% ${50 + mousePos.y * 50}%, rgba(51,118,198,0.12) 0%, transparent 100%), linear-gradient(rgba(51,118,198,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(51,118,198,0.15) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          backgroundPosition: 'center center'
        }}
      />

      <div 
        className="relative w-full max-w-[500px] lg:max-w-full aspect-square md:aspect-[4/3] flex items-center justify-center z-10 transition-transform duration-[800ms] ease-out"
        style={{ transform: `scale(${scaleFactor}) translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)` }}
      >
        {/* Fill empty space with V2 Specific Enhancements */}
        {isV2 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.35]">
             <div className="absolute w-[80%] lg:w-[90%] aspect-square rounded-full border border-[#3376c6]/40 border-dashed animate-[spin_50s_linear_infinite]"></div>
             <div className="absolute w-[60%] lg:w-[65%] aspect-square rounded-full border border-[#7c9074]/40 border-dashed animate-[spin_35s_linear_infinite_reverse]"></div>
             <div className="absolute w-[40%] lg:w-[45%] aspect-square rounded-full border border-[#7e848e]/30 border-dotted animate-[spin_20s_linear_infinite]"></div>
          </div>
        )}

        {isV2 && (
          <>
            <div className="absolute top-[18%] right-[8%] lg:right-[15%] animate-float delay-100 z-10 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#7e848e]/20 text-[9px] font-bold text-[#3376c6] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center gap-1.5 hover:scale-110 transition-transform cursor-pointer">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#3376c6] animate-pulse"></div>
                 Market Coupling Pilot
              </div>
            </div>
            <div className="absolute bottom-[22%] left-[5%] lg:left-[12%] animate-float delay-300 z-10 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#7e848e]/20 text-[9px] font-bold text-[#7c9074] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center gap-1.5 hover:scale-110 transition-transform cursor-pointer">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#7c9074] animate-pulse"></div>
                 RE Integration: 42%
              </div>
            </div>
          </>
        )}

        <svg className="absolute inset-0 w-full h-full z-0 opacity-40 pointer-events-none" style={{ filter: 'drop-shadow(0 0 2px rgba(51,118,198,0.4))' }}>
          <path d="M 55% 60% C 40% 60%, 20% 30%, 10% 25%" fill="none" stroke="#3376c6" strokeWidth="1.5" strokeDasharray="4 8" className="animate-data-flow" />
          <path d="M 60% 50% C 75% 50%, 85% 25%, 90% 20%" fill="none" stroke="#7c9074" strokeWidth="1.5" strokeDasharray="4 8" className="animate-data-flow" style={{ animationDirection: 'reverse' }} />
          <path d="M 50% 65% C 60% 80%, 75% 85%, 85% 85%" fill="none" stroke="#3376c6" strokeWidth="1.5" strokeDasharray="4 8" className="animate-data-flow" />
        </svg>

        <img
          src="https://static.wixstatic.com/media/548938_73b3953dbcaa4dc1a0ff7dddcc4882a9~mv2.png"
          alt="Power System Infrastructure"
          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply pointer-events-none z-10 drop-shadow-xl transition-transform duration-700"
          style={{ transform: `translate(${mousePos.x * -4}px, ${mousePos.y * -4}px)` }}
        />

        <div className={`absolute top-[2%] left-[-10%] lg:left-[-18%] z-20 pointer-events-auto transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isHovered ? '-translate-x-8 -translate-y-6' : 'translate-x-0 translate-y-0'}`}>
          <div className="animate-float">
            <div className="bg-white/95 backdrop-blur-md border border-[#7e848e]/10 p-3 lg:p-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-[190px] lg:w-[220px]">
              <h4 className="text-[8px] font-bold uppercase text-[#3376c6] tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3376c6] animate-pulse"></span>
                Grid Monitoring
              </h4>
              <div className="w-full h-10 mb-3 relative flex items-end border-b border-l border-[#7e848e]/20 group-hover/card:border-[#3376c6]/40 transition-colors">
                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 180 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3376c6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3376c6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,40 0,25 36,15 72,25 108,10 144,20 180,5 180,40" fill="url(#chartGradient)" className="transition-all duration-1000 origin-bottom" />
                  <polyline points="0,25 36,15 72,25 108,10 144,20 180,5" fill="none" stroke="#3376c6" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <circle cx="108" cy="10" r="3" fill="white" stroke="#3376c6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <circle cx="180" cy="5" r="3" fill="white" stroke="#3376c6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col"><span className="text-[7px] text-[#7e848e] uppercase font-semibold tracking-wider">Load</span><span className="text-[#3376c6] font-bold text-xs leading-none mt-1">75.4 <span className="text-[8px]">GW</span></span></div>
                <div className="flex flex-col"><span className="text-[7px] text-[#7e848e] uppercase font-semibold tracking-wider">Frequency</span><span className="text-[#3376c6] font-bold text-xs leading-none mt-1">49.98 <span className="text-[8px]">Hz</span></span></div>
                <div className="flex flex-col"><span className="text-[7px] text-[#7e848e] uppercase font-semibold tracking-wider">Reliability</span><span className="text-[#3376c6] font-bold text-xs leading-none mt-1">98.6 <span className="text-[8px]">%</span></span></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute top-[-5%] right-[-5%] lg:right-[-15%] z-20 pointer-events-auto transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isHovered ? 'translate-x-8 -translate-y-6' : 'translate-x-0 translate-y-0'}`}>
          <div className="animate-float-delayed">
            <div className="bg-white/95 backdrop-blur-md border border-[#7e848e]/10 p-3 lg:p-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-[210px] lg:w-[240px]">
              <h4 className="text-[8px] font-bold uppercase text-[#3376c6] tracking-widest mb-4">Regulatory Insights</h4>
              <div className="flex justify-between items-end gap-4">
                <div className="flex flex-col gap-2.5 flex-1">
                  {['Compliance', 'Performance', 'Transparency', 'Consumer Impact'].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between w-full">
                      <span className="text-[8px] lg:text-[9px] text-gray-800 font-semibold">{item}</span>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#7c9074]/15 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-[#7c9074]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-1.5 h-[45px] w-[50px] lg:h-[55px] lg:w-[60px] group-hover:scale-y-110 origin-bottom transition-transform duration-500">
                  <div className="w-full bg-[#7e848e]/30 rounded-t-sm h-[40%] hover:bg-[#3376c6] transition-colors"></div>
                  <div className="w-full bg-[#3376c6] rounded-t-sm h-[80%] hover:bg-[#7c9074] transition-colors"></div>
                  <div className="w-full bg-[#7e848e]/30 rounded-t-sm h-[60%] hover:bg-[#3376c6] transition-colors"></div>
                  <div className="w-full bg-[#3376c6] rounded-t-sm h-[100%] hover:bg-[#7c9074] transition-colors"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-[-5%] lg:bottom-[0%] right-[-5%] lg:right-[-10%] z-20 pointer-events-auto transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isHovered ? 'translate-x-8 translate-y-8' : 'translate-x-0 translate-y-0'}`}>
          <div className="animate-float" style={{ animationDelay: '1.5s' }}>
            <div className="bg-white/95 backdrop-blur-md border border-[#7e848e]/10 p-3 lg:p-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-[180px] lg:w-[200px] group">
              <h4 className="text-[8px] font-bold uppercase text-[#3376c6] tracking-widest mb-3">Evidence-Based Decisions</h4>
              <div className="flex flex-col gap-2.5">
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-[#3376c6]/5 rounded-lg flex items-end justify-center gap-[2px] p-1.5 group-hover:bg-[#3376c6]/10 transition-colors">
                     <div className="w-[2px] h-[60%] bg-[#7e848e] rounded-[1px]"></div>
                     <div className="w-[2px] h-[100%] bg-[#7c9074] rounded-[1px]"></div>
                     <div className="w-[2px] h-[80%] bg-[#3376c6] rounded-[1px]"></div>
                   </div>
                   <span className="text-[9px] lg:text-[10px] font-semibold text-gray-800">Data & Analytics</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-[#3376c6]/5 rounded-lg flex items-center justify-center group-hover:bg-[#3376c6]/10 transition-colors">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7e848e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13" stroke="#3376c6"></line><line x1="16" y1="17" x2="8" y2="17" stroke="#3376c6"></line></svg>
                   </div>
                   <span className="text-[9px] lg:text-[10px] font-semibold text-gray-800">Policy Evaluation</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-[#3376c6]/5 rounded-lg flex items-center justify-center group-hover:bg-[#3376c6]/10 transition-colors">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7e848e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                   </div>
                   <span className="text-[9px] lg:text-[10px] font-semibold text-gray-800">Stakeholder Impact</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SVG Icon Helper for Mega Menu ---
const MenuIcon = ({ type }) => {
  switch (type) {
    case 'market': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
    case 'grid': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
    case 'transition': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case 'intelligence': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
    case 'archive': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case 'analytics': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>;
    case 'papers': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case 'reports': return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    default: return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
  }
};

// --- App Content Component ---
const AppContent = () => {
  const t = useVersion();
  const [isLoading, setIsLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    document.title = "IIT Delhi CoE RA | Powering Clarity";
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false); 
    setTimeout(() => setAppLoaded(true), 600); 
    setTimeout(() => setShowPreloader(false), 1200);
  };

  const navItems = [
    { label: 'Home', hasMega: false },
    { label: 'About', hasMega: false },
    { 
      label: 'Pillars', 
      hasMega: true, 
      megaContent: {
        items: [
          { name: 'Power Markets', desc: 'Economic dispatch and pricing mechanisms shaping market performance.', icon: 'market' },
          { name: 'Grid Operations', desc: 'System reliability, real-time balancing, and frequency stability.', icon: 'grid' },
          { name: 'Energy Transition', desc: 'Regulatory frameworks for high-RE integration and emerging systems.', icon: 'transition' },
          { name: 'Regulatory Intelligence', desc: 'Data-driven insights for responsive and adaptive policy design.', icon: 'intelligence' }
        ],
        featured: {
          title: 'Market Based Economic Dispatch',
          subtitle: 'Active Sandbox',
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
          linkText: 'View Project Details'
        }
      }
    },
    { label: 'Impact', hasMega: false },
    { 
      label: 'Research', 
      hasMega: true, 
      megaContent: {
        items: [
          { name: 'Policy Archive', desc: 'Comprehensive database of regulatory frameworks and amendments.', icon: 'archive' },
          { name: 'Data Analytics', desc: 'Interactive dashboards tracking system performance and market trends.', icon: 'analytics' },
          { name: 'Working Papers', desc: 'Pre-publication research and methodological frameworks.', icon: 'papers' },
          { name: 'Annual Reports', desc: 'Comprehensive reviews of Centre activities and sector impact.', icon: 'reports' }
        ],
        featured: {
          title: 'Evaluating Resource Adequacy',
          subtitle: 'Latest Policy Brief',
          image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2076&auto=format&fit=crop',
          linkText: 'Read Document'
        }
      }
    },
    { label: 'Events', hasMega: false },
    { label: 'Contact', hasMega: false }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        
        :root {
          --font-primary: 'Uto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
        }
        * { font-family: var(--font-primary); }
        p { font-family: var(--font-mono) !important; font-size: 0.875rem; line-height: 1.6; }

        .bg-dot-pattern { background-image: radial-gradient(#7e848e22 1px, transparent 1px); background-size: 24px 24px; }
        
        /* V1 Draft Grid */
        .bg-draft-grid { background-image: linear-gradient(to right, rgba(126, 132, 142, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(126, 132, 142, 0.08) 1px, transparent 1px); background-size: 40px 40px; }
        
        /* V2 Draft Grid (More Visible) */
        .bg-draft-grid-v2 { background-image: linear-gradient(to right, rgba(126, 132, 142, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(126, 132, 142, 0.25) 1px, transparent 1px); background-size: 40px 40px; }

        @keyframes grid-pan { from { background-position: 0 0; } to { background-position: -40px -40px; } }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: scroll 40s linear infinite; }
        .hover-pause:hover { animation-play-state: paused; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes dashDraw { to { stroke-dashoffset: 0; } }
        
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 7s ease-in-out infinite 2s; }
        @keyframes flow { to { stroke-dashoffset: -24; } }
        .animate-data-flow { animation: flow 1.5s linear infinite; }
        
        /* Fix leaflet z-index so it doesn't overlap header */
        .leaflet-container-custom .leaflet-pane { z-index: 10; }
        .leaflet-container-custom .leaflet-top, .leaflet-container-custom .leaflet-bottom { z-index: 20; }
        .custom-leaflet-popup .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      `}} />

      {showPreloader && (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-transform duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] ${isLoading ? 'translate-y-0' : '-translate-y-[100vh] pointer-events-none'}`}>
          <Preloader onComplete={handlePreloaderComplete} />
        </div>
      )}

      <div className={`min-h-screen ${t.bg} bg-dot-pattern selection:bg-[#3376c6]/20 text-[#7e848e] relative overflow-x-hidden transition-all duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] ${isLoading ? 'scale-[0.98] opacity-0 h-screen overflow-hidden' : 'scale-100 opacity-100'}`}>
        <div className={`absolute inset-0 bg-gradient-to-b ${t.from} ${t.via} ${t.to} pointer-events-none fixed z-0`}></div>

        <div className="relative z-10">
          
          {/* Header */}
          <header className={`fixed top-0 w-full z-[100] ${t.bg80} transition-all backdrop-blur-xl border-b border-[#7e848e]/10`}>
            <div className="w-full px-[3%] py-3 flex justify-between items-center relative">
              <div className="flex items-center gap-4 cursor-pointer relative z-20">
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-[#3376c6] rounded-lg group-hover:bg-[#3376c6]/90 transition-colors duration-300 flex items-center justify-center shadow-sm">
                     <span className="text-[#efefef] font-semibold text-sm">IIT</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-[#7e848e]/30 hidden sm:block"></div>
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg/1280px-Indian_Institute_of_Technology_Delhi_Logo.svg.png" alt="IIT Delhi" className="h-8 object-contain hidden sm:block" />
              </div>
              <nav className="hidden lg:flex items-center gap-8 h-full">
                <ul className="flex gap-8 text-xs font-semibold text-[#7e848e] h-full items-center">
                  {navItems.map((item) => (
                    <li key={item.label} className="group py-5 hover:text-[#3376c6] transition-colors cursor-pointer flex items-center gap-1">
                      <span>{item.label}</span>
                      {item.hasMega && (
                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:-rotate-180 text-[#7e848e] group-hover:text-[#3376c6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      )}
                      
                      {/* Dark Luxury Mega Menu Dropdown */}
                      {item.hasMega && item.megaContent && (
                        <div className="fixed top-[65px] left-1/2 -translate-x-1/2 pt-6 w-full max-w-[850px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] transform translate-y-4 group-hover:translate-y-0 z-50">
                          <div className="bg-[#111827]/95 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white/10 rounded-[1.5rem] flex overflow-hidden relative">
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#3376c6] opacity-20 rounded-full blur-[80px] pointer-events-none"></div>
                            
                            <div className="w-[60%] p-8 grid grid-cols-2 gap-x-6 gap-y-8 relative z-10">
                              {item.megaContent.items.map((subItem, idx) => (
                                <div key={idx} className="group/link flex gap-4 items-start cursor-pointer">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/70 group-hover/link:bg-[#3376c6] group-hover/link:border-[#3376c6] group-hover/link:text-white transition-all duration-300 shadow-sm group-hover/link:shadow-[0_0_15px_rgba(51,118,198,0.5)]">
                                    <MenuIcon type={subItem.icon} />
                                  </div>
                                  <div className="flex flex-col gap-1 mt-0.5">
                                    <span className="text-white font-semibold text-sm group-hover/link:text-[#3376c6] transition-colors">{subItem.name}</span>
                                    <span className="text-white/50 text-[11px] leading-relaxed font-mono">{subItem.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="w-[40%] bg-white/[0.03] border-l border-white/10 relative p-8 flex flex-col justify-end overflow-hidden group/feat cursor-pointer">
                              <div className="absolute inset-0 z-0">
                                <img src={item.megaContent.featured.image} alt="Featured" className="w-full h-full object-cover opacity-30 group-hover/feat:scale-110 transition-transform duration-700 ease-out mix-blend-luminosity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/80 to-transparent"></div>
                              </div>
                              <div className="relative z-10 flex flex-col items-start gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#3376c6] bg-[#3376c6]/20 px-2 py-1 rounded-md border border-[#3376c6]/30">{item.megaContent.featured.subtitle}</span>
                                <h3 className="text-white font-semibold text-lg leading-tight mt-2 group-hover/feat:text-[#3376c6] transition-colors">{item.megaContent.featured.title}</h3>
                                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/70 group-hover/feat:text-white transition-colors">{item.megaContent.featured.linkText} <span className="group-hover/feat:translate-x-1 transition-transform">→</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="px-5 py-2.5 bg-[#3376c6] hover:bg-[#3376c6]/90 text-white rounded-lg transition-all shadow-sm text-xs font-semibold cursor-pointer relative z-20">Partner With Us</div>
              </nav>

              <div className="lg:hidden w-9 h-9 bg-white/50 border border-[#7e848e]/20 rounded-lg flex items-center justify-center flex-col gap-1.5 shadow-sm cursor-pointer hover:bg-white transition-colors z-20">
                 <div className="w-4 h-0.5 bg-gray-900 rounded"></div>
                 <div className="w-4 h-0.5 bg-gray-900 rounded"></div>
              </div>
            </div>
          </header>

          {/* 1. Hero Section */}
          <section className="relative h-screen pt-24 pb-8 flex flex-col justify-center overflow-hidden">
            {/* Dynamic Pattern V1 vs V2 */}
            <div className={`absolute inset-0 pointer-events-none mix-blend-multiply [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] z-0 ${t.isV2 ? 'opacity-80' : 'opacity-40'}`}>
               <div className={`absolute inset-0 animate-[grid-pan_15s_linear_infinite] ${t.isV2 ? 'bg-draft-grid-v2' : 'bg-draft-grid'}`}></div>
            </div>
            
            <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-[#3376c6] opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full px-[3%] flex-grow flex flex-col justify-center relative z-10">
              <div className="grid lg:grid-cols-[11fr_9fr] gap-8 lg:gap-12 items-center w-full h-full max-w-[96rem] mx-auto">
                <div className="flex flex-col items-start w-full order-2 lg:order-1 justify-center py-4 lg:py-8 lg:pr-8">
                  <Reveal active={appLoaded} delay={0}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#3376c6]/10 border border-[#3376c6]/20 mb-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3376c6] animate-pulse"></span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#3376c6]">IIT Delhi Centre of Excellence in Regulatory Affairs</span>
                    </div>
                  </Reveal>
                  <Reveal active={appLoaded} delay={100} className="w-full">
                    <h1 className="text-4xl md:text-5xl lg:text-[3.2rem] xl:text-[3.8rem] font-semibold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                      Driving Excellence in <br className="hidden lg:block" /> Power Sector Regulation
                    </h1>
                  </Reveal>
                  <Reveal active={appLoaded} delay={200} className="w-full">
                    <div className="text-[#7e848e] mb-10 max-w-xl xl:max-w-2xl flex flex-col gap-4">
                      <p>At the centre of India's evolving power landscape, we bring together regulatory science and real-world insight to shape how frameworks are built, tested, and applied.</p>
                      <p>Established by IIT Delhi with CERC and Grid India, the CoE advances evidence-based regulatory systems—bringing clarity to complexity across markets and grid operations.</p>
                    </div>
                  </Reveal>
                  <Reveal active={appLoaded} delay={300} className="w-full">
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <div className="w-full sm:w-auto px-6 py-3 bg-[#3376c6] hover:bg-[#3376c6]/90 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center font-semibold text-sm">Explore Research</div>
                      <div className={`w-full sm:w-auto px-6 py-3 ${t.bg} hover:bg-white text-[#3376c6] rounded-lg transition-all cursor-pointer border border-[#7e848e]/20 flex items-center justify-center font-semibold text-sm`}>Learn More</div>
                    </div>
                  </Reveal>
                  <Reveal active={appLoaded} delay={400} className="w-full mt-10 pt-8 border-t border-[#7e848e]/20 hidden sm:block max-w-xl">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex flex-col gap-1"><span className="text-2xl font-bold text-gray-900">5+</span><span className="text-[10px] font-semibold uppercase tracking-widest text-[#7e848e]">Regional Grids</span></div>
                      <div className="w-px h-8 bg-[#7e848e]/20"></div>
                      <div className="flex flex-col gap-1"><span className="text-2xl font-bold text-gray-900">120+</span><span className="text-[10px] font-semibold uppercase tracking-widest text-[#7e848e]">Policy Briefs</span></div>
                      <div className="w-px h-8 bg-[#7e848e]/20"></div>
                      <div className="flex flex-col gap-1"><span className="text-2xl font-bold text-gray-900">15+</span><span className="text-[10px] font-semibold uppercase tracking-widest text-[#7e848e]">Active Sandboxes</span></div>
                    </div>
                  </Reveal>
                </div>
                <Reveal active={appLoaded} delay={200} className="order-1 lg:order-2 w-full h-full min-h-[300px] lg:min-h-[450px]">
                  <HeroShowcase />
                </Reveal>
              </div>
            </div>
          </section>

          {/* 2. Trusted Partners Strip */}
          <section className={`${t.bg} py-8 overflow-hidden shadow-none border-0`}>
            <Reveal active={appLoaded} delay={400} className="w-full">
              <div className="text-center mb-6 px-[3%] max-w-[96rem] mx-auto">
                 <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7e848e]">Aligned with institutions driving power sector reform</span>
              </div>
              <div className="flex w-full overflow-hidden mt-2" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div className="flex animate-marquee whitespace-nowrap min-w-full">
                  <div className="flex gap-16 md:gap-32 px-[3%] items-center w-full justify-start">
                    {['CERC', 'Grid India', 'Ministry of Power', 'CEA', 'POSOCO', 'IIT Delhi'].map((p, i) => <div key={`s1-${i}`} className="text-xl font-semibold text-[#7e848e] hover:text-[#3376c6] cursor-pointer flex-shrink-0">{p}</div>)}
                  </div>
                  <div className="flex gap-16 md:gap-32 px-[3%] items-center w-full justify-start">
                    {['CERC', 'Grid India', 'Ministry of Power', 'CEA', 'POSOCO', 'IIT Delhi'].map((p, i) => <div key={`s2-${i}`} className="text-xl font-semibold text-[#7e848e] hover:text-[#3376c6] cursor-pointer flex-shrink-0">{p}</div>)}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* 3. Core Pillars / Services */}
          <section className="py-16 md:py-24 w-full">
            <div className="w-full max-w-[96rem] mx-auto px-[3%]">
              <Reveal className="mb-10 flex flex-col items-start w-full">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7e848e] mb-2">Focus Areas</span>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">What Shapes the CoE RA’s Ecosystem</h2>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {[
                  { title: "Power Markets & Economics", text: "Continuously shaped through regulatory frameworks, tariff design, and evolving policy priorities." },
                  { title: "Grid Operations & Reliability", text: "System reliability is determined by how effectively planning and real-time operations align." },
                  { title: "Energy Transition & Systems", text: "A systemic transformation that requires regulatory frameworks to evolve alongside tech change." },
                  { title: "Data & Regulatory Intelligence", text: "Moving beyond static frameworks toward responsive, intelligent regulatory systems using data." }
                ].map((pillar, idx) => (
                  <Reveal key={idx} delay={idx * 100} className="h-full w-full">
                    <div className="group bg-white p-8 rounded-[1.5rem] border border-[#7e848e]/10 hover:border-[#3376c6]/50 hover:shadow-[0_20px_50px_rgba(51,118,198,0.08)] transition-all duration-500 cursor-pointer flex flex-col h-full hover:-translate-y-2">
                      <div className="w-14 h-14 bg-[#3376c6]/5 text-[#3376c6] group-hover:bg-[#3376c6] group-hover:text-white rounded-2xl mb-6 transition-colors duration-500 flex items-center justify-center font-bold text-lg border border-[#3376c6]/20 shadow-sm">
                        0{idx+1}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-[#3376c6] transition-colors leading-snug">{pillar.title}</h3>
                      <p className="text-[#7e848e] mb-8 flex-grow">{pillar.text}</p>
                      <div className="mt-auto text-xs font-bold uppercase tracking-wider text-[#3376c6] flex items-center gap-2">Explore Pillar <span className="group-hover:translate-x-2 transition-transform">→</span></div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* 4. About / Institutional Relevance */}
          <section className="py-16 md:py-24 border-y border-[#7e848e]/20 relative bg-white">
            <div className="w-full max-w-[96rem] mx-auto px-[3%] relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <Reveal className={`relative w-full p-2 ${t.bg} rounded-[2rem] border border-[#7e848e]/10 shadow-sm group`}>
                  <div className="relative w-full h-[400px] md:h-[500px] rounded-[1.5rem] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2070" 
                      alt="Modern Power Infrastructure" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                    />
                    <div className="absolute inset-0 bg-[#3376c6]/10 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Floating Overlay Card */}
                  <div className="absolute bottom-8 -right-2 md:-right-8 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-white/40 flex items-center gap-5 animate-float z-20 max-w-[280px]">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#3376c6] to-[#265a99] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#3376c6] uppercase tracking-widest font-bold mb-1">Strategic Partnership</span>
                      <span className="text-[15px] font-bold text-gray-900 leading-tight">IIT Delhi, CERC & Grid India</span>
                    </div>
                  </div>
                </Reveal>
                
                <Reveal delay={200} className="flex flex-col gap-6 w-full items-start pl-0 lg:pl-10">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7c9074]">About the Centre</span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 leading-[1.1] tracking-tight">Institutional Relevance in a Decisive Shift</h2>
                  </div>
                  <div className="flex flex-col gap-5 text-[#7e848e] text-lg leading-relaxed">
                    <p>India’s power sector is being reshaped by decarbonisation, renewable integration, evolving markets, and rising grid complexity.</p>
                    <p>The IIT Delhi Centre of Excellence – Regulatory Affairs sits at the intersection of research, policy, and system operations. Its role is to strengthen regulatory capability, support evidence-based decisions, and contribute to a more resilient power sector ecosystem.</p>
                  </div>
                  <div className="mt-4 px-8 py-4 bg-transparent border-2 border-[#3376c6] text-[#3376c6] hover:bg-[#3376c6] hover:text-white rounded-xl transition-all cursor-pointer font-bold text-sm">Read the Full Mandate</div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* 5. Our Experts & Leadership - Carousel */}
          <section className={`py-16 md:py-24 ${t.bg}`}>
            <div className="w-full max-w-[96rem] mx-auto px-[3%]">
              <Reveal className="mb-2 flex flex-col items-start gap-2 w-full">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7e848e]">Where academic rigour meets real-world expertise</span>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">Experts and Leadership</h2>
              </Reveal>
              <Reveal delay={200} className="w-full">
                 <ExpertsCarousel />
              </Reveal>
            </div>
          </section>

          {/* 6. Metrics / Impact */}
          <section className={`py-16 md:py-24 ${t.bg} shadow-sm`}>
            <div className="w-full max-w-[96rem] mx-auto px-[3%]">
              <Reveal className="max-w-3xl mb-12">
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">From regulatory insight to system impact</h2>
                <p className="text-[#7e848e]">
                  The CoE's work is anchored in evidence-based analysis and designed to deliver measurable impact across regulatory systems and the broader power sector ecosystem.
                </p>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { metric: 15, suffix: "+", label: "Policy Frameworks Influenced", icon: "📄" },
                  { metric: 50, suffix: "+", label: "Peer-Reviewed Publications", icon: "🔬" },
                  { metric: 120, suffix: "+", label: "Grid Officials Trained", icon: "👨‍🏫" },
                  { metric: 5, suffix: "+", label: "Active Regulatory Sandboxes", icon: "⚡" }
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 150} className="w-full">
                    <div className="group p-8 bg-white border border-[#7e848e]/10 rounded-[2rem] shadow-sm hover:shadow-[0_20px_50px_rgba(51,118,198,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center h-full">
                       <div className={`w-14 h-14 ${t.bg} border border-[#7e848e]/10 text-2xl flex items-center justify-center rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>{item.icon}</div>
                       <div className="text-5xl md:text-6xl font-bold text-[#3376c6] mb-3 tracking-tighter">
                         <AnimatedCounter target={item.metric} />{item.suffix}
                       </div>
                       <div className="text-sm font-bold text-gray-900 uppercase tracking-wider leading-snug">
                         {item.label}
                       </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* 7. Interactive Regional Impact Map (Leaflet w/ Live Data) */}
          <section className="py-16 md:py-24 bg-white">
            <div className="w-full max-w-[96rem] mx-auto px-[3%]">
              <Reveal className="mb-10 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#3376c6] px-3 py-1 bg-[#3376c6]/10 rounded-full border border-[#3376c6]/20">Live Network Stream</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">Real-Time Regional Impact Map</h2>
                <p className="text-[#7e848e] max-w-2xl">Live visualisation of grid capacities and active regulatory nodes managed via the CoE framework.</p>
              </Reveal>
              <Reveal delay={200} className={`w-full h-[500px] md:h-[600px] relative rounded-[2rem] p-3 ${t.bg} border border-[#7e848e]/10 shadow-sm`}>
                 <LeafletMap />
              </Reveal>
            </div>
          </section>

          {/* 8. Featured Data & Analytics Preview (Live SVG Charts) */}
          <section className={`py-16 md:py-24 w-full ${t.bg}`}>
            <div className="w-full max-w-[96rem] mx-auto px-[3%]">
              <Reveal className="mb-12 flex flex-col items-start gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7c9074]">Analytical depth, shaping decisions</span>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">Featured Data and Analytics</h2>
              </Reveal>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <Reveal delay={100} className="w-full h-[450px]">
                  <div className="w-full h-full bg-white rounded-[2rem] border border-[#7e848e]/10 p-8 flex flex-col gap-6 shadow-sm hover:shadow-[0_20px_50px_rgba(51,118,198,0.06)] transition-all duration-500">
                    <div className="flex justify-between items-center border-b border-[#7e848e]/10 pb-5 z-10">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-900">Grid Frequency Stability</h3>
                        <span className="text-xs text-[#7e848e]">Real-time Tracking (Hz)</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Live</span>
                      </div>
                    </div>
                    <div className="flex-1 relative mt-4"><LiveFrequencyChart /></div>
                  </div>
                </Reveal>
                
                <Reveal delay={200} className="w-full h-[450px]">
                  <div className="w-full h-full bg-white rounded-[2rem] border border-[#7e848e]/10 p-8 flex flex-col gap-6 shadow-sm hover:shadow-[0_20px_50px_rgba(51,118,198,0.06)] transition-all duration-500">
                    <div className="flex justify-between items-center border-b border-[#7e848e]/10 pb-5 z-10">
                       <div className="flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-900">Real-time Dispatch</h3>
                        <span className="text-xs text-[#7e848e]">Rolling Generation Mix (GW)</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Live</span>
                      </div>
                    </div>
                    <div className="flex-1 relative"><LiveGenerationChart /></div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* 9. Active Projects */}
          <section className="py-16 md:py-24 border-y border-[#7e848e]/20 relative overflow-hidden bg-white">
            <div className="w-full max-w-[96rem] mx-auto px-[3%] relative z-10">
              <Reveal className="mb-12 flex justify-between items-end">
                 <div>
                   <span className="text-[10px] font-semibold uppercase tracking-widest text-[#3376c6] block mb-2">Live Initiatives</span>
                   <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight">Active Sandboxes</h2>
                 </div>
                 <div className="hidden md:flex items-center gap-2 cursor-pointer text-sm font-bold text-[#3376c6] hover:translate-x-2 transition-transform">
                   View All Projects →
                 </div>
              </Reveal>

              <Reveal delay={200} className="w-full">
                <div className="flex gap-6 overflow-x-auto pb-12 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {[
                    { title: "Market Based Economic Dispatch", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", stage: "Phase 2 Testing", progress: 75, color: "#3376c6" },
                    { title: "Energy Storage Frameworks", img: "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?auto=format&fit=crop&w=600&q=80", stage: "Framework Design", progress: 40, color: "#f5a623" },
                    { title: "Ancillary Services Redesign", img: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=600&q=80", stage: "Live Sandbox", progress: 90, color: "#7c9074" },
                  ].map((proj, idx) => (
                    <div key={idx} className="min-w-[320px] md:min-w-[420px] aspect-[4/3] rounded-[2rem] snap-center relative group cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                      <img src={proj.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt={proj.title}/>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/60 to-transparent"></div>
                      
                      <div className="absolute inset-0 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1.5 bg-white/20 backdrop-blur border border-white/30 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg">{proj.stage}</span>
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center group-hover:bg-white transition-colors duration-300 text-white group-hover:text-black">↗</div>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-semibold text-white mb-6 leading-tight">{proj.title}</h3>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Progress</span>
                            <span className="text-xs font-bold text-white">{proj.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur">
                            <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${proj.progress}%`, backgroundColor: proj.color }}>
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* 10. Knowledge Hub */}
          <section className={`py-16 md:py-24 ${t.bg}`}>
            <div className="w-full max-w-[96rem] mx-auto px-[3%]">
              <Reveal className="mb-12 text-center max-w-3xl mx-auto flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7c9074] bg-[#7c9074]/10 px-4 py-1.5 rounded-full mb-4">Knowledge Hub</span>
                <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-6">Evidence-led insights shaping regulatory decisions</h2>
                <p className="text-[#7e848e] text-lg">Bringing together peer-reviewed research, policy briefs, datasets, and analytical frameworks built on technical rigour.</p>
              </Reveal>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Featured Report */}
                <Reveal delay={100} className="lg:col-span-5 w-full">
                  <div className="w-full h-full bg-white rounded-[2rem] p-2 border border-[#7e848e]/10 shadow-sm group cursor-pointer relative overflow-hidden">
                    <div className="w-full h-[300px] md:h-full min-h-[400px] rounded-[1.5rem] bg-[#111827] relative overflow-hidden flex flex-col items-center justify-center p-10 text-center">
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_#3376c6,_transparent_50%)]"></div>
                      <div className="w-16 h-20 bg-white/10 backdrop-blur border border-white/20 rounded mb-8 group-hover:-translate-y-4 group-hover:rotate-6 transition-transform duration-500 shadow-2xl flex items-center justify-center text-white/50">PDF</div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#3376c6] mb-4">Featured Annual Report</span>
                      <h3 className="text-2xl md:text-3xl font-semibold text-white leading-tight mb-8 z-10">National Grid Reliability Index 2025</h3>
                      <div className="mt-auto px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform z-10">Download Full Report</div>
                    </div>
                  </div>
                </Reveal>

                {/* Right: Policy List */}
                <Reveal delay={200} className="lg:col-span-7 flex flex-col gap-4 w-full">
                  <div className="w-full bg-white rounded-[2rem] border border-[#7e848e]/10 p-8 shadow-sm h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8 border-b border-[#7e848e]/10 pb-6">
                      <h3 className="text-xl font-bold text-gray-900">Recent Publications</h3>
                      <div className={`flex items-center gap-2 px-4 py-2 ${t.bg} rounded-lg text-xs font-bold text-[#7e848e] cursor-pointer hover:text-black transition-colors`}>
                        View Archive <span>→</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-grow justify-between">
                      {[
                        { title: "Evaluating Resource Adequacy Frameworks in High-RE Scenarios", type: "Policy Brief", date: "Apr 2026", size: "2.4 MB" },
                        { title: "Transmission Congestion Management: A Review of Market Splitting", type: "Research Paper", date: "Mar 2026", size: "1.8 MB" },
                        { title: "Real-time Frequency Variance Analysis Dataset", type: "Dataset", date: "Feb 2026", size: "14 MB" },
                        { title: "Consultation Paper on Ancillary Services Deployment", type: "Framework", date: "Jan 2026", size: "3.1 MB" },
                      ].map((doc, idx) => (
                        <div key={idx} className={`group flex items-center justify-between p-5 rounded-2xl hover:${t.bg} border border-transparent hover:border-[#7e848e]/20 transition-all duration-300 cursor-pointer`}>
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#3376c6] group-hover:shadow-sm transition-all">📄</div>
                            <div className="flex flex-col gap-1">
                              <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-[#3376c6] transition-colors">{doc.title}</h4>
                              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-[#7e848e]">
                                <span>{doc.type}</span>•<span>{doc.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-[#3376c6]">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* 11. Upcoming Events */}
          <section className="py-16 md:py-24 border-y border-[#7e848e]/20 bg-white">
            <div className="w-full max-w-[96rem] mx-auto px-[3%]">
              <Reveal className="mb-12 flex justify-between items-end w-full">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7e848e]">Participation & Dialogue</span>
                  <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight">Events & Webinars</h2>
                </div>
              </Reveal>
              
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {[
                  { d: "24", m: "MAY", title: "Symposium on High-RE Integration", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80", type: "Hybrid Event" },
                  { d: "12", m: "JUN", title: "Future of Power Market Design", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80", type: "Roundtable" },
                  { d: "05", m: "JUL", title: "Decoding Tariff Regulations", img: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=80", type: "Webinar" }
                ].map((event, idx) => (
                  <Reveal key={idx} delay={idx * 150} className="w-full">
                    <div className={`group rounded-[2rem] ${t.bg} border border-[#7e848e]/10 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-[450px]`}>
                      <div className="h-[200px] w-full relative overflow-hidden">
                        <img src={event.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="event" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-xl p-3 text-center min-w-[70px] shadow-lg border border-white/50">
                          <div className="text-[10px] font-bold uppercase text-[#3376c6]">{event.m}</div>
                          <div className="text-2xl font-black text-gray-900 leading-none mt-1">{event.d}</div>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow bg-white group-hover:bg-[#3376c6] transition-colors duration-500">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#7c9074] group-hover:text-white/70 mb-3">{event.type}</span>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white leading-tight mb-6">{event.title}</h3>
                        <div className="mt-auto flex items-center justify-between w-full pt-6 border-t border-gray-100 group-hover:border-white/20">
                          <div className="flex -space-x-3">
                            {[1,2,3].map(n => <div key={n} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white group-hover:border-[#3376c6] z-10"></div>)}
                          </div>
                          <span className="text-sm font-bold text-[#3376c6] group-hover:text-white">Register →</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* 12. Floating Pre-Footer CTA */}
          <div className="relative z-50 w-full px-[3%] -mb-[150px] mt-16 md:mt-24 pointer-events-none">
            <div className="max-w-[80rem] mx-auto pointer-events-auto">
              <Reveal>
                <div className="relative w-full rounded-xl md:rounded-2xl bg-[#111827] overflow-hidden shadow-[0_40px_100px_rgba(17,24,39,0.4)] border border-white/10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16">
                  {/* Glowing Orbs */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#3376c6] opacity-30 rounded-full blur-[100px] pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#7c9074] opacity-20 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col items-start gap-4 max-w-xl mb-10 md:mb-0">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-3xl shadow-lg">⚡</div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">Step Into the Regulatory Ecosystem</h2>
                    <p className="text-white/60 text-lg leading-relaxed mt-2">Join the forums shaping India's power sector. Where regulatory insight meets active dialogue across systems and stakeholders.</p>
                  </div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className={`px-8 py-5 bg-white text-black hover:${t.bg} hover:scale-105 font-bold text-sm rounded-lg shadow-xl transition-all duration-300 cursor-pointer text-center`}>
                      Join Our Mailing List
                    </div>
                    <div className="px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 font-bold text-sm rounded-lg transition-all duration-300 cursor-pointer text-center">
                      Partner With Us
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* 13. Enhanced Detailed Footer */}
          <footer className="bg-[#f0f2f5] pt-[220px] pb-12 relative z-0">
            <div className="absolute inset-0 bg-[radial-gradient(#7e848e22_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>
            
            {/* Social Proof Strip */}
            <div className="w-full max-w-[96rem] mx-auto px-[3%] mb-16 relative z-10">
               <div className="border-y border-[#7e848e]/10 py-8 flex flex-wrap gap-8 justify-between items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  {['MINISTRY OF POWER', 'CERC', 'GRID CONTROLLER OF INDIA', 'CEA', 'POSOCO'].map((logo, i) => (
                    <span key={i} className="text-sm md:text-base font-black tracking-widest text-gray-600">{logo}</span>
                  ))}
               </div>
            </div>

            <div className="w-full max-w-[96rem] mx-auto px-[3%] relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                
                {/* Brand Column */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#3376c6] rounded-xl flex items-center justify-center shadow-lg">
                       <span className="text-white font-bold text-lg">IIT</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900 tracking-tight leading-none">CoE RA</span>
                      <span className="text-[10px] font-bold text-[#7e848e] tracking-widest uppercase mt-1">Regulatory Affairs</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#7e848e] leading-relaxed max-w-sm font-medium">
                    A collaborative initiative driving excellence in India's power sector through evidence-based research, systemic frameworks, and stakeholder dialogue.
                  </p>
                  <div className="flex gap-3 mt-2">
                     {['LinkedIn', 'Twitter', 'YouTube'].map(social => (
                       <div key={social} className="px-4 py-2 rounded-lg bg-white border border-[#7e848e]/20 hover:border-[#3376c6] hover:text-[#3376c6] text-xs font-bold text-gray-600 transition-colors cursor-pointer shadow-sm">
                         {social}
                       </div>
                     ))}
                  </div>
                </div>

                {/* Links Columns */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Initiatives</span>
                  {['Research Hub', 'Policy Archive', 'Data Analytics', 'Regulatory Sandboxes'].map((link) => (
                    <span key={link} className="text-sm text-[#7e848e] hover:text-[#3376c6] cursor-pointer transition-colors font-medium">{link}</span>
                  ))}
                </div>

                <div className="lg:col-span-2 flex flex-col gap-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">About Us</span>
                  {['Vision & Mandate', 'Leadership', 'Annual Reports', 'Careers & Fellowships'].map((link) => (
                    <span key={link} className="text-sm text-[#7e848e] hover:text-[#3376c6] cursor-pointer transition-colors font-medium">{link}</span>
                  ))}
                </div>

                {/* Contact Column */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Contact & Address</span>
                  <div className="flex flex-col gap-1 text-sm text-[#7e848e] font-medium">
                    <p>Department of Energy Science & Engineering,</p>
                    <p>Block V, IIT Delhi,</p>
                    <p>Hauz Khas, New Delhi - 110016</p>
                  </div>
                  <a href="mailto:contact@coera.iitd.ac.in" className="text-sm font-bold text-[#3376c6] hover:underline mt-2">contact@coera.iitd.ac.in</a>
                </div>

              </div>

              {/* Copyright Strip */}
              <div className="border-t border-[#7e848e]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <span className="text-xs font-semibold text-[#7e848e]">© 2026 IIT Delhi Centre of Excellence RA. All rights reserved.</span>
                <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-[#7e848e]">
                  <span className="hover:text-gray-900 cursor-pointer transition-colors">Privacy Policy</span>
                  <span className="hover:text-gray-900 cursor-pointer transition-colors">Terms of Service</span>
                  <span className="hover:text-gray-900 cursor-pointer transition-colors">Accessibility</span>
                </div>
              </div>
            </div>
          </footer>
          
        </div>
      </div>
    </>
  );
};

export default function App() {
  const [version, setVersion] = useState('v1');
  
  return (
    <VersionContext.Provider value={version}>
      {/* V1 / V2 Theme Switcher (Pill at Bottom Right) */}
      <div className="fixed bottom-6 right-6 lg:right-12 z-[10000] bg-white p-1.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200 flex font-sans">
        <button 
          onClick={() => setVersion('v1')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${version === 'v1' ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          V1
        </button>
        <button 
          onClick={() => setVersion('v2')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${version === 'v2' ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          V2
        </button>
      </div>

      {/* Main Application Content */}
      <AppContent />
    </VersionContext.Provider>
  );
}
