/* eslint-disable no-magic-numbers */
export enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  ServerError = 503,
}
/* eslint-enable no-magic-numbers */

export enum ApiTag {
  Admin = 'Admin',
  Files = 'Files',
  Utils = 'Utils',
  Users = 'Users',
}
