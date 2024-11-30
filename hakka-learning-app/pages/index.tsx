import React, { useState, useEffect } from "react";
import { Camera } from "lucide-react";

// 定義資料型別
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

  // 當頁面載入時獲取詞彙表
  useEffect(() => {
    fetchVocabulary();
  }, []);

  // 獲取詞彙表的函數
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

  // 處理圖片上傳
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
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題和上傳按鈕 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6">客語學習尋寶</h1>
          <div className="flex justify-center">
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Camera className="w-5 h-5" />
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
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">發現的物品</h2>
            <div className="grid grid-cols-2 gap-4">
              {detectedObjects.map((obj, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold">{obj.hakka}</h3>
                  <p className="text-gray-600">{obj.pronunciation}</p>
                  <p className="text-gray-500">{obj.english}</p>
                  <p className="text-sm text-gray-400">
                    信心度: {(obj.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 單字卡區域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">教室主題單字卡</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vocabulary.map((word) => (
              <div
                key={word.id}
                className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold">{word.hakka}</h3>
                <p className="text-gray-600">{word.pronunciation}</p>
                <p className="text-gray-500">{word.english}</p>
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
          <div className="bg-white p-4 rounded-lg">
            <p>正在辨識物品...</p>
          </div>
        </div>
      )}
    </main>
  );
}
