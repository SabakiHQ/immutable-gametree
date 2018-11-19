# @sabaki/immutable-gametree [![Build Status](https://travis-ci.org/SabakiHQ/immutable-gametree.svg?branch=master)](https://travis-ci.org/SabakiHQ/immutable-gametree)

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
    let id1 = draft.appendNode(draft.root.id, {B: ['dd']})
    let id2 = draft.appendNode(id1, {W: ['dq']})

    draft.addToProperty(id2, 'W', 'qd')
})

console.log(newTree !== tree)
// => true

console.log(newTree.root.children.length)
// => 1

console.log(newTree.root.children[0].children[0].data.W)
// => ['dq', 'qd']
~~~

## API

### Node Object

A *node* is represented by an object of the following form:

~~~js
{
    id: <Primitive>,
    data: {
        [property]: <Array<Primitive>>
    },
    parentId: <Primitive> | null,
    children: <Array<NodeObject>>
}
~~~

### `class GameTree`
#### `new GameTree([options])`

- `options` `<Object>` *(optional)*
    - `getId` `<Function>` *(optional)*
    - `root` [`<NodeObject>`](#node-object) *(optional)*

#### `tree.getId`

`<Function>` - The `getId` function will be called to get an id for each appended node. It should return a primitive value which is unique for each call. Defaults to a simple counter.

#### `tree.root`

[`<NodeObject>`](#node-object) - The root node.

#### `tree.get(id)`

- `id` `<Primitive>`

Searches the whole tree for a node with the specified id and returns a [node object](#node-object). If a node with the specified id doesn't exist, it will return `null`. Each instance of `GameTree` will maintain a cache.

Please refrain from mutating the returned object to ensure immutability.

#### `tree.mutate(mutator)`

- `mutator` `<Function>`

The `mutator` will be called with a [`Draft`](#class-draft) class. In the `mutator` function you will apply all your changes to the draft. Returns a new `GameTree` instance with the changes you applied to the draft, without changing the original `GameTree` instance.

We use structural sharing to make mutations fairly efficient.

#### `JSON.stringify(tree)`

Returns the root [node object](#node-object) (and effectively, all node objects) as JSON.

### `class Draft`

#### `draft.appendNode(parentId, data)`

- `parentId` `<Primitive>`
- `data` `<Object>`

#### `draft.removeNode(id)`

- `id` `<Primitive>`

#### `draft.shiftNode(id, direction)`

- `id` `<Primitive>`
- `direction` `<String>` - One of `'left'`, `'right'`, `'main'`

#### `draft.addToProperty(id, property, value)`

- `id` `<Primitive>`
- `property` `<String>`
- `value` `<Primitive>`

#### `draft.removeFromProperty(id, property, value)`

- `id` `<Primitive>`
- `property` `<String>`
- `value` `<Primitive>`

#### `draft.updateProperty(id, property, values)`

- `id` `<Primitive>`
- `property` `<String>`
- `values` `<Array<Primitive>>`

#### `draft.removeProperty(id, property)`

- `id` `<Primitive>`
- `property` `<String>`
