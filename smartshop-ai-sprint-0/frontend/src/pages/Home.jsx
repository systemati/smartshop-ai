import {
    useEffect,
    useMemo,
    useState
} from 'react'

import {
    Link,
    useNavigate
} from 'react-router-dom'

import api from '../services/api'

import {
    getStoredUser
} from '../services/auth'

import ProductCard
    from '../components/ProductCard'

import {
    useRecentlyViewed
} from '../context/RecentlyViewedContext'

import {
    useComparison
} from '../context/ComparisonContext'

import { analyseBudget } from '../utils/budgetOptimizer'


function Home() {

    const navigate =
        useNavigate()


    const {
        products: recentlyViewed,
        clearViewed
    } = useRecentlyViewed()

    const {
        addProduct,
        removeProduct,
        isCompared,
        count: comparisonCount,
        maxProducts
    } = useComparison()

    const user =
        getStoredUser()


    const [query, setQuery] =
        useState('')

    const [loading, setLoading] =
        useState(Boolean(user))

    const [dashboardError, setDashboardError] =
        useState('')

    const [favourites, setFavourites] =
        useState([])

    const [purchases, setPurchases] =
        useState([])

    const [history, setHistory] =
        useState([])

    const [recommendations, setRecommendations] =
        useState([])

    const [preferences, setPreferences] =
        useState({})


    const arrayFrom =
        (data, keys = []) => {

            if (Array.isArray(data)) {
                return data
            }

            for (const key of keys) {

                if (Array.isArray(data?.[key])) {
                    return data[key]
                }
            }

            return []
        }


    useEffect(() => {

        if (!user) {
            setLoading(false)
            return
        }


        let active = true


        const loadDashboard =
            async () => {

                try {

                    setLoading(true)
                    setDashboardError('')


                    const results =
                        await Promise.allSettled([

                            api.get(
                                '/api/favourites/'
                            ),

                            api.get(
                                '/api/purchases/'
                            ),

                            api.get(
                                '/api/history/'
                            ),

                            api.get(
                                '/api/preferences/'
                            ),

                            api.post(
                                '/api/recommendations/',
                                {
                                    query: '',
                                    budget: null,
                                    limit: 3
                                }
                            )

                        ])


                    if (!active) {
                        return
                    }


                    const [
                        favouriteResult,
                        purchaseResult,
                        historyResult,
                        preferenceResult,
                        recommendationResult
                    ] = results


                    if (
                        favouriteResult.status
                        === 'fulfilled'
                    ) {

                        setFavourites(
                            arrayFrom(
                                favouriteResult.value.data,
                                [
                                    'favourites',
                                    'products'
                                ]
                            )
                        )
                    }


                    if (
                        purchaseResult.status
                        === 'fulfilled'
                    ) {

                        setPurchases(
                            arrayFrom(
                                purchaseResult.value.data,
                                [
                                    'purchases'
                                ]
                            )
                        )
                    }


                    if (
                        historyResult.status
                        === 'fulfilled'
                    ) {

                        setHistory(
                            arrayFrom(
                                historyResult.value.data,
                                [
                                    'history',
                                    'searches'
                                ]
                            )
                        )
                    }


                    if (
                        preferenceResult.status
                        === 'fulfilled'
                    ) {

                        setPreferences(
                            preferenceResult.value.data
                            || {}
                        )
                    }


                    if (
                        recommendationResult.status
                        === 'fulfilled'
                    ) {

                        setRecommendations(
                            arrayFrom(
                                recommendationResult.value.data,
                                [
                                    'recommendations',
                                    'products'
                                ]
                            ).slice(0, 3)
                        )
                    }


                    const failedCount =
                        results.filter(
                            result =>
                                result.status
                                === 'rejected'
                        ).length


                    if (
                        failedCount ===
                        results.length
                    ) {

                        setDashboardError(
                            'SmartShop could not load your dashboard activity.'
                        )

                    } else if (
                        failedCount > 0
                    ) {

                        setDashboardError(
                            'Some dashboard information could not be refreshed.'
                        )
                    }


                } catch (err) {

                    console.error(
                        'Dashboard error:',
                        err
                    )

                    if (active) {

                        setDashboardError(
                            'SmartShop could not load your dashboard.'
                        )
                    }


                } finally {

                    if (active) {
                        setLoading(false)
                    }
                }
            }


        loadDashboard()


        return () => {
            active = false
        }

    }, [])


    const displayName =
        user?.full_name
        ??
        user?.name
        ??
        user?.email
            ?.split('@')[0]
        ??
        'Shopper'


    const firstName =
        String(displayName)
            .trim()
            .split(/\s+/)[0]


    const deliveryLocation =
        preferences?.delivery_location
        || ''


    const savedBudget =
        Number(preferences?.maximum_budget ?? 0)

    const hasSavedBudget =
        Number.isFinite(savedBudget) && savedBudget > 0

    const budgetAnalyses =
        useMemo(
            () => hasSavedBudget
                ? recommendations.map(product =>
                    analyseBudget(product, savedBudget)
                )
                : [],
            [recommendations, savedBudget, hasSavedBudget]
        )

    const affordableCount =
        budgetAnalyses.filter(item => item.withinBudget).length


    const categories =
        Array.isArray(
            preferences?.favourite_categories
        )
            ? preferences.favourite_categories
            : []


    const colours =
        Array.isArray(
            preferences?.favourite_colours
        )
            ? preferences.favourite_colours
            : []


    const stores =
        Array.isArray(
            preferences?.preferred_stores
        )
            ? preferences.preferred_stores
            : []


    const hobbies =
        Array.isArray(
            preferences?.hobbies
        )
            ? preferences.hobbies
            : []


    const profileSignals =
        useMemo(
            () => [
                ...categories,
                ...colours,
                ...stores,
                ...hobbies
            ]
                .filter(Boolean)
                .slice(0, 7),
            [
                categories,
                colours,
                stores,
                hobbies
            ]
        )


    const preferenceSignalCount =
        categories.length
        + colours.length
        + stores.length
        + hobbies.length
        + (
            preferences?.maximum_budget
                ? 1
                : 0
        )


    const profileStrength =
        Math.min(
            100,
            Math.round(
                (
                    Math.min(
                        preferenceSignalCount,
                        6
                    )
                    / 6
                )
                * 100
            )
        )


    const handleSearch =
        event => {

            event.preventDefault()

            const cleanQuery =
                query.trim()

            if (!cleanQuery) {
                return
            }

            navigate(
                `/search?query=${encodeURIComponent(
                    cleanQuery
                )}`
            )
        }


    const handleFavourite =
        async productId => {

            try {

                await api.post(
                    `/api/favourites/${productId}`
                )

                const response =
                    await api.get(
                        '/api/favourites/'
                    )

                setFavourites(
                    arrayFrom(
                        response.data,
                        [
                            'favourites',
                            'products'
                        ]
                    )
                )

            } catch (err) {

                console.error(
                    'Dashboard favourite error:',
                    err
                )
            }
        }


    const handlePurchase =
        async productId => {

            try {

                await api.post(
                    `/api/purchases/${productId}`
                )

                const response =
                    await api.get(
                        '/api/purchases/'
                    )

                setPurchases(
                    arrayFrom(
                        response.data,
                        [
                            'purchases'
                        ]
                    )
                )

            } catch (err) {

                if (
                    err.response?.status !== 409
                ) {

                    console.error(
                        'Dashboard purchase error:',
                        err
                    )
                }
            }
        }


    // ========================================================
    // PUBLIC HOME
    // ========================================================

    if (!user) {

        return (

            <div className="savanna-home">

                <section className="savanna-hero">

                    <div className="container">

                        <div className="savanna-hero-panel">

                            <div className="savanna-hero-content">

                                <span className="smartshop-badge">
                                    Smarter Shopping
                                </span>

                                <h1>
                                    Find the best products{' '}
                                    <span>
                                        for your lifestyle.
                                    </span>
                                </h1>

                                <p>
                                    AI-powered recommendations,
                                    budget-aware search and smarter
                                    product discovery in one place.
                                </p>

                                <div className="savanna-hero-actions">

                                    <Link
                                        to="/register"
                                        className="btn btn-primary btn-lg"
                                    >
                                        Create Your SmartShop
                                    </Link>

                                    <Link
                                        to="/login"
                                        className="btn btn-light btn-lg savanna-secondary-btn"
                                    >
                                        Sign In
                                    </Link>

                                </div>

                            </div>


                            <div
                                className="savanna-hero-art"
                                aria-hidden="true"
                            >

                                <div className="hero-orbit hero-orbit-one" />
                                <div className="hero-orbit hero-orbit-two" />

                                <div className="hero-shopping-card hero-card-one">
                                    <span>AI Match</span>
                                    <strong>94%</strong>
                                </div>

                                <div className="hero-shopping-card hero-card-two">
                                    <span>Budget Fit</span>
                                    <strong>Great value</strong>
                                </div>

                                <div className="hero-art-mark">
                                    <span>S</span>
                                    <small>SmartShop AI</small>
                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                <section className="savanna-feature-strip">

                    <div className="container">

                        <div className="savanna-features">

                            <div className="savanna-feature">
                                <span className="feature-icon">⌕</span>
                                <div>
                                    <strong>Search Smarter</strong>
                                    <small>Find products within your budget</small>
                                </div>
                            </div>

                            <div className="savanna-feature">
                                <span className="feature-icon">☆</span>
                                <div>
                                    <strong>Personalised Picks</strong>
                                    <small>Recommendations shaped around you</small>
                                </div>
                            </div>

                            <div className="savanna-feature">
                                <span className="feature-icon">◇</span>
                                <div>
                                    <strong>Delivered Cost</strong>
                                    <small>Include estimated shipping in decisions</small>
                                </div>
                            </div>

                            <div className="savanna-feature">
                                <span className="feature-icon">✓</span>
                                <div>
                                    <strong>Better Decisions</strong>
                                    <small>Compare the signals that matter</small>
                                </div>
                            </div>

                        </div>

                    </div>

                </section>


                <section className="savanna-home-section">

                    <div className="container">

                        <div className="savanna-section-heading">

                            <span className="smartshop-badge">
                                Built around you
                            </span>

                            <h2>
                                Shopping that gets smarter over time.
                            </h2>

                            <p>
                                Search, save favourites, record
                                purchases and update your preferences
                                to improve future recommendations.
                            </p>

                        </div>


                        <div className="row g-4">

                            <div className="col-md-4">
                                <div className="savanna-info-card h-100">
                                    <span className="info-card-number">01</span>
                                    <h3>Search naturally</h3>
                                    <p>
                                        Describe what you need, set
                                        your budget and narrow results
                                        with practical filters.
                                    </p>
                                    <Link to="/register">
                                        Start shopping →
                                    </Link>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="savanna-info-card h-100">
                                    <span className="info-card-number">02</span>
                                    <h3>Build your profile</h3>
                                    <p>
                                        Preferences, favourites,
                                        searches and purchases shape
                                        your SmartShop experience.
                                    </p>
                                    <Link to="/register">
                                        Create account →
                                    </Link>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="savanna-info-card h-100">
                                    <span className="info-card-number">03</span>
                                    <h3>Make better choices</h3>
                                    <p>
                                        Consider price, estimated
                                        shipping, ratings and AI
                                        match signals before deciding.
                                    </p>
                                    <Link to="/login">
                                        Sign in →
                                    </Link>
                                </div>
                            </div>

                        </div>

                    </div>

                </section>

            </div>
        )
    }


    // ========================================================
    // PREMIUM AUTHENTICATED DASHBOARD
    // ========================================================

    return (

        <main className="premium-dashboard">

            <div className="container premium-dashboard-container">


                <section className="premium-dashboard-hero">

                    <div className="premium-dashboard-hero-copy">

                        <span className="premium-dashboard-eyebrow">
                            YOUR SMARTSHOP
                        </span>

                        <h1>
                            Welcome back,{' '}
                            <span>{firstName}.</span>
                        </h1>

                        <p>
                            Search smarter, stay within budget
                            and discover products shaped around
                            the way you shop.
                        </p>


                        <form
                            className="premium-dashboard-search"
                            onSubmit={handleSearch}
                        >

                            <span
                                className="premium-dashboard-search-icon"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={query}
                                onChange={
                                    event =>
                                        setQuery(
                                            event.target.value
                                        )
                                }
                                placeholder="What are you shopping for?"
                                aria-label="Search SmartShop products"
                            />

                            <button
                                type="submit"
                                disabled={!query.trim()}
                            >
                                Search
                                <span aria-hidden="true">→</span>
                            </button>

                        </form>


                        <div className="premium-dashboard-trust">

                            <span>
                                <i>✓</i>
                                Personalised
                            </span>

                            <span>
                                <i>✓</i>
                                Budget-aware
                            </span>

                            <span>
                                <i>✓</i>
                                Shipping-aware
                            </span>

                        </div>

                    </div>


                    <div
                        className="premium-dashboard-hero-visual"
                        aria-hidden="true"
                    >

                        <div className="premium-dashboard-orbit orbit-one" />
                        <div className="premium-dashboard-orbit orbit-two" />

                        <div className="premium-ai-core">
                            <span>S</span>
                            <small>SMARTSHOP AI</small>
                        </div>

                        <div className="premium-float-card premium-float-top">
                            <small>SHOPPING PROFILE</small>
                            <strong>
                                {profileStrength}% tuned
                            </strong>
                        </div>

                        <div className="premium-float-card premium-float-bottom">
                            <small>DELIVERY</small>
                            <strong>
                                {
                                    deliveryLocation
                                    || 'Set your province'
                                }
                            </strong>
                        </div>

                    </div>

                </section>


                {
                    dashboardError && (

                        <div className="premium-dashboard-notice">
                            <span>!</span>
                            <p>{dashboardError}</p>
                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                Refresh
                            </button>
                        </div>
                    )
                }


                <section className="premium-dashboard-section">

                    <div className="premium-section-heading">

                        <div>
                            <span className="premium-section-eyebrow">
                                OVERVIEW
                            </span>
                            <h2>Your shopping</h2>
                            <p>
                                A live snapshot of your SmartShop activity.
                            </p>
                        </div>

                    </div>


                    <div className="premium-stat-grid">

                        <Link
                            to="/favourites"
                            className="premium-stat-card"
                        >
                            <span className="premium-stat-icon">♡</span>
                            <div>
                                <small>FAVOURITES</small>
                                <strong>
                                    {
                                        loading
                                            ? '—'
                                            : favourites.length
                                    }
                                </strong>
                                <p>Products you've saved</p>
                            </div>
                            <span className="premium-stat-arrow">→</span>
                        </Link>


                        <Link
                            to="/purchases"
                            className="premium-stat-card"
                        >
                            <span className="premium-stat-icon">✓</span>
                            <div>
                                <small>PURCHASES</small>
                                <strong>
                                    {
                                        loading
                                            ? '—'
                                            : purchases.length
                                    }
                                </strong>
                                <p>Your recorded purchases</p>
                            </div>
                            <span className="premium-stat-arrow">→</span>
                        </Link>


                        <Link
                            to="/history"
                            className="premium-stat-card"
                        >
                            <span className="premium-stat-icon">⌕</span>
                            <div>
                                <small>SEARCHES</small>
                                <strong>
                                    {
                                        loading
                                            ? '—'
                                            : history.length
                                    }
                                </strong>
                                <p>Your shopping activity</p>
                            </div>
                            <span className="premium-stat-arrow">→</span>
                        </Link>


                        <Link
                            to="/preferences"
                            className="premium-stat-card premium-stat-delivery"
                        >
                            <span className="premium-stat-icon">◇</span>
                            <div>
                                <small>DELIVERY</small>
                                <strong className="premium-stat-location">
                                    {
                                        loading
                                            ? 'Loading'
                                            : (
                                                deliveryLocation
                                                || 'Not set'
                                            )
                                    }
                                </strong>
                                <p>
                                    {
                                        deliveryLocation
                                            ? 'Shipping estimates active'
                                            : 'Set a delivery province'
                                    }
                                </p>
                            </div>
                            <span className="premium-stat-arrow">→</span>
                        </Link>

                    </div>

                </section>


                <section className="premium-dashboard-section premium-budget-dashboard-section">
                    <div className="premium-section-heading premium-section-heading-row">
                        <div>
                            <span className="premium-section-eyebrow">SMART BUDGET</span>
                            <h2>Your delivered-budget snapshot</h2>
                            <p>See how your personalised picks fit your saved maximum spend.</p>
                        </div>
                        <Link to="/budget" className="premium-section-link">
                            Open Budget Optimizer <span>→</span>
                        </Link>
                    </div>

                    <div className="premium-budget-dashboard-card">
                        <div>
                            <small>SAVED MAXIMUM BUDGET</small>
                            <strong>
                                {hasSavedBudget
                                    ? `R${savedBudget.toLocaleString('en-ZA', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`
                                    : 'Not set'}
                            </strong>
                            <p>
                                {hasSavedBudget
                                    ? `${affordableCount} of ${recommendations.length} current personalised picks fit your delivered budget.`
                                    : 'Set a maximum budget in Preferences to unlock product-level budget intelligence.'}
                            </p>
                        </div>
                        <div className="premium-budget-dashboard-meta">
                            <span>Delivery</span>
                            <strong>{deliveryLocation || 'Not set'}</strong>
                        </div>
                    </div>
                </section>


                <section className="premium-dashboard-section premium-recommendation-section">

                    <div className="premium-section-heading premium-section-heading-row">

                        <div>
                            <span className="premium-section-eyebrow">
                                PERSONALISED FOR YOU
                            </span>
                            <h2>Picked for your profile</h2>
                            <p>
                                Recommendations shaped by your
                                SmartShop signals and shopping activity.
                            </p>
                        </div>

                        <Link
                            to="/recommendations"
                            className="premium-section-link"
                        >
                            View all recommendations
                            <span>→</span>
                        </Link>

                    </div>


                    {
                        loading ? (

                            <div className="premium-product-skeleton-grid">

                                {[1, 2, 3].map(
                                    item => (

                                        <div
                                            className="premium-product-skeleton"
                                            key={item}
                                        >
                                            <div />
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    )
                                )}

                            </div>

                        ) : recommendations.length > 0 ? (

                            <div className="row g-4">

                                {
                                    recommendations.map(
                                        (
                                            product,
                                            index
                                        ) => (

                                            <div
                                                className="col-12 col-md-6 col-xl-4"
                                                key={
                                                    product.product_id
                                                    ?? product.id
                                                    ?? index
                                                }
                                            >

                                                <ProductCard
                                                    product={product}
                                                    index={index}
                                                    topPick={
                                                        index === 0
                                                    }
                                                    onFavourite={
                                                        handleFavourite
                                                    }
                                                    onPurchase={
                                                        handlePurchase
                                                    }
                                                    showScore
                                                    showBreakdown
                                                    budget={
                                                        hasSavedBudget
                                                            ? savedBudget
                                                            : null
                                                    }
                                                />

                                            </div>
                                        )
                                    )
                                }

                            </div>

                        ) : (

                            <div className="premium-empty-recommendations">

                                <div className="premium-empty-mark">
                                    S
                                </div>

                                <div>
                                    <h3>
                                        Build your recommendation profile
                                    </h3>
                                    <p>
                                        Search, save favourites or add
                                        preferences and SmartShop will
                                        start shaping products around you.
                                    </p>
                                </div>

                                <Link
                                    to="/search"
                                    className="btn btn-primary"
                                >
                                    Start searching
                                </Link>

                            </div>
                        )
                    }

                </section>


                <section className="premium-dashboard-section premium-recent-section">

                    <div className="premium-section-heading premium-section-heading-row">

                        <div>
                            <span className="premium-section-eyebrow">
                                CONTINUE EXPLORING
                            </span>
                            <h2>Recently viewed</h2>
                            <p>
                                Products you opened recently, kept separate
                                from your search history.
                            </p>
                        </div>

                        {recentlyViewed.length > 0 && (
                            <button
                                type="button"
                                className="premium-recent-clear"
                                onClick={clearViewed}
                            >
                                Clear recently viewed
                            </button>
                        )}

                    </div>


                    {recentlyViewed.length > 0 ? (

                        <div className="premium-recent-scroller">

                            {recentlyViewed.slice(0, 8).map(product => {

                                const productId =
                                    product?.product_id
                                    ?? product?.id

                                const shipping =
                                    Number(
                                        product?.estimated_shipping_cost
                                        ?? product?.shipping_cost
                                        ?? 0
                                    )

                                const total =
                                    Number(
                                        product?.total_price
                                        ?? (
                                            Number(product?.price || 0)
                                            + shipping
                                        )
                                    )

                                const compared =
                                    isCompared(productId)

                                const compareDisabled =
                                    !compared
                                    && comparisonCount >= maxProducts

                                return (
                                    <article
                                        className="premium-recent-card"
                                        key={productId}
                                    >

                                        <button
                                            type="button"
                                            className="premium-recent-image"
                                            onClick={() =>
                                                navigate(
                                                    `/search?query=${encodeURIComponent(
                                                        product?.name || ''
                                                    )}`
                                                )
                                            }
                                            aria-label={`Find ${product?.name || 'product'}`}
                                        >
                                            <img
                                                src={
                                                    product?.image_url
                                                    || '/products/fallback.svg'
                                                }
                                                alt={product?.name || 'SmartShop product'}
                                                onError={event => {
                                                    event.currentTarget.src =
                                                        '/products/fallback.svg'
                                                }}
                                            />
                                        </button>

                                        <div className="premium-recent-body">

                                            <div className="premium-recent-meta">
                                                <span>
                                                    {product?.category || 'Product'}
                                                </span>
                                                <span>
                                                    ★ {product?.rating ?? 'N/A'}
                                                </span>
                                            </div>

                                            <h3>
                                                {product?.name || 'Unnamed product'}
                                            </h3>

                                            <div className="premium-recent-price">
                                                <strong>
                                                    R{Number(product?.price || 0)
                                                        .toLocaleString(
                                                            'en-ZA',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            }
                                                        )}
                                                </strong>

                                                <small>
                                                    {product?.store || 'Store not specified'}
                                                </small>
                                            </div>

                                            <div className="premium-recent-delivered">
                                                <span>
                                                    {product?.delivery_location
                                                        ? 'Delivered estimate'
                                                        : 'Product + shipping'}
                                                </span>
                                                <strong>
                                                    R{total.toLocaleString(
                                                        'en-ZA',
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="premium-recent-actions">

                                                <button
                                                    type="button"
                                                    className={
                                                        compared
                                                            ? 'premium-recent-compare selected'
                                                            : 'premium-recent-compare'
                                                    }
                                                    disabled={compareDisabled}
                                                    onClick={() => {
                                                        if (compared) {
                                                            removeProduct(productId)
                                                        } else {
                                                            addProduct(product)
                                                        }
                                                    }}
                                                >
                                                    {compared ? '✓ Comparing' : '⇄ Compare'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="premium-recent-view"
                                                    onClick={() =>
                                                        navigate(
                                                            `/search?query=${encodeURIComponent(
                                                                product?.name || ''
                                                            )}`
                                                        )
                                                    }
                                                >
                                                    View again →
                                                </button>

                                            </div>

                                        </div>

                                    </article>
                                )
                            })}

                        </div>

                    ) : (

                        <div className="premium-recent-empty">

                            <div className="premium-recent-empty-mark">
                                ◇
                            </div>

                            <div>
                                <h3>Your recently viewed products will appear here.</h3>
                                <p>
                                    Open View Details on any product and SmartShop
                                    will keep it ready for you on this dashboard.
                                </p>
                            </div>

                            <Link
                                to="/search"
                                className="btn btn-outline-primary"
                            >
                                Explore products
                            </Link>

                        </div>
                    )}

                </section>


                <section className="premium-dashboard-section">

                    <div className="premium-profile-panel">

                        <div className="premium-profile-main">

                            <div className="premium-profile-heading">

                                <div>
                                    <span className="premium-section-eyebrow">
                                        YOUR SHOPPING PROFILE
                                    </span>
                                    <h2>
                                        SmartShop learns from your choices.
                                    </h2>
                                </div>

                                <div className="premium-profile-score">
                                    <strong>
                                        {profileStrength}%
                                    </strong>
                                    <span>PERSONALISED</span>
                                </div>

                            </div>


                            <div className="premium-profile-progress">
                                <span
                                    style={{
                                        width:
                                            `${profileStrength}%`
                                    }}
                                />
                            </div>


                            <div className="premium-profile-signals">

                                {
                                    profileSignals.length > 0
                                        ? profileSignals.map(
                                            signal => (

                                                <span
                                                    key={signal}
                                                >
                                                    {signal}
                                                </span>
                                            )
                                        )
                                        : (
                                            <span className="premium-profile-empty">
                                                Add preferences to strengthen your profile
                                            </span>
                                        )
                                }

                            </div>


                            <div className="premium-profile-bottom">

                                <div className="premium-delivery-status">

                                    <span className="premium-delivery-icon">
                                        ◇
                                    </span>

                                    <div>
                                        <small>
                                            DELIVERY PROVINCE
                                        </small>

                                        <strong>
                                            {
                                                deliveryLocation
                                                || 'Not configured'
                                            }
                                        </strong>

                                        <p>
                                            {
                                                deliveryLocation
                                                    ? 'Destination-aware shipping estimates are enabled.'
                                                    : 'Set your province to unlock destination-aware shipping.'
                                            }
                                        </p>
                                    </div>

                                </div>


                                <Link
                                    to="/preferences"
                                    className="btn btn-outline-primary"
                                >
                                    Manage preferences
                                </Link>

                            </div>

                        </div>


                        <aside className="premium-profile-aside">

                            <span className="premium-profile-aside-label">
                                SMARTSHOP SIGNALS
                            </span>

                            <h3>
                                Your activity makes recommendations more useful.
                            </h3>

                            <div className="premium-signal-list">

                                <div>
                                    <span>01</span>
                                    <p>
                                        <strong>Preferences</strong>
                                        <small>
                                            Your explicit shopping choices
                                        </small>
                                    </p>
                                </div>

                                <div>
                                    <span>02</span>
                                    <p>
                                        <strong>Favourites</strong>
                                        <small>
                                            Products worth remembering
                                        </small>
                                    </p>
                                </div>

                                <div>
                                    <span>03</span>
                                    <p>
                                        <strong>Purchases</strong>
                                        <small>
                                            What you actually choose
                                        </small>
                                    </p>
                                </div>

                            </div>

                        </aside>

                    </div>

                </section>

            </div>

        </main>
    )
}


export default Home
