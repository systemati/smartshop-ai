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

import PageHeader
    from '../components/PageHeader'

import Toast
    from '../components/Toast'

import LoadingState
    from '../components/LoadingState'

import EmptyState
    from '../components/EmptyState'

import ErrorState
    from '../components/ErrorState'


function Purchases() {

    const navigate =
        useNavigate()

    const user =
        getStoredUser()


    const [purchases, setPurchases] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [message, setMessage] =
        useState('')


    // ========================================================
    // LOAD PURCHASE HISTORY
    // ========================================================

    const loadPurchases =
        async () => {

            try {

                setLoading(true)
                setError('')

                const response =
                    await api.get(
                        '/api/purchases/'
                    )

                const data =
                    response.data


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    setPurchases(
                        data
                    )

                } else if (
                    Array.isArray(
                        data?.purchases
                    )
                ) {

                    setPurchases(
                        data.purchases
                    )

                } else {

                    setPurchases(
                        []
                    )
                }


            } catch (err) {

                console.error(
                    'Purchase history error:',
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
                    'Unable to load your purchase history.'
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

            loadPurchases()

        } else {

            setLoading(false)
        }

    }, [])


    // ========================================================
    // REMOVE PURCHASE
    // ========================================================

    const handleRemovePurchase =
        async purchaseId => {

            try {

                setError('')

                await api.delete(
                    `/api/purchases/${purchaseId}`
                )


                setPurchases(
                    current =>
                        current.filter(
                            item =>
                                item.purchase_id
                                !== purchaseId
                        )
                )


                setMessage(
                    'Purchase removed from your history.'
                )


            } catch (err) {

                console.error(
                    'Remove purchase error:',
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
                    'Unable to remove this purchase.'
                )
            }
        }


    // ========================================================
    // FORMAT DATE
    // ========================================================

    const formatDate =
        value => {

            if (!value) {

                return 'Unknown date'
            }


            const date =
                new Date(value)


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return value
            }


            return date.toLocaleString(
                'en-ZA',
                {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }
            )
        }


    // ========================================================
    // TOTAL SPEND
    // ========================================================

    const totalSpend =
        purchases.reduce(
            (
                total,
                purchase
            ) =>
                total +
                Number(
                    purchase.price || 0
                ),
            0
        )


    // ========================================================
    // AUTH GUARD
    // ========================================================

    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        Purchase History
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to view your purchases
                    </h2>

                    <p className="text-muted mb-4">

                        Your purchase history helps
                        SmartShop understand what you
                        actually buy and improve future
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

        <main className="purchases-page-v2">

            <Toast
                message={
                    message
                }
                type="success"
                onClose={() =>
                    setMessage('')
                }
            />


            <div className="container py-5">

                <PageHeader
                    badge="Purchase History"
                    title="Your Purchases"
                    description="Products you've marked as purchased appear here and help SmartShop improve future recommendations."
                />


                {/* =============================================
                    LOADING
                ============================================== */}

                {
                    loading && (

                        <LoadingState
                            title="Loading your purchases"
                            description="Fetching your SmartShop purchase history."
                            cards={3}
                        />
                    )
                }


                {/* =============================================
                    ERROR
                ============================================== */}

                {
                    !loading &&
                    error && (

                        <ErrorState
                            title="We couldn't load your purchases"
                            message={
                                error
                            }
                            onRetry={
                                loadPurchases
                            }
                        />
                    )
                }


                {/* =============================================
                    PURCHASE SUMMARY
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    purchases.length > 0 && (

                        <section className="purchase-summary">

                            <div className="purchase-summary-main">

                                <span className="purchase-eyebrow">
                                    SHOPPING ACTIVITY
                                </span>

                                <h2>
                                    Purchase History
                                </h2>

                                <p>
                                    A record of products you've
                                    marked as purchased through
                                    SmartShop.
                                </p>

                            </div>


                            <div className="purchase-stats">

                                <div className="purchase-stat">

                                    <span>
                                        Products
                                    </span>

                                    <strong>
                                        {
                                            purchases.length
                                        }
                                    </strong>

                                </div>


                                <div className="purchase-stat">

                                    <span>
                                        Recorded value
                                    </span>

                                    <strong>
                                        R
                                        {
                                            totalSpend
                                                .toLocaleString(
                                                    'en-ZA',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )
                                        }
                                    </strong>

                                </div>


                                <div className="purchase-stat purchase-stat-ai">

                                    <span>
                                        AI signal
                                    </span>

                                    <strong>
                                        Active
                                    </strong>

                                </div>

                            </div>

                        </section>
                    )
                }


                {/* =============================================
                    EMPTY STATE
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    purchases.length === 0 && (

                        <EmptyState
                            icon="✓"
                            eyebrow="BUILD YOUR SHOPPING HISTORY"
                            title="No purchases recorded yet"
                            description="When you mark a product as purchased, it'll appear here and become another signal SmartShop can use to improve your recommendations."
                            actionLabel="Explore Products"
                            onAction={() =>
                                navigate(
                                    '/search'
                                )
                            }
                            secondaryLabel="View Recommendations"
                            onSecondaryAction={() =>
                                navigate(
                                    '/recommendations'
                                )
                            }
                        />
                    )
                }


                {/* =============================================
                    PURCHASE LIST
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    purchases.length > 0 && (

                        <section className="purchase-history-section">

                            <div className="purchase-history-heading">

                                <div>

                                    <span className="purchase-eyebrow">
                                        RECENT ACTIVITY
                                    </span>

                                    <h3>
                                        Recorded purchases
                                    </h3>

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
                                    See Updated Recommendations
                                </button>

                            </div>


                            <div className="purchase-grid">

                                {
                                    purchases.map(
                                        purchase => (

                                            <PurchaseCard
                                                key={
                                                    purchase.purchase_id
                                                }
                                                purchase={
                                                    purchase
                                                }
                                                formatDate={
                                                    formatDate
                                                }
                                                onRemove={
                                                    handleRemovePurchase
                                                }
                                            />
                                        )
                                    )
                                }

                            </div>

                        </section>
                    )
                }

            </div>

        </main>
    )
}


// ============================================================
// PURCHASE CARD
// ============================================================

function PurchaseCard({
    purchase,
    formatDate,
    onRemove
}) {

    const price =
        Number(
            purchase.price || 0
        )


    return (

        <article className="purchase-card-v2">

    {purchase.image_url && (
        <div className="purchase-card-image-wrap">
            <img
                src={purchase.image_url}
                alt={purchase.name || 'Product'}
                className="purchase-card-image"
                loading="lazy"
            />
        </div>
    )}

    <div className="purchase-card-top">

                <div>

                    <span className="purchase-category">

                        {
                            purchase.category ||
                            'Product'
                        }

                    </span>

                </div>


                <span className="purchase-status">

                    <span className="purchase-status-dot" />

                    Purchased

                </span>

            </div>


            <div className="purchase-card-content">

                <h3>
                    {
                        purchase.name ||
                        'Product'
                    }
                </h3>


                <p className="purchase-description">

                    {
                        purchase.description ||
                        'No description available.'
                    }

                </p>


                <div className="purchase-price">

                    R
                    {
                        price.toLocaleString(
                            'en-ZA',
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )
                    }

                </div>


                <div className="purchase-detail-grid">

                    <PurchaseDetail
                        label="Store"
                        value={
                            purchase.store ||
                            'Not specified'
                        }
                    />

                    <PurchaseDetail
                        label="Colour"
                        value={
                            purchase.colour ||
                            'Not specified'
                        }
                    />

                    <PurchaseDetail
                        label="Location"
                        value={
                            purchase.location ||
                            'Not specified'
                        }
                    />

                    <PurchaseDetail
                        label="Purchased"
                        value={
                            formatDate(
                                purchase.purchase_date
                            )
                        }
                    />

                </div>

            </div>


            <div className="purchase-card-footer">

                <div className="purchase-ai-note">

                    <span>
                        ✦
                    </span>

                    Used to improve your recommendations

                </div>


                <button
                    type="button"
                    className="purchase-remove-button"
                    onClick={() =>
                        onRemove(
                            purchase.purchase_id
                        )
                    }
                >
                    Remove
                </button>

            </div>

        </article>
    )
}


// ============================================================
// DETAIL
// ============================================================

function PurchaseDetail({
    label,
    value
}) {

    return (

        <div className="purchase-detail">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    )
}


export default Purchases