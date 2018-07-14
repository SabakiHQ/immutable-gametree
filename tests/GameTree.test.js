const t = require('tap')
const GameTree = require('..')

let g1 = new GameTree()

t.test('should clone', t => {
    let g2 = g1.clone()

    t.equal(g1.getJSON(), g2.getJSON())
    t.notEqual(g1, g2)

    t.end()
})
