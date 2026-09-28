import axios from 'axios'


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
    import.meta.env.VITE_API_URL
    ||
    'http://127.0.0.1:8000'


// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({

    baseURL:
        API_BASE_URL,

    headers: {

        'Content-Type':
            'application/json'
    },

    timeout:
        15000
})


// ============================================================
// AUTHENTICATION INTERCEPTOR
// ============================================================

api.interceptors.request.use(

    config => {

        const token =
            localStorage.getItem(
                'smartshop_token'
            )


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`
        }


        return config
    },


    error => {

        return Promise.reject(
            error
        )
    }
)


export default api