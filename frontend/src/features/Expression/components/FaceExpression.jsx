import { useEffect, useRef, useState } from "react";

import {
  initializeFaceLandmarker,
  startCamera,
  detectFaceExpression,
  stopCamera,
  closeFaceLandmarker,
} from "../utils/utils";


const FaceExpression = () => {
  // --------------------------------
  // Refs
  // --------------------------------

  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);


  // --------------------------------
  // State
  // --------------------------------

  const [expression, setExpression] =
    useState("Click the button");

  const [loading, setLoading] =
    useState(true);


  // --------------------------------
  // Detect Face - Button
  // --------------------------------

  const detectFace = () => {
    try {
      const result =
        detectFaceExpression(
          landmarkerRef.current,
          videoRef.current
        );

      setExpression(result.expression);

      console.log(
        "Detected Expression:",
        result.expression
      );

    } catch (error) {
      console.error(
        "Face detection error:",
        error
      );

      setExpression("Detection error");
    }
  };


  // --------------------------------
  // Initialize
  // --------------------------------

  useEffect(() => {
    let mounted = true;


    const initialize = async () => {
      try {
        setLoading(true);


        // Initialize MediaPipe
        const landmarker =
          await initializeFaceLandmarker();


        if (!mounted) {
          closeFaceLandmarker(
            landmarker
          );

          return;
        }


        landmarkerRef.current =
          landmarker;


        // Start Camera
        const stream =
          await startCamera();


        if (!mounted) {
          stopCamera(stream);

          closeFaceLandmarker(
            landmarker
          );

          return;
        }


        streamRef.current =
          stream;


        // Attach camera to video
        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;

          await videoRef.current.play();
        }


        setLoading(false);


        console.log("Camera ready");

        console.log(
          "Face Landmarker ready"
        );

      } catch (error) {
        console.error(
          "Initialization error:",
          error
        );

        setLoading(false);

        setExpression(
          "❌ Camera initialization failed"
        );
      }
    };


    initialize();


    // --------------------------------
    // Cleanup
    // --------------------------------

    return () => {
      mounted = false;


      // Stop Camera
      stopCamera(
        streamRef.current
      );

      streamRef.current = null;


      // Close MediaPipe
      closeFaceLandmarker(
        landmarkerRef.current
      );

      landmarkerRef.current = null;
    };

  }, []);


  // --------------------------------
  // JSX
  // --------------------------------

  return (
    <div
      className="face-expression"
      style={{
        textAlign: "center",
        padding: "30px",
      }}
    >

      <h2>
        Face Expression Detection
      </h2>


      {/* Camera */}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "640px",
          maxWidth: "100%",
          borderRadius: "20px",
          transform: "scaleX(-1)",
        }}
      />


      {/* Loading */}

      {loading && (
        <p>
          Loading camera and face detector...
        </p>
      )}


      {/* Expression */}

      <h1>
        {expression}
      </h1>


      {/* Detect Button */}

      <button
        onClick={detectFace}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          border: "none",
          borderRadius: "10px",
          cursor: loading
            ? "not-allowed"
            : "pointer",
        }}
      >
        Detect Face Expression
      </button>

    </div>
  );
};


export default FaceExpression;