// LessonCard component - no date-fns imports needed here
import { LessonInstance } from '../lib/supabase'
import './LessonCard.css'

interface LessonCardProps {
  lesson: LessonInstance
  onStatusChange: (id: string, status: 'scheduled' | 'paid' | 'cancelled') => void
  onDelete: (id: string) => void
}

export default function LessonCard({ lesson, onStatusChange, onDelete }: LessonCardProps) {
  const teacher = lesson.teachers as any
  const student = lesson.students as any
  const isPaid = lesson.status === 'paid'
  const isCancelled = lesson.status === 'cancelled'

  // Парсим время (формат HH:MM)
  let timeDisplay = lesson.time
  if (lesson.lessons?.time) {
    timeDisplay = lesson.lessons.time
  }

  return (
    <div className={`lesson-card ${isPaid ? 'paid' : ''} ${isCancelled ? 'cancelled' : ''}`}>
      <div className="lesson-time">{timeDisplay}</div>
      <div className="lesson-content">
        <div className="lesson-info">
          <div className="lesson-teacher">
            👨‍🏫 <strong>{teacher?.name || 'Учитель'}</strong>
          </div>
          <div className="lesson-student">
            👨‍🎓 {student?.name || 'Ученик'}
          </div>
          <div className="lesson-price">
            💰 {lesson.price} ₽
          </div>
        </div>
        <div className="lesson-actions">
          {!isCancelled && (
            <button
              className={`status-button paid-button ${isPaid ? 'active' : ''}`}
              onClick={() => onStatusChange(lesson.id, isPaid ? 'scheduled' : 'paid')}
            >
              {isPaid ? '✅ Оплачено' : 'Оплатить'}
            </button>
          )}
          <button
            className={`status-button cancel-button ${isCancelled ? 'active' : ''}`}
            onClick={() => onStatusChange(lesson.id, isCancelled ? 'scheduled' : 'cancelled')}
          >
            {isCancelled ? '❌ Отменено' : 'Отменить'}
          </button>
          <button
            className="delete-button"
            onClick={() => onDelete(lesson.id)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
