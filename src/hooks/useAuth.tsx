import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { User as AppUser } from '../types'
import type { UserProfile } from '../lib/firebase.types'
import { COLLECTIONS } from '../lib/firebase.types'

interface AuthContextType {
  user: AppUser | null
  session: FirebaseUser | null
  loading: boolean
  accountBlocked: { isBlocked: boolean; message: string }
  clearAccountBlocked: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AppUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [accountBlocked, setAccountBlocked] = useState({ isBlocked: false, message: '' })
  const [profileCache, setProfileCache] = useState<Map<string, { profile: AppUser; timestamp: number }>>(new Map())
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000 // 5 minutos em millisegundos

  const clearAccountBlocked = () => {
    setAccountBlocked({ isBlocked: false, message: '' })
  }

  useEffect(() => {
    console.log('🔍 useAuth: Iniciando verificação de autenticação Firebase...')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('📋 useAuth: Estado de auth mudou:', firebaseUser ? 'Usuário logado' : 'Sem sessão')
      setSession(firebaseUser)
      
      if (firebaseUser) {
        console.log('👤 useAuth: Carregando perfil do usuário:', firebaseUser.uid)
        await loadUserProfile(firebaseUser)
      } else {
        console.log('❌ useAuth: Sem usuário, finalizando loading')
        setUser(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    console.log('🔄 loadUserProfile: Iniciando carregamento para:', firebaseUser.uid)
    
    // Verificar cache primeiro com expiração
    const cachedEntry = profileCache.get(firebaseUser.uid)
    if (cachedEntry) {
      const isExpired = Date.now() - cachedEntry.timestamp > CACHE_EXPIRY_TIME
      if (!isExpired) {
        console.log('⚡ loadUserProfile: Usando perfil do cache (válido)')
        setUser(cachedEntry.profile)
        setLoading(false)
        return
      } else {
        console.log('⏰ loadUserProfile: Cache expirado, removendo entrada')
        setProfileCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(firebaseUser.uid)
          return newCache
        })
      }
    }
    
    try {
      console.log('🔍 loadUserProfile: Buscando perfil no Firestore...')
      const profileRef = doc(db, COLLECTIONS.PROFILES, firebaseUser.uid)
      const profileSnap = await getDoc(profileRef)
      
      if (profileSnap.exists()) {
        console.log('✅ loadUserProfile: Perfil encontrado:', profileSnap.data())
        const profileData = profileSnap.data() as UserProfile
        const userProfile: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          display_name: profileData.displayName,
          avatar_url: profileData.avatarUrl,
          currency: profileData.currency as 'BRL' | 'USD' | 'EUR',
          initial_balance: profileData.initialBalance,
          hide_balance: profileData.hideBalance,
          created_at: profileData.createdAt.toDate().toISOString(),
        }
        
        // Salvar no cache com timestamp
        setProfileCache(prev => {
          const newCache = new Map(prev)
          newCache.set(firebaseUser.uid, {
            profile: userProfile,
            timestamp: Date.now()
          })
          return newCache
        })
        setUser(userProfile)
        console.log('👤 loadUserProfile: Usuário definido com sucesso')
      } else {
        // Criar perfil se não existir
        console.log('🆕 loadUserProfile: Criando novo perfil...')
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || null,
          avatarUrl: firebaseUser.photoURL || null,
          currency: 'BRL',
          initialBalance: 0,
          hideBalance: false,
          createdAt: serverTimestamp() as any,
        }
        
        await setDoc(profileRef, newProfile)
        console.log('✅ loadUserProfile: Perfil criado com sucesso')
        
        const userProfile: AppUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          display_name: newProfile.displayName,
          avatar_url: newProfile.avatarUrl,
          currency: newProfile.currency as 'BRL' | 'USD' | 'EUR',
          initial_balance: newProfile.initialBalance,
          hide_balance: newProfile.hideBalance,
          created_at: new Date().toISOString(),
        }
        
        // Salvar no cache com timestamp
        setProfileCache(prev => {
          const newCache = new Map(prev)
          newCache.set(firebaseUser.uid, {
            profile: userProfile,
            timestamp: Date.now()
          })
          return newCache
        })
        setUser(userProfile)
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      setAccountBlocked({
        isBlocked: true,
        message: 'Erro ao carregar perfil do usuário. Tente novamente.'
      })
    } finally {
      console.log('🏁 loadUserProfile: Finalizando loading')
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      setLoading(false)
      // Traduzir mensagens de erro do Firebase para português
      let errorMessage = 'Erro ao fazer login'
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Email ou senha incorretos'
          break
        case 'auth/user-disabled':
          errorMessage = 'Conta desabilitada. Entre em contato com o suporte'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        default:
          errorMessage = error.message || 'Erro ao fazer login'
      }
      
      const customError = new Error(errorMessage)
      throw customError
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true)
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Atualizar o displayName no Firebase Auth
      await updateFirebaseProfile(firebaseUser, {
        displayName: displayName
      })
      
    } catch (error: any) {
      setLoading(false)
      // Traduzir mensagens de erro do Firebase para português
      let errorMessage = 'Erro ao criar conta'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está cadastrado'
          break
        case 'auth/weak-password':
          errorMessage = 'A senha deve ter pelo menos 6 caracteres'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email inválido'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Cadastro temporariamente desabilitado'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet'
          break
        default:
          errorMessage = error.message || 'Erro ao criar conta'
      }
      
      const customError = new Error(errorMessage)
      throw customError
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await firebaseSignOut(auth)
      // Limpar cache ao fazer logout
      setProfileCache(new Map())
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) throw new Error('No user logged in')
    
    const profileRef = doc(db, COLLECTIONS.PROFILES, user.id)
    const firebaseUpdates: Partial<UserProfile> = {}
    
    if (updates.display_name !== undefined) firebaseUpdates.displayName = updates.display_name
    if (updates.avatar_url !== undefined) firebaseUpdates.avatarUrl = updates.avatar_url
    if (updates.currency !== undefined) firebaseUpdates.currency = updates.currency
    if (updates.initial_balance !== undefined) firebaseUpdates.initialBalance = updates.initial_balance
    if (updates.hide_balance !== undefined) firebaseUpdates.hideBalance = updates.hide_balance
    
    await updateDoc(profileRef, firebaseUpdates)
    
    setUser({
      ...user,
      ...updates,
    })
  }

  const value = {
    user,
    session,
    loading,
    accountBlocked,
    clearAccountBlocked,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}