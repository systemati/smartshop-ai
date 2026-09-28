import {
    useEffect
} from 'react'


function Toast({
    message,
    type = 'success',
    onClose,
    duration = 3500
}) {

    useEffect(() => {

        if (!message) {
            return
        }

        const timer =
            setTimeout(
                () => {

                    if (onClose) {
                        onClose()
                    }

                },
                duration
            )

        return () =>
            clearTimeout(timer)

    }, [
        message,
        duration,
        onClose
    ])


    if (!message) {
        return null
    }


    const isSuccess =
        type === 'success'


    return (

        <div
            className={
                `smart-toast smart-toast-${type}`
            }
            role={
                isSuccess
                    ? 'status'
                    : 'alert'
            }
            aria-live={
                isSuccess
                    ? 'polite'
                    : 'assertive'
            }
        >

            <div className="smart-toast-icon">

                {
                    isSuccess
                        ? '✓'
                        : '!'
                }

            </div>


            <div className="smart-toast-content">

                <strong>

                    {
                        isSuccess
                            ? 'Success'
                            : 'Something went wrong'
                    }

                </strong>

                <span>
                    {message}
                </span>

            </div>


            <button
                type="button"
                className="smart-toast-close"
                aria-label="Close notification"
                onClick={
                    onClose
                }
            >
                ×
            </button>

        </div>
    )
}


export default Toast