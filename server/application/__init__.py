import settings
from path import BasicPath, PathMatchError
from middleware import Request, Response


class Root(BasicPath):
    path = getattr(settings, 'PATH_PREFIX', '(?:/)?')
    name = 'RootPath'
    children = None


root = Root()


def entry(request) -> Response:
    """
    :param Request request:
    :return:
    """
    match, path_handler = root.match(request)
    if match is None:
        raise PathMatchError()
    catch = getattr(path_handler, 'catch')
    if catch is None:
        return path_handler.main(request, match)
    # noinspection PyBroadException
    try:
        return path_handler.main(request, match)
    except BaseException:
        return path_handler.catch(request, match)
