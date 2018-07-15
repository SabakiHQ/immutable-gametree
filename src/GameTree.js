class GameTree {
    constructor(rootNode = {}) {
        this.root = {
            id: 0,
            nodes: [rootNode],
            children: []
        }

        this.maxId = 0
        this.currents = {}
        this.parents = {}

        this.idCache = {}
    }

    findTree(id) {
        if (id == null) return null

        let cached = this.idCache[id]
        if (cached != null) return cached

        if (this.parents[id] == null) {
            this.idCache[id] = this.root
            return this.root
        }

        let parent = this.findTree(this.parents[id])

        let result = parent.children.find(child => child.id === id)
        this.idCache[id] = result

        return result
    }

    updateTree(id, update) {
        let result = this.clone()

        let updateInner = (id, update) => {
            let parentId = this.parents[id]
            let tree = this.findTree(id)
            let newTree = Object.assign({}, tree, update)

            result.idCache[id] = newTree
            if (tree == null) return null
            if (parentId == null) return newTree

            let parent = this.findTree(parentId)
            let newRoot = updateInner(parentId, {
                children: parent.children.map(
                    child => child.id !== id ? child : newTree
                )
            })

            return newRoot
        }

        result.root = updateInner(id, update)
        return result.root == null ? this : result
    }

    updateNode(id, index, update) {
        let tree = this.findTree(id)
        if (tree == null || index < 0 || index >= tree.nodes.length) return this

        return this.updateTree(id, {
            nodes: tree.nodes.map(
                (node, i) => i !== index ? node : Object.assign({}, node, update)
            )
        })
    }

    pushNodes(id, index, ...nodes) {
        let tree = this.findTree(id)
        if (tree == null || index < 0 || index >= tree.nodes.length) return this

        if (index === tree.nodes.length - 1 && tree.children.length === 0) {
            // Append nodes to existing tree

            return this.updateTree(id, {
                nodes: [...tree.nodes, ...nodes]
            })
        } else if (index === tree.nodes.length - 1) {
            // Append new tree with nodes

            let newTree = {id: ++this.maxId, nodes, children: []}
            let result = this.updateTree(id, {
                children: [...tree.children, newTree]
            })

            result.parents = Object.assign({}, this.parents, {[newTree.id]: id})
            return result
        }

        // Insert new tree in the middle of a tree

        let bottom = {
            id: ++this.maxId,
            nodes: tree.nodes.slice(index + 1),
            children: tree.children
        }
        let newTree = {
            id: ++this.maxId,
            nodes,
            children: []
        }
        let top = {
            nodes: tree.nodes.slice(0, index + 1),
            children: [bottom, newTree]
        }

        let result = this.updateTree(id, top)

        result.parents = Object.assign(
            {}, this.parents,
            ...top.children.map(child => ({[child.id]: id})),
            ...bottom.children.map(child => ({[child.id]: bottom.id}))
        )

        return result
    }

    removeNode(id, index) {
        let tree = this.findTree(id)
        if (tree == null || index < 0 || index >= tree.nodes.length) return this

        if (index !== 0) {
            // Snip off all nodes which come after

            return this.updateTree(id, {
                nodes: tree.nodes.slice(0, index),
                children: []
            })
        }

        // Remove tree

        let parent = this.findTree(this.parents[id])
        if (parent == null) throw new Error('Root node cannot be removed.')

        if (parent.children.length >= 3 || parent.children.length === 1) {
            let result = this.updateTree(parent.id, {
                children: parent.children.filter(child => child.id !== id)
            })

            if ((result.currents[parent.id] || 0) === parent.children.indexOf(tree)) {
                result.currents = Object.assign({}, this.currents)

                if (parent.children.length > 1) {
                    result.currents[parent.id] = Math.max(this.currents[parent.id] - 1, 0)
                } else {
                    delete result.currents[parent.id]
                }
            }

            return result
        }

        // Normalize tree structure

        let child = parent.children.find(child => child.id !== id)
        let result = this.updateTree(parent.id, {
            nodes: [...parent.nodes, ...child.nodes],
            children: child.children
        })

        result.parents = Object.assign(
            {}, this.parents,
            child.children.map(child => ({[child.id]: parent.id}))
        )

        result.currents = Object.assign(
            {}, this.currents,
            {[parent.id]: this.currents[child.id]}
        )

        delete result.currents[id]
        delete result.currents[child.id]
        delete result.parents[id]
        delete result.parents[child.id]

        return result
    }

    clone() {
        return Object.assign(new GameTree(), this, {
            idCache: {}
        })
    }
}

module.exports = GameTree
