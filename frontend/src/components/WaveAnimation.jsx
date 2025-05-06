const WaveAnimation = () => {
    return (
      <>
        <style>
          {`
            @keyframes wave {
              0%, 100% { height: 8px; }
              50% { height: 16px; }
            }
          `}
        </style>
        <div className="flex items-center gap-1 h-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-white rounded-full"
              style={{
                height: '16px',
                animation: `wave 1s ease-in-out infinite ${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </>
    );
  };
  
  export default WaveAnimation;