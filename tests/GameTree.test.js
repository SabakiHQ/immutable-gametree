const t = require('tap')
const {tree, id1, childId1, childId2, childId3, subChildId1} = require('./data')

t.test('get method', t => {
  let node = tree.get(subChildId1)
  let parent = tree.get(childId3)

  t.deepEqual(node, {
    id: subChildId1,
    data: {B: ['dq']},
    parentId: childId3,
    children: []
  })

  t.equal(parent.children[0], node)
  t.end()
})

t.test('getSequence method', t => {
  let sequence1 = [...tree.getSequence(tree.root.id)]
  t.deepEqual(sequence1, [tree.root, tree.get(id1)])

  let sequence2 = [...tree.getSequence(childId3)]
  t.deepEqual(sequence2, [tree.get(childId3), tree.get(subChildId1)])

  t.deepEqual([...tree.getSequence(null)], [])
  t.end()
})

t.test('mutation uses structural sharing', t => {
  let newTree = tree.mutate(draft => {
    draft.updateProperty(childId1, 'MA', null)
  })

  let node = tree.get(childId2)
  let newNode = newTree.get(childId2)

  t.equal(node, newNode)
  t.end()
})

t.test('navigate method', t => {
  t.equal(tree.navigate(tree.root.id, 1, {}).id, id1)
  t.equal(tree.navigate(id1, -1, {}).id, tree.root.id)
  t.equal(tree.navigate(id1, 1, {}).id, childId1)
  t.equal(tree.navigate(id1, 1, {[id1]: childId2}).id, childId2)
  t.equal(tree.navigate('not found', 1, {}), null)

  t.end()
})

t.test('navigate multiple steps ahead or behind', t => {
  t.equal(tree.navigate(childId2, -2, {}).id, tree.root.id)
  t.equal(tree.navigate(tree.root.id, 3, {[id1]: childId3}).id, subChildId1)
  t.equal(tree.navigate(tree.root.id, 4, {[id1]: childId3}), null)
  t.equal(tree.navigate(tree.root.id, -4, {[id1]: childId3}), null)

  t.end()
})

t.test('listNodes method', t => {
  let nodes = [...tree.listNodes()]

  t.equal(nodes.length, 6)
  t.end()
})

t.test('listNodesHorizontally method', t => {
  let list = [
    tree.root,
    tree.get(id1),
    tree.get(childId1),
    tree.get(childId2),
    tree.get(childId3),
    tree.get(subChildId1)
  ]

  t.deepEqual([...tree.listNodesHorizontally(tree.root.id, 1)], list)
  t.deepEqual([...tree.listNodesHorizontally(tree.root.id, -1)], [tree.root])
  t.deepEqual(
    [...tree.listNodesHorizontally(childId3, -1)],
    list.slice(0, 5).reverse()
  )
  t.deepEqual(
    [...tree.listNodesHorizontally(subChildId1, -1)],
    list.slice().reverse()
  )
  t.deepEqual([...tree.listNodesHorizontally(null, 1)], [])

  t.end()
})

t.test('listNodesVertically method', t => {
  t.deepEqual(
    [...tree.listNodesVertically(tree.root.id, 1, {})],
    [tree.root, tree.get(id1), tree.get(childId1)]
  )
  t.deepEqual([...tree.listNodesVertically(tree.root.id, -1, {})], [tree.root])
  t.deepEqual(
    [...tree.listNodesVertically(tree.root.id, 1, {[id1]: childId3})],
    [tree.root, tree.get(id1), tree.get(childId3), tree.get(subChildId1)]
  )
  t.deepEqual(
    [...tree.listNodesVertically(childId3, -1, {})],
    [tree.get(childId3), tree.get(id1), tree.root]
  )
  t.deepEqual(
    [...tree.listNodesVertically(subChildId1, -1)],
    [tree.get(subChildId1), tree.get(childId3), tree.get(id1), tree.root]
  )
  t.deepEqual([...tree.listNodesVertically(null, 1)], [])

  t.end()
})

t.test('listCurrentNodes method', t => {
  t.deepEqual(
    [...tree.listCurrentNodes({})],
    [tree.root, tree.get(id1), tree.get(childId1)]
  )

  t.deepEqual(
    [...tree.listCurrentNodes({[id1]: childId3})],
    [tree.root, tree.get(id1), tree.get(childId3), tree.get(subChildId1)]
  )

  t.end()
})

t.test('getLevel method', t => {
  t.equal(tree.getLevel(tree.root.id), 0)
  t.equal(tree.getLevel(id1), 1)
  t.equal(tree.getLevel(childId2), 2)
  t.equal(tree.getLevel(subChildId1), 3)

  t.end()
})

t.test('getLevel should return null if node is not found', t => {
  t.equal(tree.getLevel('not found'), null)
  t.end()
})

t.test('getSection method', t => {
  t.deepEqual([...tree.getSection(-1)], [])
  t.deepEqual([...tree.getSection(0)], [tree.root])
  t.deepEqual(
    [...tree.getSection(2)],
    [tree.get(childId1), tree.get(childId2), tree.get(childId3)]
  )
  t.deepEqual([...tree.getSection(3)], [tree.get(subChildId1)])
  t.deepEqual([...tree.getSection(4)], [])

  t.end()
})

t.test('getCurrentHeight method', t => {
  t.equal(tree.getCurrentHeight({}), 3)
  t.equal(tree.getCurrentHeight({[id1]: childId3}), 4)

  t.end()
})

t.test('onCurrentLine method', t => {
  t.equal(tree.onCurrentLine(tree.root.id, {}), true)
  t.equal(tree.onCurrentLine(subChildId1, {[id1]: childId2}), false)
  t.equal(tree.onCurrentLine(subChildId1, {[id1]: childId3}), true)
  t.equal(tree.onCurrentLine(childId1, {[id1]: childId2}), false)

  t.end()
})

t.test('getHeight method', t => {
  let height = tree.getHeight()
  let newTree = tree.mutate(draft => {
    draft.appendNode(subChildId1, {})
  })

  t.equal(height, 4)
  t.equal(newTree.getHeight(), 5)

  t.end()
})

t.test('getStructureHash method', t => {
  let hash = tree.getStructureHash()

  let sameStructure = tree.mutate(draft => {
    draft.addToProperty(draft.root.id, 'MA', 'aa')
    draft.removeProperty(childId1, 'MA')
  })

  let differentStructure = sameStructure.mutate(draft => {
    draft.appendNode(draft.root.id, {})
  })

  t.equal(hash, sameStructure.getStructureHash())
  t.notEqual(hash, differentStructure.getStructureHash())

  t.end()
})

t.test('getHash method', t => {
  let hash = tree.getHash()

  let tree2 = tree.mutate(draft => {
    draft.addToProperty(draft.root.id, 'MA', 'aa')
    draft.removeProperty(childId1, 'MA')
  })

  let tree3 = tree2.mutate(draft => {
    draft.appendNode(draft.root.id, {})
  })

  t.notEqual(hash, tree2.getStructureHash())
  t.notEqual(hash, tree3.getStructureHash())

  t.end()
})
