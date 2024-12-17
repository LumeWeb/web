import Button from "./Button"

const CallToAction = () => {
    return (
        <section className="py-[65px] md:py-[115px] bg-[#051413]">
            <div className="container">
                <h2 className="text-[#F8F8F8] text-[25px] md:text-[35px] font-medium text-center">
                    Want to be a part of the next big thing?
                </h2>

                <div className="mt-7 md:mt-[50px] flex gap-3 justify-center">
                    <Button 
                        label="Learn more about Lume →" 
                        url="#" 
                    />

                    <Button 
                        style="outline"
                        label="Referrals" 
                        url="#"
                    />
                </div>
            </div>
        </section>
    )
}

export default CallToAction