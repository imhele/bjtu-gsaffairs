# -*- coding: utf8 -*-
from middleware import Request, Response


def main(req):
    """
    :param Request req:
    :return:
    """
    return Response('hello', status=200)
