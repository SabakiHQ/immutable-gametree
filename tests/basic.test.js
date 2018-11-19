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

t.test('mutation uses structural sharing', t => {
    let newTree = tree.mutate(draft => {
        draft.updateProperty(childId1, 'MA', null)
    })

    let node = tree.get(childId2)
    let newNode = newTree.get(childId2)

    t.equal(node, newNode)
    t.end()
})
