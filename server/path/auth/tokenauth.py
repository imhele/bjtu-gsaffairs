# -*- coding: utf-8 -*-
from . import sign
from ..path import BasicPath


class TokenAuthPath(BasicPath):
    """
    :param str scope: The path required for this routing
    """
    scope: str or None
