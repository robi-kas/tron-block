
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Tooltip = ({ content, children }: { content: string, children: React.ReactNode }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/20 whitespace-nowrap z-40 pointer-events-none shadow-2xl"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
