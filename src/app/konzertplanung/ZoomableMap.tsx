import React, { useRef, useState } from "react";

type ZoomableMapProps = {
  onClick?: (e: React.MouseEvent) => void;
  draggingPin?: boolean;
  children: (props: {
    scale: number;
    translateX: number;
    translateY: number;
    onWheel: (e: React.WheelEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    setTooltip: (text: string | null) => void;
    tooltip: string | null;
  }) => React.ReactNode;
};

export const ZoomableMap: React.FC<ZoomableMapProps> = ({ children, onClick, draggingPin }) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    let newScale = scale - e.deltaY * 0.001;
    newScale = Math.max(0.5, Math.min(3, newScale));
    setScale(newScale);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!draggingPin) {
      setDrag({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (drag && !draggingPin) {
      setTranslate({ x: e.clientX - drag.x, y: e.clientY - drag.y });
    }
  };

  const onMouseUp = () => {
    setDrag(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none"
      style={{ cursor: drag ? 'grabbing' : 'grab' }}
      onClick={onClick}
    >
      {children({
        scale,
        translateX: translate.x,
        translateY: translate.y,
        onWheel,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        setTooltip,
        tooltip,
      })}
    </div>
  );
}; 