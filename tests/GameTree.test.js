const t = require('tap')
const GameTree = require('..')

let id1, childId1, childId2, childId3
let tree = new GameTree().mutate(draft => {
    id1 = draft.appendNode(draft.root.id, {B: ['dd']})
    childId1 = draft.appendNode(id1, {W: ['dq']})
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

    newTree = tree.mutate(draft => {
        draft.removeNode(id1)
    })

    t.equal(newTree.get(childId1), null)
    t.equal(newTree.get(childId2), null)

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

    newTree = newTree.mutate(draft => {
        draft.shiftNode(childId2, 'left')
        draft.shiftNode(childId1, 'right')
    })

    t.deepEqual(newTree.get(id1).children.map(x => x.id), [childId2, childId3, childId1])

    t.end()
})

/*
t.test('addToProperty operation', t => {
    let tree = new GameTree()
    let id = tree.appendNode(tree.root, {B: ['dd']})

    tree.addToProperty(id, 'B', 'dd')
    let node = tree.getNode(id)
    t.deepEqual(node.node.B, ['dd'])

    tree.addToProperty(id, 'MA', 'dd')
    node = tree.getNode(id)
    t.deepEqual(node.node, {B: ['dd'], MA: ['dd']})

    tree.addToProperty(id, 'MA', 'dq')
    node = tree.getNode(id)
    t.deepEqual(node.node, {B: ['dd'], MA: ['dd', 'dq']})

    t.end()
})

t.test('removeFromProperty operation', t => {
    let tree = new GameTree()
    let id = tree.appendNode(tree.root, {B: ['dd']})

    tree.removeFromProperty(id, 'B', 'dq')
    let node = tree.getNode(id)
    t.deepEqual(node.node.B, ['dd'])

    tree.removeFromProperty(id, 'MA', 'dd')
    node = tree.getNode(id)
    t.deepEqual(node.node, {B: ['dd']})

    tree.removeFromProperty(id, 'B', 'dd')
    node = tree.getNode(id)
    t.deepEqual(node.node, {})

    t.end()
})

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
