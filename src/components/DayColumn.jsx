import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

function DayColumn({ day, label, date, isToday, data, onUpdate }) {
  const { isDark } = useTheme()
  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...data.tasks, {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        hours: 1
      }]
      onUpdate({ ...data, tasks: updatedTasks })
      setNewTask('')
    }
  }

  const toggleTask = (taskId) => {
    const updatedTasks = data.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    onUpdate({ ...data, tasks: updatedTasks })
  }

  const deleteTask = async (taskId) => {
    // Delete from database first
    try {
      if (window.electronAPI) {
        await window.electronAPI.deleteTask(taskId)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      return // Don't update UI if delete failed
    }
    
    // Update local state
    const updatedTasks = data.tasks.filter(task => task.id !== taskId)
    onUpdate({ ...data, tasks: updatedTasks })
  }

  const updateTaskHours = (taskId, hours) => {
    const updatedTasks = data.tasks.map(task =>
      task.id === taskId ? { ...task, hours: Math.max(0, Math.min(12, hours)) } : task
    )
    onUpdate({ ...data, tasks: updatedTasks })
  }

  const totalTaskHours = data.tasks.reduce((sum, task) => sum + task.hours, 0)
  const completedCount = data.tasks.filter(task => task.completed).length

  // Farben für verschiedene Stunden-Bereiche
  const getTaskColor = (index) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600', 
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className={`rounded-lg border p-4 min-h-[400px] flex flex-col transition-colors ${
      isToday 
        ? (isDark ? 'bg-blue-900/30 border-blue-500 shadow-md' : 'bg-blue-50 border-blue-300 shadow-md')
        : (isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200')
    }`}>
      <div className="mb-4">
        <h3 className={`font-semibold text-center mb-1 ${
          isToday 
            ? (isDark ? 'text-blue-300' : 'text-blue-800')
            : (isDark ? 'text-gray-100' : 'text-gray-800')
        }`}>
          {label}
        </h3>
        <p className={`text-xs text-center ${
          isToday 
            ? (isDark ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium')
            : (isDark ? 'text-gray-400' : 'text-gray-500')
        }`}>
          {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
          {isToday && ' (Heute)'}
        </p>
        
        {/* Time Bar */}
        <div className="mb-4">
          <div className={`flex justify-between text-xs mb-1 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>0h</span>
            <span>{totalTaskHours}h</span>
            <span>24h</span>
          </div>
          <div className="relative bg-gray-200 rounded-full h-6 overflow-hidden">
            {/* Segmentierter Balken */}
            {data.tasks.map((task, index) => {
              const prevWidth = data.tasks.slice(0, index).reduce((sum, t) => sum + t.hours, 0)
              const width = (task.hours / 24) * 100
              return (
                <div
                  key={task.id}
                  className={`absolute top-0 bg-gradient-to-r ${getTaskColor(index)} h-6 transition-all duration-300 flex items-center justify-center text-white text-xs font-medium`}
                  style={{ 
                    left: `${(prevWidth / 24) * 100}%`,
                    width: `${width}%`
                  }}
                >
                  {task.hours > 0.5 && `${task.hours}h`}
                </div>
              )
            })}
            {totalTaskHours > 0 && (
              <div 
                className="absolute top-0 right-0 flex items-center justify-center text-white text-xs font-medium h-6 pr-2"
                style={{ left: `${Math.min((totalTaskHours / 24) * 100, 90)}%` }}
              >
                {totalTaskHours > 4 && `∑${totalTaskHours}h`}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className={`text-center text-sm mb-3 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          ✅ {completedCount} / {data.tasks.length} erledigt
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-2 mb-4">
        {data.tasks.map((task, index) => (
          <div key={task.id} className={`rounded border p-2 transition-colors ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center text-white text-xs font-bold transition-colors ${
                  task.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {task.completed && '✓'}
              </button>
              <span className={`flex-1 text-sm ${task.completed 
                ? (isDark ? 'line-through text-gray-500' : 'line-through text-gray-500')
                : (isDark ? 'text-gray-100' : 'text-gray-800')
              }`}>
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                ×
              </button>
            </div>
            
            {/* Task Time Slider */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded bg-gradient-to-r ${getTaskColor(index)} flex-shrink-0`}></div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={task.hours}
                onChange={(e) => updateTaskHours(task.id, parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer min-w-0"
              />
              <span className={`text-xs w-6 text-right flex-shrink-0 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{task.hours}h</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task */}
      <div className="mt-auto">
        <div className="flex gap-1">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Neue Aufgabe..."
            className={`flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0 transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
            }`}
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default DayColumn