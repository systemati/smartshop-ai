function PageHeader({ badge, title, description }) {
    return (
        <div className="page-header smart-page-header">
            {badge && <span className="smartshop-badge">{badge}</span>}
            <h1>{title}</h1>
            {description && <p>{description}</p>}
        </div>
    )
}

export default PageHeader
