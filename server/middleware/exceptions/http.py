# -*- coding: utf-8 -*-


class HTTPError(Exception):
    http_status_code: str or int = 500
    http_response_body = b'<h1>Server Error</h1>'
