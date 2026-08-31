const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const headers = { 'ngrok-skip-browser-warning': 'true' }

// Set globally for all axios requests
import axios from 'axios'
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

export default API
