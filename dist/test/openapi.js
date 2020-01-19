'use strict';

System.register(['lodash', './signer'], function (_export, _context) {
  "use strict";

  var _, CmsSigner, _createClass, apiVersions, OpenApi;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_signer) {
      CmsSigner = _signer.CmsSigner;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      apiVersions = {
        rds: '2014-08-15',
        ecs: '2014-05-26',
        slb: '2014-05-15'
      };

      OpenApi = function () {
        function OpenApi(options) {
          _classCallCheck(this, OpenApi);

          this._endpoint = options.endpoint;
          this._version = options.version;
          this._credentials = options.credentials;
          this._proxy = options.proxy; // backendSrv
        }

        _createClass(OpenApi, [{
          key: 'url',
          value: function url(method, params) {
            var segs = [];
            _.forEach(params, function (v, k) {
              segs.push(k + '=' + encodeURIComponent(v));
            });

            var path = '/?' + segs.join('&');
            var signer = new CmsSigner({
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
        }, {
          key: 'request',
          value: async function request(method, params) {
            var resp = await this._proxy.datasourceRequest({
              url: this.url(method, params),
              method: method,
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (resp.status !== 200) {
              throw new Error('AliCloud OpenAPI Failed: ' + resp.data.Code + ' ' + resp.data.Message);
            }

            return resp.data;
          }
        }], [{
          key: 'create',
          value: function create(type, options) {
            return new OpenApi(Object.assign({
              endpoint: 'https://' + type + '.aliyuncs.com',
              version: apiVersions[type]
            }, options));
          }
        }]);

        return OpenApi;
      }();

      _export('default', OpenApi);
    }
  };
});
//# sourceMappingURL=openapi.js.map
