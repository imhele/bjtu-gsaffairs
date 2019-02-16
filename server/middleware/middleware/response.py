# -*- coding: utf-8 -*-
from .header import Headers
from ..default import response
from ..exceptions import ResponseValueError
from ..utils import Format


class Response(object):
    def __init__(self, body=None, headers=None, status=None):
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
        elif isinstance(body, dict):
            if response.DICT_FORMAT.upper() == 'XML':
                self.body = Format.xml(self.body, response.DICT_FORMAT_SORT)
            else:
                self.body = Format.json(self.body, response.DICT_FORMAT_SORT)
        if isinstance(status, int):
            self.status = str(status)
        elif isinstance(status, str):
            self.status = status
        else:
            raise ResponseValueError(('Response.status',), self.__init__.__doc__)
