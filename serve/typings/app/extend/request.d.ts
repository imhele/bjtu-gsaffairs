// This file is created by egg-ts-helper@1.24.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExtendRequest from '../../../app/extend/request';
declare module 'egg' {
  type ExtendRequestType = typeof ExtendRequest;
  interface Request extends ExtendRequestType { }
}