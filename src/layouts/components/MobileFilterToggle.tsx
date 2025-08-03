"use client";

import { useState } from "react";
import { BsFilter } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

interface MobileFilterToggleProps {
  children: React.ReactNode;
}

const MobileFilterToggle = ({ children }: MobileFilterToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Mobile Filter Button */}
      <div className="mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          <BsFilter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-darkmode-body shadow-lg overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-darkmode-light rounded-full"
                >
                  <IoClose size={24} />
                </button>
              </div>
              <div className="pb-4">{children}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileFilterToggle;
