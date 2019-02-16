# -*- coding: utf-8 -*-


class HeaderError(Exception):
    def __init__(self, source=(), detail=''):
        """
        :param tuple[str] source: Error source
        :param str or bytes detail: Detail
        """
        self.source = ('[HeaderError]',) + source
        self.detail = detail.decode() if isinstance(detail, bytes) else detail
    
    def __str__(self):
        return '\nSource:{}\n\nDetail:{}\n'.format(' '.join(self.source), self.detail)


class HeaderValueError(HeaderError):
    def __int__(self, source='', detail=''):
        """
        :param tuple[str] source: Error source
        :param str or bytes detail: Detail
        """
        HeaderError.__init__(self, ('[HeaderValueError]',) + source, detail)
