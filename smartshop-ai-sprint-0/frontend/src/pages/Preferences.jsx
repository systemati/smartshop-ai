import {
    useEffect,
    useMemo,
    useState
} from 'react'

import {
    useNavigate
} from 'react-router-dom'

import api from '../services/api'

import {
    getStoredUser
} from '../services/auth'

import PageHeader
    from '../components/PageHeader'

import Toast
    from '../components/Toast'

import LoadingState
    from '../components/LoadingState'

import ErrorState
    from '../components/ErrorState'


const SOUTH_AFRICAN_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
]


function Preferences() {

    const navigate =
        useNavigate()

    const user =
        getStoredUser()


    const [categories, setCategories] =
        useState('')

    const [colours, setColours] =
        useState('')

    const [stores, setStores] =
        useState('')

    const [hobbies, setHobbies] =
        useState('')

    const [budget, setBudget] =
        useState('')

    const [deliveryLocation, setDeliveryLocation] =
        useState('')


    const [loading, setLoading] =
        useState(true)

    const [saving, setSaving] =
        useState(false)

    const [error, setError] =
        useState('')

    const [toast, setToast] =
        useState({
            message: '',
            type: 'success'
        })


    // ========================================================
    // HELPERS
    // ========================================================

    const arrayToText =
        value => {

            if (
                Array.isArray(
                    value
                )
            ) {

                return value.join(
                    ', '
                )
            }


            if (
                typeof value === 'string'
            ) {

                try {

                    const parsed =
                        JSON.parse(
                            value
                        )

                    if (
                        Array.isArray(
                            parsed
                        )
                    ) {

                        return parsed.join(
                            ', '
                        )
                    }

                } catch {

                    return value
                }
            }


            return ''
        }


    const textToArray =
        value => {

            return value
                .split(',')
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
        }


    // ========================================================
    // LOAD
    // ========================================================

    const loadPreferences =
        async () => {

            try {

                setLoading(true)
                setError('')


                const response =
                    await api.get(
                        '/api/preferences/'
                    )


                const data =
                    response.data || {}


                setCategories(
                    arrayToText(
                        data.favourite_categories
                    )
                )


                setColours(
                    arrayToText(
                        data.favourite_colours
                    )
                )


                setStores(
                    arrayToText(
                        data.preferred_stores
                    )
                )


                setHobbies(
                    arrayToText(
                        data.hobbies
                    )
                )


                setBudget(
                    data.maximum_budget
                    ?? ''
                )


                setDeliveryLocation(
                    data.delivery_location
                    ?? ''
                )


            } catch (err) {

                console.error(
                    'Preferences load error:',
                    err
                )


                if (
                    err.response?.status === 401
                ) {

                    setError(
                        'Your session has expired. Please sign in again.'
                    )

                    return
                }


                setError(
                    err.response
                        ?.data
                        ?.detail
                    ||
                    'Unable to load your preferences.'
                )


            } finally {

                setLoading(false)
            }
        }


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        if (user) {

            loadPreferences()

        } else {

            setLoading(false)
        }

    }, [])


    // ========================================================
    // SAVE
    // ========================================================

    const handleSubmit =
        async event => {

            event.preventDefault()


            if (
                budget !== '' &&
                Number(budget) < 0
            ) {

                setToast({
                    message:
                        'Maximum budget cannot be negative.',
                    type:
                        'error'
                })

                return
            }


            try {

                setSaving(true)
                setError('')


                const payload = {

                    favourite_categories:
                        textToArray(
                            categories
                        ),

                    favourite_colours:
                        textToArray(
                            colours
                        ),

                    preferred_stores:
                        textToArray(
                            stores
                        ),

                    hobbies:
                        textToArray(
                            hobbies
                        ),

                    maximum_budget:
                        budget !== ''
                            ? Number(
                                budget
                            )
                            : null,

                    delivery_location:
                        deliveryLocation
                        || null
                }


                await api.put(
                    '/api/preferences/',
                    payload
                )


                setToast({
                    message:
                        'Preferences saved successfully.',
                    type:
                        'success'
                })


            } catch (err) {

                console.error(
                    'Preferences save error:',
                    err
                )


                if (
                    err.response?.status === 401
                ) {

                    setError(
                        'Your session has expired. Please sign in again.'
                    )

                    return
                }


                setToast({
                    message:
                        err.response
                            ?.data
                            ?.detail
                        ||
                        'Unable to save your preferences.',
                    type:
                        'error'
                })


            } finally {

                setSaving(false)
            }
        }


    // ========================================================
    // SIGNALS
    // ========================================================

    const categoryItems =
        useMemo(
            () =>
                textToArray(
                    categories
                ),
            [categories]
        )


    const colourItems =
        useMemo(
            () =>
                textToArray(
                    colours
                ),
            [colours]
        )


    const storeItems =
        useMemo(
            () =>
                textToArray(
                    stores
                ),
            [stores]
        )


    const hobbyItems =
        useMemo(
            () =>
                textToArray(
                    hobbies
                ),
            [hobbies]
        )


    const signalCount =
        categoryItems.length +
        colourItems.length +
        storeItems.length +
        hobbyItems.length +
        (
            budget !== ''
                ? 1
                : 0
        )


    const profileStrength =
        signalCount >= 8
            ? 'Strong'
            : signalCount >= 4
                ? 'Good'
                : signalCount >= 1
                    ? 'Developing'
                    : 'Getting started'


    // ========================================================
    // AUTH
    // ========================================================

    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        Personalisation
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to personalise SmartShop
                    </h2>

                    <p className="text-muted mb-4">

                        Your shopping preferences help
                        SmartShop make product
                        recommendations more relevant.

                    </p>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                            navigate(
                                '/login'
                            )
                        }
                    >
                        Sign in
                    </button>

                </div>

            </div>
        )
    }


    // ========================================================
    // UI
    // ========================================================

    return (

        <main className="preferences-page-v2">

            <Toast
                message={
                    toast.message
                }
                type={
                    toast.type
                }
                onClose={() =>
                    setToast({
                        message: '',
                        type: 'success'
                    })
                }
            />


            <div className="container py-5">

                <PageHeader
                    badge="Personalisation"
                    title="Shopping Preferences"
                    description="Tell SmartShop what matters to you so your recommendations become more relevant over time."
                />


                {
                    loading && (

                        <LoadingState
                            title="Loading your preferences"
                            description="Preparing your SmartShop personalisation profile."
                            cards={2}
                        />
                    )
                }


                {
                    !loading &&
                    error && (

                        <ErrorState
                            title="We couldn't load your preferences"
                            message={
                                error
                            }
                            onRetry={
                                loadPreferences
                            }
                        />
                    )
                }


                {
                    !loading &&
                    !error && (

                        <>

                            <section className="preference-profile-card">

                                <div className="preference-profile-copy">

                                    <span className="preference-eyebrow">
                                        YOUR SHOPPING PROFILE
                                    </span>

                                    <h2>
                                        Personalisation profile
                                    </h2>

                                    <p>
                                        These preferences work
                                        alongside your searches,
                                        favourites and purchase
                                        history to improve your
                                        For You recommendations.
                                    </p>

                                </div>


                                <div className="preference-profile-stats">

                                    <PreferenceStat
                                        label="Profile strength"
                                        value={
                                            profileStrength
                                        }
                                        highlight
                                    />

                                    <PreferenceStat
                                        label="Preference signals"
                                        value={
                                            signalCount
                                        }
                                    />

                                    <PreferenceStat
                                        label="Default budget"
                                        value={
                                            budget !== ''
                                                ? `R${Number(
                                                    budget
                                                ).toLocaleString(
                                                    'en-ZA'
                                                )}`
                                                : 'Not set'
                                        }
                                    />

                                    <PreferenceStat
                                        label="Delivery province"
                                        value={
                                            deliveryLocation
                                            || 'Not set'
                                        }
                                    />

                                </div>

                            </section>


                            <section className="preference-form-card">

                                <div className="preference-form-heading">

                                    <div>

                                        <span className="preference-eyebrow">
                                            RECOMMENDATION SIGNALS
                                        </span>

                                        <h3>
                                            What do you prefer?
                                        </h3>

                                        <p>
                                            Add multiple values
                                            separated by commas.
                                            You can update these
                                            whenever your interests
                                            change.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() =>
                                            navigate(
                                                '/recommendations'
                                            )
                                        }
                                    >
                                        View For You
                                    </button>

                                </div>


                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    <div className="preference-field-grid">

                                        <PreferenceField
                                            label="Favourite Categories"
                                            description="Product categories you are most interested in."
                                            placeholder="Gaming, Technology, Shoes"
                                            value={
                                                categories
                                            }
                                            onChange={
                                                setCategories
                                            }
                                            items={
                                                categoryItems
                                            }
                                        />


                                        <PreferenceField
                                            label="Favourite Colours"
                                            description="Colours you commonly prefer when choosing products."
                                            placeholder="Black, Blue, White"
                                            value={
                                                colours
                                            }
                                            onChange={
                                                setColours
                                            }
                                            items={
                                                colourItems
                                            }
                                        />


                                        <PreferenceField
                                            label="Preferred Stores"
                                            description="Stores you generally prefer to shop from."
                                            placeholder="Takealot, Game"
                                            value={
                                                stores
                                            }
                                            onChange={
                                                setStores
                                            }
                                            items={
                                                storeItems
                                            }
                                        />


                                        <PreferenceField
                                            label="Interests & Hobbies"
                                            description="Interests that help SmartShop understand your lifestyle."
                                            placeholder="Gaming, Fitness, Music"
                                            value={
                                                hobbies
                                            }
                                            onChange={
                                                setHobbies
                                            }
                                            items={
                                                hobbyItems
                                            }
                                        />


                                        <div className="preference-field preference-budget-field">

                                            <div className="preference-field-header">

                                                <div>

                                                    <label htmlFor="preference-budget">
                                                        Preferred Maximum Budget
                                                    </label>

                                                    <p>
                                                        Used as a budget signal
                                                        when SmartShop ranks
                                                        recommendations.
                                                    </p>

                                                </div>

                                                <span className="preference-field-icon">
                                                    R
                                                </span>

                                            </div>


                                            <div className="preference-budget-input">

                                                <span>
                                                    R
                                                </span>

                                                <input
                                                    id="preference-budget"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="1500"
                                                    value={
                                                        budget
                                                    }
                                                    onChange={
                                                        event =>
                                                            setBudget(
                                                                event.target.value
                                                            )
                                                    }
                                                />

                                            </div>


                                            <div className="preference-budget-note">

                                                {
                                                    budget !== ''
                                                        ? (
                                                            <>
                                                                Your current
                                                                preferred ceiling is
                                                                {' '}
                                                                <strong>
                                                                    R
                                                                    {
                                                                        Number(
                                                                            budget
                                                                        ).toLocaleString(
                                                                            'en-ZA'
                                                                        )
                                                                    }
                                                                </strong>
                                                                .
                                                            </>
                                                        )
                                                        : (
                                                            'No default budget has been set.'
                                                        )
                                                }

                                            </div>

                                        </div>


                                        <div className="preference-field">

                                            <div className="preference-field-header">

                                                <div>

                                                    <label htmlFor="delivery-location">
                                                        Delivery Province
                                                    </label>

                                                    <p>
                                                        Used to estimate shipping
                                                        from the product location
                                                        to your destination.
                                                    </p>

                                                </div>

                                                <span className="preference-field-icon">
                                                    ⌖
                                                </span>

                                            </div>


                                            <select
                                                id="delivery-location"
                                                className="preference-text-input"
                                                value={
                                                    deliveryLocation
                                                }
                                                onChange={
                                                    event =>
                                                        setDeliveryLocation(
                                                            event.target.value
                                                        )
                                                }
                                            >

                                                <option value="">
                                                    Select your province
                                                </option>

                                                {
                                                    SOUTH_AFRICAN_PROVINCES.map(
                                                        province => (

                                                            <option
                                                                key={
                                                                    province
                                                                }
                                                                value={
                                                                    province
                                                                }
                                                            >
                                                                {province}
                                                            </option>

                                                        )
                                                    )
                                                }

                                            </select>


                                            <span className="preference-empty-hint">

                                                {
                                                    deliveryLocation
                                                        ? `Shipping destination: ${deliveryLocation}`
                                                        : 'No delivery province selected yet'
                                                }

                                            </span>

                                        </div>

                                    </div>


                                    <div className="preference-form-footer">

                                        <div className="preference-ai-note">

                                            <span>
                                                ✦
                                            </span>

                                            <div>

                                                <strong>
                                                    SmartShop AI
                                                </strong>

                                                <small>
                                                    Preferences improve
                                                    recommendations, while
                                                    your delivery province
                                                    is used for shipping
                                                    estimates.
                                                </small>

                                            </div>

                                        </div>


                                        <div className="preference-actions">

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={
                                                    loadPreferences
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                Reset Changes
                                            </button>


                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={
                                                    saving
                                                }
                                            >

                                                {
                                                    saving
                                                        ? 'Saving...'
                                                        : 'Save Preferences'
                                                }

                                            </button>

                                        </div>

                                    </div>

                                </form>

                            </section>

                        </>
                    )
                }

            </div>

        </main>
    )
}


// ============================================================
// PREFERENCE FIELD
// ============================================================

function PreferenceField({
    label,
    description,
    placeholder,
    value,
    onChange,
    items
}) {

    return (

        <div className="preference-field">

            <div className="preference-field-header">

                <div>

                    <label>
                        {label}
                    </label>

                    <p>
                        {description}
                    </p>

                </div>


                <span className="preference-field-count">
                    {
                        items.length
                    }
                </span>

            </div>


            <input
                type="text"
                className="preference-text-input"
                placeholder={
                    placeholder
                }
                value={
                    value
                }
                onChange={
                    event =>
                        onChange(
                            event.target.value
                        )
                }
            />


            {
                items.length > 0
                    ? (

                        <div className="preference-tags">

                            {
                                items.map(
                                    item => (

                                        <span
                                            className="preference-tag"
                                            key={
                                                item
                                            }
                                        >
                                            {item}
                                        </span>
                                    )
                                )
                            }

                        </div>

                    )
                    : (

                        <span className="preference-empty-hint">
                            No preferences added yet
                        </span>
                    )
            }

        </div>
    )
}


// ============================================================
// PROFILE STAT
// ============================================================

function PreferenceStat({
    label,
    value,
    highlight = false
}) {

    return (

        <div
            className={
                highlight
                    ? 'preference-stat preference-stat-highlight'
                    : 'preference-stat'
            }
        >

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    )
}


export default Preferences