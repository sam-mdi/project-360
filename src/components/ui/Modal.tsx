import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  fullScreen?: boolean;
}

export function Modal({ open, onClose, title, children, className, fullScreen }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={cn(
              'relative bg-white rounded-2xl shadow-2xl z-10 flex flex-col',
              fullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-md mx-4 max-h-[90vh]',
              className
            )}
            initial={{ opacity: 0, y: fullScreen ? 0 : 40, scale: fullScreen ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: fullScreen ? 0 : 40, scale: fullScreen ? 1 : 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                  <X size={16} className="text-stone-500" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-stone-100 transition-colors z-10"
              >
                <X size={16} className="text-stone-500" />
              </button>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
