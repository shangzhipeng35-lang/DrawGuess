'use client';

import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  onComplete: (imageData: string) => void;
}

export default function DrawingCanvas({ onComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 400 });

  // 计算合适的画布大小
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = Math.min(500, window.innerWidth - 40); // 减去padding
      const maxHeight = Math.min(400, window.innerHeight * 0.5); // 最大占屏幕高度的50%
      setCanvasSize({ 
        width: maxWidth, 
        height: Math.min(maxHeight, maxWidth * 0.8) // 保持比例
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [canvasSize]);

  // 获取触摸或鼠标位置的通用函数
  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    if ('touches' in e) {
      // 触屏事件
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // 鼠标事件
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // 防止页面滚动
    setIsDrawing(true);
    const pos = getEventPos(e);
    setLastPos(pos);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault(); // 防止页面滚动

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const currentPos = getEventPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    setLastPos(currentPos);
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const submitDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    onComplete(imageData);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white max-w-full touch-none"
        style={{ touchAction: 'none' }}
        // 鼠标事件
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        // 触屏事件
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={clearCanvas}
          className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors font-medium text-lg"
        >
          清除画布
        </button>
        <button
          onClick={submitDrawing}
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium text-lg"
        >
          提交画作
        </button>
      </div>
      
      <p className="text-sm text-gray-600 text-center px-4">
        用手指或鼠标在画布上绘制你想要AI猜测的物品
      </p>
    </div>
  );
}