import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, LoadingSpinner } from '../components/ui';
import { validateEmail } from '../utils';

export const Login: React.FC = () => {
  const { user, signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await signIn(formData.email, formData.password);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao fazer login' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20"></div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/15 rounded-full animate-ping" style={{ animationDelay: '4s', animationDuration: '5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '7s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Premium Login Container */}
        <div className="relative bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10"></div>
          
          <div className="relative z-10 p-10">
            {/* Premium Logo */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-neutral-200 to-white bg-clip-text text-transparent tracking-wide">
                OptiShield
              </h1>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-4"></div>
              <p className="text-neutral-300 font-medium tracking-wide">
                Acesse sua conta premium
              </p>
            </div>

            {/* Premium Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              icon={Mail}
              iconPosition="left"
              placeholder="seu@email.com"
              fullWidth
            />

            {/* Password */}
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              icon={Lock}
              iconPosition="left"
              placeholder="••••••••"
              fullWidth
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm text-center backdrop-blur-sm">
                {errors.submit}
              </div>
            )}

            {/* Premium Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              icon={LogIn}
              iconPosition="left"
              className="bg-gradient-to-r from-white to-neutral-100 text-black font-bold py-4 rounded-xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              Entrar
            </Button>
            </form>

            {/* Premium Sign Up Link */}
            <div className="mt-8 text-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent mb-6"></div>
              <p className="text-neutral-400">
                Não tem uma conta?{' '}
                <Link
                  to="/signup"
                  className="text-white font-semibold hover:text-neutral-200 transition-colors duration-300 relative group"
                >
                  Criar conta
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-neutral-200 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </p>
            </div>
          </div>
          
          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};