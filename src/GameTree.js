class GameTree {
    constructor({getId = null, root = null} = {}) {
        this.getId = getId || (() => {
            let id = 0
            return () => id++
        })()

        this.root = root || {
            id: this.getId(),
            data: {},
            parentId: null,
            children: []
        }

        this._cache = {}
    }

    get(id) {
        if (id in this._cache) return this._cache[id]

        let inner = node => {
            this._cache[node.id] = node
            if (node.id === id) return node

            for (let child of node.children) {
                let result = inner(child)
                if (result) return result
            }

            return null
        }

        return inner(this.root)
    }

    mutate(ids, mutator) {
        let cacheCopy = {}

        let getCopy = id => {
            if (cacheCopy[id] != null) return cacheCopy[id]

            let node = this.get(id)
            let nodeCopy = Object.assign({}, node, {
                data: Object.assign({}, node.data),
                children: [...node.children]
            })

            if (node.parentId != null) {
                let parentCopy = getCopy(node.parentId)
                let childIndex = parentCopy.children.indexOf(node)
                if (childIndex >= 0) parentCopy.children[childIndex] = nodeCopy
            }

            cacheCopy[id] = nodeCopy
            return nodeCopy
        }

        let inner = (ids, mutator) => {
            let copies = ids.map(id => getCopy(id))
            let result = mutator(copies, cacheCopy)

            let fluent = {
                then: f => f(result, inner),
                done: () => {
                    let tree = new GameTree({
                        getId: this.getId,
                        root: cacheCopy[this.root.id]
                    })

                    tree._cache = cacheCopy
                    return tree
                }
            }

            return fluent
        }

        return inner(ids, mutator)
    }

    /* Mutators */

    appendNode(data) {
        return ([parent], cache) => {
            let id = this.getId()
            let node = {id, data, parentId: parent.id, children: []}

            parent.children.push(node)
            cache[id] = node

            return id
        }
    }

    removeNode() {
        return ([node], cache) => {
            let parent = cache[node.parentId]

            let nodeIndex = parent.children.findIndex(child => child.id === node.id)
            if (nodeIndex >= 0) parent.children.splice(nodeIndex, 1)

            delete cache[node.id]
        }
    }

    shiftNode(direction) {
        if (!['left', 'right', 'main'].includes(direction)) return () => {}

        return ([node], cache) => {
            let parent = cache[node.parentId]

            let nodeIndex = parent.children.findIndex(child => child.id === node.id)

            if (nodeIndex >= 0) {
                let newIndex = direction === 'left' ? newIndex - 1
                    : direction === 'right' ? newIndex + 1
                    : 0

                let [node] = parent.children.splice(nodeIndex, 1)
                parent.children.splice(newIndex, 0, node)
            }
        }
    }
}

module.exports = GameTree
