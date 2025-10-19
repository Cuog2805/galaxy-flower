import React, { useRef, useState } from 'react';
import TextDisplay from './TextDisplay';
import FlowersDisplay from './FlowersDisplay';

const LilyGalaxy = () => {
  const [clicked, setClicked] = useState(false);
  const containerRef = useRef(null);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);

    // Scroll xuống từ từ
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const containerStyle = {
    width: '100%',
    height: '100vh',
    backgroundColor: 'black',
    overflowY: 'scroll',
    overflowX: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const sectionStyle = {
    width: '100%',
    height: '100vh',
  };

  return (
    <>
      <style>{`
        .lily-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div
        ref={containerRef}
        onClick={handleClick}
        className="lily-container"
        style={containerStyle}
      >
        <div style={sectionStyle}>
          <TextDisplay />
        </div>

        <div style={sectionStyle}>
          <FlowersDisplay />
        </div>
      </div>
    </>
  );
};

export default LilyGalaxy;