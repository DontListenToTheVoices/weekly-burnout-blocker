function ProjectStats({ projects }) {
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    pending: projects.filter(p => p.status === 'pending').length,
    highPriority: projects.filter(p => p.priority === 'high').length
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        📊 Projekt Übersicht
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Fertig</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">Aktiv</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Wartend</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
          <div className="text-sm text-gray-600">Hoch Prio</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Fertigstellung</div>
        </div>
      </div>
    </div>
  )
}

export default ProjectStats