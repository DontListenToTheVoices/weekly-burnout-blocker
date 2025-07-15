import { useTheme } from '../contexts/ThemeContext'

function WeeklyStats({ weeklyData }) {
  const { isDark } = useTheme()
  const days = Object.values(weeklyData)
  const allTasks = days.flatMap(day => day.tasks)
  
  // Grundstatistiken
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter(task => task.completed).length
  const totalHours = allTasks.reduce((sum, task) => sum + task.hours, 0)
  const completedHours = allTasks.filter(task => task.completed).reduce((sum, task) => sum + task.hours, 0)
  
  // Burnout Metrics
  const dailyHours = days.map(day => day.tasks.reduce((sum, task) => sum + task.hours, 0))
  const maxDayHours = Math.max(...dailyHours)
  const avgDayHours = totalHours / 7
  const activeDays = dailyHours.filter(hours => hours > 0).length
  
  // Burnout Warning Logic
  const burnoutRisk = maxDayHours > 10 ? 'high' : maxDayHours > 8 ? 'medium' : 'low'
  const burnoutColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600', 
    high: 'text-red-600'
  }
  const burnoutMessages = {
    low: '🌱 Gesunde Balance!',
    medium: '⚠️ Aufpassen, nicht überlasten',
    high: '🚨 Burnout Gefahr!'
  }

  // Completion Rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Productivity Score (completion rate + reasonable hours)
  const productivityScore = totalTasks === 0 ? 0 : Math.round(
    (completionRate * 0.7) + 
    (Math.max(0, 100 - Math.max(0, maxDayHours - 8) * 10) * 0.3)
  )

  return (
    <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors ${
      isDark 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      <h2 className={`text-xl font-bold mb-4 ${
        isDark ? 'text-gray-100' : 'text-gray-800'
      }`}>📊 Wochen-Statistiken</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Tasks */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{completedTasks}/{totalTasks}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tasks erledigt</div>
        </div>
        
        {/* Stunden */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{completedHours.toFixed(1)}h</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gearbeitet</div>
        </div>
        
        {/* Durchschnitt */}
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{avgDayHours.toFixed(1)}h</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ø pro Tag</div>
        </div>
        
        {/* Max Tag */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${burnoutColors[burnoutRisk]}`}>
            {maxDayHours.toFixed(1)}h
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Längster Tag</div>
        </div>
        
        {/* Completion Rate */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Erfolgsrate</div>
        </div>
        
        {/* Productivity */}
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{productivityScore}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Produktivität</div>
        </div>
      </div>

      {/* Burnout Warning */}
      <div className={`mt-4 p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`font-medium ${burnoutColors[burnoutRisk]}`}>
          {burnoutMessages[burnoutRisk]}
        </div>
        <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {activeDays > 0 && `${activeDays} aktive Tage diese Woche`}
          {burnoutRisk === 'high' && ' • Plane Pausen ein!'}
          {burnoutRisk === 'medium' && ' • Reduziere wenn möglich'}
          {burnoutRisk === 'low' && ' • Weiter so!'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className={`flex justify-between text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <span>Wochenfortschritt</span>
          <span>{completedTasks}/{totalTasks} Tasks</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyStats