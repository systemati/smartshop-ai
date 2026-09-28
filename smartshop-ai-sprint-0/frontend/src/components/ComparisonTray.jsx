import { useLocation, useNavigate } from 'react-router-dom'
import { useComparison } from '../context/ComparisonContext'

function ComparisonTray() {
    const navigate = useNavigate()
    const location = useLocation()
    const {
        products,
        count,
        maxProducts,
        removeProduct,
        clearProducts
    } = useComparison()

    if (!count || location.pathname === '/compare') return null

    return (
        <aside className="comparison-tray" aria-label="Product comparison">
            <div className="comparison-tray-copy">
                <span className="comparison-tray-badge">COMPARE</span>
                <strong>{count} of {maxProducts} products selected</strong>
            </div>

            <div className="comparison-tray-products">
                {products.map(product => (
                    <div className="comparison-tray-item" key={product.product_id}>
                        <img
                            src={product.image_url || '/products/placeholder.webp'}
                            alt=""
                            onError={event => {
                                event.currentTarget.style.display = 'none'
                            }}
                        />
                        <span>{product.name}</span>
                        <button
                            type="button"
                            onClick={() => removeProduct(product.product_id)}
                            aria-label={`Remove ${product.name} from comparison`}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="comparison-tray-actions">
                <button
                    type="button"
                    className="comparison-clear"
                    onClick={clearProducts}
                >
                    Clear
                </button>
                <button
                    type="button"
                    className="comparison-open"
                    disabled={count < 2}
                    onClick={() => navigate('/compare')}
                >
                    Compare {count > 1 ? 'products' : ''}
                    <span>→</span>
                </button>
            </div>
        </aside>
    )
}

export default ComparisonTray
