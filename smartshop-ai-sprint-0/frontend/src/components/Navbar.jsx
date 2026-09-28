import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'


function Navbar() {

  const {
    user,
    isAuthenticated,
    logout
  } = useAuth()


  return (

    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

      <div className="container">

        <Link
          className="navbar-brand fw-bold"
          to="/"
        >
          SmartShop AI
        </Link>


        <div className="navbar-nav ms-auto">

          <Link
            className="nav-link"
            to="/"
          >
            Home
          </Link>


          <Link
            className="nav-link"
            to="/search"
          >
            Search
          </Link>


          <Link
            className="nav-link"
            to="/favourites"
          >
            Favourites
          </Link>


          {isAuthenticated ? (

            <>

              <Link
                className="nav-link"
                to="/profile"
              >
                Hi, {user?.first_name}
              </Link>


              <button
                className="btn btn-outline-light ms-2"
                onClick={logout}
              >
                Logout
              </button>

            </>

          ) : (

            <Link
              className="btn btn-primary ms-2"
              to="/login"
            >
              Login
            </Link>

 
    

          )}

        </div>

      </div>

    </nav>

  )

}


export default Navbar