# -*- coding: utf-8 -*-
from .path import HTTPMethod
from middleware import Request, Response


def main(req):
    """
    :param Request req:
    :return:
    """
    return Response('hello', status=200)
