import hash from 'hash.js';
import { message } from 'antd';
import router from 'umi/router';
import { getSign } from './auth';
import fetch from 'isomorphic-fetch'; // @issue: https://github.com/dvajs/dva/issues/2000

export interface RequestBody {}

export type RequestOptions<T extends RequestBody> = {
  body?: T | string;
  expirys?: number;
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

const cachedSave = (response: Response, hashcode: string) => {
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
): Promise<any> {
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
    expirys: 60,
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
    .then(response => {
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      return response.json();
    })
    .catch(e => {
      const status = e.name;
      if (status === 401) {
        (window as any).g_app._store.dispatch({
          type: 'login/logout',
        });
        return;
      }
      if (status === 403) return router.push('/exception/403');
      // if (status <= 504 && status >= 500) return router.push('/exception/500');
      if (status >= 404 && status < 422) return router.push('/exception/404');
    });
  if (typeof formattedResponse !== 'object' || !formattedResponse.errcode) return formattedResponse;
  message.error(`Errcode ${formattedResponse.errcode}: ${formattedResponse.errmsg}`);
  return null;
}
