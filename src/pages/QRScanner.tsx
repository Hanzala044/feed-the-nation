import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const QRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        setError(null);

        // Check if camera is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Camera not supported on this device");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream as MediaStream;
          await videoRef.current.play();
        }
        setScanning(true);
      } catch (e: any) {
        const errorMsg = e?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : e?.name === "NotFoundError"
          ? "No camera found on this device"
          : e?.message || "Camera access failed";
        setError(errorMsg);
      }
    };
    start();
    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
      setScanning(false);
    };
  }, []);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      if (!videoRef.current || !canvasRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        const text = code.data.trim();
        if (text.startsWith("http")) {
          try {
            const url = new URL(text);
            if (url.pathname.includes("/donor/create-donation")) {
              navigate(`/donor/create-donation?anonymous=true`);
            } else {
              navigate(`/donor/create-donation?anonymous=true`);
            }
          } catch {
            navigate(`/donor/create-donation?anonymous=true`);
          }
        } else {
          navigate(`/donor/create-donation?anonymous=true`);
        }
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    if (scanning) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scanning, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 max-w-md mx-auto space-y-4">
        <Card className="p-4">
          <div className="relative w-full rounded-xl overflow-hidden">
            <video ref={videoRef} className="w-full" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </Card>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate("/feed")}>Feed</Button>
          <Button onClick={() => navigate("/donor/create-donation?anonymous=true")}>Open Form</Button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;