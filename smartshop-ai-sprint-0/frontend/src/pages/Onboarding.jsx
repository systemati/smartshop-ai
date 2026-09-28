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

const STEPS = [
    {
        number: 1,
        label: 'Interests'
    },
    {
        number: 2,
        label: 'Style'
    },
    {
        number: 3,
        label: 'Budget'
    },
    {
        number: 4,
        label: 'Delivery'
    }
]


function Onboarding() {

    const navigate = useNavigate()
    const user = getStoredUser()

    const [step, setStep] = useState(1)

    const [categories, setCategories] = useState('')
    const [colours, setColours] = useState('')
    const [stores, setStores] = useState('')
    const [hobbies, setHobbies] = useState('')
    const [budget, setBudget] = useState('')
    const [deliveryLocation, setDeliveryLocation] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [toast, setToast] = useState({
        message: '',
        type: 'success'
    })


    const arrayToText = value => {

        if (Array.isArray(value)) {
            return value.join(', ')
        }

        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value)

                if (Array.isArray(parsed)) {
                    return parsed.join(', ')
                }
            } catch {
                return value
            }
        }

        return ''
    }


    const textToArray = value =>
        value
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)


    useEffect(() => {

        if (!user) {
            setLoading(false)
            return
        }

        const load = async () => {

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
                    'Onboarding load error:',
                    err
                )

                setError(
                    err.response
                        ?.data
                        ?.detail
                    ||
                    'Unable to prepare your personalisation setup.'
                )

            } finally {
                setLoading(false)
            }
        }

        load()

    }, [])


    const categoryItems =
        useMemo(
            () => textToArray(categories),
            [categories]
        )

    const colourItems =
        useMemo(
            () => textToArray(colours),
            [colours]
        )

    const storeItems =
        useMemo(
            () => textToArray(stores),
            [stores]
        )

    const hobbyItems =
        useMemo(
            () => textToArray(hobbies),
            [hobbies]
        )

    const signalCount =
        categoryItems.length +
        colourItems.length +
        storeItems.length +
        hobbyItems.length +
        (budget !== '' ? 1 : 0)


    const nextStep = () => {

        if (step === 1) {

            if (
                categoryItems.length === 0 &&
                hobbyItems.length === 0
            ) {
                setToast({
                    message:
                        'Add at least one category or interest to continue.',
                    type:
                        'error'
                })

                return
            }
        }

        if (step === 3) {

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
        }

        setToast({
            message: '',
            type: 'success'
        })

        setStep(current =>
            Math.min(
                current + 1,
                STEPS.length
            )
        )
    }


    const previousStep = () => {

        setToast({
            message: '',
            type: 'success'
        })

        setStep(current =>
            Math.max(
                current - 1,
                1
            )
        )
    }


    const completeOnboarding =
        async () => {

            if (!deliveryLocation) {

                setToast({
                    message:
                        'Choose your delivery province to complete setup.',
                    type:
                        'error'
                })

                return
            }

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
                        categoryItems,

                    favourite_colours:
                        colourItems,

                    preferred_stores:
                        storeItems,

                    hobbies:
                        hobbyItems,

                    maximum_budget:
                        budget !== ''
                            ? Number(budget)
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
                        'Your SmartShop profile is ready.',
                    type:
                        'success'
                })

                window.setTimeout(
                    () => {
                        navigate(
                            '/recommendations'
                        )
                    },
                    450
                )

            } catch (err) {

                console.error(
                    'Onboarding save error:',
                    err
                )

                setToast({
                    message:
                        err.response
                            ?.data
                            ?.detail
                        ||
                        'Unable to save your personalisation setup.',
                    type:
                        'error'
                })

            } finally {
                setSaving(false)
            }
        }


    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        Personalisation Setup
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to set up SmartShop
                    </h2>

                    <p className="text-muted mb-4">
                        Your shopping profile is linked to
                        your SmartShop account.
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


    return (

        <main className="premium-onboarding-page">

            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast({
                        message: '',
                        type: 'success'
                    })
                }
            />

            <div className="container py-5">

                <section className="premium-onboarding-shell">

                    <div className="premium-onboarding-intro">

                        <span className="premium-onboarding-eyebrow">
                            SMARTSHOP AI SETUP
                        </span>

                        <h1>
                            Make SmartShop yours.
                        </h1>

                        <p>
                            A few shopping signals help SmartShop
                            rank products around your interests,
                            preferences, budget and delivery destination.
                        </p>

                        <div className="premium-onboarding-strength">

                            <span>
                                Profile signals
                            </span>

                            <strong>
                                {signalCount}
                            </strong>

                        </div>

                    </div>


                    <div className="premium-onboarding-workspace">

                        <div className="premium-onboarding-progress">

                            {STEPS.map(item => (

                                <div
                                    className={
                                        item.number === step
                                            ? 'premium-onboarding-step active'
                                            : item.number < step
                                                ? 'premium-onboarding-step complete'
                                                : 'premium-onboarding-step'
                                    }
                                    key={item.number}
                                >
                                    <span>
                                        {item.number < step
                                            ? '✓'
                                            : item.number}
                                    </span>

                                    <small>
                                        {item.label}
                                    </small>
                                </div>
                            ))}

                        </div>


                        {loading && (

                            <LoadingState
                                title="Preparing your profile"
                                description="Loading any preferences you have already saved."
                                cards={2}
                            />
                        )}


                        {!loading && error && (

                            <ErrorState
                                title="We couldn't prepare onboarding"
                                message={error}
                            />
                        )}


                        {!loading && !error && (

                            <>

                                {step === 1 && (

                                    <OnboardingPanel
                                        eyebrow="STEP 1 OF 4"
                                        title="What are you into?"
                                        description="Start with the categories and interests that best describe what you shop for."
                                    >
                                        <OnboardingTextField
                                            label="Favourite categories"
                                            hint="Separate multiple values with commas."
                                            placeholder="Gaming, Technology, Shoes"
                                            value={categories}
                                            onChange={setCategories}
                                            items={categoryItems}
                                        />

                                        <OnboardingTextField
                                            label="Interests & hobbies"
                                            hint="Lifestyle signals can improve discovery."
                                            placeholder="Gaming, Fitness, Music"
                                            value={hobbies}
                                            onChange={setHobbies}
                                            items={hobbyItems}
                                        />
                                    </OnboardingPanel>
                                )}


                                {step === 2 && (

                                    <OnboardingPanel
                                        eyebrow="STEP 2 OF 4"
                                        title="Shape your shopping style"
                                        description="Tell SmartShop which colours and stores you commonly prefer."
                                    >
                                        <OnboardingTextField
                                            label="Favourite colours"
                                            hint="Add the colours you normally choose."
                                            placeholder="Black, Blue, White"
                                            value={colours}
                                            onChange={setColours}
                                            items={colourItems}
                                        />

                                        <OnboardingTextField
                                            label="Preferred stores"
                                            hint="Add stores you generally like shopping from."
                                            placeholder="Takealot, Game"
                                            value={stores}
                                            onChange={setStores}
                                            items={storeItems}
                                        />
                                    </OnboardingPanel>
                                )}


                                {step === 3 && (

                                    <OnboardingPanel
                                        eyebrow="STEP 3 OF 4"
                                        title="Set your shopping budget"
                                        description="Your default budget becomes a recommendation signal and powers SmartShop's budget intelligence."
                                    >
                                        <div className="premium-onboarding-budget">

                                            <label htmlFor="onboarding-budget">
                                                Preferred maximum budget
                                            </label>

                                            <div className="premium-onboarding-money-input">
                                                <span>R</span>

                                                <input
                                                    id="onboarding-budget"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="1500"
                                                    value={budget}
                                                    onChange={event =>
                                                        setBudget(
                                                            event.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <small>
                                                You can change this at any time
                                                from Shopping Preferences.
                                            </small>

                                        </div>
                                    </OnboardingPanel>
                                )}


                                {step === 4 && (

                                    <OnboardingPanel
                                        eyebrow="STEP 4 OF 4"
                                        title="Where should we estimate delivery?"
                                        description="Your province lets SmartShop calculate destination-aware shipping estimates and delivered-price matching."
                                    >
                                        <div className="premium-onboarding-province">

                                            <label htmlFor="onboarding-province">
                                                Delivery province
                                            </label>

                                            <select
                                                id="onboarding-province"
                                                value={deliveryLocation}
                                                onChange={event =>
                                                    setDeliveryLocation(
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select your province
                                                </option>

                                                {SOUTH_AFRICAN_PROVINCES.map(
                                                    province => (
                                                        <option
                                                            key={province}
                                                            value={province}
                                                        >
                                                            {province}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <div className="premium-onboarding-ready-card">
                                                <span>✦</span>

                                                <div>
                                                    <strong>
                                                        Your profile is almost ready
                                                    </strong>

                                                    <small>
                                                        SmartShop will combine these
                                                        preferences with searches,
                                                        favourites and purchases as
                                                        your profile develops.
                                                    </small>
                                                </div>
                                            </div>

                                        </div>
                                    </OnboardingPanel>
                                )}


                                <div className="premium-onboarding-actions">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        disabled={
                                            step === 1
                                            || saving
                                        }
                                        onClick={previousStep}
                                    >
                                        Back
                                    </button>

                                    <span>
                                        {step} of {STEPS.length}
                                    </span>

                                    {step < STEPS.length
                                        ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={nextStep}
                                            >
                                                Continue
                                            </button>
                                        )
                                        : (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={saving}
                                                onClick={completeOnboarding}
                                            >
                                                {saving
                                                    ? 'Saving profile...'
                                                    : 'Finish & View For You'}
                                            </button>
                                        )
                                    }

                                </div>

                            </>
                        )}

                    </div>

                </section>

            </div>

        </main>
    )
}


function OnboardingPanel({
    eyebrow,
    title,
    description,
    children
}) {

    return (

        <section className="premium-onboarding-panel">

            <span className="premium-onboarding-panel-eyebrow">
                {eyebrow}
            </span>

            <h2>
                {title}
            </h2>

            <p>
                {description}
            </p>

            <div className="premium-onboarding-fields">
                {children}
            </div>

        </section>
    )
}


function OnboardingTextField({
    label,
    hint,
    placeholder,
    value,
    onChange,
    items
}) {

    return (

        <div className="premium-onboarding-field">

            <label>
                {label}
            </label>

            <small>
                {hint}
            </small>

            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={event =>
                    onChange(
                        event.target.value
                    )
                }
            />

            {items.length > 0 && (

                <div className="premium-onboarding-tags">

                    {items.map(item => (
                        <span key={item}>
                            {item}
                        </span>
                    ))}

                </div>
            )}

        </div>
    )
}


export default Onboarding
