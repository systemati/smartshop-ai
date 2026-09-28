import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
    loginUser,
    getStoredUser
} from '../services/auth'

import api from '../services/api'


function Login({
    onLogin
}) {

    const navigate = useNavigate()

    const [email, setEmail] =
        useState('')

    const [password, setPassword] =
        useState('')

    const [showPassword, setShowPassword] =
        useState(false)

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState('')


    const getErrorMessage = (err) => {

        const detail =
            err.response?.data?.detail

        if (Array.isArray(detail)) {

            return detail
                .map((item) => {

                    const field =
                        Array.isArray(item.loc)
                            ? item.loc[
                                item.loc.length - 1
                            ]
                            : 'field'

                    return `${field}: ${item.msg}`
                })
                .join(' | ')
        }

        if (typeof detail === 'string') {
            return detail
        }

        if (
            detail &&
            typeof detail === 'object'
        ) {
            return (
                detail.msg ||
                JSON.stringify(detail)
            )
        }

        return (
            err.message ||
            'Unable to sign in.'
        )
    }


    const handleSubmit = async (event) => {

        event.preventDefault()

        setError('')

        if (!email.trim()) {

            setError(
                'Please enter your email address.'
            )

            return
        }

        if (!password) {

            setError(
                'Please enter your password.'
            )

            return
        }


        try {

            setLoading(true)

            const data =
                await loginUser(
                    email.trim(),
                    password
                )

            let user =
                data?.user ||
                getStoredUser()

            if (!user) {

                user = {
                    email:
                        email.trim()
                }

                localStorage.setItem(
                    'smartshop_user',
                    JSON.stringify(user)
                )
            }

            if (onLogin) {
                onLogin(user)
            }

            // Premium 7 — route incomplete profiles through onboarding.
            // The Preferences API is the source of truth; no extra
            // localStorage onboarding flag or database field is required.
            let destination = '/search'

            try {

                const preferenceResponse =
                    await api.get(
                        '/api/preferences/'
                    )

                const preferences =
                    preferenceResponse.data || {}

                const hasValues = value => {

                    if (Array.isArray(value)) {
                        return value.length > 0
                    }

                    if (typeof value === 'string') {

                        const trimmed =
                            value.trim()

                        if (!trimmed) {
                            return false
                        }

                        try {

                            const parsed =
                                JSON.parse(
                                    trimmed
                                )

                            if (Array.isArray(parsed)) {
                                return parsed.length > 0
                            }

                        } catch {
                            return true
                        }

                        return true
                    }

                    return false
                }

                const hasPersonalisationSignal =
                    hasValues(
                        preferences.favourite_categories
                    )
                    ||
                    hasValues(
                        preferences.favourite_colours
                    )
                    ||
                    hasValues(
                        preferences.preferred_stores
                    )
                    ||
                    hasValues(
                        preferences.hobbies
                    )
                    ||
                    (
                        preferences.maximum_budget !== null
                        &&
                        preferences.maximum_budget !== undefined
                        &&
                        preferences.maximum_budget !== ''
                    )

                const hasDeliveryProvince =
                    Boolean(
                        String(
                            preferences.delivery_location
                            ?? ''
                        ).trim()
                    )

                if (
                    !hasPersonalisationSignal
                    ||
                    !hasDeliveryProvince
                ) {
                    destination =
                        '/onboarding'
                }

            } catch (preferenceError) {

                // Authentication succeeded. A secondary profile check
                // should never turn a successful login into a failed login.
                console.error(
                    'Post-login preference check error:',
                    preferenceError.response?.data
                    || preferenceError
                )
            }

            navigate(destination)

        } catch (err) {

            console.error(
                'Login error:',
                err.response?.data || err
            )

            setError(
                getErrorMessage(err)
            )

        } finally {

            setLoading(false)
        }
    }


    return (
        <main className="auth-page">

            <div className="container auth-container">

                <div className="auth-shell">

                    {/* LEFT */}

                    <section className="auth-brand-panel">

                        <div className="auth-brand-content">

                            <Link
                                to="/"
                                className="auth-brand-logo"
                            >
                                <span className="auth-brand-icon">
                                    S
                                </span>

                                <span>
                                    SmartShop
                                    <strong> AI</strong>
                                </span>
                            </Link>


                            <div className="auth-brand-message">

                                <span className="auth-brand-eyebrow">
                                    WELCOME BACK
                                </span>

                                <h1>
                                    Your smarter shopping
                                    <span>
                                        {' '}journey continues.
                                    </span>
                                </h1>

                                <p>
                                    Sign in to continue discovering
                                    products tailored to your budget,
                                    preferences and shopping history.
                                </p>

                            </div>


                            <div className="auth-benefits">

                                <LoginBenefit
                                    icon="✦"
                                    title="Your recommendations"
                                    description="Continue with personalised product suggestions."
                                />

                                <LoginBenefit
                                    icon="♡"
                                    title="Your favourites"
                                    description="Access the products you have saved."
                                />

                                <LoginBenefit
                                    icon="↗"
                                    title="Your shopping history"
                                    description="Use previous activity to make better decisions."
                                />

                            </div>

                        </div>


                        <div
                            className="auth-brand-decoration"
                            aria-hidden="true"
                        >
                            <span className="auth-orbit auth-orbit-one" />
                            <span className="auth-orbit auth-orbit-two" />

                            <div className="auth-ai-mark">
                                <span>S</span>
                                <small>SmartShop AI</small>
                            </div>
                        </div>

                    </section>


                    {/* FORM */}

                    <section className="auth-form-panel">

                        <div className="auth-form-wrapper">

                            <div className="auth-mobile-brand">

                                <span className="auth-brand-icon">
                                    S
                                </span>

                                <span>
                                    SmartShop
                                    <strong> AI</strong>
                                </span>

                            </div>


                            <div className="auth-form-heading">

                                <span className="smartshop-badge">
                                    Welcome Back
                                </span>

                                <h2>
                                    Sign in to SmartShop
                                </h2>

                                <p>
                                    Continue to your personalised
                                    shopping experience.
                                </p>

                            </div>


                            {error && (

                                <div
                                    className="auth-alert"
                                    role="alert"
                                >
                                    <span className="auth-alert-icon">
                                        !
                                    </span>

                                    <span>
                                        {error}
                                    </span>
                                </div>

                            )}


                            <form
                                onSubmit={handleSubmit}
                                className="auth-form"
                            >

                                <div className="auth-field">

                                    <label htmlFor="login-email">
                                        Email address
                                    </label>

                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            @
                                        </span>

                                        <input
                                            id="login-email"
                                            type="email"
                                            className="form-control"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="email"
                                            disabled={loading}
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="auth-field">

                                    <div className="auth-label-row">

                                        <label htmlFor="login-password">
                                            Password
                                        </label>

                                    </div>


                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            •
                                        </span>

                                        <input
                                            id="login-password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            className="form-control auth-password-input"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="current-password"
                                            disabled={loading}
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() =>
                                                setShowPassword(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                        >
                                            {
                                                showPassword
                                                    ? 'Hide'
                                                    : 'Show'
                                            }
                                        </button>

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary auth-submit-button"
                                    disabled={
                                        loading ||
                                        !email.trim() ||
                                        !password
                                    }
                                >
                                    {
                                        loading
                                            ? (
                                                <>
                                                    <span className="auth-spinner" />
                                                    Signing in...
                                                </>
                                            )
                                            : 'Sign in'
                                    }
                                </button>

                            </form>


                            <div className="auth-switch">

                                <span>
                                    New to SmartShop?
                                </span>

                                <Link to="/register">
                                    Create an account
                                </Link>

                            </div>


                            <div className="auth-security-note">
                                <span>✓</span>
                                Sign in securely to access your
                                personalised SmartShop experience.
                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    )
}


function LoginBenefit({
    icon,
    title,
    description
}) {

    return (
        <div className="auth-benefit">

            <span className="auth-benefit-icon">
                {icon}
            </span>

            <div>

                <strong>
                    {title}
                </strong>

                <small>
                    {description}
                </small>

            </div>

        </div>
    )
}


export default Login