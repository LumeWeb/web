const Root = ({className, children, href}: React.PropsWithChildren & {href:string,className?: string}) => {
    return <a href={href} className={`block relative overflow-hidden w-full ${className}`}>{children}</a>
}

const Background = ({className, children}: React.PropsWithChildren & {className?: string}) => {
    return <div className={`absolute w-full inset-0 z-0 ${className}`}>{children}</div>
}

const Foreground = ({className, children}: React.PropsWithChildren & {className?: string}) => {
    return <div className={`absolute w-full h-full inset-0 z-10 ${className}`}>{children}</div>
}

export {
    Root,
    Background,
    Foreground
}
