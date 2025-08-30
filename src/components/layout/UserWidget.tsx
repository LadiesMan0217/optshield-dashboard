import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const UserWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  const displayName = user.display_name || user.email?.split('@')[0] || 'Usuário';
  const firstName = displayName.split(' ')[0];

  const handleClick = () => {
    navigate('/settings');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
    >
      {/* Avatar */}
      <div className="relative">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 group-hover:border-blue-400 transition-colors"
            onError={(e) => {
              // Fallback para iniciais se a imagem falhar ao carregar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const initialsDiv = document.createElement('div');
                initialsDiv.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-600 group-hover:border-blue-400 transition-colors';
                initialsDiv.textContent = getInitials(displayName);
                parent.appendChild(initialsDiv);
              }
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-600 group-hover:border-blue-400 transition-colors">
            {getInitials(displayName)}
          </div>
        )}
      </div>

      {/* Saudação e Nome */}
      <div className="text-left hidden sm:block">
        <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
          {getGreeting()},
        </p>
        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate max-w-[120px]">
          {firstName}
        </p>
      </div>
    </button>
  );
};

export default UserWidget;