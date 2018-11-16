class GameTree {
    constructor({rootNode = {}, getId = null} = {}) {
        this.getId = getId || (() => {
            let id = 0
            return () => id++
        })()

        this.root = {
            id: this.getId(),
            nodes: [rootNode],
            children: []
        }
    }
}

module.exports = GameTree
