import { useTheme } from '../contexts/ThemeContext'

function WeekNavigation({ currentWeek, onWeekChange, totalWeeklyHours }) {
  const { isDark } = useTheme()

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() - 7)
    onWeekChange(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + 7)
    onWeekChange(newWeek)
  }

  const goToCurrentWeek = () => {
    onWeekChange(new Date())
  }

  const formatWeekRange = (startDate) => {
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    
    const start = startDate.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit' 
    })
    const end = endDate.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })
    
    return `${start} - ${end}`
  }

  const getWeekNumber = (date) => {
    const target = new Date(date.valueOf())
    const dayNumber = (date.getDay() + 6) % 7
    target.setDate(target.getDate() - dayNumber + 3)
    const firstThursday = target.valueOf()
    target.setMonth(0, 1)
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000)
  }

  const isCurrentWeek = () => {
    const now = new Date()
    const currentMonday = new Date(currentWeek)
    const nowMonday = new Date(now)
    
    // Get Monday of both weeks
    currentMonday.setDate(currentMonday.getDate() - (currentMonday.getDay() + 6) % 7)
    nowMonday.setDate(nowMonday.getDate() - (nowMonday.getDay() + 6) % 7)
    
    return currentMonday.toDateString() === nowMonday.toDateString()
  }

  return (
    <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors ${
      isDark 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousWeek}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ← Vorherige Woche
          </button>
          
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
              📅 KW {getWeekNumber(currentWeek)}
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {formatWeekRange(currentWeek)}
              {isCurrentWeek() && ' (Aktuelle Woche)'}
            </p>
          </div>
          
          <button
            onClick={goToNextWeek}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Nächste Woche →
          </button>
        </div>

        <div className="flex items-center gap-4">
          {!isCurrentWeek() && (
            <button
              onClick={goToCurrentWeek}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Zur aktuellen Woche
            </button>
          )}
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalWeeklyHours.toFixed(1)}h</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gesamt diese Woche
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeekNavigation