# -*- coding: utf-8 -*-
import time
from . import sign
from ..path import BasicPath
from ..settings import auth as settings
from middleware import Request


class TokenAuthRequest(Request):
    auth = False


class TokenAuthPath(BasicPath):
    """
    :ATTENTION: If scope is None, TokenAuthPath will skip authorization at current path.
    ---
    :param set[str] scope: The path required for this routing, support RegExp
    :param list[function] before_token_auth:
    :param list[function] after_token_auth:
    """
    scope = None
    before_token_auth = []
    after_token_auth = []
    
    @staticmethod
    def get_user(user_id):
        """
        :param str user_id:
        :return: (password: str, last_login: int) or None
        """
        return '', 0
    
    def __init__(self):
        BasicPath.__init__(self)
        self.before_match.append(self.__token_auth_inherit)
        self.before_main.append(self.__token_auth)
    
    def __token_auth_inherit(self, request, parent_path=None):
        """
        :param Request request:
        :param TokenAuthPath parent_path:
        :return:
        """
        if parent_path is None or self.scope is None:
            return
        parent_scope = getattr(request, 'scope')
        if parent_scope is None:
            return
        self.scope.update(parent_scope)
    
    def __token_auth(self, request, match):
        """
        Token: {timestamp}{TOKEN_SPLIT_CHAR}{user_id}{TOKEN_SPLIT_CHAR}{signature}
        :param Request request:
        :param re.Match match:
        :return:
        """
        user = None
        timestamp = int(time.time())
        if self.scope is None:
            return setattr(request, 'auth', True)
        if isinstance(self.before_token_auth, list):
            for fn in self.before_token_auth:
                fn(request, match)
        token = request.headers[settings.AUTHORIZE_HEADER]
        if token is not None:
            token = token.split(settings.TOKEN_SPLIT_CHAR)
            if len(token) == 3:
                user = self.get_user(token[1])
        if user is None:
            setattr(request, 'auth', False)
        elif timestamp > user[1] + settings.EXPIRES_IN:
            setattr(request, 'auth', False)
        elif token[2] != self.__token_auth_sign(token[1], user[0], token[0]):
            setattr(request, 'auth', False)
        else:
            setattr(request, 'auth', True)
        if isinstance(self.after_token_auth, list):
            for fn in self.after_token_auth:
                fn(request, match)
    
    @staticmethod
    def __token_auth_sign(user_id, password, timestamp):
        """
        :param str user_id:
        :param str password:
        :param str or int timestamp: Unix timestamp
        :return:
        """
        content = '{}{}'.format(timestamp, user_id)
        return getattr(sign, settings.SIGN_METHOD)(content, password)
    
    def token_auth_get_token(self, user_id, password, timestamp=int(time.time())):
        """
        :param str user_id:
        :param str password:
        :param str or int timestamp: Unix timestamp
        :return:
        """
        signature = self.__token_auth_sign(user_id, password, timestamp)
        return settings.TOKEN_SPLIT_CHAR((timestamp, user_id, signature))
