# -*- coding: utf-8 -*-
from middleware import TokenAuth, Common

DEBUG = True

MIDDLEWARE = (Common, TokenAuth)
