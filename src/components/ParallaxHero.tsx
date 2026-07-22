"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const shirtY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const shirtScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 w-full h-full">
        <Image
          src="/home-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-black/50" />

      <div className="relative z-10 mx-auto flex h-full max-w-max flex-col items-center justify-center gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-16">
        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center md:items-start md:w-1/2 md:text-left"
        >
          <motion.h1 variants={itemVariants} className="display-lg-mobile mt-6 text-white md:display-lg md:mt-8">
            Where Craft<br />Meets Creativity
          </motion.h1>

          <motion.p variants={itemVariants} className="body-lg mt-5 max-w-xl text-white/65 md:mt-6">
            Premium essentials built for those who value substance over excess.
          </motion.p>
          <motion.div variants={itemVariants} className="flex justify-between items-center gap-6" >
            <Link
              href="/shop"
              className="label-caps mt-10 bg-white px-10 py-3.5 tracking-widest rounded-xl text-[#1c1b1b] transition-all hover:bg-inverse-surface hover:text-surface hover:cursor-pointer hover:scale-105 md:mt-12"
            >
              Explore Collection
            </Link>

            <Link
              href="/shop/plain-t-shirt"
              className="label-caps mt-10 bg-[#1c1b1b] px-10 py-3.5 tracking-widest rounded-xl text-white transition-all hover:opacity-90 hover:cursor-pointer hover:scale-105 md:mt-12"
            >
              Customize Now
            </Link>
          </motion.div>
        </motion.div>

        <div className="flex items-start justify-around md:w-2/3">
          <motion.div 
            style={{ y: shirtY, scale: shirtScale }}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="animate-float relative h-60 w-52 md:h-125 md:w-125"
          >
            <Image
              src="/home-t-shirt.png"
              alt="Premium t-shirt"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
