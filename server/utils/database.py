# -*- coding: utf-8 -*-
"""
Fragment of pyAct
GitHub: https://github.com/act-auth/pyAct
"""
import pymysql
import settings
from middleware.utils import Format


def mysql(s, *data, escape=True):
    return s.format(*(map(
        lambda x: pymysql.escape_string(str(x)), data) if escape else data))


class Database(object):
    pass


class StoreType(object):
    """
    OSS: Object Storage Service
    OTS: Table Store
    MYSQL: MySQL
    """
    OSS = 'OSS'
    OTS = 'OTS'
    MYSQL = 'MYSQL'
    
    __values__ = [
        OSS,
        OTS,
        MYSQL,
    ]
    
    __members__ = [
        'StoreType.OSS',
        'StoreType.OTS',
        'StoreType.MYSQL',
    ]


class LogicalOperator(object):
    def __init__(self, logical_operator):
        """
        :param str logical_operator: 'AND' / 'OR' / 'NOT'
        """
        logical_operator = logical_operator.strip()
        self.MYSQL = logical_operator.lower()


class ComparatorType(object):
    """
    :param str comparator_type: '=' / '!=' / '>' / '>=' / '<' / '<='
    """
    __MAP__ = {
        '=': 'EQUAL',
        '!=': 'NOT_EQUAL',
        '>': 'GREATER_THAN',
        '>=': 'GREATER_EQUAL',
        '<': 'LESS_THAN',
        '<=': 'LESS_EQUAL',
    }
    
    def __init__(self, comparator_type):
        """
        :param str comparator_type: '=' / '!=' / '>' / '>=' / '<' / '<='
        """
        comparator_type = comparator_type.strip()
        comparator = Format.get(self.__MAP__, comparator_type)
        if comparator is None:
            raise ValueError('class ComparatorType: ' + str(self.__doc__))
        self.MYSQL = comparator_type.replace('!=', '<>')


class StoreData(object):
    """
    :param list or tuple or dict or None data: Eg: [(key, value), (key, value, version)]
    """
    
    def __init__(self, data=None):
        """
        :param list or tuple or dict or None data: Eg: [(key, value), (key, value, version)]
        """
        self.dict = dict()
        self.list = list()
        self.version = dict()
        if data is not None:
            self.update(data)
    
    def update(self, data):
        """
        :param list or tuple or dict data: Eg: [(key, value), (key, value, version)]
        """
        if isinstance(data, dict):
            self.list = self.list + data.items()
            return self.dict.update(data)
        if not isinstance(data, (list, tuple)):
            raise ValueError('class StoreData: ' + str(self.__doc__))
        self.list = self.list + list(data)
        for item in data:
            self.dict[item[0]] = item[1]
            if item[0] not in self.version:
                self.version[item[0]] = list()
            self.version[item[0]] += [(item[1], 0 if len(item) < 3 else item[2])]
        return self


class MySQL(Database):
    def __init__(self, user, password, charset=settings.MYSQL_CHARSET, db=None,
                 host=settings.MYSQL_HOST, port=settings.MYSQL_PORT, table_name=None):
        """
        :param str user: User name of mysql server
        :param str password: Password of current user
        :param str charset: Charset
        :param str db: Name of database
        :param str host: Host. Default localhost
        :param int port: Port. Default 3306
        :param str table_name: Default table name
        """
        self.user = user
        self.password = password
        self.charset = charset
        self.db = db
        self.host = host
        self.port = port
        self.table_name = table_name
        self.connect_param = {
            'user': self.user,
            'password': self.password,
            'charset': self.charset,
            'db': self.db,
            'host': self.host,
            'port': self.port,
            'cursorclass': pymysql.cursors.DictCursor,
        }
    
    def execute(self, sql, *args, **kwargs):
        """
        :param str sql: Eg: 'select COLUMN from TABLE where KEY="{}"'
        :param tuple args: Args for sql. Eg: sql.format(*args)
        :param dict kwargs: dict connect_param: pymysql.connect(default, **connect_param)
        :param dict kwargs: bool escape: escape_string(*args)
        :return: Eg: [{'column': 'valueA'}, {'column': 'valueB'}]
        """
        sql = mysql(sql, *args, escape=kwargs.get('escape', True))
        connect_param = self.connect_param.copy()
        connect_param.update(kwargs.get('connect_param', dict()))
        connect = pymysql.connect(**connect_param)
        try:
            cur = connect.cursor()
            results = cur.execute(sql)
            connect.commit()
        finally:
            connect.close()
        return list(cur.fetchmany(results))
    
    def select(self, index, column=None, where=None, logical_operator=None, table_name=None):
        """
        :param list or tuple index: Primary key. Eg: [('ActID', 'abc')]
        :param list or tuple column: Column name. Eg: ['ActiveParty', 'PassiveParty']
        :param list or tuple where: Filter. Eg: [('StartTime', ComparatorType('>='), 0)]
        :param LogicalOperator logical_operator: LogicalOperator('AND')
        :param str table_name: Table name
        :return:

        `[*list, *tuple]` instead of `list + tuple`
        """
        if column is None:
            column = ['*']
        if where is None:
            where = [('0', ComparatorType('='), 0)]
        if table_name is None:
            table_name = self.table_name
        if not isinstance(where[0][1], ComparatorType):
            raise ValueError('class ComparatorType: ' + str(ComparatorType.__doc__))
        param = map(lambda i: i[-1], (*index, *where))
        index = tuple(map(
            lambda i: '{}={{}}'.format(i[0])
            if isinstance(i[1], int) else '{}="{{}}"'.format(i[0]), index))
        where = tuple(map(
            lambda i: '{0}{1}{{}}'.format(i[0], i[1].MYSQL)
            if isinstance(i[2], int) else '{0}{1}"{{}}"'.format(i[0], i[1].MYSQL), where))
        # [('PassiveParty', '=', 'ABC'), ('StartTime', '>=', 0)] => ['PassiveParty="{}"', 'StartTime>={}']
        index += ((' {} '.format(logical_operator.MYSQL)).join(where),)
        where_str = (' {} '.format(LogicalOperator('AND').MYSQL)).join(index)
        sql = 'SELECT {0} FROM {1} WHERE {2}'.format(','.join(column), table_name, where_str)
        # ((execute() => []) or [None])[0] => None
        return StoreData((self.execute(sql, *param) or [None])[0])
    
    def insert(self, index, column=None, table_name=None):
        """
        :param list or tuple index: Primary key. Eg: [('ActID', 'abc')]
        :param list or tuple column: Attribute column. Eg: [('StartTime', 0)]
        :param str table_name: Table name
        :return:
        """
        if column is None:
            column = tuple()
        if table_name is None:
            table_name = self.table_name
        param = map(lambda i: i[-1], [*index, *column])
        key_str = ','.join(tuple(map(
            lambda i: '{}={{}}'.format(i[0])
            if isinstance(i[1], int) else '{}="{{}}"'.format(i[0]), [*index, *column])))
        self.execute('INSERT INTO {0} SET {1}'.format(table_name, key_str), *param)
    
    def update(self, index, column, where=None, logical_operator=None, table_name=None):
        """
        :param list or tuple index: Primary key. Eg: [('ActID', 'abc')]
        :param list or tuple column: Attribute column. Eg: [('ActiveParty', 'abc')]
        :param list or tuple where: Filter. Eg: [('StartTime', ComparatorType('>='), 0)]
        :param LogicalOperator logical_operator: LogicalOperator('AND')
        :param str table_name: Table name
        :return:
        """
        if where is None:
            where = (('0', ComparatorType('='), 0),)
        if table_name is None:
            table_name = self.table_name
        if not isinstance(where[0][1], ComparatorType):
            raise ValueError('class ComparatorType: ' + str(ComparatorType.__doc__))
        param = tuple(map(lambda i: i[1], column))
        param += tuple(map(lambda i: i[-1], (*index, *where)))
        column = tuple(map(
            lambda i: '{}={{}}'.format(i[0])
            if isinstance(i[1], int) else '{}="{{}}"'.format(i[0]), column))
        index = tuple(map(
            lambda i: '{}={{}}'.format(i[0])
            if isinstance(i[1], int) else '{}="{{}}"'.format(i[0]), index))
        where = tuple(map(
            lambda i: '{0}{1}{{}}'.format(i[0], i[1].MYSQL)
            if isinstance(i[2], int) else '{0}{1}"{{}}"'.format(i[0], i[1].MYSQL), where))
        index += ((' {} '.format(logical_operator.MYSQL)).join(where),)
        where_str = (' {} '.format(LogicalOperator('AND').MYSQL)).join(index)
        self.execute('UPDATE {0} SET {1} WHERE {2}'.format(table_name, ','.join(column), where_str), *param)
