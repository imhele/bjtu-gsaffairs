import format from './format';
import {
  CSSProperties,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface UseMediaProps {
  defaultMatches?: boolean;
  query?: string | CSSProperties | CSSProperties[];
  onChange?: (matches: boolean) => void | boolean;
  targetWindow?: Window;
}

export type SetUseMediaProps = Dispatch<SetStateAction<UseMediaProps>>;

const createMatchMedia = (props: UseMediaProps = {}, ref: MutableRefObject<MediaQueryList>) => {
  const { query = '', targetWindow = window } = props;
  if (typeof targetWindow !== 'object') {
    // tslint:disable-next-line
    console.warn(`[UseMedia] Invalid \`targetWindow\``);
  } else if (typeof targetWindow.matchMedia !== 'function') {
    // tslint:disable-next-line
    console.warn(`[UseMedia] Current \`targetWindow\` doesn't support \`matchMedia\` API.`);
  } else {
    ref.current = targetWindow.matchMedia(format(query));
  }
};

const usePrevMQListRef = <T>(value: T): T => {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default (initialProps: UseMediaProps = {}): [boolean, SetUseMediaProps] => {
  const pausedRef = useRef<boolean>(true);
  const setPropsRef = useRef<SetUseMediaProps>(null);
  const useMediaPropsRef = useRef<UseMediaProps>(null);
  const mediaQueryListRef = useRef<MediaQueryList>(null);
  useState(() => {
    createMatchMedia(initialProps, mediaQueryListRef);
    useMediaPropsRef.current = { ...initialProps };
    useMediaPropsRef.current.defaultMatches = mediaQueryListRef.current.matches;
    setPropsRef.current = (nextProps = {}) => {
      if (typeof nextProps === 'function')
        useMediaPropsRef.current = nextProps(useMediaPropsRef.current);
      else useMediaPropsRef.current = nextProps;
      createMatchMedia(useMediaPropsRef.current, mediaQueryListRef);
      setMatches(mediaQueryListRef.current.matches);
    };
  });
  const prevMQListRef = usePrevMQListRef(mediaQueryListRef.current);
  const [matches, setMatches] = useState(useMediaPropsRef.current.defaultMatches);
  const eventListener = () => {
    if (pausedRef.current) return;
    if (useMediaPropsRef.current.onChange) {
      if (useMediaPropsRef.current.onChange(mediaQueryListRef.current.matches)) return;
    }
    setMatches(mediaQueryListRef.current.matches);
  };
  useEffect(() => {
    if (pausedRef.current) {
      if (prevMQListRef) prevMQListRef.removeListener(eventListener);
      pausedRef.current = false;
      mediaQueryListRef.current.addListener(eventListener);
    }
    return () => {
      pausedRef.current = true;
      mediaQueryListRef.current.removeListener(eventListener);
    };
  }, [mediaQueryListRef.current]);
  return [matches, setPropsRef.current];
};
