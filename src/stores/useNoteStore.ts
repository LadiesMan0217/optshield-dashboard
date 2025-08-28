import { create } from 'zustand'
import { firebaseDb } from '../lib/firebase.db'
import type { DailyNote, NoteState } from '../types'
import { useAuth } from '../hooks/useAuth'

interface NoteStore extends NoteState {
  fetchNotes: (userId: string) => Promise<void>
  reset: () => void
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  loading: false,

  fetchNotes: async (userId: string) => {
    if (!userId) {
      console.warn('fetchNotes: userId é obrigatório')
      return
    }
    set({ loading: true })
    try {
      const notes = await firebaseDb.getNotes(userId)
      set({ notes, loading: false })
    } catch (error) {
      console.error('Erro ao buscar notas:', error)
      set({ loading: false })
    }
  },

  addNote: async (noteData) => {
    set({ loading: true })
    try {
      const userId = get().notes[0]?.userId
      if (!userId) throw new Error('User not authenticated')

      const newNote = await firebaseDb.addNote({
        ...noteData,
        userId: userId,
      })

      set((state) => {
        const existingNoteIndex = state.notes.findIndex(
          (note) => note.date === noteData.date
        )
        
        if (existingNoteIndex >= 0) {
          // Update existing note
          const updatedNotes = [...state.notes]
          updatedNotes[existingNoteIndex] = newNote
          return { notes: updatedNotes, loading: false }
        } else {
          // Add new note
          return { notes: [newNote, ...state.notes], loading: false }
        }
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  updateNote: async (date, content) => {
    set({ loading: true })
    try {
      const userId = get().notes[0]?.userId
      if (!userId) throw new Error('User not authenticated')

      const updatedNote = await firebaseDb.addNote({
        date,
        content,
        userId: userId,
      })

      set((state) => {
        const noteIndex = state.notes.findIndex((note) => note.date === date)
        if (noteIndex >= 0) {
          const updatedNotes = [...state.notes]
          updatedNotes[noteIndex] = updatedNote
          return { notes: updatedNotes, loading: false }
        }
        return { notes: [updatedNote, ...state.notes], loading: false }
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  deleteNote: async (date) => {
    set({ loading: true })
    try {
      const userId = get().notes[0]?.userId
      if (!userId) throw new Error('User not authenticated')

      await firebaseDb.deleteNote(userId, date)
      
      set((state) => ({
        notes: state.notes.filter((note) => note.date !== date),
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  getNoteByDate: (date) => {
    return get().notes.find((note) => note.date === date) || null
  },

  reset: () => {
    set({ notes: [], loading: false })
  },
}))

// Hook to use note store with auth context
export const useNotesWithAuth = () => {
  const { user } = useAuth()
  const store = useNoteStore()

  const fetchNotes = async () => {
    if (!user) {
      console.warn('useNotesWithAuth: Tentativa de buscar notas sem usuário autenticado')
      return
    }
    return store.fetchNotes(user.id)
  }

  const addNote = async (noteData: Omit<DailyNote, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated')
    return firebaseDb.addNote({
      ...noteData,
      userId: user.id,
    }).then((newNote) => {
      useNoteStore.setState((state) => {
        const existingNoteIndex = state.notes.findIndex(
          (note) => note.date === noteData.date
        )
        
        if (existingNoteIndex >= 0) {
          const updatedNotes = [...state.notes]
          updatedNotes[existingNoteIndex] = newNote
          return { notes: updatedNotes }
        } else {
          return { notes: [newNote, ...state.notes] }
        }
      })
      return newNote
    })
  }

  const updateNote = async (date: string, content: string) => {
    if (!user) throw new Error('User not authenticated')
    return store.updateNote(date, content)
  }

  const deleteNote = async (date: string) => {
    if (!user) throw new Error('User not authenticated')
    return store.deleteNote(date)
  }

  return {
    ...store,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
  }
}