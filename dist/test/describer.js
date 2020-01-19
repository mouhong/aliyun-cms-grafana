'use strict';

System.register(['lodash', './openapi'], function (_export, _context) {
  "use strict";

  var _, OpenApi, _createClass, cache, describers, Describer;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_openapi) {
      OpenApi = _openapi.default;
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

      cache = {
        _items: {},

        batchGet: function batchGet(keys) {
          var result = {};
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var k = _step.value;

              if (this._items[k]) {
                result[k] = Object.assign({}, this._items[k]);
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return result;
        },
        batchAdd: function batchAdd(items) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var item = _step2.value;

              this._items[item.id] = Object.assign({}, item);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      };
      describers = {
        rds: async function rds(instanceIds, options) {
          var api = OpenApi.create('rds', options);
          // Instead of query for each instance, we load all instances and cache them all
          var resp = await api.request('GET', {
            Action: 'DescribeDBInstances',
            RegionId: 'cn-beijing' // TODO: remove hard-code
          });

          var items = resp.Items.DBInstance.map(function (it) {
            return {
              id: it.DBInstanceId,
              description: it.DBInstanceDescription
            };
          });

          cache.batchAdd(items);

          return cache.batchGet(instanceIds);
        },

        slb: async function slb(instanceIds, options) {
          var api = OpenApi.create('slb', options);
          var resp = await api.request('GET', {
            Action: 'DescribeLoadBalancers',
            RegionId: 'cn-beijing',
            PageSize: 100
          });

          var items = resp.LoadBalancers.LoadBalancer.map(function (it) {
            return {
              id: it.LoadBalancerId,
              description: it.LoadBalancerName
            };
          });

          cache.batchAdd(items);

          return cache.batchGet(instanceIds);
        }
      };

      Describer = function () {
        function Describer(options) {
          _classCallCheck(this, Describer);

          this._options = options;
        }

        _createClass(Describer, [{
          key: 'describe',
          value: async function describe(instanceIds) {
            var result = {};
            var cachedIds = [];

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = instanceIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var id = _step3.value;

                if (cache[id]) {
                  result[id] = Object.assign({}, cache[id]);
                  cachedIds.push(id);
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }

            var remainingIds = _.without(instanceIds, cachedIds);
            if (remainingIds.length === 0) {
              return result;
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = Object.values(describers)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var describe = _step4.value;

                var descs = await describe(remainingIds, this._options);
                _.forEach(descs, function (desc, id) {
                  cache[id] = desc;
                  result[id] = Object.assign({}, desc);
                });
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
                }
              }
            }

            return result;
          }
        }]);

        return Describer;
      }();

      _export('default', Describer);
    }
  };
});
//# sourceMappingURL=describer.js.map
