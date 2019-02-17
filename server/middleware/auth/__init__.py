# -*- coding: utf-8 -*-
from ..common import MiddleWare
from ..middleware import Response


class TokenAuth(MiddleWare):
    def request(self, req):
        return req

    def response(self, res):
        """
        :param Response res:
        :return:
        """
        return res
