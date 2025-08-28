import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick?: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 bg-neutral-900/50 backdrop-blur-lg border border-neutral-700 hover:bg-neutral-800/70 text-white rounded-full p-4 shadow-2xl shadow-black/25 hover:shadow-black/40 transition-all duration-300 transform hover:scale-110 z-50"
      title="Adicionar"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};