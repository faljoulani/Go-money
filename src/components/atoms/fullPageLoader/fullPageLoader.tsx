import React from 'react';

const FullPageLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
    <div className="flex flex-col items-center">
      <LoaderIcon />
    </div>
  </div>
);

export default FullPageLoader;


export function LoaderIcon() {
  return (
    <span className="mt-4 text-white text-lg font-semibold">
      <span className="inline-block">
        <span
          className="animate-bounce"
          style={{ animationDelay: '0ms', display: 'inline-block' }}
        >
          .
        </span>
        <span
          className="animate-bounce"
          style={{ animationDelay: '200ms', display: 'inline-block' }}
        >
          .
        </span>
        <span
          className="animate-bounce"
          style={{ animationDelay: '400ms', display: 'inline-block' }}
        >
          .
        </span>
      </span>
    </span>
  );
}
