import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink,
    useLocation,
    useNavigate
} from 'react-router-dom'

import {
    useState
} from 'react'

import Home from './pages/Home'
import Search from './pages/Search'
import Recommendations from './pages/Recommendations'
import Favourites from './pages/Favourites'
import History from './pages/History'
import Preferences from './pages/Preferences'
import Login from './pages/Login'
import Register from './pages/Register'
import Purchases from './pages/Purchases'
import Compare from './pages/Compare'
import Budget from './pages/Budget'
import Onboarding from './pages/Onboarding'
import ComparisonTray from './components/ComparisonTray'
import { ComparisonProvider } from './context/ComparisonContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'

import {
    getStoredUser,
    logoutUser
} from './services/auth'


// ============================================================
// NAVIGATION
// ============================================================

function Navigation({
    user,
    onLogout
}) {

    const navigate =
        useNavigate()

    const location =
        useLocation()

    const [
        mobileOpen,
        setMobileOpen
    ] = useState(false)


    const handleLogout = () => {

        logoutUser()

        onLogout()

        setMobileOpen(false)

        navigate('/login')
    }


    const closeMobileMenu = () => {

        setMobileOpen(false)
    }


    const navClass = ({
        isActive
    }) => {

        return isActive
            ? 'smart-nav-link active'
            : 'smart-nav-link'
    }


    const accountActive = [

        '/purchases',
        '/history',
        '/preferences',
        '/compare',
        '/onboarding'

    ].includes(
        location.pathname
    )


    const displayName =

        user?.full_name
        ??
        user?.name
        ??
        user?.email
        ??
        'Account'


    const firstLetter =

        String(
            displayName
        )
            .charAt(0)
            .toUpperCase()


    return (

        <header className="smartshop-header">

            <nav className="smartshop-navbar">

                <div className="container smartshop-nav-container">


                    {/* BRAND */}

                    <Link
                        to="/"
                        className="smartshop-brand"
                        onClick={
                            closeMobileMenu
                        }
                    >

                        <span className="brand-icon">
                            S
                        </span>

                        <span className="brand-text">

                            SmartShop

                            <span className="brand-ai">
                                AI
                            </span>

                        </span>

                    </Link>


                    {/* MOBILE BUTTON */}

                    <button
                        type="button"
                        className={
                            mobileOpen
                                ? 'smart-mobile-toggle open'
                                : 'smart-mobile-toggle'
                        }
                        onClick={() =>
                            setMobileOpen(
                                !mobileOpen
                            )
                        }
                        aria-label="Toggle navigation"
                        aria-expanded={
                            mobileOpen
                        }
                    >

                        <span />

                        <span />

                        <span />

                    </button>


                    {/* NAVIGATION CONTENT */}

                    <div
                        className={
                            mobileOpen
                                ? 'smart-nav-content open'
                                : 'smart-nav-content'
                        }
                    >


                        {/* PRIMARY NAV */}

                        <div className="smart-primary-nav">

                            {user ? (

                                <>

                                    <NavLink
                                        to="/search"
                                        className={
                                            navClass
                                        }
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        Search
                                    </NavLink>


                                    <NavLink
                                        to="/recommendations"
                                        className={
                                            navClass
                                        }
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        For You
                                    </NavLink>


                                    <NavLink
                                        to="/favourites"
                                        className={
                                            navClass
                                        }
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        Favourites
                                    </NavLink>


                                    <NavLink
                                        to="/budget"
                                        className={
                                            navClass
                                        }
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        Budget
                                    </NavLink>


                                    <NavLink
                                        to="/compare"
                                        className={
                                            navClass
                                        }
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        Compare
                                    </NavLink>

                                </>

                            ) : (

                                <NavLink
                                    to="/"
                                    end
                                    className={
                                        navClass
                                    }
                                    onClick={
                                        closeMobileMenu
                                    }
                                >
                                    Home
                                </NavLink>

                            )}

                        </div>


                        {/* RIGHT SIDE */}

                        <div className="smart-nav-actions">

                            {user ? (

                                <details
                                    className={
                                        accountActive
                                            ? 'account-dropdown account-active'
                                            : 'account-dropdown'
                                    }
                                >

                                    <summary className="account-summary">

                                        <span className="account-avatar">
                                            {
                                                firstLetter
                                            }
                                        </span>

                                        <span className="account-text">

                                            <small>
                                                Account
                                            </small>

                                            <strong>
                                                {
                                                    displayName
                                                }
                                            </strong>

                                        </span>

                                        <span className="account-arrow">
                                            ▾
                                        </span>

                                    </summary>


                                    <div className="account-panel">

                                        <div className="account-panel-header">

                                            <span className="account-avatar account-avatar-large">
                                                {
                                                    firstLetter
                                                }
                                            </span>

                                            <div>

                                                <strong>
                                                    {
                                                        displayName
                                                    }
                                                </strong>

                                                <small>
                                                    SmartShop account
                                                </small>

                                            </div>

                                        </div>


                                        <div className="account-divider" />


                                        <NavLink
                                            to="/purchases"
                                            className="account-menu-link"
                                            onClick={
                                                closeMobileMenu
                                            }
                                        >
                                            <span>
                                                Purchases
                                            </span>

                                            <small>
                                                Products you've bought
                                            </small>
                                        </NavLink>


                                        <NavLink
                                            to="/history"
                                            className="account-menu-link"
                                            onClick={
                                                closeMobileMenu
                                            }
                                        >
                                            <span>
                                                Search History
                                            </span>

                                            <small>
                                                Your recent searches
                                            </small>
                                        </NavLink>


                                        <NavLink
                                            to="/preferences"
                                            className="account-menu-link"
                                            onClick={
                                                closeMobileMenu
                                            }
                                        >
                                            <span>
                                                Preferences
                                            </span>

                                            <small>
                                                Personalise recommendations
                                            </small>
                                        </NavLink>


                                        <div className="account-divider" />


                                        <button
                                            type="button"
                                            className="account-logout-button"
                                            onClick={
                                                handleLogout
                                            }
                                        >
                                            Sign out
                                        </button>

                                    </div>

                                </details>

                            ) : (

                                <div className="auth-nav-buttons">

                                    <Link
                                        to="/login"
                                        className="btn smart-login-button"
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        Sign in
                                    </Link>


                                    <Link
                                        to="/register"
                                        className="btn btn-primary smart-register-button"
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        Create account
                                    </Link>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </nav>

        </header>
    )
}


// ============================================================
// 404
// ============================================================

function NotFound() {

    return (

        <div className="container py-5">

            <div className="empty-state">

                <div className="not-found-code">
                    404
                </div>

                <h2 className="fw-bold">
                    Page not found
                </h2>

                <p className="text-muted mb-4">
                    The page you are looking for does not exist
                    or may have been moved.
                </p>

                <Link
                    to="/"
                    className="btn btn-primary px-4"
                >
                    Back to SmartShop
                </Link>

            </div>

        </div>
    )
}


// ============================================================
// FOOTER
// ============================================================

function Footer() {

    return (

        <footer className="smartshop-footer">

            <div className="container">

                <div className="smartshop-footer-content">

                    <div>

                        <div className="footer-brand">
                            SmartShop
                            <span className="brand-ai">
                                AI
                            </span>
                        </div>

                        <small>
                            Smarter product discovery for
                            better buying decisions.
                        </small>

                    </div>


                    <small className="footer-note">
                        Personalised recommendations.
                        Budget-aware shopping.
                    </small>

                </div>

            </div>

        </footer>
    )
}


// ============================================================
// APP CONTENT
// ============================================================

function AppContent() {

    const [
        user,
        setUser
    ] = useState(() =>
        getStoredUser()
    )


    const handleLogin = (
        loggedInUser
    ) => {

        setUser(
            loggedInUser
        )
    }


    const handleLogout = () => {

        setUser(null)
    }


    return (

        <div className="app-shell">

            <Navigation
                user={user}
                onLogout={
                    handleLogout
                }
            />


            <main className="app-content">

                <Routes>


                    {/* PUBLIC */}

                    <Route
                        path="/"
                        element={
                            <Home />
                        }
                    />


                    <Route
                        path="/login"
                        element={
                            <Login
                                onLogin={
                                    handleLogin
                                }
                            />
                        }
                    />


                    <Route
                        path="/register"
                        element={
                            <Register />
                        }
                    />


                    {/* SMARTSHOP APP */}

                    <Route
                        path="/search"
                        element={
                            <Search />
                        }
                    />


                    <Route
                        path="/recommendations"
                        element={
                            <Recommendations />
                        }
                    />


                    <Route
                        path="/favourites"
                        element={
                            <Favourites />
                        }
                    />


                    <Route
                        path="/purchases"
                        element={
                            <Purchases />
                        }
                    />


                    <Route
                        path="/history"
                        element={
                            <History />
                        }
                    />


                    <Route
                        path="/preferences"
                        element={
                            <Preferences />
                        }
                    />

                    <Route
                        path="/onboarding"
                        element={
                            <Onboarding />
                        }
                    />


                    <Route
                        path="/budget"
                        element={
                            <Budget />
                        }
                    />


                    <Route
    path="/compare"
    element={
        <Compare />
    }
/>


                    {/* FALLBACK */}

                    <Route
                        path="*"
                        element={
                            <NotFound />
                        }
                    />

                </Routes>

            </main>


            {user && <ComparisonTray />}

            <Footer />

        </div>
    )
}


// ============================================================
// ROOT APP
// ============================================================

function App() {

    return (

        <BrowserRouter>

            <ComparisonProvider>

                <RecentlyViewedProvider>

                    <AppContent />

                </RecentlyViewedProvider>

            </ComparisonProvider>

        </BrowserRouter>
    )
}


export default App