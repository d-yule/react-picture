import React, { useRef, useEffect } from "react";
import jsQR from "jsqr";
import { observer } from "mobx-react-lite";

const QrCodeScanner = observer(({ store }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const getCameraStream = () => {
            navigator.mediaDevices
                .getUserMedia({
                    video: { facingMode: store.facingMode },
                })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play();
                            store.setIsVideoReady(true);
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

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            getCameraStream();
        } else {
            alert("Your browser does not support camera access.");
        }
    }, [store.facingMode]);

    useEffect(() => {
        const scanQrCode = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
                const context = canvas.getContext("2d");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                context.clearRect(0, 0, canvas.width, canvas.height);

                if (qrCode) {
                    if (qrCode.data !== store.previousQrData) {
                        store.setQrData(qrCode.data);
                        store.setPreviousQrData(qrCode.data);
                    }

                    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
                    context.lineWidth = 4;
                    const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = qrCode.location;
                    context.beginPath();
                    context.moveTo(topLeftCorner.x, topLeftCorner.y);
                    context.lineTo(topRightCorner.x, topRightCorner.y);
                    context.lineTo(bottomRightCorner.x, bottomRightCorner.y);
                    context.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
                    context.closePath();
                    context.stroke();
                } else if (store.previousQrData) {
                    store.setQrData(store.previousQrData);
                } else {
                    store.setQrData(null);
                }
            }
            requestAnimationFrame(scanQrCode);
        };

        if (store.isVideoReady) {
            requestAnimationFrame(scanQrCode);
        }
    }, [store.isVideoReady, store.previousQrData]);

    return (
        <div style={{ position: "relative", width: "100%", height: "auto" }}>
            <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: "430px", height: "auto", display: store.isVideoReady ? "block" : "none" }}
            />
            {!store.isVideoReady && <p>Loading camera...</p>}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "auto",
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            />
            <div style={{
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                zIndex: 1,
            }}>
                <button
                    onClick={store.toggleCamera}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "10px",
                    }}
                >
                    Switch Camera
                </button>
                {store.qrData && (
                    <div style={{
                        padding: "10px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "5px",
                        boxShadow: "0px 0px 5px rgba(0,0,0,0.1)",
                        color: "#333",
                    }}>
                        QR Code Data: {store.qrData}
                    </div>
                )}
            </div>
        </div>
    );
});

export default QrCodeScanner;
