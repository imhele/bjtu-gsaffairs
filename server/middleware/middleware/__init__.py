# -*- coding: utf-8 -*-
from .header import Headers
from .request import Request
from .response import Response


class MiddleWare(object):
    def __init__(self, *arg):
        pass

    def request(self, req):
        """
        :param Request or dict req:
        :return:
        """
        pass
    
    def response(self, res):
        """
        :param Response res:
        :return:
        """
        return res
