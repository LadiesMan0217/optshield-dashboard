import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, LoadingSpinner } from '../components/ui';
import { validateEmail } from '../utils';

// Google Icon Component
const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.444-11.297-8.168l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.487,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export const Login: React.FC = () => {
  const { user, signIn, signInWithGoogle, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';

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

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao fazer login com Google' });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (loading && !isSubmitting && !isGoogleSubmitting) {
    return <LoadingSpinner text="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="relative bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10"></div>
          
          <div className="relative z-10 p-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-neutral-200 to-white bg-clip-text text-transparent tracking-wide">
                OptiShield
              </h1>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-4"></div>
              <p className="text-neutral-300 font-medium tracking-wide">
                Acesse sua conta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                icon={Mail}
                placeholder="seu@email.com"
              />

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                icon={Lock}
                placeholder="••••••••"
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-300">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />

              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm text-center backdrop-blur-sm">
                  {errors.submit}
                </div>
              )}

              <Button
                type="submit"
                variant="premium"
                size="lg"
                fullWidth
                loading={isSubmitting}
                icon={LogIn}
                className="py-4 rounded-xl"
              >
                Entrar
              </Button>
            </form>

            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-neutral-700"></div>
              <span className="flex-shrink mx-4 text-neutral-400 text-sm">Ou continue com</span>
              <div className="flex-grow border-t border-neutral-700"></div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleGoogleSignIn}
              loading={isGoogleSubmitting}
              icon={GoogleIcon}
              className="bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700"
            >
              Login com Google
            </Button>

            <div className="mt-8 text-center">
              <p className="text-neutral-400">
                Não tem uma conta?{' '}
                <Link to="/signup" className="text-white font-semibold hover:text-neutral-200 transition-colors duration-300">
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
