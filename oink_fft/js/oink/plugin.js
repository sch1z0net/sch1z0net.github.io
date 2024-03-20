//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OINK
//////////////////////////////////////
let Module_OINK_;

const perform_OINK = (instance, testData) => {
    return instance(testData.slice());
};

const example_OINK = (testData) => {
    return perform_OINK(fftReal1024, testData.slice()).slice();
}


//////////////////////////////////////
//////////////////////////////////////
// IMPLEMENT GIVEN INTERFACE
//////////////////////////////////////
const OINK = {
  idname:   function() { return "OINK" },
  fullname: function() { return "OINK (sch1z0net)"},
  url:      function() { return "https://github.com/sch1z0net/oink" },
  precision:function() { return "float" },
  example:  function() { return perform_OINK(fftReal1024, testData.slice()).slice(); },
  init:     async function() { Module_OINK_ = await Module_OINK(); await initializeModuleOINK(); }
};
