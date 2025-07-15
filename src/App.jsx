import { useState, useEffect } from 'react'
import WeeklyPlanner from './components/WeeklyPlanner'
import CompletedTasks from './components/CompletedTasks'
import WeeklyStats from './components/WeeklyStats'
import WeekNavigation from './components/WeekNavigation'
import { useTheme } from './contexts/ThemeContext'

function App() {
  const { isDark, toggleTheme } = useTheme()
  
  const [weeklyData, setWeeklyData] = useState({
    monday: { tasks: [] },
    tuesday: { tasks: [] },
    wednesday: { tasks: [] },
    thursday: { tasks: [] },
    friday: { tasks: [] },
    saturday: { tasks: [] },
    sunday: { tasks: [] }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())

  // Load data from SQLite when week changes
  useEffect(() => {
    const loadData = async () => {
      try {
        if (window.electronAPI) {
          // Log DB path for debugging
          const debugInfo = await window.electronAPI.getDebugInfo()
          console.log('🔍 DEBUG INFO:', debugInfo)
          console.log('📁 DATABASE PATH:', debugInfo.dbPath)
          console.log('🎯 PORTABLE DIR:', debugInfo.portableDir)
          console.log('📄 PORTABLE FILE:', debugInfo.portableFile)
          console.log('🏠 CURRENT DIR:', debugInfo.cwd)
          console.log('💻 EXECUTABLE PATH:', debugInfo.execPath)
          console.log('📦 IS PACKAGED:', debugInfo.isPackaged)
          console.log('👤 USER DATA:', debugInfo.userData)
          
          const data = await window.electronAPI.getWeeklyDataByDate(currentWeekDate)
          setWeeklyData(data)
        }
      } catch (error) {
        console.error('Error loading weekly data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [currentWeekDate])

  const handleWeekChange = (newWeekDate) => {
    setCurrentWeekDate(newWeekDate)
    setIsLoading(true)
  }

  const updateDayData = async (day, data) => {
    // Update local state immediately for responsiveness
    setWeeklyData(prev => ({
      ...prev,
      [day]: data
    }))

    // Save to database
    try {
      if (window.electronAPI) {
        console.log('🔄 AUTOSAVE: Starting save for', day, 'with', data.tasks.length, 'tasks')
        // Save all tasks for this day, updating IDs for new tasks
        const updatedTasks = []
        for (const task of data.tasks) {
          console.log('💾 AUTOSAVE: Saving task:', { id: task.id, text: task.text, isNew: task.id >= 1000000000000 })
          const savedTask = await window.electronAPI.saveTask(day, task)
          console.log('✅ AUTOSAVE: Task saved:', { oldId: task.id, newId: savedTask.id, text: savedTask.text })
          updatedTasks.push(savedTask)
        }
        
        console.log('🎯 AUTOSAVE: All tasks saved, updating local state with', updatedTasks.length, 'tasks')
        // Update local state with real database IDs
        setWeeklyData(prev => ({
          ...prev,
          [day]: { ...data, tasks: updatedTasks }
        }))
        console.log('✨ AUTOSAVE: Complete for', day)
      } else {
        console.warn('⚠️ AUTOSAVE: electronAPI not available')
      }
    } catch (error) {
      console.error('❌ AUTOSAVE ERROR:', error)
      // Optionally revert local state on error
    }
  }

  const completedTasks = Object.entries(weeklyData).flatMap(([day, data]) => 
    data.tasks.filter(task => task.completed).map(task => ({
      ...task,
      day: day.charAt(0).toUpperCase() + day.slice(1),
      dayHours: task.hours // Use task hours, not day hours
    }))
  )

  const totalWeeklyHours = Object.values(weeklyData).reduce((sum, day) => {
    return sum + day.tasks.reduce((taskSum, task) => taskSum + task.hours, 0)
  }, 0)

  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 transition-colors duration-300 flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
          : 'bg-gradient-to-br from-green-50 to-blue-100'
      }`}>
        <div className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className="text-2xl mb-2">🔄</div>
          <p>Loading your weekly data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-green-50 to-blue-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center relative">
          <button
            onClick={toggleTheme}
            className={`absolute top-0 right-0 p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            } shadow-md`}
          >
            {isDark ? '🌞' : '🌙'}
          </button>
          
          <h1 className={`text-4xl font-bold mb-2 ${
            isDark 
              ? 'bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'
          }`}>
            Weekly Burnout Blocker
          </h1>
          <p className={`text-lg ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Plane deine Woche smart - verhindere Überarbeitung! 🌱
          </p>
        </header>

        <WeeklyStats weeklyData={weeklyData} />
        
        <WeekNavigation 
          currentWeek={currentWeekDate}
          onWeekChange={handleWeekChange}
          totalWeeklyHours={totalWeeklyHours}
        />
        
        <WeeklyPlanner 
          weeklyData={weeklyData}
          onUpdateDay={updateDayData}
        />
        
        <CompletedTasks tasks={completedTasks} />
      </div>
    </div>
  )
}

export default App
