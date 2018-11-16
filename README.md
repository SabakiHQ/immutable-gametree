# immutable-gametree

An immutable SGF game tree data type. This is a work in progress.

## API

~~~js
const GameTree = require('@sabaki/immutable-gametree')

let tree = new GameTree()

tree.mutate([tree.root.id], ([rootNode]) => {
    rootNode.B = ['dd']
    return rootNode
}).then((rootNode, mutate) => mutate([rootNode.id], ([rootNode]) => {
    rootNode.W = ['dq']
}))
~~~
