import debounce from 'debounce';
import ReactDOM from 'react-dom';
import styles from './index.less';
import { Button, Popover } from 'antd';
import { formatCSSUnit, strOrReg } from './utils';
import { AbstractTooltipProps } from 'antd/es/tooltip';
import React, { BaseSyntheticEvent, Component, ComponentClass, ReactNode } from 'react';

export interface NoviceTutorialElementProps<T extends string> extends AbstractTooltipProps {
  closeText?: ReactNode;
  content?: ReactNode | (() => ReactNode);
  hideOnUIEvent?: boolean;
  id: T;
  space?: {
    x?: number | string;
    y?: number | string;
  };
  targetPosition?: false | string;
  title?: ReactNode;
  triggerCondition?: {
    className?: string | RegExp;
    eventType?: string | RegExp;
    pathname?: string | RegExp;
    queue?: boolean;
    wait?: number;
  };
}

export type NoviceTutorialValues<T extends string, E extends BaseSyntheticEvent> = {
  [key in T]?: [number, E] | false
};

export interface NoviceTutorialMethods<T extends string, E extends BaseSyntheticEvent> {
  getNTQueues?: () => { [key in T]?: [number, E][] };
  getNTQueuesById?: (id: T) => [number, E][];
  getNTValues?: () => NoviceTutorialValues<T, E>;
  getTrigger?: () => (event: E) => [number, E] | false;
  setNTValues?: (updateValue: NoviceTutorialValues<T, E>) => void;
}

export interface NoviceTutorialContext<T extends string, E extends BaseSyntheticEvent> {
  methods?: NoviceTutorialMethods<T, E>;
  props?: NoviceTutorialProps<T, E>;
  values?: NoviceTutorialValues<T, E>;
}

export interface NoviceTutorialProps<T extends string, E extends BaseSyntheticEvent> {
  closeText?: ReactNode;
  defaultValues?: NoviceTutorialValues<T, E>;
  element?: NoviceTutorialElementProps<T>[];
  getContext?: (context: React.Context<NoviceTutorialContext<T, E>>) => void;
  getMethods?: (methods: NoviceTutorialMethods<T, E>) => void;
  onTrigger?: (
    NTValues: NoviceTutorialValues<T, E>,
    filteredElement: NoviceTutorialElementProps<T>[],
    event: E,
    setNTValues: (updateValue: NoviceTutorialValues<T, E>) => void,
  ) => [number, E] | false;
  space?: {
    x?: number | string;
    y?: number | string;
  };
  storage?: Storage;
  title?: ReactNode;
}

interface NoviceTutorialState<T extends string, E extends BaseSyntheticEvent> {
  NTValues?: NoviceTutorialValues<T, E>;
}

const noop = () => null;

export const InvalidTagName = ['input'];

export const NTContext = React.createContext<NoviceTutorialContext<any, any>>({
  methods: {
    getNTQueues: noop,
    getNTQueuesById: noop,
    getNTValues: noop,
    getTrigger: noop,
    setNTValues: noop,
  },
  props: {},
  values: {},
});

export const NoviceTutorialWrapper = <P, S>(
  Wrapped: ComponentClass<P, S> | React.SFC<P>,
): React.SFC<P> => {
  return (props: P) => (
    <NTContext.Consumer>{context => <Wrapped {...props} context={context} />}</NTContext.Consumer>
  );
};

const formatNTElementProps = <T extends string>(
  {
    closeText,
    content,
    id,
    space = {},
    targetPosition,
    triggerCondition,
    ...popoverProps
  }: NoviceTutorialElementProps<T>,
  defaultCloseText: ReactNode,
  defaultTitle: ReactNode,
) => {
  popoverProps.title = popoverProps.title || defaultTitle;
  const wrappedContent = (
    <React.Fragment>
      {typeof content === 'function' ? content() : content}
      <Button size="small" style={{ display: 'block', marginTop: 16 }} type="primary">
        {closeText || defaultCloseText || 'Close'}
      </Button>
    </React.Fragment>
  );
  return { content: wrappedContent, id, popoverProps, space, targetPosition };
};

export const NoviceTutorialElement = <T extends string>(
  props: NoviceTutorialElementProps<T> & { children?: ReactNode },
) => (
  <NTContext.Consumer>
    {context => {
      const { closeText, title } = context.props;
      const { content, id, popoverProps } = formatNTElementProps<T>(props, closeText, title);
      return (
        <Popover
          {...popoverProps}
          content={content}
          key={id}
          visible={context.values[id] && context.values[id][0] ? true : false}
        >
          {props.children}
        </Popover>
      );
    }}
  </NTContext.Consumer>
);

export default class NoviceTutorial<
  T extends string,
  E extends BaseSyntheticEvent
> extends Component<NoviceTutorialProps<T, E>, NoviceTutorialState<T, E>> {
  static defaultProps = {
    defaultValue: {},
    element: [],
    space: {},
    storage: localStorage,
  };

  public enable: boolean = false;
  public Context: React.Context<NoviceTutorialContext<T, E>> = NTContext;
  public NTQueues: { [key in T]?: [number, E][] } = {};
  public state: NoviceTutorialState<T, E> = {
    NTValues: {},
  };
  public NTMethods: NoviceTutorialMethods<T, E> = {
    getNTQueues: () => this.NTQueues,
    getNTQueuesById: id => this.NTQueues[id],
    getNTValues: () => this.state.NTValues,
    getTrigger: () => this.trigger,
    setNTValues: (updateValues: NoviceTutorialValues<T, E>) => {
      const { NTValues } = this.state;
      this.setState({ NTValues: { ...NTValues, ...updateValues } });
    },
  };

  onUIEvent = debounce(() => {
    const now = Date.now() - 100;
    const updateValues: NoviceTutorialValues<T, E> = {};
    const { NTValues } = this.state;
    const { element, storage } = this.props;
    element.forEach(ele => {
      if (!ele.hideOnUIEvent) return;
      if (!NTValues[ele.id]) return;
      if (NTValues[ele.id][0] > now) return;
      if (NTValues[ele.id][0] === 0) updateValues[ele.id] = false;
      else updateValues[ele.id] = [0, NTValues[ele.id][1]];
      storage.setItem(ele.id, `${now}`);
    });
    if (!Object.keys(updateValues).length) return;
    this.NTMethods.setNTValues(updateValues);
  }, 50);

  constructor(props: NoviceTutorialProps<T, E>) {
    super(props);
    this.state.NTValues = props.defaultValues || this.state.NTValues;
    this.Context = React.createContext<NoviceTutorialContext<T, E>>({
      methods: this.NTMethods,
      props,
      values: this.state.NTValues,
    });
    if (props.getMethods) props.getMethods(this.NTMethods);
    window.addEventListener('resize', this.onUIEvent);
    window.addEventListener('click', this.onUIEvent);
  }

  componentDidMount = () => {
    const { element, storage } = this.props;
    this.enable = element.some(ele => (storage.getItem(ele.id) ? false : true));
  };

  componentDidUpdate = () => {
    const now = Date.now();
    Object.keys(this.NTQueues).forEach((key: T) => {
      this.NTQueues[key] = this.NTQueues[key]
        .filter(e => e[0] > now || !e[0])
        .map(e => [1, e[1]] as [number, E]);
    });
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onUIEvent);
    window.removeEventListener('click', this.onUIEvent);
  };

  trigger = (event: E): [number, E] | false => {
    // If the novice tutorial has been read, turn off event handler.
    if (!this.enable) return;
    // Depends on target.
    if (!event.target) return;
    // Recreate event object to prevent reference invalidation.
    event = { ...event };
    // Initialize variables.
    const now = Date.now();
    const { NTValues } = this.state;
    const { element, onTrigger, storage } = this.props;
    const { className = '', dataset = {}, id } = event.target as HTMLBaseElement;
    // Filter out elements that do not meet the screening criteria.
    const rest = element.filter(({ id: eleId, triggerCondition: t }) => {
      if (!eleId || NTValues[eleId]) return false;
      // Without extra conditions.
      if (!t) return eleId === id || eleId === dataset.id;
      // If there is no id, it will enter other screening links.
      if (id && eleId !== id && eleId !== dataset.id) return false;
      if (t.eventType && !strOrReg(t.eventType, event.type)) return false;
      if (t.pathname && !strOrReg(t.pathname, location.pathname)) return false;
      if (t.className && !strOrReg(t.className, className)) return false;
      if (storage.getItem(eleId)) return false;
      // When active triggering is turned on, events will be queued.
      if (t.queue) {
        if (!this.NTQueues[eleId!]) this.NTQueues[eleId!] = [];
        this.NTQueues[eleId!].push([now + (t.wait || 0), event]);
        return false;
      }
    });
    if (!rest.length) return false;
    if (onTrigger) return onTrigger(NTValues, rest, event, this.NTMethods.setNTValues);
    const updateValues: { [key in T]?: [number, E] } = {};
    rest.forEach(ele => (updateValues[ele.id] = [now, event]));
    this.NTMethods.setNTValues(updateValues);
    return [now, event];
  };

  renderElemnt = () => {
    const { NTValues } = this.state;
    const { closeText, element, space: defaultSpace, title } = this.props;
    return element
      .filter(ele => NTValues[ele.id])
      .map(ele => formatNTElementProps(ele, closeText, title))
      .map(({ content, id, popoverProps, space, targetPosition }) => {
        let { target } = NTValues[id][1] as { target: HTMLElement };
        while (!target.tagName || InvalidTagName.includes(target.tagName.toLowerCase())) {
          if (!target.parentElement) break;
          target = target.parentElement;
        }
        if (targetPosition !== false)
          target.style.position = target.style.position || targetPosition || 'relative';
        let popoverTarget: HTMLDivElement;
        if (target.children.length)
          popoverTarget = Array.from(target.children).find(child => {
            return child.id === `POPOVER-${id}`;
          }) as HTMLDivElement;
        if (!popoverTarget) {
          const spaceX = formatCSSUnit(space.x, defaultSpace.x, 8);
          const spaceY = formatCSSUnit(space.y, defaultSpace.y, 8);
          popoverTarget = document.createElement('div');
          popoverTarget.id = `POPOVER-${id}`;
          popoverTarget.className = styles.NTPopoverTarget;
          popoverTarget.style.width = `calc(${target.offsetWidth || '100%'}${spaceX})`;
          popoverTarget.style.height = `calc(${target.offsetHeight || '100%'}${spaceY})`;
          target.appendChild(popoverTarget);
        }
        return ReactDOM.createPortal(
          <Popover
            {...popoverProps}
            content={content}
            key={id}
            visible={NTValues[id][0] ? true : false}
          >
            <div className={styles.NTPopoverChild} />
          </Popover>,
          popoverTarget,
        );
        // return;
        // let left = (t as HTMLBaseElement).offsetLeft || (e as MouseEvent).clientX;
        // let top = (t as HTMLBaseElement).offsetTop || (e as MouseEvent).clientY;
        // left -= spaceX;
        // top -= spaceY;
        // if (popoverProps.placement) {
        //   if (popoverProps.placement.includes('ight'))
        //     left += ((t as HTMLBaseElement).offsetWidth || 0) + spaceX * 2;
        //   if (popoverProps.placement.includes('ottom'))
        //     left += ((t as HTMLBaseElement).offsetHeight || 0) + spaceY * 2;
        // }
        // return (
        //   <Popover
        //     {...popoverProps}
        //     content={content}
        //     key={id}
        //     visible={NTValues[id][0] ? true : false}
        //   >
        //     <div className={styles.NTPopoverTarget} key={id} style={{ left, top }} />
        //   </Popover>
        // );
      });
  };

  render() {
    const { NTValues } = this.state;
    const { children } = this.props;
    return (
      <NTContext.Provider value={{ methods: this.NTMethods, props: this.props, values: NTValues }}>
        {this.renderElemnt()}
        {children}
      </NTContext.Provider>
    );
  }
}
