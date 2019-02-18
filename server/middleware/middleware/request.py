# -*- coding: utf-8 -*-
import json
import xmltodict
from .header import Headers
from ..settings import request as settings
from ..utils import Format, NamingCase
from collections import OrderedDict


class Request(object):
    def __init__(self, env):
        """
        :param dict env:
        """
        self.env = env
        self.headers = self.__get_headers()
        self.path = self.__get_env('PATH_INFO')
        self.method = self.__get_env('REQUEST_METHOD')
        self.query = Format.parse_qs(self.__get_env('QUERY_STRING', ''), True)
        body = self.__get_env('wsgi.input')
        if body:
            length = self.headers['Content-Length'] or settings.BODY_DEFAULT_LENGTH
            length = min(int(length), settings.BODY_MAX_LENGTH)
            self.body = body.read(length).decode()
        else:
            self.body = ''
    
    def __get_env(self, key, default_value=None):
        """
        :param str key:
        :param default_value:
        """
        return self.env[key] if key in self.env else default_value
    
    def __get_headers(self):
        headers = Headers()
        for (key, header) in settings.PARSE_HEADER:
            headers[header] = self.__get_env(key)
        for key in self.env:
            if not isinstance(key, str):
                continue
            if key.startswith('HTTP_'):
                headers[NamingCase.under_score_to_header_case_str(key[5:])] = self.env[key]
        return headers
    
    def xml(self):
        if self.body:
            return xmltodict.parse(self.body)
        else:
            return OrderedDict({})
    
    def json(self):
        return json.loads(self.body)
