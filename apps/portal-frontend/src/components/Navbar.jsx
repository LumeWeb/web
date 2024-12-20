import Logo from "../assets/site-logo.png";
import { Button } from "./ui/button";
import { useState } from "react";
import FooterLogo from "../assets/footer-logo-light.png";
const Nav = () => {
	// Correct destructuring of useState
	const [toggleMenu, setToggleMenu] = useState(false);

	const handleToggleMenu = () => {
		setToggleMenu(!toggleMenu); // Toggle the menu state

		// Disable scrolling when the menu is open
		if (!toggleMenu) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	};

	return (
		<>
			<header className="pt-[58px] pb-[18px] md:py-10 absolute w-full top-0 left-0 z-40">
				<div className="container">
					<div className="flex gap-[30px] justify-between items-center">
						<div className="flex items-center xl:gap-[30px] 2xl:gap-[100px]">
							<div className="relative z-40 min-w-24">
								<a href="/">
									<img src={Logo.src} alt="site logo" />
								</a>
							</div>
							<nav
								className={`${
									toggleMenu
										? "flex justify-between flex-col pb-10 visible transition-all duration-300 ease-in-out"
										: "opacity-0 lg:opacity-100 visible-hidden lg:visible transition-all duration-300 ease-in-out"
								} fixed w-full top-0 pt-[130px] lg:pt-0 lg:block left-0 bg-[#0D1D1C]  lg:static lg:bg-transparent md:px-0 h-screen lg:h-auto`}
							>
								<ul className="flex flex-col py-5 lg:flex-row lg:py-0 space-x-0 lg:space-x-8 container">
									<li>
										<a
											href="/"
											className="text-[#F8F8F8] leading-[50px] border-b border-[#485453] lg:border-0 block lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300 hover:text-gray-300"
										>
											Home
										</a>
									</li>
									<li>
										<a
											href="/about"
											className="text-[#F8F8F8] leading-[50px] border-b border-[#485453] lg:border-0 block lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300 hover:text-gray-300"
										>
											About
										</a>
									</li>
									<li>
										<a
											href="/pricing"
											className="text-[#F8F8F8] leading-[50px] border-b border-[#485453] lg:border-0 block lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300 hover:text-gray-300"
										>
											Pricing
										</a>
									</li>
									<li>
										<a
											href="/docs"
											className="text-[#F8F8F8] leading-[50px] border-b border-[#485453] lg:border-0 block lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300 hover:text-gray-300"
										>
											Docs
										</a>
									</li>
									<li>
										<a
											href="/contact"
											className="text-[#F8F8F8] leading-[50px] border-b border-[#485453] lg:border-0 block lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300 hover:text-gray-300"
										>
											Contact
										</a>
									</li>

									<li>
										<a
											href="/sia"
											className="text-[#F8F8F8] leading-[50px] border-b border-[#485453] lg:border-0 block lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300 hover:text-gray-300"
										>
											❤️ SIA
										</a>
									</li>
								</ul>

								<div className="lg:hidden container">
									<div className="flex gap-8">
										<img
											src={FooterLogo.src}
											alt="footer logo"
										/>

										<ul className="flex gap-11">
											<li>
												<a
													href="#"
													className="text-[#F8F8F8] text-base leading-[34px] transition ease-in-out duration-300 flex items-center gap-2 hover:text-white"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
													>
														<path
															d="M18.1031 2.625C18.3482 2.62302 18.5912 2.66949 18.8182 2.76172C19.0453 2.85396 19.2518 2.99015 19.4261 3.16247C19.6003 3.33479 19.7388 3.53983 19.8335 3.76583C19.9282 3.99183 19.9774 4.23432 19.9781 4.47938V20.625L18.0187 18.915L16.9106 17.9062L15.75 16.8356L16.2338 18.5006H5.89688C5.65183 18.5026 5.40881 18.4561 5.18178 18.3639C4.95474 18.2717 4.74818 18.1355 4.57394 17.9632C4.39971 17.7908 4.26124 17.5858 4.1665 17.3598C4.07176 17.1338 4.02261 16.8913 4.02188 16.6462V4.47938C4.02261 4.23432 4.07176 3.99183 4.1665 3.76583C4.26124 3.53983 4.39971 3.33479 4.57394 3.16247C4.74818 2.99015 4.95474 2.85396 5.18178 2.76172C5.40881 2.66949 5.65183 2.62302 5.89688 2.625H18.1031ZM18.1031 1.40625H5.89688C5.08064 1.40575 4.29753 1.72901 3.71932 2.30511C3.1411 2.88122 2.81498 3.66315 2.8125 4.47938V16.6481C2.81498 17.4647 3.14136 18.2469 3.71998 18.823C4.2986 19.3992 5.08219 19.7222 5.89875 19.7212H17.0869L17.19 19.8169L17.2013 19.8262H17.2125L19.1719 21.5362L21.1875 23.3062V4.47938C21.185 3.66315 20.8589 2.88122 20.2807 2.30511C19.7025 1.72901 18.9194 1.40575 18.1031 1.40625Z"
															fill="#F8F8F8"
														/>
														<path
															d="M13.9314 13.7081C14.2051 14.0512 14.5332 14.4374 14.5332 14.4374C16.547 14.3737 17.3214 13.0687 17.3214 13.0687C17.2914 11.2413 16.8423 9.4452 16.0089 7.81869C15.2718 7.25161 14.3785 6.92438 13.4495 6.88119L13.322 7.02557C14.8707 7.49432 15.5907 8.16932 15.5907 8.16932C14.7413 7.70716 13.8104 7.41364 12.8495 7.30494C12.2378 7.23864 11.6204 7.24493 11.0101 7.32369C10.9578 7.32544 10.9057 7.33171 10.8545 7.34244C10.142 7.42177 9.44614 7.61154 8.79199 7.90494C8.44699 8.06244 8.25012 8.16557 8.25012 8.16557C8.25012 8.16557 9.00012 7.45494 10.6464 6.98619L10.5545 6.87744C9.62552 6.92063 8.73218 7.24786 7.99512 7.81494C7.16164 9.44145 6.71261 11.2376 6.68262 13.0649C6.68262 13.0649 7.44762 14.3774 9.46137 14.4337C9.46137 14.4337 9.79887 14.0287 10.0726 13.6837C8.91574 13.3424 8.47887 12.6224 8.47887 12.6224C8.47887 12.6224 8.57074 12.6862 8.73387 12.7762C8.7441 12.787 8.75616 12.7959 8.76949 12.8024C8.79762 12.8212 8.82387 12.8287 8.85199 12.8474C9.06665 12.9643 9.28905 13.0665 9.51762 13.1531C9.95131 13.3219 10.3994 13.4512 10.8564 13.5393C11.636 13.6841 12.4355 13.6841 13.2151 13.5393C13.6658 13.4606 14.1061 13.331 14.5276 13.1531C14.8958 13.0161 15.2474 12.8381 15.5757 12.6224C15.5757 12.6224 15.1257 13.3762 13.9314 13.7081ZM10.5564 12.4537C10.0501 12.4537 9.63387 11.9906 9.63387 11.4243C9.6183 11.2941 9.63051 11.162 9.66971 11.0368C9.70891 10.9116 9.77421 10.7962 9.86129 10.698C9.94837 10.5999 10.0553 10.5214 10.1749 10.4676C10.2946 10.4138 10.4242 10.386 10.5554 10.386C10.6866 10.386 10.8163 10.4138 10.936 10.4676C11.0556 10.5214 11.1625 10.5999 11.2496 10.698C11.3367 10.7962 11.4019 10.9116 11.4411 11.0368C11.4803 11.162 11.4926 11.2941 11.477 11.4243C11.4843 11.5528 11.4662 11.6815 11.4237 11.8029C11.3811 11.9244 11.315 12.0362 11.2291 12.1321C11.1432 12.2279 11.0392 12.3058 10.9232 12.3613C10.8071 12.4168 10.6811 12.4489 10.5526 12.4556L10.5564 12.4537ZM13.8545 12.4537C13.3464 12.4556 12.9376 11.9999 12.9376 11.4262C12.9572 11.248 13.0279 11.0793 13.1413 10.9405C13.2546 10.8016 13.4058 10.6986 13.5765 10.6438C13.7471 10.589 13.93 10.5847 14.103 10.6316C14.276 10.6785 14.4318 10.7745 14.5514 10.908C14.671 11.0415 14.7494 11.2068 14.7772 11.3839C14.8049 11.561 14.7807 11.7423 14.7076 11.906C14.6345 12.0696 14.5156 12.2086 14.3652 12.3062C14.2148 12.4037 14.0394 12.4556 13.8601 12.4556L13.8545 12.4537Z"
															fill="#F8F8F8"
														/>
													</svg>
													lumeweb
												</a>
											</li>

											<li>
												<a
													href="#"
													className="text-[#F8F8F8] text-base leading-[34px] transition ease-in-out duration-300 flex items-center gap-2 hover:text-white"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
													>
														<path
															d="M16.3011 5.74875C16.7938 5.75552 17.2802 5.86143 17.7312 6.06019C18.1822 6.25895 18.5886 6.54647 18.9261 6.90563C18.9261 6.90563 20.3586 6.62438 21.1498 6.0675C21.1498 6.0675 20.9511 7.17 19.6329 8.01375H19.6442C19.7454 8.01375 20.4842 7.995 21.6467 7.45125C21.6467 7.45125 21.4236 8.08688 19.9029 9.29625C19.9948 12.1575 18.5792 17.4469 13.3404 19.3294C12.1899 19.7503 10.9749 19.9679 9.7498 19.9725C7.787 19.9815 5.8644 19.4164 4.21855 18.3469C4.4998 18.375 4.75293 18.375 5.00605 18.375C8.10355 18.375 9.60355 16.785 9.52105 16.785H9.40668C6.78168 16.785 6.1423 14.2725 6.1423 14.2725C6.35254 14.3996 6.59646 14.4598 6.84168 14.445C7.15864 14.4384 7.47356 14.3924 7.77918 14.3081C4.81668 13.6069 4.9273 10.7644 4.9273 10.7644C5.32765 11.0316 5.79609 11.1786 6.2773 11.1881C6.35646 11.189 6.43553 11.1827 6.51355 11.1694C3.80793 9.02813 5.4373 6.4725 5.4373 6.4725C8.48605 10.0106 12.2342 10.1363 12.7498 10.1363H12.8117C12.5342 8.475 13.2186 6.87938 15.0617 6.01125C15.4462 5.83468 15.8649 5.74506 16.2879 5.74875M22.8748 3.375L20.4504 5.0775C20.0801 5.29945 19.6798 5.4668 19.2617 5.57438C18.4131 4.91177 17.3701 4.54675 16.2936 4.53563C15.6917 4.53006 15.0961 4.65814 14.5498 4.91063C12.8286 5.71875 11.7823 7.11375 11.5742 8.78813C9.53647 8.36786 7.70041 7.27177 6.36355 5.6775L5.2948 4.43813L4.41355 5.8125C3.84543 6.74839 3.62008 7.85258 3.77605 8.93625L3.70668 10.7231C3.69111 11.8574 4.068 12.9623 4.77355 13.8506L4.96105 14.5819C5.22998 15.5262 5.77602 16.3681 6.52855 16.9988C6.02789 17.1083 5.51668 17.1624 5.00418 17.16C4.78105 17.16 4.55043 17.1506 4.31793 17.1319L0.0185547 16.7738L3.49668 19.3294C5.35279 20.5506 7.528 21.197 9.7498 21.1875C11.1172 21.1838 12.4736 20.9427 13.7586 20.475C16.3362 19.5551 18.4633 17.6823 19.7023 15.2419C20.5593 13.5754 21.0437 11.7424 21.1217 9.87C22.3648 8.79938 22.7061 8.11688 22.7979 7.85625L23.7579 5.12438L22.4454 5.73563L22.8748 3.375Z"
															fill="#F8F8F8"
														/>
													</svg>
													@lume
												</a>
											</li>
										</ul>
									</div>

									<a
										href="mailto:hello@lumeweb.com"
										className="basis-full flex-1 md:inline-block underline mb-4  text-[#F8F8F8] text-base leading-[34px] transition ease-in-out duration-300 hover:text-white order-2 md:order-1"
									>
										hello@lumeweb.com
									</a>
								</div>
							</nav>
						</div>

						<div className="flex items-center space-x-5 hidden lg:block">
							<a
								href="#"
								className="text-[#F8F8F8] font-medium text-lg transition ease-in-out duration-300 hover:text-gray-300"
							>
								Sign In
							</a>
							<Button label="Get 1TB for free → " url="#" />
						</div>

						<div className="lg:hidden flex items-center space-x-4 relative z-40">
							<Button label="Sign In → " size="sm" url="#" />
							<div
								className="relative cursor-pointer" // Added cursor for better UX
								onClick={handleToggleMenu}
							>
								<span className="block w-6 h-0.5 bg-white my-1.5"></span>
								<span className="block w-6 h-0.5 bg-white my-1.5"></span>
								<span className="block w-6 h-0.5 bg-white my-1.5"></span>
							</div>
						</div>
					</div>
				</div>
			</header>
		</>
	);
};

export default Nav;
