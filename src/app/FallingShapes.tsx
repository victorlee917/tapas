"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

// Vibrant Spanish-tapas palette — saffron, paprika, tomato, olive,
// Mediterranean turquoise, sangria.
const COLORS = [
  "#FF6700", // bright orange
  "#F9A620", // saffron
  "#F4D35E", // warm yellow
  "#E63946", // tomato red
  "#D81159", // sangria pink
  "#06A77D", // emerald
  "#2EC4B6", // turquoise
  "#8AC926", // lime
  "#F95738", // coral
  "#3A86FF", // azulejo blue
];

export default function FallingShapes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced-motion preferences.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Composite,
      Common,
    } = Matter;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const engine = Engine.create();
    engine.gravity.y = 1;

    const render = Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    // Invisible bounds: ground + side walls so shapes pile inside the hero.
    const WALL = 200;
    let bounds = makeBounds(width, height);
    Composite.add(engine.world, bounds);

    function makeBounds(w: number, h: number) {
      const opts = { isStatic: true, render: { visible: false } };
      return [
        // ground
        Bodies.rectangle(w / 2, h + WALL / 2, w + WALL * 2, WALL, opts),
        // left wall
        Bodies.rectangle(-WALL / 2, h / 2, WALL, h * 3, opts),
        // right wall
        Bodies.rectangle(w + WALL / 2, h / 2, WALL, h * 3, opts),
      ];
    }

    // Spawn a single random tapas shape just above the top edge.
    function spawnShape() {
      const x = Common.random(40, Math.max(60, width - 40));
      const y = -60;
      const color = COLORS[Math.floor(Common.random(0, COLORS.length))];
      const size = Common.random(16, 44);
      const common = {
        restitution: 0.45, // a little bounce — "톡톡"
        friction: 0.4,
        frictionAir: 0.01,
        render: { fillStyle: color, lineWidth: 0 },
      };

      const kind = Math.floor(Common.random(0, 4));
      let body: Matter.Body;
      switch (kind) {
        case 0: // circle
          body = Bodies.circle(x, y, size / 2, common);
          break;
        case 1: // rounded square (tile / bowl-ish)
          body = Bodies.rectangle(x, y, size, size, {
            ...common,
            chamfer: { radius: size * 0.25 },
          });
          break;
        case 2: // triangle
          body = Bodies.polygon(x, y, 3, size / 2, common);
          break;
        default: // hexagon (little bowl)
          body = Bodies.polygon(x, y, 6, size / 2, common);
          break;
      }

      Matter.Body.setAngularVelocity(body, Common.random(-0.15, 0.15));
      Composite.add(engine.world, body);
    }

    // A small tile of random monochrome noise, reused as a repeating pattern.
    function makeGrain() {
      const g = document.createElement("canvas");
      g.width = 140;
      g.height = 140;
      const gctx = g.getContext("2d");
      if (!gctx) return g;
      const img = gctx.createImageData(g.width, g.height);
      for (let i = 0; i < img.data.length; i += 4) {
        // Bias bright so grain adds sparkle/texture without dulling color.
        const v = 170 + Math.floor(Math.random() * 85);
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        // Sparse, low-alpha speckles so it reads as grain, not static.
        img.data[i + 3] = Math.random() < 0.4 ? Math.floor(Math.random() * 90) : 0;
      }
      gctx.putImageData(img, 0, 0);
      return g;
    }
    const grain = makeGrain();

    // After each frame, dust grain over the shape pixels only.
    Matter.Events.on(render, "afterRender", () => {
      const ctx = render.context;
      const pattern = ctx.createPattern(grain, "repeat");
      if (!pattern) return;
      ctx.save();
      ctx.globalCompositeOperation = "source-atop"; // only over drawn shapes
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, render.options.width || 0, render.options.height || 0);
      ctx.restore();
    });

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Drip shapes in until the pile is built, then stop.
    // Scale with area so larger screens get a deeper pile.
    const maxShapes = Math.min(220, Math.floor((width * height) / 7000));
    let count = 0;
    const spawnTimer = window.setInterval(() => {
      // Drop a couple at a time so the pile builds up faster.
      spawnShape();
      spawnShape();
      count += 2;
      if (count >= maxShapes) window.clearInterval(spawnTimer);
    }, 130);

    // Keep bounds in sync with container size.
    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      render.canvas.width = width * (window.devicePixelRatio || 1);
      render.canvas.height = height * (window.devicePixelRatio || 1);
      render.options.width = width;
      render.options.height = height;
      Render.setPixelRatio(render, window.devicePixelRatio || 1);
      Composite.remove(engine.world, bounds);
      bounds = makeBounds(width, height);
      Composite.add(engine.world, bounds);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      window.clearInterval(spawnTimer);
      ro.disconnect();
      Render.stop(render);
      Runner.stop(runner);
      render.canvas.remove();
      render.textures = {};
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
