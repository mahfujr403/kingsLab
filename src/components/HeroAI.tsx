import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { ArrowRight, Brain, Cpu, Network, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import { mockHeroData, mockSiteSettings } from "../lib/mock-data";
import type { HeroData } from "../lib/types";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

export function HeroAI() {
  // Fetch lab info for title and tagline
  const { data: labInfo, error: labInfoError } = useApi(
    () => api.getLabInfo(),
    {
      lab_name: mockSiteSettings.lab_name,
      tagline: mockSiteSettings.tagline,
      description: mockSiteSettings.about,
      email: "",
      phone: "",
      address: "",
    },
    "lab-info" // Add cache key to prevent repeated requests
  );

  // Fetch hero data for background and stats
  const { data: heroData, error: heroError } = useApi<HeroData>(
    () => api.getHeroData(),
    mockHeroData,
    "hero-data" // Add cache key to prevent repeated requests
  );

  // Data sources are now loaded via useApi with proper caching
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Create floating data points effect - Reduced for performance
  const floatingData = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    duration: 3 + Math.random() * 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  // Binary rain effect - Reduced for performance
  const binaryColumns = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.4,
    duration: 6 + Math.random() * 3,
    x: (i / 8) * 100,
  }));

  // Use ref instead of state for animation data to prevent re-renders
  const nodesRef = useRef<Node[]>([]);

  // Initialize neural network nodes
  useEffect(() => {
    const nodeCount = 20; // Reduced from 30 for better performance
    const initialNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.15, // Reduced speed
      vy: (Math.random() - 0.5) * 0.15,
      connections: [],
    }));

    // Create connections between nearby nodes
    initialNodes.forEach((node, i) => {
      initialNodes.forEach((other, j) => {
        if (i !== j) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 30 && node.connections.length < 3) {
            node.connections.push(j);
          }
        }
      });
    });

    nodesRef.current = initialNodes;
  }, []);

  // Animate neural network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Cache canvas dimensions to avoid forced reflows
    let canvasWidth = 0;
    let canvasHeight = 0;

    const updateCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvasWidth = canvas.offsetWidth;
      canvasHeight = canvas.offsetHeight;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvas();
    
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvas, 100); // Debounce resize
    };
    window.addEventListener("resize", handleResize);

    let animationFrame: number;
    let lastFrameTime = performance.now();
    const targetFPS = 30; // Reduced from 60 for better performance
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (!ctx) return;

      const elapsed = currentTime - lastFrameTime;
      
      // Throttle to target FPS
      if (elapsed < frameInterval) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = currentTime - (elapsed % frameInterval);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Update node positions using ref (no state updates!)
      const currentNodes = nodesRef.current;
      
      currentNodes.forEach((node) => {
        // Update positions
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= 100) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(100, node.x));
        }
        if (node.y <= 0 || node.y >= 100) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(100, node.y));
        }
      });

      // Draw connections
      ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
      ctx.lineWidth = 1;

      currentNodes.forEach((node) => {
        node.connections.forEach((connId) => {
          const connNode = currentNodes[connId];
          if (!connNode) return;
          
          const x1 = (node.x / 100) * canvasWidth;
          const y1 = (node.y / 100) * canvasHeight;
          const x2 = (connNode.x / 100) * canvasWidth;
          const y2 = (connNode.y / 100) * canvasHeight;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      });

      // Draw nodes
      currentNodes.forEach((node) => {
        const x = (node.x / 100) * canvasWidth;
        const y = (node.y / 100) * canvasHeight;

        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
        gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.fillStyle = "rgba(139, 92, 246, 0.7)";
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  if (!heroData || !labInfo) return null;

  // Use lab info for title and description, hero data for fallback
  const displayTitle = labInfo.lab_name || heroData.subtitle;
  const displayTagline = labInfo.tagline || heroData.title;
  const displayDescription = labInfo.description || heroData.description;

  return (
    <section
      id="home"
      aria-label="Hero section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-gray-950"
      onMouseMove={handleMouseMove}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Neural Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-40 dark:opacity-30"
        aria-hidden="true"
      />

      {/* Binary Rain Effect */}
      {binaryColumns.map((col) => (
        <motion.div
          key={col.id}
          className="absolute top-0 h-full pointer-events-none will-change-transform"
          style={{ left: `${col.x}%` }}
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{
            duration: col.duration,
            delay: col.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          aria-hidden="true"
        >
          <div className="flex flex-col gap-4 text-blue-500/15 dark:text-blue-400/8 text-xs">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i}>
                {i % 2 === 0 ? "101" : "010"}
              </span>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Animated Floating Data Points */}
      {floatingData.map((point) => (
        <motion.div
          key={point.id}
          className="absolute w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-[1px]"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: point.duration,
            delay: point.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      ))}

      {/* Radial Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" aria-hidden="true" />

      {/* Floating Code Snippets */}
      <motion.div
        className="absolute top-20 left-10 bg-white/5 dark:bg-gray-900/20 backdrop-blur-md rounded-lg p-4 border border-blue-500/10 dark:border-blue-400/10 hidden lg:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <code className="text-xs text-blue-600/40 dark:text-blue-400/30">
          <div>model.compile(</div>
          <div className="pl-4">optimizer='adam',</div>
          <div className="pl-4">loss='categorical_crossentropy'</div>
          <div>)</div>
        </code>
      </motion.div>

      <motion.div
        className="absolute top-40 right-10 bg-white/5 dark:bg-gray-900/20 backdrop-blur-md rounded-lg p-4 border border-purple-500/10 dark:border-purple-400/10 hidden lg:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden="true"
      >
        <code className="text-xs text-purple-600/40 dark:text-purple-400/30">
          <div>neural_network = Sequential([</div>
          <div className="pl-4">Dense(128, activation='relu'),</div>
          <div className="pl-4">Dropout(0.2),</div>
          <div className="pl-4">Dense(10, activation='softmax')</div>
          <div>])</div>
        </code>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 bg-white/5 dark:bg-gray-900/20 backdrop-blur-md rounded-lg p-4 border border-pink-500/10 dark:border-pink-400/10 hidden lg:block"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden="true"
      >
        <code className="text-xs text-pink-600/40 dark:text-pink-400/30">
          <div>transformer = Transformer(</div>
          <div className="pl-4">d_model=512,</div>
          <div className="pl-4">num_heads=8,</div>
          <div className="pl-4">num_layers=6</div>
          <div>)</div>
        </code>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Icon Row */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-6 mb-8"
          >
            {[
              { Icon: Brain, delay: 0 },
              { Icon: Cpu, delay: 0.1 },
              { Icon: Network, delay: 0.2 },
              { Icon: Sparkles, delay: 0.3 },
            ].map(({ Icon, delay }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg blur-lg opacity-30" />
                <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="block text-blue-600 dark:text-blue-400 mb-2">
              {displayTitle}
            </span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {displayTagline}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8"
          >
            {displayDescription}
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12"
          >
            {[
              { value: "50+", label: "Research Papers" },
              { value: "15+", label: "Team Members" },
              { value: "10+", label: "Active Projects" },
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-md p-6 rounded-xl border border-blue-200/50 dark:border-blue-900/50">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20"
              onClick={() => scrollToSection("research")}
            >
              {heroData.cta_primary_text || "Explore Research"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 backdrop-blur-sm bg-white/60 dark:bg-gray-900/60"
              onClick={() => scrollToSection("team")}
            >
              <Brain className="h-4 w-4" />
              {heroData.cta_secondary_text || "Meet the Team"}
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600"
            >
              <span className="text-xs uppercase tracking-wider">Scroll</span>
              <div className="w-6 h-10 border-2 border-current rounded-full p-1">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1 h-3 bg-current rounded-full mx-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Spotlight Effect */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"
        style={{
          x: useTransform(mouseX, [0, 1000], [-50, 50]),
          y: useTransform(mouseY, [0, 1000], [-50, 50]),
          left: "50%",
          top: "50%",
        }}
        aria-hidden="true"
      />
    </section>
  );
}