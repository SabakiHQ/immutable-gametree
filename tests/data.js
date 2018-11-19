const GameTree = require('..')

let id1, childId1, childId2, childId3, subChildId1
let tree = new GameTree().mutate(draft => {
    id1 = draft.appendNode(draft.root.id, {B: ['dd']})
    childId1 = draft.appendNode(id1, {W: ['dq'], MA: ['qd', 'qq']})
    childId2 = draft.appendNode(id1, {W: ['qd']})
    childId3 = draft.appendNode(id1, {W: ['qq']})
    subChildId1 = draft.appendNode(childId3, {B: ['dq']})
})

module.exports = {tree, id1, childId1, childId2, childId3, subChildId1}
