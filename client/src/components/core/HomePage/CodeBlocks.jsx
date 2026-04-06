
import React, { useEffect, useState } from "react";
import CTAButton from "./Button";
import { FaArrowRight } from "react-icons/fa";
const CodeBlocks = ({
  position,
  heading,
  subheading,
  ctabtn1,
  ctabtn2,
  codeblock,
  backgroundGradient,
  codeColor,
}) => {

  // 🔥 Custom typing animation (same as TypeAnimation)
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < codeblock.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + codeblock[index]);
        setIndex(index + 1);
      }, 50);

      return () => clearTimeout(timeout);
    } else {
      // restart animation after delay
      const reset = setTimeout(() => {
        setDisplayText("");
        setIndex(0);
      }, 2000);

      return () => clearTimeout(reset);
    }
  }, [index, codeblock]);

  return (
    <div
      className={`flex ${position} my-20 justify-between flex-col lg:gap-10 gap-10`}
    >
      {/* Section 1 */}
      <div className="w-[100%] lg:w-[50%] flex flex-col gap-8">
        {heading}

        {/* Sub Heading */}
        <div className="text-richblack-300 text-base font-bold w-[85%] -mt-3">
          {subheading}
        </div>

        {/* Buttons */}
        <div className="flex gap-7 mt-7">
          <CTAButton active={ctabtn1.active} linkto={ctabtn1.link}>
            <div className="flex items-center gap-2">
              {ctabtn1.btnText}
              <FaArrowRight />
            </div>
          </CTAButton>

          <CTAButton active={ctabtn2.active} linkto={ctabtn2.link}>
            {ctabtn2.btnText}
          </CTAButton>
        </div>
      </div>

      {/* Section 2 */}
         <div className="relative min-h-[250px] code-border flex flex-row py-4 text-[10px] sm:text-sm leading-[18px] sm:leading-6 w-[100%] lg:w-[470px] border border-richblack-700 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.15)]">
        {backgroundGradient}

        {/* Line Numbers */}
        <div className="text-center flex flex-col w-[10%] select-none text-richblack-400 font-inter font-bold">
         {Array.from({ length: 10 }, (_, i) => (
       <p key={i}>{i + 1}</p>
        ))}
        </div>

        {/* Code Animation */}

     <div
  className={`w-[90%] pl-2 font-bold font-mono ${codeColor} pr-2 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]`}
>
  <pre className="whitespace-pre-wrap leading-6">
    {displayText}
  </pre>
</div>
      </div>
    </div>
  );
};

export default CodeBlocks;