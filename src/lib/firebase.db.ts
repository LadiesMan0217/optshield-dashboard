import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { format } from 'date-fns'
import { db } from './firebase'
import type { 
  UserProfile, 
  FirebaseTrade, 
  Deposit, 
  DailyNote,
  BalanceTransaction
} from './firebase.types'
import type { Trade } from '../types'
import { COLLECTIONS } from './firebase.types'

// Helper functions for database operations
export const firebaseDb = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    console.log('🔍 firebaseDb.getProfile: Iniciando busca para userId:', userId)
    try {
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId)
      const profileSnap = await getDoc(profileRef)
      
      if (profileSnap.exists()) {
        console.log('✅ firebaseDb.getProfile: Perfil encontrado:', profileSnap.data())
        return profileSnap.data() as UserProfile
      } else {
        console.log('❌ firebaseDb.getProfile: Perfil não encontrado')
        return null
      }
    } catch (error) {
      console.error('❌ firebaseDb.getProfile: Erro:', error)
      throw error
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    console.log('🔄 firebaseDb.updateProfile: Atualizando perfil:', userId, updates)
    try {
      const profileRef = doc(db, COLLECTIONS.PROFILES, userId)
      await updateDoc(profileRef, updates)
      
      // Buscar o perfil atualizado
      const updatedProfile = await this.getProfile(userId)
      if (!updatedProfile) {
        throw new Error('Perfil não encontrado após atualização')
      }
      
      console.log('✅ firebaseDb.updateProfile: Perfil atualizado com sucesso')
      return updatedProfile
    } catch (error) {
      console.error('❌ firebaseDb.updateProfile: Erro:', error)
      throw error
    }
  },

  // Trades
  async getTrades(userId: string, startDate?: string, endDate?: string): Promise<Trade[]> {
    console.log('🔍 firebaseDb.getTrades: Buscando trades para userId:', userId)
    try {
      let q = query(
        collection(db, COLLECTIONS.TRADES),
        where('userId', '==', userId)
      )
      
      // Aplicar filtros de data se fornecidos
      if (startDate) {
        q = query(q, where('date', '>=', new Date(startDate)))
      }
      
      if (endDate) {
        q = query(q, where('date', '<=', new Date(endDate)))
      }
      
      const querySnapshot = await getDocs(q)
      const trades: Trade[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const tradeDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
        trades.push({
          id: doc.id,
          userId: data.userId,
          date: format(tradeDate, 'yyyy-MM-dd'),
          payout: data.payout,
          entry_value: data.entry_value || data.entryValue || 0,
          result: data.result,
          profitLoss: data.profitLoss,
          tradeType: data.tradeType,
          level: data.level,
          createdAt: format(tradeDate, 'yyyy-MM-dd')
        } as any)
      })
      
      // Ordenar por data localmente
      trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      console.log(`✅ firebaseDb.getTrades: ${trades.length} trades encontrados`)
      return trades
    } catch (error) {
      console.error('❌ firebaseDb.getTrades: Erro:', error)
      throw error
    }
  },

  async addTrade(tradeData: Omit<FirebaseTrade, 'id' | 'createdAt'>): Promise<Trade> {
    console.log('➕ firebaseDb.addTrade: Adicionando trade:', tradeData)
    try {
      const newTrade = {
        ...tradeData,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, COLLECTIONS.TRADES), newTrade)
      
      // Buscar o trade criado
      const tradeSnap = await getDoc(docRef)
      if (!tradeSnap.exists()) {
        throw new Error('Trade não encontrado após criação')
      }
      
      const data = tradeSnap.data()
      const tradeDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
      const trade: Trade = {
        id: docRef.id,
        userId: data.userId,
        date: format(tradeDate, 'yyyy-MM-dd'),
        payout: data.payout,
        entry_value: data.entry_value || data.entryValue || 0,
        result: data.result,
        profitLoss: data.profitLoss,
        tradeType: data.tradeType,
        level: data.level,
        createdAt: format(tradeDate, 'yyyy-MM-dd')
      } as any
      
      console.log('✅ firebaseDb.addTrade: Trade criado com sucesso:', trade.id)
      return trade
    } catch (error) {
      console.error('❌ firebaseDb.addTrade: Erro:', error)
      throw error
    }
  },

  async updateTrade(id: string, updates: Partial<Omit<FirebaseTrade, 'id' | 'createdAt'>>): Promise<Trade> {
    console.log('🔄 firebaseDb.updateTrade: Atualizando trade:', id, updates)
    try {
      const tradeRef = doc(db, COLLECTIONS.TRADES, id)
      await updateDoc(tradeRef, updates)
      
      // Buscar o trade atualizado
      const tradeSnap = await getDoc(tradeRef)
      if (!tradeSnap.exists()) {
        throw new Error('Trade não encontrado após atualização')
      }
      
      const data = tradeSnap.data()
      const tradeDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
      const trade: Trade = {
        id: tradeSnap.id,
        userId: data.userId,
        date: format(tradeDate, 'yyyy-MM-dd'),
        payout: data.payout,
        entry_value: data.entry_value || data.entryValue || 0,
        result: data.result,
        profitLoss: data.profitLoss,
        tradeType: data.tradeType,
        level: data.level,
        createdAt: format(tradeDate, 'yyyy-MM-dd')
      } as any
      
      console.log('✅ firebaseDb.updateTrade: Trade atualizado com sucesso')
      return trade
    } catch (error) {
      console.error('❌ firebaseDb.updateTrade: Erro:', error)
      throw error
    }
  },

  async deleteTrade(id: string): Promise<void> {
    console.log('🗑️ firebaseDb.deleteTrade: Deletando trade:', id)
    try {
      const tradeRef = doc(db, COLLECTIONS.TRADES, id)
      await deleteDoc(tradeRef)
      console.log('✅ firebaseDb.deleteTrade: Trade deletado com sucesso')
    } catch (error) {
      console.error('❌ firebaseDb.deleteTrade: Erro:', error)
      throw error
    }
  },

  // Deposits
  async getDeposits(userId: string): Promise<Deposit[]> {
    console.log('🔍 firebaseDb.getDeposits: Buscando depósitos para userId:', userId)
    try {
      const q = query(
        collection(db, COLLECTIONS.DEPOSITS),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      const deposits: Deposit[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        deposits.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        } as Deposit)
      })
      
      // Ordenar por data localmente
      deposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      console.log(`✅ firebaseDb.getDeposits: ${deposits.length} depósitos encontrados`)
      return deposits
    } catch (error) {
      console.error('❌ firebaseDb.getDeposits: Erro:', error)
      throw error
    }
  },

  async addDeposit(depositData: Omit<Deposit, 'id' | 'createdAt'>): Promise<Deposit> {
    console.log('➕ firebaseDb.addDeposit: Adicionando depósito:', depositData)
    try {
      const newDeposit = {
        ...depositData,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, COLLECTIONS.DEPOSITS), newDeposit)
      
      // Buscar o depósito criado
      const depositSnap = await getDoc(docRef)
      if (!depositSnap.exists()) {
        throw new Error('Depósito não encontrado após criação')
      }
      
      const data = depositSnap.data()
      const deposit: Deposit = {
        id: docRef.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as Deposit
      
      console.log('✅ firebaseDb.addDeposit: Depósito criado com sucesso:', deposit.id)
      return deposit
    } catch (error) {
      console.error('❌ firebaseDb.addDeposit: Erro:', error)
      throw error
    }
  },

  async updateDeposit(id: string, updates: Partial<Omit<Deposit, 'id' | 'createdAt'>>): Promise<Deposit> {
    console.log('🔄 firebaseDb.updateDeposit: Atualizando depósito:', id, updates)
    try {
      const depositRef = doc(db, COLLECTIONS.DEPOSITS, id)
      await updateDoc(depositRef, updates)
      
      // Buscar o depósito atualizado
      const depositSnap = await getDoc(depositRef)
      if (!depositSnap.exists()) {
        throw new Error('Depósito não encontrado após atualização')
      }
      
      const data = depositSnap.data()
      const deposit: Deposit = {
        id: depositSnap.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as Deposit
      
      console.log('✅ firebaseDb.updateDeposit: Depósito atualizado com sucesso')
      return deposit
    } catch (error) {
      console.error('❌ firebaseDb.updateDeposit: Erro:', error)
      throw error
    }
  },

  async deleteDeposit(id: string): Promise<void> {
    console.log('🗑️ firebaseDb.deleteDeposit: Deletando depósito:', id)
    try {
      const depositRef = doc(db, COLLECTIONS.DEPOSITS, id)
      await deleteDoc(depositRef)
      console.log('✅ firebaseDb.deleteDeposit: Depósito deletado com sucesso')
    } catch (error) {
      console.error('❌ firebaseDb.deleteDeposit: Erro:', error)
      throw error
    }
  },

  // Daily Notes
  async getNotes(userId: string): Promise<DailyNote[]> {
    console.log('🔍 firebaseDb.getNotes: Buscando notas para userId:', userId)
    try {
      const q = query(
        collection(db, COLLECTIONS.DAILY_NOTES),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      const notes: DailyNote[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        notes.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        } as DailyNote)
      })
      
      // Ordenar por data localmente
      notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      console.log(`✅ firebaseDb.getNotes: ${notes.length} notas encontradas`)
      return notes
    } catch (error) {
      console.error('❌ firebaseDb.getNotes: Erro:', error)
      throw error
    }
  },

  async addNote(noteData: Omit<DailyNote, 'id' | 'createdAt'>): Promise<DailyNote> {
    console.log('➕ firebaseDb.addNote: Adicionando nota:', noteData)
    try {
      // Verificar se já existe uma nota para esta data
      const existingNoteQuery = query(
        collection(db, COLLECTIONS.DAILY_NOTES),
        where('userId', '==', noteData.userId),
        where('date', '==', noteData.date)
      )
      
      const existingNotes = await getDocs(existingNoteQuery)
      
      if (!existingNotes.empty) {
        // Atualizar nota existente
        const existingDoc = existingNotes.docs[0]
        await updateDoc(existingDoc.ref, {
          content: noteData.content
        })
        
        const updatedSnap = await getDoc(existingDoc.ref)
        const data = updatedSnap.data()!
        
        return {
          id: updatedSnap.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        } as DailyNote
      } else {
        // Criar nova nota
        const newNote = {
          ...noteData,
          createdAt: serverTimestamp()
        }
        
        const docRef = await addDoc(collection(db, COLLECTIONS.DAILY_NOTES), newNote)
        
        // Buscar a nota criada
        const noteSnap = await getDoc(docRef)
        if (!noteSnap.exists()) {
          throw new Error('Nota não encontrada após criação')
        }
        
        const data = noteSnap.data()
        const note: DailyNote = {
          id: docRef.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        } as DailyNote
        
        console.log('✅ firebaseDb.addNote: Nota criada com sucesso:', note.id)
        return note
      }
    } catch (error) {
      console.error('❌ firebaseDb.addNote: Erro:', error)
      throw error
    }
  },

  async deleteNote(userId: string, date: Date): Promise<void> {
    console.log('🗑️ firebaseDb.deleteNote: Deletando nota para data:', date)
    try {
      const q = query(
        collection(db, COLLECTIONS.DAILY_NOTES),
        where('userId', '==', userId),
        where('date', '==', date)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const noteDoc = querySnapshot.docs[0]
        await deleteDoc(noteDoc.ref)
        console.log('✅ firebaseDb.deleteNote: Nota deletada com sucesso')
      } else {
        console.log('⚠️ firebaseDb.deleteNote: Nota não encontrada para deletar')
      }
    } catch (error) {
      console.error('❌ firebaseDb.deleteNote: Erro:', error)
      throw error
    }
  },

  // Balance Transactions (Deposits and Withdrawals)
  async addBalanceTransaction(transactionData: Omit<BalanceTransaction, 'id' | 'createdAt'>): Promise<BalanceTransaction> {
    console.log('➕ firebaseDb.addBalanceTransaction: Adicionando transação:', transactionData)
    try {
      const newTransaction = {
        ...transactionData,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, COLLECTIONS.BALANCE_TRANSACTIONS), newTransaction)
      
      // Buscar a transação criada
      const transactionSnap = await getDoc(docRef)
      if (!transactionSnap.exists()) {
        throw new Error('Transação não encontrada após criação')
      }
      
      const data = transactionSnap.data()
      const transaction: BalanceTransaction = {
        id: docRef.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as BalanceTransaction
      
      console.log('✅ firebaseDb.addBalanceTransaction: Transação criada com sucesso:', transaction.id)
      return transaction
    } catch (error) {
      console.error('❌ firebaseDb.addBalanceTransaction: Erro:', error)
      throw error
    }
  },

  async getBalanceTransactions(userId: string): Promise<BalanceTransaction[]> {
    console.log('🔍 firebaseDb.getBalanceTransactions: Buscando transações para userId:', userId)
    try {
      const q = query(
        collection(db, COLLECTIONS.BALANCE_TRANSACTIONS),
        where('userId', '==', userId)
        // TODO: Adicionar orderBy('date', 'desc') após criar índice no Firebase Console
        // orderBy('date', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const transactions: BalanceTransaction[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        transactions.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        } as BalanceTransaction)
      })
      
      // Ordenar por data localmente como solução temporária
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      console.log(`✅ firebaseDb.getBalanceTransactions: ${transactions.length} transações encontradas`)
      return transactions
    } catch (error) {
      console.error('❌ firebaseDb.getBalanceTransactions: Erro:', error)
      throw error
    }
  },

  async updateBalanceTransaction(id: string, updates: Partial<Omit<BalanceTransaction, 'id' | 'createdAt'>>): Promise<BalanceTransaction> {
    console.log('🔄 firebaseDb.updateBalanceTransaction: Atualizando transação:', id, updates)
    try {
      const transactionRef = doc(db, COLLECTIONS.BALANCE_TRANSACTIONS, id)
      await updateDoc(transactionRef, updates)
      
      // Buscar a transação atualizada
      const transactionSnap = await getDoc(transactionRef)
      if (!transactionSnap.exists()) {
        throw new Error('Transação não encontrada após atualização')
      }
      
      const data = transactionSnap.data()
      const transaction: BalanceTransaction = {
        id: transactionSnap.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as BalanceTransaction
      
      console.log('✅ firebaseDb.updateBalanceTransaction: Transação atualizada com sucesso')
      return transaction
    } catch (error) {
      console.error('❌ firebaseDb.updateBalanceTransaction: Erro:', error)
      throw error
    }
  },

  async deleteBalanceTransaction(id: string): Promise<void> {
    console.log('🗑️ firebaseDb.deleteBalanceTransaction: Deletando transação:', id)
    try {
      const transactionRef = doc(db, COLLECTIONS.BALANCE_TRANSACTIONS, id)
      await deleteDoc(transactionRef)
      console.log('✅ firebaseDb.deleteBalanceTransaction: Transação deletada com sucesso')
    } catch (error) {
      console.error('❌ firebaseDb.deleteBalanceTransaction: Erro:', error)
      throw error
    }
  }
}

// Exportar como db para compatibilidade