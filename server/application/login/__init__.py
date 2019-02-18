# -*- coding: utf-8 -*-
from ..root import db
from ..settings.database import UserTable
from path import TokenAuthPath


class Login(TokenAuthPath):
    scope = None
    
    @staticmethod
    def get_user(user_id):
        db.select()
        return '', 0
