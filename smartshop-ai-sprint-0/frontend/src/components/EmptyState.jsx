function EmptyState({
    icon = '♡',
    eyebrow = 'NOTHING HERE YET',
    title,
    description,
    actionLabel,
    onAction,
    secondaryLabel,
    onSecondaryAction
}) {

    return (

        <section className="smart-empty-state">

            <div className="smart-empty-icon">
                {icon}
            </div>

            <span className="smart-empty-eyebrow">
                {eyebrow}
            </span>

            <h3>
                {title}
            </h3>

            <p>
                {description}
            </p>


            {
                (
                    actionLabel ||
                    secondaryLabel
                ) && (

                    <div className="smart-empty-actions">

                        {
                            actionLabel && (

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={
                                        onAction
                                    }
                                >
                                    {actionLabel}
                                </button>
                            )
                        }


                        {
                            secondaryLabel && (

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={
                                        onSecondaryAction
                                    }
                                >
                                    {secondaryLabel}
                                </button>
                            )
                        }

                    </div>
                )
            }

        </section>
    )
}


export default EmptyState