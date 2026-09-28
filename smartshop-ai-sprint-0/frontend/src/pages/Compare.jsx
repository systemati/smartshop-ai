import { Link, useNavigate } from 'react-router-dom'
import { useComparison } from '../context/ComparisonContext'
import { getStoredUser } from '../services/auth'

const money = value =>
    `R${Number(value || 0).toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`

function Compare() {
    const navigate = useNavigate()
    const user = getStoredUser()
    const { products, removeProduct, clearProducts } = useComparison()

    if (!user) {
        return (
            <div className="container py-5">
                <div className="auth-required-card">
                    <span className="smartshop-badge">Product Comparison</span>
                    <h2 className="fw-bold mt-3">Sign in to compare products</h2>
                    <p className="text-muted mb-4">
                        Compare SmartShop products using price, shipping,
                        ratings and product details.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        Sign in
                    </button>
                </div>
            </div>
        )
    }

    if (products.length < 2) {
        return (
            <main className="compare-page">
                <div className="container py-5">
                    <section className="compare-empty">
                        <span className="smartshop-badge">Premium Comparison</span>
                        <div className="compare-empty-mark">⇄</div>
                        <h1>Select at least two products.</h1>
                        <p>
                            Add products to comparison from Search, For You or
                            your dashboard. You can compare up to three at once.
                        </p>
                        <Link to="/search" className="btn btn-primary">
                            Find products
                        </Link>
                    </section>
                </div>
            </main>
        )
    }

    const shipping = p => Number(p.estimated_shipping_cost ?? p.shipping_cost ?? 0)
    const total = p => Number(p.total_price ?? (Number(p.price || 0) + shipping(p)))
    const score = p => p.score ?? p.match_score ?? p.recommendation_score

    const rows = [
        ['Product price', p => money(p.price)],
        ['Estimated shipping', p => money(shipping(p))],
        ['Delivered total', p => money(total(p)), 'strong'],
        ['Rating', p => p.rating ? `${Number(p.rating).toFixed(1)} / 5` : 'Not rated'],
        ['Store', p => p.store || 'Not specified'],
        ['Category', p => p.category || 'Not specified'],
        ['Colour', p => p.colour || 'Not specified'],
        ['Size', p => p.size || 'Not specified'],
        ['Ships from', p => p.location || 'Not specified'],
        ['Delivery province', p => p.delivery_location || 'Not set'],
        ['AI Match', p => score(p) != null ? `${Math.round(Number(score(p)))}%` : 'Not available']
    ]

    return (
        <main className="compare-page">
            <div className="container py-5">
                <header className="compare-header">
                    <div>
                        <span className="premium-section-eyebrow">PREMIUM COMPARISON</span>
                        <h1>Compare the details that matter.</h1>
                        <p>
                            Review product facts, destination-aware shipping and
                            delivered cost side by side.
                        </p>
                    </div>
                    <div className="compare-header-actions">
                        <Link to="/search" className="btn btn-outline-primary">
                            Add another product
                        </Link>
                        <button type="button" className="comparison-clear" onClick={clearProducts}>
                            Clear comparison
                        </button>
                    </div>
                </header>

                <section className="compare-shell">
                    <div
                        className="compare-grid compare-product-heads"
                        style={{ '--compare-count': products.length }}
                    >
                        <div className="compare-label-cell">PRODUCT</div>
                        {products.map(product => (
                            <article className="compare-product-head" key={product.product_id}>
                                <button
                                    type="button"
                                    className="compare-remove"
                                    onClick={() => removeProduct(product.product_id)}
                                    aria-label={`Remove ${product.name}`}
                                >
                                    ×
                                </button>
                                <div className="compare-image-wrap">
                                    <img
                                        src={product.image_url || '/products/placeholder.webp'}
                                        alt={product.name}
                                    />
                                </div>
                                <span>{product.category || 'Product'}</span>
                                <h2>{product.name}</h2>
                                <strong>{money(product.price)}</strong>
                            </article>
                        ))}
                    </div>

                    <div className="compare-table">
                        {rows.map(([label, formatter, emphasis]) => (
                            <div
                                className={`compare-grid compare-row ${emphasis === 'strong' ? 'compare-row-emphasis' : ''}`}
                                style={{ '--compare-count': products.length }}
                                key={label}
                            >
                                <div className="compare-label-cell">{label}</div>
                                {products.map(product => (
                                    <div className="compare-value-cell" key={product.product_id}>
                                        {formatter(product)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div
                        className="compare-grid compare-actions-row"
                        style={{ '--compare-count': products.length }}
                    >
                        <div className="compare-label-cell">NEXT STEP</div>
                        {products.map(product => (
                            <div className="compare-value-cell" key={product.product_id}>
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={() =>
                                        navigate(`/search?query=${encodeURIComponent(product.name)}`)
                                    }
                                >
                                    Find this product
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <p className="compare-disclaimer">
                    Shipping values are SmartShop estimates and may differ from
                    the retailer's final courier charge.
                </p>
            </div>
        </main>
    )
}

export default Compare
