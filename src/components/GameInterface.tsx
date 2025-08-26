'use client';

interface GameInterfaceProps {
  image: string | null;
  guess: string;
  onReset: () => void;
}

export default function GameInterface({ image, guess, onReset }: GameInterfaceProps) {
  return (
    <div className="text-center space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
        AI的猜测结果
      </h2>
      
      {image && (
        <div className="flex justify-center">
          <img 
            src={image} 
            alt="你的画作" 
            className="border-2 border-gray-300 rounded-lg max-w-full sm:max-w-sm h-auto"
          />
        </div>
      )}
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>AI猜测：</strong>
            </p>
            <p className="text-lg font-semibold text-blue-800 mt-1">
              {guess}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
        <button
          onClick={onReset}
          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors font-medium text-lg"
        >
          再玩一次
        </button>
        <button
          onClick={() => {
            if (image) {
              const link = document.createElement('a');
              link.download = 'my-drawing.png';
              link.href = image;
              link.click();
            }
          }}
          className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-colors font-medium text-lg"
        >
          下载画作
        </button>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>觉得AI猜得准确吗？再画一个试试吧！</p>
      </div>
    </div>
  );
}