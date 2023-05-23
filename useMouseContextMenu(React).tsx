import React, { useState, useRef, useEffect, useCallback } from 'react';

export const useMouseContextMenu = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setPosition({ x: event.clientX, y: event.clientY });
      setVisible(true);
    },
    [setPosition, setVisible]
  );

  const handleClick = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  useEffect(() => {
    const element = ref.current;
    element?.addEventListener('contextmenu', handleContextMenu);
    element?.addEventListener('click', handleClick);

    return () => {
      element?.removeEventListener('contextmenu', handleContextMenu);
      element?.removeEventListener('click', handleClick);
    };
  }, [handleClick, handleContextMenu]);

  return { ref, visible, position };
};
