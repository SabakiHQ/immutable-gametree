class GameTree {
    constructor({getId = null} = {}) {
        this.getId = getId || (() => {
            let id = 0
            return () => id++
        })()

        this.root = {
            id: this.getId(),
            data: {},
            parentId: null,
            children: []
        }

        this._cache = {}
    }

    getNode(id) {
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

            let nodeCopy = Object.assign({}, this.getNode(id), {
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

        let copies = ids.map(id => getCopy(id))
        mutator(copies)

        let tree = new GameTree({getId: this.getId})
        tree.root = cacheCopy[this.root.id]
        tree._cache = cacheCopy

        return tree
    }
}

module.exports = GameTree
