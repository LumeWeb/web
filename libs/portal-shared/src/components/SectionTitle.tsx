import React from 'react'

interface SectionTitleProps {
    icon?: React.ReactNode;
    title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = (
    { icon, title }
) => {
    return (
        <div className='flex flex-row items-center justify-start gap-4 mb-8 mt-10'>
            {icon}
            <h2 className="font-bold text-2xl">{title}</h2>
        </div>
    )
}


export default SectionTitle;