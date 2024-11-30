import React, { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";

// ... 其他 interface 定義保持不變 ...

export default function Home() {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ... 保留原有的 useEffect 和 fetchVocabulary ...

  // 開啟相機
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // 使用後置相機
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // 拍照
  const captureImage = async () => {
    if (!videoRef.current) return;

    // 創建 canvas 來擷取影像
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 在 canvas 上繪製影像
    ctx.drawImage(videoRef.current, 0, 0);

    // 將 canvas 內容轉換為檔案
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setIsLoading(true);
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/detect`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        setDetectedObjects(data);
        setShowCamera(false); // 拍照後關閉相機
      } catch (error) {
        console.error("Error detecting objects:", error);
      } finally {
        setIsLoading(false);
      }
    }, "image/jpeg");
  };

  // 停止相機
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題區域 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6">客語學習尋寶</h1>
          <div className="flex justify-center">
            {!showCamera ? (
              <button
                onClick={startCamera}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                開始尋寶
              </button>
            ) : (
              <div className="flex flex-col items-center w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-lg rounded-lg mb-4"
                />
                <div className="flex gap-4">
                  <button
                    onClick={captureImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    拍照
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 其他區域（偵測結果和詞彙表）保持不變 */}
        {/* ... */}
      </div>
    </main>
  );
}
