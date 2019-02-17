# -*- coding: utf-8 -*-
from .path import BasicPath, HTTPMethod
from .exceptions import PathMatchError
from middleware import Request, Response


class Root(BasicPath):
    path = '/'
    name = 'RootPath'
    children = None


def main(request) -> Response:
    """
    :param Request request:
    :return:
    """
    match, path_handler = Root().match(request)
    if match is None:
        raise PathMatchError()
    # noinspection PyBroadException
    try:
        return path_handler.main(request, match)
    except BaseException:
        return path_handler.catch(request, match)
