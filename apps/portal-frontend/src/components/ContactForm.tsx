const ContactForm = () => {
	return (
		<div className="w-full">
			<form className="w-full">
				<div className="grid grid-cols-1 gap-0">
					<div>
						<input
							type="text"
							id="firstName"
							name="firstName"
							className="w-full mt-1 py-5 border-b border-content-section-gray bg-home-text focus:outline-none placeholder:text-content-text focus:border-content-text focus:ring-content-text"
							placeholder="First Name"
						/>
					</div>

					<div>
						<input
							type="text"
							id="lastName"
							name="lastName"
							className="w-full mt-1 py-5 border-b border-content-section-gray bg-home-text focus:outline-none placeholder:text-content-text focus:border-content-text focus:ring-content-text"
							placeholder="Last Name"
						/>
					</div>

					<div>
						<input
							type="email"
							id="email"
							name="email"
							className="w-full mt-1 py-5 border-b border-content-section-gray bg-home-text focus:outline-none placeholder:text-content-text focus:border-content-text focus:ring-content-text"
							placeholder="Email Address"
						/>
					</div>

					<div>
						<select
							id="reason"
							name="reason"
							className="w-full mt-1 py-5 border-b border-content-section-gray bg-home-text focus:outline-none placeholder:text-content-text focus:border-content-text focus:ring-content-text"
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
							className="w-full mt-1 py-5 border-b h-[240px] border-content-section-gray bg-home-text focus:outline-none placeholder:text-content-text focus:border-content-text focus:ring-content-text"
							placeholder="Comments"
						></textarea>
					</div>

					<p className="mt-[35px] md:mt-[50px] mb-[25px] md:mb-[36px] text-content-text-muted">
						By submitting this form, Pinner collects your name and
						email address. Please review our{" "}
						<a href="#" className="underline">
							privacy policy
						</a>{" "}
						to learn how we safeguard and manage your data.
					</p>

					<div>
						<button
							type="submit"
							className="mt-1 py-3 md:py-4 px-7 bg-content-section-gray text-content-text font-medium text-[13px] md:text-lg rounded-full"
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
