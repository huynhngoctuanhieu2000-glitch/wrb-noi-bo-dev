/*
 * File: animation.ts
 * Chức năng: Các hook và class CSS cho hiệu ứng animation
 * Bao gồm hiệu ứng sao trên nền, quỹ đạo xoay của cờ, và các class Tailwind
 * Tạo cảm giác vũ trụ cho trang chọn ngôn ngữ
 */

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Interface định nghĩa cấu trúc của một ngôi sao
 */
interface Star { x: number; y: number; size: number; opacity: number; speed: number; }

/**
 * Hook tạo hiệu ứng trường sao trên canvas
 * @returns Ref của canvas element
 */
export const useStarfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let stars: Star[] = [];
    let animationId: number;

    /**
     * Khởi tạo mảng sao với vị trí ngẫu nhiên
     */
    const initStars = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          opacity: Math.random(),
          speed: Math.random() * 0.2 + 0.05,
        });
      }
    };
    /**
     * Hàm vẽ và cập nhật vị trí sao
     * Tạo hiệu ứng sao rơi từ trên xuống
     */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 210, ${star.opacity})`;
        ctx.fill();
        if (Math.random() > 0.95) star.opacity = Math.random();
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });
      animationId = requestAnimationFrame(draw);
    };
    initStars();
    draw();
    window.addEventListener("resize", initStars);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", initStars);
    };
  }, []);
  return canvasRef;
};

/**
 * Hook tạo hiệu ứng xoay quỹ đạo cho các cờ
 * @returns Góc xoay hiện tại (radian)
 */
export const useOrbitRotation = () => {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setRotation(prev => prev + 0.002);
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);
  return rotation;
};

/**
 * Object chứa các class CSS Tailwind cho animation và styling
 * Định nghĩa style cho wrapper, background, logo, cờ, greeting, etc.
 */
export const animClasses = {
  wrapper: "relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col",
  bgImage: "absolute inset-0 z-0 pointer-events-none w-full h-full object-cover object-center opacity-40 mix-blend-screen",

  logoTopContainer: "absolute top-[50px] w-full text-center z-20 px-4",
  logoTop: "mx-auto object-contain animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] w-[150px] md:w-[250px]",

  orbitContainer: "flex-1 relative flex items-center justify-center w-full h-full perspective-1000",

  centerLogoWrapper: (show: boolean) =>
    `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[100px] h-[100px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-700 overflow-hidden ${show ? 'scale-0 opacity-0' : 'scale-100'}`,

  greeting: (show: boolean) =>
    `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[50] font-luxury font-bold tracking-widest whitespace-nowrap transition-all duration-1000 text-[#EAB308] drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] text-center px-4 ${show ? "opacity-100 scale-100 text-[32px] md:text-[60px]" : "opacity-0 scale-50 pointer-events-none"}`,

  flagItem: "absolute top-1/2 left-1/2 z-30 cursor-pointer w-[60px] h-[60px] -ml-[30px] -mt-[30px] shrink-0 rounded-full aspect-square",

  flagInner: "w-full h-full rounded-full border-2 border-transparent bg-black/60 backdrop-blur-sm overflow-hidden hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.6)] hover:scale-125 transition-all duration-300 group shadow-lg box-border",

  flagImg: "w-full h-full object-cover",

  // --- CẬP NHẬT PHẦN FOOTER (MARQUEE) ---
  marqueeWrapper: "absolute bottom-[150px] left-0 w-full z-[90] overflow-hidden bg-black/30 backdrop-blur-sm py-2",
  marqueeTrack: "flex whitespace-nowrap w-max hover:[animation-play-state:paused]",
  marqueeText: "font-luxury text-[18px] md:text-[30px] text-[#EAB308] tracking-[0.23em] uppercase drop-shadow-md mx-2 flex items-center gap-4",

  // --- PHẦN 2: FOOTER TĨNH ---
  footer: "absolute bottom-[20px] left-0 w-full max-w-full text-center z-[100] px-0 font-luxury text-[15px] md:text-[20px] text-[#EAB308] tracking-[0.15em] uppercase drop-shadow-md"
};