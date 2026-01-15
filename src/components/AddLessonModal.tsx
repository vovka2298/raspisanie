import { useState, useEffect } from 'react'
import { supabase, Teacher, Student } from '../lib/supabase'
import './AddLessonModal.css'

interface AddLessonModalProps {
  onClose: () => void
  onSuccess: () => void
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Воскресенье' },
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
]

export default function AddLessonModal({ onClose, onSuccess }: AddLessonModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState(1) // Понедельник по умолчанию
  const [time, setTime] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [teachersRes, studentsRes] = await Promise.all([
        supabase.from('teachers').select('*').order('name'),
        supabase.from('students').select('*').order('name'),
      ])

      if (teachersRes.error) throw teachersRes.error
      if (studentsRes.error) throw studentsRes.error

      setTeachers(teachersRes.data || [])
      setStudents(studentsRes.data || [])

      if (teachersRes.data && teachersRes.data.length > 0) {
        setSelectedTeacher(teachersRes.data[0].id)
      }
      if (studentsRes.data && studentsRes.data.length > 0) {
        setSelectedStudent(studentsRes.data[0].id)
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      alert('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedTeacher || !selectedStudent || !time || !price) {
      alert('Заполните все поля')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('lessons').insert({
        teacher_id: selectedTeacher,
        student_id: selectedStudent,
        day_of_week: dayOfWeek,
        time: time,
        price: parseFloat(price),
      })

      if (error) throw error

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }

      onSuccess()
    } catch (error) {
      console.error('Ошибка создания занятия:', error)
      alert('Ошибка создания занятия')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить занятие</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Учитель</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              required
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ученик</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>День недели</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
              required
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Время (HH:MM)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Стоимость (₽)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1000"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="submit-button" disabled={saving}>
              {saving ? 'Сохранение...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
