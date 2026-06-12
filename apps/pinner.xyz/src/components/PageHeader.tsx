import { TrackedButton } from "@/components/TrackedButton";
import BgShape from "@/assets/hero-shape.svg";

interface PageHeaderProps {
	title?: string;
	mobileTitle?: string;
	description?: string;
	btnText?: string;
	url?: string;
	secondaryBtnText?: string;
	secondaryUrl?: string;
	intent?: string;
}

const PageHeader = ({
  title,
  mobileTitle,
  description,
  btnText,
  url,
  secondaryBtnText,
  secondaryUrl,
  intent = "pinning",
}: PageHeaderProps) => {
  return (
    <div className="pt-[155px] md:pt-[230px] pb-[60px] md:pb-[120px] relative overflow-hidden">
      <div className="xl:container px-6">
        <img
          src={BgShape.src}
          alt="hero bg shape"
          className="absolute left-0 top-0 max-w-max"
        />
        <div className="text-left md:text-center md:max-w-[810px] mx-auto relative z-10">
          <h1 className="text-[38px] md:text-[60px] text-home-text leading-[48px] md:leading-[60px] font-medium">
            {title}
          </h1>

          {description && (
            <div className="mt-10">
              <p className="text-home-text text-[20px] md:text-[25px]" dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          )}

          {/* Explicit Button Rendering Logic */}
          {(btnText || secondaryBtnText) && (
            <div className="flex md:justify-center gap-6 mt-8">
              {btnText && (
                <TrackedButton
                  label={btnText}
                  url={url || "#"}
                  buttonStyle="btn-light"
                  trackEvent="hero_cta_clicked"
                  trackProperties={{ intent, label: btnText }}
                />
              )}
              {secondaryBtnText && (
                <TrackedButton
                  label={secondaryBtnText}
                  url={secondaryUrl || "#"}
                  buttonStyle="outline"
                  trackEvent="hero_secondary_clicked"
                  trackProperties={{ intent, label: secondaryBtnText }}
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
