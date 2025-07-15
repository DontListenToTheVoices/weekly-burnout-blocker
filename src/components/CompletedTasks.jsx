import { useTheme } from '../contexts/ThemeContext'

function CompletedTasks({ tasks }) {
  const { isDark } = useTheme()
  const totalHours = tasks.reduce((sum, task) => sum + task.dayHours, 0)

  if (tasks.length === 0) {
    return (
      <div className={`rounded-lg shadow-lg p-6 transition-colors ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>✅ Erledigte Aufgaben</h2>
        <div className={`text-center py-8 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="text-4xl mb-2">🎯</div>
          <p>Noch keine Aufgaben erledigt - leg los!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg shadow-lg p-6 transition-colors ${
      isDark 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        }`}>✅ Erledigte Aufgaben</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{totalHours}h</div>
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Gesamte Arbeitszeit</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task, index) => (
          <div key={`${task.day}-${task.id}-${index}`} className={`border rounded-lg p-4 transition-colors ${
            isDark 
              ? 'bg-green-900/20 border-green-600'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">{task.day}</span>
              <span className="text-sm text-green-600">{task.dayHours}h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-500 flex items-center justify-center text-white text-xs font-bold">
                ✓
              </div>
              <span className={`${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>{task.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className={`mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t ${
        isDark ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">{tasks.length}</div>
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Aufgaben</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{totalHours}h</div>
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Stunden</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">
            {tasks.length > 0 ? (totalHours / tasks.length).toFixed(1) : 0}h
          </div>
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Ø pro Task</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-600">
            {new Set(tasks.map(t => t.day)).size}
          </div>
          <div className={`text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Aktive Tage</div>
        </div>
      </div>
    </div>
  )
}

export default CompletedTasks