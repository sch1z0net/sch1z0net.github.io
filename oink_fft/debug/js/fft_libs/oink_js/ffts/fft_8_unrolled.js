

let iBR8 = new Float32Array(8);
let iP8  = new Float32Array(8);
let _iP8 = new Float32Array(8);
let out8 = new Float32Array(16);

function fftReal8(realInput) { 
    let size = realInput.length;
    if (size != 8) {
        for (let i = 0; i < 8; i++) {
            iP8[i] = (i < size) ? realInput[i] : 0.0;
        }
        _iP8 = iP8;
    } else {
        _iP8 = realInput;
    }

    /*
    //Bit Reversal
    {
        iBR8[0]=_iP8[0]; 
        iBR8[1]=_iP8[4]; 
        iBR8[2]=_iP8[2]; 
        iBR8[3]=_iP8[6]; 
        iBR8[4]=_iP8[1]; 
        iBR8[5]=_iP8[5]; 
        iBR8[6]=_iP8[3]; 
        iBR8[7]=_iP8[7]; 
    }*/
    iBR8 = _iP8;

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // RADIX 4 - FFT step for SIZE 4/8 
    ////////////////////////////////////////////////

    for (let idx = 0, out_idx = 0; idx < 8; idx += 4, out_idx += 8) {
        let x0aRe = iBR8[idx    ];
        let x1aRe = iBR8[idx + 1];
        let x2aRe = iBR8[idx + 2];
        let x3aRe = iBR8[idx + 3];

        let sum1  = x0aRe + x1aRe;
        let sum2  = x2aRe + x3aRe;
        let diff1 = x0aRe - x1aRe;
        let diff2 = (x2aRe - x3aRe) * 0.7071067690849304;

        out8[out_idx]     = sum1 + sum2;
        out8[out_idx + 1] = 0.0;
        out8[out_idx + 2] = diff1 + diff2;
        out8[out_idx + 3] =         diff2;
        out8[out_idx + 4] = sum1 - sum2;
        out8[out_idx + 5] = 0.0;
        out8[out_idx + 6] = diff1 - diff2;
        out8[out_idx + 7] =       - diff2;
    }

    return out8;
} 

export {fftReal8}; 
