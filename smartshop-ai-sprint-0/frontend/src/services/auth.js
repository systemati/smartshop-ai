import api from './api'


// ============================================================
// REGISTER
// ============================================================

export async function registerUser(
    fullName,
    email,
    password
) {
    const cleanName = fullName
        .trim()
        .replace(/_/g, ' ')

    const nameParts = cleanName
        .split(/\s+/)
        .filter(Boolean)

    const firstName =
        nameParts[0] || ''

    const lastName =
        nameParts.slice(1).join(' ')


    if (!firstName || !lastName) {
        throw new Error(
            'Please enter both your first name and last name.'
        )
    }


    const response = await api.post(
        '/api/auth/register',
        {
            first_name: firstName,
            last_name: lastName,
            email: email.trim(),
            password: password
        }
    )


    return response.data
}


// ============================================================
// LOGIN
// ============================================================

export async function loginUser(
    email,
    password
) {
    const response = await api.post(
        '/api/auth/login',
        {
            email: email.trim(),
            password: password
        }
    )


    const token =
        response.data.access_token
        ??
        response.data.token


    if (!token) {
        throw new Error(
            'Login succeeded but no access token was returned.'
        )
    }


    localStorage.setItem(
        'smartshop_token',
        token
    )


    if (response.data.user) {
        localStorage.setItem(
            'smartshop_user',
            JSON.stringify(
                response.data.user
            )
        )
    }


    return response.data
}

// ============================================================
// LOGOUT
// ============================================================

export function logoutUser() {
    localStorage.removeItem(
        'smartshop_token'
    )

    localStorage.removeItem(
        'smartshop_user'
    )
}


// ============================================================
// TOKEN
// ============================================================

export function getToken() {
    return localStorage.getItem(
        'smartshop_token'
    )
}


// ============================================================
// STORED USER
// ============================================================

export function getStoredUser() {
    const user =
        localStorage.getItem(
            'smartshop_user'
        )


    if (!user) {
        return null
    }


    try {
        return JSON.parse(user)

    } catch {
        localStorage.removeItem(
            'smartshop_user'
        )

        return null
    }
}