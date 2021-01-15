const Draft = require('./Draft')
const hasher = require('./hasher')

class GameTree {
  constructor({getId = null, merger = null, root = null} = {}) {
    this.getId = getId || ((id = 0) => () => id++)()
    this.merger = merger || (() => null)

    root = {
      id: this.getId(),
      data: {},
      parentId: null,
      children: [],
      ...(root || {})
    }

    this.root = root
    this._nodeCache = {}
    this._idAliases = {}
    this._heightCache = null
    this._hashCache = null
    this._structureHashCache = null
  }

  get(id) {
    let node = null
    if (id == null) return node
    if (id in this._idAliases) return this.get(this._idAliases[id])

    if (id in this._nodeCache) {
      node = this._nodeCache[id]
    } else {
      let inner = node => {
        this._nodeCache[node.id] = node
        if (node.id === id) return node

        for (let child of node.children) {
          let result = inner(child)
          if (result != null) return result
        }

        return null
      }

      node = inner(this.root)
    }

    if (node == null) {
      this._nodeCache[id] = null
      return null
    }

    for (let child of node.children) {
      this._nodeCache[child.id] = child
    }

    return node
  }

  *getSequence(id) {
    let node = this.get(id)
    if (node == null) return
    yield node

    while (node.children.length === 1) {
      node = node.children[0]

      this._nodeCache[node.id] = node
      for (let child of node.children) {
        this._nodeCache[child.id] = child
      }

      yield node
    }
  }

  mutate(mutator) {
    let draft = new Draft(this)

    mutator(draft)
    if (draft.root === this.root) return this

    let tree = new GameTree({
      getId: this.getId,
      merger: this.merger,
      root: draft.root
    })

    if (draft._passOnNodeCache) tree._nodeCache = draft._nodeCache
    tree._idAliases = draft._idAliases
    tree._structureHashCache = draft._structureHashCache
    tree._heightCache = draft._heightCache

    return tree
  }

  navigate(id, step, currents) {
    let node = this.get(id)

    if (node == null) return null
    if (step === 0) return node
    if (step < 0) return this.navigate(node.parentId, step + 1)

    let nextId =
      currents[node.id] != null
        ? currents[node.id]
        : node.children.length > 0
        ? node.children[0].id
        : null

    if (nextId == null) return null
    return this.navigate(nextId, step - 1, currents)
  }

  *listNodes() {
    function* inner(node) {
      yield node

      for (let child of node.children) {
        yield* inner(child)
      }
    }

    yield* inner(this.root)
  }

  *listNodesHorizontally(startId, step) {
    if (Math.abs(step) !== 1)
      throw new Error('Invalid value for step, only -1 or 1 allowed')

    let level = this.getLevel(startId)
    let section = [...this.getSection(level)]
    let index = section.findIndex(node => node.id === startId)

    while (section[index] != null) {
      while (0 <= index && index < section.length) {
        yield section[index]
        index += step
      }

      level += step
      section =
        step > 0
          ? [].concat(...section.map(node => node.children))
          : [...this.getSection(level)]
      index = step > 0 ? 0 : section.length - 1
    }
  }

  *listNodesVertically(startId, step, currents) {
    if (Math.abs(step) !== 1)
      throw new Error('Invalid value for step, only -1 or 1 allowed')

    let id = startId
    let node = this.get(id)

    while (node != null) {
      yield node
      node = this.navigate(node.id, step, currents)
    }
  }

  *listCurrentNodes(currents) {
    yield* this.listNodesVertically(this.root.id, 1, currents)
  }

  *listMainNodes() {
    yield* this.listCurrentNodes({})
  }

  getLevel(id) {
    let result = -1

    for (let node of this.listNodesVertically(id, -1, {})) {
      result++
    }

    return result < 0 ? null : result
  }

  *getSection(level) {
    if (level < 0) return
    if (level === 0) {
      yield this.root
      return
    }

    for (let parent of this.getSection(level - 1)) {
      yield* parent.children
    }
  }

  getCurrentHeight(currents) {
    let result = 0
    let node = this.root

    while (node != null) {
      result++
      node =
        currents[node.id] == null
          ? node.children[0]
          : node.children.find(child => child.id === currents[node.id])
    }

    return result
  }

  getHeight() {
    if (this._heightCache == null) {
      let inner = node => {
        let max = 0

        for (let child of node.children) {
          max = Math.max(max, inner(child))
        }

        return max + 1
      }

      this._heightCache = inner(this.root)
    }

    return this._heightCache
  }

  getStructureHash() {
    if (this._structureHashCache == null) {
      let hash = hasher.new()

      let inner = node => {
        hash('[' + JSON.stringify(node.id) + ',')
        node.children.forEach(inner)
        return hash(']')
      }

      this._structureHashCache = inner(this.root)
    }

    return (this._structureHashCache >>> 0) + ''
  }

  getHash() {
    if (this._hashCache == null) {
      let hash = hasher.new()

      let inner = node => {
        hash('[' + JSON.stringify(node.data) + ',')
        node.children.forEach(inner)
        return hash(']')
      }

      this._hashCache = inner(this.root)
    }

    return (this._hashCache >>> 0) + ''
  }

  onCurrentLine(id, currents) {
    for (let node of this.listNodesVertically(id, -1, {})) {
      let {parentId} = node

      if (
        parentId != null &&
        currents[parentId] !== node.id &&
        (currents[parentId] != null || this.get(parentId).children[0] !== node)
      )
        return false
    }

    return true
  }

  onMainLine(id) {
    return this.onCurrentLine(id, {})
  }

  toJSON() {
    return this.root
  }
}

module.exports = GameTree
