"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

// Warm, tapas-inspired palette.
const COLORS = [
  "#E07A5F",
  "#F2CC8F",
  "#81B29A",
  "#E63946",
  "#F4A261",
  "#2A9D8F",
  "#E76F51",
  "#3D405B",
  "#F6BD60",
  "#84A59D",
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

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Drip shapes in until the pile is built, then stop.
    const maxShapes = Math.min(70, Math.floor(width / 16));
    let count = 0;
    const spawnTimer = window.setInterval(() => {
      spawnShape();
      count += 1;
      if (count >= maxShapes) window.clearInterval(spawnTimer);
    }, 220);

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
