def test_search_products(
    client,
    authenticated_user,
    sample_product
):

    response = client.post(

        "/api/search/products",

        headers=
            authenticated_user[
                "headers"
            ],

        json={
            "query":
                "headphones",

            "max_budget":
                1000,

            "colour":
                "Black",

            "category":
                "Technology",

            "store":
                "",

            "location":
                "",

            "max_shipping":
                None,

            "sort_by":
                "price_low"
        }
    )


    assert (
        response.status_code
        == 200
    )


    data = response.json()


    assert (
        data["count"]
        >= 1
    )


    products = (
        data["products"]
    )


    assert any(

        product["product_id"]
        == sample_product.product_id

        for product in products
    )


def test_search_respects_budget(
    client,
    authenticated_user,
    sample_product
):

    response = client.post(

        "/api/search/products",

        headers=
            authenticated_user[
                "headers"
            ],

        json={
            "query":
                "headphones",

            "max_budget":
                100,

            "sort_by":
                "price_low"
        }
    )


    assert (
        response.status_code
        == 200
    )


    data = response.json()


    assert (
        data["count"]
        == 0
    )


def test_search_requires_authentication(
    client
):

    response = client.post(

        "/api/search/products",

        json={
            "query":
                "headphones"
        }
    )


    assert (
        response.status_code
        == 401
    )