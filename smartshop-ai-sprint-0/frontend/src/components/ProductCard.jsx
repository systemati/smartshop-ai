import { useEffect, useState } from 'react'
import { useComparison } from '../context/ComparisonContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { analyseBudget, BUDGET_STATUS } from '../utils/budgetOptimizer'
import { getRecommendationInsight } from '../utils/recommendationInsights'
import Toast from './Toast'

function ProductCard({
    product,
    index = 0,
    onFavourite = null,
    onRemoveFavourite = null,
    onPurchase = null,
    topPick = false,
    showScore = true,
    showBreakdown = false,
    budget = null
}) {

    const [detailsOpen, setDetailsOpen] = useState(false)
    const [actionToast, setActionToast] = useState({ message: '', type: 'success' })

    const { recordView } = useRecentlyViewed()

    const {
        products: comparisonProducts,
        count: comparisonCount,
        maxProducts,
        addProduct,
        removeProduct
    } = useComparison()


    const productId =
        product?.product_id ??
        product?.id


    const isCompared =
        comparisonProducts.some(
            item =>
                (
                    item?.product_id
                    ?? item?.id
                ) === productId
        )

    const comparisonFull =
        comparisonCount >= maxProducts

    const toggleCompare = () => {

        if (!productId) {
            return
        }

        if (isCompared) {
            removeProduct(productId)
            return
        }

        addProduct(product)
    }

    const score =
        product?.recommendation_score ??
        product?.ai_score ??
        product?.match_score ??
        product?.score

    const rank =
        product?.recommendation_rank ??
        index + 1

    const reasons =
        product?.match_reasons ??
        product?.reasons ??
        []

    const breakdown =
        product?.score_breakdown ??
        {}

    const price =
        Number(product?.price || 0)

    const baseShipping =
        Number(
            product?.base_shipping_cost
            ?? product?.shipping_cost
            ?? 0
        )

    const estimatedShipping =
        Number(
            product?.estimated_shipping_cost
            ?? product?.shipping_cost
            ?? 0
        )

    const deliveredTotal =
        Number(
            product?.total_price
            ?? (
                price +
                estimatedShipping
            )
        )

    const numericBudget = Number(budget)
    const hasBudget =
        budget !== null &&
        budget !== '' &&
        Number.isFinite(numericBudget) &&
        numericBudget > 0

    const budgetAnalysis =
        hasBudget
            ? analyseBudget(product, numericBudget)
            : null


    const recommendationInsight =
        getRecommendationInsight(product)

    const matchQuality =
        recommendationInsight.quality

    const strongestSignals =
        recommendationInsight.strongestSignals

    const recommendationExplanation =
        recommendationInsight.explanation


    const deliveryLocation =
        product?.delivery_location || ''

    const shippingEstimateAvailable =
        Boolean(
            product?.shipping_estimate_available
        )

    const rating =
        product?.rating ??
        'N/A'

    const numericScore =
        score !== undefined &&
        score !== null
            ? Math.min(
                100,
                Math.max(
                    0,
                    Number(score)
                )
            )
            : null

    const imageUrl =
        product?.image_url ||
        '/products/fallback.svg'


    const signalLabels = {
        search: 'Current Search',
        category: 'Category Preference',
        colour: 'Colour Preference',
        store: 'Store Preference',
        budget: 'Budget Match',
        history: 'Search History',
        favourites: 'Favourites',
        purchases: 'Purchase History',
        rating: 'Product Rating'
    }


    const activeSignals =
        Object.entries(breakdown)
            .filter(
                ([, value]) =>
                    Number(value) > 0
            )
            .sort(
                (a, b) =>
                    Number(b[1]) -
                    Number(a[1])
            )


    const formatPrice = (value) => {

        return Number(value || 0)
            .toLocaleString(
                'en-ZA',
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
    }


    const handleImageError = (event) => {

        const image =
            event.currentTarget

        if (
            image.dataset.fallbackApplied
        ) {
            return
        }

        image.dataset.fallbackApplied =
            'true'

        image.src =
            '/products/fallback.svg'
    }


    const showActionToast = (message, type = 'success') => {
        setActionToast({ message, type })
    }

    const closeActionToast = () => {
        setActionToast({ message: '', type: 'success' })
    }

    const handleFavourite = async () => {
        if (!productId || !onFavourite) return

        try {
            await onFavourite(productId)
            showActionToast(`${product?.name || 'Product'} added to favourites.`)
        } catch (error) {
            showActionToast(
                error?.response?.data?.detail ||
                error?.message ||
                'Could not add this product to favourites.',
                'error'
            )
        }
    }

    const handlePurchase = async () => {
        if (!productId || !onPurchase) return

        try {
            await onPurchase(productId)
            setDetailsOpen(false)
            showActionToast(`${product?.name || 'Product'} marked as purchased.`)
        } catch (error) {
            showActionToast(
                error?.response?.data?.detail ||
                error?.message ||
                'Could not mark this product as purchased.',
                'error'
            )
        }
    }


    const openDetails = () => {
        recordView(product)
        setDetailsOpen(true)
    }


    const closeDetails = () => {
        setDetailsOpen(false)
    }


    useEffect(() => {

        if (!detailsOpen) {
            return
        }

        const handleEscape = (event) => {

            if (event.key === 'Escape') {
                closeDetails()
            }
        }

        document.addEventListener(
            'keydown',
            handleEscape
        )

        document.body.classList.add(
            'product-modal-open'
        )

        return () => {

            document.removeEventListener(
                'keydown',
                handleEscape
            )

            document.body.classList.remove(
                'product-modal-open'
            )
        }

    }, [detailsOpen])


    return (
        <>
            <Toast
                message={actionToast.message}
                type={actionToast.type}
                onClose={closeActionToast}
            />

            {/* ==================================================
                COMPACT PRODUCT CARD
            ================================================== */}

            <article className="card smartshop-product-card smart-product-card-v2 h-100">

                {/* IMAGE */}

                <div className="product-image-wrapper product-image-v2">

                    <img
                        src={imageUrl}
                        alt={
                            product?.name ||
                            'SmartShop product'
                        }
                        className="product-image"
                        loading="lazy"
                        onError={
                            handleImageError
                        }
                    />


                    <div className="product-image-badges">

                        {topPick && (
                            <span className="product-top-pick">
                                Top Pick
                            </span>
                        )}

                    </div>


                    {showScore && rank && (

                        <span className="product-rank product-rank-v2">
                            #{rank}
                        </span>

                    )}


                    {onFavourite && (

                        <button
                            type="button"
                            className="product-heart-button"
                            disabled={!productId}
                            onClick={
                                handleFavourite
                            }
                            aria-label="Add product to favourites"
                            title="Add to favourites"
                        >
                            ♡
                        </button>

                    )}

                </div>


                {/* CONTENT */}

                <div className="card-body product-card-body-v2">

                    <div className="product-card-topline">

                        <span className="badge product-category-badge">
                            {
                                product?.category ||
                                'Product'
                            }
                        </span>


                        <span className="product-card-rating">
                            <span className="rating-star">
                                ★
                            </span>

                            {rating}
                        </span>

                    </div>


                    <h4 className="product-name product-name-v2">
                        {
                            product?.name ||
                            'Unnamed product'
                        }
                    </h4>


                    <p className="product-description product-description-v2">
                        {
                            product?.description ||
                            'No description available.'
                        }
                    </p>


                    <div className="product-price-row">

                        <div>
                            <div className="product-price product-price-v2">
                                R{formatPrice(price)}
                            </div>

                            {shippingEstimateAvailable && (

                                <div className="small text-muted mt-1">
                                    Delivered total: R{formatPrice(deliveredTotal)}
                                </div>

                            )}
                        </div>

                    </div>


                    {budgetAnalysis && (
                        <div className={`product-budget-intelligence ${budgetAnalysis.status}`}>
                            <div className="product-budget-heading">
                                <span>
                                    {budgetAnalysis.status === BUDGET_STATUS.OVER
                                        ? 'Over budget'
                                        : budgetAnalysis.status === BUDGET_STATUS.NEAR_LIMIT
                                            ? 'Near budget limit'
                                            : 'Within budget'}
                                </span>
                                <strong>
                                    {budgetAnalysis.withinBudget
                                        ? `R${formatPrice(budgetAnalysis.remaining)} left`
                                        : `R${formatPrice(budgetAnalysis.shortfall)} over`}
                                </strong>
                            </div>

                            <div className="product-budget-track">
                                <span style={{
                                    width: `${Math.min(budgetAnalysis.utilisation, 100)}%`
                                }} />
                            </div>

                            <small>
                                R{formatPrice(budgetAnalysis.deliveredTotal)}
                                {' delivered · '}
                                {budgetAnalysis.utilisation}% of R{formatPrice(budgetAnalysis.budget)}
                            </small>
                        </div>
                    )}


                    <div className="product-quick-info">

                        <div className="product-quick-row">

                            <span>
                                Store
                            </span>

                            <strong>
                                {
                                    product?.store ||
                                    'Not specified'
                                }
                            </strong>

                        </div>


                        <div className="product-quick-row">

                            <span>
                                {
                                    shippingEstimateAvailable
                                        ? 'Estimated Shipping'
                                        : 'Shipping'
                                }
                            </span>

                            <strong>
                                {
                                    estimatedShipping === 0
                                        ? 'Free'
                                        : `R${formatPrice(estimatedShipping)}`
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="product-chip-row">

                        {product?.colour && (
                            <span className="product-detail-chip">
                                {product.colour}
                            </span>
                        )}


                        {product?.size && (
                            <span className="product-detail-chip">
                                {product.size}
                            </span>
                        )}


                        {product?.location && (
                            <span className="product-detail-chip">
                                {product.location}
                            </span>
                        )}

                    </div>


                    {showScore &&
                        numericScore !== null && (

                        <div className={`product-card-ai premium-ai-insight ${matchQuality.key}`}>

                            <div className="product-card-ai-heading">

                                <div>
                                    <span>
                                        SmartShop AI
                                    </span>

                                    <strong className="premium-ai-quality">
                                        {matchQuality.label}
                                    </strong>
                                </div>

                                <strong className="premium-ai-score">
                                    {Math.round(numericScore)}%
                                </strong>

                            </div>

                            <div
                                className="progress product-card-ai-progress"
                                role="progressbar"
                                aria-label="AI recommendation match score"
                                aria-valuenow={numericScore}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${numericScore}%`
                                    }}
                                />
                            </div>

                            {strongestSignals.length > 0 && (
                                <div className="premium-ai-signal-chips">
                                    {strongestSignals.map(signal => (
                                        <span
                                            key={signal.key}
                                            className="premium-ai-signal-chip"
                                            title={`${signal.label}: +${signal.value}`}
                                        >
                                            {signal.label}
                                        </span>
                                    ))}
                                </div>
                            )}

                        </div>

                    )}


                    <div className="product-card-actions-v2 premium-card-actions">

                        <button
                            type="button"
                            className={
                                isCompared
                                    ? 'btn product-compare-button selected'
                                    : 'btn product-compare-button'
                            }
                            disabled={
                                !productId
                                || (
                                    comparisonFull
                                    && !isCompared
                                )
                            }
                            onClick={
                                toggleCompare
                            }
                            title={
                                comparisonFull
                                && !isCompared
                                    ? `Compare up to ${maxProducts} products`
                                    : (
                                        isCompared
                                            ? 'Remove from comparison'
                                            : 'Add to comparison'
                                    )
                            }
                        >
                            <span aria-hidden="true">
                                {isCompared ? '✓' : '⇄'}
                            </span>

                            {
                                isCompared
                                    ? 'Comparing'
                                    : 'Compare'
                            }
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary product-view-button"
                            onClick={
                                openDetails
                            }
                        >
                            View Details
                        </button>

                    </div>

                </div>

            </article>


            {/* ==================================================
                PRODUCT DETAILS MODAL
            ================================================== */}

            {detailsOpen && (

                <div
                    className="product-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDetails()
                        }
                    }}
                >

                    <section
                        className="product-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={
                            product?.name ||
                            'Product details'
                        }
                    >

                        {/* CLOSE */}

                        <button
                            type="button"
                            className="product-modal-close"
                            onClick={
                                closeDetails
                            }
                            aria-label="Close product details"
                        >
                            ×
                        </button>


                        <div className="product-modal-layout">

                            {/* LEFT */}

                            <div className="product-modal-visual">

                                <div className="product-modal-image">

                                    <img
                                        src={imageUrl}
                                        alt={
                                            product?.name ||
                                            'SmartShop product'
                                        }
                                        onError={
                                            handleImageError
                                        }
                                    />


                                    {topPick && (

                                        <span className="product-top-pick modal-top-pick">
                                            Top Pick
                                        </span>

                                    )}

                                </div>


                                <div className="product-modal-summary">

                                    <span className="badge product-category-badge">
                                        {
                                            product?.category ||
                                            'Product'
                                        }
                                    </span>


                                    <h2>
                                        {
                                            product?.name ||
                                            'Unnamed product'
                                        }
                                    </h2>


                                    <div className="modal-price-rating">

                                        <div className="modal-product-price">
                                            R{formatPrice(price)}
                                        </div>


                                        <div className="modal-rating">
                                            <span>
                                                ★
                                            </span>

                                            {rating}
                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* RIGHT */}

                            <div className="product-modal-content">

                                <div className="product-modal-section">

                                    <span className="product-modal-eyebrow">
                                        Product Details
                                    </span>


                                    <p className="product-modal-description">
                                        {
                                            product?.description ||
                                            'No description available.'
                                        }
                                    </p>

                                </div>


                                <div className="product-detail-grid">

                                    <ProductDetail
                                        label="Store"
                                        value={
                                            product?.store ||
                                            'Not specified'
                                        }
                                    />

                                    <ProductDetail
                                        label="Colour"
                                        value={
                                            product?.colour ||
                                            'Not specified'
                                        }
                                    />

                                    <ProductDetail
                                        label="Size"
                                        value={
                                            product?.size ||
                                            'Not specified'
                                        }
                                    />

                                    <ProductDetail
                                        label="Location"
                                        value={
                                            product?.location ||
                                            'Not specified'
                                        }
                                    />

                                    <ProductDetail
                                        label={
                                            shippingEstimateAvailable
                                                ? 'Estimated Shipping'
                                                : 'Shipping'
                                        }
                                        value={
                                            estimatedShipping === 0
                                                ? 'Free'
                                                : `R${formatPrice(estimatedShipping)}`
                                        }
                                    />

                                    {shippingEstimateAvailable && (

                                        <ProductDetail
                                            label="Delivered Total"
                                            value={`R${formatPrice(deliveredTotal)}`}
                                        />

                                    )}

                                    {shippingEstimateAvailable && deliveryLocation && (

                                        <ProductDetail
                                            label="Delivery Province"
                                            value={deliveryLocation}
                                        />

                                    )}

                                    {shippingEstimateAvailable && (

                                        <ProductDetail
                                            label="Base Shipping"
                                            value={
                                                baseShipping === 0
                                                    ? 'Free'
                                                    : `R${formatPrice(baseShipping)}`
                                            }
                                        />

                                    )}

                                    <ProductDetail
                                        label="Rating"
                                        value={`★ ${rating}`}
                                    />

                                </div>


                                {shippingEstimateAvailable && (

                                    <div className="alert alert-light border mt-3 mb-0 small">
                                        <strong>Estimated delivered price:</strong>
                                        {' '}
                                        R{formatPrice(price)}
                                        {' + '}
                                        R{formatPrice(estimatedShipping)}
                                        {' shipping = '}
                                        <strong>
                                            R{formatPrice(deliveredTotal)}
                                        </strong>
                                        {deliveryLocation
                                            ? ` to ${deliveryLocation}.`
                                            : '.'}
                                    </div>

                                )}


                                {/* PREMIUM AI INTELLIGENCE */}

                                {showScore &&
                                    numericScore !== null && (

                                    <div className={`modal-ai-card premium-modal-ai ${matchQuality.key}`}>

                                        <div className="modal-ai-header">

                                            <div>
                                                <span className="product-modal-eyebrow">
                                                    SmartShop AI Intelligence
                                                </span>

                                                <h3>
                                                    {matchQuality.label}
                                                </h3>

                                                <p className="premium-ai-quality-description">
                                                    {matchQuality.description}
                                                </p>
                                            </div>

                                            <strong>
                                                {Math.round(numericScore)}%
                                            </strong>

                                        </div>

                                        <div
                                            className="progress modal-ai-progress"
                                            role="progressbar"
                                            aria-label="AI recommendation match score"
                                            aria-valuenow={numericScore}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${numericScore}%`
                                                }}
                                            />
                                        </div>

                                        <div className="premium-ai-explanation">
                                            <span className="product-modal-eyebrow">
                                                Why this matches you
                                            </span>

                                            <p>
                                                {recommendationExplanation.summary}
                                            </p>

                                            {recommendationExplanation.detail && (
                                                <small>
                                                    {recommendationExplanation.detail}
                                                </small>
                                            )}
                                        </div>

                                        {strongestSignals.length > 0 && (
                                            <div className="premium-ai-strongest">
                                                <span className="product-modal-eyebrow">
                                                    Strongest signals
                                                </span>

                                                <div className="premium-ai-strongest-grid">
                                                    {strongestSignals.map(signal => (
                                                        <div
                                                            className="premium-ai-strongest-item"
                                                            key={signal.key}
                                                        >
                                                            <span>
                                                                {signal.label}
                                                            </span>

                                                            <strong>
                                                                +{signal.value}
                                                            </strong>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                )}


                                {/* REASONS */}

                                {Array.isArray(reasons) &&
                                    reasons.length > 0 && (

                                    <div className="product-modal-section">

                                        <h3 className="product-modal-section-title">
                                            Why recommended
                                        </h3>


                                        <div className="recommendation-reason-list">

                                            {
                                                reasons
                                                    .slice(
                                                        0,
                                                        5
                                                    )
                                                    .map(
                                                        (
                                                            reason,
                                                            reasonIndex
                                                        ) => (

                                                        <div
                                                            className="recommendation-reason-item"
                                                            key={
                                                                `${productId}-reason-${reasonIndex}`
                                                            }
                                                        >

                                                            <span>
                                                                ✓
                                                            </span>

                                                            <p>
                                                                {reason}
                                                            </p>

                                                        </div>

                                                    )
                                                )
                                            }

                                        </div>

                                    </div>

                                )}


                                {/* BREAKDOWN */}

                                {showBreakdown &&
                                    activeSignals.length > 0 && (

                                    <div className="product-modal-section">

                                        <h3 className="product-modal-section-title">
                                            Recommendation signals
                                        </h3>


                                        <p className="product-modal-helper">
                                            Signals contributing to this product's AI match.
                                        </p>


                                        <div className="signal-grid">

                                            {
                                                activeSignals.map(
                                                    ([
                                                        signal,
                                                        value
                                                    ]) => (

                                                    <div
                                                        className="signal-card"
                                                        key={
                                                            signal
                                                        }
                                                    >

                                                        <span>
                                                            {
                                                                signalLabels[
                                                                    signal
                                                                ]
                                                                ??
                                                                signal
                                                            }
                                                        </span>


                                                        <strong>
                                                            +{
                                                                Number(
                                                                    value
                                                                )
                                                            }
                                                        </strong>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}


                                {/* ACTIONS */}

                                <div className="product-modal-actions">

                                    <button
                                        type="button"
                                        className={
                                            isCompared
                                                ? 'btn product-compare-button selected'
                                                : 'btn product-compare-button'
                                        }
                                        disabled={
                                            !productId
                                            || (
                                                comparisonFull
                                                && !isCompared
                                            )
                                        }
                                        onClick={
                                            toggleCompare
                                        }
                                    >
                                        <span aria-hidden="true">
                                            {isCompared ? '✓' : '⇄'}
                                        </span>

                                        {
                                            isCompared
                                                ? 'Added to Compare'
                                                : 'Add to Compare'
                                        }
                                    </button>



                                    {onFavourite && (

                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            disabled={
                                                !productId
                                            }
                                            onClick={
                                                handleFavourite
                                            }
                                        >
                                            ♡ Add to Favourites
                                        </button>

                                    )}


                                    {onRemoveFavourite && (

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            disabled={
                                                !productId
                                            }
                                            onClick={() =>
                                                onRemoveFavourite(
                                                    productId
                                                )
                                            }
                                        >
                                            Remove Favourite
                                        </button>

                                    )}


                                    {onPurchase && (

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={
                                                !productId
                                            }
                                            onClick={
                                                handlePurchase
                                            }
                                        >
                                            Mark as Purchased
                                        </button>

                                    )}

                                </div>

                            </div>

                        </div>

                    </section>

                </div>

            )}

        </>
    )
}



function ProductDetail({
    label,
    value
}) {

    return (

        <div className="modal-detail-item">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>

    )
}


export default ProductCard