# @sabaki/immutable-gametree [![Build Status](https://github.com/SabakiHQ/immutable-gametree/workflows/CI/badge.svg?branch=master)](https://github.com/SabakiHQ/immutable-gametree/actions)

An immutable game tree data type.

## Installation

Use npm to install:

```
$ npm install @sabaki/immutable-gametree
```

## Usage

```js
const GameTree = require('@sabaki/immutable-gametree')

let tree = new GameTree()

let newTree = tree.mutate(draft => {
  let id1 = draft.appendNode(draft.root.id, {B: ['dd']})
  let id2 = draft.appendNode(id1, {W: ['dq']})

  draft.addToProperty(id2, 'W', 'qd')
})

console.log(newTree !== tree)
// => true
console.log(tree.root.children.length)
// => 0
console.log(newTree.root.children.length)
// => 1
console.log(newTree.root.children[0].children[0].data.W)
// => ['dq', 'qd']
```

## API

### Node Object

A node is represented by an object of the following form:

```js
{
  id: <Primitive>,
  data: {
    [property: <String>]: <Array<Primitive>>
  },
  parentId: <Primitive> | null,
  children: <Array<NodeObject>>
}
```

### Currents Object

A node can have a distinguished child. You can specify the distinguished
children of nodes with an object of the following form:

```js
{
  [id: <Primitive>]: <Primitive>
}
```

Every value is the id of the distinguished child of the node with its key as id.
If the currents object doesn't specify a distinguished child for a node, the
default will be the first child index-wise.

---

### `class GameTree`

#### `new GameTree([options])`

- `options` `<Object>` _(optional)_
  - `getId` `<Function>` _(optional)_
  - `merger` `<Function>` _(optional)_
  - `root` [`<NodeObject>`](#node-object) _(optional)_

#### `tree.getId`

`<Function>` - The `getId` function will be called to get an id for each
appended node. It should return a primitive value which is unique for each call.
Defaults to a simple counter.

This property will be inherited across mutations.

#### `tree.merger`

`<Function>` - When appending a new node during mutations, you can instruct your
`GameTree` to automatically merge your new data into an existing node when
desired. The merger function has the following signature:

```js
(node: <NodeObject>, data: <Object>) -> <Object> | null
```

where `node` is a merge candidate and `data` the data to be appended. Return
`null` if you do not want `data` to be merged into the existing `node`. Return
an object (representing the merged data) if you want `node` to get that data
instead (and no new nodes are going to be appended).

This property will be inherited across mutations.

#### `tree.root`

[`<NodeObject>`](#node-object) - The root node.

#### `tree.get(id)`

- `id` `<Primitive>`

Searches the whole tree for a node with the specified id and returns a
[node object](#node-object). If a node with the specified id doesn't exist, it
will return `null`. Each instance of `GameTree` will maintain a cache.

Please refrain from mutating the returned object to ensure immutability.

#### `*tree.getSequence(id)`

A generator function that yields [node objects](#node-objects), starting with
the node of the given `id` and continuing with its children until we reach a
descendant which has multiple or no children.

#### `tree.mutate(mutator)`

- `mutator` `<Function>`

The `mutator` will be called with a [`Draft`](#class-draft) class. In the
`mutator` function you will apply all your changes to the draft. Returns a new
`GameTree` instance with the changes you applied to the draft, without changing
the original `GameTree` instance.

We use structural sharing to make mutations fairly efficient.

#### `tree.navigate(id, step, currents)`

- `id` `<Primitive>`
- `step` `<Integer>`
- `currents` [`<CurrentsObject>`](#currents-object)

Starts at the node with the given `id`, takes the specified `step` forward or
backward with respect to `currents`, and returns the node at the new position.

#### `*tree.listNodes()`

A generator function that yields all the nodes as [node objects](#node-object)
of the game tree.

#### `*tree.listNodesHorizontally(startId, step)`

- `startId` `<Primitive>`
- `step` `<Integer>` - `1` or `-1`

A generator function that yields the nodes as [node objects](#node-object) of
the game tree by walking horizontally along the game tree (left if `step` is
`-1`, otherwise right) starting at the node with id `startId`.

#### `*tree.listNodesVertically(startId, step, currents)`

- `startId` `<Primitive>`
- `step` `<Integer>` - `1` or `-1`
- `currents` [`<CurrentsObject>`](#currents-object)

A generator function that yields the nodes as [node objects](#node-object) of
the game tree by walking vertically along given `currents` (up if `step` is
`-1`, otherwise down) starting at the node with id `startId`.

#### `*tree.listCurrentNodes(currents)`

- `currents` [`<CurrentsObject>`](#currents-object)

Equivalent to `tree.listNodesVertically(tree.root.id, 1, currents)`.

#### `*tree.listMainNodes()`

Equivalent to `tree.listCurrentNodes({})`.

#### `tree.getLevel(id)`

- `id` `<Primitive>`

Returns an integer denoting the level of the node with the given `id`. If node
doesn't exist, it will return `null`.

#### `*tree.getSection(level)`

- `level` `<Integer>`

A generator function that yields all nodes of the given `level`.

#### `tree.getCurrentHeight(currents)`

- `currents` [`<CurrentsObject>`](#currents-object)

Equivalent to `[...tree.listCurrentNodes(currents)].length`.

#### `tree.getHeight()`

Calculates and returns the height of the tree as an integer. This value will be
cached across mutations when possible.

#### `tree.getHash()`

Calculates and returns a hash of the whole tree as a string. This value will
be cached.

#### `tree.getStructureHash()`

Calculates and returns a hash of the tree structure as a string. This value will
be cached across mutations when possible.

#### `tree.onCurrentLine(id, currents)`

- `id` `<Primitive>`
- `currents` [`<CurrentsObject>`](#currents-object)

Returns whether the node with the given `id` is the root node or a distinguished
descendant of the root node with respect to `currents`.

#### `tree.onMainLine(id)`

- `id` `<Primitive>`

Equivalent to `tree.onCurrentLine(id, {})`.

#### `tree.toJSON()`

Returns `tree.root`.

---

### `class Draft`

#### `draft.root`

See [tree.root](#treeroot).

#### `draft.get(id)`

- `id` `<Primitive>`

See [tree.get(id)](#treegetid).

#### `draft.appendNode(parentId, data[, options])`

- `parentId` `<Primitive>`
- `data` `<Object>`
- `options` `<Object>` _(optional)_
  - `disableMerging` `<Boolean>` - Default: `false`

Appends a new node with the given `data` to the node with id `parentId`. Returns
`null` if operation has failed, otherwise the id of the new node. If
`disableMerging` is set to `true`, automatic merging via
[`tree.merger`](#treemerger) will be disabled.

#### `draft.UNSAFE_appendNodeWithId(parentId, id, data[, options])`

- `parentId` `<Primitive>`
- `id` `<Primitive>`
- `data` `<Object>`
- `options` `<Object>` _(optional)_ - See
  [`draft.appendNode`](#draftappendnodeparentid-data-options)

Appends a new node with the given `id` and `data` to the node with id
`parentId`. Returns `false` if operation has failed, otherwise `true`.

Make sure the `id` provided does not already exist in the tree and that the
`getId` function will never return `id`. We won't do any checks for you.

#### `draft.removeNode(id)`

- `id` `<Primitive>`

Removes the node with given `id`. Throws an error if specified `id` represents
the root node. Returns `false` if operation has failed, otherwise `true`.

#### `draft.shiftNode(id, direction)`

- `id` `<Primitive>`
- `direction` `<String>` - One of `'left'`, `'right'`, `'main'`

Changes the position of the node with the given `id` in the children array of
its parent node. If `direction` is `'main'`, the node will be shifted to the
first position. Returns `null` if operation has failed, otherwise the new index.

#### `draft.makeRoot(id)`

- `id` `<Primitive>`

Makes the node with the given `id` the root node of the mutated tree. Returns
`false` if operation has failed, otherwise `true`.

#### `draft.addToProperty(id, property, value)`

- `id` `<Primitive>`
- `property` `<String>`
- `value` `<Primitive>`

Adds the given `value` to the specified `property` of the node with the given
`id`. Ignores duplicate values. If data doesn't include the given `property`, it
will add it. Returns `false` if operation has failed, otherwise `true`.

#### `draft.removeFromProperty(id, property, value)`

- `id` `<Primitive>`
- `property` `<String>`
- `value` `<Primitive>`

Removes the given `value` from the specified `property` of the node with the
given `id`. If property list gets empty, the property key will be removed from
data. Returns `false` if operation has failed, otherwise `true`.

#### `draft.updateProperty(id, property, values)`

- `id` `<Primitive>`
- `property` `<String>`
- `values` `<Array<Primitive>>`

Sets the specified `property` of the node with the given `id` as `values`.
Refrain from mutating `values` to ensure immutability. Returns `false` if
operation has failed, otherwise `true`.

#### `draft.removeProperty(id, property)`

- `id` `<Primitive>`
- `property` `<String>`

Removes the specified `property` from the node. Returns `false` if operation has
failed, otherwise `true`.

## Related

- [crdt-gametree](https://github.com/SabakiHQ/crdt-gametree) - An immutable,
  conflict-free replicated game tree data type.
