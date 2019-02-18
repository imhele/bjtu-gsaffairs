# -*- coding: utf-8 -*-
"""
Fragment of pyAct, both MySQL and TableStore are supported with the same API.
GitHub: https://github.com/act-auth/pyAct
"""
import pymysql
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
        # self.version = dict()
        if data is not None:
            self.update(data)
    
    def update(self, data):
        """
        :param list or tuple or dict data: Eg: [(key, value)]
        """
        if isinstance(data, dict):
            self.list = [*self.list, *data.items()]
            self.dict.update(data)
            return self
        if isinstance(data, list or tuple):
            self.list = [*self.list, *data]
            self.dict.update(data)
            return self
        raise ValueError('class StoreData: ' + str(self.__doc__))


class MySQL(Database):
    def __init__(self, host=None, user=None, password='', db=None, charset='', port=0, table_name=None):
        """
        :param str host: Host. Default localhost
        :param str user: User name of mysql server
        :param str password: Password of current user
        :param str db: Name of database
        :param str charset: Charset
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
    
    def select(self, index=None, column=None, where=None, logical_operator=None, table_name=None):
        """
        :param list or tuple index: Primary key. Eg: [('ActID', 'abc')]
        :param list or tuple column: Column name. Eg: ['ActiveParty', 'PassiveParty']
        :param list or tuple where: Filter. Eg: [('StartTime', ComparatorType('>='), 0)]
        :param LogicalOperator or str logical_operator: LogicalOperator('AND')
        :param str table_name: Table name
        :return:

        `[*list, *tuple]` instead of `list + tuple`
        """
        if column is None:
            column = ['*']
        if index is None:
            index = [('0', 0)]
        if where is None:
            where = [('0', ComparatorType('='), 0)]
        if table_name is None:
            table_name = self.table_name
        if not isinstance(where[0][1], ComparatorType):
            raise ValueError('class ComparatorType: ' + str(ComparatorType.__doc__))
        if isinstance(logical_operator, LogicalOperator):
            logical_operator = logical_operator.MYSQL
        param = map(lambda i: i[-1], (*index, *where))
        index = tuple(map(
            lambda i: '{}={{}}'.format(i[0])
            if isinstance(i[1], int) else '{}="{{}}"'.format(i[0]), index))
        where = tuple(map(
            lambda i: '{0}{1}{{}}'.format(i[0], i[1].MYSQL)
            if isinstance(i[2], int) else '{0}{1}"{{}}"'.format(i[0], i[1].MYSQL), where))
        # [('PassiveParty', '=', 'ABC'), ('StartTime', '>=', 0)] => ['PassiveParty="{}"', 'StartTime>={}']
        where_str = (' {} '.format('AND')).join(index + ((' {} '.format(logical_operator)).join(where),))
        sql = 'SELECT {0} FROM {1} WHERE {2} LIMIT 1'.format(','.join(column), table_name, where_str)
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
    
    def update(self, index=None, column=None, where=None, logical_operator=None, table_name=None):
        """
        :param list or tuple index: Primary key. Eg: [('ActID', 'abc')]
        :param list or tuple column: Attribute column. Eg: [('ActiveParty', 'abc')]
        :param list or tuple where: Filter. Eg: [('StartTime', ComparatorType('>='), 0)]
        :param LogicalOperator or str logical_operator: LogicalOperator('AND')
        :param str table_name: Table name
        :return:
        """
        if column is None:
            column = []
        if index is None:
            index = [('0', 0)]
        if where is None:
            where = (('0', ComparatorType('='), 0),)
        if table_name is None:
            table_name = self.table_name
        if not isinstance(where[0][1], ComparatorType):
            raise ValueError('class ComparatorType: ' + str(ComparatorType.__doc__))
        if isinstance(logical_operator, LogicalOperator):
            logical_operator = logical_operator.MYSQL
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
        where_str = (' {} '.format('AND')).join(index + ((' {} '.format(logical_operator)).join(where),))
        self.execute('UPDATE {0} SET {1} WHERE {2}'.format(table_name, ','.join(column), where_str), *param)
    
    def select_range(self, column=None, where=None, offset=0, limit=-1, logical_operator=None, table_name=None):
        """
        :param list or tuple column: Column name. Eg: ['ActiveParty', 'PassiveParty']
        :param list or tuple where: Filter. Eg: [('StartTime', ComparatorType('>='), 0)]
        :param int offset: Offset of result
        :param int limit: Limit of result
        :param LogicalOperator or str logical_operator: LogicalOperator('AND')
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
        if isinstance(logical_operator, LogicalOperator):
            logical_operator = logical_operator.MYSQL
        column = ','.join(column)
        param = map(lambda i: i[-1], where)
        where = tuple(map(
            lambda i: '{0}{1}{{}}'.format(i[0], i[1].MYSQL)
            if isinstance(i[2], int) else '{0}{1}"{{}}"'.format(i[0], i[1].MYSQL), where))
        # [('PassiveParty', '=', 'ABC'), ('StartTime', '>=', 0)] => ['PassiveParty="{}"', 'StartTime>={}']
        where_str = (' {} '.format(logical_operator)).join(where)
        sql = 'SELECT {0} FROM {1} WHERE {2} LIMIT {3},{4}'.format(column, table_name, where_str, offset, limit)
        # ((execute() => []) or [None])[0] => None
        return list(map(lambda row: StoreData(row), self.execute(sql, *param)))
