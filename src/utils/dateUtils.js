export const getCurrentWeek = () => {
  const now = new Date()
  const currentDay = now.getDay()
  const monday = new Date(now)
  
  // Adjust to Monday (0 = Sunday, 1 = Monday, etc.)
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay
  monday.setDate(now.getDate() + daysToMonday)
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    days.push(day)
  }
  
  return days
}

export const formatWeekRange = (weekDays) => {
  const start = weekDays[0]
  const end = weekDays[6]
  
  const startStr = start.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit' 
  })
  const endStr = end.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric'
  })
  
  return `${startStr} - ${endStr}`
}

export const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const getDayName = (date) => {
  return date.toLocaleDateString('de-DE', { weekday: 'long' })
}