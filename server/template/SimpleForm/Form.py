# -*- coding: utf-8 -*-
from .BaseForm import SimpleFormItemProps


class SimpleFormProps:
    """
    :reference: https://yuque.com/hele/doc/qzuay6#57b04d93
    :param dict colProps:
    :param list[SimpleFormItemProps] or tuple[SimpleFormItemProps] formItems:
    :param dict formItemProps:
    :param int groupAmount:
    :param dict initialFieldsValue:
    :param dict rowProps:
    :param dict style:
    """
    colProps: dict
    formItems: list or tuple
    formItemProps: dict
    groupAmount: int
    initialFieldsValue: dict
    rowProps: dict
    style: dict
