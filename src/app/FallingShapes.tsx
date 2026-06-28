"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

// Pixel-art color map (single chars used in the sprite grids below).
const PX: Record<string, string | null> = {
  ".": null,
  r: "#E63946", // tomato red
  o: "#FF6700", // orange
  y: "#F4D35E", // yellow
  g: "#8AC926", // lime
  G: "#6A994E", // olive green
  e: "#06A77D", // emerald
  t: "#2EC4B6", // turquoise
  p: "#D81159", // sangria pink
  w: "#FBF3E0", // cream
  b: "#3A86FF", // azulejo blue
};

// 8x8 byte-tapas sprites — olive, fried egg, gamba, pepper, heart, star.
const SPRITES: string[][] = [
  [
    "..GGGG..",
    ".GGGGGG.",
    ".GGrrGG.",
    ".GGrrGG.",
    ".GGGGGG.",
    ".GGGGGG.",
    "..GGGG..",
    "........",
  ],
  [
    "........",
    "..wwww..",
    ".wwwwww.",
    ".wwyyww.",
    ".wwyyww.",
    ".wwwwww.",
    "..wwww..",
    "........",
  ],
  [
    "...oo...",
    "..oooo..",
    ".oo..oo.",
    ".oo.....",
    ".oo.....",
    ".oooo...",
    "...ooo..",
    "....o...",
  ],
  [
    "....gg..",
    "...rg...",
    "..rr....",
    "..rr....",
    ".rr.....",
    ".rr.....",
    ".rr.....",
    "..r.....",
  ],
  [
    ".pp..pp.",
    "pppppppp",
    "pppppppp",
    "pppppppp",
    ".pppppp.",
    "..pppp..",
    "...pp...",
    "........",
  ],
  [
    "...yy...",
    "...yy...",
    ".yyyyyy.",
    "yyyyyyyy",
    ".yyyyyy.",
    ".yy..yy.",
    ".y....y.",
    "........",
  ],
];

const SPRITE_SIZE = 8;

// Render an 8x8 sprite grid to a data URL (one canvas pixel per grid cell).
function spriteToDataURL(rows: string[]): string {
  const c = document.createElement("canvas");
  c.width = SPRITE_SIZE;
  c.height = SPRITE_SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) return c.toDataURL();
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = PX[row[x]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  return c.toDataURL();
}

export default function FallingShapes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { Engine, Render, Runner, Bodies, Composite } = Matter;

    // Build each texture once so matter caches 6 textures, not hundreds.
    const SPRITE_URLS = SPRITES.map(spriteToDataURL);
    // Chunky pixels: integer scale factors (3x/4x/5x of the 8px sprite).
    const SCALES = [3, 4, 5];

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

    // Keep pixel art crisp — never smooth the scaled-up sprites.
    Matter.Events.on(render, "beforeRender", () => {
      render.context.imageSmoothingEnabled = false;
    });

    const WALL = 200;
    let bounds = makeBounds(width, height);
    Composite.add(engine.world, bounds);

    function makeBounds(w: number, h: number) {
      const opts = { isStatic: true, render: { visible: false } };
      return [
        Bodies.rectangle(w / 2, h + WALL / 2, w + WALL * 2, WALL, opts),
        Bodies.rectangle(-WALL / 2, h / 2, WALL, h * 3, opts),
        Bodies.rectangle(w + WALL / 2, h / 2, WALL, h * 3, opts),
      ];
    }

    function spawnShape() {
      const scale = SCALES[Math.floor(Math.random() * SCALES.length)];
      const size = SPRITE_SIZE * scale;
      const x = Math.random() * Math.max(40, width - 40) + 20;
      const idx = Math.floor(Math.random() * SPRITE_URLS.length);

      const body = Bodies.rectangle(x, -60, size, size, {
        restitution: 0.1,
        friction: 0.8,
        frictionStatic: 1,
        render: {
          sprite: {
            texture: SPRITE_URLS[idx],
            xScale: scale,
            yScale: scale,
          },
        },
      });
      // Lock rotation so tiles stack flat — clean 8-bit pile.
      Matter.Body.setInertia(body, Infinity);
      Composite.add(engine.world, body);
    }

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const maxShapes = Math.min(200, Math.floor((width * height) / 8000));
    let count = 0;
    const spawnTimer = window.setInterval(() => {
      spawnShape();
      spawnShape();
      count += 2;
      if (count >= maxShapes) window.clearInterval(spawnTimer);
    }, 140);

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
