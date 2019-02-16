# -*- coding: utf8 -*-
from path import main
from settings import MIDDLEWARE


def application(env, start_resp):
    """
    :param dict env:
    :param function start_resp:
    """
    pre_product = env
    middleware_tuple = tuple(map(lambda mw: mw(env), MIDDLEWARE))
    for middleware in middleware_tuple:
        pre_product = middleware.request(pre_product)
    pre_product = main(pre_product)
    for middleware in reversed(middleware_tuple):
        pre_product = middleware.response(pre_product)
    start_resp(pre_product.status, list(pre_product.headers))
    return [pre_product.body.encode()]


if __name__ == '__main__':
    from middleware import Request
    print(Request({'TODO': 'test'}).json())
