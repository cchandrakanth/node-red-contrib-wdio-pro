const equal = (expected, actual) => {
    // if(typeof actual == "boolean"){
    //     actual = actual
    // }
    
    if(typeof actual !== 'undefined' && typeof expected !== "undefined" && actual === expected){
        return true
    }
    else{
        return false
    }
}

const notEqual = (expected, actual) => {
    if(typeof actual !== 'undefined' && typeof expected !== "undefined" && actual !== expected){
        return true
    }
    else{
        return false
    }
}

const greaterThan = (expected, actual) => {
    if(typeof actual !== 'undefined' && typeof expected !== "undefined" && parseFloat(actual) > parseFloat(expected)){
        return true
   }
   else{
        return false
   }
}

const greaterThanEqual = (expected, actual) => {
    if(typeof actual !== 'undefined' && typeof expected !== "undefined" && parseFloat(actual) >= parseFloat(expected)){
        return true
    }
    else{
        return false
    }
}

const lessThan = (expected, actual) => {
    if(typeof actual !== 'undefined' && typeof expected !== "undefined" && parseFloat(actual) < parseFloat(expected)){
        return true
   }
   else{
        return false
   }
}

const lessThanEqual = (expected, actual) => {
    if(typeof actual !== 'undefined' && typeof expected !== "undefined" && parseFloat(actual) <= parseFloat(expected)){
        return true
   }
   else{
        return false
   }
}

const contains = (expected, actual) => {

if(typeof actual !== 'undefined' && typeof actual == 'object'){
    actual = JSON.stringify(actual).toLowerCase();
}
else{
    actual = actual ? actual.toLowerCase():''
}
if(typeof expected !== 'undefined' && typeof expected == 'object'){
    expected = JSON.stringify(expected).toLowerCase();
}
else{
    expected = expected? expected.toLowerCase(): ''
}

if(typeof actual !== 'undefined' && typeof expected !== 'undefined' && actual.includes(expected)){
    return true
}
else{
     return false
}

}

const notContains = (expected, actual) => {
    if(typeof actual !== 'undefined' && typeof actual == 'object'){
        actual = JSON.stringify(actual).toLowerCase();
    }
    else{
        actual = actual?actual.toLowerCase():''
    }
    if(typeof expected !== 'undefined' && typeof expected == 'object'){
        expected = JSON.stringify(expected).toLowerCase();
    }
    else{
        expected = expected?expected.toLowerCase():''
    }
    
    if(typeof actual !== 'undefined' && typeof expected !== 'undefined' && !actual.includes(expected)){
        return true
    }
    else{
        return false
    }
}

module.exports = {
    equal,
    notEqual,
    greaterThan,
    greaterThanEqual,
    lessThan,
    lessThanEqual,
    contains,
    notContains
}