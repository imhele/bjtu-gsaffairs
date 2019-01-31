import login from '../mock/login';
import fetch from 'isomorphic-fetch';
import position from '../mock/position';

/**
 * Maybe there will be a new package `umi-plugin-mock`
 */

const mockFiles = {
  ...login,
  ...position,
};

const aliasFetch = (url, options) => {
  const query = {};
  try {
    const urlInstance = new URL(url);
    url = urlInstance.pathname;
    Array.from(urlInstance.searchParams).forEach(([key, value]) => (query[key] = value));
  } catch {
    try {
      if (url[0] === '/') url = url.slice(1);
      const urlInstance = new URL(`http://localhost/${url}`);
      url = urlInstance.pathname;
      Array.from(urlInstance.searchParams).forEach(([key, value]) => (query[key] = value));
    } catch {}
  }
  if (url[0] === '/') url = url.slice(1);
  if (url[url.length - 1] === '/') url = url.slice(0, -1);
  const method = options.method || 'GET';
  let possibleKeys = Object.keys(mockFiles).filter(key => key.includes(url));
  if (possibleKeys.length) {
    possibleKeys = possibleKeys.filter(key => key.split(' ').length === 1 || key.includes(method));
  }
  if (possibleKeys.length) {
    const mock = mockFiles[possibleKeys[0]];
    return new Promise((resolve, reject) => {
      try {
        if (typeof mock === 'function') {
          if (typeof options.body === 'string') {
            try {
              options.body = JSON.parse(options.body);
            } catch {}
          }
          mock(
            { ...options, query, url },
            { send: response => resolve(new Response(new Blob([JSON.stringify(response)]))) },
          );
        } else {
          resolve(new Response(new Blob([JSON.stringify(mock)])));
        }
      } catch {
        reject({ status: 500 });
      }
    });
  }
  return fetch(url, options);
};

export default aliasFetch;
