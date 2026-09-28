// ============================================================
// SMARTSHOP AI
// PREMIUM 5 — RECOMMENDATION INSIGHT ENGINE
// frontend/src/utils/recommendationInsights.js
// ============================================================

const SIGNAL_META = {

    search: {
        label: 'Current Search',
        phrase: 'your current search'
    },

    category: {
        label: 'Category Preference',
        phrase: 'your category preferences'
    },

    colour: {
        label: 'Colour Preference',
        phrase: 'your colour preferences'
    },

    store: {
        label: 'Store Preference',
        phrase: 'your preferred stores'
    },

    budget: {
        label: 'Budget Match',
        phrase: 'your budget'
    },

    history: {
        label: 'Search History',
        phrase: 'your previous searches'
    },

    favourites: {
        label: 'Favourites',
        phrase: 'products you have saved'
    },

    purchases: {
        label: 'Purchase History',
        phrase: 'your purchase history'
    },

    rating: {
        label: 'Product Rating',
        phrase: 'its product rating'
    }
}


// ============================================================
// MATCH QUALITY CONSTANTS
// ============================================================

export const MATCH_QUALITY = {

    EXCELLENT: 'excellent',

    STRONG: 'strong',

    GOOD: 'good',

    DEVELOPING: 'developing'
}


// ============================================================
// SCORE HELPERS
// ============================================================

const clampScore = value => {

    const score =
        Number(value)

    if (!Number.isFinite(score)) {

        return null
    }

    return Math.min(
        100,
        Math.max(
            0,
            score
        )
    )
}


// ============================================================
// GET RECOMMENDATION SCORE
// ============================================================

export const getRecommendationScore =
    product => {

        return clampScore(

            product?.recommendation_score
            ??
            product?.ai_score
            ??
            product?.match_score
            ??
            product?.score
        )
    }


// ============================================================
// MATCH QUALITY
// ============================================================

export const getMatchQuality =
    scoreValue => {

        const score =
            clampScore(
                scoreValue
            )


        if (score === null) {

            return {

                key:
                    MATCH_QUALITY.DEVELOPING,

                label:
                    'Personalised Pick',

                description:
                    'Selected using the SmartShop signals currently available.'
            }
        }


        if (score >= 85) {

            return {

                key:
                    MATCH_QUALITY.EXCELLENT,

                label:
                    'Excellent Match',

                description:
                    'This product aligns with several strong SmartShop signals.'
            }
        }


        if (score >= 70) {

            return {

                key:
                    MATCH_QUALITY.STRONG,

                label:
                    'Strong Match',

                description:
                    'This product aligns well with your current shopping profile.'
            }
        }


        if (score >= 50) {

            return {

                key:
                    MATCH_QUALITY.GOOD,

                label:
                    'Good Match',

                description:
                    'This product matches some of the signals SmartShop has learned.'
            }
        }


        return {

            key:
                MATCH_QUALITY.DEVELOPING,

            label:
                'Possible Match',

            description:
                'This product has some relevance while your SmartShop profile continues to develop.'
        }
    }


// ============================================================
// PRODUCT RECOMMENDATION SIGNALS
// ============================================================

export const getRecommendationSignals =
    product => {

        const breakdown =
            product?.score_breakdown
            ??
            {}


        return Object.entries(
            breakdown
        )

            .map(
                ([
                    key,
                    rawValue
                ]) => {

                    const value =
                        Number(
                            rawValue
                        )


                    return {

                        key,

                        value:
                            Number.isFinite(
                                value
                            )
                                ? value
                                : 0,

                        label:
                            SIGNAL_META[
                                key
                            ]?.label
                            ??
                            key,

                        phrase:
                            SIGNAL_META[
                                key
                            ]?.phrase
                            ??
                            key
                    }
                }
            )

            .filter(
                signal =>
                    signal.value > 0
            )

            .sort(
                (a, b) =>
                    b.value
                    -
                    a.value
            )
    }


// ============================================================
// JOIN HUMAN-READABLE PHRASES
// ============================================================

const joinPhrases =
    phrases => {

        if (
            phrases.length === 0
        ) {

            return ''
        }


        if (
            phrases.length === 1
        ) {

            return phrases[0]
        }


        if (
            phrases.length === 2
        ) {

            return `${phrases[0]} and ${phrases[1]}`
        }


        return `${
            phrases
                .slice(
                    0,
                    -1
                )
                .join(', ')
        }, and ${
            phrases[
                phrases.length - 1
            ]
        }`
    }


// ============================================================
// BUILD "WHY THIS MATCHES YOU" EXPLANATION
// ============================================================

export const buildRecommendationExplanation =
    product => {

        const backendReasons =

            Array.isArray(
                product?.match_reasons
            )

                ? product
                    .match_reasons
                    .filter(Boolean)

                : Array.isArray(
                    product?.reasons
                )

                    ? product
                        .reasons
                        .filter(Boolean)

                    : []


        const signals =
            getRecommendationSignals(
                product
            )


        // --------------------------------------------------------
        // Prefer real score breakdown signals
        // --------------------------------------------------------

        if (
            signals.length > 0
        ) {

            const strongest =
                signals.slice(
                    0,
                    3
                )


            const phrases =
                strongest.map(
                    signal =>
                        signal.phrase
                )


            return {

                summary:
                    `This recommendation is influenced most by ${joinPhrases(
                        phrases
                    )}.`,

                detail:
                    backendReasons[0]
                    ??
                    'SmartShop ranked this product using the strongest signals in your shopping profile.',

                source:
                    'score_breakdown'
            }
        }


        // --------------------------------------------------------
        // Fall back to backend recommendation reasons
        // --------------------------------------------------------

        if (
            backendReasons.length > 0
        ) {

            return {

                summary:
                    backendReasons[0],

                detail:
                    backendReasons[1]
                    ??
                    'This explanation comes from the recommendation signals returned for this product.',

                source:
                    'backend_reason'
            }
        }


        // --------------------------------------------------------
        // Safe fallback
        // --------------------------------------------------------

        return {

            summary:
                'SmartShop selected this product using the personalisation signals currently available.',

            detail:
                'Searches, preferences, favourites, purchases, budget and product quality can contribute when those signals are available.',

            source:
                'fallback'
        }
    }


// ============================================================
// COMPLETE PRODUCT INSIGHT
// ============================================================

export const getRecommendationInsight =
    product => {

        const score =
            getRecommendationScore(
                product
            )


        const quality =
            getMatchQuality(
                score
            )


        const signals =
            getRecommendationSignals(
                product
            )


        const explanation =
            buildRecommendationExplanation(
                product
            )


        return {

            score,

            quality,

            signals,

            strongestSignals:
                signals.slice(
                    0,
                    3
                ),

            explanation,

            hasScore:
                score !== null,

            hasSignalBreakdown:
                signals.length > 0
        }
    }


// ============================================================
// COLLECTION-LEVEL RECOMMENDATION INTELLIGENCE
// ============================================================

export const getRecommendationCollectionInsights =
    products => {

        const list =
            Array.isArray(
                products
            )
                ? products
                : []


        const insights =
            list.map(
                product =>
                    getRecommendationInsight(
                        product
                    )
            )


        const scored =
            insights.filter(
                insight =>
                    insight.hasScore
            )


        // --------------------------------------------------------
        // Average AI match
        // --------------------------------------------------------

        const averageScore =

            scored.length > 0

                ? Math.round(

                    scored.reduce(
                        (
                            total,
                            insight
                        ) =>
                            total
                            +
                            insight.score,
                        0
                    )

                    /

                    scored.length
                )

                : null


        // --------------------------------------------------------
        // Aggregate recommendation signals
        // --------------------------------------------------------

        const signalTotals =
            {}


        insights.forEach(
            insight => {

                insight.signals.forEach(
                    signal => {

                        signalTotals[
                            signal.key
                        ] =

                            (
                                signalTotals[
                                    signal.key
                                ]
                                ??
                                0
                            )

                            +

                            signal.value
                    }
                )
            }
        )


        // --------------------------------------------------------
        // Find strongest signals across recommendation collection
        // --------------------------------------------------------

        const dominantSignals =

            Object.entries(
                signalTotals
            )

                .map(
                    ([
                        key,
                        value
                    ]) => ({

                        key,

                        value,

                        label:
                            SIGNAL_META[
                                key
                            ]?.label
                            ??
                            key
                    })
                )

                .sort(
                    (a, b) =>
                        b.value
                        -
                        a.value
                )

                .slice(
                    0,
                    3
                )


        return {

            total:
                list.length,

            averageScore,

            dominantSignals
        }
    }