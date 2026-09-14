export const slamVariants = {
  initial: { opacity: 0, y: -120, scale: 1.2 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      y: { type: 'spring', stiffness: 800, damping: 20, mass: 1.2 },
      scale: { type: 'spring', stiffness: 600, damping: 15, delay: 0.05 },
      opacity: { duration: 0.1 },
    },
  },
};

export const normalVariants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const exitAnimation = {
  opacity: 0,
  scale: 0.8,
  filter: 'blur(4px)',
  transition: { duration: 0.25 },
};

export const layoutTransition = {
  layout: { type: 'spring', stiffness: 500, damping: 35 },
} as const;
