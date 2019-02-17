# -*- coding: utf-8 -*-
"""
Reference: https://yuque.com/hele/doc/qzuay6#59163ea3
"""


class StandardTableAction:
    """
    :param bool disabled:
    :param str icon:
    :param bool loading:
    :param str or int or float text:
    :param str type:
    :param bool visible:
    """
    disabled: bool or None
    icon: str or None
    loading: bool or None
    text: str or int or float or None
    type: str
    visible: bool or None


class StandardTableOperation(StandardTableAction):
    """
    :param dict buttonProps:
    :param dict menuItemProps:
    """
    buttonProps: dict or None
    menuItemProps: dict or None


class StandardTableOperationAreaProps:
    """
    :param dict animationProps:
    :param dict dropdownProps:
    :param int maxAmount:
    :param list[StandardTableOperation] or tuple[StandardTableOperation] operation:
    """
    animationProps: dict or None
    dropdownProps: dict or None
    maxAmount: int or None
    operation: list or tuple or None


class StandardTableScroll:
    """
    Allow `'10%'` or `'10px'` or `10` or `10em` or any other CSS length value
    :param int or str or float x:
    :param int or str or float y:
    """
    x: int or str or float or None
    y: int or str or float or None


class StandardTableProps:
    actionKey: str or list or None
    columns: list or tuple
    dataSource: list or tuple
    operationArea: StandardTableOperationAreaProps or None
    rowKey: str or None
    scroll: StandardTableScroll
    total: int
