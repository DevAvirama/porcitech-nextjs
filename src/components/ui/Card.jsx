function Card({ as = 'article', className = '', children, ...props }) {
  const sharedClassName = `rounded-[1.75rem] bg-white p-6 shadow-sm shadow-slate-200/70 ${className}`
  const Component = as;

  return (
    <Component className={sharedClassName} {...props}>
      {children}
    </Component>
  )
}

export default Card
