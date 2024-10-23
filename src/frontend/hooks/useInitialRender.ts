import { useEffect, useRef } from "react";

const useInitialRender = (): boolean => {
  const isInitialRender = useRef(true);

  useEffect(() => {
    isInitialRender.current = false;
  }, []);

  return isInitialRender.current;
};

export { useInitialRender };
