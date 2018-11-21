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

t.test('listNodes method', t => {
    let nodes = [...tree.listNodes()]

    t.equal(nodes.length, 6)
    t.end()
})

t.todo('listNodesHorizontally method', t => {

})

t.todo('listCurrentNodes method', t => {

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
    t.deepEqual([...tree.getSection(2)], [tree.get(childId1), tree.get(childId2), tree.get(childId3)])
    t.deepEqual([...tree.getSection(3)], [tree.get(subChildId1)])
    t.deepEqual([...tree.getSection(4)], [])

    t.end()
})

t.todo('getCurrentHeight method', t => {

})

t.todo('onCurrentLine method', t => {

})

t.test('getHeight method', t => {
    let height = tree.getHeight()

    t.equal(height, 4)
    t.end()
})
