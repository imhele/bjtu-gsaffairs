# -*- coding: utf8 -*-
import random
import base64
import hashlib
from .. import default


class Hash(object):
    @staticmethod
    def base64_str(data):
        """
        :param str or bytes data: data
        :return: base64(data)
        """
        if isinstance(data, str):
            data = data.encode(default.CODING)
        return str(base64.b64encode(data).decode())

    @staticmethod
    def md5_hex_str(data, upper=False):
        """
        :param str or bytes data: data
        :param bool upper: return str.upper()
        :return str: md5(data)
        """
        if isinstance(data, str):
            data = data.encode(default.CODING)
        res = str(hashlib.md5(data).hexdigest())
        if upper:
            return res.upper()
        return res

    @staticmethod
    def md5_base64_str(data):
        """
        :param str or bytes data: data
        :return str: base64(md5(data))
        """
        if isinstance(data, str):
            data = data.encode(default.CODING)
        h = hashlib.md5(data)
        return Hash.base64_str(h.digest())


class Random(object):
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' \
              'abcdefghijklmnopqrstuvwxyz' \
              '0123456789-_'

    @staticmethod
    def string(length=8):
        """
        :param int length: Length of random string
        :return: Random string
        """
        return str().join(random.sample(Random.letters, length))
