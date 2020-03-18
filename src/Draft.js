class Draft {
  constructor(base) {
    this.base = base
    this.root = base.root

    this._passOnNodeCache = true

    this._nodeCache = {}
    this._idAliases = base._idAliases
    this._heightCache = base._heightCache
    this._structureHashCache = base._structureHashCache
  }

  get(id) {
    if (id == null) return null
    if (id in this._idAliases) return this.get(this._idAliases[id])
    if (id in this._nodeCache) return this._nodeCache[id]

    let node = this.base.get(id)
    if (node == null) {
      this._nodeCache[id] = null
      return null
    }

    let nodeCopy = {
      ...node,
      data: {...node.data},
      children: [...node.children]
    }

    if (node.parentId != null) {
      let parentCopy = this.get(node.parentId)
      let childIndex = parentCopy.children.findIndex(child => child.id === id)
      if (childIndex >= 0) parentCopy.children[childIndex] = nodeCopy
    }

    this._nodeCache[id] = nodeCopy
    if (this.root.id === id) this.root = nodeCopy

    return nodeCopy
  }

  _getLevel(id) {
    let level = -1
    let node = this.get(id)

    while (node != null) {
      level++
      node = this.get(node.parentId)
    }

    return level
  }

  appendNode(parentId, data, options = {}) {
    let id = this.base.getId()
    let success = this.UNSAFE_appendNodeWithId(parentId, id, data, options)
    if (!success) return null

    let merged = id in this._idAliases
    if (!merged) return id

    // If a merge occured, clean up id alias since id hasn't been exposed

    let result = this._idAliases[id]
    delete this._idAliases[id]

    return result
  }

  UNSAFE_appendNodeWithId(parentId, id, data, {disableMerging} = {}) {
    let parent = this.get(parentId)
    if (parent == null) return false

    let [mergeWithId, mergedData] = (() => {
      if (!disableMerging) {
        for (let child of parent.children) {
          let mergedData = this.base.merger(child, data)
          if (mergedData != null) return [child.id, mergedData]
        }
      }

      return [null, null]
    })()

    if (mergeWithId != null) {
      let node = this.get(mergeWithId)
      node.data = mergedData

      if (id !== mergeWithId) {
        this._idAliases[id] = mergeWithId
      }
    } else {
      let node = {id, data, parentId, children: []}
      parent.children.push(node)

      this._nodeCache[id] = node
      this._structureHashCache = null

      if (
        this._heightCache != null &&
        this._getLevel(parentId) === this._heightCache - 1
      ) {
        this._heightCache++
      }
    }

    return true
  }

  removeNode(id) {
    let node = this.get(id)
    if (node == null) return false

    let parentId = node.parentId
    if (parentId == null) throw new Error('Cannot remove root node')

    let parent = this.get(parentId)
    if (parent == null) return false

    let index = parent.children.findIndex(child => child.id === id)
    if (index >= 0) parent.children.splice(index, 1)
    else return false

    this._nodeCache[id] = null
    this._structureHashCache = null
    this._heightCache = null

    return true
  }

  shiftNode(id, direction) {
    if (!['left', 'right', 'main'].includes(direction)) {
      throw new Error(
        `Invalid value for direction, only 'left', 'right', or 'main' allowed`
      )
    }

    let node = this.get(id)
    if (node == null) return null

    let {parentId} = node
    let parent = this.get(parentId)
    if (parent == null) return null

    let index = parent.children.findIndex(child => child.id === id)
    if (index < 0) return null

    let newIndex = {
      left: Math.max(index - 1, 0),
      right: Math.min(index + 1, parent.children.length),
      main: 0
    }[direction]

    if (index !== newIndex) {
      let [child] = parent.children.splice(index, 1)
      parent.children.splice(newIndex, 0, child)
    }

    this._structureHashCache = null

    return newIndex
  }

  makeRoot(id) {
    if (id === this.root.id) return true

    let node = this.get(id)
    if (node == null) return false

    node.parentId = null
    this.root = node

    this._passOnNodeCache = false
    this._heightCache = null
    this._structureHashCache = null

    return true
  }

  addToProperty(id, property, value) {
    let node = this.get(id)
    if (node == null) return false

    if (node.data[property] == null) {
      node.data[property] = [value]
    } else if (!node.data[property].includes(value)) {
      node.data[property] = [...node.data[property], value]
    }

    return true
  }

  removeFromProperty(id, property, value) {
    let node = this.get(id)
    if (node == null || node.data[property] == null) return false

    node.data[property] = node.data[property].filter(x => x !== value)
    if (node.data[property].length === 0) delete node.data[property]

    return true
  }

  updateProperty(id, property, values) {
    let node = this.get(id)
    if (node == null) return false

    if (values == null || values.length === 0) delete node.data[property]
    else node.data[property] = values

    return true
  }

  removeProperty(id, property) {
    return this.updateProperty(id, property, null)
  }
}

module.exports = Draft
