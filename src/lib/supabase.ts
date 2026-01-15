import { createClient } from '@supabase/supabase-js'

// Типы для Vite env
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Эти переменные должны быть установлены в Vercel Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для базы данных
export interface Teacher {
  id: string
  name: string
  created_at: string
}

export interface Student {
  id: string
  name: string
  created_at: string
}

export interface Lesson {
  id: string
  teacher_id: string
  student_id: string
  day_of_week: number // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
  time: string // Формат HH:MM
  price: number
  created_at: string
  teachers?: Teacher
  students?: Student
}

export interface LessonInstance {
  id: string
  lesson_id: string
  date: string // YYYY-MM-DD
  status: 'scheduled' | 'paid' | 'cancelled'
  teacher_id: string
  student_id: string
  price: number
  time: string // Формат HH:MM или HH:MM:SS
  created_at: string
  updated_at: string
  teachers?: Teacher
  students?: Student
  lessons?: Lesson
}
