import { useState, useEffect } from 'react'
import { supabase, Teacher } from '../lib/supabase'
import './TeachersTab.css'

export default function TeachersTab() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTeacherName, setNewTeacherName] = useState('')

  useEffect(() => {
    loadTeachers()
  }, [])

  async function loadTeachers() {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name')

      if (error) throw error
      setTeachers(data || [])
    } catch (error) {
      console.error('Ошибка загрузки учителей:', error)
      alert('Ошибка загрузки учителей')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!newTeacherName.trim()) {
      alert('Введите имя учителя')
      return
    }

    try {
      const { error } = await supabase
        .from('teachers')
        .insert({ name: newTeacherName.trim() })

      if (error) throw error

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }

      setNewTeacherName('')
      setShowAddModal(false)
      loadTeachers()
    } catch (error) {
      console.error('Ошибка добавления учителя:', error)
      alert('Ошибка добавления учителя')
    }
  }

  async function handleDelete(id: string) {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(
        'Вы уверены, что хотите удалить этого учителя? Это также удалит все связанные занятия.',
        async (confirmed) => {
          if (confirmed) {
            try {
              // Сначала удаляем занятия
              await supabase.from('lessons').delete().eq('teacher_id', id)
              await supabase.from('lesson_instances').delete().eq('teacher_id', id)
              
              // Затем удаляем учителя
              const { error } = await supabase.from('teachers').delete().eq('id', id)

              if (error) throw error

              if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
              }

              loadTeachers()
            } catch (error) {
              console.error('Ошибка удаления учителя:', error)
              alert('Ошибка удаления учителя')
            }
          }
        }
      )
    }
  }

  return (
    <div className="teachers-tab">
      <div className="tab-header">
        <h1>Учителя</h1>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          ➕ Добавить
        </button>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : teachers.length === 0 ? (
        <div className="empty-state">
          <p>Учителя не добавлены</p>
        </div>
      ) : (
        <div className="teachers-list">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="teacher-card">
              <div className="teacher-info">
                <span className="teacher-icon">👨‍🏫</span>
                <span className="teacher-name">{teacher.name}</span>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(teacher.id)}
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
              <h2>Добавить учителя</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Имя учителя</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Иван Иванов"
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
