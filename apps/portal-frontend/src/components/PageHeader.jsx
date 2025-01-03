import { Button } from "@/components/ui/button";
import BgShape from "../assets/hero-shape.svg";

const PageHeader = ({
  title,
  mobileTitle,
  description,
  btnText,
  url,
  secondaryBtnText,
  secondaryUrl,
}) => {
  return (
    <div className="pt-[155px] md:pt-[230px] pb-[60px] md:pb-[120px] relative overflow-hidden">
      <div className="xl:container px-6">
        <img
          src={BgShape.src}
          alt="hero bg shape"
          className="absolute left-0 top-0 max-w-max"
        />
        <div className="text-left md:text-center md:max-w-[810px] mx-auto relative z-10">
          <h1 className="text-[60px] text-[#F8F8F8] leading-[60px] font-medium hidden md:block">
            {title}
          </h1>

          <h1 className="text-[38px] text-[#F8F8F8] leading-[48px] font-medium md:hidden">
            {mobileTitle}
          </h1>

          {description && (
            <div className="mt-10">
              <p className="text-[#F8F8F8] text-[20px] md:text-[25px]">
                {description}
              </p>
            </div>
          )}

          {/* Explicit Button Rendering Logic */}
          {(btnText || secondaryBtnText) && (
            <div className="flex md:justify-center gap-6 mt-8">
              {btnText && (
                <Button label={btnText} url={url} style="btn-light" />
              )}
              {secondaryBtnText && (
                <Button
                  label={secondaryBtnText}
                  url={secondaryUrl}
                  style="outline"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
