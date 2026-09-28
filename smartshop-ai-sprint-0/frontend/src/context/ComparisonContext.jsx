import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react'

const ComparisonContext = createContext(null)
const STORAGE_KEY = 'smartshop_comparison'
const MAX_PRODUCTS = 3

export function ComparisonProvider({ children }) {
    const [products, setProducts] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
            return Array.isArray(saved) ? saved.slice(0, MAX_PRODUCTS) : []
        } catch {
            return []
        }
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    }, [products])

    const addProduct = product => {
        if (!product?.product_id) return { ok: false, reason: 'invalid' }
        if (products.some(item => item.product_id === product.product_id)) {
            return { ok: false, reason: 'exists' }
        }
        if (products.length >= MAX_PRODUCTS) {
            return { ok: false, reason: 'limit' }
        }
        setProducts(current => [...current, product])
        return { ok: true }
    }

    const removeProduct = productId =>
        setProducts(current =>
            current.filter(item => item.product_id !== productId)
        )

    const clearProducts = () => setProducts([])

    const isCompared = productId =>
        products.some(item => item.product_id === productId)

    const value = useMemo(() => ({
        products,
        count: products.length,
        maxProducts: MAX_PRODUCTS,
        addProduct,
        removeProduct,
        clearProducts,
        isCompared
    }), [products])

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    )
}

export function useComparison() {
    const context = useContext(ComparisonContext)
    if (!context) {
        throw new Error('useComparison must be used inside ComparisonProvider')
    }
    return context
}
