import { useEffect, useMemo } from 'react';
import { useViewport } from '../utils/responsive';
import {
  generateKeyMap,
  setKeyMap,
  MOBILE_KEY_RANGE,
  DESKTOP_KEY_RANGE,
  type KeyMap,
  type PianoKeyRange,
} from '../utils/pianoKeyboard';

export interface ResponsivePianoKeysResult {
  keyMap: KeyMap;
  keyRange: PianoKeyRange;
  whiteKeyCount: number;
  startOctave: number;
}

export function useResponsivePianoKeys(): ResponsivePianoKeysResult {
  const { isMobile, width } = useViewport();
  
  const keyRange = useMemo(() => {
    return isMobile ? MOBILE_KEY_RANGE : DESKTOP_KEY_RANGE;
  }, [isMobile]);
  
  const keyMap = useMemo(() => {
    return generateKeyMap(keyRange);
  }, [keyRange]);
  
  useEffect(() => {
    setKeyMap(keyMap);
  }, [keyMap]);
  
  return {
    keyMap,
    keyRange,
    whiteKeyCount: keyRange.whiteKeyCount,
    startOctave: keyRange.startOctave,
  };
}
