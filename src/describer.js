import _ from "lodash"
import OpenApi from './openapi' 

const cache = {
  _items: {},

  batchGet(keys) {
    let result = {}
    for (let k of keys) {
      if (this._items[k]) {
        result[k] = Object.assign({}, this._items[k])
      }
    }

    return result
  },

  batchAdd(items) {
    for (let item of items) {
      this._items[item.id] = Object.assign({}, item)
    }
  }
}

const describers = {
  rds: async function (instanceIds, options) {
    let api = OpenApi.create('rds', options)
    // Instead of query for each instance, we load all instances and cache them all
    let resp = await api.request('GET', {
      Action: 'DescribeDBInstances',
      RegionId: 'cn-beijing' // TODO: remove hard-code
    })

    let items = resp.Items.DBInstance.map(it => ({
      id: it.DBInstanceId,
      description: it.DBInstanceDescription
    }))

    cache.batchAdd(items)
    
    return cache.batchGet(instanceIds)
  },

  slb: async function (instanceIds, options) {
    let api = OpenApi.create('slb', options)
    let resp = await api.request('GET', {
      Action: 'DescribeLoadBalancers',
      RegionId: 'cn-beijing',
      PageSize: 100
    })

    let items = resp.LoadBalancers.LoadBalancer.map(it => ({
      id: it.LoadBalancerId,
      description: it.LoadBalancerName
    }))

    cache.batchAdd(items)

    return cache.batchGet(instanceIds)
  }
}

export default class Describer {
  constructor(options) {
    this._options = options
  }

  async describe(instanceIds) {
    let result = {}
    let cachedIds = []

    for (let id of instanceIds) {
      if (cache[id]) {
        result[id] = Object.assign({}, cache[id])
        cachedIds.push(id)
      }
    }

    let remainingIds = _.without(instanceIds, cachedIds)
    if (remainingIds.length === 0) {
      return result
    }

    for (let describe of Object.values(describers)) {
      let descs = await describe(remainingIds, this._options)
      _.forEach(descs, (desc, id) => {
        cache[id] = desc
        result[id] = Object.assign({}, desc)
      })
    }

    return result
  }
}