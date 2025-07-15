function ProjectCard({ project, onDelete, onUpdate }) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-300 shadow-red-100',
    medium: 'bg-amber-100 text-amber-700 border-amber-300 shadow-amber-100',
    low: 'bg-green-100 text-green-700 border-green-300 shadow-green-100'
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800">{project.name}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[project.priority]}`}>
            {project.priority}
          </span>
          <button 
            onClick={() => onDelete(project.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ×
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{project.description}</p>
      
      <div className="flex justify-between items-center">
        <select 
          value={project.status}
          onChange={(e) => onUpdate(project.id, { status: e.target.value })}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <select 
          value={project.priority}
          onChange={(e) => onUpdate(project.id, { priority: e.target.value })}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  )
}

export default ProjectCard