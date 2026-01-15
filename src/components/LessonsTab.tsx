import { useState, useEffect } from 'react'
import { format, addDays, subDays, startOfDay, isToday, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { supabase, LessonInstance, Teacher, Student } from '../lib/supabase'
import LessonCard from './LessonCard'
import DateSelector from './DateSelector'
import AddLessonModal from './AddLessonModal'
import './LessonsTab.css'

export default function LessonsTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [lessons, setLessons] = useState<LessonInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadLessons()
  }, [selectedDate])

  async function loadLessons() {
    setLoading(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    
    try {
      // Получаем все занятия на выбранную дату
      const { data, error } = await supabase
        .from('lesson_instances')
        .select(`
          *,
          teachers:teacher_id (*),
          students:student_id (*),
          lessons:lesson_id (*)
        `)
        .eq('date', dateStr)
        .order('time', { ascending: true })

      if (error) throw error

      // Если занятий нет, создаем их на основе шаблонов расписания
      if (!data || data.length === 0) {
        await createLessonsForDate(dateStr)
        // Повторно загружаем после создания
        const { data: newData, error: newError } = await supabase
          .from('lesson_instances')
          .select(`
            *,
            teachers:teacher_id (*),
            students:student_id (*),
            lessons:lesson_id (*)
          `)
          .eq('date', dateStr)
          .order('time', { ascending: true })

        if (newError) throw newError
        setLessons(newData || [])
      } else {
        setLessons(data || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки занятий:', error)
      alert('Ошибка загрузки занятий')
    } finally {
      setLoading(false)
    }
  }

  async function createLessonsForDate(dateStr: string) {
    // Получаем день недели (0 = воскресенье, 1 = понедельник, ..., 6 = суббота)
    const date = parseISO(dateStr)
    const dayOfWeek = date.getDay()

    // Получаем все шаблоны расписания для этого дня недели
    const { data: templates, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('day_of_week', dayOfWeek)

    if (error) {
      console.error('Ошибка загрузки шаблонов:', error)
      return
    }

    if (!templates || templates.length === 0) return

    // Создаем занятия для каждого шаблона
    const instances = templates.map(template => ({
      lesson_id: template.id,
      date: dateStr,
      status: 'scheduled' as const,
      teacher_id: template.teacher_id,
      student_id: template.student_id,
      price: template.price,
      time: template.time,
    }))

    // Вставляем все занятия одной транзакцией
    const { error: insertError } = await supabase
      .from('lesson_instances')
      .insert(instances)
      .select()

    if (insertError) {
      console.error('Ошибка создания занятий:', insertError)
    }
  }

  async function handleStatusChange(instanceId: string, newStatus: 'scheduled' | 'paid' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('lesson_instances')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', instanceId)

      if (error) throw error

      // Тактильная отдача
      if (window.Telegram?.WebApp?.HapticFeedback) {
        if (newStatus === 'paid') {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
        } else if (newStatus === 'cancelled') {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning')
        }
      }

      loadLessons()
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
      alert('Ошибка обновления статуса')
    }
  }

  async function handleDeleteInstance(instanceId: string) {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(
        'Вы уверены, что хотите удалить это занятие?',
        async (confirmed) => {
          if (confirmed) {
            try {
              const { error } = await supabase
                .from('lesson_instances')
                .delete()
                .eq('id', instanceId)

              if (error) throw error

              if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
              }

              loadLessons()
            } catch (error) {
              console.error('Ошибка удаления занятия:', error)
              alert('Ошибка удаления занятия')
            }
          }
        }
      )
    }
  }

  const goToToday = () => setSelectedDate(new Date())
  const goToYesterday = () => setSelectedDate(subDays(selectedDate, 1))
  const goToTomorrow = () => setSelectedDate(addDays(selectedDate, 1))

  return (
    <div className="lessons-tab">
      <div className="lessons-header">
        <h1>Расписание занятий</h1>
        <button 
          className="add-lesson-button"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Добавить
        </button>
      </div>

      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onToday={goToToday}
        onYesterday={goToYesterday}
        onTomorrow={goToTomorrow}
      />

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : lessons.length === 0 ? (
        <div className="empty-state">
          <p>На {format(selectedDate, 'd MMMM yyyy', { locale: ru })} занятий нет</p>
        </div>
      ) : (
        <div className="lessons-list">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteInstance}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddLessonModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadLessons()
          }}
        />
      )}
    </div>
  )
}
