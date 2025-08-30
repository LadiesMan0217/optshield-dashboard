import React, { useState } from 'react';
import { ArrowLeft, User, Shield, TrendingUp, Copy, Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, LoadingSpinner } from '../components/ui';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile: updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  
  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Email modal states
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [showCurrentPasswordForEmail, setShowCurrentPasswordForEmail] = useState(false);
  
  // Password modal states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCopyUserId = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar ID:', error);
      }
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user || !displayName.trim()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      await updateUserProfile({ displayName: displayName.trim() });
      // Também atualizar no Firebase Auth se necessário
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      }
    } catch (error: any) {
      setErrors({ displayName: 'Erro ao atualizar nome. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!auth.currentUser || !newEmail.trim() || !currentPasswordForEmail.trim()) {
      setErrors({ email: 'Preencha todos os campos' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await updateEmail(auth.currentUser, newEmail.trim());
      setShowEmailModal(false);
      setNewEmail('');
      setCurrentPasswordForEmail('');
    } catch (error: any) {
      let errorMessage = 'Erro ao alterar e-mail';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Este e-mail já está em uso';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Faça login novamente para alterar o e-mail';
          break;
        default:
          errorMessage = error.message || 'Erro ao alterar e-mail';
      }
      
      setErrors({ email: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrors({ password: 'Preencha todos os campos' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrors({ password: 'As senhas não coincidem' });
      return;
    }
    
    if (newPassword.length < 6) {
      setErrors({ password: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await updatePassword(auth.currentUser, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      let errorMessage = 'Erro ao alterar senha';
      
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'A senha é muito fraca';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Faça login novamente para alterar a senha';
          break;
        default:
          errorMessage = error.message || 'Erro ao alterar senha';
      }
      
      setErrors({ password: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        <div className="space-y-8">
          {/* Seção Perfil */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Perfil</h2>
            </div>
            
            <div className="space-y-6">
              {/* Nome de Exibição */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome de Exibição
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpdateDisplayName}
                    disabled={loading || !displayName.trim() || displayName === user.displayName}
                    className="px-6"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Salvar'}
                  </Button>
                </div>
                {errors.displayName && (
                  <p className="text-red-400 text-sm mt-1">{errors.displayName}</p>
                )}
              </div>

              {/* ID de Usuário */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ID de Usuário (para Suporte)
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 font-mono text-sm">
                    {user.id}
                  </div>
                  <Button
                    onClick={handleCopyUserId}
                    variant="secondary"
                    className="px-4"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Segurança da Conta */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold">Segurança da Conta</h2>
            </div>
            
            <div className="space-y-4">
              {/* E-mail */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <h3 className="font-medium">E-mail</h3>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <Button
                  onClick={() => setShowEmailModal(true)}
                  variant="secondary"
                  size="sm"
                >
                  Alterar E-mail
                </Button>
              </div>

              {/* Senha */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <h3 className="font-medium">Senha</h3>
                  <p className="text-sm text-slate-400">••••••••</p>
                </div>
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="secondary"
                  size="sm"
                >
                  Alterar Senha
                </Button>
              </div>
            </div>
          </div>

          {/* Seção Gestão de Risco (Futura) */}
          <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold">Gestão de Risco</h2>
            </div>
            
            <div className="text-center py-8">
              <p className="text-slate-400 text-lg">Em breve</p>
              <p className="text-slate-500 text-sm mt-2">
                Defina metas de ganho e limites de perda diários
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="settings" />

      {/* Modal Alterar E-mail */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setNewEmail('');
          setCurrentPasswordForEmail('');
          setErrors({});
        }}
        title="Alterar E-mail"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Novo E-mail
            </label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novo@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <Input
                type={showCurrentPasswordForEmail ? 'text' : 'password'}
                value={currentPasswordForEmail}
                onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                placeholder="Sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPasswordForEmail(!showCurrentPasswordForEmail)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrentPasswordForEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowEmailModal(false);
                setNewEmail('');
                setCurrentPasswordForEmail('');
                setErrors({});
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateEmail}
              disabled={loading || !newEmail.trim() || !currentPasswordForEmail.trim()}
              className="flex-1"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Alterar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Alterar Senha */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setErrors({});
        }}
        title="Alterar Senha"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (mín. 6 caracteres)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setErrors({});
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={loading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              className="flex-1"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Alterar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;