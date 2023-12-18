import { ArrowLeftIcon } from "@heroicons/react/24/outline";
// page https://www.businessinsider.com/web3-music-platforms-blockchain-even-sound-iyk-streaming-services-artists-2023-9#:~:text=Web3%20music%20platforms%20are%20combining,and%20'create%20dope%20consumer%20experiences'&text=Web3%20music%20platforms%20are%20changing,and%20ways%20to%20reach%20fans.
import React from "react";
import { Link } from "@remix-run/react";

const Page = () => {
  // TODO: Explore based on the slug, we can also change the slug to be like the id or something the backend understands
  // We can also pre-render the article from the backend
  return (
    <>
      <Link to="/" className="w-full mt-1">
        <button className="px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded">
          <ArrowLeftIcon className="w-4 h-4 inline mr-2 -mt-1" />
          Go Back Home
        </button>
      </Link>
      <div className="w-full min-h-[calc(100%-80px)] !h-full !mt-1 !mb-0">
        <iframe
          className="w-full h-full"
          src="https://www.businessinsider.com/web3-music-platforms-blockchain-even-sound-iyk-streaming-services-artists-2023-9#:~:text=Web3%20music%20platforms%20are%20combining,and%20'create%20dope%20consumer%20experiences'&text=Web3%20music%20platforms%20are%20changing,and%20ways%20to%20reach%20fans"
        ></iframe>
      </div>
    </>
  );
};

export default Page;
