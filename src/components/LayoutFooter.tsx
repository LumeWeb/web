import React from "react"

type Props = {}

const Footer = ({}: Props) => {
return (<div className="w-full mt-5 flex flex-row items-center justify-center text-gray-400">
    <a>About Web3.news</a>
    <div className="h-7 w-[1px] bg-current mx-4" />
    <a className="text-white">Contribute to the cause</a>
</div>)
}

export default Footer