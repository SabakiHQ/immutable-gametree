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
                if (result) return result
            }

            return null
        }

        return inner(this.root)
    }

    mutate(mutator) {
        let draft = new Draft(this)
        mutator(draft)

        let tree = new GameTree({
            getId: this.getId,
            root: draft.root
        })

        tree._cache = draft.cache
        return tree
    }

    appendNode(parentId, data) {
        let result = null
        let tree = this.mutate(draft => {
            result = draft.appendNode(parentId, data)[0]
        })

        return [result, tree]
    }

    removeNode(id) {
        let result = null
        let tree = this.mutate(draft => {
            result = draft.removeNode(id)[0]
        })

        return [result, tree]
    }

    shiftNode(id, direction) {
        let result = null
        let tree = this.mutate(draft => {
            result = draft.shiftNode(id, direction)[0]
        })

        return [result, tree]
    }
}

module.exports = GameTree
