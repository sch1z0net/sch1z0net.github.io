//////////////////////////////////////
//////////////////////////////////////
// PREPARE AND PERFORM OOURA
//////////////////////////////////////
let ooura_oo_128;
let ooura_oo_256;
let ooura_oo_512;
let ooura_oo_1024;
let ooura_oo_2048;

function initializeOOURA(){
    return new Promise((resolve, reject) => {
        ooura_oo_128  = new Ooura(128,  {"type":"real", "radix":4} );
        ooura_oo_256  = new Ooura(256,  {"type":"real", "radix":4} );
        ooura_oo_512  = new Ooura(512,  {"type":"real", "radix":4} );
        ooura_oo_1024 = new Ooura(1024, {"type":"real", "radix":4} );
        ooura_oo_2048 = new Ooura(2048, {"type":"real", "radix":4} );
        resolve();
    });
}

const perform_OOURA = (instance, testData) => {
    let ooura_data = testData.slice(); instance.fftInPlace(ooura_data.buffer); return ooura_data;
};

const example_OOURA = (testData) => {
    let testData64 = Float64Array.from(testData.slice());
    return perform_OOURA(ooura_oo_1024, testData64.slice()).slice();
}