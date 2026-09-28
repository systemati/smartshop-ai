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

import PageHeader
    from '../components/PageHeader'

import LoadingState
    from '../components/LoadingState'

import ErrorState
    from '../components/ErrorState'

import {
    BUDGET_STATUS,
    getBudgetSummary,
    optimiseProducts
} from '../utils/budgetOptimizer'


function Budget() {

    const navigate =
        useNavigate()

    const user =
        getStoredUser()


    const [budget, setBudget] =
        useState('')

    const [savedBudget, setSavedBudget] =
        useState(null)

    const [deliveryLocation, setDeliveryLocation] =
        useState('')

    const [products, setProducts] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [optimising, setOptimising] =
        useState(false)

    const [error, setError] =
        useState('')

    const [hasOptimised, setHasOptimised] =
        useState(false)


    const money =
        value =>
            Number(value || 0)
                .toLocaleString(
                    'en-ZA',
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )


    const extractProducts =
        data => {

            if (Array.isArray(data)) {
                return data
            }

            if (
                Array.isArray(
                    data?.recommendations
                )
            ) {
                return data.recommendations
            }

            if (
                Array.isArray(
                    data?.products
                )
            ) {
                return data.products
            }

            return []
        }


    useEffect(() => {

        if (!user) {
            setLoading(false)
            return
        }

        let active = true


        const loadSetup =
            async () => {

                try {

                    setLoading(true)
                    setError('')


                    const preferenceResponse =
                        await api.get(
                            '/api/preferences/'
                        )


                    if (!active) {
                        return
                    }


                    const preferences =
                        preferenceResponse.data
                        || {}


                    const preferenceBudget =
                        preferences.maximum_budget
                        ?? null


                    setSavedBudget(
                        preferenceBudget
                    )

                    setDeliveryLocation(
                        preferences.delivery_location
                        || ''
                    )


                    if (
                        preferenceBudget !== null
                        && preferenceBudget !== ''
                    ) {

                        setBudget(
                            String(
                                preferenceBudget
                            )
                        )
                    }


                } catch (err) {

                    console.error(
                        'Budget setup error:',
                        err
                    )

                    if (active) {

                        setError(
                            err.response
                                ?.data
                                ?.detail
                            ||
                            'Unable to load your budget preferences.'
                        )
                    }

                } finally {

                    if (active) {
                        setLoading(false)
                    }
                }
            }


        loadSetup()


        return () => {
            active = false
        }

    }, [])


    const analyses =
        useMemo(
            () =>
                hasOptimised
                    ? optimiseProducts(
                        products,
                        Number(budget)
                    )
                    : [],
            [
                products,
                budget,
                hasOptimised
            ]
        )


    const summary =
        useMemo(
            () =>
                getBudgetSummary(
                    analyses,
                    Number(budget)
                ),
            [
                analyses,
                budget
            ]
        )


    const handleOptimise =
        async event => {

            event.preventDefault()


            const numericBudget =
                Number(budget)


            if (
                budget === ''
                || !Number.isFinite(
                    numericBudget
                )
                || numericBudget <= 0
            ) {

                setError(
                    'Enter a budget greater than R0.'
                )

                return
            }


            try {

                setOptimising(true)
                setError('')
                setHasOptimised(false)


                // We deliberately request a broader recommendation
                // set and apply delivered-cost budget intelligence
                // in the frontend. This keeps recommendation scoring
                // independent from budget optimisation.
                const response =
                    await api.post(
                        '/api/recommendations/',
                        {
                            query: '',
                            budget: null,
                            limit: 30
                        }
                    )


                setProducts(
                    extractProducts(
                        response.data
                    )
                )

                setHasOptimised(true)


            } catch (err) {

                console.error(
                    'Budget optimisation error:',
                    err
                )

                if (
                    err.response?.status
                    === 401
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
                    'SmartShop could not optimise this budget.'
                )

            } finally {

                setOptimising(false)
            }
        }


    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        Smart Budget
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to optimise your budget
                    </h2>

                    <p className="text-muted mb-4">
                        SmartShop uses your recommendations,
                        product prices and shipping estimates
                        to find products that fit your budget.
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                            navigate('/login')
                        }
                    >
                        Sign in
                    </button>

                </div>

            </div>
        )
    }


    if (loading) {

        return (
            <LoadingState
                message="Preparing your Smart Budget..."
            />
        )
    }


    return (

        <div className="budget-page">

            <div className="container py-4 py-lg-5">

                <PageHeader
                    eyebrow="SMART BUDGET"
                    title="Budget Optimizer"
                    description="Find personalised products that fit your real delivered budget, not only the catalogue price."
                />


                <section className="budget-hero-panel">

                    <div className="budget-hero-copy">

                        <span className="budget-kicker">
                            DELIVERED-COST INTELLIGENCE
                        </span>

                        <h2>
                            Make every rand in your budget count.
                        </h2>

                        <p>
                            SmartShop combines product price with
                            estimated shipping, then shows what fits,
                            what is close to your limit and what would
                            require a larger budget.
                        </p>


                        <div className="budget-context-row">

                            <div>
                                <small>Saved budget</small>
                                <strong>
                                    {
                                        savedBudget
                                            ? `R${money(savedBudget)}`
                                            : 'Not set'
                                    }
                                </strong>
                            </div>

                            <div>
                                <small>Delivery province</small>
                                <strong>
                                    {
                                        deliveryLocation
                                        || 'Not set'
                                    }
                                </strong>
                            </div>

                        </div>

                    </div>


                    <form
                        className="budget-control-card"
                        onSubmit={handleOptimise}
                    >

                        <label htmlFor="smart-budget">
                            Your maximum delivered budget
                        </label>

                        <div className="budget-input-shell">

                            <span>R</span>

                            <input
                                id="smart-budget"
                                type="number"
                                min="1"
                                step="1"
                                value={budget}
                                onChange={
                                    event =>
                                        setBudget(
                                            event.target.value
                                        )
                                }
                                placeholder="2000"
                            />

                        </div>

                        <button
                            type="submit"
                            className="budget-optimise-button"
                            disabled={optimising}
                        >
                            {
                                optimising
                                    ? 'Optimising...'
                                    : 'Optimise my budget'
                            }
                        </button>

                        <small>
                            Includes estimated shipping where your
                            delivery province is available.
                        </small>

                    </form>

                </section>


                {error && (
                    <div className="mt-4">
                        <ErrorState
                            message={error}
                        />
                    </div>
                )}


                {optimising && (
                    <div className="mt-4">
                        <LoadingState
                            message="Analysing products against your delivered budget..."
                        />
                    </div>
                )}


                {hasOptimised && !optimising && (

                    <>

                        <section className="budget-summary-grid">

                            <article className="budget-summary-card primary">
                                <span>Budget</span>
                                <strong>
                                    R{money(summary.budget)}
                                </strong>
                                <small>
                                    Maximum delivered spend
                                </small>
                            </article>

                            <article className="budget-summary-card">
                                <span>Within budget</span>
                                <strong>
                                    {summary.affordableCount}
                                </strong>
                                <small>
                                    Personalised options
                                </small>
                            </article>

                            <article className="budget-summary-card">
                                <span>Over budget</span>
                                <strong>
                                    {summary.overBudgetCount}
                                </strong>
                                <small>
                                    Options needing more budget
                                </small>
                            </article>

                            <article className="budget-summary-card">
                                <span>Products analysed</span>
                                <strong>
                                    {summary.totalProducts}
                                </strong>
                                <small>
                                    From your recommendation set
                                </small>
                            </article>

                        </section>


                        {summary.bestFit && (

                            <section className="budget-best-fit">

                                <div className="budget-best-fit-copy">

                                    <span className="budget-kicker">
                                        BEST BUDGET FIT
                                    </span>

                                    <h2>
                                        {
                                            summary.bestFit
                                                .product
                                                ?.name
                                        }
                                    </h2>

                                    <p>
                                        Delivered estimate of
                                        {' '}
                                        <strong>
                                            R{
                                                money(
                                                    summary.bestFit
                                                        .deliveredTotal
                                                )
                                            }
                                        </strong>
                                        {' '}leaves{' '}
                                        <strong>
                                            R{
                                                money(
                                                    summary.bestFit
                                                        .remaining
                                                )
                                            }
                                        </strong>
                                        {' '}in your budget.
                                    </p>


                                    <div className="budget-meter">

                                        <div className="budget-meter-track">

                                            <span
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            summary.bestFit
                                                                .utilisation,
                                                            100
                                                        )}%`
                                                }}
                                            />

                                        </div>

                                        <div className="budget-meter-labels">

                                            <span>
                                                {
                                                    summary.bestFit
                                                        .utilisation
                                                }% used
                                            </span>

                                            <span>
                                                R{
                                                    money(
                                                        summary.bestFit
                                                            .remaining
                                                    )
                                                } left
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <div className="budget-best-fit-product">

                                    <ProductCard
                                        product={
                                            summary.bestFit
                                                .product
                                        }
                                        index={0}
                                        topPick
                                        showScore
                                    />

                                </div>

                            </section>
                        )}


                        <section className="budget-results-section">

                            <div className="budget-section-heading">

                                <div>
                                    <span className="budget-kicker">
                                        BUDGET ANALYSIS
                                    </span>

                                    <h2>
                                        Your personalised options
                                    </h2>

                                    <p>
                                        Ranked by delivered-budget fit
                                        while retaining SmartShop's
                                        recommendation intelligence.
                                    </p>
                                </div>

                                <Link
                                    to={`/search?budget=${encodeURIComponent(
                                        budget
                                    )}`}
                                    className="btn btn-outline-primary"
                                >
                                    Open full search
                                </Link>

                            </div>


                            {analyses.length === 0 ? (

                                <div className="budget-empty">
                                    <h3>
                                        No products were available to analyse.
                                    </h3>
                                    <p>
                                        Try Search or update your preferences
                                        to give SmartShop more signals.
                                    </p>
                                </div>

                            ) : (

                                <div className="budget-analysis-list">

                                    {analyses
                                        .slice(0, 12)
                                        .map(
                                            (
                                                analysis,
                                                index
                                            ) => (

                                                <article
                                                    className={
                                                        `budget-analysis-row ${analysis.status}`
                                                    }
                                                    key={
                                                        analysis.product
                                                            ?.product_id
                                                        ?? analysis.product
                                                            ?.id
                                                        ?? index
                                                    }
                                                >

                                                    <img
                                                        src={
                                                            analysis.product
                                                                ?.image_url
                                                            || '/products/fallback.svg'
                                                        }
                                                        alt={
                                                            analysis.product
                                                                ?.name
                                                            || 'SmartShop product'
                                                        }
                                                        onError={event => {
                                                            event.currentTarget.src =
                                                                '/products/fallback.svg'
                                                        }}
                                                    />


                                                    <div className="budget-analysis-product">

                                                        <small>
                                                            {
                                                                analysis.product
                                                                    ?.category
                                                                || 'Product'
                                                            }
                                                            {' · '}
                                                            {
                                                                analysis.product
                                                                    ?.store
                                                                || 'Store'
                                                            }
                                                        </small>

                                                        <strong>
                                                            {
                                                                analysis.product
                                                                    ?.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            Product R{
                                                                money(
                                                                    analysis
                                                                        .productPrice
                                                                )
                                                            }
                                                            {' + '}
                                                            Shipping R{
                                                                money(
                                                                    analysis
                                                                        .shipping
                                                                )
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="budget-analysis-total">

                                                        <small>
                                                            Delivered
                                                        </small>

                                                        <strong>
                                                            R{
                                                                money(
                                                                    analysis
                                                                        .deliveredTotal
                                                                )
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div className="budget-analysis-result">

                                                        <span
                                                            className="budget-status-pill"
                                                        >
                                                            {
                                                                analysis.status
                                                                === BUDGET_STATUS.OVER
                                                                    ? 'Over budget'
                                                                    : analysis.status
                                                                        === BUDGET_STATUS.NEAR_LIMIT
                                                                        ? 'Near limit'
                                                                        : 'Within budget'
                                                            }
                                                        </span>

                                                        <strong>
                                                            {
                                                                analysis.withinBudget
                                                                    ? `R${money(
                                                                        analysis.remaining
                                                                    )} left`
                                                                    : `R${money(
                                                                        analysis.shortfall
                                                                    )} over`
                                                            }
                                                        </strong>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="budget-view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/search?query=${encodeURIComponent(
                                                                    analysis.product
                                                                        ?.name
                                                                    || ''
                                                                )}`
                                                            )
                                                        }
                                                    >
                                                        View →
                                                    </button>

                                                </article>
                                            )
                                        )}

                                </div>
                            )}

                        </section>

                    </>
                )}


                {!hasOptimised && !optimising && (

                    <section className="budget-start-state">

                        <div className="budget-start-icon">
                            R
                        </div>

                        <div>
                            <h3>
                                Set a budget to start the analysis.
                            </h3>

                            <p>
                                SmartShop will evaluate your personalised
                                recommendations against product price and
                                estimated shipping.
                            </p>
                        </div>

                    </section>
                )}

            </div>

        </div>
    )
}


export default Budget
