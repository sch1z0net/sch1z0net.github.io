// Define an interface-like object
const interface = {
  idname:   function() { },
  fullname: function() { },
  url:      function() { },
  precision:function() { },
  example:  function() { },
  init:     async function() { }
};

// Check if an object conforms to the interface
function implementsInterface(obj, intf) {
  for (let method in intf) {
    if (!(method in obj) || typeof obj[method] !== 'function') {
      return false;
    }
  }
  return true;
}
