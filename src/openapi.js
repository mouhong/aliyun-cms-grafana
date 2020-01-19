import _ from 'lodash'
import { CmsSigner } from './signer'

const apiVersions = {
  rds: '2014-08-15',
  ecs: '2014-05-26',
  slb: '2014-05-15'
}

export default class OpenApi {
  constructor(options) {
    this._endpoint = options.endpoint
    this._version = options.version
    this._credentials = options.credentials
    this._proxy = options.proxy // backendSrv
  }

  url(method, params) {
    let segs = []
    _.forEach(params, (v, k) => {
      segs.push(k + '=' + encodeURIComponent(v))
    })

    let path = '/?' + segs.join('&')
    let signer = new CmsSigner({
      accessKeyId: this._credentials.access_key,
      secretAccessKey: this._credentials.secret_key,
      version: this._version
    }, {
      path: path,
      method: method
    });

    signer.addAuthorization();

    return this._endpoint + signer.request.path;
  }

  async request(method, params) {
    let resp = await this._proxy.datasourceRequest({
      url: this.url(method, params),
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (resp.status !== 200) {
      throw new Error('AliCloud OpenAPI Failed: ' + resp.data.Code + ' ' + resp.data.Message)
    }

    return resp.data
  }

  static create(type, options) {
    return new OpenApi(Object.assign({
      endpoint: `https://${type}.aliyuncs.com`,
      version: apiVersions[type]
    }, options))
  }
}