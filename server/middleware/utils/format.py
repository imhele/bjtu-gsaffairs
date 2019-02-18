# -*- coding: utf-8 -*-
import json
import pymysql
from urllib import parse


class NamingCase(object):
    @staticmethod
    def camel_str(d):
        """
        :param str d:
        :return:
        """
        if not d:
            return d
        d = d[0].lower() + d[1:]
        return ''.join(map(
            lambda s: '_' + s.lower() if 'Z' >= s >= 'A' else s, d))
    
    @staticmethod
    def camel(d):
        """
        :param str or dict d:
        :return:
        """
        if isinstance(d, str):
            return NamingCase.camel_str(d)
        if isinstance(d, dict):
            return dict(map(
                lambda s: (NamingCase.camel_str(s[0]),
                           s[1] if isinstance(s[1], str) else NamingCase.camel(s[1])),
                d.items()))
        return d
    
    @staticmethod
    def under_score_str(d, first):
        """
        :param str d:
        :param bool first: Parse first character
        :return:
        """
        if not d:
            return d
        d = ''.join(map(
            lambda s: s[0].upper() + s[1:] if s else s, d.split('_')))
        if not first and d[0].isupper():
            d = d[0].lower() + d[1:]
        return d
    
    @staticmethod
    def under_score(d, first=False):
        """
        :param str or dict d:
        :param bool first: Parse first character
        :return:
        """
        if isinstance(d, str):
            d = NamingCase.under_score_str(d, first)
        if isinstance(d, dict):
            d = dict(map(
                lambda s: (NamingCase.under_score_str(s[0], first),
                           s[1] if isinstance(s[1], str) else NamingCase.under_score(s[1], first)),
                d.items()))
        return d
    
    @staticmethod
    def under_score_to_header_case_str(s):
        """
        :param str s:
        :return:
        """
        return '-'.join(map(lambda i: i[0].upper() + i[1:] if i else i, s.lower().split('_')))
    
    @staticmethod
    def header_case_str(s, upper=False):
        """
        :param str s:
        :param bool upper: Return upper case
        :return:
        """
        if upper:
            return s.upper()
        return '-'.join(map(lambda i: i[0].upper() + i[1:].lower() if i else i, s.split('-')))


class Format(object):
    @staticmethod
    def query_string(data, encode_component=False, with_bool=False, with_none=False, sort=False):
        """
        :param dict or tuple or list data: The dict that you want to format as query string
        :param bool encode_component: Encode URI component
        :param bool with_bool: The dict contains bool value(s). Eg: keyA=&keyB=valueB
        :param bool with_none: The dict contains NoneType value(s). Eg: keyA=&keyB=valueB
        :param bool sort: Sort the dict
        :return str: Query string
        """
        if isinstance(data, dict):
            items = data.items()
        else:
            items = list(data)
        if encode_component:
            items = list(map(lambda i: (i[0], parse.quote(i[1])), items))
        if with_bool or with_none:
            items = list(map(lambda i: '{0}={1}'
                             .format(i[0], str() if i[1] is None or i[1] is False else i[1]), items))
        else:
            items = list(map(lambda i: '{0}={1}'
                             .format(i[0], i[1]), items))
        if sort:
            items.sort()
        return '&'.join(items)
    
    @staticmethod
    def parse_qs(qs, decode_component=False):
        """
        :param str qs: Query string
        :param bool decode_component: Decode URI component
        :return:
        """
        items = filter(lambda i: len(i) > 1, [x.split('=', 1) for x in qs.split('&')])
        if decode_component:
            items = list(map(lambda i: (i[0], parse.unquote(i[1])), items))
        return dict(items)
    
    @staticmethod
    def json(data, sort=False, **kwargs):
        """
        :param data: The dict that you want to format as JSON string
        :param bool sort: Sort the dict
        :return: json.dumps(param)
        """
        return json.dumps(data, ensure_ascii=False, sort_keys=sort, **kwargs)
    
    @staticmethod
    def xml(data, sort=False):
        """
        :param dict or str data: The dict that you want to format as JSON string
        :param bool sort: Sort the dict
        :return: xml(param)
        """
        
        def cdata(s):
            s = str() if s is None or s is False else str(s)
            return '<![CDATA[{}]]>' \
                .format(']]]]><![CDATA[>'.join(s.split(']]>')))
        
        def to_xml(d):
            xml_list = list(map(lambda i: '<{k}>{v}</{k}>'.format(
                k=i[0], v=to_xml(i[1]) if isinstance(i[1], dict) else cdata(i[1])), d))
            return '<xml>{}</xml>'.format(str().join(xml_list))
        
        if isinstance(data, str):
            return '<xml>{}</xml>'.format(cdata(data))
        items = list(data.items())
        if sort:
            items.sort()
        return to_xml(items)
    
    @staticmethod
    def get(data, k, v=None):
        """
        :param data: If data is not a dict, return default value
        :param str or int k: Key that you want to get from data
        :param v: Default value
        """
        return data[k] if isinstance(data, dict) and k in data else v
    
    @staticmethod
    def sql(s, *data, escape=True):
        return s.format(*(map(
            lambda x: pymysql.escape_string(str(x)), data) if escape else data))
    
    @staticmethod
    def naming(d, from_case={'camel', 'pascal', 'under_score'}):
        """
        :param str or dict d:
        :param str from_case: `camel` or `pascal` or `under_score`
        :return:
        """
        if from_case == 'under_score':
            return NamingCase.under_score(d)
        elif from_case == 'pascal':
            return NamingCase.under_score(d, True)
        else:
            return NamingCase.camel(d)


class ContentType(object):
    FORM = 'multipart/form-data'
    JSON = 'application/json'
    XML = 'text/xml'
    URL_ENCODE = 'application/x-www-form-urlencoded'
    
    __values__ = [
        FORM,
        JSON,
        XML,
        URL_ENCODE,
    ]
    
    __members__ = [
        'ContentType.FORM',
        'ContentType.JSON',
        'ContentType.XML',
        'ContentType.URL_ENCODE',
    ]


class ResponseType:
    """
    XML: <key><![CDATA[value]]></key>
    JSON: {"key": "value"}
    """
    XML = 'XML'
    JSON = 'JSON'
    
    __values__ = [
        XML,
        JSON,
    ]
    
    __members__ = [
        'ResponseType.XML',
        'ResponseType.JSON',
    ]
