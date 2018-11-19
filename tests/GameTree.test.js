const t = require('tap')
const GameTree = require('..')

let id1, childId1, childId2, childId3
let tree = new GameTree().mutate(draft => {
    id1 = draft.appendNode(draft.root.id, {B: ['dd']})
    childId1 = draft.appendNode(id1, {W: ['dq'], MA: ['qd', 'qq']})
    childId2 = draft.appendNode(id1, {W: ['qd']})
    childId3 = draft.appendNode(id1, {W: ['qq']})
})

t.test('appendNode operation', t => {
    let newTree = tree.mutate(draft => {
        draft.appendNode(childId2, {B: ['qq']})
    })

    t.notEqual(newTree, tree)
    t.deepEqual(tree.get(childId2).children, [])
    t.equal(newTree.get(childId2).children.length, 1)
    t.deepEqual(newTree.get(childId2).children[0].data, {B: ['qq']})

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
    t.deepEqual(newTree.get(id1).children.map(x => x.id), [childId1, childId3, childId2])

    newTree = newTree.mutate(draft => {
        draft.shiftNode(childId1, 'right')
    })

    t.deepEqual(newTree.get(id1).children.map(x => x.id), [childId3, childId1, childId2])

    newTree = newTree.mutate(draft => {
        draft.shiftNode(childId2, 'main')
    })

    t.deepEqual(newTree.get(id1).children.map(x => x.id), [childId2, childId3, childId1])

    t.end()
})

t.test('shiftNode should not move nodes out of bounds', t => {
    let newTree = tree.mutate(draft => {
        draft.shiftNode(childId1, 'left')
        draft.shiftNode(childId3, 'right')
    })

    t.deepEqual(newTree.get(id1).children.map(x => x.id), [childId1, childId2, childId3])

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
    t.deepEqual(newTree2.get(id1).data, {B: ['dd'], C: ['Hello World!', 'Test 2']})

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
    let newTree = tree.mutate(draft => {
        draft.removeFromProperty(childId1, 'MA', 'qq')
    })

    t.deepEqual(newTree.get(childId1).data.MA, ['qd'])

    t.end()
})

t.test('removeFromProperty should remove property entirely when no values are left', t => {
    newTree = newTree.mutate(draft => {
        draft.removeFromProperty(childId1, 'W', 'dq')
    })

    t.equal(newTree.get(childId1).data.W, undefined)

    t.end()
})

/*
t.test('updateProperty operation', t => {
    let tree = new GameTree()
    let id = tree.appendNode(tree.root, {B: ['dd']})

    tree.updateProperty(id, 'B', ['dq'])
    let node = tree.getNode(id)
    t.deepEqual(node.node.B, ['dq'])

    tree.updateProperty(id, 'MA', ['dd', 'dq'])
    node = tree.getNode(id)
    t.deepEqual(node.node, {B: ['dq'], MA: ['dd', 'dq']})

    tree.updateProperty(id, 'B', null)
    node = tree.getNode(id)
    t.deepEqual(node.node, {MA: ['dd', 'dq']})

    t.end()
})
*/
