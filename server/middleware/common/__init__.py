# -*- coding: utf8 -*-
from ..middleware import MiddleWare, Request, Response


class Common(MiddleWare):
    def request(self, req):
        return Request(req)
    
    def response(self, res):
        """
        :param Response res:
        :return:
        """
        return res
