"use client";

import React, { ElementType } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Infosys-inspired smooth easing curve:
 * High-end deceleration curve that starts swiftly and settles with enterprise precision.
 */
export const ENTERPRISE_EASING = [0.16, 1, 0.3, 1] as const;

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  staggerIndex?: number;
  staggerDelay?: number;
  viewportAmount?: number | "some" | "all";
  once?: boolean;
  scale?: number;
  [key: string]: any;
}

/**
 * ScrollReveal:
 * Reveals content smoothly with a fade-in and subtle directional translation
 * as soon as it enters the viewport.
 */
export function ScrollReveal({
  children,
  className,
  as = "div",
  direction = "up",
  delay = 0,
  duration = 0.65,
  distance = 24,
  staggerIndex,
  staggerDelay = 0.08,
  viewportAmount = 0.12,
  once = true,
  scale = 1,
  ...props
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();

  // If staggerIndex is provided, auto-calculate delay
  const computedDelay = staggerIndex !== undefined ? delay + staggerIndex * staggerDelay : delay;

  // Determine directional offset
  let initialX = 0;
  let initialY = 0;

  if (direction === "up") initialY = distance;
  else if (direction === "down") initialY = -distance;
  else if (direction === "left") initialX = distance;
  else if (direction === "right") initialX = -distance;

  const Component = (motion as any)[as as string] || motion.div;

  if (prefersReduced) {
    return (
      <Component className={cn(className)} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial={{
        opacity: 0,
        x: initialX,
        y: initialY,
        scale: scale !== 1 ? scale : 1,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once,
        amount: viewportAmount,
        margin: "-20px 0px",
      }}
      transition={{
        duration,
        delay: computedDelay,
        ease: ENTERPRISE_EASING,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * ScrollStaggerContainer & ScrollStaggerItem:
 * Orchestrates a group of child elements to reveal with coordinated stagger timing.
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: ENTERPRISE_EASING,
    },
  },
};

export function ScrollStaggerContainer({
  children,
  className,
  as = "div",
  viewportAmount = 0.1,
  once = true,
  staggerDelay = 0.09,
  initialDelay = 0.05,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  viewportAmount?: number | "some" | "all";
  once?: boolean;
  staggerDelay?: number;
  initialDelay?: number;
  [key: string]: any;
}) {
  const prefersReduced = useReducedMotion();
  const Component = (motion as any)[as as string] || motion.div;

  if (prefersReduced) {
    return (
      <Component className={cn(className)} {...props}>
        {children}
      </Component>
    );
  }

  const customContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: viewportAmount, margin: "-20px 0px" }}
      variants={customContainerVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function ScrollStaggerItem({
  children,
  className,
  as = "div",
  variants = itemVariants,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  variants?: Variants;
  [key: string]: any;
}) {
  const prefersReduced = useReducedMotion();
  const Component = (motion as any)[as as string] || motion.div;

  if (prefersReduced) {
    return (
      <Component className={cn(className)} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component variants={variants} className={cn(className)} {...props}>
      {children}
    </Component>
  );
}

export default ScrollReveal;
