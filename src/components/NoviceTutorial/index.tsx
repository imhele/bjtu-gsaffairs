import styles from './index.less';
import { strOrReg } from './utils';
import { Button, Popover } from 'antd';
import React, { BaseSyntheticEvent } from 'react';
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

export type NoviceTutorialValues<T extends string, E extends BaseSyntheticEvent> = {
  [key in T]?: [boolean, E?]
};

export interface NoviceTutorialMethods<T extends string, E extends BaseSyntheticEvent> {
  getNTQueues?: () => { [key in T]?: [number, E][] };
  getNTValues?: () => NoviceTutorialValues<T, E>;
  getTrigger?: () => (event: E) => [boolean, E];
}

export interface NoviceTutorialContext<T extends string, E extends BaseSyntheticEvent> {
  methods?: NoviceTutorialMethods<T, E>;
  values?: NoviceTutorialValues<T, E>;
}

export interface NoviceTutorialProps<T extends string, E extends BaseSyntheticEvent> {
  closeText?: React.ReactNode;
  defaultValues?: NoviceTutorialValues<T, E>;
  element?: NoviceTutorialElementProps<T>[];
  getContext?: (context: React.Context<NoviceTutorialContext<T, E>>) => void;
  getMethods?: (methods: NoviceTutorialMethods<T, E>) => void;
  onTrigger?: (
    NTValues: NoviceTutorialValues<T, E>,
    filteredElement: NoviceTutorialElementProps<T>[],
    event: E,
    setNTValues: (updateValue: NoviceTutorialValues<T, E>) => void,
  ) => [boolean, E];
  space?: {
    x?: number;
    y?: number;
  };
  storage?: Storage;
}

interface NoviceTutorialState<T extends string, E extends BaseSyntheticEvent> {
  NTVaules?: { [key in T]?: [boolean, E?] };
}

export default class NoviceTutorial<
  T extends string,
  E extends BaseSyntheticEvent
> extends React.Component<NoviceTutorialProps<T, E>, NoviceTutorialState<T, E>> {
  static defaultProps = {
    defaultValue: {},
    element: [],
    space: {},
    storage: localStorage,
  };

  public enable: boolean = false;
  public Context: React.Context<NoviceTutorialContext<T, E>>;
  public NTQueues: { [key in T]?: [number, E][] } = {};
  public state: NoviceTutorialState<T, E> = {
    NTVaules: {},
  };
  public NTMethods: NoviceTutorialMethods<T, E> = {
    getNTQueues: () => this.NTQueues,
    getNTValues: () => this.state.NTVaules,
    getTrigger: () => this.trigger,
  };

  constructor(props: NoviceTutorialProps<T, E>) {
    super(props);
    this.state.NTVaules = props.defaultValues || this.state.NTVaules;
    this.Context = React.createContext<NoviceTutorialContext<T, E>>({
      methods: this.NTMethods,
      values: this.state.NTVaules,
    });
    if (props.getMethods) props.getMethods(this.NTMethods);
  }

  componentDidMount = () => {
    const { element } = this.props;
    this.enable = element.some(ele => (localStorage.getItem(ele.id) ? false : true));
  };

  componentDidUpdate = () => {
    const now = Date.now();
    Object.keys(this.NTQueues).forEach((key: T) => {
      this.NTQueues[key] = this.NTQueues[key].filter(e => e[0] < now);
    });
  };

  setNTValues = (updateValues: { [key in T]?: [boolean, E?] }) => {
    const { NTVaules } = this.state;
    this.setState({ NTVaules: { ...NTVaules, ...updateValues } });
  };

  trigger = (event: E): [boolean, E] => {
    // If the novice tutorial has been read, turn off event handler.
    if (!this.enable) return;
    // Depends on target.
    if (!event.target) return;
    // Recreate event object to prevent reference invalidation.
    event = { ...event };
    // Initialize variables.
    const { NTVaules } = this.state;
    const { element, onTrigger, storage } = this.props;
    const { className = '', dataset = {}, id } = event.target as HTMLBaseElement;
    // Filter out elements that do not meet the screening criteria.
    const rest = element.filter(({ id: eleId, triggerCondition: t }) => {
      if (!eleId || (NTVaules[eleId] || [])[0]) return false;
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
        this.NTQueues[eleId!].push([Date.now() + (t.wait || 0), event]);
        return false;
      }
    });
    if (!rest.length) return [false, event];
    if (onTrigger) return onTrigger(this.state.NTVaules, rest, event, this.setNTValues);
    const updateValues: { [key in T]?: [boolean, E?] } = {};
    rest.forEach(ele => (updateValues[ele.id] = [true, event]));
    this.setNTValues(updateValues);
    return [true, event];
  };

  renderElemnt = (): React.ReactNode => {
    const { NTVaules } = this.state;
    const { closeText: defaultCloseText, element, space: defaultSpace } = this.props;
    return element
      .filter(ele => (NTVaules[ele.id] || [])[0])
      .map(({ closeText, content, id, space = {}, triggerCondition, ...popoverProps }) => {
        const wrappedContent = (
          <React.Fragment>
            {content}
            <Button size="small" style={{ display: 'block', marginTop: 8 }} type="primary">
              {closeText || defaultCloseText || 'Close'}
            </Button>
          </React.Fragment>
        );
        const { nativeEvent: e = {}, target: t = {} } = NTVaules[id][1];
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
    const { NTVaules } = this.state;
    const { children } = this.props;
    return (
      <this.Context.Provider value={{ methods: this.NTMethods, values: NTVaules }}>
        {this.renderElemnt()}
        {children}
      </this.Context.Provider>
    );
  }
}
