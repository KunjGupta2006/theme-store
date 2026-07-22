"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function ParallaxBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Moves the image slightly opposite to scroll direction for a parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section ref={ref} className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden flex items-center justify-center">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-[140%] -top-[20%]">
        <Image
          src="/lifestyle-banner.png"
          alt="Lifestyle Banner"
          fill
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 text-center px-5 max-w-3xl">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="headline-lg md:headline-xl text-white"
        >
          Elevated Everyday
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="body-lg mt-4 text-white/80"
        >
          Timeless silhouettes designed to outlast the seasons.
        </motion.p>
      </div>
    </section>
  );
}
