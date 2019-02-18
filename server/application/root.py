# -*- coding: utf-8 -*-
import settings as global_settings
from .settings import database
from path import BasicPath
from utils.database import MySQL

db = MySQL(host=database.HOST, user=database.USER, password=database.PASSWORD, db=database.DB_NAME,
           charset=database.CHARSET, port=database.PORT)


class Root(BasicPath):
    path = getattr(global_settings, 'PATH_PREFIX', '(?:/)?')
    name = 'RootPath'
    children = None


root = Root()
