let FFT_FAC_4 = new Float32Array([
1.0000000000000000,0.0000000000000000,-0.0000000437113883,1.0000000000000000
]);


let iBR4 = new Float32Array(4);
let iP4  = new Float32Array(4);
let _iP4 = new Float32Array(4);
let out4 = new Float32Array(8);

function fftReal4(realInput) { 
    let size = realInput.length;
    if (size != 4) {
        for (let i = 0; i < 4; i++) {
            iP4[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP4 = iP4;
    } else {
        _iP4 = realInput;
    }


    //Bit Reversal
    {
        iBR4[0]=_iP4[0]; 
        iBR4[1]=_iP4[2]; 
        iBR4[2]=_iP4[1]; 
        iBR4[3]=_iP4[3]; 
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 4; idx += 4, out_idx += 8) {
        let x0aRe = iBR4[idx    ];
        let x1aRe = iBR4[idx + 1];
        let x2aRe = iBR4[idx + 2];
        let x3aRe = iBR4[idx + 3];

        let sum1  = x0aRe + x1aRe;
        let sum2  = x2aRe + x3aRe;
        let diff1 = x0aRe - x1aRe;
        let diff2 = x2aRe - x3aRe;

        out4[out_idx]     = sum1 + sum2;
        out4[out_idx + 1] = 0.0;
        out4[out_idx + 2] = diff1;
        out4[out_idx + 3] = diff2;
        out4[out_idx + 4] = sum1 - sum2;
        out4[out_idx + 5] = 0.0;
        out4[out_idx + 6] = diff1;
        out4[out_idx + 7] = -diff2;
    }


    return out4;
} 

export {fftReal4}; 
