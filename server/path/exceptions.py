# -*- coding: utf-8 -*-
from middleware import exceptions


class PathError(exceptions.HTTPError):
    def __init__(self, source=(), detail=''):
        """
        :param tuple[str] source: Error source
        :param str or bytes detail: Detail
        """
        self.source = ('[PathError]',) + source
        self.detail = detail.decode() if isinstance(detail, bytes) else detail
    
    def __str__(self):
        return '\nSource:{}\n\nDetail:{}\n'.format(' '.join(self.source), self.detail)


class PathMatchError(PathError):
    http_status_code = 404
    http_response_body = '<h1>404 Not Found</h1>'
    
    def __int__(self, source='', detail=''):
        """
        :param tuple[str] source: Error source
        :param str or bytes detail: Detail
        """
        PathError.__init__(self, ('[PathMatchError]',) + source, detail)
