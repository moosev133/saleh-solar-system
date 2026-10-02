export class HttpError extends Error {
  constructor(status, code, headers = {}) { super(code); this.status = status; this.headers = headers; }
}
export const fail = (status, code) => { throw new HttpError(status, code); };
export const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }
});
