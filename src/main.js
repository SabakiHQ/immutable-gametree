module.exports = require('./GameTree')

let GameTree = module.exports
let t = new GameTree({rootNode: {GM: ['1']}})
let t2 = t.insertNodes(0, 0, {B: ['pq']}, {W: ['qp']})
let t3 = t2.insertNodes(0, 0, {B: ['qp']}, {W: ['pq']})

console.log(t3.navigate(0, 0, 1))
debugger
