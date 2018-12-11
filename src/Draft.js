class Draft {
    constructor(base) {
        this.base = base
        this.root = base.root

        this._cache = {}
        this._heightCache = null
    }

    get(id) {
        if (id == null) return null
        if (this._cache[id] != null) return this._cache[id]

        let node = this.base.get(id)
        if (node == null) {
            this._cache[id] = null
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

        this._cache[id] = nodeCopy
        if (this.root.id === id) this.root = nodeCopy

        return nodeCopy
    }

    appendNode(parentId, data) {
        let parent = this.get(parentId)
        if (parent == null) return null

        let id = this.base.getId()
        let node = {id, data, parentId, children: []}

        parent.children.push(node)

        this._cache[id] = node
        this._heightCache = null

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

        this._cache[id] = null
        this._heightCache = null

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
