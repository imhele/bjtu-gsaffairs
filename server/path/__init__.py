# -*- coding: utf-8 -*-
from middleware import Request, Response


def main(req):
    """
    :param Request req:
    :return:
    """
    print(req.body)
    return Response('hello', status=200)
