import { useCallback, useEffect, useRef, useState } from "react";

import {
  initializeFaceLandmarker,
  startCamera,
  detectFaceExpression,
  stopCamera,
  closeFaceLandmarker,
} from "./utils/utils";


const FaceExpression = ({ onDetected }) => {
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
  const [cameraActive, setCameraActive] =
    useState(false);

  const activateCamera = useCallback(async () => {
    try {
      setLoading(true);
      const stream = await startCamera();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Camera restart error:", error);
      setLoading(false);
      setExpression(error.name === "NotAllowedError" ? "Camera permission is required" : "Camera is unavailable");
      return false;
    }
  }, []);


  // --------------------------------
  // Detect Face - Button
  // --------------------------------

  const detectFace = async () => {
    try {
      if (!cameraActive) {
        const restarted = await activateCamera();
        if (!restarted) return;
      }

      const result =
        detectFaceExpression(
          landmarkerRef.current,
          videoRef.current
        );

      setExpression(result.expression);

      const normalizedExpression = result.expression.toLowerCase();
      const mood = ["happy", "sad", "surprised"].find((supportedMood) =>
        normalizedExpression.includes(supportedMood)
      ) || "";

      const songsFetched = await onDetected?.({ expression: result.expression, mood, detected: result.detected });

      if (songsFetched === true) {
        stopCamera(streamRef.current);
        streamRef.current = null;
        setCameraActive(false);
        if (videoRef.current) videoRef.current.srcObject = null;
      }

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
      onDetected?.({ expression: "Detection error", mood: "", detected: false });
    }
  };


  // --------------------------------

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        const landmarker = await initializeFaceLandmarker();

        if (!mounted) {
          closeFaceLandmarker(landmarker);
          return;
        }

        landmarkerRef.current = landmarker;
        setLoading(false);
        console.log("Face Landmarker ready");
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
        setExpression("❌ Face detector initialization failed");
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

  }, [activateCamera]);


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
        {cameraActive ? "Detect Face Expression" : "Detect Again"}
      </button>

    </div>
  );
};


export default FaceExpression;