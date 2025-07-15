import ProjectCard from './ProjectCard'

function ProjectList({ projects, onDelete, onUpdate }) {
  const groupedProjects = {
    in_progress: projects.filter(p => p.status === 'in_progress'),
    pending: projects.filter(p => p.status === 'pending'),
    completed: projects.filter(p => p.status === 'completed')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          🚀 In Progress ({groupedProjects.in_progress.length})
        </h2>
        <div className="space-y-3">
          {groupedProjects.in_progress.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          ⏳ Pending ({groupedProjects.pending.length})
        </h2>
        <div className="space-y-3">
          {groupedProjects.pending.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          ✅ Completed ({groupedProjects.completed.length})
        </h2>
        <div className="space-y-3">
          {groupedProjects.completed.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectList