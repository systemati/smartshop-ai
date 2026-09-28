import {
    useEffect,
    useRef,
    useState
} from 'react'

import {
    useNavigate,
    useSearchParams
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


function Search() {

    const navigate =
        useNavigate()

    const [searchParams] =
        useSearchParams()

    const user =
        getStoredUser()


    const [query, setQuery] =
        useState('')

    const [budget, setBudget] =
        useState('')

    const [colour, setColour] =
        useState('')

    const [category, setCategory] =
        useState('')

    const [store, setStore] =
        useState('')

    const [location, setLocation] =
        useState('')

    const [shipping, setShipping] =
        useState('')

    const [sortBy, setSortBy] =
        useState('score')

    const [deliveryLocation, setDeliveryLocation] =
        useState('')

    const [shippingEstimateAvailable, setShippingEstimateAvailable] =
        useState(false)


    const [products, setProducts] =
        useState([])

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState('')

    const [searched, setSearched] =
        useState(false)

    const [toast, setToast] =
        useState({
            message: '',
            type: 'success'
        })

    // Premium 6 — autocomplete
    const [suggestions, setSuggestions] = useState([])
    const [suggestionsOpen, setSuggestionsOpen] = useState(false)
    const [suggestionsLoading, setSuggestionsLoading] = useState(false)
    const [activeSuggestion, setActiveSuggestion] = useState(-1)
    const suggestionRequestRef = useRef(0)


    // ========================================================
    // HISTORY -> SEARCH
    // ========================================================

    useEffect(() => {

        const queryParam =
            searchParams.get(
                'query'
            )

        const budgetParam =
            searchParams.get(
                'budget'
            )


        if (queryParam) {

            setQuery(
                queryParam
            )
        }


        if (budgetParam) {

            setBudget(
                budgetParam
            )
        }

    }, [searchParams])


    // ========================================================
    // PREMIUM 6 — SEARCH SUGGESTIONS & AUTOCOMPLETE
    // Uses the existing search API; no backend/database change.
    // ========================================================

    useEffect(() => {
        const text = query.trim()

        if (text.length < 2) {
            setSuggestions([])
            setSuggestionsOpen(false)
            setSuggestionsLoading(false)
            setActiveSuggestion(-1)
            return
        }

        const requestId = ++suggestionRequestRef.current

        const timer = window.setTimeout(async () => {
            try {
                setSuggestionsLoading(true)

                const response = await api.post(
                    '/api/search/products',
                    {
                        query: text,
                        max_budget: null,
                        colour: null,
                        category: null,
                        store: null,
                        location: null,
                        max_shipping: null,
                        sort_by: 'score'
                    }
                )

                if (requestId !== suggestionRequestRef.current) return

                const data = response.data
                const matches =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.products)
                            ? data.products
                            : Array.isArray(data?.results)
                                ? data.results
                                : []

                const unique = new Map()

                const add = (type, value) => {
                    const clean = String(value || '').trim()
                    if (!clean) return

                    const key = `${type}:${clean.toLowerCase()}`
                    if (!unique.has(key)) {
                        unique.set(key, { type, value: clean })
                    }
                }

                matches.slice(0, 8).forEach(product => {
                    add('product', product?.name)
                    add('category', product?.category)
                    add('store', product?.store)
                })

                setSuggestions(
                    Array.from(unique.values()).slice(0, 8)
                )
                setSuggestionsOpen(true)
                setActiveSuggestion(-1)

            } catch (err) {
                if (requestId === suggestionRequestRef.current) {
                    console.error('Suggestion error:', err)
                    setSuggestions([])
                }
            } finally {
                if (requestId === suggestionRequestRef.current) {
                    setSuggestionsLoading(false)
                }
            }
        }, 300)

        return () => window.clearTimeout(timer)
    }, [query])


    const applySuggestion = suggestion => {
        if (!suggestion) return

        if (suggestion.type === 'category') {
            setCategory(suggestion.value)

        } else if (suggestion.type === 'store') {
            setStore(suggestion.value)

        } else {
            setQuery(suggestion.value)
        }

        setSuggestionsOpen(false)
        setActiveSuggestion(-1)
    }


    const handleSuggestionKeyDown = event => {
        if (event.key === 'Escape') {
            setSuggestionsOpen(false)
            setActiveSuggestion(-1)
            return
        }

        if (!suggestionsOpen || suggestions.length === 0) return

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveSuggestion(current =>
                current >= suggestions.length - 1 ? 0 : current + 1
            )
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveSuggestion(current =>
                current <= 0 ? suggestions.length - 1 : current - 1
            )
            return
        }

        if (event.key === 'Enter' && activeSuggestion >= 0) {
            event.preventDefault()
            applySuggestion(suggestions[activeSuggestion])
        }
    }


    // ========================================================
    // SEARCH
    // ========================================================

    const handleSearch =
        async event => {

            event.preventDefault()

            setSuggestionsOpen(false)
            setActiveSuggestion(-1)


            if (!query.trim()) {

                setError(
                    'Please enter something to search for.'
                )

                return
            }


            if (
                budget !== '' &&
                Number(budget) < 0
            ) {

                setError(
                    'Maximum budget cannot be negative.'
                )

                return
            }


            if (
                shipping !== '' &&
                Number(shipping) < 0
            ) {

                setError(
                    'Maximum shipping cannot be negative.'
                )

                return
            }


            try {

                setLoading(true)
                setError('')
                setSearched(true)


                const response =
                    await api.post(
                        '/api/search/products',
                        {
                            query:
                                query.trim(),

                            max_budget:
                                budget !== ''
                                    ? Number(
                                        budget
                                    )
                                    : null,

                            colour:
                                colour.trim()
                                || null,

                            category:
                                category.trim()
                                || null,

                            store:
                                store.trim()
                                || null,

                            location:
                                location.trim()
                                || null,

                            max_shipping:
                                shipping !== ''
                                    ? Number(
                                        shipping
                                    )
                                    : null,

                            sort_by:
                                sortBy
                        }
                    )


                const data =
                    response.data


                setDeliveryLocation(
                    data?.delivery_location
                    || ''
                )

                setShippingEstimateAvailable(
                    Boolean(
                        data?.shipping_estimate_available
                    )
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
                        data?.products
                    )
                ) {

                    setProducts(
                        data.products
                    )

                } else if (
                    Array.isArray(
                        data?.results
                    )
                ) {

                    setProducts(
                        data.results
                    )

                } else {

                    setProducts(
                        []
                    )
                }


            } catch (err) {

                console.error(
                    'Search error:',
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
                    'Unable to search for products.'
                )


            } finally {

                setLoading(false)
            }
        }


    // ========================================================
    // FAVOURITE
    // ========================================================

    const handleFavourite =
        async productId => {

            try {

                setError('')

                await api.post(
                    `/api/favourites/${productId}`
                )


                setToast({
                    message:
                        'Product added to favourites.',
                    type:
                        'success'
                })


            } catch (err) {

                console.error(
                    'Favourite error:',
                    err
                )


                if (
                    err.response?.status === 401
                ) {

                    setError(
                        'Please sign in again to save favourites.'
                    )

                    return
                }


                setToast({
                    message:
                        err.response
                            ?.data
                            ?.detail
                        ||
                        'Unable to add product to favourites.',
                    type:
                        'error'
                })
            }
        }


    // ========================================================
    // PURCHASE
    // ========================================================

    const handlePurchase =
        async productId => {

            try {

                setError('')

                await api.post(
                    `/api/purchases/${productId}`
                )


                setToast({
                    message:
                        'Product marked as purchased.',
                    type:
                        'success'
                })


            } catch (err) {

                console.error(
                    'Purchase error:',
                    err
                )


                if (
                    err.response?.status === 409
                ) {

                    setToast({
                        message:
                            'This product is already in your purchase history.',
                        type:
                            'error'
                    })

                    return
                }


                setToast({
                    message:
                        err.response
                            ?.data
                            ?.detail
                        ||
                        'Unable to mark product as purchased.',
                    type:
                        'error'
                })
            }
        }


    // ========================================================
    // RESET
    // ========================================================

    const resetFilters =
        () => {

            setQuery('')
            setBudget('')
            setColour('')
            setCategory('')
            setStore('')
            setLocation('')
            setShipping('')
            setSortBy('score')

            setProducts([])
            setSearched(false)
            setError('')
            setDeliveryLocation('')
            setShippingEstimateAvailable(false)
            setSuggestions([])
            setSuggestionsOpen(false)
            setSuggestionsLoading(false)
            setActiveSuggestion(-1)

            navigate(
                '/search',
                {
                    replace: true
                }
            )
        }


    // ========================================================
    // ACTIVE FILTERS
    // ========================================================

    const activeFilters = [
        budget !== ''
            ? `Delivered budget ≤ R${Number(
                budget
            ).toLocaleString(
                'en-ZA'
            )}`
            : null,

        category
            ? `Category: ${category}`
            : null,

        colour
            ? `Colour: ${colour}`
            : null,

        store
            ? `Store: ${store}`
            : null,

        location
            ? `Location: ${location}`
            : null,

        shipping !== ''
            ? `Estimated shipping ≤ R${Number(
                shipping
            ).toLocaleString(
                'en-ZA'
            )}`
            : null

    ].filter(Boolean)


    // ========================================================
    // AUTH GUARD
    // ========================================================

    if (!user) {

        return (

            <div className="container py-5">

                <div className="auth-required-card">

                    <span className="smartshop-badge">
                        Smart Search
                    </span>

                    <h2 className="fw-bold mt-3">
                        Sign in to search SmartShop
                    </h2>

                    <p className="text-muted mb-4">

                        Search the catalogue using your
                        budget and shopping criteria,
                        save favourites and build
                        personalised recommendations.

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

        <main className="search-page-v3">

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
                    badge="Smart Search"
                    title="Find the right product"
                    description="Search by product, delivered budget, category, colour, store, estimated shipping and product location."
                />


                {/* =============================================
                    SEARCH PANEL
                ============================================== */}

                <section className="search-panel-v3">

                    <div className="search-panel-heading">

                        <div className="search-panel-icon">
                            ⌕
                        </div>

                        <div>

                            <span className="search-eyebrow">
                                PRODUCT DISCOVERY
                            </span>

                            <h2>
                                What are you looking for?
                            </h2>

                            <p>
                                Start with the product you need,
                                then narrow the results using
                                hard budget and shopping filters.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={
                            handleSearch
                        }
                    >

                        <div className="search-primary-field">

                            <label htmlFor="smart-search-query">
                                Search
                            </label>

                            <div className="premium-search-autocomplete">

                                <div className="search-query-wrapper">

                                    <span>
                                        ⌕
                                    </span>

                                    <input
                                        id="smart-search-query"
                                        type="text"
                                        placeholder="e.g. gaming mouse"
                                        value={query}
                                        autoComplete="off"
                                        aria-autocomplete="list"
                                        aria-expanded={suggestionsOpen}
                                        aria-controls="smart-search-suggestions"
                                        onChange={event => {
                                            setQuery(event.target.value)
                                            setSuggestionsOpen(true)
                                        }}
                                        onFocus={() => {
                                            if (query.trim().length >= 2) {
                                                setSuggestionsOpen(true)
                                            }
                                        }}
                                        onKeyDown={handleSuggestionKeyDown}
                                    />

                                    {suggestionsLoading && (
                                        <span className="premium-suggestion-spinner">
                                            •••
                                        </span>
                                    )}

                                </div>

                                {suggestionsOpen &&
                                    query.trim().length >= 2 && (

                                    <div
                                        id="smart-search-suggestions"
                                        className="premium-search-suggestions"
                                        role="listbox"
                                    >

                                        <div className="premium-suggestion-header">
                                            <span>Smart suggestions</span>
                                            <small>↑ ↓ navigate · Enter select · Esc close</small>
                                        </div>

                                        {!suggestionsLoading &&
                                            suggestions.length === 0 && (
                                            <div className="premium-suggestion-empty">
                                                Keep typing or press Search to explore the full catalogue.
                                            </div>
                                        )}

                                        {suggestions.map((suggestion, suggestionIndex) => (
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={
                                                    activeSuggestion === suggestionIndex
                                                }
                                                className={
                                                    activeSuggestion === suggestionIndex
                                                        ? 'premium-suggestion-item active'
                                                        : 'premium-suggestion-item'
                                                }
                                                key={`${suggestion.type}-${suggestion.value}`}
                                                onMouseDown={event => {
                                                    event.preventDefault()
                                                    applySuggestion(suggestion)
                                                }}
                                                onMouseEnter={() =>
                                                    setActiveSuggestion(suggestionIndex)
                                                }
                                            >
                                                <span className={`premium-suggestion-icon ${suggestion.type}`}>
                                                    {suggestion.type === 'product'
                                                        ? '⌕'
                                                        : suggestion.type === 'category'
                                                            ? '◇'
                                                            : '▣'}
                                                </span>

                                                <span className="premium-suggestion-copy">
                                                    <strong>{suggestion.value}</strong>
                                                    <small>
                                                        {suggestion.type === 'product'
                                                            ? 'Product'
                                                            : suggestion.type === 'category'
                                                                ? 'Category'
                                                                : 'Store'}
                                                    </small>
                                                </span>

                                                <span className="premium-suggestion-action">
                                                    {suggestion.type === 'category'
                                                        ? 'Use filter'
                                                        : suggestion.type === 'store'
                                                            ? 'Use filter'
                                                            : 'Search'}
                                                </span>
                                            </button>
                                        ))}

                                    </div>
                                )}

                            </div>

                            <small>
                                Product suggestions fill the search field.
                                Category and store suggestions apply directly
                                to their matching filters below.
                            </small>

                        </div>


                        <div className="search-filter-grid">

                            <SearchField
                                label="Maximum Delivered Budget"
                                type="number"
                                min="0"
                                placeholder="1500"
                                value={
                                    budget
                                }
                                onChange={
                                    setBudget
                                }
                                prefix="R"
                            />


                            <SearchField
                                label="Category"
                                placeholder="Gaming"
                                value={
                                    category
                                }
                                onChange={
                                    setCategory
                                }
                            />


                            <SearchField
                                label="Colour"
                                placeholder="Black"
                                value={
                                    colour
                                }
                                onChange={
                                    setColour
                                }
                            />


                            <SearchField
                                label="Store"
                                placeholder="Takealot"
                                value={
                                    store
                                }
                                onChange={
                                    setStore
                                }
                            />


                            <SearchField
                                label="Product Location"
                                placeholder="Durban"
                                value={
                                    location
                                }
                                onChange={
                                    setLocation
                                }
                            />


                            <SearchField
                                label="Maximum Estimated Shipping"
                                type="number"
                                min="0"
                                placeholder="100"
                                value={
                                    shipping
                                }
                                onChange={
                                    setShipping
                                }
                                prefix="R"
                            />

                        </div>


                        <div className="search-panel-footer">

                            <div className="search-sort-field">

                                <label htmlFor="search-sort">
                                    Sort Results
                                </label>

                                <select
                                    id="search-sort"
                                    value={
                                        sortBy
                                    }
                                    onChange={
                                        event =>
                                            setSortBy(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="score">
                                        Best Match
                                    </option>

                                    <option value="price_low">
                                        Price: Low to High
                                    </option>

                                    <option value="price_high">
                                        Price: High to Low
                                    </option>

                                    <option value="shipping">
                                        Lowest Shipping
                                    </option>

                                    <option value="rating">
                                        Highest Rating
                                    </option>

                                </select>

                            </div>


                            <div className="search-actions">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={
                                        resetFilters
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Reset
                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        loading
                                    }
                                >

                                    {
                                        loading
                                            ? 'Searching...'
                                            : 'Search Products'
                                    }

                                </button>

                            </div>

                        </div>

                    </form>

                </section>


                {/* =============================================
                    DELIVERY / SHIPPING CONTEXT
                ============================================== */}

                {
                    searched &&
                    !loading &&
                    shippingEstimateAvailable && (

                        <div
                            className="alert alert-light border shadow-sm mt-4 mb-4"
                            role="status"
                        >
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                                <div>
                                    <strong>
                                        Shipping estimated to {deliveryLocation}
                                    </strong>

                                    <div className="text-muted small mt-1">
                                        Maximum shipping and Lowest Shipping use your saved delivery province.
                                        When a maximum delivered budget is entered, SmartShop compares it with
                                        product price plus estimated shipping.
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() =>
                                        navigate(
                                            '/preferences'
                                        )
                                    }
                                >
                                    Change Province
                                </button>

                            </div>
                        </div>
                    )
                }


                {
                    searched &&
                    !loading &&
                    !shippingEstimateAvailable && (

                        <div
                            className="alert alert-warning mt-4 mb-4"
                            role="alert"
                        >
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                                <div>
                                    <strong>
                                        Delivery province not set
                                    </strong>

                                    <div className="small mt-1">
                                        SmartShop is using each product's catalogue base shipping cost.
                                        Set your delivery province for destination-aware shipping estimates
                                        and delivered-budget matching.
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-dark btn-sm"
                                    onClick={() =>
                                        navigate(
                                            '/preferences'
                                        )
                                    }
                                >
                                    Set Delivery Province
                                </button>

                            </div>
                        </div>
                    )
                }


                {/* =============================================
                    ACTIVE FILTERS
                ============================================== */}

                {
                    searched &&
                    activeFilters.length > 0 && (

                        <div className="search-active-filters">

                            <span className="search-active-label">
                                Active filters
                            </span>

                            {
                                activeFilters.map(
                                    filter => (

                                        <span
                                            className="search-filter-chip"
                                            key={
                                                filter
                                            }
                                        >
                                            {filter}
                                        </span>
                                    )
                                )
                            }

                        </div>
                    )
                }


                {/* =============================================
                    LOADING
                ============================================== */}

                {
                    loading && (

                        <LoadingState
                            title="Finding your best matches"
                            description="SmartShop is applying your search criteria, delivery province, shipping estimate and budget constraints."
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
                            title="We couldn't complete your search"
                            message={
                                error
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

                        <section className="search-results-v3">

                            <div className="search-results-heading">

                                <div>

                                    <span className="search-eyebrow">
                                        MATCHING PRODUCTS
                                    </span>

                                    <h2>
                                        Search Results
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
                                        matched your search.

                                    </p>

                                </div>


                                <div className="search-result-badge">
                                    {
                                        sortLabel(
                                            sortBy
                                        )
                                    }
                                </div>

                            </div>


                            <div className="row g-4 smart-product-grid">

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
                                                        index === 0
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
                    NO RESULTS
                ============================================== */}

                {
                    !loading &&
                    searched &&
                    !error &&
                    products.length === 0 && (

                        <EmptyState
                            icon="⌕"
                            eyebrow="NO EXACT MATCHES"
                            title="No products matched those filters"
                            description="Your filters are being treated as constraints. Try increasing your delivered budget, allowing more estimated shipping, or removing one of the category, colour, store or product-location filters."
                            actionLabel="Reset Filters"
                            onAction={
                                resetFilters
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


// ============================================================
// SEARCH FIELD
// ============================================================

function SearchField({
    label,
    type = 'text',
    min,
    placeholder,
    value,
    onChange,
    prefix
}) {

    return (

        <div className="search-field-v3">

            <label>
                {label}
            </label>

            <div className="search-field-input">

                {
                    prefix && (

                        <span>
                            {prefix}
                        </span>
                    )
                }

                <input
                    type={
                        type
                    }
                    min={
                        min
                    }
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

            </div>

        </div>
    )
}


// ============================================================
// SORT LABEL
// ============================================================

function sortLabel(value) {

    const labels = {
        score:
            'Best Match',

        price_low:
            'Price ↑',

        price_high:
            'Price ↓',

        shipping:
            'Lowest Shipping',

        rating:
            'Highest Rating'
    }

    return (
        labels[value]
        ??
        'Best Match'
    )
}


export default Search