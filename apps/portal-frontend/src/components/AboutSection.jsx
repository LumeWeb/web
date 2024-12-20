import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

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
}) => {
  return (
    <section
      className={`py-[60px] md:py-[120px] ${
        theme == "gray" ? "bg-[#E4E0D4]" : "bg-white"
      }`}>
      <div className="container">
        <div className="flex md:gap-10 flex-wrap md:flex-nowrap md:items-center md:justify-between">
          <div
            className={`w-full md:w-auto basis-auto 2xl:basis-[40%] ${
              imagePosition == "right" ? "order-2" : "order-2 md:order-1"
            }`}>
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="hidden md:block">
                <img src={imageUrl.src} alt="hero image" className="w-full " />
              </motion.div>
            )}

            {imgageMobileUrl && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.5,
                  ease: "easeOut",
                }}
                className={`md:hidden p-[10%] rounded-tl-[50px] rounded-br-[50px] ${
                  theme == "gray" ? "bg-white" : "bg-[#E4E0D4]"
                }`}>
                <img
                  src={imgageMobileUrl.src}
                  alt="hero image"
                  className="mix-blend-multiply w-full"
                />
              </motion.div>
            )}
          </div>

          <div
            className={`mb-[44px] md:mb-[50px]  lg:mb-0  flex-2 ${
              imagePosition == "right" ? "order-1" : "order-1 md:order-2"
            }`}>
            <div className="text-left max-w-[670px]">
              {subtitle && (
                <motion.h3
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="text-[#485453] lg:text-[21px] md:text-base hidden md:block font-medium lg:mb-6 md:mb-2">
                  {subtitle}
                </motion.h3>
              )}

              {title && (
                <motion.h2
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2,
                    ease: "easeOut",
                  }}
                  className="text-[25px] lg:text-[40px] md:text-[32px] font-medium mb-4 lg:mb-[26px] text-[#0D1D1C] leading-tight">
                  Re-defining Web3, for the users
                </motion.h2>
              )}

              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3,
                    ease: "easeOut",
                  }}
                  className="text-[#485453] text-[13px] md:text-base lg:text-lg !leading-[21px] lg:!leading-[35px] md:!leading-[26px] lg:text-xl mb-6 lg:mb-[26px] max-w-[600px]">
                  Back in 2007, making work better for people meant designing a
                  simpler way to keep files in sync. Today, it means designing
                  products that reduce busywork so you can focus on the work
                  that matters.
                </motion.p>
              )}

              {buttonText && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{
                      once: true,
                      margin: "-100px",
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.4,
                      ease: "easeOut",
                    }}
                    className="hidden md:block">
                    <Button
                      label={buttonText}
                      url={url}
                      style={theme == "gray" ? "light" : "gray"}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{
                      once: true,
                      margin: "-100px",
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3,
                      ease: "easeOut",
                    }}
                    className="md:hidden">
                    <Button label={buttonText} url={url} />
                  </motion.div>
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
