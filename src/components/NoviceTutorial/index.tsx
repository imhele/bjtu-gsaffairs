import React from 'react';
import { Popover } from 'antd';
import { strOrReg } from './utils';
import { AbstractTooltipProps } from 'antd/es/tooltip';

export interface NoviceTutorialElementProps<T extends string> extends AbstractTooltipProps {
  content?: React.ReactNode;
  id: T;
  title?: React.ReactNode;
  triggerCondition: {
    className?: string | RegExp;
    eventType?: string | RegExp;
    pathname?: string | RegExp;
    queue?: boolean;
    wait?: number;
  };
}

export interface NoviceTutorialProps<T extends string, E extends React.BaseSyntheticEvent> {
  defaultValue?: { [key in T]?: [boolean, E?] };
  element?: NoviceTutorialElementProps<T>[];
  getContext?: (context: React.Context<{ [key in T]?: [boolean, E?] }>) => void;
  getTrigger?: (trigger: (event: E) => [boolean, E]) => void;
  onTrigger?: (
    context: { [key in T]?: [boolean, E?] },
    filteredElement: NoviceTutorialElementProps<T>[],
    event: E,
    setContext: (nextContext: { [key in T]?: [boolean, E?] }) => void,
  ) => [boolean, E];
  storage?: Storage;
}

export default class NoviceTutorial<
  T extends string,
  E extends React.BaseSyntheticEvent
> extends React.Component<NoviceTutorialProps<T, E>, { [key in T]?: [boolean, E?] }> {
  static defaultProps = {
    defaultValue: {},
    element: [],
    storage: localStorage,
  };

  public enable: boolean = false;
  public Context: React.Context<{ [key in T]?: [boolean, E?] }>;
  public state: { [key in T]?: [boolean, E?] } = {};
  public NTQueue: { [key in T]?: E[] };

  constructor(props: NoviceTutorialProps<T, E>) {
    super(props);
    this.state = props.defaultValue || this.state;
    this.Context = React.createContext<{ [key in T]?: [boolean, E?] }>(props.defaultValue);
    if (props.getContext) props.getContext(this.Context);
    if (props.getTrigger) props.getTrigger(this.trigger);
  }

  componentDidMount = () => {
    const { element } = this.props;
    this.enable = element.some(ele => (localStorage.getItem(ele.id) ? false : true));
  };

  trigger = (event: E): [boolean, E] => {
    if (!this.enable) return;
    if (!event.target) return;
    const { element, onTrigger, storage } = this.props;
    const { className = '', dataset = {}, id } = event.target as HTMLBaseElement;
    const rest = element.filter(({ id: eleId, triggerCondition: t }) => {
      if (!t) return eleId === id || eleId === dataset.id;
      if (t.eventType && !strOrReg(t.eventType, event.type)) return false;
      if (t.pathname && !strOrReg(t.pathname, location.pathname)) return false;
      if (t.className && !strOrReg(t.className, className)) return false;
      if (storage.getItem(eleId)) return false;
      if (t.queue) {
        if (!this.NTQueue[eleId!]) this.NTQueue[eleId!] = [];
        this.NTQueue[eleId!].push(event);
        return false;
      }
    });
    if (!rest.length) return [false, event];
    if (onTrigger) return onTrigger(this.state, rest, event, this.setState);
    const updateState: { [key in T]?: [boolean, E?] } = {};
    rest.forEach(ele => (updateState[ele.id] = [true, event]));
    this.setState(updateState);
    return [true, event];
  };

  render() {
    const { children } = this.props;
    return <this.Context.Provider value={this.state}>{children}</this.Context.Provider>;
  }
}
