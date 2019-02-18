# -*- coding: utf-8 -*-
import re
from middleware import Request, Response


class BasicPath(object):
    """
    :param str path:
    :param str name:
    :param str or list[str] method: one of HTTP methods
    :param list[BasicPath] children:
    :param list[function] before_match:
    :param list[function] after_match:
    :param list[function] before_main:
    :param list[function] after_main:
    """
    path = ''
    name = ''
    method = None
    children = []
    __path_pattern = None
    before_match = []
    after_match = []
    before_main = []
    after_main = []
    
    def __init__(self, path=None, name=None, method=None, children=()):
        """
        :param str path:
        :param str name:
        :param str or list[str] method: one of HTTP methods
        :param list[BasicPath] children:
        """
        self.path = path or self.path
        self.name = name or self.name
        self.method = method or self.method
        self.children = children or self.children
    
    def __setattr__(self, key, value):
        if key == 'path':
            self.__dict__['__path_pattern'] = re.compile(value)
        self.__dict__[key] = value
    
    def __match(self, request):
        """
        :param Request request:
        :return:
        """
        if not request or not isinstance(request, Request):
            return False, self
        if not self.path:
            return False, self
        if self.method and request.method:
            if isinstance(self.method, str):
                if self.method != request.method:
                    return False, self
            elif request.method not in self.method:
                return False, self
        if self.__path_pattern is None:
            self.__path_pattern = re.compile(self.path)
        match = self.__path_pattern.match(request.path)
        if match is None:
            return False, self
        if not self.children or self.path.endswith('$'):
            return match, self
        for child in self.children:
            match_in_child, path_in_child = child.match(request)
            if match_in_child:
                return match_in_child, path_in_child
        return match, self
    
    def match(self, request, parent_path=None):
        """
        :param Request request:
        :param BasicPath parent_path:
        :return:
        """
        if isinstance(self.before_match, list):
            for fn in self.before_match:
                fn(request, parent_path)
        match, path = self.__match(request)
        if isinstance(self.after_match, list):
            for fn in self.after_match:
                fn(request, parent_path, match, path)
        return match, path
    
    def main(self, request, match) -> Response:
        """
        :param Request request:
        :param re.Match match:
        :return:
        """
        body = '{} {} {}'.format(request.method, request.path, self.name)
        return Response(body)
    
    catch = None
    '''
    def catch(self, request, match, exception) -> Response:
        """
        :param Request request:
        :param re.Match match:
        :param BaseException exception:
        :return:
        """
        error_body = '<h1>Server Error</h1>' \
                     '<h2>{}</h2>' \
                     '<h2>path: {}</h2>'.format(self.name, request.path)
        if DEBUG:
            error_body = '{}<h2>match: {}</h2>'.format(error_body, match.groups())
            style = 'font-size: 14px;' \
                    'line-height: 1.5;' \
                    'font-family: Source Code Pro;'
            message = traceback.format_exc().replace('\n', '<br/>').replace(' ', '&nbsp;')
            error_body = '{}<div style="{}">{}</div>'.format(error_body, style, message)
        return Response(error_body, {'Content-type': 'text/html'}, 500)
    '''
