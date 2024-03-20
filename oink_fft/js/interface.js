const FFT_BANK = new Map();


// Define an interface-like object
const interface = {
  idname:   function() { },
  fullname: function() { },
  url:      function() { },
  precision:function() { },
  init:     function() { },
  fft128:   function(testData) { },
  fft256:   function(testData) { },
  fft512:   function(testData) { },
  fft1024:  function(testData) { },
  fft2048:  function(testData) { },
  example:  function(testData) { }
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


async function registerPlugin(PLUGIN){
    console.log( "REGISTER and INIT "+PLUGIN.fullname() );

    await FFT_BANK.set(
        PLUGIN.idname(),
        {
            idname:   PLUGIN.idname(), 
            fullname: PLUGIN.fullname(), 
            url:      PLUGIN.url(),
            res:      new Map(),
            precision:PLUGIN.precision(),
            init:     PLUGIN.init, 
            fft128:   PLUGIN.fft128, 
            fft256:   PLUGIN.fft256, 
            fft512:   PLUGIN.fft512, 
            fft1024:  PLUGIN.fft1024, 
            fft2048:  PLUGIN.fft2048, 
            example:  PLUGIN.example 
        }
    );

    await FFT_BANK.get(PLUGIN_INDUTNY.idname()).init()
}