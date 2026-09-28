# ============================================================
# SMARTSHOP SHIPPING ESTIMATOR
# ============================================================
#
# Shipping is estimated from:
#
# 1. The product's catalogue location
# 2. The user's saved delivery province
# 3. The product's existing base shipping cost
#
# This is an estimate, not a live courier quotation.
# ============================================================


# ============================================================
# PRODUCT LOCATION -> PROVINCE
# ============================================================

PRODUCT_LOCATION_PROVINCES = {

    "cape town":
        "Western Cape",

    "durban":
        "KwaZulu-Natal",

    "johannesburg":
        "Gauteng",
}


# ============================================================
# SHIPPING SURCHARGES
# ============================================================

SAME_PROVINCE_SURCHARGE = 0.0

INTERPROVINCIAL_SURCHARGE = 75.0


# ============================================================
# HELPERS
# ============================================================

def clean_location(value):
    """
    Normalize location text for matching.
    """

    if not value:
        return None

    return str(
        value
    ).strip().lower()


def get_product_province(
    product_location
):
    """
    Convert a catalogue city into its province.

    Unknown locations return None so the estimator can
    safely fall back to the catalogue shipping cost.
    """

    normalized_location = (
        clean_location(
            product_location
        )
    )

    if not normalized_location:
        return None

    return (
        PRODUCT_LOCATION_PROVINCES.get(
            normalized_location
        )
    )


# ============================================================
# SHIPPING ESTIMATE
# ============================================================

def estimate_shipping(
    product_location,
    delivery_location,
    base_shipping_cost
):
    """
    Calculate estimated shipping.

    Same province:
        existing catalogue shipping cost

    Different province:
        existing catalogue shipping cost
        + interprovincial surcharge

    Missing/unknown location:
        existing catalogue shipping cost
    """

    try:

        base_shipping = float(
            base_shipping_cost or 0
        )

    except (
        TypeError,
        ValueError
    ):

        base_shipping = 0.0


    base_shipping = max(
        base_shipping,
        0.0
    )


    product_province = (
        get_product_province(
            product_location
        )
    )


    if (
        not delivery_location
        or not product_province
    ):

        return round(
            base_shipping,
            2
        )


    normalized_delivery = (
        clean_location(
            delivery_location
        )
    )


    normalized_product_province = (
        clean_location(
            product_province
        )
    )


    if (
        normalized_delivery
        == normalized_product_province
    ):

        surcharge = (
            SAME_PROVINCE_SURCHARGE
        )

    else:

        surcharge = (
            INTERPROVINCIAL_SURCHARGE
        )


    return round(
        base_shipping
        + surcharge,
        2
    )


# ============================================================
# DELIVERED TOTAL
# ============================================================

def calculate_delivered_total(
    product_price,
    estimated_shipping_cost
):
    """
    Product price + estimated shipping.
    """

    try:

        price = float(
            product_price or 0
        )

    except (
        TypeError,
        ValueError
    ):

        price = 0.0


    try:

        shipping = float(
            estimated_shipping_cost or 0
        )

    except (
        TypeError,
        ValueError
    ):

        shipping = 0.0


    return round(
        max(price, 0.0)
        +
        max(shipping, 0.0),
        2
    )