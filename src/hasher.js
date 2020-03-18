exports.new = function() {
  // Simple hash function adapted from
  // https://github.com/darkskyapp/string-hash

  let result = 5381

  return str => {
    for (let i = 0; i < str.length; i++) {
      result = (result * 33) ^ str.charCodeAt(i)
    }

    return result
  }
}
