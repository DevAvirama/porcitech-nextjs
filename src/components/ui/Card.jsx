function Card({ as = 'article', className = '', children, ...props }) {
  const sharedClassName = `rounded-[1.75rem] bg-white p-6 shadow-sm shadow-slate-200/70 ${className}`

  if (as === 'header') {
    return (
      <header className={sharedClassName} {...props}>
        {children}
      </header>
    )
  }

  return (
    <article className={sharedClassName} {...props}>
      {children}
    </article>
  )
}

export default Card
