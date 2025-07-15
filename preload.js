const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getWeeklyData: () => ipcRenderer.invoke('db-get-weekly-data'),
  getWeeklyDataByDate: (date) => ipcRenderer.invoke('db-get-weekly-data-by-date', date),
  saveTask: (day, task) => ipcRenderer.invoke('db-save-task', day, task),
  deleteTask: (taskId) => ipcRenderer.invoke('db-delete-task', taskId),
  getDbPath: () => ipcRenderer.invoke('db-get-path'),
  getDebugInfo: () => ipcRenderer.invoke('db-get-debug-info')
});