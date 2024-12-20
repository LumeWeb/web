import { motion } from "motion/react";

const ContactForm = () => {
	return (
		<div className="w-full">
			<form class="w-full">
				<div class="grid grid-cols-1 gap-0">
					<div>
						<input
							type="text"
							id="name"
							name="name"
							class="w-full mt-1 py-5 border-b border-[#E4E0D4] bg-[#F8F8F8] focus:outline-none placeholder:text-[#0D1D1C] focus:border-[#0D1D1C] focus:ring-[#0D1D1C]"
							placeholder="First Name"
						/>
					</div>

					<div>
						<input
							type="text"
							id="name"
							name="name"
							class="w-full mt-1 py-5 border-b border-[#E4E0D4] bg-[#F8F8F8] focus:outline-none placeholder:text-[#0D1D1C] focus:border-[#0D1D1C] focus:ring-[#0D1D1C]"
							placeholder="Last Name"
						/>
					</div>

					<div>
						<input
							type="email"
							id="name"
							name="name"
							class="w-full mt-1 py-5 border-b border-[#E4E0D4] bg-[#F8F8F8] focus:outline-none placeholder:text-[#0D1D1C] focus:border-[#0D1D1C] focus:ring-[#0D1D1C]"
							placeholder="Email Address"
						/>
					</div>

					<div>
						<select
							id="reason"
							name="reason"
							class="w-full mt-1 py-5 border-b border-[#E4E0D4] bg-[#F8F8F8] focus:outline-none placeholder:text-[#0D1D1C] focus:border-[#0D1D1C] focus:ring-[#0D1D1C]"
						>
							<option value="support">Reason</option>
							<option value="support">Support</option>
							<option value="inquiry">Inquiry</option>
							<option value="feedback">Feedback</option>
						</select>
					</div>

					<div>
						<textarea
							id="comments"
							name="comments"
							class="w-full mt-1 py-5 border-b h-[240px] border-[#E4E0D4] bg-[#F8F8F8] focus:outline-none placeholder:text-[#0D1D1C] focus:border-[#0D1D1C] focus:ring-[#0D1D1C]"
							placeholder="Comments"
						></textarea>
					</div>

					<p class="mt-[35px] md:mt-[50px] mb-[25px] md:mb-[36px] text-[#485453]">
						By submitting this form, Lume collects your name and
						email address. Please review our{" "}
						<a href="#" class="underline">
							privacy policy
						</a>{" "}
						to learn how we safeguard and manage your data.
					</p>

					<div>
						<button
							type="submit"
							class="mt-1 py-3 md:py-4 px-7 bg-[#E4E0D4] text-[#0D1D1C] font-medium text-[13px] md:text-lg rounded-full"
						>
							Submit →
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default ContactForm;
