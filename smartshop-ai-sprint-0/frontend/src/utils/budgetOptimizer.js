// ============================================================
// SMARTSHOP AI
// PREMIUM 4 — SMART BUDGET OPTIMIZER
// ============================================================
//
// Purpose:
// - Calculate a product's delivered cost
// - Compare delivered cost with the user's budget
// - Determine whether a product is:
//      1. Within budget
//      2. Near the budget limit
//      3. Over budget
// - Calculate remaining budget or shortfall
// - Rank products by budget fit
//
// IMPORTANT:
// This utility does not make API calls.
// It only performs calculations using product data supplied to it.
// ============================================================


// ============================================================
// BUDGET STATUS
// ============================================================

export const BUDGET_STATUS = {

    WITHIN:
        'within',

    NEAR_LIMIT:
        'near_limit',

    OVER:
        'over'
}


// ============================================================
// SAFE MONEY VALUE
// ============================================================
//
// Converts incoming values to safe positive numbers.
//
// Examples:
//
// "1200" -> 1200
// 1200   -> 1200
// null   -> 0
// "abc"  -> 0
// -100   -> 0
//
// ============================================================

export function safeMoney(
    value
) {

    const number =
        Number(value)


    return Number.isFinite(number)
        ? Math.max(
            number,
            0
        )
        : 0
}


// ============================================================
// GET ESTIMATED SHIPPING
// ============================================================
//
// SmartShop shipping priority:
//
// 1. estimated_shipping_cost
// 2. shipping_cost
// 3. base_shipping_cost
// 4. 0
//
// This keeps the optimizer compatible with products coming from
// Search, Recommendations, Favourites and other SmartShop pages.
//
// ============================================================

export function getEstimatedShipping(
    product
) {

    return safeMoney(

        product
            ?.estimated_shipping_cost

        ??

        product
            ?.shipping_cost

        ??

        product
            ?.base_shipping_cost

        ??

        0
    )
}


// ============================================================
// GET DELIVERED TOTAL
// ============================================================
//
// If the backend already supplied total_price, use it.
//
// Otherwise:
//
// delivered total = product price + estimated shipping
//
// ============================================================

export function getDeliveredTotal(
    product
) {

    const explicitTotal =
        Number(
            product?.total_price
        )


    if (
        Number.isFinite(
            explicitTotal
        )
        &&
        explicitTotal >= 0
    ) {

        return explicitTotal
    }


    const productPrice =
        safeMoney(
            product?.price
        )


    const shipping =
        getEstimatedShipping(
            product
        )


    return (
        productPrice
        +
        shipping
    )
}


// ============================================================
// ANALYSE ONE PRODUCT AGAINST A BUDGET
// ============================================================
//
// Example:
//
// Budget:
// R2,000
//
// Product:
// R1,650
//
// Shipping:
// R125
//
// Delivered:
// R1,775
//
// Remaining:
// R225
//
// Utilisation:
// 89%
//
// Status:
// within
//
// ============================================================

export function analyseBudget(
    product,
    budget
) {

    const safeBudget =
        safeMoney(
            budget
        )


    const productPrice =
        safeMoney(
            product?.price
        )


    const shipping =
        getEstimatedShipping(
            product
        )


    const deliveredTotal =
        getDeliveredTotal(
            product
        )


    // --------------------------------------------------------
    // DIFFERENCE
    // --------------------------------------------------------

    const difference =
        Number(
            (
                safeBudget
                -
                deliveredTotal
            )
                .toFixed(2)
        )


    // --------------------------------------------------------
    // BUDGET UTILISATION
    // --------------------------------------------------------

    const utilisation =

        safeBudget > 0

            ? Math.round(
                (
                    deliveredTotal
                    /
                    safeBudget
                )
                *
                100
            )

            : 0


    // --------------------------------------------------------
    // DETERMINE STATUS
    // --------------------------------------------------------

    let status =
        BUDGET_STATUS.WITHIN


    // Product costs more than available budget.

    if (
        deliveredTotal
        >
        safeBudget
    ) {

        status =
            BUDGET_STATUS.OVER
    }


    // Product still fits, but consumes at least 90%
    // of the user's budget.

    else if (
        safeBudget > 0
        &&
        utilisation >= 90
    ) {

        status =
            BUDGET_STATUS.NEAR_LIMIT
    }


    // --------------------------------------------------------
    // RETURN ANALYSIS
    // --------------------------------------------------------

    return {

        product,

        budget:
            safeBudget,

        productPrice,

        shipping,

        deliveredTotal,

        difference,


        // Amount left after purchasing the product.

        remaining:
            Math.max(
                difference,
                0
            ),


        // Additional money required if over budget.

        shortfall:
            Math.max(
                -difference,
                0
            ),


        utilisation,

        status,


        // Convenient boolean used by UI components.

        withinBudget:
            deliveredTotal
            <=
            safeBudget
    }
}


// ============================================================
// OPTIMISE A COLLECTION OF PRODUCTS
// ============================================================
//
// The optimizer receives products from SmartShop's existing
// recommendation system.
//
// It DOES NOT replace recommendation intelligence.
//
// Instead:
//
// Recommendation engine
//        ↓
// Personalised products
//        ↓
// Budget optimizer
//        ↓
// Delivered-budget ranking
//
// ============================================================

export function optimiseProducts(
    products,
    budget
) {

    // --------------------------------------------------------
    // VALIDATE PRODUCT COLLECTION
    // --------------------------------------------------------

    if (
        !Array.isArray(
            products
        )
    ) {

        return []
    }


    // --------------------------------------------------------
    // ANALYSE EVERY PRODUCT
    // --------------------------------------------------------

    const analysedProducts =

        products.map(
            product =>
                analyseBudget(
                    product,
                    budget
                )
        )


    // --------------------------------------------------------
    // RANK PRODUCTS
    // --------------------------------------------------------

    return analysedProducts.sort(
        (
            a,
            b
        ) => {


            // =================================================
            // RULE 1
            // Affordable products come before over-budget items.
            // =================================================

            if (
                a.withinBudget
                !==
                b.withinBudget
            ) {

                return a.withinBudget
                    ? -1
                    : 1
            }


            // =================================================
            // RULE 2
            // For affordable products, favour products that use
            // the available budget efficiently without exceeding
            // the limit.
            //
            // Example:
            //
            // Budget R2,000
            //
            // Product A = R1,950
            // Product B = R1,300
            //
            // Product A has the stronger budget fit.
            // =================================================

            if (
                a.withinBudget
                &&
                b.withinBudget
            ) {

                if (
                    b.utilisation
                    !==
                    a.utilisation
                ) {

                    return (
                        b.utilisation
                        -
                        a.utilisation
                    )
                }
            }


            // =================================================
            // RULE 3
            // If both products exceed the budget, put the product
            // with the smallest shortfall first.
            // =================================================

            if (
                !a.withinBudget
                &&
                !b.withinBudget
                &&
                a.shortfall
                !==
                b.shortfall
            ) {

                return (
                    a.shortfall
                    -
                    b.shortfall
                )
            }


            // =================================================
            // RULE 4
            // Preserve SmartShop recommendation intelligence as
            // the final tie-breaker.
            // =================================================

            const scoreA =
                Number(

                    a.product
                        ?.recommendation_score

                    ??

                    a.product
                        ?.match_score

                    ??

                    a.product
                        ?.score

                    ??

                    0
                )


            const scoreB =
                Number(

                    b.product
                        ?.recommendation_score

                    ??

                    b.product
                        ?.match_score

                    ??

                    b.product
                        ?.score

                    ??

                    0
                )


            return (
                scoreB
                -
                scoreA
            )
        }
    )
}


// ============================================================
// GET BUDGET SUMMARY
// ============================================================
//
// Generates the high-level information displayed by the Premium
// Budget page.
//
// Example result:
//
// {
//     budget: 2000,
//     totalProducts: 20,
//     affordableCount: 13,
//     overBudgetCount: 7,
//     bestFit: {...},
//     closestOver: {...}
// }
//
// ============================================================

export function getBudgetSummary(
    analyses,
    budget
) {

    const safeBudget =
        safeMoney(
            budget
        )


    const list =

        Array.isArray(
            analyses
        )

            ? analyses

            : []


    // --------------------------------------------------------
    // AFFORDABLE PRODUCTS
    // --------------------------------------------------------

    const within =

        list.filter(
            item =>
                item.withinBudget
        )


    // --------------------------------------------------------
    // OVER-BUDGET PRODUCTS
    // --------------------------------------------------------

    const over =

        list.filter(
            item =>
                !item.withinBudget
        )


    // --------------------------------------------------------
    // BEST AFFORDABLE PRODUCT
    // --------------------------------------------------------
    //
    // optimiseProducts() already sorts affordable products by
    // budget utilisation, so the first affordable item becomes
    // the best budget fit.
    //
    // --------------------------------------------------------

    const bestFit =
        within[0]
        ??
        null


    // --------------------------------------------------------
    // CLOSEST PRODUCT ABOVE BUDGET
    // --------------------------------------------------------

    const closestOver =
        over[0]
        ??
        null


    // --------------------------------------------------------
    // RETURN SUMMARY
    // --------------------------------------------------------

    return {

        budget:
            safeBudget,

        totalProducts:
            list.length,

        affordableCount:
            within.length,

        overBudgetCount:
            over.length,

        bestFit,

        closestOver
    }
}