# -*- coding: utf-8 -*-
from .header import Headers
from ..default import response
from ..exceptions import ResponseValueError
from ..utils import Format


class Response(object):
    def __init__(self, body='', headers=None, status='200'):
        """
        :param str or bytes or dict body:
        :param Headers or dict headers:
        :param str or int status:
        """
        if headers is None:
            self.headers = Headers()
        elif isinstance(headers, Headers):
            self.headers = headers
        else:
            self.headers = Headers(headers)
        if isinstance(body, str):
            self.body = body.encode(response.ENCODE)
        elif isinstance(body, bytes):
            self.body = body
        elif isinstance(body, dict):
            body = getattr(Format, response.DICT_FORMAT.lower())(self.body, response.DICT_FORMAT_SORT)
            self.body = body.encode(response.ENCODE)
        else:
            raise ResponseValueError(('Response.body',), self.__init__.__doc__)
        if isinstance(status, int):
            self.status = str(status)
        elif isinstance(status, str):
            self.status = status
        else:
            raise ResponseValueError(('Response.status',), self.__init__.__doc__)