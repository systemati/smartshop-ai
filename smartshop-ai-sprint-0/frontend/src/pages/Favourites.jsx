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

import Toast
    from '../components/Toast'

import LoadingState
    from '../components/LoadingState'

import EmptyState
    from '../components/EmptyState'

import ErrorState
    from '../components/ErrorState'


function Favourites() {

    const navigate =
        useNavigate()

    const user =
        getStoredUser()


    const [products, setProducts] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [message, setMessage] =
        useState('')


    // ========================================================
    // LOAD FAVOURITES
    // ========================================================

    const loadFavourites =
        async () => {

            try {

                setLoading(true)
                setError('')

                const response =
                    await api.get(
                        '/api/favourites/'
                    )

                const data =
                    response.data


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
                        data?.favourites
                    )
                ) {

                    setProducts(
                        data.favourites
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


            } catch (err) {

                console.error(
                    'Load favourites error:',
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
                    'Unable to load your favourites.'
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

            loadFavourites()

        } else {

            setLoading(false)
        }

    }, [])


    // ========================================================
    // REMOVE FAVOURITE
    // ========================================================

    const handleRemoveFavourite =
        async productId => {

            try {

                setError('')

                await api.delete(
                    `/api/favourites/${productId}`
                )


                setProducts(
                    currentProducts =>
                        currentProducts.filter(
                            product => {

                                const currentId =
                                    product.product_id
                                    ??
                                    product.id

                                return (
                                    currentId !==
                                    productId
                                )
                            }
                        )
                )


                setMessage(
                    'Product removed from favourites.'
                )


            } catch (err) {

                console.error(
                    'Remove favourite error:',
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
                    'Unable to remove this favourite.'
                )
            }
        }


    // ========================================================
    // AUTH GUARD
    // ========================================================

    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        Saved Products
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to view your favourites
                    </h2>

                    <p className="text-muted mb-4">

                        Save products you like and
                        return to them whenever you're
                        ready to compare or buy.

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

        <main className="favourites-page">

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
                    badge="Saved Products"
                    title="Your Favourites"
                    description="Keep track of products you want to compare, revisit or buy later."
                />


                {/* =============================================
                    LOADING
                ============================================== */}

                {
                    loading && (

                        <LoadingState
                            title="Loading your favourites"
                            description="Fetching the products you've saved."
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
                            title="We couldn't load your favourites"
                            message={
                                error
                            }
                            onRetry={
                                loadFavourites
                            }
                        />
                    )
                }


                {/* =============================================
                    RESULTS
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    products.length > 0 && (

                        <section className="favourites-results">

                            <div className="favourites-results-header">

                                <div>

                                    <span className="favourites-eyebrow">
                                        YOUR COLLECTION
                                    </span>

                                    <h2>
                                        Saved Products
                                    </h2>

                                    <p>

                                        {products.length}
                                        {' '}
                                        product
                                        {
                                            products.length !== 1
                                                ? 's'
                                                : ''
                                        }
                                        {' '}
                                        saved for later.

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
                                    Find More Products
                                </button>

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
                                                    showScore={
                                                        false
                                                    }
                                                    topPick={
                                                        false
                                                    }
                                                    onRemoveFavourite={
                                                        handleRemoveFavourite
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
                    EMPTY
                ============================================== */}

                {
                    !loading &&
                    !error &&
                    products.length === 0 && (

                        <EmptyState
                            icon="♡"
                            eyebrow="BUILD YOUR COLLECTION"
                            title="No favourites yet"
                            description="Save products from Search or For You and they'll appear here so you can easily compare and revisit them."
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

            </div>

        </main>
    )
}


export default Favourites