import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import TabBar from './components/TabBar'
import TeachersTab from './components/TeachersTab'
import StudentsTab from './components/StudentsTab'
import LessonsTab from './components/LessonsTab'
import StatisticsTab from './components/StatisticsTab'
import './App.css'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            username?: string
          }
        }
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        BackButton: {
          isVisible: boolean
          show(): void
          hide(): void
          onClick(callback: () => void): void
          offClick(callback: () => void): void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText(text: string): void
          onClick(callback: () => void): void
          offClick(callback: () => void): void
          show(): void
          hide(): void
          enable(): void
          disable(): void
          showProgress(leaveActive?: boolean): void
          hideProgress(): void
          setParams(params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
          }): void
        }
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
          notificationOccurred(type: 'error' | 'success' | 'warning'): void
          selectionChanged(): void
        }
        ready(): void
        expand(): void
        close(): void
        sendData(data: string): void
        openLink(url: string, options?: { try_instant_view?: boolean }): void
        openTelegramLink(url: string): void
        openInvoice(url: string, callback?: (status: string) => void): void
        showPopup(params: {
          title?: string
          message: string
          buttons?: Array<{
            id?: string
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
            text: string
          }>
        }, callback?: (id: string) => void): void
        showAlert(message: string, callback?: () => void): void
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void
        showScanQrPopup(params: {
          text?: string
        }, callback?: (data: string) => void): void
        closeScanQrPopup(): void
        readTextFromClipboard(callback?: (text: string) => void): void
        requestWriteAccess(callback?: (granted: boolean) => void): void
        requestContact(callback?: (granted: boolean) => void): void
      }
    }
  }
}

type Tab = 'lessons' | 'teachers' | 'students' | 'statistics'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('lessons')

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      
      // Настройка цветовой схемы из Telegram
      const themeParams = window.Telegram.WebApp.themeParams
      if (themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color)
      }
      if (themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color)
      }
      if (themeParams.secondary_bg_color) {
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color)
      }
    }

    // Проверка подключения к Supabase
    void supabase
      .from('teachers')
      .select('count')
      .limit(1)
      .then(() => {
        console.log('Supabase подключен успешно')
      })
      .catch((error: unknown) => {
        console.error('Ошибка подключения к Supabase:', error)
      })
  }, [])

  return (
    <div className="app">
      <div className="app-content">
        {activeTab === 'lessons' && <LessonsTab />}
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
