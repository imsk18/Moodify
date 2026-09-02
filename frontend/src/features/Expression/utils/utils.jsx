import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";


// =====================================================
// DETECT EXPRESSION
// =====================================================

export const detectExpression = (blendshapes) => {
  // ---------------------------------
  // Get Blendshape Score
  // ---------------------------------

  const getScore = (name) => {
    const item = blendshapes.find(
      (shape) => shape.categoryName === name
    );

    return item ? item.score : 0;
  };


  // =====================================================
  // SMILE
  // =====================================================

  const smileLeft =
    getScore("mouthSmileLeft");

  const smileRight =
    getScore("mouthSmileRight");

  const smile =
    (smileLeft + smileRight) / 2;


  // =====================================================
  // MOUTH / JAW
  // =====================================================

  const jawOpen =
    getScore("jawOpen");


  // =====================================================
  // EYES
  // =====================================================

  const eyeBlinkLeft =
    getScore("eyeBlinkLeft");

  const eyeBlinkRight =
    getScore("eyeBlinkRight");


  // =====================================================
  // ANGRY / BROWS
  // =====================================================

  const browDownLeft =
    getScore("browDownLeft");

  const browDownRight =
    getScore("browDownRight");

  const browDown =
    (browDownLeft + browDownRight) / 2;


  // =====================================================
  // SAD
  // =====================================================

  const mouthFrownLeft =
    getScore("mouthFrownLeft");

  const mouthFrownRight =
    getScore("mouthFrownRight");

  const mouthFrown =
    (mouthFrownLeft + mouthFrownRight) / 2;


  const browInnerUp =
    getScore("browInnerUp");


  // =====================================================
  // DEBUG
  // =====================================================

  console.log("Face Scores:", {
    smile,
    jawOpen,
    browDown,
    mouthFrown,
    browInnerUp,
    eyeBlinkLeft,
    eyeBlinkRight,
  });


  // =====================================================
  // EXPRESSION PRIORITY
  // =====================================================

  // ---------------------------------
  // 😮 SURPRISED
  // ---------------------------------

  if (
    jawOpen > 0.35 &&
    browInnerUp > 0.20
  ) {
    return "😮 Surprised";
  }


  // ---------------------------------
  // 😠 ANGRY
  // ---------------------------------

  if (
    browDown > 0.25 &&
    smile < 0.30
  ) {
    return "😠 Angry";
  }


  // ---------------------------------
  // 😢 SAD
  // ---------------------------------

  if (
    mouthFrown > 0.20 &&
    browInnerUp > 0.15
  ) {
    return "😢 Sad";
  }


  // ---------------------------------
  // 😊 HAPPY
  // ---------------------------------

  if (
    smile > 0.40
  ) {
    return "😊 Happy";
  }


  // ---------------------------------
  // 😑 EYES CLOSED
  // ---------------------------------

  if (
    eyeBlinkLeft > 0.60 &&
    eyeBlinkRight > 0.60
  ) {
    return "😑 Eyes Closed";
  }


  // ---------------------------------
  // 😐 NEUTRAL
  // ---------------------------------

  return "😐 Neutral";
};


// =====================================================
// INITIALIZE MEDIAPIPE FACE LANDMARKER
// =====================================================

export const initializeFaceLandmarker = async () => {

  // ---------------------------------
  // Load MediaPipe Vision
  // ---------------------------------

  const vision =
    await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );


  // ---------------------------------
  // Create Face Landmarker
  // ---------------------------------

  const landmarker =
    await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },

        // VIDEO mode
        runningMode: "VIDEO",

        // Detect only one face
        numFaces: 1,

        // IMPORTANT
        // Required for expression detection
        outputFaceBlendshapes: true,

        // Detection confidence
        minFaceDetectionConfidence: 0.5,

        // Face presence confidence
        minFacePresenceConfidence: 0.5,

        // Tracking confidence
        minTrackingConfidence: 0.5,
      }
    );


  return landmarker;
};


// =====================================================
// START CAMERA
// =====================================================

export const startCamera = async () => {

  // ---------------------------------
  // Check browser camera support
  // ---------------------------------

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error(
      "Camera API is not supported by this browser"
    );
  }


  // ---------------------------------
  // Request Camera
  // ---------------------------------

  const stream =
    await navigator.mediaDevices.getUserMedia({
      video: {
        width: {
          ideal: 640,
        },

        height: {
          ideal: 480,
        },

        facingMode: "user",
      },

      audio: false,
    });


  return stream;
};


// =====================================================
// DETECT FACE EXPRESSION
// =====================================================

export const detectFaceExpression = (
  landmarker,
  video
) => {

  // ---------------------------------
  // Check Landmarker
  // ---------------------------------

  if (!landmarker) {
    throw new Error(
      "Face Landmarker is not ready"
    );
  }


  // ---------------------------------
  // Check Video
  // ---------------------------------

  if (!video) {
    throw new Error(
      "Video element is not ready"
    );
  }


  // ---------------------------------
  // Check Camera Ready
  // ---------------------------------

  if (video.readyState < 2) {
    return {
      expression: "Camera is not ready",

      detected: false,
    };
  }


  // ---------------------------------
  // Detect Face
  // ---------------------------------

  const results =
    landmarker.detectForVideo(
      video,
      performance.now()
    );


  // ---------------------------------
  // Check Face
  // ---------------------------------

  if (
    results.faceBlendshapes &&
    results.faceBlendshapes.length > 0
  ) {

    // Get first detected face
    const blendshapes =
      results.faceBlendshapes[0].categories;


    // Detect expression
    const expression =
      detectExpression(
        blendshapes
      );


    return {
      expression,

      detected: true,

      blendshapes,
    };
  }


  // ---------------------------------
  // No Face
  // ---------------------------------

  return {
    expression: "😶 No face detected",

    detected: false,

    blendshapes: [],
  };
};


// =====================================================
// STOP CAMERA
// =====================================================

export const stopCamera = (stream) => {

  if (!stream) {
    return;
  }


  // Stop every camera track
  stream
    .getTracks()
    .forEach((track) => {
      track.stop();
    });
};


// =====================================================
// CLOSE FACE LANDMARKER
// =====================================================

export const closeFaceLandmarker = (
  landmarker
) => {

  if (!landmarker) {
    return;
  }


  try {
    landmarker.close();
  } catch (error) {
    console.error(
      "Error closing Face Landmarker:",
      error
    );
  }
};