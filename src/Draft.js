class Draft {
    constructor(base) {
        this.base = base
        this.root = base.root

        this._passOnNodeCache = true

        this._nodeCache = {}
        this._heightCache = null
    }

    get(id) {
        if (id == null) return null
        if (id in this._nodeCache) return this._nodeCache[id]

        let node = this.base.get(id)
        if (node == null) {
            this._nodeCache[id] = null
            return null
        }

        let nodeCopy = Object.assign({}, node, {
            data: Object.assign({}, node.data),
            children: [...node.children]
        })

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
        if (id === this.root.id) return 0

        let node = this.get(id)
        if (node == null) return null

        return this._getLevel(node.parentId) + 1
    }

    appendNode(parentId, data) {
        let parent = this.get(parentId)
        if (parent == null) return null

        let id = this.base.getId()
        let node = {id, data, parentId, children: []}

        parent.children.push(node)

        this._nodeCache[id] = node

        if (this._getLevel(parentId) === this._heightCache - 1) {
            this._heightCache++
        }

        return id
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

        if (this._getLevel(id) === this._heightCache - 1) {
            this._heightCache = null
        }

        return true
    }

    shiftNode(id, direction) {
        if (!['left', 'right', 'main'].includes(direction)) {
            throw new Error(`Invalid value for direction, only 'left', 'right', or 'main' allowed`)
        }

        let node = this.get(id)
        if (node == null) return null

        let {parentId} = node
        let parent = this.get(parentId)
        if (parent == null) return null

        let index = parent.children.findIndex(child => child.id === id)
        if (index < 0) return null

        let newIndex = direction === 'left' ? Math.max(index - 1, 0)
            : direction === 'right' ? Math.min(index + 1, parent.children.length)
            : 0

        if (index !== newIndex) {
            let [child] = parent.children.splice(index, 1)
            parent.children.splice(newIndex, 0, child)
        }

        return newIndex
    }

    makeRoot(id) {
        if (id === this.root.id) return true

        let node = this.get(id)
        if (node == null) return false

        this.root = node
        this._passOnNodeCache = false
        this._heightCache = null

        return true
    }

    addToProperty(id, property, value) {
        let node = this.get(id)
        if (node == null) return

        if (node.data[property] == null) {
            node.data[property] = [value]
        } else if (!node.data[property].includes(value)) {
            node.data[property] = [...node.data[property], value]
        }
    }

    removeFromProperty(id, property, value) {
        let node = this.get(id)
        if (node == null || node.data[property] == null) return

        node.data[property] = node.data[property].filter(x => x !== value)
        if (node.data[property].length === 0) delete node.data[property]
    }

    updateProperty(id, property, values) {
        let node = this.get(id)
        if (node == null) return

        if (values == null || values.length === 0) delete node.data[property]
        else node.data[property] = values
    }

    removeProperty(id, property) {
        this.updateProperty(id, property, null)
    }
}

module.exports = Draft
