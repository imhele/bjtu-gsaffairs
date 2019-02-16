# -*- coding: utf8 -*-
"""
ActAuth Beta
"""
from ..common import MiddleWare
from ..middleware import Response


class TokenAuth(MiddleWare):
    def __init__(self, *arg):
        pass

    def request(self, req):
        return req

    def response(self, res):
        """
        :param Response res:
        :return:
        """
        return res
