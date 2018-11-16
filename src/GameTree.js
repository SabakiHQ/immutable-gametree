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

    appendNode(data) {
        return ([parent], cache) => {
            let id = this.getId()
            let node = {id, data, parentId: parent.id, children: []}

            parent.children.push(node)
            cache[id] = node

            return id
        }
    }
}

module.exports = GameTree
