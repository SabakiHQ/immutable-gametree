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

---

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

#### `tree.toJSON()`

Returns `tree.root`.

---

### `class Draft`
#### `draft.root`

See [tree.root](#treeroot).

#### `draft.get(id)`

- `id` `<Primitive>`

See [tree.get(id)](#treegetid).

#### `draft.appendNode(parentId, data)`

- `parentId` `<Primitive>`
- `data` `<Object>`

Appends a new node with the given `data` to the node with id `parentId`. Returns `null` if operation has failed, otherwise the id of the new node.

#### `draft.removeNode(id)`

- `id` `<Primitive>`

Removes the node with given `id`. Throws an error if specified `id` represents the root node. Returns `false` if operation has failed, otherwise `true`.

#### `draft.shiftNode(id, direction)`

- `id` `<Primitive>`
- `direction` `<String>` - One of `'left'`, `'right'`, `'main'`

Changes the position of the node with the given `id` in the children array of its parent node. If `direction` is `'main'`, the node will be shifted to the first position. Returns `null` if operation has failed, otherwise the new index.

#### `draft.addToProperty(id, property, value)`

- `id` `<Primitive>`
- `property` `<String>`
- `value` `<Primitive>`

Adds the given `value` to the specified `property` of the node with the given `id`. Ignores duplicate values. If data doesn't include the given `property`, it will add it.

#### `draft.removeFromProperty(id, property, value)`

- `id` `<Primitive>`
- `property` `<String>`
- `value` `<Primitive>`

Removes the given `value` from the specified `property` of the node with the given `id`. If property list gets empty, the property key will be removed from data.

#### `draft.updateProperty(id, property, values)`

- `id` `<Primitive>`
- `property` `<String>`
- `values` `<Array<Primitive>>`

Sets the specified `property` of the node with the given `id` as `values`. Refrain from mutating `values` to ensure immutability.

#### `draft.removeProperty(id, property)`

- `id` `<Primitive>`
- `property` `<String>`

Removes the specified `property` from the node.
