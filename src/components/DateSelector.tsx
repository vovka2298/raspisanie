import { format, isToday } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import './DateSelector.css'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onToday: () => void
  onYesterday: () => void
  onTomorrow: () => void
}

export default function DateSelector({
  selectedDate,
  onDateChange,
  onToday,
  onYesterday,
  onTomorrow,
}: DateSelectorProps) {
  const formattedDate = format(selectedDate, 'd MMMM yyyy', { locale: ru })
  const dayOfWeek = format(selectedDate, 'EEEE', { locale: ru })
  const isSelectedToday = isToday(selectedDate)

  return (
    <div className="date-selector">
      <div className="date-nav">
        <button className="nav-button" onClick={onYesterday}>
          ← Вчера
        </button>
        <button className="nav-button today-button" onClick={onToday}>
          {isSelectedToday ? '✓ Сегодня' : 'Сегодня'}
        </button>
        <button className="nav-button" onClick={onTomorrow}>
          Завтра →
        </button>
      </div>
      <div className="date-display">
        <span className="date-icon">📅</span>
        <input
          type="date"
          className="date-input"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => {
            const newDate = new Date(e.target.value)
            onDateChange(newDate)
          }}
        />
        <div className="date-text">
          <div className="date-main">{formattedDate}</div>
          <div className="date-weekday">{dayOfWeek}</div>
        </div>
      </div>
    </div>
  )
}
