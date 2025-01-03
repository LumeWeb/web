import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-[65px] md:py-[115px] bg-[#051413]">
      <div className="xl:container px-6">
        <h2 className="text-[#F8F8F8] text-[25px] md:text-[35px] font-medium text-center">
          Your files, your control
        </h2>

        <p className="text-[#BDC2C1] text-[17px] md:text-[19px] text-center mt-4">
          Get started with decentralized storage today
        </p>

        <div className="mt-7 md:mt-[50px] flex gap-3 justify-center">
          <Button label="Start Storing →" url="https://account.pinner.xyz" />
          <Button
            style="outline"
            label="Read the Docs"
            url="https://docs.lumeweb.com"
          />
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
