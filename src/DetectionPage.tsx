import { useEffect, useRef, useState } from "react";

type DetectionMode = "IMAGE" | "SATELLITE";
type ViewMode = "SPLIT" | "OVERLAY" | "ORIGINAL";

type DetectionBox = {
  id: number;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  category: string;
};

type DemoPreset = {
  title: string;
  location: string;
  detail: string;
  items: number;
  image: string;
};

const detectionBoxes: DetectionBox[] = [
  {
    id: 1,
    label: "Plastic Bottle",
    confidence: 92,
    x: 13,
    y: 24,
    width: 18,
    height: 18,
    category: "Plastic Bottles",
  },
  {
    id: 2,
    label: "Plastic Fragment",
    confidence: 88,
    x: 37,
    y: 43,
    width: 14,
    height: 18,
    category: "Plastic Fragments",
  },
  {
    id: 3,
    label: "Fishing-related Debris",
    confidence: 76,
    x: 68,
    y: 29,
    width: 22,
    height: 23,
    category: "Fishing-related Debris",
  },
  {
    id: 4,
    label: "Plastic Fragment",
    confidence: 83,
    x: 62,
    y: 65,
    width: 13,
    height: 13,
    category: "Plastic Fragments",
  },
];

const presets: DemoPreset[] = [
  {
    title: "Underwater Drone — Reef Bight",
    location: "Coromandel Coastal Shelf",
    detail: "14m depth",
    items: 17,
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Autonomous Surface Vessel — Debris Slick",
    location: "Bay of Bengal Gyre Margin",
    detail: "Surface observation",
    items: 23,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Shoreline Drone — Mangrove Estuary",
    location: "River outflow plume",
    detail: "Coastal observation",
    items: 19,
    image:
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80",
  },
];

type DetectionPageProps = {
  onBackToDashboard: () => void;
};

export default function DetectionPage({
  onBackToDashboard,
}: DetectionPageProps) {
  const [mode, setMode] = useState<DetectionMode>("IMAGE");
  const [viewMode, setViewMode] = useState<ViewMode>("SPLIT");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [selectedFileName, setSelectedFileName] =
    useState("");

  const [selectedSource, setSelectedSource] =
    useState("None");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisComplete, setAnalysisComplete] =
    useState(false);

  const [analysisStep, setAnalysisStep] =
    useState(0);

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraStream, setCameraStream] =
    useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processingSteps = [
    "INITIALIZING VISION ENGINE",
    "READING IMAGE",
    "QUALITY CHECK",
    "EXTRACTING VISUAL FEATURES",
    "DETECTING POTENTIAL DEBRIS",
    "CLASSIFYING OBJECTS",
    "CALCULATING CONFIDENCE",
    "GENERATING RESULTS",
  ];

  const categories = [
    {
      name: "Plastic Bottles",
      count: 7,
      percentage: 41,
    },
    {
      name: "Plastic Fragments",
      count: 6,
      percentage: 35,
    },
    {
      name: "Fishing-related Debris",
      count: 3,
      percentage: 18,
    },
    {
      name: "Other",
      count: 1,
      percentage: 6,
    },
  ];

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX <= 18) {
        setSidebarOpen(true);
      }

      if (event.clientX > 280) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  useEffect(() => {
    if (!isAnalyzing) {
      return;
    }

    setAnalysisStep(0);

    const interval = setInterval(() => {
      setAnalysisStep((current) => {
        if (current >= processingSteps.length - 1) {
          clearInterval(interval);

          setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisComplete(true);
          }, 700);

          return current;
        }

        return current + 1;
      });
    }, 550);

    return () => {
      clearInterval(interval);
    };
  }, [isAnalyzing]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
    setSelectedFileName(file.name);
    setSelectedSource("File Upload");
    setAnalysisComplete(false);
    setSelectedCategory(null);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openCamera = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      setCameraStream(stream);
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera access failed:", error);

      alert(
        "Camera access was not available. Please allow camera permission in your browser."
      );
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setCameraStream(null);
    setCameraOpen(false);
  };

  const captureCameraImage = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageUrl = canvas.toDataURL("image/jpeg", 0.9);

    setSelectedImage(imageUrl);
    setSelectedFileName("camera_capture.jpg");
    setSelectedSource("Camera Capture");
    setAnalysisComplete(false);

    closeCamera();
  };

  const usePreset = (preset: DemoPreset) => {
    setSelectedImage(preset.image);
    setSelectedFileName(
      preset.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_") + ".jpg"
    );

    setSelectedSource("Hackathon Demo");
    setAnalysisComplete(false);
    setSelectedCategory(null);
  };

  const startAnalysis = () => {
    if (!selectedImage) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setSelectedCategory(null);
  };

  const resetDetection = () => {
    setSelectedImage(null);
    setSelectedFileName("");
    setSelectedSource("None");
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setAnalysisStep(0);
    setSelectedCategory(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="detection-page">

      {/* =========================================
          EDGE TRIGGER
      ========================================= */}

      <div className="detection-edge-trigger" />


      {/* =========================================
          AUTO HIDDEN SIDEBAR
      ========================================= */}

      <aside
        className={`detection-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="detection-sidebar-brand">

          <div className="detection-brand-icon">
            AT
          </div>

          <div>
            <strong>
              AquaTrace AI
            </strong>

            <span>
              MARINE PLASTIC INTELLIGENCE
            </span>
          </div>

        </div>


        <button className="demo-launch-button">
          <span className="demo-play">
            ▶
          </span>

          <span>
            <strong>
              Run AquaTrace Demo
            </strong>

            <small>
              8-Step Guided Tour
            </small>
          </span>

          <i />
        </button>


        <div className="sidebar-section-label">
          OPERATIONS
        </div>


        <nav className="detection-nav">

          <button
            onClick={() => {
              document
                .getElementById("dashboard")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            <span>◎</span>
            Dashboard
          </button>

          <button className="active">
            <span>◉</span>
            Detection
            <em>●</em>
          </button>

          <button>
            <span>⌁</span>
            Tracking
          </button>

          <button>
            <span>◌</span>
            Prediction
          </button>

          <button>
            <span>▥</span>
            Insights
          </button>

        </nav>


        <div className="sidebar-section-label">
          PLATFORM INTEL
        </div>


        <nav className="detection-nav secondary">

          <button>
            <span>?</span>
            How AquaTrace AI Works
          </button>

          <button>
            <span>≋</span>
            Environmental Data Inputs
          </button>

        </nav>


        <div className="sidebar-system-status">

          <span>
            HYDRODYNAMIC CORE
          </span>

          <strong>
            v2.4
          </strong>

          <div>
            <i />
            READY
          </div>

        </div>

      </aside>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="detection-main">


        {/* =========================================
            HEADER
        ========================================= */}

        <header className="detection-header">

          <div>

            <div className="detection-eyebrow">
              01 / DETECTION INTELLIGENCE
            </div>

            <h1>
              AI Marine Debris Detection
            </h1>

            <p>
              Analyze marine imagery to identify potential
              plastic debris, classify detected objects, and
              estimate detection confidence using AquaTrace AI.
            </p>

          </div>


          <div className="vision-status">
            <span />
            VISION ENGINE READY
          </div>

        </header>


        {/* =========================================
            MODE SELECTOR
        ========================================= */}

        <section className="detection-mode-section">

          <span>
            DETECTION MODE
          </span>


          <div className="detection-mode-buttons">

            <button
              className={
                mode === "IMAGE"
                  ? "mode-button active"
                  : "mode-button"
              }
              onClick={() => {
                setMode("IMAGE");
              }}
            >
              <strong>
                ◉
              </strong>

              <div>
                <b>
                  IMAGE / CAMERA
                </b>

                <small>
                  Upload • Capture • Drone • Underwater
                </small>
              </div>

            </button>


            <button
              className={
                mode === "SATELLITE"
                  ? "mode-button active"
                  : "mode-button"
              }
              onClick={() => {
                setMode("SATELLITE");
              }}
            >
              <strong>
                ◈
              </strong>

              <div>
                <b>
                  SATELLITE
                </b>

                <small>
                  PACE OCI • Hotspots • Large Area
                </small>
              </div>

            </button>

          </div>

        </section>


        {mode === "IMAGE" ? (

          <section className="detection-workspace">


            {/* =====================================
                LEFT INPUT PANEL
            ===================================== */}

            <div className="detection-input-column">

              <div className="detection-panel">

                <div className="panel-title">
                  INPUT & CONTROLS
                </div>


                <div className="input-options">

                  <div className="upload-box">

                    <div className="upload-icon">
                      ↑
                    </div>

                    <strong>
                      DROP IMAGE HERE
                    </strong>

                    <span>
                      JPG • PNG • WEBP
                    </span>

                    <button
                      onClick={openFilePicker}
                    >
                      SELECT IMAGE
                    </button>

                  </div>


                  <div className="camera-box">

                    <div className="upload-icon">
                      ◉
                    </div>

                    <strong>
                      CAPTURE WITH CAMERA
                    </strong>

                    <span>
                      Use device camera
                    </span>

                    <button
                      onClick={openCamera}
                    >
                      OPEN CAMERA
                    </button>

                  </div>

                </div>


                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  hidden
                />


                <div className="preset-heading">
                  <span>
                    HACKATHON DEMO PRESETS
                  </span>

                  <small>
                    DEMO
                  </small>
                </div>


                <div className="preset-list">

                  {presets.map((preset) => (

                    <button
                      key={preset.title}
                      className="preset-card"
                      onClick={() => {
                        usePreset(preset);
                      }}
                    >

                      <img
                        src={preset.image}
                        alt=""
                      />

                      <div>

                        <strong>
                          {preset.title}
                        </strong>

                        <span>
                          {preset.location}
                        </span>

                        <small>
                          {preset.detail} • {preset.items} items
                        </small>

                      </div>

                      <em>
                        USE SAMPLE
                      </em>

                    </button>

                  ))}

                </div>


                <div className="analysis-actions">

                  <button
                    className={
                      selectedImage
                        ? "analyze-button"
                        : "analyze-button disabled"
                    }
                    disabled={!selectedImage || isAnalyzing}
                    onClick={startAnalysis}
                  >
                    ✦ ANALYZE WITH AQUATRACE AI
                  </button>

                  <button
                    className="reset-button"
                    onClick={resetDetection}
                  >
                    ↻
                  </button>

                </div>


                {selectedImage && (

                  <div className="selected-source">

                    <div className="panel-title">
                      SELECTED SOURCE
                    </div>

                    <div className="selected-source-content">

                      <img
                        src={selectedImage}
                        alt="Selected source"
                      />

                      <div>

                        <strong>
                          {selectedFileName}
                        </strong>

                        <span>
                          SOURCE
                        </span>

                        <small>
                          {selectedSource}
                        </small>

                      </div>

                      <button
                        onClick={openFilePicker}
                      >
                        CHANGE
                      </button>

                    </div>

                  </div>

                )}

              </div>

            </div>


            {/* =====================================
                CENTER VIEWER
            ===================================== */}

            <div className="detection-view-column">

              <div className="detection-panel viewer-panel">

                <div className="viewer-header">

                  <span>
                    IMAGE OBSERVATION
                  </span>

                  <div>

                    <button
                      className={
                        viewMode === "SPLIT"
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        setViewMode("SPLIT");
                      }}
                    >
                      SPLIT VIEW
                    </button>

                    <button
                      className={
                        viewMode === "OVERLAY"
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        setViewMode("OVERLAY");
                      }}
                    >
                      AI OVERLAY
                    </button>

                    <button
                      className={
                        viewMode === "ORIGINAL"
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        setViewMode("ORIGINAL");
                      }}
                    >
                      ORIGINAL
                    </button>

                  </div>

                </div>


                <div className="image-observation">

                  {selectedImage ? (

                    <div className="observation-image-wrapper">

                      <img
                        src={selectedImage}
                        alt="Marine observation"
                      />


                      {viewMode !== "ORIGINAL" &&
                        analysisComplete && (

                          <div className="detection-overlay">

                            {detectionBoxes.map((box) => {

                              const isHighlighted =
                                !selectedCategory ||
                                selectedCategory ===
                                  box.category;

                              return (

                                <button
                                  key={box.id}
                                  className={`detection-box ${
                                    isHighlighted
                                      ? ""
                                      : "dimmed"
                                  }`}
                                  style={{
                                    left: `${box.x}%`,
                                    top: `${box.y}%`,
                                    width: `${box.width}%`,
                                    height: `${box.height}%`,
                                  }}
                                  onClick={() => {
                                    setSelectedCategory(
                                      box.category
                                    );
                                  }}
                                >

                                  <span>
                                    {box.label}
                                    {" "}
                                    ({box.confidence}%)
                                  </span>

                                </button>

                              );
                            })}

                          </div>

                        )}


                      {viewMode === "SPLIT" &&
                        analysisComplete && (

                          <div className="split-divider">
                            <span>
                              ORIGINAL
                            </span>

                            <span>
                              AI
                            </span>
                          </div>

                        )}

                    </div>

                  ) : (

                    <div className="empty-observation">

                      <div>
                        ◈
                      </div>

                      <strong>
                        NO OBSERVATION LOADED
                      </strong>

                      <span>
                        Upload an image, open the camera,
                        or select a demo preset.
                      </span>

                    </div>

                  )}


                  {isAnalyzing && (

                    <div className="analysis-processing">

                      <div className="processing-ring">
                        {Math.round(
                          ((analysisStep + 1) /
                            processingSteps.length) *
                            100
                        )}%
                      </div>

                      <strong>
                        ANALYZING OCEAN IMAGERY
                      </strong>

                      <span>
                        {processingSteps[analysisStep]}
                      </span>

                    </div>

                  )}

                </div>


                <div className="model-diagnostics">

                  <div>
                    <span>
                      VISION ENGINE
                    </span>

                    <strong>
                      AquaTrace Vision — Demo
                    </strong>

                    <em>
                      ACTIVE
                    </em>
                  </div>

                  <div>
                    <span>
                      PROCESSING LATENCY
                    </span>

                    <strong>
                      48 ms
                    </strong>
                  </div>

                  <div>
                    <span>
                      IMAGE
                    </span>

                    <strong>
                      1920 × 1080
                    </strong>
                  </div>

                </div>

              </div>


              {/* PROCESSING STEPS */}

              <div className="detection-panel processing-panel">

                <div className="panel-title">
                  DETECTION PROCESS
                </div>

                <div className="processing-list">

                  {processingSteps.map(
                    (step, index) => {

                      const completed =
                        analysisComplete ||
                        index < analysisStep;

                      const current =
                        isAnalyzing &&
                        index === analysisStep;

                      return (

                        <div
                          key={step}
                          className={
                            completed
                              ? "processing-row completed"
                              : current
                              ? "processing-row current"
                              : "processing-row"
                          }
                        >

                          <span>
                            {index + 1}
                          </span>

                          <strong>
                            {step}
                          </strong>

                          <em>
                            {completed
                              ? "✓ COMPLETED"
                              : current
                              ? "◌ PROCESSING"
                              : "PENDING"}
                          </em>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

            </div>


            {/* =====================================
                RESULTS PANEL
            ===================================== */}

            <div className="detection-results-column">

              <div className="detection-panel results-panel">

                <div className="results-heading">

                  <span>
                    DETECTION RESULTS
                  </span>

                  <em>
                    VERIFIED SIGNATURES
                  </em>

                </div>


                {!analysisComplete ? (

                  <div className="results-empty">

                    <div>
                      ◌
                    </div>

                    <strong>
                      AWAITING ANALYSIS
                    </strong>

                    <span>
                      Select an image and run
                      AquaTrace AI analysis.
                    </span>

                  </div>

                ) : (

                  <>

                    <div className="result-stat-grid">

                      <div>

                        <span>
                          TOTAL OBJECTS
                        </span>

                        <strong>
                          17
                        </strong>

                      </div>

                      <div>

                        <span>
                          DETECTION CONFIDENCE
                        </span>

                        <strong>
                          91%
                        </strong>

                      </div>

                      <div>

                        <span>
                          ESTIMATED DENSITY
                        </span>

                        <strong className="warning-text">
                          HIGH
                        </strong>

                      </div>

                    </div>


                    <div className="categories-section">

                      <div className="results-subtitle">
                        DETECTED CATEGORIES
                      </div>

                      {categories.map(
                        (category) => (

                          <button
                            key={category.name}
                            className={
                              selectedCategory ===
                              category.name
                                ? "category-row selected"
                                : "category-row"
                            }
                            onClick={() => {
                              setSelectedCategory(
                                selectedCategory ===
                                  category.name
                                  ? null
                                  : category.name
                              );
                            }}
                          >

                            <span />

                            <div>

                              <strong>
                                {category.name}
                              </strong>

                              <div className="category-bar">
                                <i
                                  style={{
                                    width: `${category.percentage}%`,
                                  }}
                                />
                              </div>

                            </div>

                            <b>
                              {category.count}
                            </b>

                            <em>
                              {category.percentage}%
                            </em>

                          </button>

                        )
                      )}

                    </div>


                    <div className="summary-box">

                      <div className="results-subtitle">
                        DETECTION SUMMARY
                      </div>

                      <div>
                        <span>
                          Objects detected
                        </span>

                        <strong>
                          17
                        </strong>
                      </div>

                      <div>
                        <span>
                          Highest confidence
                        </span>

                        <strong>
                          96%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Lowest confidence
                        </span>

                        <strong>
                          71%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Estimated density
                        </span>

                        <strong className="warning-text">
                          HIGH
                        </strong>
                      </div>

                      <div>
                        <span>
                          Image quality
                        </span>

                        <strong className="success-text">
                          GOOD
                        </strong>
                      </div>

                    </div>


                    <div className="confidence-box">

                      <div>

                        <span>
                          AI CONFIDENCE
                        </span>

                        <strong>
                          91%
                        </strong>

                      </div>

                      <p>
                        The model identified visual
                        patterns consistent with
                        potential marine debris.
                      </p>

                    </div>


                    <div className="next-actions">

                      <button>
                        ◎ TRACK DETECTED DEBRIS →
                      </button>

                      <button>
                        ≋ PREDICT MOVEMENT →
                      </button>

                    </div>

                  </>

                )}

              </div>

            </div>

          </section>

        ) : (

          /* =========================================
             SATELLITE MODE
          ========================================= */

          <section className="satellite-workspace">

            <div className="satellite-source-panel">

              <div className="detection-panel">

                <div className="panel-title">
                  SATELLITE OBSERVATION
                </div>

                <div className="satellite-source-item">

                  <span>
                    SOURCE
                  </span>

                  <strong>
                    NASA PACE OCI
                  </strong>

                </div>

                <div className="satellite-source-item">

                  <span>
                    REGION
                  </span>

                  <strong>
                    Bay of Bengal
                  </strong>

                </div>

                <div className="satellite-source-item">

                  <span>
                    OBSERVATION
                  </span>

                  <strong>
                    19 Sep 2026
                  </strong>

                </div>

                <div className="satellite-source-item">

                  <span>
                    QUALITY
                  </span>

                  <strong className="success-text">
                    GOOD
                  </strong>

                </div>

              </div>

            </div>


            <div className="satellite-map-panel detection-panel">

              <div className="satellite-map-header">

                <span>
                  POTENTIAL DEBRIS HOTSPOTS
                </span>

                <em>
                  PACE OCI • DEMO
                </em>

              </div>

              <div className="satellite-map">

                <div className="map-grid" />

                <div className="hotspot hotspot-one">
                  <span />
                  HOTSPOT 01
                </div>

                <div className="hotspot hotspot-two">
                  <span />
                  HOTSPOT 02
                </div>

                <div className="hotspot hotspot-three">
                  <span />
                  HOTSPOT 03
                </div>

                <div className="map-label-bay">
                  BAY OF BENGAL
                </div>

              </div>

            </div>


            <div className="satellite-analysis-panel detection-panel">

              <div className="panel-title">
                SATELLITE ANALYSIS
              </div>

              <div className="satellite-metric">

                <span>
                  HOTSPOTS DETECTED
                </span>

                <strong>
                  08
                </strong>

              </div>

              <div className="satellite-metric">

                <span>
                  CONFIDENCE
                </span>

                <strong>
                  87%
                </strong>

              </div>

              <div className="satellite-metric">

                <span>
                  AREA COVERAGE
                </span>

                <strong>
                  12,840 km²
                </strong>

              </div>

              <button className="satellite-action">
                ANALYZE HOTSPOTS →
              </button>

            </div>

          </section>

        )}

      </main>


      {/* =========================================
          CAMERA MODAL
      ========================================= */}

      {cameraOpen && (

        <div className="camera-modal-overlay">

          <div className="camera-modal">

            <button
              className="camera-close"
              onClick={closeCamera}
            >
              ×
            </button>

            <div className="camera-modal-header">

              <span>
                CAPTURE MARINE IMAGE
              </span>

              <em>
                LIVE CAMERA
              </em>

            </div>


            <div className="camera-preview">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
              />

            </div>


            <div className="camera-controls">

              <button>
                FLIP CAMERA
              </button>

              <button
                className="capture-button"
                onClick={captureCameraImage}
              >
                ●
              </button>

              <button
                onClick={closeCamera}
              >
                CANCEL
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}