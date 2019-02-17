# -*- coding: utf-8 -*-
import traceback
from path import main
from middleware import Response
from settings import DEBUG, MIDDLEWARE


def application(env, start_resp):
    """
    :param dict env:
    :param function start_resp:
    """
    # noinspection PyBroadException
    try:
        pre_product = env
        middleware_tuple = tuple(map(lambda mw: mw(env), MIDDLEWARE))
        for middleware in middleware_tuple:
            pre_product = middleware.request(pre_product)
        pre_product = main(pre_product)
        for middleware in reversed(middleware_tuple):
            pre_product = middleware.response(pre_product)
    except BaseException:
        if DEBUG:
            style = 'font-size: 14px;line-height: 1.5;font-family: Source Code Pro;'
            message = traceback.format_exc().replace('\n', '<br/>').replace(' ', '&nbsp;')
            error_body = '<div style="{}">{}</div>'.format(style, message)
        else:
            error_body = '<h1>Server Error</h1>'
        pre_product = Response(error_body, {'Content-type': 'text/html'}, 500)
    start_resp(pre_product.status, pre_product.headers.list())
    return [pre_product.body]
