function LoadingState({
    title = 'Loading',
    description = 'Please wait while we get everything ready.',
    cards = 3
}) {

    return (

        <section
            className="smart-loading-state"
            aria-live="polite"
            aria-busy="true"
        >

            <div className="smart-loading-heading">

                <div className="smart-loading-mark">
                    ✦
                </div>

                <div>

                    <h3>
                        {title}
                    </h3>

                    <p>
                        {description}
                    </p>

                </div>

            </div>


            <div className="row g-4">

                {
                    Array.from(
                        {
                            length: cards
                        }
                    ).map(
                        (
                            _,
                            index
                        ) => (

                            <div
                                className="col-md-6 col-xl-4"
                                key={index}
                            >

                                <div className="smart-skeleton-card">

                                    <div className="smart-skeleton-image" />

                                    <div className="smart-skeleton-content">

                                        <div className="smart-skeleton-line smart-skeleton-small" />

                                        <div className="smart-skeleton-line smart-skeleton-heading" />

                                        <div className="smart-skeleton-line" />

                                        <div className="smart-skeleton-line smart-skeleton-medium" />

                                        <div className="smart-skeleton-price" />

                                        <div className="smart-skeleton-button" />

                                    </div>

                                </div>

                            </div>
                        )
                    )
                }

            </div>

        </section>
    )
}


export default LoadingState