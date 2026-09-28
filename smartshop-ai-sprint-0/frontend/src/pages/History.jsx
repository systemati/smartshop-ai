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

import LoadingState
    from '../components/LoadingState'

import EmptyState
    from '../components/EmptyState'

import ErrorState
    from '../components/ErrorState'


function History() {

    const navigate =
        useNavigate()

    const user =
        getStoredUser()


    const [history, setHistory] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')


    // ========================================================
    // LOAD SEARCH HISTORY
    // ========================================================

    const loadHistory =
        async () => {

            try {

                setLoading(true)
                setError('')

                const response =
                    await api.get(
                        '/api/history/'
                    )

                const data =
                    response.data


                if (
                    Array.isArray(
                        data
                    )
                ) {

                    setHistory(
                        data
                    )

                } else if (
                    Array.isArray(
                        data?.history
                    )
                ) {

                    setHistory(
                        data.history
                    )

                } else if (
                    Array.isArray(
                        data?.searches
                    )
                ) {

                    setHistory(
                        data.searches
                    )

                } else {

                    setHistory(
                        []
                    )
                }


            } catch (err) {

                console.error(
                    'History load error:',
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
                    'Unable to load your search history.'
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

            loadHistory()

        } else {

            setLoading(false)
        }

    }, [])


    // ========================================================
    // FORMAT DATE
    // ========================================================

    const formatDate =
        value => {

            if (!value) {

                return 'Date unavailable'
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
    // SEARCH AGAIN
    // ========================================================

    const searchAgain =
        item => {

            const queryText =
                item.query
                ??
                item.search_text
                ??
                ''

            const budget =
                item.budget
                ??
                item.max_budget
                ??
                ''


            const params =
                new URLSearchParams()


            if (queryText) {

                params.set(
                    'query',
                    queryText
                )
            }


            if (
                budget !== '' &&
                budget !== null &&
                budget !== undefined
            ) {

                params.set(
                    'budget',
                    String(
                        budget
                    )
                )
            }


            const queryString =
                params.toString()


            navigate(
                queryString
                    ? `/search?${queryString}`
                    : '/search'
            )
        }


    // ========================================================
    // SUMMARY
    // ========================================================

    const searchesWithBudget =
        history.filter(
            item => {

                const value =
                    item.budget
                    ??
                    item.max_budget

                return (
                    value !== undefined &&
                    value !== null &&
                    value !== ''
                )
            }
        )


    const averageBudget =
        searchesWithBudget.length > 0
            ? searchesWithBudget.reduce(
                (
                    total,
                    item
                ) => {

                    const value =
                        item.budget
                        ??
                        item.max_budget
                        ??
                        0

                    return (
                        total +
                        Number(value)
                    )

                },
                0
            ) /
            searchesWithBudget.length

            : null


    // ========================================================
    // AUTH GUARD
    // ========================================================

    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        Search History
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to view your activity
                    </h2>

                    <p className="text-muted mb-4">

                        SmartShop uses your previous
                        searches as one of the signals
                        that helps improve your product
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

        <main className="history-page-v2">

            <div className="container py-5">

                <PageHeader
                    badge="Activity"
                    title="Search History"
                    description="Review the searches SmartShop uses to better understand your shopping interests."
                />


                {/* =============================================
                    LOADING
                ============================================== */}

                {
                    loading && (

                        <LoadingState
                            title="Loading your search history"
                            description="Fetching your recent SmartShop activity."
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
                            title="We couldn't load your search history"
                            message={
                                error
                            }
                            onRetry={
                                loadHistory
                            }
                        />
                    )
                }


                {/* =============================================
                    SUMMARY
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    history.length > 0 && (

                        <section className="history-summary-card">

                            <div className="history-summary-copy">

                                <span className="history-eyebrow">
                                    SHOPPING INTELLIGENCE
                                </span>

                                <h2>
                                    Your search activity
                                </h2>

                                <p>
                                    Every search gives SmartShop
                                    more context about the products,
                                    categories and price ranges
                                    you're interested in.
                                </p>

                            </div>


                            <div className="history-summary-stats">

                                <div className="history-stat">

                                    <span>
                                        Searches
                                    </span>

                                    <strong>
                                        {
                                            history.length
                                        }
                                    </strong>

                                </div>


                                <div className="history-stat">

                                    <span>
                                        With budget
                                    </span>

                                    <strong>
                                        {
                                            searchesWithBudget.length
                                        }
                                    </strong>

                                </div>


                                <div className="history-stat history-stat-ai">

                                    <span>
                                        Average budget
                                    </span>

                                    <strong>

                                        {
                                            averageBudget !== null
                                                ? (
                                                    `R${averageBudget.toLocaleString(
                                                        'en-ZA',
                                                        {
                                                            maximumFractionDigits: 0
                                                        }
                                                    )}`
                                                )
                                                : 'Not set'
                                        }

                                    </strong>

                                </div>

                            </div>

                        </section>
                    )
                }


                {/* =============================================
                    HISTORY
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    history.length > 0 && (

                        <section className="history-results">

                            <div className="history-results-header">

                                <div>

                                    <span className="history-eyebrow">
                                        RECENT ACTIVITY
                                    </span>

                                    <h3>
                                        Recent Searches
                                    </h3>

                                    <p>
                                        Revisit something you
                                        searched for previously.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() =>
                                        navigate(
                                            '/search'
                                        )
                                    }
                                >
                                    New Search
                                </button>

                            </div>


                            <div className="history-timeline">

                                {
                                    history.map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const queryText =
                                                item.query
                                                ??
                                                item.search_text
                                                ??
                                                'Search'

                                            const budget =
                                                item.budget
                                                ??
                                                item.max_budget

                                            const searchedAt =
                                                item.searched_at
                                                ??
                                                item.created_at


                                            return (

                                                <article
                                                    className="history-card-v2"
                                                    key={
                                                        item.search_id
                                                        ??
                                                        item.id
                                                        ??
                                                        index
                                                    }
                                                >

                                                    <div className="history-card-marker">

                                                        <span>
                                                            ⌕
                                                        </span>

                                                    </div>


                                                    <div className="history-card-main">

                                                        <div className="history-card-top">

                                                            <div>

                                                                <span className="history-card-label">
                                                                    SEARCH
                                                                </span>

                                                                <h4>
                                                                    {queryText}
                                                                </h4>

                                                            </div>


                                                            <time className="history-card-date">

                                                                {
                                                                    formatDate(
                                                                        searchedAt
                                                                    )
                                                                }

                                                            </time>

                                                        </div>


                                                        <div className="history-card-signals">

                                                            {
                                                                budget !== undefined &&
                                                                budget !== null && (

                                                                    <HistoryChip
                                                                        label="Budget"
                                                                        value={
                                                                            `R${Number(
                                                                                budget
                                                                            ).toLocaleString(
                                                                                'en-ZA'
                                                                            )}`
                                                                        }
                                                                    />
                                                                )
                                                            }


                                                            {
                                                                item.category && (

                                                                    <HistoryChip
                                                                        label="Category"
                                                                        value={
                                                                            item.category
                                                                        }
                                                                    />
                                                                )
                                                            }


                                                            {
                                                                item.colour && (

                                                                    <HistoryChip
                                                                        label="Colour"
                                                                        value={
                                                                            item.colour
                                                                        }
                                                                    />
                                                                )
                                                            }


                                                            {
                                                                item.store && (

                                                                    <HistoryChip
                                                                        label="Store"
                                                                        value={
                                                                            item.store
                                                                        }
                                                                    />
                                                                )
                                                            }


                                                            {
                                                                item.location && (

                                                                    <HistoryChip
                                                                        label="Location"
                                                                        value={
                                                                            item.location
                                                                        }
                                                                    />
                                                                )
                                                            }

                                                        </div>


                                                        <div className="history-card-footer">

                                                            <div className="history-ai-note">

                                                                <span>
                                                                    ✦
                                                                </span>

                                                                Used as a recommendation signal

                                                            </div>


                                                            <button
                                                                type="button"
                                                                className="history-search-again"
                                                                onClick={() =>
                                                                    searchAgain(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                Search Again
                                                                <span>
                                                                    →
                                                                </span>
                                                            </button>

                                                        </div>

                                                    </div>

                                                </article>
                                            )
                                        }
                                    )
                                }

                            </div>

                        </section>
                    )
                }


                {/* =============================================
                    EMPTY
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    history.length === 0 && (

                        <EmptyState
                            icon="⌕"
                            eyebrow="START EXPLORING"
                            title="No search history yet"
                            description="Your searches will appear here once you start exploring products. SmartShop also uses this activity to make your recommendations more relevant."
                            actionLabel="Start Searching"
                            onAction={() =>
                                navigate(
                                    '/search'
                                )
                            }
                            secondaryLabel="Set Preferences"
                            onSecondaryAction={() =>
                                navigate(
                                    '/preferences'
                                )
                            }
                        />
                    )
                }

            </div>

        </main>
    )
}


// ============================================================
// HISTORY CHIP
// ============================================================

function HistoryChip({
    label,
    value
}) {

    return (

        <div className="history-chip">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    )
}


export default History