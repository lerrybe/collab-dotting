import React, { createContext, useContext } from 'react';

type DottingContextType = {
  isGridFixed: boolean;
  isGridVisible: boolean;
  isPanZoomEnable: boolean;
  setIsGridFixed: (isGridFixed: boolean) => void;
  setIsGridVisible: (isGridVisible: boolean) => void;
  setIsPanZoomEnable: (isPanZoomEnable: boolean) => void;
};

const DottingContext = createContext<DottingContextType | null>({
  isGridFixed: true,
  isGridVisible: true,
  isPanZoomEnable: true,
  setIsGridFixed: (isGridFixed: boolean) => {},
  setIsGridVisible: (isGridVisible: boolean) => {},
  setIsPanZoomEnable: (isPanZoomEnable: boolean) => {},
});

function DottingProvider({ children }: { children: React.ReactNode }) {
  const [isGridFixed, setIsGridFixed] = React.useState(false);
  const [isGridVisible, setIsGridVisible] = React.useState(true);
  const [isPanZoomEnable, setIsPanZoomEnable] = React.useState(true);

  return (
    <DottingContext.Provider
      value={{
        isGridFixed,
        isGridVisible,
        isPanZoomEnable,
        setIsGridFixed,
        setIsGridVisible,
        setIsPanZoomEnable,
      }}
    >
      {children}
    </DottingContext.Provider>
  );
}

export const useDottingContext = () => useContext(DottingContext);

export default DottingProvider;
