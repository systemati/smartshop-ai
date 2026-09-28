def test_register_user(
    client
):

    response = client.post(

        "/api/auth/register",

        json={

            "first_name":
                "Olwethu",

            "last_name":
                "Tester",

            "email":
                "register@smartshop.com",

            "password":
                "StrongPassword123!"
        }
    )


    assert (
        response.status_code
        == 201
    ), response.text


    data = response.json()


    assert (
        data["email"]
        == "register@smartshop.com"
    )

    assert (
        data["first_name"]
        == "Olwethu"
    )

    assert (
        "password"
        not in data
    )

    assert (
        "password_hash"
        not in data
    )


def test_login_user(
    client
):

    credentials = {

        "first_name":
            "Login",

        "last_name":
            "Tester",

        "email":
            "login@smartshop.com",

        "password":
            "StrongPassword123!"
    }


    register_response = client.post(

        "/api/auth/register",

        json=
            credentials
    )


    assert (
        register_response.status_code
        == 201
    ), register_response.text


    response = client.post(

        "/api/auth/login",

        json={

            "email":
                credentials[
                    "email"
                ],

            "password":
                credentials[
                    "password"
                ]
        }
    )


    assert (
        response.status_code
        == 200
    ), response.text


    data = response.json()


    assert (
        "access_token"
        in data
    )

    assert (
        data["token_type"]
        == "bearer"
    )


def test_current_user(
    client,
    authenticated_user
):

    response = client.get(

        "/api/auth/me",

        headers=
            authenticated_user[
                "headers"
            ]
    )


    assert (
        response.status_code
        == 200
    ), response.text


    data = response.json()


    assert (
        data["email"]
        ==
        authenticated_user[
            "registration"
        ]["email"]
    )


def test_invalid_login(
    client
):

    response = client.post(

        "/api/auth/login",

        json={

            "email":
                "nobody@smartshop.com",

            "password":
                "WrongPassword123!"
        }
    )


    assert (
        response.status_code
        == 401
    ), response.text


def test_me_requires_authentication(
    client
):

    response = client.get(
        "/api/auth/me"
    )


    assert (
        response.status_code
        == 401
    )