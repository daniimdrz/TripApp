import React from 'react';

interface TabBarProps {
  tabs: string[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeIndex, setActiveIndex }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveIndex(index)}
            className={`flex flex-col items-center ${
              index === activeIndex ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <span>{tab}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar; 