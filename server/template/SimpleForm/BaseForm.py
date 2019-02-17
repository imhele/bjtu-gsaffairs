# -*- coding: utf-8 -*-


class SimpleFormItemType:
    ButtonRadio = 'ButtonRadio'
    DatePicker = 'DatePicker'
    Extra = 'Extra'
    Input = 'Input'
    InputNumber = 'InputNumber'
    MonthPicker = 'MonthPicker'
    Radio = 'Radio'
    RangePicker = 'RangePicker'
    Select = 'Select'
    TextArea = 'TextArea'
    WeekPicker = 'WeekPicker'


class SelectOptions:
    """
    :param bool disabled:
    :param str title:
    :param str or int or float value:
    """
    disabled: bool or None
    title: str or None
    value: str or int or float


class SimpleFormItemProps:
    """
    :reference: https://yuque.com/hele/doc/qzuay6#FormItemProps
    :param str id:
    :param dict itemProps:
    :param dict colProps:
    :param dict decoratorOptions:
    :param str extra:
    :param list[SelectOptions] or tuple[SelectOptions] selectOptions:
    :param str or dict tip:
    :param str title:
    :param str type: One of SimpleFormItemType
    :param bool withoutWrap:
    """
    id: str
    itemProps: dict or None
    colProps: dict or None
    decoratorOptions: dict or None
    extra: str or None
    selectOptions: list or tuple or None
    tip: str or dict or None
    title: str or None
    type: str
    withoutWrap: bool or None
