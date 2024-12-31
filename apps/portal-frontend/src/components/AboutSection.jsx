import { Button } from "@/components/ui/button";

const AboutSection = ({
  subtitle,
  title,
  description,
  buttonText,
  url,
  imageUrl,
  imgageMobileUrl,
  theme,
  imagePosition,
  id,
}) => {
  return (
    <section
      id={id}
      className={`py-[60px] md:py-[120px] ${
        theme == "gray" ? "bg-[#E4E0D4]" : "bg-white"
      }`}>
      <div className="xl:container px-6">
        <div className="flex md:gap-10 flex-wrap md:flex-nowrap md:items-center md:justify-between">
          <div
            className={`w-full md:w-auto basis-auto 2xl:basis-[40%] ${
              imagePosition == "right" ? "order-2" : "order-2 md:order-1"
            }`}>
            {imageUrl && (
              <div className="hidden md:block">
                <img src={imageUrl.src} alt="about image" className="w-full" />
              </div>
            )}

            {imgageMobileUrl && (
              <div
                className={`md:hidden p-[10%] rounded-tl-[50px] rounded-br-[50px] ${
                  theme == "gray" ? "bg-white" : "bg-[#E4E0D4]"
                }`}>
                <img
                  src={imgageMobileUrl.src}
                  alt="about image"
                  className="mix-blend-multiply w-full"
                />
              </div>
            )}
          </div>

          <div
            className={`mb-[44px] md:mb-[50px] lg:mb-0 flex-2 ${
              imagePosition == "right" ? "order-1" : "order-1 md:order-2"
            }`}>
            <div className="text-left max-w-[670px]">
              {subtitle && (
                <h3 className="text-[#485453] lg:text-[21px] md:text-base hidden md:block font-medium lg:mb-6 md:mb-2">
                  {subtitle}
                </h3>
              )}

              {title && (
                <h2 className="text-[25px] lg:text-[40px] md:text-[32px] font-medium mb-4 lg:mb-[26px] text-[#0D1D1C] leading-tight">
                  {title}
                </h2>
              )}

              {description && (
                <p className="text-[#485453] text-[13px] md:text-base lg:text-lg !leading-[21px] lg:!leading-[35px] md:!leading-[26px] lg:text-xl mb-6 lg:mb-[26px] max-w-[600px]">
                  {description}
                </p>
              )}

              {buttonText && (
                <>
                  <div className="hidden md:block">
                    <Button
                      label={buttonText}
                      url={url}
                      style={theme == "gray" ? "light" : "gray"}
                    />
                  </div>

                  <div className="md:hidden">
                    <Button label={buttonText} url={url} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutSection;
