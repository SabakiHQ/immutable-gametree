const Draft = require('./Draft')

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
                if (result != null) return result
            }

            return null
        }

        let node = inner(this.root)

        if (node == null) {
            this._cache[id] = null
            return null
        }

        for (let child of node.children) {
            this._cache[child.id] = child
        }

        return node
    }

    mutate(mutator) {
        let draft = new Draft(this)

        mutator(draft)
        if (draft.root === this.root) return this

        let tree = new GameTree({
            getId: this.getId,
            root: draft.root
        })

        tree._cache = draft._cache
        return tree
    }

    toJSON() {
        return this.root
    }
}

module.exports = GameTree
