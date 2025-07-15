import DayColumn from './DayColumn'
import { getCurrentWeek, formatWeekRange, isToday, getDayName } from '../utils/dateUtils'
import { useTheme } from '../contexts/ThemeContext'

function WeeklyPlanner({ weeklyData, onUpdateDay }) {
  const { isDark } = useTheme()
  const currentWeekDays = getCurrentWeek()
  
  // Correct ISO week calculation
  const getCorrectWeekNumber = (date) => {
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
  
  const days = [
    { key: 'monday', label: 'Montag', date: currentWeekDays[0] },
    { key: 'tuesday', label: 'Dienstag', date: currentWeekDays[1] },
    { key: 'wednesday', label: 'Mittwoch', date: currentWeekDays[2] },
    { key: 'thursday', label: 'Donnerstag', date: currentWeekDays[3] },
    { key: 'friday', label: 'Freitag', date: currentWeekDays[4] },
    { key: 'saturday', label: 'Samstag', date: currentWeekDays[5] },
    { key: 'sunday', label: 'Sonntag', date: currentWeekDays[6] }
  ]

  const totalWeeklyHours = Object.values(weeklyData).reduce((sum, day) => {
    return sum + day.tasks.reduce((taskSum, task) => taskSum + task.hours, 0)
  }, 0)

  return (
    <div className="mb-8">
      <div className={`rounded-lg shadow-lg p-6 transition-colors ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>📅 Wochenplaner</h2>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              KW {getCorrectWeekNumber(currentWeekDays[0])} • {formatWeekRange(currentWeekDays)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalWeeklyHours.toFixed(1)}h</div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Gesamt diese Woche</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {days.map(day => (
            <DayColumn
              key={day.key}
              day={day.key}
              label={day.label}
              date={day.date}
              isToday={isToday(day.date)}
              data={weeklyData[day.key]}
              onUpdate={(data) => onUpdateDay(day.key, data)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default WeeklyPlanner