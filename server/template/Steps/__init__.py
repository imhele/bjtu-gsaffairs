# -*- coding: utf-8 -*-


class StepsStatus:
    Error = 'error'
    Finish = 'finish'
    Process = 'process'
    Wait = 'wait'


class StepsItem:
    """
    :param str or int or float key:
    :param str description:
    :param str icon:
    :param str status: One of StepsStatus
    :param str title:
    """
    key: str or int or float or None
    description: str or None
    icon: str or None
    status: str or None
    title: str


class StepsPlacement:
    Horizontal = 'horizontal'
    Vertical = 'vertical'


class StepsProps:
    """
    :reference: https://yuque.com/hele/doc/qzuay6#StepsProps
    :param int current:
    :param str direction: One of StepsPlacement
    :param str labelPlacement: One of StepsPlacement
    :param bool progressDot:
    :param str size: 'default' or 'small'
    :param str status: One of StepsStatus
    :param list[StepsItem] or tuple[StepsItem] steps:
    :param dict style:
    """
    current: int or None
    direction: str or None
    labelPlacement: str or None
    progressDot: bool or None
    size: str or None
    status: str or None
    steps: list or tuple
    style: dict or None
