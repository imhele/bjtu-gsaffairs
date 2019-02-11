import React from 'react';
import styles from './index.less';
import { strOrReg } from './utils';
import { Button, Popover } from 'antd';
import { AbstractTooltipProps } from 'antd/es/tooltip';

export interface NoviceTutorialElementProps<T extends string> extends AbstractTooltipProps {
  closeText?: React.ReactNode;
  content?: React.ReactNode;
  id: T;
  space?: {
    x?: number;
    y?: number;
  };
  title?: React.ReactNode;
  triggerCondition?: {
    className?: string | RegExp;
    eventType?: string | RegExp;
    pathname?: string | RegExp;
    queue?: boolean;
    wait?: number;
  };
}

export interface NoviceTutorialProps<T extends string, E extends React.BaseSyntheticEvent> {
  closeText?: React.ReactNode;
  defaultValue?: { [key in T]?: [boolean, E?] };
  element?: NoviceTutorialElementProps<T>[];
  getContext?: (context: React.Context<{ [key in T]?: [boolean, E?] }>) => void;
  getTrigger?: (trigger: (event: E) => [boolean, E]) => void;
  onTrigger?: (
    contextValue: { [key in T]?: [boolean, E?] },
    filteredElement: NoviceTutorialElementProps<T>[],
    event: E,
    setContext: (updateValue: { [key in T]?: [boolean, E?] }) => void,
  ) => [boolean, E];
  space?: {
    x?: number;
    y?: number;
  };
  storage?: Storage;
}

interface NoviceTutorialState<T extends string, E extends React.BaseSyntheticEvent> {
  contextVaule?: { [key in T]?: [boolean, E?] };
}

export default class NoviceTutorial<
  T extends string,
  E extends React.BaseSyntheticEvent
> extends React.Component<NoviceTutorialProps<T, E>, NoviceTutorialState<T, E>> {
  static defaultProps = {
    defaultValue: {},
    element: [],
    space: {},
    storage: localStorage,
  };

  public enable: boolean = false;
  public Context: React.Context<{ [key in T]?: [boolean, E?] }>;
  public NTQueue: { [key in T]?: [number, E][] } = {};
  public state: NoviceTutorialState<T, E> = {
    contextVaule: {},
  };

  constructor(props: NoviceTutorialProps<T, E>) {
    super(props);
    this.state.contextVaule = props.defaultValue || this.state.contextVaule;
    this.Context = React.createContext<{ [key in T]?: [boolean, E?] }>(props.defaultValue);
    if (props.getContext) props.getContext(this.Context);
    if (props.getTrigger) props.getTrigger(this.trigger);
  }

  componentDidMount = () => {
    const { element } = this.props;
    this.enable = element.some(ele => (localStorage.getItem(ele.id) ? false : true));
  };

  componentDidUpdate = () => {
    const now = Date.now();
    Object.keys(this.NTQueue).forEach((key: T) => {
      this.NTQueue[key] = this.NTQueue[key].filter(e => e[0] < now);
    });
  };

  setContext = (updateValue: { [key in T]?: [boolean, E?] }) => {
    const { contextVaule } = this.state;
    this.setState({ contextVaule: { ...contextVaule, ...updateValue } });
  };

  trigger = (event: E): [boolean, E] => {
    if (!this.enable) return;
    if (!event.target) return;
    event = { ...event };
    const { contextVaule } = this.state;
    const { element, onTrigger, storage } = this.props;
    const { className = '', dataset = {}, id } = event.target as HTMLBaseElement;
    const rest = element.filter(({ id: eleId, triggerCondition: t }) => {
      if ((contextVaule[eleId] || [])[0]) return false;
      if (!t) return eleId === id || eleId === dataset.id;
      if (t.eventType && !strOrReg(t.eventType, event.type)) return false;
      if (t.pathname && !strOrReg(t.pathname, location.pathname)) return false;
      if (t.className && !strOrReg(t.className, className)) return false;
      if (storage.getItem(eleId)) return false;
      if (t.queue) {
        if (!this.NTQueue[eleId!]) this.NTQueue[eleId!] = [];
        this.NTQueue[eleId!].push([Date.now() + (t.wait || 0), event]);
        return false;
      }
    });
    if (!rest.length) return [false, event];
    if (onTrigger) return onTrigger(this.state.contextVaule, rest, event, this.setContext);
    const updateValue: { [key in T]?: [boolean, E?] } = {};
    rest.forEach(ele => (updateValue[ele.id] = [true, event]));
    this.setContext(updateValue);
    return [true, event];
  };

  renderElemnt = (): React.ReactNode => {
    const { contextVaule } = this.state;
    const { closeText: defaultCloseText, element, space: defaultSpace } = this.props;
    return element
      .filter(ele => (contextVaule[ele.id] || [])[0])
      .map(({ closeText, content, id, space = {}, triggerCondition, ...popoverProps }) => {
        const wrappedContent = (
          <React.Fragment>
            {content}
            <Button size="small" style={{ display: 'block', marginTop: 8 }} type="primary">
              {closeText || defaultCloseText || 'Close'}
            </Button>
          </React.Fragment>
        );
        const { nativeEvent: e = {}, target: t = {} } = contextVaule[id][1];
        const spaceX = (typeof space.x === 'undefined' ? defaultSpace.x : space.x) || 8;
        const spaceY = (typeof space.y === 'undefined' ? defaultSpace.y : space.y) || 8;
        let left = (e as MouseEvent).x || (t as HTMLBaseElement).offsetLeft;
        let top = (e as MouseEvent).y || (t as HTMLBaseElement).offsetTop;
        left -= spaceX;
        top -= spaceY;
        if (popoverProps.placement) {
          if (popoverProps.placement.includes('ight'))
            left += ((t as HTMLBaseElement).offsetWidth || 0) + spaceX * 2;
          if (popoverProps.placement.includes('ottom'))
            left += ((t as HTMLBaseElement).offsetHeight || 0) + spaceY * 2;
        }
        return { content: wrappedContent, id, left, popoverProps, top };
      })
      .map(({ content, id, left, top, popoverProps }) => (
        <Popover {...popoverProps} content={content} key={id} visible>
          <div className={styles.NTPopoverTarget} key={id} style={{ left, top }} />
        </Popover>
      ));
  };

  render() {
    const { children } = this.props;
    return (
      <this.Context.Provider value={this.state.contextVaule}>
        {this.renderElemnt()}
        {children}
      </this.Context.Provider>
    );
  }
}
