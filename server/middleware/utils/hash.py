# -*- coding: utf-8 -*-
import base64
import hashlib
import hmac
import random
from .. import settings


class Hash(object):
    @staticmethod
    def base64(data):
        """
        :param str or bytes data: data
        :return: base64(data)
        """
        if isinstance(data, str):
            data = data.encode(settings.CODING)
        return str(base64.b64encode(data).decode())

    @staticmethod
    def md5_hex(data, upper=False):
        """
        :param str or bytes data: data
        :param bool upper: return str.upper()
        :return str: md5(data)
        """
        if isinstance(data, str):
            data = data.encode(settings.CODING)
        res = str(hashlib.md5(data).hexdigest())
        if upper:
            return res.upper()
        return res

    @staticmethod
    def md5_base64(data):
        """
        :param str or bytes data: data
        :return str: base64(md5(data))
        """
        if isinstance(data, str):
            data = data.encode(settings.CODING)
        h = hashlib.md5(data)
        return Hash.base64(h.digest())
    
    @staticmethod
    def hmac_sha256_hex(d, k):
        """
        :param str or bytes d: Data
        :param str or bytes k: Sign key
        :return:
        """
        return hmac.new(bytes(k, settings.CODING), bytes(d, settings.CODING), digestmod='sha256').digest().hex()


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
