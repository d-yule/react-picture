import React, { useRef, useState, useEffect } from "react";
import jsQR from "jsqr";

const CameraButton = () => {
    const videoRef = useRef(null);
    const [qrData, setQrData] = useState(null);
    const [previousQrData, setPreviousQrData] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [facingMode, setFacingMode] = useState("environment"); // Default to rear camera
    const canvasRef = useRef(null); // To draw the highlight around the QR code

    useEffect(() => {
        const getCameraStream = () => {
            navigator.mediaDevices
                .getUserMedia({
                    video: {
                        facingMode: facingMode, // Use environment (rear camera) by default
                    },
                })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play();
                            setIsVideoReady(true);
                        };
                    }
                })
                .catch((err) => {
                    console.error("Error accessing the camera: ", err);

                    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

                    if (/android/i.test(userAgent)) {
                        // Android-specific instructions
                        alert(
                            "Unable to access the camera. Please go to your browser settings and enable camera access for this site. " +
                            "For Chrome, go to Settings > Site Settings > Camera. " +
                            "For Firefox, go to Settings > Site Permissions > Camera."
                        );
                    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                        // iOS-specific instructions
                        alert(
                            "Unable to access the camera. Please go to your browser settings and enable camera access for this site. " +
                            "For Safari, go to Settings > Safari > Camera and allow camera access for websites."
                        );
                    } else {
                        // Default message for desktop or unknown devices
                        alert(
                            "Unable to access the camera. Please check your browser's settings and enable camera access."
                        );
                    }
                });
        };

        // Ensure the site is requesting permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            getCameraStream();
        } else {
            alert("Your browser does not support camera access.");
        }
    }, [facingMode]);

    // Function to continuously scan for QR codes
    useEffect(() => {
        const scanQrCode = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
                const context = canvas.getContext("2d");

                // Adjust canvas dimensions to match the video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw the video frame onto the canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Get image data from the canvas
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                // Scan the image data for a QR code
                const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                // Clear the previous drawings
                context.clearRect(0, 0, canvas.width, canvas.height);

                // Check if a QR code was detected
                if (qrCode) {
                    // If QR code is detected, update both qrData and previousQrData
                    if (qrCode.data !== previousQrData) {
                        setQrData(qrCode.data);
                        setPreviousQrData(qrCode.data); // Update the previous QR data
                    }

                    // Draw an animated highlight around the QR code
                    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
                    context.lineWidth = 4;

                    const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = qrCode.location;

                    // Draw the border around the QR code
                    context.beginPath();
                    context.moveTo(topLeftCorner.x, topLeftCorner.y);
                    context.lineTo(topRightCorner.x, topRightCorner.y);
                    context.lineTo(bottomRightCorner.x, bottomRightCorner.y);
                    context.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
                    context.closePath();
                    context.stroke();
                } else {
                    // If no QR code is detected, keep the last detected QR code
                    if (previousQrData) {
                        setQrData(previousQrData); // Keep the previous QR data
                    } else {
                        setQrData(null); // Clear the QR data if there was no previous QR code
                    }
                }
            }
            requestAnimationFrame(scanQrCode); // Continue scanning for QR codes
        };

        if (isVideoReady) {
            requestAnimationFrame(scanQrCode); // Start scanning when the video is ready
        }
    }, [isVideoReady, previousQrData]); // Only re-run if video is ready or previous QR data changes

    const toggleCamera = () => {
        setFacingMode((prevMode) =>
            prevMode === "environment" ? "user" : "environment"
        );
    };

    return (
        <div style={{ position: "relative", width: "100%", height: "auto" }}>
            <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: "100%", height: "auto", display: isVideoReady ? "block" : "none" }}
            />
            {!isVideoReady && <p>Loading camera...</p>}

            {/* Overlay Canvas for QR Highlight */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "auto",
                    pointerEvents: "none",
                    zIndex: 2
                }}
            />

            <div
                style={{
                    position: "absolute",
                    top: "10px", // Keep the buttons near the top of the video
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "center",
                    zIndex: 1,
                }}
            >
                <button
                    onClick={toggleCamera}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "10px", // Space between button and QR data
                    }}
                >
                    Switch Camera
                </button>
                {qrData && (
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "5px",
                            boxShadow: "0px 0px 5px rgba(0,0,0,0.1)",
                            color: "#333",
                        }}
                    >
                        QR Code Data: {qrData}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraButton;
