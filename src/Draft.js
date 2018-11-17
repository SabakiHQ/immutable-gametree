class Draft {
    constructor(base) {
        this._base = base
        this.getId = base.getId
        this.root = base.root

        this._cache = {}
        this._removed = {}
    }

    get(id) {
        if (this._cache[id] != null) return this._cache[id]
        if (id in this._removed) return null

        let node = this._base.get(id)
        let nodeCopy = Object.assign({}, node, {
            data: Object.assign({}, node.data),
            children: [...node.children]
        })

        if (node.parentId != null) {
            let parentCopy = this.makeCopy(node.parentId)
            let childIndex = parentCopy.children.findIndex(child => child.id === id)
            if (childIndex >= 0) parentCopy.children[childIndex] = nodeCopy
        }

        this._cache[id] = nodeCopy
        if (this.root.id === id) this.root = nodeCopy

        return nodeCopy
    }

    mutate(mutator) {
        mutator(this)
        return this
    }

    appendNode(parentId, data) {
        let parent = this.get(parentId)
        if (parent == null) return [null, this]

        let id = this.getId()
        let node = {id, data, parentId, children: []}

        parent.children.push(node)
        this._cache[id] = node

        return [id, this]
    }

    removeNode(id) {
        let node = this._base.get(id)
        if (node == null) return [false, this]

        let parentId = node.parentId
        if (parentId == null) throw new Error('Cannot remove root node')

        let parent = this.get(parentId)
        if (parent == null) return [false, this]

        let index = parent.children.findIndex(child => child.id === id)
        if (index >= 0) parent.children.splice(index, 1)
        else return [false, this]

        delete this._cache[id]
        this._removed[id] = true

        return [true, this]
    }

    shiftNode(id, direction) {
        if (!['left', 'right', 'main'].includes(direction)) {
            throw new Error('Invalid value for direction')
        }

        let node = this._base.get(id)
        if (node == null) return [null, this]

        let {parentId} = node
        let parent = this.get(parentId)
        if (parent == null) return [null, this]

        let index = parent.children.findIndex(child => child.id === id)
        if (index < 0) return [null, this]

        let newIndex = direction === 'left' ? Math.max(index - 1, 0)
            : direction === 'right' ? Math.min(index + 1, parent.children.length)
            : 0

        if (index !== newIndex) {
            let [child] = parent.children.splice(index, 1)
            parent.children.splice(newIndex, 0, child)
        }

        return [newIndex, this]
    }
}

module.exports = Draft
