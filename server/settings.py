# -*- coding: utf-8 -*-
from middleware import TokenAuth, Common

CODING = 'utf-8'

DEBUG = True

MIDDLEWARE = (Common, TokenAuth)

PATH_PREFIX = '/api'

"""
database
"""
MYSQL_CHARSET = 'utf8mb4'
MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
