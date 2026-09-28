import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
    registerUser
} from '../services/auth'


function Register() {

    const navigate = useNavigate()

    const [fullName, setFullName] =
        useState('')

    const [email, setEmail] =
        useState('')

    const [password, setPassword] =
        useState('')

    const [confirmPassword, setConfirmPassword] =
        useState('')

    const [showPassword, setShowPassword] =
        useState(false)

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false)

    const [error, setError] =
        useState('')

    const [loading, setLoading] =
        useState(false)


    const passwordRules = useMemo(() => ({
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password)
    }), [password])


    const passwordIsStrong =
        Object.values(passwordRules)
            .every(Boolean)


    const passwordsMatch =
        confirmPassword.length > 0 &&
        password === confirmPassword


    const formIsValid =
        fullName.trim().length > 0 &&
        email.trim().length > 0 &&
        passwordIsStrong &&
        passwordsMatch


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

        return 'Registration failed. Please try again.'
    }


    const handleSubmit = async (event) => {

        event.preventDefault()

        setError('')

        if (!fullName.trim()) {
            setError(
                'Please enter your full name.'
            )
            return
        }

        if (!email.trim()) {
            setError(
                'Please enter your email address.'
            )
            return
        }

        if (!passwordIsStrong) {
            setError(
                'Please make sure your password meets all requirements.'
            )
            return
        }

        if (password !== confirmPassword) {
            setError(
                'Your passwords do not match.'
            )
            return
        }

        try {

            setLoading(true)

            await registerUser(
                fullName.trim(),
                email.trim(),
                password
            )

            navigate('/login')

        } catch (err) {

            console.error(
                'Registration error:',
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

                    {/* LEFT BRAND PANEL */}

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
                                    SMARTER SHOPPING
                                </span>

                                <h1>
                                    Shop smarter
                                    <span>
                                        {' '}from day one.
                                    </span>
                                </h1>

                                <p>
                                    Create your account and let
                                    SmartShop AI help you discover
                                    products that fit your budget,
                                    preferences and lifestyle.
                                </p>

                            </div>


                            <div className="auth-benefits">

                                <AuthBenefit
                                    icon="⌕"
                                    title="Budget-aware discovery"
                                    description="Find products that make sense for your budget."
                                />

                                <AuthBenefit
                                    icon="✦"
                                    title="Personalised recommendations"
                                    description="Get smarter suggestions as SmartShop learns what you like."
                                />

                                <AuthBenefit
                                    icon="♡"
                                    title="Save what matters"
                                    description="Keep favourites and purchase history together."
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


                    {/* REGISTER FORM */}

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
                                    Join SmartShop
                                </span>

                                <h2>
                                    Create your account
                                </h2>

                                <p>
                                    Start making smarter shopping
                                    decisions with SmartShop AI.
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

                                {/* NAME */}

                                <div className="auth-field">

                                    <label htmlFor="register-name">
                                        Full name
                                    </label>

                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            ◯
                                        </span>

                                        <input
                                            id="register-name"
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your full name"
                                            value={fullName}
                                            onChange={(event) =>
                                                setFullName(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="name"
                                            disabled={loading}
                                            required
                                        />

                                    </div>

                                </div>


                                {/* EMAIL */}

                                <div className="auth-field">

                                    <label htmlFor="register-email">
                                        Email address
                                    </label>

                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            @
                                        </span>

                                        <input
                                            id="register-email"
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


                                {/* PASSWORD */}

                                <div className="auth-field">

                                    <label htmlFor="register-password">
                                        Password
                                    </label>

                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            •
                                        </span>

                                        <input
                                            id="register-password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            className="form-control auth-password-input"
                                            placeholder="Create a secure password"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="new-password"
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


                                    <div className="password-requirements">

                                        <PasswordRule
                                            passed={
                                                passwordRules.length
                                            }
                                            text="8+ characters"
                                        />

                                        <PasswordRule
                                            passed={
                                                passwordRules.upper
                                            }
                                            text="Uppercase"
                                        />

                                        <PasswordRule
                                            passed={
                                                passwordRules.lower
                                            }
                                            text="Lowercase"
                                        />

                                        <PasswordRule
                                            passed={
                                                passwordRules.number
                                            }
                                            text="Number"
                                        />

                                    </div>

                                </div>


                                {/* CONFIRM PASSWORD */}

                                <div className="auth-field">

                                    <label htmlFor="confirm-password">
                                        Confirm password
                                    </label>

                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            ✓
                                        </span>

                                        <input
                                            id="confirm-password"
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            className="form-control auth-password-input"
                                            placeholder="Enter your password again"
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value
                                                )
                                            }
                                            autoComplete="new-password"
                                            disabled={loading}
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (current) =>
                                                        !current
                                                )
                                            }
                                        >
                                            {
                                                showConfirmPassword
                                                    ? 'Hide'
                                                    : 'Show'
                                            }
                                        </button>

                                    </div>


                                    {
                                        confirmPassword && (
                                            <div
                                                className={
                                                    passwordsMatch
                                                        ? 'password-match password-match-success'
                                                        : 'password-match password-match-error'
                                                }
                                            >
                                                {
                                                    passwordsMatch
                                                        ? '✓ Passwords match'
                                                        : 'Passwords do not match'
                                                }
                                            </div>
                                        )
                                    }

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-primary auth-submit-button"
                                    disabled={
                                        loading ||
                                        !formIsValid
                                    }
                                >
                                    {
                                        loading
                                            ? (
                                                <>
                                                    <span className="auth-spinner" />
                                                    Creating account...
                                                </>
                                            )
                                            : 'Create account'
                                    }
                                </button>

                            </form>


                            <div className="auth-switch">

                                <span>
                                    Already have an account?
                                </span>

                                <Link to="/login">
                                    Sign in
                                </Link>

                            </div>


                            <div className="auth-security-note">
                                <span>✓</span>
                                Your account information is used
                                to personalise your SmartShop
                                experience.
                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    )
}


function AuthBenefit({
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


function PasswordRule({
    passed,
    text
}) {

    return (
        <span
            className={
                passed
                    ? 'password-rule password-rule-valid'
                    : 'password-rule'
            }
        >
            <span>
                {passed ? '✓' : '○'}
            </span>

            {text}
        </span>
    )
}


export default Register