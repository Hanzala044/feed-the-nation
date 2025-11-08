import { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  disabled?: boolean;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = <X className="w-6 h-6" />,
  rightAction = <Check className="w-6 h-6" />,
  disabled = false,
}: SwipeableCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    const threshold = 100;
    if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    const diff = e.clientX - startXRef.current;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    const threshold = 100;
    if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    setTranslateX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Left action background */}
      {onSwipeLeft && (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end px-6 bg-destructive text-destructive-foreground transition-opacity",
            translateX < -20 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.abs(Math.min(translateX, 0)) }}
        >
          {leftAction}
        </div>
      )}

      {/* Right action background */}
      {onSwipeRight && (
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start px-6 bg-success text-success-foreground transition-opacity",
            translateX > 20 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: Math.max(translateX, 0) }}
        >
          {rightAction}
        </div>
      )}

      {/* Card content */}
      <div
        ref={cardRef}
        className={cn(
          "relative transition-transform touch-pan-y",
          isDragging ? "transition-none" : "transition-transform duration-200"
        )}
        style={{
          transform: `translateX(${translateX}px)`,
          cursor: disabled ? "default" : "grab",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>
    </div>
  );
};
