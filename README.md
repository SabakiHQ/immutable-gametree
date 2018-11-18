# immutable-gametree

An immutable SGF game tree data type. This is a work in progress.

## Installation

Use npm to install:

~~~
$ npm install @sabaki/immutable-gametree
~~~

## Usage

~~~js
const GameTree = require('@sabaki/immutable-gametree')

let tree = new GameTree()

let newTree = tree.mutate(draft => {
    let id = draft.appendNode(draft.root.id, {B: ['dd']})
    draft.appendNode(id, {W: ['dq']})
})

console.log(newTree !== tree)
// => true

console.log(newTree.root.children.length)
// => 1

console.log(newTree.root.children[0].children[0].data.W)
// => ['dq']
~~~
