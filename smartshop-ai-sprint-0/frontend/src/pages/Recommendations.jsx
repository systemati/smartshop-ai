import {
    useEffect,
    useState
} from 'react'

import {
    useNavigate
} from 'react-router-dom'

import api from '../services/api'

import {
    getStoredUser
} from '../services/auth'

import ProductCard
    from '../components/ProductCard'

import PageHeader
    from '../components/PageHeader'

import {
    getRecommendationCollectionInsights
} from '../utils/recommendationInsights'


function Recommendations() {

    const navigate =
        useNavigate()

    const user =
        getStoredUser()


    const [query, setQuery] =
        useState('')

    const [budget, setBudget] =
        useState('')

    const [products, setProducts] =
        useState([])

    const [
        recommendationData,
        setRecommendationData
    ] = useState(null)

    const [loading, setLoading] =
        useState(true)

    const [loaded, setLoaded] =
        useState(false)

    const [error, setError] =
        useState('')

    const [message, setMessage] =
        useState('')


    // ========================================================
    // LOAD RECOMMENDATIONS
    // ========================================================

    const loadRecommendations =
        async (
            searchQuery = '',
            requestedBudget = ''
        ) => {

            try {

                setLoading(true)
                setError('')
                setMessage('')

                const response =
                    await api.post(
                        '/api/recommendations/',
                        {
                            query:
                                searchQuery.trim(),

                            budget:
                                requestedBudget !== ''
                                    ? Number(
                                        requestedBudget
                                    )
                                    : null,

                            limit: 12
                        }
                    )

                const data =
                    response.data

                setRecommendationData(
                    data
                )

                if (
                    Array.isArray(
                        data
                    )
                ) {

                    setProducts(
                        data
                    )

                } else if (
                    Array.isArray(
                        data?.recommendations
                    )
                ) {

                    setProducts(
                        data.recommendations
                    )

                } else if (
                    Array.isArray(
                        data?.products
                    )
                ) {

                    setProducts(
                        data.products
                    )

                } else {

                    setProducts(
                        []
                    )
                }

                setLoaded(true)

            } catch (err) {

                console.error(
                    'Recommendation error:',
                    err
                )

                if (
                    err.response?.status === 401
                ) {

                    setError(
                        'Your session has expired. Please login again.'
                    )

                    return
                }

                setError(
                    err.response
                        ?.data
                        ?.detail
                    ||
                    'Unable to load personalised recommendations.'
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

            loadRecommendations()

        } else {

            setLoading(false)
        }

    }, [])


    // ========================================================
    // REFINE
    // ========================================================

    const handleSubmit =
        event => {

            event.preventDefault()

            loadRecommendations(
                query,
                budget
            )
        }


    const handleReset =
        () => {

            setQuery('')
            setBudget('')

            loadRecommendations(
                '',
                ''
            )
        }


    // ========================================================
    // FAVOURITE
    // ========================================================

    const handleFavourite =
        async productId => {

            try {

                setMessage('')
                setError('')

                await api.post(
                    `/api/favourites/${productId}`
                )

                setMessage(
                    'Product added to favourites.'
                )

            } catch (err) {

                console.error(
                    'Favourite error:',
                    err
                )

                if (
                    err.response?.status === 401
                ) {

                    setError(
                        'Your session has expired. Please login again.'
                    )

                    return
                }

                setError(
                    err.response
                        ?.data
                        ?.detail
                    ||
                    'Unable to save this product.'
                )
            }
        }


    // ========================================================
    // PURCHASE
    // ========================================================

    const handlePurchase =
        async productId => {

            try {

                setMessage('')
                setError('')

                await api.post(
                    `/api/purchases/${productId}`
                )

                setMessage(
                    'Product marked as purchased. Your recommendations have been updated.'
                )

                await loadRecommendations(
                    query,
                    budget
                )

            } catch (err) {

                console.error(
                    'Purchase error:',
                    err
                )

                if (
                    err.response?.status === 409
                ) {

                    setError(
                        'This product is already in your purchase history.'
                    )

                    return
                }

                if (
                    err.response?.status === 401
                ) {

                    setError(
                        'Your session has expired. Please login again.'
                    )

                    return
                }

                setError(
                    err.response
                        ?.data
                        ?.detail
                    ||
                    'Unable to mark product as purchased.'
                )
            }
        }


    // ========================================================
    // BACKEND PERSONALISATION SIGNALS
    // ========================================================

    const signals =
        recommendationData?.signals ??
        {}

    const searchHistoryCount =
        Number(
            signals
                ?.search_history_count
            ?? 0
        )

    const favouritesCount =
        Number(
            signals
                ?.favourites_count
            ?? 0
        )

    const purchaseHistoryCount =
        Number(
            signals
                ?.purchase_history_count
            ?? 0
        )

    const preferencesActive =
        Boolean(
            signals
                ?.preferences
        )


    // ========================================================
    // PERSONALISATION STRENGTH
    // ========================================================

    const personalizationSignalCount =
        (
            (preferencesActive ? 1 : 0)
            +
            (searchHistoryCount > 0 ? 1 : 0)
            +
            (favouritesCount > 0 ? 1 : 0)
            +
            (purchaseHistoryCount > 0 ? 1 : 0)
        )


    const personalizationPercent =
        (
            personalizationSignalCount /
            4
        ) * 100


    const getStrengthLabel =
        () => {

            switch (
                personalizationSignalCount
            ) {

                case 4:
                    return 'Highly personalised'

                case 3:
                    return 'Strong'

                case 2:
                    return 'Good'

                case 1:
                    return 'Developing'

                default:
                    return 'Getting started'
            }
        }


    const strengthLabel =
        getStrengthLabel()


    // ========================================================
    // PREMIUM 5 — RECOMMENDATION COLLECTION INTELLIGENCE
    // ========================================================

    const collectionInsights =
        getRecommendationCollectionInsights(
            products
        )

    const averageMatch =
        collectionInsights.averageScore

    const dominantSignals =
        collectionInsights.dominantSignals

    const refinementActive =
        Boolean(
            query.trim()
            || budget !== ''
        )


    // ========================================================
    // AUTH GUARD
    // ========================================================

    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        AI Recommendations
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to unlock For You
                    </h2>

                    <p className="text-muted mb-4">

                        SmartShop uses your searches,
                        favourites, purchases and shopping
                        preferences to create personalised
                        recommendations.

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

        <main className="for-you-page">

            <div className="container py-5">

                <div className="for-you-header">

                    <PageHeader
                        badge="For You"
                        title="Recommendations built around you"
                        description="SmartShop AI learns from your preferences and shopping activity to rank products you're more likely to want."
                    />

                    <button
                        type="button"
                        className="btn btn-outline-primary for-you-preferences-button"
                        onClick={() =>
                            navigate(
                                '/preferences'
                            )
                        }
                    >
                        Update Preferences
                    </button>

                </div>


                {/* =============================================
                    PERSONALISATION PROFILE
                ============================================== */}

                {!loading &&
                    recommendationData &&
                    !Array.isArray(
                        recommendationData
                    ) && (

                        <section className="ai-profile-card">

                            <div className="ai-profile-top">

                                <div className="ai-profile-heading">

                                    <div className="ai-profile-icon">
                                        ✦
                                    </div>

                                    <div>

                                        <span className="ai-section-eyebrow">
                                            YOUR SMARTSHOP PROFILE
                                        </span>

                                        <h3>
                                            Personalisation intelligence
                                        </h3>

                                        <p>
                                            These signals help SmartShop
                                            understand what products are
                                            more relevant to you.
                                        </p>

                                    </div>

                                </div>


                                <div className="ai-strength-badge">

                                    <span className="ai-strength-dot" />

                                    {strengthLabel}

                                </div>

                            </div>


                            <div className="ai-signal-grid">

                                <SignalCard
                                    icon="◎"
                                    label="Preferences"
                                    value={
                                        preferencesActive
                                            ? 'Active'
                                            : 'Not set'
                                    }
                                    active={
                                        preferencesActive
                                    }
                                />

                                <SignalCard
                                    icon="⌕"
                                    label="Searches"
                                    value={
                                        searchHistoryCount
                                    }
                                    active={
                                        searchHistoryCount > 0
                                    }
                                />

                                <SignalCard
                                    icon="♡"
                                    label="Favourites"
                                    value={
                                        favouritesCount
                                    }
                                    active={
                                        favouritesCount > 0
                                    }
                                />

                                <SignalCard
                                    icon="✓"
                                    label="Purchases"
                                    value={
                                        purchaseHistoryCount
                                    }
                                    active={
                                        purchaseHistoryCount > 0
                                    }
                                />

                            </div>


                            <div className="ai-strength-section">

                                <div className="ai-strength-heading">

                                    <span>
                                        Personalisation strength
                                    </span>

                                    <strong>
                                        {strengthLabel}
                                    </strong>

                                </div>


                                <div
                                    className="ai-strength-track"
                                    role="progressbar"
                                    aria-valuenow={
                                        personalizationPercent
                                    }
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    aria-label="Personalisation strength"
                                >

                                    <span
                                        className="ai-strength-fill"
                                        style={{
                                            width:
                                                `${personalizationPercent}%`
                                        }}
                                    />

                                </div>


                                <div className="ai-profile-helper">

                                    <span>
                                        ✦
                                    </span>

                                    SmartShop gets smarter as
                                    you search, save products,
                                    update preferences and record
                                    purchases.

                                </div>

                            </div>

                        </section>
                    )
                }


                {/* =============================================
                    PREMIUM 5 — RECOMMENDATION INTELLIGENCE
                ============================================== */}

                {!loading &&
                    products.length > 0 && (

                    <section className="premium-recommendation-intelligence">

                        <div className="premium-recommendation-intelligence-top">

                            <div>
                                <span className="ai-section-eyebrow">
                                    SMARTSHOP AI INTELLIGENCE
                                </span>

                                <h3>
                                    What is shaping your recommendations?
                                </h3>

                                <p>
                                    SmartShop combines the signals in your shopping
                                    profile with your current request to rank the
                                    products shown below.
                                </p>
                            </div>

                            {averageMatch !== null && (
                                <div className="premium-average-match">
                                    <span>
                                        Average AI Match
                                    </span>

                                    <strong>
                                        {averageMatch}%
                                    </strong>
                                </div>
                            )}

                        </div>


                        <div className="premium-intelligence-summary-grid">

                            <div className="premium-intelligence-summary-card">

                                <span className="premium-intelligence-summary-label">
                                    Products analysed
                                </span>

                                <strong>
                                    {collectionInsights.total}
                                </strong>

                                <small>
                                    Current personalised recommendation set
                                </small>

                            </div>


                            <div className="premium-intelligence-summary-card">

                                <span className="premium-intelligence-summary-label">
                                    Ranking mode
                                </span>

                                <strong>
                                    {refinementActive
                                        ? 'Refined'
                                        : 'Personalised'}
                                </strong>

                                <small>
                                    {refinementActive
                                        ? 'Your current query or budget is influencing this ranking.'
                                        : 'Ranking is based on your existing SmartShop profile.'}
                                </small>

                            </div>


                            <div className="premium-intelligence-summary-card">

                                <span className="premium-intelligence-summary-label">
                                    Profile strength
                                </span>

                                <strong>
                                    {strengthLabel}
                                </strong>

                                <small>
                                    {personalizationSignalCount} of 4 profile signal groups active
                                </small>

                            </div>

                        </div>


                        {dominantSignals.length > 0 && (

                            <div className="premium-dominant-signals">

                                <div className="premium-dominant-signals-heading">

                                    <div>
                                        <span className="ai-section-eyebrow">
                                            DOMINANT SIGNALS
                                        </span>

                                        <h4>
                                            Strongest influences in these results
                                        </h4>
                                    </div>

                                    <span className="premium-live-intelligence-badge">
                                        ✦ Live intelligence
                                    </span>

                                </div>


                                <div className="premium-dominant-signal-grid">

                                    {dominantSignals.map(
                                        (
                                            signal,
                                            signalIndex
                                        ) => (

                                        <div
                                            className="premium-dominant-signal"
                                            key={signal.key}
                                        >

                                            <span className="premium-signal-rank">
                                                #{signalIndex + 1}
                                            </span>

                                            <div>
                                                <strong>
                                                    {signal.label}
                                                </strong>

                                                <small>
                                                    Contributing across your current recommendations
                                                </small>
                                            </div>

                                            <span className="premium-signal-points">
                                                +{Math.round(signal.value)}
                                            </span>

                                        </div>
                                    ))}

                                </div>

                            </div>
                        )}


                        <div className="premium-intelligence-explainer">

                            <span aria-hidden="true">
                                ✦
                            </span>

                            <p>
                                <strong>
                                    How to read this:
                                </strong>
                                {' '}
                                the dashboard summarises the recommendation data
                                returned for your current products. Open any product
                                to see its individual match quality, strongest signals
                                and “Why this matches you” explanation.
                            </p>

                        </div>

                    </section>
                )}


                {/* =============================================
                    REFINE
                ============================================== */}

                <section className="recommendation-refine-card">

                    <div className="recommendation-refine-header">

                        <div>

                            <span className="ai-section-eyebrow">
                                REFINE YOUR PICKS
                            </span>

                            <h3>
                                Looking for something specific today?
                            </h3>

                            <p>
                                Add a current need or maximum
                                budget and SmartShop will rerank
                                your recommendations.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="recommendation-refine-grid">

                            <div className="recommendation-field">

                                <label htmlFor="recommendation-query">
                                    What are you interested in?
                                </label>

                                <input
                                    id="recommendation-query"
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. gaming accessories"
                                    value={
                                        query
                                    }
                                    onChange={
                                        event =>
                                            setQuery(
                                                event.target.value
                                            )
                                    }
                                    disabled={
                                        loading
                                    }
                                />

                            </div>


                            <div className="recommendation-field">

                                <label htmlFor="recommendation-budget">
                                    Maximum budget
                                </label>

                                <div className="recommendation-budget-input">

                                    <span>
                                        R
                                    </span>

                                    <input
                                        id="recommendation-budget"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="form-control"
                                        placeholder="2500"
                                        value={
                                            budget
                                        }
                                        onChange={
                                            event =>
                                                setBudget(
                                                    event.target.value
                                                )
                                        }
                                        disabled={
                                            loading
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="recommendation-refine-actions">

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={
                                    loading
                                }
                            >

                                {
                                    loading
                                        ? 'Ranking products...'
                                        : 'Update Recommendations'
                                }

                            </button>


                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={
                                    handleReset
                                }
                                disabled={
                                    loading
                                }
                            >
                                Reset
                            </button>

                        </div>

                    </form>

                </section>


                {/* =============================================
                    SUCCESS / ERROR
                ============================================== */}

                {message && (

                    <div
                        className="alert alert-success smartshop-inline-alert"
                        role="status"
                    >
                        <strong>Done.</strong>
                        {' '}
                        {message}
                    </div>

                )}


                {error && (

                    <div
                        className="alert alert-danger smartshop-inline-alert"
                        role="alert"
                    >

                        <strong>
                            Something went wrong.
                        </strong>

                        {' '}

                        {error}

                    </div>

                )}


                {/* =============================================
                    LOADING
                ============================================== */}

                {loading && (

                    <RecommendationLoading />

                )}


                {/* =============================================
                    RESULTS
                ============================================== */}

                {!loading &&
                    products.length > 0 && (

                        <section className="for-you-results">

                            <div className="for-you-results-header">

                                <div>

                                    <span className="ai-section-eyebrow">
                                        PERSONALISED RECOMMENDATIONS
                                    </span>

                                    <h2>
                                        Top Picks for You
                                    </h2>

                                    <p>
                                        {
                                            products.length
                                        }
                                        {' '}
                                        product
                                        {
                                            products.length !== 1
                                                ? 's'
                                                : ''
                                        }
                                        {' '}
                                        ranked using your
                                        SmartShop profile.
                                    </p>

                                </div>


                                <div className="ai-ranked-badge">

                                    <span>
                                        ✦
                                    </span>

                                    Ranked by AI Match

                                </div>

                            </div>


                            <div className="row g-4">

                                {
                                    products.map(
                                        (
                                            product,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    product.product_id
                                                    ??
                                                    product.id
                                                    ??
                                                    index
                                                }
                                                className="col-md-6 col-xl-4"
                                            >

                                                <ProductCard
                                                    product={
                                                        product
                                                    }
                                                    index={
                                                        index
                                                    }
                                                    topPick={
                                                        (
                                                            product
                                                                ?.recommendation_rank
                                                            ??
                                                            index + 1
                                                        ) === 1
                                                    }
                                                    showScore={
                                                        true
                                                    }
                                                    showBreakdown={
                                                        true
                                                    }
                                                    onFavourite={
                                                        handleFavourite
                                                    }
                                                    onPurchase={
                                                        handlePurchase
                                                    }
                                                />

                                            </div>
                                        )
                                    )
                                }

                            </div>

                        </section>
                    )
                }


                {/* =============================================
                    EMPTY STATE
                ============================================== */}

                {!loading &&
                    loaded &&
                    !error &&
                    products.length === 0 && (

                        <section className="for-you-empty-state">

                            <div className="for-you-empty-icon">
                                ✦
                            </div>

                            <span className="ai-section-eyebrow">
                                BUILD YOUR PROFILE
                            </span>

                            <h3>
                                Help SmartShop learn what you like
                            </h3>

                            <p>
                                We don't have enough information
                                to build strong recommendations yet.
                                Search for products, save favourites,
                                record purchases or update your
                                preferences.
                            </p>


                            <div className="for-you-empty-actions">

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate(
                                            '/search'
                                        )
                                    }
                                >
                                    Search Products
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() =>
                                        navigate(
                                            '/preferences'
                                        )
                                    }
                                >
                                    Update Preferences
                                </button>

                            </div>

                        </section>
                    )
                }

            </div>

        </main>
    )
}


// ============================================================
// SIGNAL CARD
// ============================================================

function SignalCard({
    icon,
    label,
    value,
    active
}) {

    return (

        <div
            className={
                active
                    ? 'ai-signal-card ai-signal-card-active'
                    : 'ai-signal-card'
            }
        >

            <div className="ai-signal-icon">
                {icon}
            </div>

            <div className="ai-signal-content">

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

            </div>


            <div
                className={
                    active
                        ? 'ai-signal-status ai-signal-status-active'
                        : 'ai-signal-status'
                }
            />

        </div>
    )
}


// ============================================================
// LOADING SKELETON
// ============================================================

function RecommendationLoading() {

    return (

        <section className="recommendation-loading-v2">

            <div className="recommendation-loading-heading">

                <div className="ai-loading-icon">
                    ✦
                </div>

                <div>

                    <h3>
                        Building your recommendations
                    </h3>

                    <p>
                        SmartShop is ranking products using
                        your shopping profile.
                    </p>

                </div>

            </div>


            <div className="row g-4">

                {
                    [1, 2, 3].map(
                        item => (

                            <div
                                key={item}
                                className="col-md-6 col-xl-4"
                            >

                                <div className="ai-skeleton-card">

                                    <div className="ai-skeleton-image" />

                                    <div className="ai-skeleton-body">

                                        <div className="ai-skeleton-line ai-skeleton-short" />

                                        <div className="ai-skeleton-line ai-skeleton-title" />

                                        <div className="ai-skeleton-line" />

                                        <div className="ai-skeleton-line ai-skeleton-medium" />

                                        <div className="ai-skeleton-button" />

                                    </div>

                                </div>

                            </div>
                        )
                    )
                }

            </div>

        </section>
    )
}


export default Recommendations