import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react'

const RecentlyViewedContext = createContext(null)

const STORAGE_KEY = 'smartshop_recently_viewed'
const MAX_RECENT_PRODUCTS = 12


export function RecentlyViewedProvider({
    children
}) {

    const [products, setProducts] =
        useState(() => {

            try {

                const stored =
                    JSON.parse(
                        localStorage.getItem(
                            STORAGE_KEY
                        )
                        || '[]'
                    )

                return Array.isArray(stored)
                    ? stored.slice(
                        0,
                        MAX_RECENT_PRODUCTS
                    )
                    : []

            } catch {

                return []
            }
        })


    useEffect(() => {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        )

    }, [products])


    const recordView =
        product => {

            const productId =
                product?.product_id
                ?? product?.id

            if (!productId) {
                return
            }


            const viewedProduct = {
                ...product,
                viewed_at:
                    new Date().toISOString()
            }


            setProducts(current => {

                const withoutCurrent =
                    current.filter(
                        item =>
                            (
                                item?.product_id
                                ?? item?.id
                            ) !== productId
                    )

                return [
                    viewedProduct,
                    ...withoutCurrent
                ].slice(
                    0,
                    MAX_RECENT_PRODUCTS
                )
            })
        }


    const removeViewed =
        productId => {

            setProducts(current =>
                current.filter(
                    item =>
                        (
                            item?.product_id
                            ?? item?.id
                        ) !== productId
                )
            )
        }


    const clearViewed =
        () => {

            setProducts([])
        }


    const value =
        useMemo(
            () => ({
                products,
                count: products.length,
                maxProducts:
                    MAX_RECENT_PRODUCTS,
                recordView,
                removeViewed,
                clearViewed
            }),
            [products]
        )


    return (

        <RecentlyViewedContext.Provider
            value={value}
        >
            {children}
        </RecentlyViewedContext.Provider>
    )
}


export function useRecentlyViewed() {

    const context =
        useContext(
            RecentlyViewedContext
        )

    if (!context) {

        throw new Error(
            'useRecentlyViewed must be used inside RecentlyViewedProvider'
        )
    }

    return context
}
