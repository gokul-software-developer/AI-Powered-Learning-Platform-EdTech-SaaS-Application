import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Pencil } from "lucide-react"
import { getAllTasks, createTask, updateTask, deleteTask } from "@/api/todo"

export const Planner = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({
    title: "",
    time: "",
    description: "",
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const res = await getAllTasks()
        console.log("API Response:", res) // Debug log
        
        // More robust data handling
        const taskData = res?.data || res || []
        
        // Filter out any invalid tasks
        const validTasks = Array.isArray(taskData) 
          ? taskData.filter(task => task && typeof task === 'object' && task.title)
          : []
          
        console.log("Valid tasks:", validTasks) // Debug log
        setTasks(validTasks)
      } catch (err) {
        console.error("Failed to fetch tasks", err)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [])

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return
    
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        ...(newTask.time && { time: new Date(newTask.time).toISOString() })
      }
      
      const res = await createTask(taskData)
      console.log("Create task response:", res) // Debug log
      
      // Handle different response structures
      const newTaskData = res?.data || res
      if (newTaskData && newTaskData.title) {
        setTasks(prevTasks => [...prevTasks, newTaskData])
        setNewTask({ title: "", time: "", description: "" })
      }
    } catch (err) {
      console.error("Failed to add task", err)
    }
  }

  const handleUpdateTask = async () => {
    if (editingTaskId === null || !newTask.title.trim()) return
    
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        ...(newTask.time && { time: new Date(newTask.time).toISOString() })
      }
      
      await updateTask(editingTaskId, taskData)
      
      const updatedTasks = tasks.map((task) =>
        task && task.id === editingTaskId
          ? { ...task, title: newTask.title, time: newTask.time, description: newTask.description }
          : task
      ).filter(task => task) // Remove any undefined tasks
      
      setTasks(updatedTasks)
      setEditingIndex(null)
      setEditingTaskId(null)
      setNewTask({ title: "", time: "", description: "" })
    } catch (err) {
      console.error("Failed to update task", err)
    }
  }

  const handleDelete = async (index: number) => {
    const taskToDelete = tasks[index]
    if (!taskToDelete || !taskToDelete.id) return
    
    try {
      await deleteTask(taskToDelete.id)
      const updatedTasks = tasks.filter((_, i) => i !== index)
      setTasks(updatedTasks)
    } catch (err) {
      console.error("Failed to delete task", err)
    }
  }

  const handleEdit = (index: number) => {
    const task = tasks[index]
    if (!task) return
    
    setNewTask({
      title: task.title || "",
      time: task.time ? new Date(task.time).toISOString().slice(0, 16) : "",
      description: task.description || "",
    })
    setEditingIndex(index)
    setEditingTaskId(task.id)
  }

  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return ""
    try {
      return new Date(timeString).toLocaleString()
    } catch {
      return timeString
    }
  }

  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">To Do List</h2>
        <div className="text-center text-muted-foreground">Loading tasks...</div>
      </section>
    )
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-foreground mb-4">To Do List</h2>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <Input
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <Input
          type="datetime-local"
          placeholder="Date & Time"
          value={newTask.time}
          onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
        />
        <Textarea
          placeholder="Short Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <Button
          onClick={() =>
            editingIndex !== null ? handleUpdateTask() : handleAddTask()
          }
          className="md:col-span-3"
          disabled={!newTask.title.trim()}
        >
          {editingIndex !== null ? "Update Task" : "Add Task"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks && tasks.length > 0 ? (
          tasks
            .filter(task => task && task.title) // Filter out invalid tasks
            .map((task: any, index) => (
              <div key={task.id || index} className="rounded-xl p-4 shadow-sm border bg-muted">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <div className="flex gap-2">
                    <Pencil 
                      className="w-4 h-4 cursor-pointer" 
                      onClick={() => handleEdit(tasks.indexOf(task))} 
                    />
                    <X 
                      className="w-4 h-4 cursor-pointer text-red-500" 
                      onClick={() => handleDelete(tasks.indexOf(task))} 
                    />
                  </div>
                </div>
                {task.time && (
                  <p className="text-sm text-muted-foreground">{formatDisplayTime(task.time)}</p>
                )}
                {task.description && (
                  <p className="text-sm mt-2">{task.description}</p>
                )}
              </div>
            ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            No tasks yet. Add your first task above!
          </div>
        )}
      </div>
    </section>
  )
}

export default Planner