import React from "react";

export const SecurityCard = ({ title, star, description, buttonStyle, buttonText, background }) => {
  return (
    <div
      className={`${background ? background : "bg-[#111C1B]"} text-teal-100 rounded-lg p-6 md:p-10 shadow-md flex flex-col justify-between space-y-4 lg:w-[400px]`}>
      {/* Icon and Title */}
      <div>
        <div className="mb-3 flex gap-3">
          <svg
            width="25"
            height="26"
            viewBox="0 0 25 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_306_3708)">
              <path
                d="M12.5792 1.67236C15.0501 1.67236 17.4198 2.65392 19.1669 4.4011C20.9141 6.14828 21.8957 8.51796 21.8957 10.9888V15.1295C21.8967 16.6216 21.539 18.0922 20.8526 19.4171C20.1662 20.7419 19.1712 21.8823 17.9517 22.7421C18.4424 21.1666 18.7281 19.501 18.7819 17.7764L18.7902 17.1998V15.1285H16.7199V17.1998L16.7167 17.5259C16.6756 19.7834 16.1715 22.0083 15.2354 24.063C14.0363 24.4173 12.7783 24.5278 11.5357 24.388C12.8176 22.3641 13.5329 20.0333 13.6071 17.6387L13.6144 17.1998V9.95368H11.544V17.1998L11.5399 17.498C11.4837 19.7957 10.7302 22.0221 9.3795 23.8818C8.39183 23.5204 7.47267 22.9939 6.66115 22.3249C7.74274 20.9573 8.36251 19.2817 8.43128 17.5394L8.43853 17.1998V10.9888L8.44371 10.7818C8.47218 10.1954 8.62571 9.62188 8.894 9.09967L9.01201 8.88539L7.5162 7.38958C6.82808 8.35472 6.43208 9.49743 6.37545 10.6814L6.3682 10.9888V17.1998L6.36406 17.4328C6.32026 18.6519 5.91649 19.8308 5.20364 20.8208C3.94244 19.192 3.25954 17.1896 3.26271 15.1295V10.9888C3.26271 8.51796 4.24426 6.14828 5.99144 4.4011C7.73862 2.65392 10.1083 1.67236 12.5792 1.67236ZM12.5792 4.77786C11.3411 4.77786 10.188 5.14017 9.21905 5.76437L8.98096 5.92586L10.4757 7.42167C11.0386 7.08867 11.6727 6.89457 12.3256 6.85543L12.5792 6.84819L12.7862 6.85336C13.8105 6.90456 14.7793 7.33405 15.5051 8.05866C16.2308 8.78326 16.6619 9.75141 16.7147 10.7756L16.7199 10.9888V13.0592H18.7902V10.9888C18.7902 9.34159 18.1358 7.7618 16.971 6.59702C15.8062 5.43223 14.2264 4.77786 12.5792 4.77786Z"
                fill="#ADF0DD"
              />
            </g>
            <defs>
              <clipPath id="clip0_306_3708">
                <rect
                  width="24.844"
                  height="24.844"
                  fill="white"
                  transform="translate(0.157532 0.637207)"
                />
              </clipPath>
            </defs>
          </svg>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-gray-400 mt-4">{description}</p>
        )}
        {star === "true" && (
          <div className="my-6">
            <svg
              width="118"
              height="8"
              viewBox="0 0 118 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="4.22313"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
              <circle
                cx="19.7884"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
              <circle
                cx="35.3532"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
              <circle
                cx="50.918"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
              <circle
                cx="66.4828"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
              <circle
                cx="82.0476"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
              <circle
                cx="97.6124"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
              <circle
                cx="113.178"
                cy="4.10118"
                r="3.89122"
                fill="#ADF0DD"
                fill-opacity="0.65"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div
        className={`${buttonStyle} md:bg-[#0D2D2A] hover:bg-teal-900 text-sm px-4 py-2 rounded-lg text-white flex items-center justify-center space-x-2`}>
        <svg
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_306_3650)">
            <path
              d="M8.99683 1.62207C4.85308 1.62207 1.49683 4.97832 1.49683 9.12207C1.49683 13.2658 4.85308 16.6221 8.99683 16.6221C13.1406 16.6221 16.4968 13.2658 16.4968 9.12207C16.4968 4.97832 13.1406 1.62207 8.99683 1.62207ZM12.7468 9.87207H9.74683V12.8721H8.24683V9.87207H5.24683V8.37207H8.24683V5.37207H9.74683V8.37207H12.7468V9.87207Z"
              fill="#ADF0DD"
            />
          </g>
          <defs>
            <clipPath id="clip0_306_3650">
              <rect
                width="18"
                height="18"
                fill="white"
                transform="translate(-0.00317383 0.12207)"
              />
            </clipPath>
          </defs>
        </svg>
        <span>{buttonText}</span>
      </div>
    </div>
  );
};
