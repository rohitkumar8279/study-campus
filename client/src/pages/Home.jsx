
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import HighlightText from "../components/core/HomePage/HighlightText";
import Button from "../components/core/HomePage/Button";
import CodeBlocks from "../components/core/HomePage/CodeBlocks";

import Banner from "../assets/Educational_Video_Generation_Request.mp4";

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-richblack-900 via-richblack-800 to-richblack-900 font-inter text-white">

      {/* ========== Section 1 ========== */}
      <section className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center">

        <Link to="/signup">
          <div className="group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold hover:scale-95 w-fit shadow-[0_1px_0_rgba(255,255,255,0.2)_inset]">
            <div className="flex items-center gap-2 rounded-full px-10 py-[5px] group-hover:bg-richblack-900">
              <p>Become an Instructor</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

        <h1 className="text-center text-4xl font-semibold mt-7">
          Empower Your Future with{" "}
          <HighlightText text="Coding Skills" />
        </h1>

        <p className="mt-4 w-[90%] text-center text-lg font-bold text-richblack-300">
          With our online coding courses, you can learn at your own pace,
          from anywhere in the world.
        </p>

        <div className="flex gap-7 mt-8">
          <Button active={true} linkto="/signup">Learn More</Button>
          <Button active={false} linkto="/login">Book a Demo</Button>
        </div>

        {/* Video Section */}
        <div className="relative mx-auto my-12 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.25)]">
          
          {/* Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent blur-2xl"></div>

          {/* Video */}
          <video
            muted
            loop
            autoPlay
            playsInline
            className="relative w-full max-w-[900px] rounded-xl border border-richblack-700 hover:scale-[1.02] transition duration-300"
          >
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

      </section>

      {/* ========== Section 2 ========== */}
      <section className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center gap-10 pb-16">

        {/* Code Block 1 */}
        <CodeBlocks
          position={"lg:flex-row"}
          heading={
            <div className="text-4xl font-semibold">
              Unlock your{" "}
              <HighlightText text={"coding potential"} />{" "}
              with our online courses.
            </div>
          }
          subheading={
            "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
          }
          ctabtn1={{
            btnText: "Try it Yourself",
            link: "/signup",
            active: true,
          }}
          ctabtn2={{
            btnText: "Learn More",
            link: "/signup",
            active: false,
          }}
          codeColor={"text-yellow-50"}
          codeblock={`<!DOCTYPE html>
<html>
<head>
  <title>My Coding App</title>
</head>
<body>
  <h1> Welcome </h1>
  <p>Start coding today</p>
</body>
</html>`}
          backgroundGradient={
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-transparent blur-2xl"></div>
          }
        />

        {/* Code Block 2 */}
        <CodeBlocks
          position={"lg:flex-row-reverse"}
          heading={
            <div className="text-4xl font-semibold">
              Start{" "}
              <HighlightText text={"coding in seconds"} />
            </div>
          }
          subheading={
            "Go ahead, give it a try. You'll be writing real code from your very first lesson."
          }
          ctabtn1={{
            btnText: "Continue Lesson",
            link: "/signup",
            active: true,
          }}
          ctabtn2={{
            btnText: "Learn More",
            link: "/signup",
            active: false,
          }}
          codeColor={"text-white"}
          codeblock={`import React from "react";

const App = () => {
  return <div>Hello Coding </div>;
};

export default App;`}
          backgroundGradient={
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent blur-2xl"></div>
          }
        />

      </section>

      {/* ========== Section 3 ========== */}
         {/* Section 2 Wrapper */}
<section className="bg-white text-richblack-700 pb-20">
  
  {/* TOP PART: Diagonal Background & Main CTA Buttons */}
  <div 
    className="h-[310px]"
    style={{
      backgroundImage: `
        repeating-linear-gradient(45deg, #f1f5f9 0, #f1f5f9 1px, transparent 1px, transparent 30px), 
        repeating-linear-gradient(-45deg, #f1f5f9 0, #f1f5f9 1px, transparent 1px, transparent 30px)
      `
    }}
  >
    <div className="w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto">
      <div className="h-[190px]"></div>
      <div className="flex flex-row gap-9 text-white">
        <button className="flex items-center gap-3 bg-yellow-50 text-black px-6 py-3 rounded-md font-bold hover:scale-95 transition-all duration-200">
          Explore Full Catalog
          <FaArrowRight />
        </button>
        <button className="bg-richblack-800 text-white px-6 py-3 rounded-md font-bold hover:scale-95 transition-all duration-200">
          Learn more
        </button>
      </div>
    </div>
  </div>

  {/* BOTTOM PART: The New Information Section */}
<div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7">
  <div className="flex flex-row justify-between w-full mb-10 mt-[95px]">
    
    {/* Left Column: Heading */}
    {/* Added 'text-slate-800' for the dark grey text color */}
    <div className="text-4xl font-semibold w-[45%] text-slate-800">
      Get the skills you need for a {" "}
      
      <span className="text-[#00C4CC]">
         job that is in demand.
      </span>
    </div>

    {/* Right Column: Paragraph & Button */}
    {/* Adjusted gap to 8 for button spacing */}
    <div className="flex flex-col gap-8 w-[40%] items-start">
      
      {/* Added 'text-slate-600' for the slightly lighter grey paragraph text */}
      <div className="text-[16px] text-slate-600">
        The modern StudyNotion is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
      </div>
      
      {/* Exact bright yellow button from the image */}
      <button className="bg-[#FFD60A] text-black px-6 py-2 rounded-md font-bold hover:scale-95 transition-all duration-200">
        Learn More
      </button>
      
    </div>

  </div>
</div>
</section>

    </div>
  );
};

export default Home;