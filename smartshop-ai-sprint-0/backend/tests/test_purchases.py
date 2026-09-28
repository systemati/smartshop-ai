def test_add_purchase(
    client,
    authenticated_user,
    sample_product
):

    response = client.post(

        f"/api/purchases/"
        f"{sample_product.product_id}",

        headers=
            authenticated_user[
                "headers"
            ]
    )


    assert (
        response.status_code
        == 201
    )


    data = response.json()


    assert (
        data["purchase"][
            "product_id"
        ]
        == sample_product.product_id
    )


def test_duplicate_purchase_rejected(
    client,
    authenticated_user,
    sample_product
):

    url = (
        f"/api/purchases/"
        f"{sample_product.product_id}"
    )


    first_response = (
        client.post(

            url,

            headers=
                authenticated_user[
                    "headers"
                ]
        )
    )


    assert (
        first_response.status_code
        == 201
    )


    second_response = (
        client.post(

            url,

            headers=
                authenticated_user[
                    "headers"
                ]
        )
    )


    assert (
        second_response.status_code
        == 409
    )


def test_purchase_history(
    client,
    authenticated_user,
    sample_product
):

    client.post(

        f"/api/purchases/"
        f"{sample_product.product_id}",

        headers=
            authenticated_user[
                "headers"
            ]
    )


    response = client.get(

        "/api/purchases/",

        headers=
            authenticated_user[
                "headers"
            ]
    )


    assert (
        response.status_code
        == 200
    )


    data = response.json()


    assert (
        data["count"]
        == 1
    )


    assert (
        data["purchases"][0][
            "product_id"
        ]
        == sample_product.product_id
    )


def test_delete_purchase(
    client,
    authenticated_user,
    sample_product
):

    create_response = (
        client.post(

            f"/api/purchases/"
            f"{sample_product.product_id}",

            headers=
                authenticated_user[
                    "headers"
                ]
        )
    )


    purchase_id = (
        create_response
        .json()[
            "purchase"
        ][
            "purchase_id"
        ]
    )


    delete_response = (
        client.delete(

            f"/api/purchases/"
            f"{purchase_id}",

            headers=
                authenticated_user[
                    "headers"
                ]
        )
    )


    assert (
        delete_response.status_code
        == 200
    )


    history_response = (
        client.get(

            "/api/purchases/",

            headers=
                authenticated_user[
                    "headers"
                ]
        )
    )


    assert (
        history_response
        .json()["count"]
        == 0
    )


def test_purchase_requires_authentication(
    client,
    sample_product
):

    response = client.post(

        f"/api/purchases/"
        f"{sample_product.product_id}"
    )


    assert (
        response.status_code
        == 401
    )