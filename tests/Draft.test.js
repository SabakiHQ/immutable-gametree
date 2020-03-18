const t = require('tap')
const {tree, id1, childId1, childId2, childId3} = require('./data')

t.test('appendNode operation', t => {
  let newTree = tree.mutate(draft => {
    draft.appendNode(childId2, {B: ['qq']})
  })

  t.notEqual(newTree, tree)
  t.deepEqual(tree.get(childId2).children, [])
  t.equal(newTree.get(childId2).children.length, 1)
  t.equal(newTree.get(childId2).children[0].parentId, childId2)
  t.deepEqual(newTree.get(childId2).children[0].data, {B: ['qq']})

  t.end()
})

t.test('appendNode should merge nodes according to merge function', t => {
  let newId
  let newTree = tree.mutate(draft => {
    newId = draft.appendNode(draft.root.id, {B: ['dd']})
    draft.UNSAFE_appendNodeWithId(draft.root.id, 'hello1', {B: ['dd']})
  })

  t.equal(newId, id1)
  t.equal(newTree.get('hello1'), newTree.get(id1))
  t.equal([...newTree.listNodes()].length, [...tree.listNodes()].length)

  t.end()
})

t.test('appendNode should respect disableMerging option', t => {
  let newId
  let newTree = tree.mutate(draft => {
    newId = draft.appendNode(draft.root.id, {B: ['dd']}, {disableMerging: true})
    draft.UNSAFE_appendNodeWithId(
      draft.root.id,
      'hello2',
      {B: ['dd']},
      {disableMerging: true}
    )
  })

  t.notEqual(newId, id1)
  t.notEqual(newTree.get('hello2'), newTree.get(id1))
  t.notEqual([...newTree.listNodes()].length, [...tree.listNodes()].length)

  t.end()
})

t.test('removeNode operation', t => {
  let newTree = tree.mutate(draft => {
    draft.removeNode(childId2)
  })

  t.notEqual(newTree, tree)
  t.equal(newTree.get(childId2), null)
  t.equal(newTree.get(id1).children[0].id, childId1)

  t.end()
})

t.test('removeNode should remove all children', t => {
  let newTree = tree.mutate(draft => {
    draft.removeNode(id1)
  })

  t.equal(newTree.get(childId1), null)
  t.equal(newTree.get(childId2), null)

  t.end()
})

t.test('removeNode should throw when removing root node', t => {
  t.throws(() => {
    tree.mutate(draft => {
      draft.removeNode(draft.root.id)
    })
  })

  t.end()
})

t.test('shiftNode operation', t => {
  let newTree = tree.mutate(draft => {
    draft.shiftNode(childId3, 'left')
  })

  t.notEqual(newTree, tree)
  t.deepEqual(
    newTree.get(id1).children.map(x => x.id),
    [childId1, childId3, childId2]
  )

  newTree = newTree.mutate(draft => {
    draft.shiftNode(childId1, 'right')
  })

  t.deepEqual(
    newTree.get(id1).children.map(x => x.id),
    [childId3, childId1, childId2]
  )

  newTree = newTree.mutate(draft => {
    draft.shiftNode(childId2, 'main')
  })

  t.deepEqual(
    newTree.get(id1).children.map(x => x.id),
    [childId2, childId3, childId1]
  )

  t.end()
})

t.test('shiftNode should not move nodes out of bounds', t => {
  let newTree = tree.mutate(draft => {
    draft.shiftNode(childId1, 'left')
    draft.shiftNode(childId3, 'right')
  })

  t.deepEqual(
    newTree.get(id1).children.map(x => x.id),
    [childId1, childId2, childId3]
  )

  t.end()
})

t.test('makeRoot operation', t => {
  let newTree = tree.mutate(draft => {
    draft.makeRoot(id1)
  })

  t.notEqual(newTree, tree)
  t.equal(newTree.get(tree.root.id), null)
  t.deepEqual(newTree.root, {...tree.get(id1), parentId: null})
  t.equal(newTree.root.parentId, null)

  t.end()
})

t.test('addToProperty operation', t => {
  let newTree = tree.mutate(draft => {
    draft.addToProperty(id1, 'C', 'Hello World!')
  })

  t.notEqual(newTree, tree)
  t.deepEqual(newTree.get(id1).data, {B: ['dd'], C: ['Hello World!']})

  let newTree2 = newTree.mutate(draft => {
    draft.addToProperty(id1, 'C', 'Test 2')
  })

  t.deepEqual(newTree.get(id1).data, {B: ['dd'], C: ['Hello World!']})
  t.deepEqual(newTree2.get(id1).data, {
    B: ['dd'],
    C: ['Hello World!', 'Test 2']
  })

  t.end()
})

t.test('addToProperty should not add existing values', t => {
  let newTree = tree.mutate(draft => {
    draft.addToProperty(id1, 'B', 'dd')
  })

  t.deepEqual(newTree.get(id1).data, {B: ['dd']})
  t.end()
})

t.test('removeFromProperty operation', t => {
  t.deepEqual(tree.get(childId1).data.MA, ['qd', 'qq'])

  let newTree = tree.mutate(draft => {
    draft.removeFromProperty(childId1, 'MA', 'qq')
  })

  t.deepEqual(tree.get(childId1).data.MA, ['qd', 'qq'])
  t.deepEqual(newTree.get(childId1).data.MA, ['qd'])
  t.end()
})

t.test(
  'removeFromProperty should remove property entirely when no values are left',
  t => {
    let newTree = tree.mutate(draft => {
      draft.removeFromProperty(childId1, 'W', 'dq')
    })

    t.assertNot('W' in newTree.get(childId1).data)
    t.end()
  }
)

t.test('removeFromProperty should ignore values that do not exist', t => {
  let newTree = tree.mutate(draft => {
    draft.removeFromProperty(childId1, 'W', 'dd')
  })

  t.deepEqual(newTree.get(childId1).data.W, ['dq'])
  t.end()
})

t.test('updateProperty operation', t => {
  let values = ['dd', 'ee']
  let newTree = tree.mutate(draft => {
    draft.updateProperty(childId1, 'MA', values)
  })

  t.notEqual(newTree, tree)
  t.deepEqual(tree.get(childId1).data.MA, ['qd', 'qq'])
  t.equal(newTree.get(childId1).data.MA, values)

  t.end()
})

t.test(
  'updateProperty should remove property entirely when values is null or empty',
  t => {
    let newTree = tree.mutate(draft => {
      draft.updateProperty(childId1, 'MA', [])
    })

    t.assertNot('MA' in newTree.get(childId1).data)

    newTree = tree.mutate(draft => {
      draft.updateProperty(childId1, 'MA', null)
    })

    t.assertNot('MA' in newTree.get(childId1).data)
    t.end()
  }
)
