function ErrorState({
    title = 'We could not load this page',
    message,
    onRetry,
    retryLabel = 'Try Again'
}) {

    return (

        <section
            className="smart-error-state"
            role="alert"
        >

            <div className="smart-error-icon">
                !
            </div>

            <span className="smart-error-eyebrow">
                SOMETHING WENT WRONG
            </span>

            <h3>
                {title}
            </h3>

            <p>
                {
                    message ||
                    'An unexpected error occurred. Please try again.'
                }
            </p>


            {
                onRetry && (

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={
                            onRetry
                        }
                    >
                        {retryLabel}
                    </button>
                )
            }

        </section>
    )
}


export default ErrorState