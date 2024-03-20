///////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
import registerPlugin from './interface.js'
import PLUGIN_INDUTNY from './indutny/plugin.js'
import PLUGIN_INDUTNY from './dsp/plugin.js'

/*
FFT_BANK.set("INDUTNY",{
    idname: "INDUTNY", 
    fullname: "FFT.JS (indutny)", 
    url: "https://github.com/indutny/fft.js/", 
    res: new Map(),
    example: example_INDUTNY,
    precision: "float"
});
*/
/*
FFT_BANK.set("DSP",{
    idname: "DSP", 
    fullname: "DSP.JS (corbanbrook)", 
    url: "https://github.com/corbanbrook/dsp.js/", 
    res: new Map(),
    example: example_DSP,
    precision: "double"
});

FFT_BANK.set("OOURA",{
    idname: "OOURA", 
    fullname: "OOURA (audioplastic)", 
    url: "https://github.com/audioplastic/ooura", 
    res: new Map(),
    example: example_OOURA,
    precision: "double"
});

FFT_BANK.set("KISS",{
    idname: "KISS", 
    fullname: "KISS (mborgerding)", 
    url: "https://github.com/mborgerding/kissfft", 
    res: new Map(),
    example: example_KISS,
    precision: "double"
});

FFT_BANK.set("OINK",{
    idname: "OINK", 
    fullname: "OINK (sch1z0net)", 
    url: "https://github.com/sch1z0net/oink", 
    res: new Map(),
    example: example_OINK,
    precision: "float"
});
*/

async function setup(FFT_BANK){
    await registerPlugin(PLUGIN_INDUTNY, FFT_BANK);
    await registerPlugin(PLUGIN_DSP, FFT_BANK);
    // Call each initialization function asynchronously using await
    //$loading_info.text("Initializing INDUTNY..."); await initializeINDUTNY();
    /*$loading_info.text("Initializing DSP...");     await initializeDSP();
    $loading_info.text("Initializing OOURA...");   await initializeOOURA();
    $loading_info.text("Initializing KISS...");    Module_KISS_ = await Module_KISS(); await initializeKISS();
    $loading_info.text("Initializing OINK...");    Module_OINK_ = await Module_OINK(); await initializeModuleOINK();*/
};

export default setup;
