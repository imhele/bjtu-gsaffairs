# -*- coding: utf-8 -*-
from middleware import Common

"""
Global coding type, default value is 'utf-8'
"""
CODING = 'utf-8'

DEBUG = True

MIDDLEWARE = (Common,)

PATH_PREFIX = '/api'

"""
database
"""
MYSQL_CHARSET = 'utf8mb4'
MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
