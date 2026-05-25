import { Progress } from "../ui/progress";

const StorageCard = () => {
	return (
		<div className="bg-[#0D2D2A] py-[45px] px-[45px] max-w-[640px] mx-auto rounded-xl">
			<div className="flex justify-between items-center mb-11">
				<div>
					<div className="flex items-center space-x-2 mb-1.5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="28"
							height="28"
							viewBox="0 0 28 28"
							fill="none"
						>
							<path
								d="M23.7387 16.4878C23.7354 16.4878 23.7305 16.4894 23.7272 16.4894C24.0097 15.1579 23.9535 13.7042 23.2382 12.1579C22.2255 9.96909 20.1523 8.33365 17.7619 8.02968C14.4382 7.60678 11.4993 9.50159 10.3281 12.3182C9.93325 12.1662 9.50374 12.082 9.05441 12.082C7.02744 12.082 5.38373 13.7257 5.38373 15.7526C5.38373 16.0434 5.42503 16.3209 5.48946 16.5918C4.60896 16.3853 3.64421 16.4085 2.47462 17.3534C1.60569 18.0571 0.966374 19.0813 0.977938 20.1997C1.00107 22.2085 2.63486 23.8291 4.64861 23.8291H23.562C25.2784 23.8291 26.8973 22.7371 27.2987 21.0687C27.8819 18.6469 26.0631 16.4878 23.7387 16.4878Z"
								fill="#ADF0DD"
							/>
						</svg>
						<p className="text-[#ADF0DD] text-[21px] font-semibold mb-0">
							Storage
						</p>
					</div>
					<p className="text-[#75AC9E] text-[14px] font-['Inter'] font-medium tracking-[0.28px]">
						Monthly storage limit is 130 GB
					</p>
				</div>

				<a
					href="#"
					className="bg-[#051413] text-[#ADF0DD] inline-flex text-[14px] py-[13px] px-[17px] font-['Inter'] font-medium tracking-[0.28px] rounded-sm items-center gap-2"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 18 18"
						fill="none"
					>
						<g clip-path="url(#clip0_306_836)">
							<path
								d="M9 1.5C4.85625 1.5 1.5 4.85625 1.5 9C1.5 13.1438 4.85625 16.5 9 16.5C13.1438 16.5 16.5 13.1438 16.5 9C16.5 4.85625 13.1438 1.5 9 1.5ZM12.75 9.75H9.75V12.75H8.25V9.75H5.25V8.25H8.25V5.25H9.75V8.25H12.75V9.75Z"
								fill="#ADF0DD"
							/>
						</g>
						<defs>
							<clipPath id="clip0_306_836">
								<rect width="18" height="18" fill="white" />
							</clipPath>
						</defs>
					</svg>
					Add More
				</a>
			</div>

			<div>
				<Progress value={85} />
				<div className="flex justify-between text-[#75AC9E] text-[14px] font-['Inter'] font-medium tracking-[0.28px] mt-5">
					<p>120 GB Used</p>
					<p>10 GB Left</p>
				</div>
			</div>
		</div>
	);
};

export default StorageCard;
