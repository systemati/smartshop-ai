import {
  Navigate
} from 'react-router-dom'

import {
  useAuth
} from '../context/AuthContext'


function Profile() {

  const {
    user,
    loading,
    isAuthenticated
  } = useAuth()


  if (loading) {

    return (

      <div className="container py-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        />

        <p className="mt-3">
          Loading profile...
        </p>

      </div>

    )

  }


  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  return (

    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div className="card shadow-sm border-0">

            <div className="card-body p-4">

              <h1 className="fw-bold">
                My Profile
              </h1>

              <p className="text-muted">
                Your SmartShop AI account.
              </p>


              <hr />


              <div className="row">

                <div className="col-md-6 mb-3">

                  <strong>
                    First Name
                  </strong>

                  <p>
                    {user.first_name}
                  </p>

                </div>


                <div className="col-md-6 mb-3">

                  <strong>
                    Last Name
                  </strong>

                  <p>
                    {user.last_name}
                  </p>

                </div>


                <div className="col-md-12">

                  <strong>
                    Email
                  </strong>

                  <p>
                    {user.email}
                  </p>

                </div>

              </div>


              <hr />


              <h4 className="fw-bold">
                Shopping Preferences
              </h4>

              <p className="text-muted">
                Your personalised shopping preferences
                will be managed here.
              </p>


              <button
                className="btn btn-primary"
                disabled
              >
                Preferences Coming Next
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}


export default Profile