import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api/todos'

export const getAllTasks = async () => {
  try {
    const res = await axios.get(BASE_URL)
    return res.data
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

export const createTask = async (task: {
  title: string
  time: string
  description: string
}) => {
  try {
    const res = await axios.post(BASE_URL, task)
    return res.data
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export const updateTask = async (
  id: number,
  task: {
    title: string
    time: string
    description: string
  }
) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}`, task)
    return res.data
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export const deleteTask = async (id: number) => {
  try {
    const res = await axios.delete(`${BASE_URL}/${id}`)
    return res.data
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}
