# immutable-gametree

An immutable SGF game tree data type. This is a work in progress.

## API

~~~js
const GameTree = require('@sabaki/immutable-gametree')

let tree = new GameTree()

let newTree = tree.mutate(draft => {
    let [id, ] = draft.appendNode(tree.root.id, {B: ['dd']})
    draft.appendNode(id, {W: ['dq']})
})

console.log(newTree === tree)
console.log(newTree.root)
~~~
