import React, { useState } from "react";
import Image from "next/image";
import { Camera, Play } from "lucide-react";

interface Item {
  name: string;
  hakkaChinese: string;
  hakkaPhonetics: string;
  english: string;
  imageUrl?: string;
  collected?: boolean;
}

interface DetectedObject {
  english: string;
  hakka: string;
  pronunciation: string;
  confidence: number;
}

const classroomItems: Item[] = [
  {
    name: "凳仔",
    hakkaChinese: "椅子",
    hakkaPhonetics: "den e",
    english: "chair",
    collected: false,
  },
  {
    name: "烏枋",
    hakkaChinese: "黑板",
    hakkaPhonetics: "vu piong",
    english: "blackboard",
    collected: false,
  },
  {
    name: "電腦",
    hakkaChinese: "電腦",
    hakkaPhonetics: "tien nau",
    english: "computer",
    collected: false,
  },
  {
    name: "書",
    hakkaChinese: "書",
    hakkaPhonetics: "su",
    english: "book",
    collected: false,
  },
];

const HomeScreen: React.FC = () => {
  const [collectedItems, setCollectedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const data: DetectedObject[] = await response.json();

      // 創建圖片 URL
      const imageUrl = URL.createObjectURL(file);

      // 過濾已收集的物品，只添加新物品
      const newItems = data
        .map((obj) => ({
          name: obj.hakka, // 改為客語作為主要名稱
          hakkaChinese: obj.english, // 英文對應的中文
          hakkaPhonetics: obj.pronunciation,
          english: obj.english,
          imageUrl: imageUrl,
          collected: true,
        }))
        .filter(
          (newItem) =>
            !collectedItems.some(
              (existingItem) => existingItem.name === newItem.name
            )
        );

      setCollectedItems((prev) => [...newItems, ...prev]);
    } catch (error) {
      console.error("Error detecting objects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (text: string) => {
    // 預留給語音合成功能
    console.log("Playing audio for:", text);
  };

  return (
    <div className="bg-gradient-to-br from-green-100 to-blue-100 min-h-screen p-4 sm:p-6 md:p-8">
      {/* 頂部區域 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">客語學習尋寶</h1>
          <label className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 cursor-pointer">
            <Camera size={24} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 待蒐集字卡 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          教室關卡 - 待蒐集字卡
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {classroomItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-4 shadow-md text-center ${
                item.collected ? "bg-green-50" : ""
              }`}
            >
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.hakkaPhonetics}</p>
              <p className="text-sm text-gray-600">{item.hakkaChinese}</p>
              <p className="text-xs text-gray-400">{item.english}</p>
              {item.collected && (
                <span className="text-green-500 text-sm">已收集!</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 已蒐集字卡 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">已蒐集字卡</h2>
        <div className="space-y-4">
          {collectedItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-md flex items-center"
            >
              {/* 左側圖片 */}
              {item.imageUrl && (
                <div className="mr-4 relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              )}

              {/* 右側文字內容 */}
              <div className="flex-grow">
                <h3 className="font-bold text-xl">{item.name}</h3>
                <p className="text-md text-gray-600">{item.hakkaPhonetics}</p>
                <p className="text-md text-gray-600">{item.hakkaChinese}</p>
                <p className="text-sm text-gray-400">{item.english}</p>
              </div>

              {/* 播放按鈕 */}
              <button
                onClick={() => handlePlayAudio(item.name)}
                className="ml-4 bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition-colors"
              >
                <Play size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

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
