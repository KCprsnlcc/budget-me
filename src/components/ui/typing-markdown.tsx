"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TypingMarkdownProps {
  content: string;
  speed?: number;
  delay?: number;
  components?: any;
  onComplete?: () => void;
}

export function TypingMarkdown({ 
  content, 
  speed = 7, 
  delay = 200, 
  components,
  onComplete 
}: TypingMarkdownProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDelayed, setIsDelayed] = useState(true);

  // Handle initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Typing effect
  useEffect(() => {
    if (isDelayed || currentIndex >= content.length) {
      if (currentIndex >= content.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedContent(content.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, content, speed, isDelayed, onComplete]);

  if (isDelayed) {
    return <div className="invisible">.</div>; // Invisible placeholder during delay
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {displayedContent}
    </ReactMarkdown>
  );
}
