const path = require('path');
const fs = require('fs');

// Try better-sqlite3 first (for Windows builds), fallback to sqlite3
let Database, isBetterSqlite3;
try {
  Database = require('better-sqlite3');
  isBetterSqlite3 = true;
  console.log('Using better-sqlite3');
} catch (err) {
  const sqlite3 = require('sqlite3').verbose();
  Database = sqlite3.Database;
  isBetterSqlite3 = false;
  console.log('Using sqlite3');
}

class DatabaseManager {
  constructor() {
    this.db = null;
    // Smart path selection for true portability
    const baseDir =
      process.env.PORTABLE_EXECUTABLE_DIR   // 1️⃣ Portable-Build (Windows)
      || path.dirname(process.execPath)     // 2️⃣ Installer-Builds (.msi/.exe)
      || process.cwd();                     // 3️⃣ Dev-Mode
    
    this.dbPath = path.join(baseDir, 'weekly-burnout-blocker.db');
    console.log('📁 DB: Database path:', this.dbPath);
    console.log('🎯 DB: Using base directory:', baseDir);
    console.log('🔧 DB: PORTABLE_EXECUTABLE_DIR:', process.env.PORTABLE_EXECUTABLE_DIR);
  }

  async initialize() {
    if (isBetterSqlite3) {
      try {
        this.db = new Database(this.dbPath);
        console.log('Connected to SQLite database:', this.dbPath);
        await this.createTables();
      } catch (err) {
        console.error('Error opening database:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db = new Database(this.dbPath, (err) => {
          if (err) {
            console.error('Error opening database:', err);
            reject(err);
          } else {
            console.log('Connected to SQLite database:', this.dbPath);
            this.createTables().then(resolve).catch(reject);
          }
        });
      });
    }
  }

  async createTables() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    if (isBetterSqlite3) {
      try {
        this.db.exec(schema);
        console.log('Database tables created successfully');
      } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.exec(schema, (err) => {
          if (err) {
            console.error('Error creating tables:', err);
            reject(err);
          } else {
            console.log('Database tables created successfully');
            resolve();
          }
        });
      });
    }
  }

  // Get current week key (e.g., "2025-W02") - ISO week standard
  getCurrentWeekKey() {
    const now = new Date();
    
    // ISO week calculation
    const target = new Date(now.valueOf());
    const dayNumber = (now.getDay() + 6) % 7; // Make Monday = 0
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
    
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  // Get or create current week
  async getCurrentWeek() {
    const weekKey = this.getCurrentWeekKey();
    
    if (isBetterSqlite3) {
      try {
        const selectWeek = this.db.prepare('SELECT * FROM weeks WHERE week_key = ?');
        let row = selectWeek.get(weekKey);
        
        if (row) {
          return row;
        } else {
          // Create new week
          const startDate = this.getWeekStartDate().toISOString().split('T')[0];
          const insertWeek = this.db.prepare('INSERT OR IGNORE INTO weeks (week_key, start_date) VALUES (?, ?)');
          insertWeek.run(weekKey, startDate);
          return selectWeek.get(weekKey);
        }
      } catch (err) {
        console.error('Error getting current week:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(
          'SELECT * FROM weeks WHERE week_key = ?',
          [weekKey],
          (err, row) => {
            if (err) {
              reject(err);
            } else if (row) {
              resolve(row);
            } else {
              // Create new week
              const startDate = this.getWeekStartDate().toISOString().split('T')[0];
              this.db.run(
                'INSERT OR IGNORE INTO weeks (week_key, start_date) VALUES (?, ?)',
                [weekKey, startDate],
                function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    // Get the week again
                    this.db.get(
                      'SELECT * FROM weeks WHERE week_key = ?',
                      [weekKey],
                      (err, row) => {
                        if (err) {
                          reject(err);
                        } else {
                          resolve(row);
                        }
                      }
                    );
                  }
                }.bind(this)
              );
            }
          }
        );
      });
    }
  }

  getWeekStartDate() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(now.setDate(diff));
  }

  // Get all tasks for current week
  async getWeeklyData() {
    const week = await this.getCurrentWeek();
    return this.getWeeklyDataByWeekKey(week.week_key);
  }

  // Get weekly data by specific week key
  async getWeeklyDataByWeekKey(weekKey) {
    if (isBetterSqlite3) {
      try {
        const selectWeek = this.db.prepare('SELECT id FROM weeks WHERE week_key = ?');
        const week = selectWeek.get(weekKey);
        
        if (!week) {
          // Week doesn't exist, return empty data
          return {
            monday: { tasks: [] },
            tuesday: { tasks: [] },
            wednesday: { tasks: [] },
            thursday: { tasks: [] },
            friday: { tasks: [] },
            saturday: { tasks: [] },
            sunday: { tasks: [] }
          };
        }
        
        const selectTasks = this.db.prepare('SELECT * FROM tasks WHERE week_id = ? ORDER BY day, created_at');
        const rows = selectTasks.all(week.id);
        
        // Convert to our app format
        const weeklyData = {
          monday: { tasks: [] },
          tuesday: { tasks: [] },
          wednesday: { tasks: [] },
          thursday: { tasks: [] },
          friday: { tasks: [] },
          saturday: { tasks: [] },
          sunday: { tasks: [] }
        };

        rows.forEach(task => {
          weeklyData[task.day].tasks.push({
            id: task.id,
            text: task.text,
            hours: task.hours,
            completed: Boolean(task.completed)
          });
        });

        return weeklyData;
      } catch (err) {
        console.error('Error getting weekly data:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(
          'SELECT id FROM weeks WHERE week_key = ?',
          [weekKey],
          (err, week) => {
            if (err) {
              reject(err);
            } else if (!week) {
              // Week doesn't exist, return empty data
              resolve({
                monday: { tasks: [] },
                tuesday: { tasks: [] },
                wednesday: { tasks: [] },
                thursday: { tasks: [] },
                friday: { tasks: [] },
                saturday: { tasks: [] },
                sunday: { tasks: [] }
              });
            } else {
              this.db.all(
                'SELECT * FROM tasks WHERE week_id = ? ORDER BY day, created_at',
                [week.id],
                (err, rows) => {
                  if (err) {
                    reject(err);
                  } else {
                    // Convert to our app format
                    const weeklyData = {
                      monday: { tasks: [] },
                      tuesday: { tasks: [] },
                      wednesday: { tasks: [] },
                      thursday: { tasks: [] },
                      friday: { tasks: [] },
                      saturday: { tasks: [] },
                      sunday: { tasks: [] }
                    };

                    rows.forEach(task => {
                      weeklyData[task.day].tasks.push({
                        id: task.id,
                        text: task.text,
                        hours: task.hours,
                        completed: Boolean(task.completed)
                      });
                    });

                    resolve(weeklyData);
                  }
                }
              );
            }
          }
        );
      });
    }
  }

  // Get week key from date
  getWeekKeyFromDate(date) {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  // Save task
  async saveTask(day, task) {
    console.log('🗄️ DB: saveTask called:', { day, taskId: task.id, text: task.text, isNew: task.id >= 1000000000000 })
    console.log('📁 DB: Current database path:', this.dbPath)
    const week = await this.getCurrentWeek();
    console.log('📅 DB: Using week:', { weekKey: week.week_key, weekId: week.id })
    
    if (isBetterSqlite3) {
      try {
        if (task.id && task.id < 1000000000000) { // DB IDs are smaller than Date.now() timestamps
          // Update existing task
          console.log('🔄 DB: Updating existing task:', task.id)
          const updateTask = this.db.prepare('UPDATE tasks SET text = ?, hours = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
          updateTask.run(task.text, task.hours, task.completed ? 1 : 0, task.id);
          console.log('✅ DB: Task updated:', task.id)
          return task;
        } else {
          // Insert new task
          console.log('➕ DB: Inserting new task')
          const insertTask = this.db.prepare('INSERT INTO tasks (week_id, day, text, hours, completed) VALUES (?, ?, ?, ?, ?)');
          const result = insertTask.run(week.id, day, task.text, task.hours, task.completed ? 1 : 0);
          const newTask = { ...task, id: result.lastInsertRowid };
          console.log('✨ DB: New task created with ID:', newTask.id)
          return newTask;
        }
      } catch (err) {
        console.error('Error saving task:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        if (task.id && task.id < 1000000000000) { // DB IDs are smaller than Date.now() timestamps
          // Update existing task
          console.log('🔄 DB: Updating existing task:', task.id)
          this.db.run(
            'UPDATE tasks SET text = ?, hours = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [task.text, task.hours, task.completed ? 1 : 0, task.id],
            (err) => {
              if (err) {
                console.error('❌ DB: Update failed:', err)
                reject(err);
              } else {
                console.log('✅ DB: Task updated:', task.id)
                resolve(task);
              }
            }
          );
        } else {
          // Insert new task
          console.log('➕ DB: Inserting new task')
          this.db.run(
            'INSERT INTO tasks (week_id, day, text, hours, completed) VALUES (?, ?, ?, ?, ?)',
            [week.id, day, task.text, task.hours, task.completed ? 1 : 0],
            function(err) {
              if (err) {
                console.error('❌ DB: Insert failed:', err)
                reject(err);
              } else {
                const newTask = { ...task, id: this.lastID };
                console.log('✨ DB: New task created with ID:', newTask.id)
                resolve(newTask);
              }
            }
          );
        }
      });
    }
  }

  // Delete task
  async deleteTask(taskId) {
    if (isBetterSqlite3) {
      try {
        const deleteTask = this.db.prepare('DELETE FROM tasks WHERE id = ?');
        deleteTask.run(taskId);
      } catch (err) {
        console.error('Error deleting task:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.run('DELETE FROM tasks WHERE id = ?', [taskId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  // Create demo data for testing
  async createDemoWeek() {
    const demoWeekKey = '2025-W27';
    const demoStartDate = '2025-06-30';
    
    if (isBetterSqlite3) {
      try {
        // First create the week
        const insertWeek = this.db.prepare('INSERT OR IGNORE INTO weeks (week_key, start_date) VALUES (?, ?)');
        insertWeek.run(demoWeekKey, demoStartDate);
        
        // Get the week ID
        const selectWeek = this.db.prepare('SELECT id FROM weeks WHERE week_key = ?');
        const week = selectWeek.get(demoWeekKey);
        
        if (!week) {
          throw new Error('Failed to create demo week');
        }
        
        // Insert demo tasks
        const demoTasks = [
          { day: 'monday', text: 'Queen besuchen 👑', hours: 2.5, completed: 1 },
          { day: 'tuesday', text: 'Jurassic Park spazieren 🦕', hours: 4.0, completed: 1 },
          { day: 'wednesday', text: 'T-Rex füttern 🦖', hours: 1.5, completed: 0 },
          { day: 'thursday', text: 'Zeitmaschine reparieren ⏰', hours: 3.0, completed: 1 },
          { day: 'friday', text: 'Velociraptors trainieren 🦘', hours: 2.0, completed: 1 },
          { day: 'saturday', text: 'Mit Aliens verhandeln 👽', hours: 1.0, completed: 0 }
        ];
        
        const insertTask = this.db.prepare('INSERT OR IGNORE INTO tasks (week_id, day, text, hours, completed) VALUES (?, ?, ?, ?, ?)');
        
        for (const task of demoTasks) {
          insertTask.run(week.id, task.day, task.text, task.hours, task.completed);
        }
        
        console.log('Demo week created successfully! 🦖👑');
      } catch (err) {
        console.error('Error creating demo week:', err);
        throw err;
      }
    } else {
      return new Promise((resolve, reject) => {
        // First create the week
        this.db.run(
          'INSERT OR IGNORE INTO weeks (week_key, start_date) VALUES (?, ?)',
          [demoWeekKey, demoStartDate],
          function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            // Get the week ID
            this.db.get(
              'SELECT id FROM weeks WHERE week_key = ?',
              [demoWeekKey],
              (err, week) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                // Insert demo tasks
                const demoTasks = [
                  { day: 'monday', text: 'Queen besuchen 👑', hours: 2.5, completed: 1 },
                  { day: 'tuesday', text: 'Jurassic Park spazieren 🦕', hours: 4.0, completed: 1 },
                  { day: 'wednesday', text: 'T-Rex füttern 🦖', hours: 1.5, completed: 0 },
                  { day: 'thursday', text: 'Zeitmaschine reparieren ⏰', hours: 3.0, completed: 1 },
                  { day: 'friday', text: 'Velociraptors trainieren 🦘', hours: 2.0, completed: 1 },
                  { day: 'saturday', text: 'Mit Aliens verhandeln 👽', hours: 1.0, completed: 0 }
                ];
                
                const insertPromises = demoTasks.map(task => {
                  return new Promise((taskResolve, taskReject) => {
                    this.db.run(
                      'INSERT OR IGNORE INTO tasks (week_id, day, text, hours, completed) VALUES (?, ?, ?, ?, ?)',
                      [week.id, task.day, task.text, task.hours, task.completed],
                      (err) => {
                        if (err) taskReject(err);
                        else taskResolve();
                      }
                    );
                  });
                });
                
                Promise.all(insertPromises)
                  .then(() => {
                    console.log('Demo week created successfully! 🦖👑');
                    resolve();
                  })
                  .catch(reject);
              }
            );
          }.bind(this)
        );
      });
    }
  }

  // Close database
  close() {
    if (this.db) {
      if (isBetterSqlite3) {
        try {
          this.db.close();
          console.log('Database connection closed');
        } catch (err) {
          console.error('Error closing database:', err);
        }
      } else {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Database connection closed');
          }
        });
      }
    }
  }
}

module.exports = DatabaseManager;