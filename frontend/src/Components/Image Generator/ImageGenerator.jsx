// import React, { useRef } from "react";
// import default_img from '../Assets/claraundben-ai-generated-8622236_1920.jpg';
// import { useState } from "react";

//  const ImageGenerator = () => {

//     const [image_url, setImage_url] = useState("/");
//     let inputRef=useRef(null);

//     const ImageGenerator = () => {
//         if (inputRef.current.value==="") {
//           return 0;
//         }
//         const response = fetch("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")
//       }

//   return (
//     <>
//     <div>
//       <img className="w-auto h-[470px]" src={image_url==="/" ? default_img : image_url} alt="generated" />
//     </div>
//     <div>
//         <h1 className="text-2xl font-bold mt-4">Image Generator</h1>
//         <input ref={inputRef} ype="text" placeholder="Enter a prompt..." className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//         <button className="bg-amber-700 text-white py-2 px-4 rounded-md hover:bg-amber-800">Generate Image</button>
//     </div>
//     </>
//   );
// }

// export default ImageGenerator;
import React, { useRef, useState } from "react";
import default_img from "../Assets/claraundben-ai-generated-8622236_1920.jpg";

const ImageGenerator = () => {

  const [image_url, setImage_url] = useState("/");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  const generateImage = async () => {

    if (inputRef.current.value === "") {
      alert("Please enter a prompt");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/generate-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: inputRef.current.value,
          }),
        }
      );

      const data = await response.json();

      setImage_url(`data:image/png;base64,${data.image}`);

    } catch (error) {

      console.log(error);
      alert("Image generation failed");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">

      {/* Image */}
      <div className="bg-white p-4 rounded-2xl shadow-xl">

        <img
          className="w-[500px] h-[500px] object-cover rounded-xl"
          src={image_url === "/" ? default_img : image_url}
          alt="Generated"
        />

      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mt-8 text-gray-800">
        AI Image Generator
      </h1>

      {/* Input + Button */}
      <div className="flex gap-4 mt-6">

        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your prompt..."
          className="w-[400px] border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={generateImage}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          {loading ? "Generating..." : "Generate"}
        </button>

      </div>

    </div>
  );
};

export default ImageGenerator;