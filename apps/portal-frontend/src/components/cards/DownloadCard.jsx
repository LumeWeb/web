import React from "react";
export const DownloadProgressCard = ({
  title,
  limit,
  used,
  left,
  onAddMore,
}) => {
  return (
    <div className="bg-[#111C1B] rounded-lg p-[20px] md:p-[40px] flex flex-col shadow-md border border-transparent md:border-[#0D2D2A] w-full lg:w-[549px] lg:h-[216px]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2 flex gap-2 items-center">
              {title === "Network" ? (
                <svg
                  width="24"
                  height="21"
                  viewBox="0 0 24 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M19.4 10C18.7 6.6 15.7 4 12 4C9.1 4 6.6 5.6 5.4 8C2.3 8.4 0 10.9 0 14C0 17.3 2.7 20 6 20H19C21.8 20 24 17.8 24 15C24 12.4 21.9 10.2 19.4 10ZM14 13V17H10V13H7L12 8L17 13H14Z"
                    fill="#ADF0DD"
                  />
                </svg>
              ) : (
                <svg
                  width="21"
                  height="15"
                  viewBox="0 0 21 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2">
                  <g clipPath="url(#clip0_306_845)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.4554 5.625C15.8616 2.4375 13.317 0 10.1786 0C7.71875 0 5.59821 1.5 4.58036 3.75C1.95089 4.125 0 6.46875 0 9.375C0 12.4688 2.29018 15 5.08928 15H16.1161C18.4911 15 20.3571 12.9375 20.3571 10.3125C20.3571 7.875 18.5759 5.8125 16.4554 5.625ZM14.4196 8.4375L10.1786 13.125L5.9375 8.4375H8.48214V4.6875H11.875V8.4375H14.4196Z"
                      fill="#ADF0DD"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_306_845">
                      <rect width="20.3571" height="15" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              )}
              {title}
            </span>
          </h2>
          <p className="text-sm text-gray-400">
            {title === "Network" ? "Network activity" : "Storage activity"}
          </p>
        </div>
        <button className="md:bg-[#0D2D2A] text-[12px] md:text-[14px] text-white rounded px-3 py-1 flex items-center gap-1 hover:bg-teal-600">
          <span>+</span> Add More
        </button>
      </div>
      <div className="mt-6 md:mt-10">
        <div className="w-full bg-gray-600 rounded-full h-2 md:h-4">
          <div
            className="bg-[#ADF0DD] h-2 md:h-4 rounded-full"
            style={{ width: `${(used / limit) * 100}%` }}></div>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{`${used} GB Used`}</span>
          <span>{`${left} GB Left`}</span>
        </div>
      </div>
    </div>
  );
};
