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

    navigate(id, step, currents) {
        step = Math.sign(step)

        let node = this.get(id)
        if (step < 0) return this.get(node.parentId)

        return currents[node.id] != null
            ? this.get(currents[node.id])
            : node.children[0] || null
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

    *listNodesHorizontally(startId, step) {
        step = Math.sign(step) || 1

        let level = this.getLevel(startId)
        let section = [...this.getSection(level)]
        let index = section.findIndex(node => node.id === startId)

        while (index >= 0) {
            while (0 <= index && index < section.length) {
                yield section[index]
                index += step
            }

            level += step
            section = [...this.getSection(level)]
            index = step > 0 ? 0 : section.length - 1
        }
    }

    *listCurrentNodes(currents) {
        let node = this.root

        while (node != null) {
            yield node
            node = this.navigate(node.id, 1, currents)
        }
    }

    *listMainNodes() {
        yield* this.listCurrentNodes({})
    }

    getLevel(id) {
        if (id === this.root.id) return 0

        return this.getLevel(this.get(id).parentId) + 1
    }

    *getSection(level) {
        if (level === 0) {
            yield this.root
            return
        }

        for (let parent of this.getSection(level - 1)) {
            yield* parent.children
        }
    }

    getCurrentHeight(currents) {
        let inner = node => {
            if (node == null) return 0

            let child = currents[node.id] == null
                ? node.children[0]
                : node.children.find(child => child.id === currents[node.id])

            return 1 + inner(child)
        }

        return inner(this.root)
    }

    getHeight() {
        if (this._heightCache == null) {
            let inner = node => 1 + Math.max(...node.children.map(inner), 0)
            this._heightCache = inner(this.root)
        }

        return this._heightCache
    }

    onCurrentLine(id, currents) {
        let node = this.get(id)
        let {parentId} = node

        return parentId == null
            || (
                node.id === currents[parentId]
                || currents[parentId] == null
                && this.get(parentId).children[0] === node
            )
            && this.onCurrentLine(parentId, currents)
    }

    onMainLine(id) {
        return this.onCurrentLine(id, {})
    }

    toJSON() {
        return this.root
    }
}

module.exports = GameTree
