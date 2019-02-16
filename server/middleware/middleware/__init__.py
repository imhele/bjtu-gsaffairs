# -*- coding: utf8 -*-
from ..util import Format


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
        self.headers[key] = value
    
    def __getitem__(self, key):
        return self.headers[key] if key in self.headers else None
    
    def __delitem__(self, key):
        if key in self.headers:
            del self.headers[key]
    
    def add(self, headers, value=None):
        """
        :param dict or tuple or list headers: eg: {'Content-Type': 'text/xml'} or [('Content-Type', 'text/xml'), ...]
        :param str value: eg: .add('Content-Type', 'text/xml')
        """
        if isinstance(headers, dict):
            self.headers.update(headers)
        elif isinstance(headers, str):
            self.headers.update(({headers: value}))
        else:
            self.headers.update(dict(headers))
    
    def remove(self, rm_list):
        """
        :param list or tuple rm_list:
        """
        for key in rm_list:
            if key in self.headers:
                del self.headers[key]


class Request(object):
    def __init__(self, env):
        """
        :param dict env:
        """
        self.env = env
        self.path = self.__get_env('PATH_INFO')
        self.method = self.__get_env('REQUEST_METHOD')
        self.headers = Headers()
        self.query = Format.parse_qs(self.__get_env('QUERY_STRING', ''), True)
    
    def __get_env(self, key, default=None):
        """
        :param str key:
        :param default:
        """
        return self.env[key] if key in self.env else default
    
    def __get_headers(self):
        return
    
    def json(self):
        return Format.json(self.body)


class Response(object):
    def __init__(self, body=None, headers=None, status=None):
        """
        :param str body:
        :param Headers headers:
        :param status:
        """
        if headers is None:
            headers = Headers()
        self.body = body
        self.headers = headers
        self.status = status


class MiddleWare(object):
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
