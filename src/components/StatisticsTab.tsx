import { useState, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { supabase, LessonInstance } from '../lib/supabase'
import './StatisticsTab.css'

type Period = 'today' | 'week' | 'month' | 'year' | 'custom'

const TEACHER_PAYMENT = 600 // Оплата учителю за занятие

export default function StatisticsTab() {
  const [period, setPeriod] = useState<Period>('today')
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [stats, setStats] = useState({
    totalRevenue: 0,
    teacherPayments: 0,
    netProfit: 0,
    paidLessons: 0,
    cancelledLessons: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [period, startDate, endDate])

  async function loadStatistics() {
    setLoading(true)
    try {
      let dateStart: Date
      let dateEnd: Date = new Date()

      switch (period) {
        case 'today':
          dateStart = new Date()
          dateEnd = new Date()
          break
        case 'week':
          dateStart = startOfWeek(new Date(), { locale: ru })
          dateEnd = endOfWeek(new Date(), { locale: ru })
          break
        case 'month':
          dateStart = startOfMonth(new Date())
          dateEnd = endOfMonth(new Date())
          break
        case 'year':
          dateStart = startOfYear(new Date())
          dateEnd = endOfYear(new Date())
          break
        case 'custom':
          dateStart = new Date(startDate)
          dateEnd = new Date(endDate)
          break
      }

      const startStr = format(dateStart, 'yyyy-MM-dd')
      const endStr = format(dateEnd, 'yyyy-MM-dd')

      // Загружаем все оплаченные занятия за период
      const { data: paidLessons, error: paidError } = await supabase
        .from('lesson_instances')
        .select('price')
        .eq('status', 'paid')
        .gte('date', startStr)
        .lte('date', endStr)

      if (paidError) throw paidError

      // Загружаем отмененные занятия для статистики
      const { data: cancelledLessons, error: cancelledError } = await supabase
        .from('lesson_instances')
        .select('id')
        .eq('status', 'cancelled')
        .gte('date', startStr)
        .lte('date', endStr)

      if (cancelledError) throw cancelledError

      const totalRevenue = (paidLessons || []).reduce((sum, lesson) => sum + lesson.price, 0)
      const paidCount = paidLessons?.length || 0
      const teacherPayments = paidCount * TEACHER_PAYMENT
      const netProfit = totalRevenue - teacherPayments

      setStats({
        totalRevenue,
        teacherPayments,
        netProfit,
        paidLessons: paidCount,
        cancelledLessons: cancelledLessons?.length || 0,
      })
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
      alert('Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="statistics-tab">
      <h1>Статистика</h1>

      <div className="period-selector">
        <button
          className={`period-button ${period === 'today' ? 'active' : ''}`}
          onClick={() => setPeriod('today')}
        >
          Сегодня
        </button>
        <button
          className={`period-button ${period === 'week' ? 'active' : ''}`}
          onClick={() => setPeriod('week')}
        >
          Неделя
        </button>
        <button
          className={`period-button ${period === 'month' ? 'active' : ''}`}
          onClick={() => setPeriod('month')}
        >
          Месяц
        </button>
        <button
          className={`period-button ${period === 'year' ? 'active' : ''}`}
          onClick={() => setPeriod('year')}
        >
          Год
        </button>
        <button
          className={`period-button ${period === 'custom' ? 'active' : ''}`}
          onClick={() => setPeriod('custom')}
        >
          Период
        </button>
      </div>

      {period === 'custom' && (
        <div className="custom-date-selector">
          <div className="date-input-group">
            <label>От</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label>До</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Общий доход</div>
              <div className="stat-value">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>

          <div className="stat-card profit">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <div className="stat-label">Чистая прибыль</div>
              <div className="stat-value">{stats.netProfit.toLocaleString('ru-RU')} ₽</div>
              <div className="stat-note">
                (доход минус {TEACHER_PAYMENT}₽ учителю за каждое занятие)
              </div>
            </div>
          </div>

          <div className="stat-card payments">
            <div className="stat-icon">💸</div>
            <div className="stat-content">
              <div className="stat-label">Выплаты учителям</div>
              <div className="stat-value">{stats.teacherPayments.toLocaleString('ru-RU')} ₽</div>
              <div className="stat-note">
                {stats.paidLessons} занятий × {TEACHER_PAYMENT}₽
              </div>
            </div>
          </div>

          <div className="stat-card lessons">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Оплачено занятий</div>
              <div className="stat-value">{stats.paidLessons}</div>
            </div>
          </div>

          <div className="stat-card cancelled">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-label">Отменено занятий</div>
              <div className="stat-value">{stats.cancelledLessons}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
