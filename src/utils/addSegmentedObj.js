// chains function segments together, i.e. Account.LimitSwapVerifier.tokenToEth()
function addSegmentedObj (obj1, segments, obj2) {
  if (segments.length == 1) {
    obj1[segments[0]] = obj2
  } else {
    if (!obj1[segments[0]]) {
      obj1[segments[0]] = {}
    }
    addSegmentedObj(obj1[segments[0]], segments.slice(1), obj2)
  }
}

module.exports = addSegmentedObj
