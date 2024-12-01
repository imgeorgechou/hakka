import React, { useState } from "react";
import Image from "next/image";
import { Camera, Book, Play } from "lucide-react";

// 定義物品介面
interface Item {
  name: string;
  hakkaChinese: string;
  hakkaPhonetics: string;
  english: string;
  audioUrl?: string;
}

// 首頁組件
const HomeScreen: React.FC = () => {
  const [collectedItems, setCollectedItems] = useState<Item[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // 處理新增物品
  const handleAddItem = (item: Item) => {
    setCollectedItems([...collectedItems, item]);
  };

  // 處理播放語音
  const handlePlayAudio = (audioUrl: string) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    const newAudioPlayer = new Audio(audioUrl);
    newAudioPlayer.play();
    setAudioPlayer(newAudioPlayer);
  };

  // 顯示物品詳情
  const handleShowItemModal = (item: Item) => {
    setCurrentItem(item);
    setShowItemModal(true);
  };

  // 關閉物品詳情
  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setCurrentItem(null);
  };

  // 處理蒐集物品
  const handleCollectItem = (item: Item) => {
    handleAddItem(item);
    handleCloseItemModal();
  };

  return (
    <div className="bg-gradient-to-br from-green-100 to-blue-100 min-h-screen p-4 sm:p-6 md:p-8">
      {/* 首頁頂部區域 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">客語學習尋寶</h1>
          <button className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
            <Camera size={24} />
          </button>
        </div>
      </div>

      {/* 待蒐集字卡 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">待蒐集字卡</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* 示例物品 */}
          <div
            className="bg-white rounded-lg shadow-md p-3 sm:p-4 text-center transform transition hover:scale-105 cursor-pointer"
            onClick={() =>
              handleShowItemModal({
                name: "桌子",
                hakkaChinese: "桌子",
                hakkaPhonetics: "Teok",
                english: "Table",
                audioUrl: "/audio/table.mp3",
              })
            }
          >
            <h3 className="font-semibold text-sm sm:text-base">桌子</h3>
            <p className="text-xs sm:text-sm text-gray-500">Teok</p>
          </div>
          {/* 更多示例物品 */}
        </div>
      </div>

      {/* 已蒐集字卡 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">已蒐集字卡</h2>
        <div className="space-y-4">
          {collectedItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-md flex items-center transform transition hover:scale-105"
            >
              {/* 圖片 - 最左側 */}
              <div className="mr-4 relative w-20 h-20">
                <Image
                  src="/images/placeholder.png"
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>

              {/* 文字 - 圖片右側 */}
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.hakkaChinese}</p>
                <p className="text-xs text-gray-400">{item.hakkaPhonetics}</p>
                <p className="text-xs text-gray-400">{item.english}</p>
              </div>

              {/* 播放按鈕 - 最右側 */}
              {item.audioUrl && (
                <button
                  onClick={() => handlePlayAudio(item.audioUrl!)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full ml-4"
                >
                  <Play size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 物品詳情對話框 */}
      {showItemModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4 relative w-full h-48">
              <Image
                src="/images/placeholder.png"
                alt={currentItem.name}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">{currentItem.name}</h3>
            <p className="text-gray-600 mb-2">{currentItem.hakkaChinese}</p>
            <p className="text-gray-400 text-sm mb-4">
              {currentItem.hakkaPhonetics}
            </p>
            <p className="text-gray-400 text-sm mb-4">{currentItem.english}</p>
            {currentItem.audioUrl && (
              <button
                onClick={() => handlePlayAudio(currentItem.audioUrl!)}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full mb-4"
              >
                <Play size={20} />
              </button>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleCloseItemModal}
                className="mr-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={() => handleCollectItem(currentItem)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                蒐集
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
