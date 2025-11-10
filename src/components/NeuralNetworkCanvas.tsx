import { useEffect, useRef, memo } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

interface NeuralNetworkCanvasProps {
  nodeCount?: number;
  className?: string;
}

/**
 * Memoized neural network canvas animation
 * Separated for better performance and reusability
 */
export const NeuralNetworkCanvas = memo(function NeuralNetworkCanvas({ 
  nodeCount = 20, // Reduced default for better performance
  className = ""
}: NeuralNetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationFrameRef = useRef<number>();
  const dimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
      const rect = canvas.getBoundingClientRect();
      dimensionsRef.current.width = rect.width;
      dimensionsRef.current.height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    // Initialize nodes
    if (nodesRef.current.length === 0) {
      const initialNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.15, // Reduced speed
        vy: (Math.random() - 0.5) * 0.15,
        connections: [],
      }));

      // Create connections
      initialNodes.forEach((node, i) => {
        initialNodes.forEach((other, j) => {
          if (i !== j && node.connections.length < 3) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 30) {
              node.connections.push(j);
            }
          }
        });
      });

      nodesRef.current = initialNodes;
    }

    // Animation loop with FPS throttling
    let lastFrameTime = performance.now();
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;
      
      if (elapsed < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = currentTime - (elapsed % frameInterval);

      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > 100) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(100, node.x));
        }
        if (node.y < 0 || node.y > 100) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(100, node.y));
        }

        // Draw connections
        ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
        ctx.lineWidth = 0.5;
        node.connections.forEach((connId) => {
          const connNode = nodesRef.current[connId];
          if (!connNode) return;
          ctx.beginPath();
          ctx.moveTo((node.x / 100) * width, (node.y / 100) * height);
          ctx.lineTo((connNode.x / 100) * width, (connNode.y / 100) * height);
          ctx.stroke();
        });

        // Draw node
        ctx.fillStyle = "rgba(59, 130, 246, 0.25)";
        ctx.beginPath();
        ctx.arc((node.x / 100) * width, (node.y / 100) * height, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Handle resize with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 100);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [nodeCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
});
