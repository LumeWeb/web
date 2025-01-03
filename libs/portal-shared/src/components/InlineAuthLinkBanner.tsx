import { Link } from '@remix-run/react'
import React from 'react'

interface InlineAuthLinkBanner {
    to: string;
    label: string;
    linkLabel?: string;
}
const InlineAuthLinkBanner: React.FC<InlineAuthLinkBanner> = (
    { to, label, linkLabel }
) => {
    return (
        <p className="text-foreground text-sm w-fit flex items-center  gap-2 text-left bg-secondary p-3 rounded-lg">
            <span className="text-foreground/80 whitespace-nowrap">{label}</span>
            <Link
                to={to}
                className="text-foreground mx-auto whitespace-nowrap hover:underline hover:underline-offset-4">
                {linkLabel || "Login here →"}
            </Link>
        </p>
    )
}

export default InlineAuthLinkBanner;