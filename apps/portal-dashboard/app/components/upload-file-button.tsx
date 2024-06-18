import React from 'react'
import { CloudUploadIcon } from './icons'
import { Button } from './ui/button'

export const UploadFileButton = () => {
    return (
        <Button size={"lg"} className="w-full text-base font-semibold bg-[#FFE478] hover:bg-current/60 text-gray-800 mt-10 lg:mt-4">
            <CloudUploadIcon className="mr-1" />
            Upload
        </Button>
    )
}
