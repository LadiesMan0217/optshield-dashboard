import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { LoadingSpinner } from './ui';

const AuthConfirm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmAuth = async () => {
      try {
        const next = searchParams.get('next') || '/';
        const url = window.location.href;

        // Verificar se é um link de confirmação por email do Firebase
        if (isSignInWithEmailLink(auth, url)) {
          // Obter o email do localStorage (salvo durante o processo de login)
          let email = window.localStorage.getItem('emailForSignIn');
          
          if (!email) {
            // Se não tiver email salvo, solicitar ao usuário
            email = window.prompt('Por favor, forneça seu email para confirmação');
          }

          if (email) {
            try {
              await signInWithEmailLink(auth, email, url);
              // Limpar o email do localStorage
              window.localStorage.removeItem('emailForSignIn');
              console.log('Autenticação confirmada com sucesso');
              navigate(next, { replace: true });
            } catch (error: any) {
              console.error('Erro na confirmação:', error);
              setError('Erro ao confirmar autenticação. Tente novamente.');
            }
          } else {
            setError('Email é necessário para completar a autenticação.');
          }
        } else {
          setError('Parâmetros de confirmação não encontrados na URL.');
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro inesperado. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    confirmAuth();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner text="Confirmando autenticação..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Erro na Autenticação
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthConfirm;