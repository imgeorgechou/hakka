import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";

interface VocabularyItem {
  id: number;
  english: string;
  hakka: string;
  pronunciation: string;
  theme: string;
  found_count: number;
}

interface DetectedObject {
  english: string;
  hakka: string;
  pronunciation: string;
  confidence: number;
}

export default function Home() {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vocabulary?theme=classroom`
      );
      const data = await response.json();
      setVocabulary(data);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", file);

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
    } catch (error) {
      console.error("Error detecting objects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-500 to-green-500 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 標題和上傳按鈕 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            客語學習尋寶
          </h1>
          <div className="flex justify-center">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105">
              <Camera className="w-6 h-6" />
              開始尋寶
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 偵測結果 */}
        {detectedObjects.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">發現的物品</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detectedObjects.map((obj, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {obj.hakka}
                  </h3>
                  <p className="text-gray-600 mb-1">發音: {obj.pronunciation}</p>
                  <p className="text-gray-500 mb-1">英語: {obj.english}</p>
                  <p className="text-sm text-gray-400">
                    信心度: {(obj.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 單字卡區域 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-6">
            教室主題單字卡
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {vocabulary.map((word) => (
              <div
                key={word.id}
                className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {word.hakka}
                </h3>
                <p className="text-gray-600">發音: {word.pronunciation}</p>
                <p className="text-gray-500">英語: {word.english}</p>
                <p className="text-sm text-gray-400">
                  發現次數: {word.found_count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 載入指示器 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
            <p className="text-gray-800 text-lg font-bold">正在辨識物品...</p>
          </div>
        </div>
      )}
    </main>
  );
}

//這裡有些更新喔喔喔