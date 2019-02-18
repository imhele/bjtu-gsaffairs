# -*- coding: utf-8 -*-
from ..exceptions import HeaderValueError
from ..utils import NamingCase
from enum import Enum


class HTTPMethod(Enum):
    CONNECT = 'CONNECT'
    COPY = 'COPY'
    DELETE = 'DELETE'
    GET = 'GET'
    HEAD = 'HEAD'
    LINK = 'LINK'
    MOVE = 'MOVE'
    OPTIONS = 'OPTIONS'
    PATCH = 'PATCH'
    POST = 'POST'
    PUT = 'PUT'
    TRACE = 'TRACE'
    UNLINK = 'UNLINK'
    WRAPPED = 'WRAPPED'


class Headers(object):
    def __init__(self, headers=None):
        """
        :param dict or tuple or list headers:
        """
        self.headers = dict()
        self.add(headers or dict())
    
    def __iter__(self):
        return iter(self.headers.items())
    
    def __setitem__(self, key, value):
        key = NamingCase.header_case_str(key)
        self.headers[key] = value
    
    def __getitem__(self, key):
        key = NamingCase.header_case_str(key)
        return self.headers[key] if key in self.headers else None
    
    def __delitem__(self, key):
        key = NamingCase.header_case_str(key)
        if key in self.headers:
            del self.headers[key]
    
    def add(self, headers, value=None):
        """
        The key of headers are allowed to be upper case, such as 'CONTENT-TYPE',
        it will be transformed into 'Content-Type'.
        ---
        :param dict or tuple or list headers: eg: {'Content-Type': 'text/xml'} or [('Content-Type', 'text/xml'), ...]
        :param str value: eg: .add('Content-Type', 'text/xml')
        """
        if isinstance(headers, str):
            self.headers.update(({NamingCase.header_case_str(headers): value}))
        else:
            try:
                self.headers.update(map(lambda k: (NamingCase.header_case_str(k), headers[k]), dict(headers)))
            except ValueError:
                raise HeaderValueError(('Header.add()',), self.add.__doc__)
    
    def remove(self, rm_list):
        """
        :param list or tuple rm_list:
        """
        for key in rm_list:
            key = NamingCase.header_case_str(key)
            if key in self.headers:
                del self.headers[key]
    
    def list(self):
        return list(self)
    
    def dict(self):
        return dict(self)
