import hash from 'hash.js';
import router from 'umi/router';
import { getSign } from './auth';
import { notification, message } from 'antd';
import fetch from 'isomorphic-fetch'; // @issue: https://github.com/dvajs/dva/issues/2000

export interface RequestBody {}

export interface ResponseBody {
  errcode?: number;
  errmsg?: string;
  [key: string]: any;
}

export type RequestOptions<T extends RequestBody> = {
  body?: T | string;
  expirys?: number;
  ignoreErrcode?: boolean;
} & {
  [P in
    | 'cache'
    | 'credentials'
    | 'headers'
    | 'integrity'
    | 'keepalive'
    | 'method'
    | 'mode'
    | 'redirect'
    | 'referrer'
    | 'referrerPolicy'
    | 'signal'
    | 'window']?: RequestInit[P]
};

const cachedSave = (response: Response, hashcode: string): Response => {
  /**
   * Clone a response data and store it in sessionStorage
   * Does not support data other than json, Cache only json
   */
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.match(/application\/json/i)) {
    // All data is saved as text
    response
      .clone()
      .text()
      .then(content => {
        sessionStorage.setItem(hashcode, content);
        sessionStorage.setItem(`${hashcode}:timestamp`, Date.now().toString());
      });
  }
  return response;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default async function request<T>(
  url: string,
  options: RequestOptions<T> = {},
): Promise<ResponseBody | string | null | void> {
  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const jsonBody = options.body && JSON.stringify(options.body);
  const fingerprint: string = url + (jsonBody || '');
  const hashcode: string = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');
  const newOptions: RequestOptions<T> = {
    expirys: 30,
    credentials: 'omit' as RequestCredentials,
    ...options,
    headers: {
      ...getSign(),
      ...options.headers,
    },
  };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = jsonBody;
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }
  if (options.expirys) {
    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if (cached !== null && whenCached !== null) {
      const age: number = (Date.now() - parseInt(whenCached, 10)) / 1000;
      if (age < options.expirys) {
        const cachedResponse = await new Response(new Blob([cached])).json();
        if (typeof cachedResponse !== 'object' || !cachedResponse.errcode) return cachedResponse;
      }
      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }
  const formattedResponse = await fetch(url, newOptions)
    .then(response => cachedSave(response, hashcode))
    .then<ResponseBody | string>(response => {
      if (response.headers.get('Content-Type').includes('stream'))
        return response.blob().then(blob => {
          const a = document.createElement('a');
          const fileUrl = URL.createObjectURL(blob);
          a.href = fileUrl;
          const disposition = response.headers.get('Content-Disposition');
          const filename = /filename[\s\S]?="([\s\S]*?)"/.exec(disposition) || ['', disposition];
          a.download = decodeURIComponent(filename[1]);
          a.click();
          URL.revokeObjectURL(fileUrl);
        });
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      return response.json();
    })
    .catch<void>(e => {
      const status = e.name;
      if (status === 401) return (window as any).g_app._store.dispatch({ type: 'login/logout' });
      if (status === 403) return router.push('/exception/403');
      // if (status <= 504 && status >= 500) return router.push('/exception/500');
      if (status >= 404 && status < 422) return router.push('/exception/404');
    });
  if (typeof formattedResponse !== 'object' || !formattedResponse || !formattedResponse.errcode)
    return Promise.resolve(formattedResponse);
  if (!newOptions.ignoreErrcode)
    notification.error({
      description: formattedResponse.errmsg,
      message: `Error code: ${formattedResponse.errcode}`,
    });
  return Promise.resolve(null);
}
