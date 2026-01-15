import './TabBar.css'

type Tab = 'lessons' | 'teachers' | 'students' | 'statistics'

interface TabBarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'lessons' as Tab, label: 'Занятия', icon: '📅' },
    { id: 'teachers' as Tab, label: 'Учителя', icon: '👨‍🏫' },
    { id: 'students' as Tab, label: 'Ученики', icon: '👨‍🎓' },
    { id: 'statistics' as Tab, label: 'Статистика', icon: '📊' },
  ]

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => {
            onTabChange(tab.id)
            // Тактильная отдача для Telegram
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.selectionChanged()
            }
          }}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
