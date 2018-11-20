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
        this._heightCache = null
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

    *getSequence(id) {
        let node = this.get(id)
        yield node

        if (node.children.length !== 1) return
        yield* this.getSequence(node.children[0].id)
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

    *listNodes() {
        function* inner(node) {
            yield node

            for (let child of node.children) {
                yield* inner(child)
            }
        }

        yield* inner(this.root)
    }

    getHeight() {
        if (this._heightCache == null) {
            let inner = node => 1 + Math.max(...node.children.map(inner), 0)
            this._heightCache = inner(this.root)
        }

        return this._heightCache
    }

    toJSON() {
        return this.root
    }
}

module.exports = GameTree
