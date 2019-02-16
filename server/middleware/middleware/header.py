# -*- coding: utf-8 -*-
from ..exceptions import HeaderValueError


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
            try:
                self.headers.update(dict(headers))
            except ValueError:
                raise HeaderValueError(('Header.add()',), self.add.__doc__)
    
    def remove(self, rm_list):
        """
        :param list or tuple rm_list:
        """
        for key in rm_list:
            if key in self.headers:
                del self.headers[key]
    
    def list(self):
        return list(self)
    
    def dict(self):
        return dict(self)
