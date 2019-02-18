# -*- coding: utf-8 -*-
from .root import root
from middleware import Request
from path import PathMatchError


def entry(request):
    """
    :param Request request:
    :return:
    """
    match, path = root.match(request)
    if match is None:
        raise PathMatchError()
    if isinstance(path.before_main, list):
        for fn in path.before_main:
            fn(request, match)
    catch = getattr(path, 'catch')
    if catch is None:
        response = path.main(request, match)
    else:
        # noinspection PyBroadException
        try:
            response = path.main(request, match)
        except BaseException:
            response = path.catch(request, match)
    if isinstance(path.after_main, list):
        for fn in path.after_main:
            fn(request, match, response)
    return response

