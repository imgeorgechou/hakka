import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Book, Play } from "lucide-react";

interface Item {
  name: string;
  hakkaChinese: string;
  hakkaPhonetics: string;
  english: string;
  audioUrl?: string;
}

interface DetectedObject {
  english: string;
  hakka: string;
  pronunciation: string;
  confidence: number;
}

const HomeScreen: React.FC = () => {
  const [collectedItems, setCollectedItems] = useState<Item[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 處理相機功能
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
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

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

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
        const data: DetectedObject[] = await response.json();

        // 將偵測到的物件轉換為 Item 格式並加入收集清單
        const newItems = data.map((obj) => ({
          name: obj.hakka,
          hakkaChinese: obj.hakka,
          hakkaPhonetics: obj.pronunciation,
          english: obj.english,
        }));

        setCollectedItems((prev) => [...prev, ...newItems]);
        setShowCamera(false);
      } catch (error) {
        console.error("Error detecting objects:", error);
      } finally {
        setIsLoading(false);
      }
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  // ... 其他原有的函數保持不變 ...

  return (
    <div className="bg-gradient-to-br from-green-100 to-blue-100 min-h-screen p-4 sm:p-6 md:p-8">
      {/* 首頁頂部區域 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">客語學習尋寶</h1>
          <button
            onClick={startCamera}
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
          >
            <Camera size={24} />
          </button>
        </div>
      </div>

      {/* 相機介面 */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-10 flex gap-4">
            <button
              onClick={captureImage}
              className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600"
            >
              拍照
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 已蒐集字卡和其他原有的 UI 元素保持不變 */}
      {/* ... */}

      {/* 載入中提示 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>正在辨識物品...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
