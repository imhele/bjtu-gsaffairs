# -*- coding: utf-8 -*-
JSON_PARSE_ABLE_TYPE = dict or list or tuple or str or None or False or True or int or float


def class_to_dict(c, filter_none=True):
    """
    :param object c:
    :param bool filter_none:
    :return:
    """
    res = dict()
    if filter_none:
        for k in c.__dict__:
            if k.startswith('__'):
                continue
            if c.__dict__[k] is None:
                continue
            res[k] = c.__dict__[k]
            if not isinstance(res[k], JSON_PARSE_ABLE_TYPE):
                res[k] = class_to_dict(res[k], filter_none)
    else:
        for k in c.__dict__:
            if k.startswith('__'):
                continue
            res[k] = c.__dict__[k]
            if not isinstance(res[k], JSON_PARSE_ABLE_TYPE):
                res[k] = class_to_dict(res[k], filter_none)
    return res
