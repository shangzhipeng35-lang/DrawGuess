'use client';

import { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import GameInterface from '@/components/GameInterface';

export default function Home() {
  const [gameState, setGameState] = useState<'drawing' | 'guessing' | 'result'>('drawing');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCanvasComplete = async (imageData: string) => {
    setCurrentImage(imageData);
    setGameState('guessing');
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const result = await response.json();
      setGuess(result.guess);
      setGameState('result');
    } catch (error) {
      console.error('分析图像失败:', error);
      setGuess('分析失败，请重试');
      setGameState('result');
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setGameState('drawing');
    setCurrentImage(null);
    setGuess('');
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800 px-4">
          Tina游戏-你画我猜
        </h1>
        
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
          {gameState === 'drawing' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-700">
                请在画布上作画
              </h2>
              <DrawingCanvas onComplete={handleCanvasComplete} />
            </div>
          )}

          {gameState === 'guessing' && (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
                AI正在分析你的画作...
              </h2>
              {currentImage && (
                <img 
                  src={currentImage} 
                  alt="你的画作" 
                  className="mx-auto mb-4 border rounded-lg max-w-sm"
                />
              )}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}

          {gameState === 'result' && (
            <GameInterface 
              image={currentImage}
              guess={guess}
              onReset={resetGame}
            />
          )}
        </div>
      </div>
    </main>
  );
}
