import { useState, useEffect } from 'react'
import { supabase, Student } from '../lib/supabase'
import './TeachersTab.css' // Используем те же стили

export default function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name')

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Ошибка загрузки учеников:', error)
      alert('Ошибка загрузки учеников')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!newStudentName.trim()) {
      alert('Введите имя ученика')
      return
    }

    try {
      const { error } = await supabase
        .from('students')
        .insert({ name: newStudentName.trim() })

      if (error) throw error

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }

      setNewStudentName('')
      setShowAddModal(false)
      loadStudents()
    } catch (error) {
      console.error('Ошибка добавления ученика:', error)
      alert('Ошибка добавления ученика')
    }
  }

  async function handleDelete(id: string) {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(
        'Вы уверены, что хотите удалить этого ученика? Это также удалит все связанные занятия.',
        async (confirmed) => {
          if (confirmed) {
            try {
              // Сначала удаляем занятия
              await supabase.from('lessons').delete().eq('student_id', id)
              await supabase.from('lesson_instances').delete().eq('student_id', id)
              
              // Затем удаляем ученика
              const { error } = await supabase.from('students').delete().eq('id', id)

              if (error) throw error

              if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
              }

              loadStudents()
            } catch (error) {
              console.error('Ошибка удаления ученика:', error)
              alert('Ошибка удаления ученика')
            }
          }
        }
      )
    }
  }

  return (
    <div className="students-tab">
      <div className="tab-header">
        <h1>Ученики</h1>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          ➕ Добавить
        </button>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <p>Ученики не добавлены</p>
        </div>
      ) : (
        <div className="students-list">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-info">
                <span className="student-icon">👨‍🎓</span>
                <span className="student-name">{student.name}</span>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(student.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Добавить ученика</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Имя ученика</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Петр Петров"
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button className="cancel-button" onClick={() => setShowAddModal(false)}>
                  Отмена
                </button>
                <button className="submit-button" onClick={handleAdd}>
                  Добавить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
