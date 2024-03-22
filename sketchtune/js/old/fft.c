//emcc fft.c -o fft_wasm.js -s EXPORTED_RUNTIME_METHODS='cwrap,ccall' -s EXPORTED_FUNCTIONS='_getOut1024Ptr, _fftReal1024, _free, _malloc' -O3

#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <emscripten.h>

/*
float* precalculateFFTFactorsRADIX2flattened(int maxSampleLength) {
    int maxN = 1;
    while (maxN < maxSampleLength) {
        maxN *= 2;
    }
    int len = 0;
    for (int N = 2; N <= maxN; N *= 2) {
        len += N;
    }
    float* factors = (float*)malloc(len * sizeof(float));

    int pre = 0;
    for (int N = 2; N <= maxN; N *= 2) {
        for (int i = 0; i < N / 2; i++) {
            float angle1 = (2 * M_PI * i) / N;
            factors[pre + i * 2]     = cos(angle1); // Cosine of angle1
            factors[pre + i * 2 + 1] = sin(angle1); // Sine of angle1
        }
        pre += N;
    }

    return factors;
}*/

/*
double* precalculateFFTFactorsRADIX2flattened(int maxSampleLength) {
    int maxN = 1;
    while (maxN < maxSampleLength) {
        maxN *= 2;
    }
    int len = 0;
    for (int N = 2; N <= maxN; N *= 2) {
        len += N;
    }
    double* factors = (double*)malloc(len * sizeof(double));

    int pre = 0;
    for (int N = 2; N <= maxN; N *= 2) {
        for (int i = 0; i < N / 2; i++) {
            double angle1 = (2 * M_PI * i) / N;
            factors[pre + i * 2]     = cos(angle1); // Cosine of angle1
            factors[pre + i * 2 + 1] = sin(angle1); // Sine of angle1
        }
        pre += N;
    }

    return factors;
}*/



/*
int* precomputeBitReversalMap(int N) {
    int bits = (int)(log(N) / log(2));
    int* map = (int*)malloc(N * sizeof(int));

    for (int i = 0; i < N; i++) {
        int reversedIndex = 0;
        for (int j = 0; j < bits; j++) {
            reversedIndex = (reversedIndex << 1) | ((i >> j) & 1);
        }
        map[i] = reversedIndex;
    }

    return map;
}
*/

/*
float ____F[2046] = {  
0x1p+0f, 0x0p+0f, 0x1p+0f, 0x0p+0f, -0x1.777a5cp-25f, 0x1p+0f, 0x1p+0f, 0x0p+0f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, -0x1.777a5cp-25f, 0x1p+0f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 0x1p+0f, 0x0p+0f, 
0x1.d906bcp-1f, 0x1.87de2cp-2f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 0x1.87de2ap-2f, 0x1.d906bcp-1f, -0x1.777a5cp-25f, 0x1p+0f, -0x1.87de28p-2f, 0x1.d906bep-1f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, -0x1.d906bcp-1f, 0x1.87de2ep-2f, 0x1p+0f, 0x0p+0f, 
0x1.f6297cp-1f, 0x1.8f8b84p-3f, 0x1.d906bcp-1f, 0x1.87de2cp-2f, 0x1.a9b662p-1f, 0x1.1c73b4p-1f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 0x1.1c73b4p-1f, 0x1.a9b662p-1f, 0x1.87de2ap-2f, 0x1.d906bcp-1f, 0x1.8f8b88p-3f, 0x1.f6297cp-1f, -0x1.777a5cp-25f, 0x1p+0f, 
-0x1.8f8b84p-3f, 0x1.f6297cp-1f, -0x1.87de28p-2f, 0x1.d906bep-1f, -0x1.1c73b2p-1f, 0x1.a9b664p-1f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, -0x1.a9b664p-1f, 0x1.1c73b2p-1f, -0x1.d906bcp-1f, 0x1.87de2ep-2f, -0x1.f6297ep-1f, 0x1.8f8b82p-3f, 0x1p+0f, 0x0p+0f, 
0x1.fd88dap-1f, 0x1.917a6cp-4f, 0x1.f6297cp-1f, 0x1.8f8b84p-3f, 0x1.e9f416p-1f, 0x1.294062p-2f, 0x1.d906bcp-1f, 0x1.87de2cp-2f, 0x1.c38b3p-1f, 0x1.e2b5d2p-2f, 0x1.a9b662p-1f, 0x1.1c73b4p-1f, 0x1.8bc808p-1f, 0x1.44cf32p-1f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
0x1.44cf32p-1f, 0x1.8bc806p-1f, 0x1.1c73b4p-1f, 0x1.a9b662p-1f, 0x1.e2b5d6p-2f, 0x1.c38b2ep-1f, 0x1.87de2ap-2f, 0x1.d906bcp-1f, 0x1.29406p-2f, 0x1.e9f416p-1f, 0x1.8f8b88p-3f, 0x1.f6297cp-1f, 0x1.917a6ap-4f, 0x1.fd88dap-1f, -0x1.777a5cp-25f, 0x1p+0f, 
-0x1.917a62p-4f, 0x1.fd88dap-1f, -0x1.8f8b84p-3f, 0x1.f6297cp-1f, -0x1.294066p-2f, 0x1.e9f414p-1f, -0x1.87de28p-2f, 0x1.d906bep-1f, -0x1.e2b5ccp-2f, 0x1.c38b3p-1f, -0x1.1c73b2p-1f, 0x1.a9b664p-1f, -0x1.44cf32p-1f, 0x1.8bc808p-1f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
-0x1.8bc808p-1f, 0x1.44cf32p-1f, -0x1.a9b664p-1f, 0x1.1c73b2p-1f, -0x1.c38b2ep-1f, 0x1.e2b5dap-2f, -0x1.d906bcp-1f, 0x1.87de2ep-2f, -0x1.e9f416p-1f, 0x1.294066p-2f, -0x1.f6297ep-1f, 0x1.8f8b82p-3f, -0x1.fd88dap-1f, 0x1.917a6p-4f, 0x1p+0f, 0x0p+0f, 
0x1.ff621ep-1f, 0x1.91f66p-5f, 0x1.fd88dap-1f, 0x1.917a6cp-4f, 0x1.fa7558p-1f, 0x1.2c8106p-3f, 0x1.f6297cp-1f, 0x1.8f8b84p-3f, 0x1.f0a7fp-1f, 0x1.f19f98p-3f, 0x1.e9f416p-1f, 0x1.294062p-2f, 0x1.e2121p-1f, 0x1.58f9a6p-2f, 0x1.d906bcp-1f, 0x1.87de2cp-2f, 
0x1.ced7bp-1f, 0x1.b5d1p-2f, 0x1.c38b3p-1f, 0x1.e2b5d2p-2f, 0x1.b72834p-1f, 0x1.07387ap-1f, 0x1.a9b662p-1f, 0x1.1c73b4p-1f, 0x1.9b3e04p-1f, 0x1.30ff8p-1f, 0x1.8bc808p-1f, 0x1.44cf32p-1f, 0x1.7b5df2p-1f, 0x1.57d694p-1f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
0x1.57d694p-1f, 0x1.7b5df2p-1f, 0x1.44cf32p-1f, 0x1.8bc806p-1f, 0x1.30ff8p-1f, 0x1.9b3e04p-1f, 0x1.1c73b4p-1f, 0x1.a9b662p-1f, 0x1.07387cp-1f, 0x1.b72834p-1f, 0x1.e2b5d6p-2f, 0x1.c38b2ep-1f, 0x1.b5d102p-2f, 0x1.ced7bp-1f, 0x1.87de2ap-2f, 0x1.d906bcp-1f, 
0x1.58f9a6p-2f, 0x1.e2121p-1f, 0x1.29406p-2f, 0x1.e9f416p-1f, 0x1.f19fap-3f, 0x1.f0a7fp-1f, 0x1.8f8b88p-3f, 0x1.f6297cp-1f, 0x1.2c810ap-3f, 0x1.fa7558p-1f, 0x1.917a6ap-4f, 0x1.fd88dap-1f, 0x1.91f652p-5f, 0x1.ff621ep-1f, -0x1.777a5cp-25f, 0x1p+0f, 
-0x1.91f642p-5f, 0x1.ff621ep-1f, -0x1.917a62p-4f, 0x1.fd88dap-1f, -0x1.2c8104p-3f, 0x1.fa7558p-1f, -0x1.8f8b84p-3f, 0x1.f6297cp-1f, -0x1.f19f9ap-3f, 0x1.f0a7fp-1f, -0x1.294066p-2f, 0x1.e9f414p-1f, -0x1.58f9a4p-2f, 0x1.e2121p-1f, -0x1.87de28p-2f, 0x1.d906bep-1f, 
-0x1.b5d1p-2f, 0x1.ced7bp-1f, -0x1.e2b5ccp-2f, 0x1.c38b3p-1f, -0x1.07387ap-1f, 0x1.b72834p-1f, -0x1.1c73b2p-1f, 0x1.a9b664p-1f, -0x1.30ff82p-1f, 0x1.9b3e04p-1f, -0x1.44cf32p-1f, 0x1.8bc808p-1f, -0x1.57d696p-1f, 0x1.7b5dfp-1f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
-0x1.7b5dfp-1f, 0x1.57d696p-1f, -0x1.8bc808p-1f, 0x1.44cf32p-1f, -0x1.9b3e04p-1f, 0x1.30ff82p-1f, -0x1.a9b664p-1f, 0x1.1c73b2p-1f, -0x1.b72834p-1f, 0x1.07387ap-1f, -0x1.c38b2ep-1f, 0x1.e2b5dap-2f, -0x1.ced7bp-1f, 0x1.b5d0fep-2f, -0x1.d906bcp-1f, 0x1.87de2ep-2f, 
-0x1.e21212p-1f, 0x1.58f9a4p-2f, -0x1.e9f416p-1f, 0x1.294066p-2f, -0x1.f0a7fp-1f, 0x1.f19f8ap-3f, -0x1.f6297ep-1f, 0x1.8f8b82p-3f, -0x1.fa7558p-1f, 0x1.2c8114p-3f, -0x1.fd88dap-1f, 0x1.917a6p-4f, -0x1.ff621ep-1f, 0x1.91f67ap-5f, 0x1p+0f, 0x0p+0f, 
0x1.ffd886p-1f, 0x1.92156p-6f, 0x1.ff621ep-1f, 0x1.91f66p-5f, 0x1.fe9cdap-1f, 0x1.2d520ap-4f, 0x1.fd88dap-1f, 0x1.917a6cp-4f, 0x1.fc2648p-1f, 0x1.f564e4p-4f, 0x1.fa7558p-1f, 0x1.2c8106p-3f, 0x1.f8765p-1f, 0x1.5e2144p-3f, 0x1.f6297cp-1f, 0x1.8f8b84p-3f, 
0x1.f38f3ap-1f, 0x1.c0b826p-3f, 0x1.f0a7fp-1f, 0x1.f19f98p-3f, 0x1.ed740ep-1f, 0x1.111d26p-2f, 0x1.e9f416p-1f, 0x1.294062p-2f, 0x1.e6288ep-1f, 0x1.4135cap-2f, 0x1.e2121p-1f, 0x1.58f9a6p-2f, 0x1.ddb13cp-1f, 0x1.708854p-2f, 0x1.d906bcp-1f, 0x1.87de2cp-2f, 
0x1.d4134ep-1f, 0x1.9ef794p-2f, 0x1.ced7bp-1f, 0x1.b5d1p-2f, 0x1.c954b2p-1f, 0x1.cc66eap-2f, 0x1.c38b3p-1f, 0x1.e2b5d2p-2f, 0x1.bd7c0cp-1f, 0x1.f8ba4cp-2f, 0x1.b72834p-1f, 0x1.07387ap-1f, 0x1.b090a6p-1f, 0x1.11eb36p-1f, 0x1.a9b662p-1f, 0x1.1c73b4p-1f, 
0x1.a29a7ap-1f, 0x1.26d056p-1f, 0x1.9b3e04p-1f, 0x1.30ff8p-1f, 0x1.93a226p-1f, 0x1.3affa2p-1f, 0x1.8bc808p-1f, 0x1.44cf32p-1f, 0x1.83b0ep-1f, 0x1.4e6cacp-1f, 0x1.7b5df2p-1f, 0x1.57d694p-1f, 0x1.72d084p-1f, 0x1.610b76p-1f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
0x1.610b76p-1f, 0x1.72d082p-1f, 0x1.57d694p-1f, 0x1.7b5df2p-1f, 0x1.4e6cacp-1f, 0x1.83b0ep-1f, 0x1.44cf32p-1f, 0x1.8bc806p-1f, 0x1.3affa2p-1f, 0x1.93a224p-1f, 0x1.30ff8p-1f, 0x1.9b3e04p-1f, 0x1.26d056p-1f, 0x1.a29a7ap-1f, 0x1.1c73b4p-1f, 0x1.a9b662p-1f, 
0x1.11eb36p-1f, 0x1.b090a6p-1f, 0x1.07387cp-1f, 0x1.b72834p-1f, 0x1.f8ba4ep-2f, 0x1.bd7c0ap-1f, 0x1.e2b5d6p-2f, 0x1.c38b2ep-1f, 0x1.cc66e8p-2f, 0x1.c954b2p-1f, 0x1.b5d102p-2f, 0x1.ced7bp-1f, 0x1.9ef792p-2f, 0x1.d4134ep-1f, 0x1.87de2ap-2f, 0x1.d906bcp-1f, 
0x1.708856p-2f, 0x1.ddb13ap-1f, 0x1.58f9a6p-2f, 0x1.e2121p-1f, 0x1.4135cap-2f, 0x1.e6288ep-1f, 0x1.29406p-2f, 0x1.e9f416p-1f, 0x1.111d26p-2f, 0x1.ed740ep-1f, 0x1.f19fap-3f, 0x1.f0a7fp-1f, 0x1.c0b824p-3f, 0x1.f38f3ap-1f, 0x1.8f8b88p-3f, 0x1.f6297cp-1f, 
0x1.5e214p-3f, 0x1.f8765p-1f, 0x1.2c810ap-3f, 0x1.fa7558p-1f, 0x1.f564d8p-4f, 0x1.fc2648p-1f, 0x1.917a6ap-4f, 0x1.fd88dap-1f, 0x1.2d5216p-4f, 0x1.fe9cdap-1f, 0x1.91f652p-5f, 0x1.ff621ep-1f, 0x1.92157cp-6f, 0x1.ffd886p-1f, -0x1.777a5cp-25f, 0x1p+0f, 
-0x1.92155ap-6f, 0x1.ffd886p-1f, -0x1.91f642p-5f, 0x1.ff621ep-1f, -0x1.2d520cp-4f, 0x1.fe9cdap-1f, -0x1.917a62p-4f, 0x1.fd88dap-1f, -0x1.f564eep-4f, 0x1.fc2646p-1f, -0x1.2c8104p-3f, 0x1.fa7558p-1f, -0x1.5e214cp-3f, 0x1.f8765p-1f, -0x1.8f8b84p-3f, 0x1.f6297cp-1f, 
-0x1.c0b82p-3f, 0x1.f38f3cp-1f, -0x1.f19f9ap-3f, 0x1.f0a7fp-1f, -0x1.111d24p-2f, 0x1.ed740ep-1f, -0x1.294066p-2f, 0x1.e9f414p-1f, -0x1.4135c8p-2f, 0x1.e6288ep-1f, -0x1.58f9a4p-2f, 0x1.e2121p-1f, -0x1.708854p-2f, 0x1.ddb13cp-1f, -0x1.87de28p-2f, 0x1.d906bep-1f, 
-0x1.9ef796p-2f, 0x1.d4134cp-1f, -0x1.b5d1p-2f, 0x1.ced7bp-1f, -0x1.cc66ecp-2f, 0x1.c954b2p-1f, -0x1.e2b5ccp-2f, 0x1.c38b3p-1f, -0x1.f8ba4cp-2f, 0x1.bd7c0cp-1f, -0x1.07387ap-1f, 0x1.b72834p-1f, -0x1.11eb38p-1f, 0x1.b090a4p-1f, -0x1.1c73b2p-1f, 0x1.a9b664p-1f, 
-0x1.26d054p-1f, 0x1.a29a7ap-1f, -0x1.30ff82p-1f, 0x1.9b3e04p-1f, -0x1.3affap-1f, 0x1.93a226p-1f, -0x1.44cf32p-1f, 0x1.8bc808p-1f, -0x1.4e6cacp-1f, 0x1.83b0ep-1f, -0x1.57d696p-1f, 0x1.7b5dfp-1f, -0x1.610b74p-1f, 0x1.72d084p-1f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
-0x1.72d086p-1f, 0x1.610b74p-1f, -0x1.7b5dfp-1f, 0x1.57d696p-1f, -0x1.83b0ep-1f, 0x1.4e6cacp-1f, -0x1.8bc808p-1f, 0x1.44cf32p-1f, -0x1.93a226p-1f, 0x1.3affap-1f, -0x1.9b3e04p-1f, 0x1.30ff82p-1f, -0x1.a29a7ap-1f, 0x1.26d054p-1f, -0x1.a9b664p-1f, 0x1.1c73b2p-1f, 
-0x1.b090a4p-1f, 0x1.11eb38p-1f, -0x1.b72834p-1f, 0x1.07387ap-1f, -0x1.bd7c0cp-1f, 0x1.f8ba4ap-2f, -0x1.c38b2ep-1f, 0x1.e2b5dap-2f, -0x1.c954b2p-1f, 0x1.cc66ecp-2f, -0x1.ced7bp-1f, 0x1.b5d0fep-2f, -0x1.d4134ep-1f, 0x1.9ef78ep-2f, -0x1.d906bcp-1f, 0x1.87de2ep-2f, 
-0x1.ddb13cp-1f, 0x1.708854p-2f, -0x1.e21212p-1f, 0x1.58f9a4p-2f, -0x1.e6288ep-1f, 0x1.4135dp-2f, -0x1.e9f416p-1f, 0x1.294066p-2f, -0x1.ed740ep-1f, 0x1.111d24p-2f, -0x1.f0a7fp-1f, 0x1.f19f8ap-3f, -0x1.f38f3ap-1f, 0x1.c0b82ep-3f, -0x1.f6297ep-1f, 0x1.8f8b82p-3f, 
-0x1.f8765p-1f, 0x1.5e213ap-3f, -0x1.fa7558p-1f, 0x1.2c8114p-3f, -0x1.fc2646p-1f, 0x1.f564ecp-4f, -0x1.fd88dap-1f, 0x1.917a6p-4f, -0x1.fe9cdcp-1f, 0x1.2d51eap-4f, -0x1.ff621ep-1f, 0x1.91f67ap-5f, -0x1.ffd886p-1f, 0x1.92154cp-6f, 0x1p+0f, 0x0p+0f, 
0x1.fff622p-1f, 0x1.921d2p-7f, 0x1.ffd886p-1f, 0x1.92156p-6f, 0x1.ffa72ep-1f, 0x1.2d8658p-5f, 0x1.ff621ep-1f, 0x1.91f66p-5f, 0x1.ff0956p-1f, 0x1.f656e8p-5f, 0x1.fe9cdap-1f, 0x1.2d520ap-4f, 0x1.fe1cbp-1f, 0x1.5f6dp-4f, 0x1.fd88dap-1f, 0x1.917a6cp-4f, 
0x1.fce16p-1f, 0x1.c3785cp-4f, 0x1.fc2648p-1f, 0x1.f564e4p-4f, 0x1.fb5798p-1f, 0x1.139f0cp-3f, 0x1.fa7558p-1f, 0x1.2c8106p-3f, 0x1.f97f92p-1f, 0x1.45576cp-3f, 0x1.f8765p-1f, 0x1.5e2144p-3f, 0x1.f7599ap-1f, 0x1.76dd9ep-3f, 0x1.f6297cp-1f, 0x1.8f8b84p-3f, 
0x1.f4e604p-1f, 0x1.a82a02p-3f, 0x1.f38f3ap-1f, 0x1.c0b826p-3f, 0x1.f2253p-1f, 0x1.d935p-3f, 0x1.f0a7fp-1f, 0x1.f19f98p-3f, 0x1.ef178ap-1f, 0x1.04fb8p-2f, 0x1.ed740ep-1f, 0x1.111d26p-2f, 0x1.ebbd8cp-1f, 0x1.1d3444p-2f, 0x1.e9f416p-1f, 0x1.294062p-2f, 
0x1.e817bap-1f, 0x1.35410cp-2f, 0x1.e6288ep-1f, 0x1.4135cap-2f, 0x1.e426a4p-1f, 0x1.4d1e24p-2f, 0x1.e2121p-1f, 0x1.58f9a6p-2f, 0x1.dfeae6p-1f, 0x1.64c7dep-2f, 0x1.ddb13cp-1f, 0x1.708854p-2f, 0x1.db6526p-1f, 0x1.7c3a94p-2f, 0x1.d906bcp-1f, 0x1.87de2cp-2f, 
0x1.d69618p-1f, 0x1.9372a6p-2f, 0x1.d4134ep-1f, 0x1.9ef794p-2f, 0x1.d17e78p-1f, 0x1.aa6c82p-2f, 0x1.ced7bp-1f, 0x1.b5d1p-2f, 0x1.cc1f1p-1f, 0x1.c1249ep-2f, 0x1.c954b2p-1f, 0x1.cc66eap-2f, 0x1.c678b4p-1f, 0x1.d79774p-2f, 0x1.c38b3p-1f, 0x1.e2b5d2p-2f, 
0x1.c08c42p-1f, 0x1.edc194p-2f, 0x1.bd7c0cp-1f, 0x1.f8ba4cp-2f, 0x1.ba5aa6p-1f, 0x1.01cfc8p-1f, 0x1.b72834p-1f, 0x1.07387ap-1f, 0x1.b3e4d4p-1f, 0x1.0c9706p-1f, 0x1.b090a6p-1f, 0x1.11eb36p-1f, 0x1.ad2bcap-1f, 0x1.1734d6p-1f, 0x1.a9b662p-1f, 0x1.1c73b4p-1f, 
0x1.a63092p-1f, 0x1.21a798p-1f, 0x1.a29a7ap-1f, 0x1.26d056p-1f, 0x1.9ef44p-1f, 0x1.2bedb2p-1f, 0x1.9b3e04p-1f, 0x1.30ff8p-1f, 0x1.9777fp-1f, 0x1.36058ap-1f, 0x1.93a226p-1f, 0x1.3affa2p-1f, 0x1.8fbccap-1f, 0x1.3fed96p-1f, 0x1.8bc808p-1f, 0x1.44cf32p-1f, 
0x1.87c4p-1f, 0x1.49a44ap-1f, 0x1.83b0ep-1f, 0x1.4e6cacp-1f, 0x1.7f8ecep-1f, 0x1.53282ap-1f, 0x1.7b5df2p-1f, 0x1.57d694p-1f, 0x1.771e76p-1f, 0x1.5c77bcp-1f, 0x1.72d084p-1f, 0x1.610b76p-1f, 0x1.6e7446p-1f, 0x1.659192p-1f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
0x1.659192p-1f, 0x1.6e7446p-1f, 0x1.610b76p-1f, 0x1.72d082p-1f, 0x1.5c77bcp-1f, 0x1.771e76p-1f, 0x1.57d694p-1f, 0x1.7b5df2p-1f, 0x1.532828p-1f, 0x1.7f8ecep-1f, 0x1.4e6cacp-1f, 0x1.83b0ep-1f, 0x1.49a44ap-1f, 0x1.87c402p-1f, 0x1.44cf32p-1f, 0x1.8bc806p-1f, 
0x1.3fed96p-1f, 0x1.8fbccap-1f, 0x1.3affa2p-1f, 0x1.93a224p-1f, 0x1.36058cp-1f, 0x1.9777fp-1f, 0x1.30ff8p-1f, 0x1.9b3e04p-1f, 0x1.2bedb2p-1f, 0x1.9ef43ep-1f, 0x1.26d056p-1f, 0x1.a29a7ap-1f, 0x1.21a79ap-1f, 0x1.a63092p-1f, 0x1.1c73b4p-1f, 0x1.a9b662p-1f, 
0x1.1734d6p-1f, 0x1.ad2bcap-1f, 0x1.11eb36p-1f, 0x1.b090a6p-1f, 0x1.0c9704p-1f, 0x1.b3e4d4p-1f, 0x1.07387cp-1f, 0x1.b72834p-1f, 0x1.01cfcap-1f, 0x1.ba5aa6p-1f, 0x1.f8ba4ep-2f, 0x1.bd7c0ap-1f, 0x1.edc192p-2f, 0x1.c08c44p-1f, 0x1.e2b5d6p-2f, 0x1.c38b2ep-1f, 
0x1.d79776p-2f, 0x1.c678b4p-1f, 0x1.cc66e8p-2f, 0x1.c954b2p-1f, 0x1.c124ap-2f, 0x1.cc1f0ep-1f, 0x1.b5d102p-2f, 0x1.ced7bp-1f, 0x1.aa6c82p-2f, 0x1.d17e78p-1f, 0x1.9ef792p-2f, 0x1.d4134ep-1f, 0x1.9372a8p-2f, 0x1.d69616p-1f, 0x1.87de2ap-2f, 0x1.d906bcp-1f, 
0x1.7c3a9p-2f, 0x1.db6526p-1f, 0x1.708856p-2f, 0x1.ddb13ap-1f, 0x1.64c7dep-2f, 0x1.dfeae6p-1f, 0x1.58f9a6p-2f, 0x1.e2121p-1f, 0x1.4d1e2p-2f, 0x1.e426a6p-1f, 0x1.4135cap-2f, 0x1.e6288ep-1f, 0x1.35410cp-2f, 0x1.e817bap-1f, 0x1.29406p-2f, 0x1.e9f416p-1f, 
0x1.1d3446p-2f, 0x1.ebbd8cp-1f, 0x1.111d26p-2f, 0x1.ed740ep-1f, 0x1.04fb8p-2f, 0x1.ef178ap-1f, 0x1.f19fap-3f, 0x1.f0a7fp-1f, 0x1.d93502p-3f, 0x1.f2253p-1f, 0x1.c0b824p-3f, 0x1.f38f3ap-1f, 0x1.a829fcp-3f, 0x1.f4e604p-1f, 0x1.8f8b88p-3f, 0x1.f6297cp-1f, 
0x1.76dd9ep-3f, 0x1.f7599ap-1f, 0x1.5e214p-3f, 0x1.f8765p-1f, 0x1.455772p-3f, 0x1.f97f92p-1f, 0x1.2c810ap-3f, 0x1.fa7558p-1f, 0x1.139f0ap-3f, 0x1.fb5798p-1f, 0x1.f564d8p-4f, 0x1.fc2648p-1f, 0x1.c37864p-4f, 0x1.fce16p-1f, 0x1.917a6ap-4f, 0x1.fd88dap-1f, 
0x1.5f6cf6p-4f, 0x1.fe1cbp-1f, 0x1.2d5216p-4f, 0x1.fe9cdap-1f, 0x1.f656eep-5f, 0x1.ff0956p-1f, 0x1.91f652p-5f, 0x1.ff621ep-1f, 0x1.2d8638p-5f, 0x1.ffa73p-1f, 0x1.92157cp-6f, 0x1.ffd886p-1f, 0x1.921d0cp-7f, 0x1.fff622p-1f, -0x1.777a5cp-25f, 0x1p+0f, 
-0x1.921cc8p-7f, 0x1.fff622p-1f, -0x1.92155ap-6f, 0x1.ffd886p-1f, -0x1.2d8666p-5f, 0x1.ffa72ep-1f, -0x1.91f642p-5f, 0x1.ff621ep-1f, -0x1.f656dcp-5f, 0x1.ff0956p-1f, -0x1.2d520cp-4f, 0x1.fe9cdap-1f, -0x1.5f6d0ep-4f, 0x1.fe1cbp-1f, -0x1.917a62p-4f, 0x1.fd88dap-1f, 
-0x1.c3785cp-4f, 0x1.fce16p-1f, -0x1.f564eep-4f, 0x1.fc2646p-1f, -0x1.139f06p-3f, 0x1.fb5798p-1f, -0x1.2c8104p-3f, 0x1.fa7558p-1f, -0x1.45576ep-3f, 0x1.f97f92p-1f, -0x1.5e214cp-3f, 0x1.f8765p-1f, -0x1.76dd9ap-3f, 0x1.f7599ap-1f, -0x1.8f8b84p-3f, 0x1.f6297cp-1f, 
-0x1.a82a08p-3f, 0x1.f4e604p-1f, -0x1.c0b82p-3f, 0x1.f38f3cp-1f, -0x1.d934fcp-3f, 0x1.f2253p-1f, -0x1.f19f9ap-3f, 0x1.f0a7fp-1f, -0x1.04fb84p-2f, 0x1.ef178ap-1f, -0x1.111d24p-2f, 0x1.ed740ep-1f, -0x1.1d3444p-2f, 0x1.ebbd8cp-1f, -0x1.294066p-2f, 0x1.e9f414p-1f, 
-0x1.35410ap-2f, 0x1.e817bcp-1f, -0x1.4135c8p-2f, 0x1.e6288ep-1f, -0x1.4d1e26p-2f, 0x1.e426a4p-1f, -0x1.58f9a4p-2f, 0x1.e2121p-1f, -0x1.64c7dcp-2f, 0x1.dfeae6p-1f, -0x1.708854p-2f, 0x1.ddb13cp-1f, -0x1.7c3a96p-2f, 0x1.db6526p-1f, -0x1.87de28p-2f, 0x1.d906bep-1f, 
-0x1.9372a6p-2f, 0x1.d69618p-1f, -0x1.9ef796p-2f, 0x1.d4134cp-1f, -0x1.aa6c8p-2f, 0x1.d17e78p-1f, -0x1.b5d1p-2f, 0x1.ced7bp-1f, -0x1.c1249ep-2f, 0x1.cc1f0ep-1f, -0x1.cc66ecp-2f, 0x1.c954b2p-1f, -0x1.d7977cp-2f, 0x1.c678b2p-1f, -0x1.e2b5ccp-2f, 0x1.c38b3p-1f, 
-0x1.edc19p-2f, 0x1.c08c44p-1f, -0x1.f8ba4cp-2f, 0x1.bd7c0cp-1f, -0x1.01cfc8p-1f, 0x1.ba5aa6p-1f, -0x1.07387ap-1f, 0x1.b72834p-1f, -0x1.0c9706p-1f, 0x1.b3e4d2p-1f, -0x1.11eb38p-1f, 0x1.b090a4p-1f, -0x1.1734d4p-1f, 0x1.ad2bccp-1f, -0x1.1c73b2p-1f, 0x1.a9b664p-1f, 
-0x1.21a798p-1f, 0x1.a63092p-1f, -0x1.26d054p-1f, 0x1.a29a7ap-1f, -0x1.2bedb4p-1f, 0x1.9ef43ep-1f, -0x1.30ff82p-1f, 0x1.9b3e04p-1f, -0x1.36058ep-1f, 0x1.9777eep-1f, -0x1.3affap-1f, 0x1.93a226p-1f, -0x1.3fed94p-1f, 0x1.8fbcccp-1f, -0x1.44cf32p-1f, 0x1.8bc808p-1f, 
-0x1.49a44ap-1f, 0x1.87c4p-1f, -0x1.4e6cacp-1f, 0x1.83b0ep-1f, -0x1.53282ap-1f, 0x1.7f8eccp-1f, -0x1.57d696p-1f, 0x1.7b5dfp-1f, -0x1.5c77bap-1f, 0x1.771e78p-1f, -0x1.610b74p-1f, 0x1.72d084p-1f, -0x1.659192p-1f, 0x1.6e7446p-1f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
-0x1.6e7446p-1f, 0x1.659192p-1f, -0x1.72d086p-1f, 0x1.610b74p-1f, -0x1.771e78p-1f, 0x1.5c77bap-1f, -0x1.7b5dfp-1f, 0x1.57d696p-1f, -0x1.7f8eccp-1f, 0x1.53282ap-1f, -0x1.83b0ep-1f, 0x1.4e6cacp-1f, -0x1.87c402p-1f, 0x1.49a44ap-1f, -0x1.8bc808p-1f, 0x1.44cf32p-1f, 
-0x1.8fbcccp-1f, 0x1.3fed94p-1f, -0x1.93a226p-1f, 0x1.3affap-1f, -0x1.9777eep-1f, 0x1.36058ep-1f, -0x1.9b3e04p-1f, 0x1.30ff82p-1f, -0x1.9ef43ep-1f, 0x1.2bedb2p-1f, -0x1.a29a7ap-1f, 0x1.26d054p-1f, -0x1.a63092p-1f, 0x1.21a798p-1f, -0x1.a9b664p-1f, 0x1.1c73b2p-1f, 
-0x1.ad2bc8p-1f, 0x1.1734dap-1f, -0x1.b090a4p-1f, 0x1.11eb38p-1f, -0x1.b3e4d4p-1f, 0x1.0c9706p-1f, -0x1.b72834p-1f, 0x1.07387ap-1f, -0x1.ba5aa6p-1f, 0x1.01cfc8p-1f, -0x1.bd7c0cp-1f, 0x1.f8ba4ap-2f, -0x1.c08c44p-1f, 0x1.edc19p-2f, -0x1.c38b2ep-1f, 0x1.e2b5dap-2f, 
-0x1.c678b2p-1f, 0x1.d7977ap-2f, -0x1.c954b2p-1f, 0x1.cc66ecp-2f, -0x1.cc1f1p-1f, 0x1.c1249ep-2f, -0x1.ced7bp-1f, 0x1.b5d0fep-2f, -0x1.d17e78p-1f, 0x1.aa6c7ep-2f, -0x1.d4134ep-1f, 0x1.9ef78ep-2f, -0x1.d69616p-1f, 0x1.9372acp-2f, -0x1.d906bcp-1f, 0x1.87de2ep-2f, 
-0x1.db6526p-1f, 0x1.7c3a96p-2f, -0x1.ddb13cp-1f, 0x1.708854p-2f, -0x1.dfeae6p-1f, 0x1.64c7dcp-2f, -0x1.e21212p-1f, 0x1.58f9a4p-2f, -0x1.e426a6p-1f, 0x1.4d1e1ep-2f, -0x1.e6288ep-1f, 0x1.4135dp-2f, -0x1.e817bap-1f, 0x1.35411p-2f, -0x1.e9f416p-1f, 0x1.294066p-2f, 
-0x1.ebbd8cp-1f, 0x1.1d3444p-2f, -0x1.ed740ep-1f, 0x1.111d24p-2f, -0x1.ef178ap-1f, 0x1.04fb7cp-2f, -0x1.f0a7fp-1f, 0x1.f19f8ap-3f, -0x1.f2252ep-1f, 0x1.d9350ap-3f, -0x1.f38f3ap-1f, 0x1.c0b82ep-3f, -0x1.f4e604p-1f, 0x1.a82a06p-3f, -0x1.f6297ep-1f, 0x1.8f8b82p-3f, 
-0x1.f7599ap-1f, 0x1.76dd98p-3f, -0x1.f8765p-1f, 0x1.5e213ap-3f, -0x1.f97f92p-1f, 0x1.45575cp-3f, -0x1.fa7558p-1f, 0x1.2c8114p-3f, -0x1.fb5796p-1f, 0x1.139f14p-3f, -0x1.fc2646p-1f, 0x1.f564ecp-4f, -0x1.fce16p-1f, 0x1.c3785ap-4f, -0x1.fd88dap-1f, 0x1.917a6p-4f, 
-0x1.fe1cbp-1f, 0x1.5f6ceap-4f, -0x1.fe9cdcp-1f, 0x1.2d51eap-4f, -0x1.ff0956p-1f, 0x1.f65716p-5f, -0x1.ff621ep-1f, 0x1.91f67ap-5f, -0x1.ffa72ep-1f, 0x1.2d866p-5f, -0x1.ffd886p-1f, 0x1.92154cp-6f, -0x1.fff622p-1f, 0x1.921caep-7f, 0x1p+0f, 0x0p+0f, 
0x1.fffd88p-1f, 0x1.921f1p-8f, 0x1.fff622p-1f, 0x1.921d2p-7f, 0x1.ffe9ccp-1f, 0x1.2d936cp-6f, 0x1.ffd886p-1f, 0x1.92156p-6f, 0x1.ffc252p-1f, 0x1.f69372p-6f, 0x1.ffa72ep-1f, 0x1.2d8658p-5f, 0x1.ff871ep-1f, 0x1.5fc00cp-5f, 0x1.ff621ep-1f, 0x1.91f66p-5f, 
0x1.ff383p-1f, 0x1.c428d2p-5f, 0x1.ff0956p-1f, 0x1.f656e8p-5f, 0x1.fed58ep-1f, 0x1.144012p-4f, 0x1.fe9cdap-1f, 0x1.2d520ap-4f, 0x1.fe5f3ap-1f, 0x1.466118p-4f, 0x1.fe1cbp-1f, 0x1.5f6dp-4f, 0x1.fdd53ap-1f, 0x1.787586p-4f, 0x1.fd88dap-1f, 0x1.917a6cp-4f, 
0x1.fd3792p-1f, 0x1.aa7b72p-4f, 0x1.fce16p-1f, 0x1.c3785cp-4f, 0x1.fc8646p-1f, 0x1.dc70eep-4f, 0x1.fc2648p-1f, 0x1.f564e4p-4f, 0x1.fbc162p-1f, 0x1.072a04p-3f, 0x1.fb5798p-1f, 0x1.139f0cp-3f, 0x1.fae8e8p-1f, 0x1.20116ep-3f, 0x1.fa7558p-1f, 0x1.2c8106p-3f, 
0x1.f9fce6p-1f, 0x1.38edbcp-3f, 0x1.f97f92p-1f, 0x1.45576cp-3f, 0x1.f8fd6p-1f, 0x1.51bdf8p-3f, 0x1.f8765p-1f, 0x1.5e2144p-3f, 0x1.f7ea62p-1f, 0x1.6a813p-3f, 0x1.f7599ap-1f, 0x1.76dd9ep-3f, 0x1.f6c3f8p-1f, 0x1.83366ep-3f, 0x1.f6297cp-1f, 0x1.8f8b84p-3f, 
0x1.f58a2cp-1f, 0x1.9bdcbep-3f, 0x1.f4e604p-1f, 0x1.a82a02p-3f, 0x1.f43d08p-1f, 0x1.b4732ep-3f, 0x1.f38f3ap-1f, 0x1.c0b826p-3f, 0x1.f2dc9cp-1f, 0x1.ccf8ccp-3f, 0x1.f2253p-1f, 0x1.d935p-3f, 0x1.f168f6p-1f, 0x1.e56cap-3f, 0x1.f0a7fp-1f, 0x1.f19f98p-3f, 
0x1.efe22p-1f, 0x1.fdcdc2p-3f, 0x1.ef178ap-1f, 0x1.04fb8p-2f, 0x1.ee482ep-1f, 0x1.0b0d9ep-2f, 0x1.ed740ep-1f, 0x1.111d26p-2f, 0x1.ec9b2ep-1f, 0x1.172a0ep-2f, 0x1.ebbd8cp-1f, 0x1.1d3444p-2f, 0x1.eadb2ep-1f, 0x1.233bbcp-2f, 0x1.e9f416p-1f, 0x1.294062p-2f, 
0x1.e90844p-1f, 0x1.2f422cp-2f, 0x1.e817bap-1f, 0x1.35410cp-2f, 0x1.e7227ep-1f, 0x1.3b3cfp-2f, 0x1.e6288ep-1f, 0x1.4135cap-2f, 0x1.e529fp-1f, 0x1.472b8ap-2f, 0x1.e426a4p-1f, 0x1.4d1e24p-2f, 0x1.e31eaep-1f, 0x1.530d88p-2f, 0x1.e2121p-1f, 0x1.58f9a6p-2f, 
0x1.e100ccp-1f, 0x1.5ee274p-2f, 0x1.dfeae6p-1f, 0x1.64c7dep-2f, 0x1.ded06p-1f, 0x1.6aa9d8p-2f, 0x1.ddb13cp-1f, 0x1.708854p-2f, 0x1.dc8d7cp-1f, 0x1.76634p-2f, 0x1.db6526p-1f, 0x1.7c3a94p-2f, 0x1.da383ap-1f, 0x1.820e3ap-2f, 0x1.d906bcp-1f, 0x1.87de2cp-2f, 
0x1.d7d0bp-1f, 0x1.8daa52p-2f, 0x1.d69618p-1f, 0x1.9372a6p-2f, 0x1.d556f6p-1f, 0x1.993716p-2f, 0x1.d4134ep-1f, 0x1.9ef794p-2f, 0x1.d2cb22p-1f, 0x1.a4b414p-2f, 0x1.d17e78p-1f, 0x1.aa6c82p-2f, 0x1.d02d5p-1f, 0x1.b020d8p-2f, 0x1.ced7bp-1f, 0x1.b5d1p-2f, 
0x1.cd7d98p-1f, 0x1.bb7cf2p-2f, 0x1.cc1f1p-1f, 0x1.c1249ep-2f, 0x1.cabc16p-1f, 0x1.c6c7f4p-2f, 0x1.c954b2p-1f, 0x1.cc66eap-2f, 0x1.c7e8e6p-1f, 0x1.d2016ep-2f, 0x1.c678b4p-1f, 0x1.d79774p-2f, 0x1.c5042p-1f, 0x1.dd28f2p-2f, 0x1.c38b3p-1f, 0x1.e2b5d2p-2f, 
0x1.c20de4p-1f, 0x1.e83e1p-2f, 0x1.c08c42p-1f, 0x1.edc194p-2f, 0x1.bf064ep-1f, 0x1.f3405ap-2f, 0x1.bd7c0cp-1f, 0x1.f8ba4cp-2f, 0x1.bbed7cp-1f, 0x1.fe2f64p-2f, 0x1.ba5aa6p-1f, 0x1.01cfc8p-1f, 0x1.b8c38cp-1f, 0x1.048564p-1f, 0x1.b72834p-1f, 0x1.07387ap-1f, 
0x1.b588ap-1f, 0x1.09e908p-1f, 0x1.b3e4d4p-1f, 0x1.0c9706p-1f, 0x1.b23cd4p-1f, 0x1.0f426ap-1f, 0x1.b090a6p-1f, 0x1.11eb36p-1f, 0x1.aee04cp-1f, 0x1.14915cp-1f, 0x1.ad2bcap-1f, 0x1.1734d6p-1f, 0x1.ab7326p-1f, 0x1.19d5ap-1f, 0x1.a9b662p-1f, 0x1.1c73b4p-1f, 
0x1.a7f584p-1f, 0x1.1f0f0ap-1f, 0x1.a63092p-1f, 0x1.21a798p-1f, 0x1.a4678cp-1f, 0x1.243d6p-1f, 0x1.a29a7ap-1f, 0x1.26d056p-1f, 0x1.a0c95ep-1f, 0x1.296074p-1f, 0x1.9ef44p-1f, 0x1.2bedb2p-1f, 0x1.9d1b2p-1f, 0x1.2e780ep-1f, 0x1.9b3e04p-1f, 0x1.30ff8p-1f, 
0x1.995cf4p-1f, 0x1.3384p-1f, 0x1.9777fp-1f, 0x1.36058ap-1f, 0x1.958efep-1f, 0x1.388418p-1f, 0x1.93a226p-1f, 0x1.3affa2p-1f, 0x1.91b168p-1f, 0x1.3d7824p-1f, 0x1.8fbccap-1f, 0x1.3fed96p-1f, 0x1.8dc452p-1f, 0x1.425ff2p-1f, 0x1.8bc808p-1f, 0x1.44cf32p-1f, 
0x1.89c7eap-1f, 0x1.473b52p-1f, 0x1.87c4p-1f, 0x1.49a44ap-1f, 0x1.85bc52p-1f, 0x1.4c0a14p-1f, 0x1.83b0ep-1f, 0x1.4e6cacp-1f, 0x1.81a1b4p-1f, 0x1.50cc0ap-1f, 0x1.7f8ecep-1f, 0x1.53282ap-1f, 0x1.7d7838p-1f, 0x1.558104p-1f, 0x1.7b5df2p-1f, 0x1.57d694p-1f, 
0x1.794006p-1f, 0x1.5a28d4p-1f, 0x1.771e76p-1f, 0x1.5c77bcp-1f, 0x1.74f948p-1f, 0x1.5ec34ap-1f, 0x1.72d084p-1f, 0x1.610b76p-1f, 0x1.70a42ap-1f, 0x1.63503ap-1f, 0x1.6e7446p-1f, 0x1.659192p-1f, 0x1.6c40d8p-1f, 0x1.67cf78p-1f, 0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
0x1.67cf78p-1f, 0x1.6c40d6p-1f, 0x1.659192p-1f, 0x1.6e7446p-1f, 0x1.63503ap-1f, 0x1.70a42cp-1f, 0x1.610b76p-1f, 0x1.72d082p-1f, 0x1.5ec34ap-1f, 0x1.74f948p-1f, 0x1.5c77bcp-1f, 0x1.771e76p-1f, 0x1.5a28d2p-1f, 0x1.794006p-1f, 0x1.57d694p-1f, 0x1.7b5df2p-1f, 
0x1.558104p-1f, 0x1.7d7836p-1f, 0x1.532828p-1f, 0x1.7f8ecep-1f, 0x1.50cc0ap-1f, 0x1.81a1b2p-1f, 0x1.4e6cacp-1f, 0x1.83b0ep-1f, 0x1.4c0a14p-1f, 0x1.85bc52p-1f, 0x1.49a44ap-1f, 0x1.87c402p-1f, 0x1.473b52p-1f, 0x1.89c7eap-1f, 0x1.44cf32p-1f, 0x1.8bc806p-1f, 
0x1.425ffp-1f, 0x1.8dc454p-1f, 0x1.3fed96p-1f, 0x1.8fbccap-1f, 0x1.3d7824p-1f, 0x1.91b166p-1f, 0x1.3affa2p-1f, 0x1.93a224p-1f, 0x1.388418p-1f, 0x1.958efep-1f, 0x1.36058cp-1f, 0x1.9777fp-1f, 0x1.3384p-1f, 0x1.995cf4p-1f, 0x1.30ff8p-1f, 0x1.9b3e04p-1f, 
0x1.2e780ep-1f, 0x1.9d1b1ep-1f, 0x1.2bedb2p-1f, 0x1.9ef43ep-1f, 0x1.296072p-1f, 0x1.a0c95ep-1f, 0x1.26d056p-1f, 0x1.a29a7ap-1f, 0x1.243d6p-1f, 0x1.a4678cp-1f, 0x1.21a79ap-1f, 0x1.a63092p-1f, 0x1.1f0f08p-1f, 0x1.a7f586p-1f, 0x1.1c73b4p-1f, 0x1.a9b662p-1f, 
0x1.19d5ap-1f, 0x1.ab7326p-1f, 0x1.1734d6p-1f, 0x1.ad2bcap-1f, 0x1.14915cp-1f, 0x1.aee04ap-1f, 0x1.11eb36p-1f, 0x1.b090a6p-1f, 0x1.0f426cp-1f, 0x1.b23cd4p-1f, 0x1.0c9704p-1f, 0x1.b3e4d4p-1f, 0x1.09e906p-1f, 0x1.b588ap-1f, 0x1.07387cp-1f, 0x1.b72834p-1f, 
0x1.048564p-1f, 0x1.b8c38cp-1f, 0x1.01cfcap-1f, 0x1.ba5aa6p-1f, 0x1.fe2f66p-2f, 0x1.bbed7cp-1f, 0x1.f8ba4ep-2f, 0x1.bd7c0ap-1f, 0x1.f34058p-2f, 0x1.bf064ep-1f, 0x1.edc192p-2f, 0x1.c08c44p-1f, 0x1.e83e12p-2f, 0x1.c20de4p-1f, 0x1.e2b5d6p-2f, 0x1.c38b2ep-1f, 
0x1.dd28f2p-2f, 0x1.c5042p-1f, 0x1.d79776p-2f, 0x1.c678b4p-1f, 0x1.d2016ep-2f, 0x1.c7e8e6p-1f, 0x1.cc66e8p-2f, 0x1.c954b2p-1f, 0x1.c6c7f2p-2f, 0x1.cabc18p-1f, 0x1.c124ap-2f, 0x1.cc1f0ep-1f, 0x1.bb7cf4p-2f, 0x1.cd7d98p-1f, 0x1.b5d102p-2f, 0x1.ced7bp-1f, 
0x1.b020d6p-2f, 0x1.d02d5p-1f, 0x1.aa6c82p-2f, 0x1.d17e78p-1f, 0x1.a4b41p-2f, 0x1.d2cb22p-1f, 0x1.9ef792p-2f, 0x1.d4134ep-1f, 0x1.99371ap-2f, 0x1.d556f4p-1f, 0x1.9372a8p-2f, 0x1.d69616p-1f, 0x1.8daa54p-2f, 0x1.d7d0bp-1f, 0x1.87de2ap-2f, 0x1.d906bcp-1f, 
0x1.820e3ap-2f, 0x1.da383ap-1f, 0x1.7c3a9p-2f, 0x1.db6526p-1f, 0x1.76633ep-2f, 0x1.dc8d7ep-1f, 0x1.708856p-2f, 0x1.ddb13ap-1f, 0x1.6aa9dap-2f, 0x1.ded06p-1f, 0x1.64c7dep-2f, 0x1.dfeae6p-1f, 0x1.5ee274p-2f, 0x1.e100ccp-1f, 0x1.58f9a6p-2f, 0x1.e2121p-1f, 
0x1.530d86p-2f, 0x1.e31eaep-1f, 0x1.4d1e2p-2f, 0x1.e426a6p-1f, 0x1.472b8ep-2f, 0x1.e529fp-1f, 0x1.4135cap-2f, 0x1.e6288ep-1f, 0x1.3b3cfp-2f, 0x1.e7227ep-1f, 0x1.35410cp-2f, 0x1.e817bap-1f, 0x1.2f422cp-2f, 0x1.e90844p-1f, 0x1.29406p-2f, 0x1.e9f416p-1f, 
0x1.233bbep-2f, 0x1.eadb2ep-1f, 0x1.1d3446p-2f, 0x1.ebbd8cp-1f, 0x1.172a1p-2f, 0x1.ec9b2ep-1f, 0x1.111d26p-2f, 0x1.ed740ep-1f, 0x1.0b0d9cp-2f, 0x1.ee482ep-1f, 0x1.04fb8p-2f, 0x1.ef178ap-1f, 0x1.fdcdbcp-3f, 0x1.efe222p-1f, 0x1.f19fap-3f, 0x1.f0a7fp-1f, 
0x1.e56ca6p-3f, 0x1.f168f4p-1f, 0x1.d93502p-3f, 0x1.f2253p-1f, 0x1.ccf8ccp-3f, 0x1.f2dc9cp-1f, 0x1.c0b824p-3f, 0x1.f38f3ap-1f, 0x1.b4732ap-3f, 0x1.f43d08p-1f, 0x1.a829fcp-3f, 0x1.f4e604p-1f, 0x1.9bdcc6p-3f, 0x1.f58a2ap-1f, 0x1.8f8b88p-3f, 0x1.f6297cp-1f, 
0x1.833672p-3f, 0x1.f6c3f8p-1f, 0x1.76dd9ep-3f, 0x1.f7599ap-1f, 0x1.6a812ep-3f, 0x1.f7ea62p-1f, 0x1.5e214p-3f, 0x1.f8765p-1f, 0x1.51bdf2p-3f, 0x1.f8fd6p-1f, 0x1.455772p-3f, 0x1.f97f92p-1f, 0x1.38edcp-3f, 0x1.f9fce6p-1f, 0x1.2c810ap-3f, 0x1.fa7558p-1f, 
0x1.20116ep-3f, 0x1.fae8e8p-1f, 0x1.139f0ap-3f, 0x1.fb5798p-1f, 0x1.072ap-3f, 0x1.fbc162p-1f, 0x1.f564d8p-4f, 0x1.fc2648p-1f, 0x1.dc70fap-4f, 0x1.fc8646p-1f, 0x1.c37864p-4f, 0x1.fce16p-1f, 0x1.aa7b76p-4f, 0x1.fd3792p-1f, 0x1.917a6ap-4f, 0x1.fd88dap-1f, 
0x1.787582p-4f, 0x1.fdd53ap-1f, 0x1.5f6cf6p-4f, 0x1.fe1cbp-1f, 0x1.466108p-4f, 0x1.fe5f3cp-1f, 0x1.2d5216p-4f, 0x1.fe9cdap-1f, 0x1.14401ap-4f, 0x1.fed58ep-1f, 0x1.f656eep-5f, 0x1.ff0956p-1f, 0x1.c428cep-5f, 0x1.ff383p-1f, 0x1.91f652p-5f, 0x1.ff621ep-1f, 
0x1.5fbff8p-5f, 0x1.ff871ep-1f, 0x1.2d8638p-5f, 0x1.ffa73p-1f, 0x1.f693a2p-6f, 0x1.ffc252p-1f, 0x1.92157cp-6f, 0x1.ffd886p-1f, 0x1.2d9374p-6f, 0x1.ffe9ccp-1f, 0x1.921d0cp-7f, 0x1.fff622p-1f, 0x1.921e9ep-8f, 0x1.fffd88p-1f, -0x1.777a5cp-25f, 0x1p+0f, 
-0x1.921e16p-8f, 0x1.fffd88p-1f, -0x1.921cc8p-7f, 0x1.fff622p-1f, -0x1.2d9352p-6f, 0x1.ffe9ccp-1f, -0x1.92155ap-6f, 0x1.ffd886p-1f, -0x1.f6938p-6f, 0x1.ffc252p-1f, -0x1.2d8666p-5f, 0x1.ffa72ep-1f, -0x1.5fc026p-5f, 0x1.ff871ep-1f, -0x1.91f642p-5f, 0x1.ff621ep-1f, 
-0x1.c428bcp-5f, 0x1.ff3832p-1f, -0x1.f656dcp-5f, 0x1.ff0956p-1f, -0x1.144012p-4f, 0x1.fed58ep-1f, -0x1.2d520cp-4f, 0x1.fe9cdap-1f, -0x1.46612p-4f, 0x1.fe5f3ap-1f, -0x1.5f6d0ep-4f, 0x1.fe1cbp-1f, -0x1.787578p-4f, 0x1.fdd53ap-1f, -0x1.917a62p-4f, 0x1.fd88dap-1f, 
-0x1.aa7b6ep-4f, 0x1.fd3792p-1f, -0x1.c3785cp-4f, 0x1.fce16p-1f, -0x1.dc70f2p-4f, 0x1.fc8646p-1f, -0x1.f564eep-4f, 0x1.fc2646p-1f, -0x1.072a0cp-3f, 0x1.fbc162p-1f, -0x1.139f06p-3f, 0x1.fb5798p-1f, -0x1.201168p-3f, 0x1.fae8eap-1f, -0x1.2c8104p-3f, 0x1.fa7558p-1f, 
-0x1.38edbcp-3f, 0x1.f9fce6p-1f, -0x1.45576ep-3f, 0x1.f97f92p-1f, -0x1.51bdfep-3f, 0x1.f8fd6p-1f, -0x1.5e214cp-3f, 0x1.f8765p-1f, -0x1.6a812ap-3f, 0x1.f7ea62p-1f, -0x1.76dd9ap-3f, 0x1.f7599ap-1f, -0x1.83366cp-3f, 0x1.f6c3f8p-1f, -0x1.8f8b84p-3f, 0x1.f6297cp-1f, 
-0x1.9bdcc2p-3f, 0x1.f58a2ap-1f, -0x1.a82a08p-3f, 0x1.f4e604p-1f, -0x1.b47336p-3f, 0x1.f43d08p-1f, -0x1.c0b82p-3f, 0x1.f38f3cp-1f, -0x1.ccf8c8p-3f, 0x1.f2dc9cp-1f, -0x1.d934fcp-3f, 0x1.f2253p-1f, -0x1.e56ca2p-3f, 0x1.f168f6p-1f, -0x1.f19f9ap-3f, 0x1.f0a7fp-1f, 
-0x1.fdcdc8p-3f, 0x1.efe22p-1f, -0x1.04fb84p-2f, 0x1.ef178ap-1f, -0x1.0b0d9ap-2f, 0x1.ee482ep-1f, -0x1.111d24p-2f, 0x1.ed740ep-1f, -0x1.172a0cp-2f, 0x1.ec9b2ep-1f, -0x1.1d3444p-2f, 0x1.ebbd8cp-1f, -0x1.233bbcp-2f, 0x1.eadb2ep-1f, -0x1.294066p-2f, 0x1.e9f414p-1f, 
-0x1.2f422ap-2f, 0x1.e90844p-1f, -0x1.35410ap-2f, 0x1.e817bcp-1f, -0x1.3b3ceep-2f, 0x1.e7227ep-1f, -0x1.4135c8p-2f, 0x1.e6288ep-1f, -0x1.472b8cp-2f, 0x1.e529fp-1f, -0x1.4d1e26p-2f, 0x1.e426a4p-1f, -0x1.530d8cp-2f, 0x1.e31eaep-1f, -0x1.58f9a4p-2f, 0x1.e2121p-1f, 
-0x1.5ee272p-2f, 0x1.e100cep-1f, -0x1.64c7dcp-2f, 0x1.dfeae6p-1f, -0x1.6aa9d8p-2f, 0x1.ded06p-1f, -0x1.708854p-2f, 0x1.ddb13cp-1f, -0x1.766342p-2f, 0x1.dc8d7cp-1f, -0x1.7c3a96p-2f, 0x1.db6526p-1f, -0x1.820e38p-2f, 0x1.da383cp-1f, -0x1.87de28p-2f, 0x1.d906bep-1f, 
-0x1.8daa52p-2f, 0x1.d7d0bp-1f, -0x1.9372a6p-2f, 0x1.d69618p-1f, -0x1.993718p-2f, 0x1.d556f4p-1f, -0x1.9ef796p-2f, 0x1.d4134cp-1f, -0x1.a4b416p-2f, 0x1.d2cb22p-1f, -0x1.aa6c8p-2f, 0x1.d17e78p-1f, -0x1.b020d4p-2f, 0x1.d02d5p-1f, -0x1.b5d1p-2f, 0x1.ced7bp-1f, 
-0x1.bb7cf2p-2f, 0x1.cd7d98p-1f, -0x1.c1249ep-2f, 0x1.cc1f0ep-1f, -0x1.c6c7f6p-2f, 0x1.cabc16p-1f, -0x1.cc66ecp-2f, 0x1.c954b2p-1f, -0x1.d20172p-2f, 0x1.c7e8e4p-1f, -0x1.d7977cp-2f, 0x1.c678b2p-1f, -0x1.dd28f8p-2f, 0x1.c5041ep-1f, -0x1.e2b5ccp-2f, 0x1.c38b3p-1f, 
-0x1.e83e08p-2f, 0x1.c20de6p-1f, -0x1.edc19p-2f, 0x1.c08c44p-1f, -0x1.f34056p-2f, 0x1.bf065p-1f, -0x1.f8ba4cp-2f, 0x1.bd7c0cp-1f, -0x1.fe2f64p-2f, 0x1.bbed7cp-1f, -0x1.01cfc8p-1f, 0x1.ba5aa6p-1f, -0x1.048562p-1f, 0x1.b8c38ep-1f, -0x1.07387ap-1f, 0x1.b72834p-1f, 
-0x1.09e908p-1f, 0x1.b588ap-1f, -0x1.0c9706p-1f, 0x1.b3e4d2p-1f, -0x1.0f426ep-1f, 0x1.b23cd4p-1f, -0x1.11eb38p-1f, 0x1.b090a4p-1f, -0x1.14915ep-1f, 0x1.aee04ap-1f, -0x1.1734d4p-1f, 0x1.ad2bccp-1f, -0x1.19d59ep-1f, 0x1.ab7328p-1f, -0x1.1c73b2p-1f, 0x1.a9b664p-1f, 
-0x1.1f0f08p-1f, 0x1.a7f586p-1f, -0x1.21a798p-1f, 0x1.a63092p-1f, -0x1.243d6p-1f, 0x1.a4678cp-1f, -0x1.26d054p-1f, 0x1.a29a7ap-1f, -0x1.296072p-1f, 0x1.a0c95ep-1f, -0x1.2bedb4p-1f, 0x1.9ef43ep-1f, -0x1.2e781p-1f, 0x1.9d1b1ep-1f, -0x1.30ff82p-1f, 0x1.9b3e04p-1f, 
-0x1.338404p-1f, 0x1.995cf2p-1f, -0x1.36058ep-1f, 0x1.9777eep-1f, -0x1.38841cp-1f, 0x1.958efcp-1f, -0x1.3affap-1f, 0x1.93a226p-1f, -0x1.3d7822p-1f, 0x1.91b168p-1f, -0x1.3fed94p-1f, 0x1.8fbcccp-1f, -0x1.425ffp-1f, 0x1.8dc454p-1f, -0x1.44cf32p-1f, 0x1.8bc808p-1f, 
-0x1.473b52p-1f, 0x1.89c7eap-1f, -0x1.49a44ap-1f, 0x1.87c4p-1f, -0x1.4c0a14p-1f, 0x1.85bc52p-1f, -0x1.4e6cacp-1f, 0x1.83b0ep-1f, -0x1.50cc0cp-1f, 0x1.81a1b2p-1f, -0x1.53282ap-1f, 0x1.7f8eccp-1f, -0x1.558106p-1f, 0x1.7d7834p-1f, -0x1.57d696p-1f, 0x1.7b5dfp-1f, 
-0x1.5a28dp-1f, 0x1.794008p-1f, -0x1.5c77bap-1f, 0x1.771e78p-1f, -0x1.5ec348p-1f, 0x1.74f94ap-1f, -0x1.610b74p-1f, 0x1.72d084p-1f, -0x1.63503ap-1f, 0x1.70a42cp-1f, -0x1.659192p-1f, 0x1.6e7446p-1f, -0x1.67cf78p-1f, 0x1.6c40d8p-1f, -0x1.6a09e6p-1f, 0x1.6a09e6p-1f, 
-0x1.6c40d8p-1f, 0x1.67cf78p-1f, -0x1.6e7446p-1f, 0x1.659192p-1f, -0x1.70a42cp-1f, 0x1.635038p-1f, -0x1.72d086p-1f, 0x1.610b74p-1f, -0x1.74f94ap-1f, 0x1.5ec348p-1f, -0x1.771e78p-1f, 0x1.5c77bap-1f, -0x1.794002p-1f, 0x1.5a28d6p-1f, -0x1.7b5dfp-1f, 0x1.57d696p-1f, 
-0x1.7d7836p-1f, 0x1.558106p-1f, -0x1.7f8eccp-1f, 0x1.53282ap-1f, -0x1.81a1b2p-1f, 0x1.50cc0ap-1f, -0x1.83b0ep-1f, 0x1.4e6cacp-1f, -0x1.85bc52p-1f, 0x1.4c0a14p-1f, -0x1.87c402p-1f, 0x1.49a44ap-1f, -0x1.89c7eap-1f, 0x1.473b5p-1f, -0x1.8bc808p-1f, 0x1.44cf32p-1f, 
-0x1.8dc454p-1f, 0x1.425ffp-1f, -0x1.8fbcccp-1f, 0x1.3fed94p-1f, -0x1.91b16ap-1f, 0x1.3d782p-1f, -0x1.93a226p-1f, 0x1.3affap-1f, -0x1.958efcp-1f, 0x1.38841cp-1f, -0x1.9777eep-1f, 0x1.36058ep-1f, -0x1.995cf2p-1f, 0x1.338402p-1f, -0x1.9b3e04p-1f, 0x1.30ff82p-1f, 
-0x1.9d1b1ep-1f, 0x1.2e781p-1f, -0x1.9ef43ep-1f, 0x1.2bedb2p-1f, -0x1.a0c95ep-1f, 0x1.296072p-1f, -0x1.a29a7ap-1f, 0x1.26d054p-1f, -0x1.a4678ep-1f, 0x1.243d5ep-1f, -0x1.a63092p-1f, 0x1.21a798p-1f, -0x1.a7f586p-1f, 0x1.1f0f06p-1f, -0x1.a9b664p-1f, 0x1.1c73b2p-1f, 
-0x1.ab7328p-1f, 0x1.19d59ep-1f, -0x1.ad2bc8p-1f, 0x1.1734dap-1f, -0x1.aee04ap-1f, 0x1.14915ep-1f, -0x1.b090a4p-1f, 0x1.11eb38p-1f, -0x1.b23cd4p-1f, 0x1.0f426ep-1f, -0x1.b3e4d4p-1f, 0x1.0c9706p-1f, -0x1.b588ap-1f, 0x1.09e908p-1f, -0x1.b72834p-1f, 0x1.07387ap-1f, 
-0x1.b8c38ep-1f, 0x1.048562p-1f, -0x1.ba5aa6p-1f, 0x1.01cfc8p-1f, -0x1.bbed7cp-1f, 0x1.fe2f62p-2f, -0x1.bd7c0cp-1f, 0x1.f8ba4ap-2f, -0x1.bf065p-1f, 0x1.f34056p-2f, -0x1.c08c44p-1f, 0x1.edc19p-2f, -0x1.c20de6p-1f, 0x1.e83e08p-2f, -0x1.c38b2ep-1f, 0x1.e2b5dap-2f, 
-0x1.c5041ep-1f, 0x1.dd28f6p-2f, -0x1.c678b2p-1f, 0x1.d7977ap-2f, -0x1.c7e8e4p-1f, 0x1.d20172p-2f, -0x1.c954b2p-1f, 0x1.cc66ecp-2f, -0x1.cabc16p-1f, 0x1.c6c7f6p-2f, -0x1.cc1f1p-1f, 0x1.c1249ep-2f, -0x1.cd7d98p-1f, 0x1.bb7cf2p-2f, -0x1.ced7bp-1f, 0x1.b5d0fep-2f, 
-0x1.d02d5p-1f, 0x1.b020d4p-2f, -0x1.d17e78p-1f, 0x1.aa6c7ep-2f, -0x1.d2cb24p-1f, 0x1.a4b40ep-2f, -0x1.d4134ep-1f, 0x1.9ef78ep-2f, -0x1.d556f6p-1f, 0x1.99371p-2f, -0x1.d69616p-1f, 0x1.9372acp-2f, -0x1.d7d0aep-1f, 0x1.8daa58p-2f, -0x1.d906bcp-1f, 0x1.87de2ep-2f, 
-0x1.da383ap-1f, 0x1.820e3ep-2f, -0x1.db6526p-1f, 0x1.7c3a96p-2f, -0x1.dc8d7cp-1f, 0x1.766342p-2f, -0x1.ddb13cp-1f, 0x1.708854p-2f, -0x1.ded06p-1f, 0x1.6aa9d6p-2f, -0x1.dfeae6p-1f, 0x1.64c7dcp-2f, -0x1.e100cep-1f, 0x1.5ee27p-2f, -0x1.e21212p-1f, 0x1.58f9a4p-2f, 
-0x1.e31ebp-1f, 0x1.530d82p-2f, -0x1.e426a6p-1f, 0x1.4d1e1ep-2f, -0x1.e529f2p-1f, 0x1.472b82p-2f, -0x1.e6288ep-1f, 0x1.4135dp-2f, -0x1.e7227cp-1f, 0x1.3b3cf6p-2f, -0x1.e817bap-1f, 0x1.35411p-2f, -0x1.e90842p-1f, 0x1.2f423p-2f, -0x1.e9f416p-1f, 0x1.294066p-2f, 
-0x1.eadb2ep-1f, 0x1.233bbcp-2f, -0x1.ebbd8cp-1f, 0x1.1d3444p-2f, -0x1.ec9b2ep-1f, 0x1.172a0cp-2f, -0x1.ed740ep-1f, 0x1.111d24p-2f, -0x1.ee482ep-1f, 0x1.0b0d9ap-2f, -0x1.ef178ap-1f, 0x1.04fb7cp-2f, -0x1.efe222p-1f, 0x1.fdcdb6p-3f, -0x1.f0a7fp-1f, 0x1.f19f8ap-3f, 
-0x1.f168f4p-1f, 0x1.e56cbp-3f, -0x1.f2252ep-1f, 0x1.d9350ap-3f, -0x1.f2dc9cp-1f, 0x1.ccf8d6p-3f, -0x1.f38f3ap-1f, 0x1.c0b82ep-3f, -0x1.f43d08p-1f, 0x1.b47334p-3f, -0x1.f4e604p-1f, 0x1.a82a06p-3f, -0x1.f58a2cp-1f, 0x1.9bdccp-3f, -0x1.f6297ep-1f, 0x1.8f8b82p-3f, 
-0x1.f6c3f8p-1f, 0x1.83366cp-3f, -0x1.f7599ap-1f, 0x1.76dd98p-3f, -0x1.f7ea62p-1f, 0x1.6a8128p-3f, -0x1.f8765p-1f, 0x1.5e213ap-3f, -0x1.f8fd6p-1f, 0x1.51bdecp-3f, -0x1.f97f92p-1f, 0x1.45575cp-3f, -0x1.f9fce4p-1f, 0x1.38edcap-3f, -0x1.fa7558p-1f, 0x1.2c8114p-3f, 
-0x1.fae8e8p-1f, 0x1.201178p-3f, -0x1.fb5796p-1f, 0x1.139f14p-3f, -0x1.fbc162p-1f, 0x1.072a0ap-3f, -0x1.fc2646p-1f, 0x1.f564ecp-4f, -0x1.fc8646p-1f, 0x1.dc70eep-4f, -0x1.fce16p-1f, 0x1.c3785ap-4f, -0x1.fd3792p-1f, 0x1.aa7b6ap-4f, -0x1.fd88dap-1f, 0x1.917a6p-4f, 
-0x1.fdd53ap-1f, 0x1.787576p-4f, -0x1.fe1cbp-1f, 0x1.5f6ceap-4f, -0x1.fe5f3cp-1f, 0x1.4660fcp-4f, -0x1.fe9cdcp-1f, 0x1.2d51eap-4f, -0x1.fed58ep-1f, 0x1.14403p-4f, -0x1.ff0956p-1f, 0x1.f65716p-5f, -0x1.ff383p-1f, 0x1.c428f6p-5f, -0x1.ff621ep-1f, 0x1.91f67ap-5f, 
-0x1.ff871ep-1f, 0x1.5fc02p-5f, -0x1.ffa72ep-1f, 0x1.2d866p-5f, -0x1.ffc252p-1f, 0x1.f69372p-6f, -0x1.ffd886p-1f, 0x1.92154cp-6f, -0x1.ffe9ccp-1f, 0x1.2d9346p-6f, -0x1.fff622p-1f, 0x1.921caep-7f, -0x1.fffd88p-1f, 0x1.921de4p-8f
};
*/






double ____F[2046] = {
0x1p+0, 
0x0p+0, 
0x1p+0, 
0x0p+0, 
0x1.1a62633145c07p-54,
0x1p+0, 
0x1p+0, 
0x0p+0, 

0x1.6a09e667f3bcdp-1,  //8
0x1.6a09e667f3bccp-1, 
0x1.1a62633145c07p-54, 
0x1p+0, 
-0x1.6a09e667f3bccp-1, 
0x1.6a09e667f3bcdp-1, 
0x1p+0, 
0x0p+0, 

0x1.d906bcf328d46p-1, //16
0x1.87de2a6aea963p-2, 
0x1.6a09e667f3bcdp-1, 
0x1.6a09e667f3bccp-1, 
0x1.87de2a6aea964p-2, 
0x1.d906bcf328d46p-1, 
0x1.1a62633145c07p-54, 
0x1p+0, 
-0x1.87de2a6aea962p-2, 
0x1.d906bcf328d46p-1, 
-0x1.6a09e667f3bccp-1, 
0x1.6a09e667f3bcdp-1, 
-0x1.d906bcf328d46p-1, 
0x1.87de2a6aea964p-2, 
0x1p+0, 
0x0p+0, 

0x1.f6297cff75cbp-1,  //32
0x1.8f8b83c69a60ap-3, 
0x1.d906bcf328d46p-1, 
0x1.87de2a6aea963p-2, 
0x1.a9b66290ea1a3p-1, 
0x1.1c73b39ae68c8p-1, 
0x1.6a09e667f3bcdp-1, 
0x1.6a09e667f3bccp-1, 
0x1.1c73b39ae68c9p-1, 
0x1.a9b66290ea1a2p-1, 
0x1.87de2a6aea964p-2, 
0x1.d906bcf328d46p-1, 
0x1.8f8b83c69a60cp-3, 
0x1.f6297cff75cbp-1, 
0x1.1a62633145c07p-54, 
0x1p+0, 
-0x1.8f8b83c69a608p-3, 
0x1.f6297cff75cbp-1, 
-0x1.87de2a6aea962p-2, 
0x1.d906bcf328d46p-1, 
-0x1.1c73b39ae68c6p-1, 
0x1.a9b66290ea1a5p-1, 
-0x1.6a09e667f3bccp-1, 
0x1.6a09e667f3bcdp-1, 
-0x1.a9b66290ea1a4p-1, 
0x1.1c73b39ae68c8p-1, 
-0x1.d906bcf328d46p-1,
0x1.87de2a6aea964p-2, 
-0x1.f6297cff75cbp-1, 
0x1.8f8b83c69a616p-3, 
0x1p+0, 
0x0p+0,

0x1.fd88da3d12526p-1, //64
0x1.917a6bc29b42cp-4, 
0x1.f6297cff75cbp-1, 
0x1.8f8b83c69a60ap-3, 
0x1.e9f4156c62ddap-1, 
0x1.294062ed59f05p-2, 
0x1.d906bcf328d46p-1, 
0x1.87de2a6aea963p-2, 
0x1.c38b2f180bdb1p-1, 
0x1.e2b5d3806f63bp-2, 
0x1.a9b66290ea1a3p-1, 
0x1.1c73b39ae68c8p-1, 
0x1.8bc806b151741p-1, 
0x1.44cf325091dd6p-1, 
0x1.6a09e667f3bcdp-1, 
0x1.6a09e667f3bccp-1, 
0x1.44cf325091dd7p-1, 
0x1.8bc806b15174p-1, 
0x1.1c73b39ae68c9p-1, 
0x1.a9b66290ea1a2p-1, 
0x1.e2b5d3806f63ep-2, 
0x1.c38b2f180bdbp-1, 
0x1.87de2a6aea964p-2, 
0x1.d906bcf328d46p-1, 
0x1.294062ed59f04p-2, 
0x1.e9f4156c62ddbp-1, 
0x1.8f8b83c69a60cp-3, 
0x1.f6297cff75cbp-1, 
0x1.917a6bc29b438p-4, 
0x1.fd88da3d12525p-1, 
0x1.1a62633145c07p-54, 
0x1p+0, 
-0x1.917a6bc29b43p-4, 
0x1.fd88da3d12526p-1, 
-0x1.8f8b83c69a608p-3, 
0x1.f6297cff75cbp-1, 
-0x1.294062ed59f03p-2, 
0x1.e9f4156c62ddbp-1, 
-0x1.87de2a6aea962p-2, 
0x1.d906bcf328d46p-1, 
-0x1.e2b5d3806f63cp-2, 
0x1.c38b2f180bdb1p-1, 
-0x1.1c73b39ae68c6p-1, 
0x1.a9b66290ea1a5p-1, 
-0x1.44cf325091dd4p-1, 
0x1.8bc806b151742p-1, 
-0x1.6a09e667f3bccp-1, 
0x1.6a09e667f3bcdp-1, 
-0x1.8bc806b151741p-1, 
0x1.44cf325091dd6p-1, 
-0x1.a9b66290ea1a4p-1, 
0x1.1c73b39ae68c8p-1, 
-0x1.c38b2f180bdbp-1, 
0x1.e2b5d3806f63ep-2, 
-0x1.d906bcf328d46p-1, 
0x1.87de2a6aea964p-2, 
-0x1.e9f4156c62ddap-1, 
0x1.294062ed59f05p-2, 
-0x1.f6297cff75cbp-1, 
0x1.8f8b83c69a616p-3, 
-0x1.fd88da3d12525p-1, 
0x1.917a6bc29b43dp-4, 
0x1p+0, 
0x0p+0, 

0x1.ff621e3796d7ep-1, //128
0x1.91f65f10dd814p-5, 
0x1.fd88da3d12526p-1, 
0x1.917a6bc29b42cp-4, 
0x1.fa7557f08a517p-1, 
0x1.2c8106e8e613ap-3, 
0x1.f6297cff75cbp-1, 
0x1.8f8b83c69a60ap-3, 
0x1.f0a7efb9230d7p-1, 
0x1.f19f97b215f1ap-3, 
0x1.e9f4156c62ddap-1, 
0x1.294062ed59f05p-2, 
0x1.e212104f686e5p-1, 
0x1.58f9a75ab1fddp-2, 
0x1.d906bcf328d46p-1, 
0x1.87de2a6aea963p-2, 
0x1.ced7af43cc773p-1, 
0x1.b5d1009e15ccp-2, 
0x1.c38b2f180bdb1p-1, 
0x1.e2b5d3806f63bp-2, 
0x1.b728345196e3ep-1, 
0x1.073879922ffedp-1, 
0x1.a9b66290ea1a3p-1, 
0x1.1c73b39ae68c8p-1, 
0x1.9b3e047f38741p-1, 
0x1.30ff7fce17035p-1, 
0x1.8bc806b151741p-1, 
0x1.44cf325091dd6p-1, 
0x1.7b5df226aafbp-1, 
0x1.57d69348cec9fp-1, 
0x1.6a09e667f3bcdp-1, 
0x1.6a09e667f3bccp-1, 
0x1.57d69348cecap-1, 
0x1.7b5df226aafaep-1, 
0x1.44cf325091dd7p-1, 
0x1.8bc806b15174p-1, 
0x1.30ff7fce17036p-1,
0x1.9b3e047f3874p-1, 
0x1.1c73b39ae68c9p-1, 
0x1.a9b66290ea1a2p-1, 
0x1.073879922ffeep-1, 
0x1.b728345196e3ep-1, 
0x1.e2b5d3806f63ep-2, 
0x1.c38b2f180bdbp-1, 
0x1.b5d1009e15cc2p-2, 
0x1.ced7af43cc773p-1, 
0x1.87de2a6aea964p-2, 
0x1.d906bcf328d46p-1, 
0x1.58f9a75ab1fddp-2, 
0x1.e212104f686e5p-1, 
0x1.294062ed59f04p-2, 
0x1.e9f4156c62ddbp-1, 
0x1.f19f97b215f1ep-3, 
0x1.f0a7efb9230d7p-1,
0x1.8f8b83c69a60cp-3, 
0x1.f6297cff75cbp-1, 
0x1.2c8106e8e613ap-3, 
0x1.fa7557f08a517p-1, 
0x1.917a6bc29b438p-4, 
0x1.fd88da3d12525p-1, 
0x1.91f65f10dd825p-5, 
0x1.ff621e3796d7ep-1, 
0x1.1a62633145c07p-54, 
0x1p+0, 
-0x1.91f65f10dd813p-5, 
0x1.ff621e3796d7ep-1, 
-0x1.917a6bc29b43p-4, 
0x1.fd88da3d12526p-1, 
-0x1.2c8106e8e6136p-3, 
0x1.fa7557f08a517p-1, 
-0x1.8f8b83c69a608p-3, 
0x1.f6297cff75cbp-1, 
-0x1.f19f97b215f1ap-3, 
0x1.f0a7efb9230d7p-1, 
-0x1.294062ed59f03p-2, 
0x1.e9f4156c62ddbp-1, 
-0x1.58f9a75ab1fdbp-2, 
0x1.e212104f686e5p-1, 
-0x1.87de2a6aea962p-2, 
0x1.d906bcf328d46p-1, 
-0x1.b5d1009e15cbcp-2, 
0x1.ced7af43cc774p-1, 
-0x1.e2b5d3806f63cp-2, 
0x1.c38b2f180bdb1p-1, 
-0x1.073879922ffecp-1, 
0x1.b728345196e3ep-1, 
-0x1.1c73b39ae68c6p-1, 
0x1.a9b66290ea1a5p-1, 
-0x1.30ff7fce17034p-1, 
0x1.9b3e047f38741p-1, 
-0x1.44cf325091dd4p-1, 
0x1.8bc806b151742p-1, 
-0x1.57d69348cecap-1, 
0x1.7b5df226aafaep-1, 
-0x1.6a09e667f3bccp-1, 
0x1.6a09e667f3bcdp-1, 
-0x1.7b5df226aafadp-1, 
0x1.57d69348ceca1p-1, 
-0x1.8bc806b151741p-1, 
0x1.44cf325091dd6p-1, 
-0x1.9b3e047f3874p-1, 
0x1.30ff7fce17036p-1, 
-0x1.a9b66290ea1a4p-1, 
0x1.1c73b39ae68c8p-1, 
-0x1.b728345196e3ep-1, 
0x1.073879922ffeep-1, 
-0x1.c38b2f180bdbp-1, 
0x1.e2b5d3806f63ep-2, 
-0x1.ced7af43cc773p-1, 
0x1.b5d1009e15cbfp-2, 
-0x1.d906bcf328d46p-1, 
0x1.87de2a6aea964p-2, 
-0x1.e212104f686e4p-1, 
0x1.58f9a75ab1fe1p-2, 
-0x1.e9f4156c62ddap-1, 
0x1.294062ed59f05p-2, 
-0x1.f0a7efb9230d7p-1, 
0x1.f19f97b215f2p-3, 
-0x1.f6297cff75cbp-1, 
0x1.8f8b83c69a616p-3, 
-0x1.fa7557f08a517p-1, 
0x1.2c8106e8e613cp-3, 
-0x1.fd88da3d12525p-1, 
0x1.917a6bc29b43dp-4, 
-0x1.ff621e3796d7ep-1, 
0x1.91f65f10dd80ep-5, 
0x1p+0, 
0x0p+0, 

0x1.ffd886084cd0dp-1, //256
0x1.92155f7a3667ep-6, 
0x1.ff621e3796d7ep-1, 
0x1.91f65f10dd814p-5, 
0x1.fe9cdad01883ap-1, 
0x1.2d52092ce19f6p-4, 
0x1.fd88da3d12526p-1, 
0x1.917a6bc29b42cp-4, 
0x1.fc26470e19fd3p-1, 
0x1.f564e56a9730ep-4, 
0x1.fa7557f08a517p-1, 
0x1.2c8106e8e613ap-3, 
0x1.f8764fa714ba9p-1, 
0x1.5e214448b3fc6p-3, 
0x1.f6297cff75cbp-1, 
0x1.8f8b83c69a60ap-3, 
0x1.f38f3ac64e589p-1, 
0x1.c0b826a7e4f63p-3, 
0x1.f0a7efb9230d7p-1, 
0x1.f19f97b215f1ap-3, 
0x1.ed740e7684963p-1, 
0x1.111d262b1f677p-2, 
0x1.e9f4156c62ddap-1, 
0x1.294062ed59f05p-2, 
0x1.e6288ec48e112p-1, 
0x1.4135c94176602p-2, 
0x1.e212104f686e5p-1, 
0x1.58f9a75ab1fddp-2, 
0x1.ddb13b6ccc23dp-1, 
0x1.7088530fa459ep-2, 
0x1.d906bcf328d46p-1, 
0x1.87de2a6aea963p-2, 
0x1.d4134d14dc93ap-1, 
0x1.9ef7943a8ed8ap-2, 
0x1.ced7af43cc773p-1, 
0x1.b5d1009e15ccp-2, 
0x1.c954b213411f5p-1, 
0x1.cc66e9931c45dp-2, 
0x1.c38b2f180bdb1p-1, 
0x1.e2b5d3806f63bp-2, 
0x1.bd7c0ac6f952ap-1, 
0x1.f8ba4dbf89abap-2, 
0x1.b728345196e3ep-1, 
0x1.073879922ffedp-1, 
0x1.b090a581502p-1, 
0x1.11eb3541b4b22p-1, 
0x1.a9b66290ea1a3p-1, 
0x1.1c73b39ae68c8p-1, 
0x1.a29a7a0462782p-1, 
0x1.26d054cdd12dfp-1, 
0x1.9b3e047f38741p-1, 
0x1.30ff7fce17035p-1, 
0x1.93a22499263fcp-1, 
0x1.3affa292050b9p-1, 
0x1.8bc806b151741p-1, 
0x1.44cf325091dd6p-1, 
0x1.83b0e0bff976ep-1, 
0x1.4e6cabbe3e5e9p-1, 
0x1.7b5df226aafbp-1, 
0x1.57d69348cec9fp-1, 
0x1.72d0837efff97p-1, 
0x1.610b7551d2cdep-1, 
0x1.6a09e667f3bcdp-1, 
0x1.6a09e667f3bccp-1, 
0x1.610b7551d2cdfp-1, 
0x1.72d0837efff96p-1, 
0x1.57d69348cecap-1, 
0x1.7b5df226aafaep-1, 
0x1.4e6cabbe3e5eap-1, 
0x1.83b0e0bff976dp-1, 
0x1.44cf325091dd7p-1, 
0x1.8bc806b15174p-1, 
0x1.3affa292050bap-1, 
0x1.93a22499263fbp-1,
0x1.30ff7fce17036p-1, 
0x1.9b3e047f3874p-1, 
0x1.26d054cdd12ep-1, 
0x1.a29a7a0462782p-1, 
0x1.1c73b39ae68c9p-1, 
0x1.a9b66290ea1a2p-1, 
0x1.11eb3541b4b24p-1, 
0x1.b090a581501ffp-1, 
0x1.073879922ffeep-1, 
0x1.b728345196e3ep-1, 
0x1.f8ba4dbf89abcp-2, 
0x1.bd7c0ac6f9529p-1, 
0x1.e2b5d3806f63ep-2, 
0x1.c38b2f180bdbp-1, 
0x1.cc66e9931c45ep-2, 
0x1.c954b213411f5p-1, 
0x1.b5d1009e15cc2p-2, 
0x1.ced7af43cc773p-1, 
0x1.9ef7943a8ed89p-2, 
0x1.d4134d14dc93ap-1, 
0x1.87de2a6aea964p-2, 
0x1.d906bcf328d46p-1, 
0x1.7088530fa45a1p-2, 
0x1.ddb13b6ccc23cp-1, 
0x1.58f9a75ab1fddp-2, 
0x1.e212104f686e5p-1, 
0x1.4135c94176602p-2, 
0x1.e6288ec48e112p-1, 
0x1.294062ed59f04p-2, 
0x1.e9f4156c62ddbp-1, 
0x1.111d262b1f678p-2, 
0x1.ed740e7684963p-1, 
0x1.f19f97b215f1ep-3, 
0x1.f0a7efb9230d7p-1, 
0x1.c0b826a7e4f62p-3, 
0x1.f38f3ac64e589p-1, 
0x1.8f8b83c69a60cp-3, 
0x1.f6297cff75cbp-1, 
0x1.5e214448b3fcbp-3, 
0x1.f8764fa714ba9p-1, 
0x1.2c8106e8e613ap-3, 
0x1.fa7557f08a517p-1, 
0x1.f564e56a97314p-4, 
0x1.fc26470e19fd3p-1, 
0x1.917a6bc29b438p-4, 
0x1.fd88da3d12525p-1, 
0x1.2d52092ce19f8p-4, 
0x1.fe9cdad01883ap-1,
 0x1.91f65f10dd825p-5, 
 0x1.ff621e3796d7ep-1, 
 0x1.92155f7a36678p-6, 
 0x1.ffd886084cd0dp-1, 
 0x1.1a62633145c07p-54, 
 0x1p+0, 
-0x1.92155f7a36654p-6, 0x1.ffd886084cd0dp-1, -0x1.91f65f10dd813p-5, 0x1.ff621e3796d7ep-1, -0x1.2d52092ce19fp-4, 0x1.fe9cdad01883ap-1, -0x1.917a6bc29b43p-4, 0x1.fd88da3d12526p-1, -0x1.f564e56a9730cp-4, 0x1.fc26470e19fd3p-1, -0x1.2c8106e8e6136p-3, 0x1.fa7557f08a517p-1, -0x1.5e214448b3fc7p-3, 0x1.f8764fa714ba9p-1, -0x1.8f8b83c69a608p-3, 0x1.f6297cff75cbp-1, 
-0x1.c0b826a7e4f5ep-3, 0x1.f38f3ac64e589p-1, -0x1.f19f97b215f1ap-3, 0x1.f0a7efb9230d7p-1, -0x1.111d262b1f676p-2, 0x1.ed740e7684963p-1, -0x1.294062ed59f03p-2, 0x1.e9f4156c62ddbp-1, -0x1.4135c94176601p-2, 0x1.e6288ec48e112p-1, -0x1.58f9a75ab1fdbp-2, 0x1.e212104f686e5p-1, -0x1.7088530fa459fp-2, 0x1.ddb13b6ccc23cp-1, -0x1.87de2a6aea962p-2, 0x1.d906bcf328d46p-1, 
-0x1.9ef7943a8ed88p-2, 0x1.d4134d14dc93ap-1, -0x1.b5d1009e15cbcp-2, 0x1.ced7af43cc774p-1, -0x1.cc66e9931c46p-2, 0x1.c954b213411f4p-1, -0x1.e2b5d3806f63cp-2, 0x1.c38b2f180bdb1p-1, -0x1.f8ba4dbf89ab8p-2, 0x1.bd7c0ac6f952ap-1, -0x1.073879922ffecp-1, 0x1.b728345196e3ep-1, -0x1.11eb3541b4b2p-1, 0x1.b090a58150201p-1, -0x1.1c73b39ae68c6p-1, 0x1.a9b66290ea1a5p-1, 
-0x1.26d054cdd12dfp-1, 0x1.a29a7a0462782p-1, -0x1.30ff7fce17034p-1, 0x1.9b3e047f38741p-1, -0x1.3affa292050b8p-1, 0x1.93a22499263fcp-1, -0x1.44cf325091dd4p-1, 0x1.8bc806b151742p-1, -0x1.4e6cabbe3e5e7p-1, 0x1.83b0e0bff977p-1, -0x1.57d69348cecap-1, 0x1.7b5df226aafaep-1, -0x1.610b7551d2cdep-1, 0x1.72d0837efff97p-1, -0x1.6a09e667f3bccp-1, 0x1.6a09e667f3bcdp-1, 
-0x1.72d0837efff96p-1, 0x1.610b7551d2cep-1, -0x1.7b5df226aafadp-1, 0x1.57d69348ceca1p-1, -0x1.83b0e0bff976fp-1, 0x1.4e6cabbe3e5e8p-1, -0x1.8bc806b151741p-1, 0x1.44cf325091dd6p-1, -0x1.93a22499263fbp-1, 0x1.3affa292050bap-1, -0x1.9b3e047f3874p-1, 0x1.30ff7fce17036p-1, -0x1.a29a7a0462781p-1, 0x1.26d054cdd12ep-1, -0x1.a9b66290ea1a4p-1, 0x1.1c73b39ae68c8p-1, 
-0x1.b090a581502p-1, 0x1.11eb3541b4b22p-1, -0x1.b728345196e3ep-1, 0x1.073879922ffeep-1, -0x1.bd7c0ac6f9529p-1, 0x1.f8ba4dbf89abcp-2, -0x1.c38b2f180bdbp-1, 0x1.e2b5d3806f63ep-2, -0x1.c954b213411f4p-1, 0x1.cc66e9931c463p-2, -0x1.ced7af43cc773p-1, 0x1.b5d1009e15cbfp-2, -0x1.d4134d14dc93ap-1, 0x1.9ef7943a8ed8ap-2, -0x1.d906bcf328d46p-1, 0x1.87de2a6aea964p-2, 
-0x1.ddb13b6ccc23cp-1, 0x1.7088530fa45a2p-2, -0x1.e212104f686e4p-1, 0x1.58f9a75ab1fe1p-2, -0x1.e6288ec48e112p-1, 0x1.4135c941766p-2, -0x1.e9f4156c62ddap-1, 0x1.294062ed59f05p-2, -0x1.ed740e7684963p-1, 0x1.111d262b1f679p-2, -0x1.f0a7efb9230d7p-1, 0x1.f19f97b215f2p-3, -0x1.f38f3ac64e588p-1, 0x1.c0b826a7e4f6bp-3, -0x1.f6297cff75cbp-1, 0x1.8f8b83c69a616p-3, 
-0x1.f8764fa714ba9p-1, 0x1.5e214448b3fc5p-3, -0x1.fa7557f08a517p-1, 0x1.2c8106e8e613cp-3, -0x1.fc26470e19fd3p-1, 0x1.f564e56a97319p-4, -0x1.fd88da3d12525p-1, 0x1.917a6bc29b43dp-4, -0x1.fe9cdad01883ap-1, 0x1.2d52092ce1a0dp-4, -0x1.ff621e3796d7ep-1, 0x1.91f65f10dd80ep-5, -0x1.ffd886084cd0dp-1, 0x1.92155f7a36689p-6, 0x1p+0, 0x0p+0, 
0x1.fff62169b92dbp-1, 0x1.921d1fcdec784p-7, 0x1.ffd886084cd0dp-1, 0x1.92155f7a3667ep-6, 0x1.ffa72effef75dp-1, 0x1.2d865759455cdp-5, 0x1.ff621e3796d7ep-1, 0x1.91f65f10dd814p-5, 0x1.ff095658e71adp-1, 0x1.f656e79f820ep-5, 0x1.fe9cdad01883ap-1, 0x1.2d52092ce19f6p-4, 0x1.fe1cafcbd5b09p-1, 0x1.5f6d00a9aa419p-4, 0x1.fd88da3d12526p-1, 0x1.917a6bc29b42cp-4, 
0x1.fce15fd6da67bp-1, 0x1.c3785c79ec2d5p-4, 0x1.fc26470e19fd3p-1, 0x1.f564e56a9730ep-4, 0x1.fb5797195d741p-1, 0x1.139f0cedaf576p-3, 0x1.fa7557f08a517p-1, 0x1.2c8106e8e613ap-3, 0x1.f97f924c9099bp-1, 0x1.45576b1293e5ap-3, 0x1.f8764fa714ba9p-1, 0x1.5e214448b3fc6p-3, 0x1.f7599a3a12077p-1, 0x1.76dd9de50bf31p-3, 0x1.f6297cff75cbp-1, 0x1.8f8b83c69a60ap-3, 
0x1.f4e603b0b2f2dp-1, 0x1.a82a025b00451p-3, 0x1.f38f3ac64e589p-1, 0x1.c0b826a7e4f63p-3, 0x1.f2252f7763adap-1, 0x1.d934fe5454311p-3, 0x1.f0a7efb9230d7p-1, 0x1.f19f97b215f1ap-3, 0x1.ef178a3e473c2p-1, 0x1.04fb80e37fdaep-2, 0x1.ed740e7684963p-1, 0x1.111d262b1f677p-2, 0x1.ebbd8c8df0b74p-1, 0x1.1d3443f4cdb3dp-2, 0x1.e9f4156c62ddap-1, 0x1.294062ed59f05p-2, 
0x1.e817bab4cd10dp-1, 0x1.35410c2e18152p-2, 0x1.e6288ec48e112p-1, 0x1.4135c94176602p-2, 0x1.e426a4b2bc17ep-1, 0x1.4d1e24278e76ap-2, 0x1.e212104f686e5p-1, 0x1.58f9a75ab1fddp-2, 0x1.dfeae622dbe2bp-1, 0x1.64c7ddd3f27c6p-2, 0x1.ddb13b6ccc23dp-1, 0x1.7088530fa459ep-2, 0x1.db6526238a09bp-1, 0x1.7c3a9311dcce7p-2, 0x1.d906bcf328d46p-1, 0x1.87de2a6aea963p-2, 
0x1.d696173c9e68bp-1, 0x1.9372a63bc93d7p-2, 0x1.d4134d14dc93ap-1, 0x1.9ef7943a8ed8ap-2, 0x1.d17e7743e35dcp-1, 0x1.aa6c82b6d3fc9p-2, 0x1.ced7af43cc773p-1, 0x1.b5d1009e15ccp-2, 0x1.cc1f0f3fcfc5cp-1, 0x1.c1249d8011ee7p-2, 0x1.c954b213411f5p-1, 0x1.cc66e9931c45dp-2, 0x1.c678b3488739bp-1, 0x1.d79775b86e389p-2, 0x1.c38b2f180bdb1p-1, 0x1.e2b5d3806f63bp-2, 
0x1.c08c426725549p-1, 0x1.edc1952ef78d5p-2, 0x1.bd7c0ac6f952ap-1, 0x1.f8ba4dbf89abap-2, 0x1.ba5aa673590d2p-1, 0x1.01cfc874c3eb7p-1, 0x1.b728345196e3ep-1, 0x1.073879922ffedp-1, 0x1.b3e4d3ef55712p-1, 0x1.0c9704d5d898fp-1, 0x1.b090a581502p-1, 0x1.11eb3541b4b22p-1, 0x1.ad2bc9e21d51p-1, 0x1.1734d63dedb49p-1, 0x1.a9b66290ea1a3p-1, 0x1.1c73b39ae68c8p-1, 
0x1.a63091b02fae2p-1, 0x1.21a799933eb58p-1, 0x1.a29a7a0462782p-1, 0x1.26d054cdd12dfp-1, 0x1.9ef43ef29af94p-1, 0x1.2bedb25faf3eap-1, 0x1.9b3e047f38741p-1, 0x1.30ff7fce17035p-1, 0x1.9777ef4c7d742p-1, 0x1.36058b10659f3p-1, 0x1.93a22499263fcp-1, 0x1.3affa292050b9p-1, 0x1.8fbcca3ef940dp-1, 0x1.3fed9534556d4p-1, 0x1.8bc806b151741p-1, 0x1.44cf325091dd6p-1, 
0x1.87c400fba2ebfp-1, 0x1.49a449b9b0938p-1, 0x1.83b0e0bff976ep-1, 0x1.4e6cabbe3e5e9p-1, 0x1.7f8ece3571771p-1, 0x1.5328292a35596p-1, 0x1.7b5df226aafbp-1, 0x1.57d69348cec9fp-1, 0x1.771e75f037261p-1, 0x1.5c77bbe65018cp-1, 0x1.72d0837efff97p-1, 0x1.610b7551d2cdep-1, 0x1.6e74454eaa8aep-1, 0x1.6591925f0783ep-1, 0x1.6a09e667f3bcdp-1, 0x1.6a09e667f3bccp-1, 
0x1.6591925f0783ep-1, 0x1.6e74454eaa8aep-1, 0x1.610b7551d2cdfp-1, 0x1.72d0837efff96p-1, 0x1.5c77bbe65018dp-1, 0x1.771e75f03726p-1, 0x1.57d69348cecap-1, 0x1.7b5df226aafaep-1, 0x1.5328292a35596p-1, 0x1.7f8ece357177p-1, 0x1.4e6cabbe3e5eap-1, 0x1.83b0e0bff976dp-1, 0x1.49a449b9b0939p-1, 0x1.87c400fba2ebep-1, 0x1.44cf325091dd7p-1, 0x1.8bc806b15174p-1, 
0x1.3fed9534556d5p-1, 0x1.8fbcca3ef940cp-1, 0x1.3affa292050bap-1, 0x1.93a22499263fbp-1, 0x1.36058b10659f3p-1, 0x1.9777ef4c7d741p-1, 0x1.30ff7fce17036p-1, 0x1.9b3e047f3874p-1, 0x1.2bedb25faf3eap-1, 0x1.9ef43ef29af94p-1, 0x1.26d054cdd12ep-1, 0x1.a29a7a0462782p-1, 0x1.21a799933eb59p-1, 0x1.a63091b02fae2p-1, 0x1.1c73b39ae68c9p-1, 0x1.a9b66290ea1a2p-1, 
0x1.1734d63dedb4ap-1, 0x1.ad2bc9e21d51p-1, 0x1.11eb3541b4b24p-1, 0x1.b090a581501ffp-1, 0x1.0c9704d5d898fp-1, 0x1.b3e4d3ef55712p-1, 0x1.073879922ffeep-1, 0x1.b728345196e3ep-1, 0x1.01cfc874c3eb7p-1, 0x1.ba5aa673590d2p-1, 0x1.f8ba4dbf89abcp-2, 0x1.bd7c0ac6f9529p-1, 0x1.edc1952ef78d8p-2, 0x1.c08c426725548p-1, 0x1.e2b5d3806f63ep-2, 0x1.c38b2f180bdbp-1, 
0x1.d79775b86e389p-2, 0x1.c678b3488739bp-1, 0x1.cc66e9931c45ep-2, 0x1.c954b213411f5p-1, 0x1.c1249d8011ee8p-2, 0x1.cc1f0f3fcfc5cp-1, 0x1.b5d1009e15cc2p-2, 0x1.ced7af43cc773p-1, 0x1.aa6c82b6d3fccp-2, 0x1.d17e7743e35dcp-1, 0x1.9ef7943a8ed89p-2, 0x1.d4134d14dc93ap-1, 0x1.9372a63bc93d7p-2, 0x1.d696173c9e68bp-1, 0x1.87de2a6aea964p-2, 0x1.d906bcf328d46p-1, 
0x1.7c3a9311dcce8p-2, 0x1.db6526238a09ap-1, 0x1.7088530fa45a1p-2, 0x1.ddb13b6ccc23cp-1, 0x1.64c7ddd3f27c5p-2, 0x1.dfeae622dbe2bp-1, 0x1.58f9a75ab1fddp-2, 0x1.e212104f686e5p-1, 0x1.4d1e24278e76bp-2, 0x1.e426a4b2bc17ep-1, 0x1.4135c94176602p-2, 0x1.e6288ec48e112p-1, 0x1.35410c2e18154p-2, 0x1.e817bab4cd10cp-1, 0x1.294062ed59f04p-2, 0x1.e9f4156c62ddbp-1, 
0x1.1d3443f4cdb3dp-2, 0x1.ebbd8c8df0b74p-1, 0x1.111d262b1f678p-2, 0x1.ed740e7684963p-1, 0x1.04fb80e37fdafp-2, 0x1.ef178a3e473c2p-1, 0x1.f19f97b215f1ep-3, 0x1.f0a7efb9230d7p-1, 0x1.d934fe5454316p-3, 0x1.f2252f7763ad9p-1, 0x1.c0b826a7e4f62p-3, 0x1.f38f3ac64e589p-1, 0x1.a82a025b00451p-3, 0x1.f4e603b0b2f2dp-1, 0x1.8f8b83c69a60cp-3, 0x1.f6297cff75cbp-1, 
0x1.76dd9de50bf34p-3, 0x1.f7599a3a12077p-1, 0x1.5e214448b3fcbp-3, 0x1.f8764fa714ba9p-1, 0x1.45576b1293e58p-3, 0x1.f97f924c9099bp-1, 0x1.2c8106e8e613ap-3, 0x1.fa7557f08a517p-1, 0x1.139f0cedaf578p-3, 0x1.fb5797195d741p-1, 0x1.f564e56a97314p-4, 0x1.fc26470e19fd3p-1, 0x1.c3785c79ec2dep-4, 0x1.fce15fd6da67bp-1, 0x1.917a6bc29b438p-4, 0x1.fd88da3d12525p-1, 
0x1.5f6d00a9aa418p-4, 0x1.fe1cafcbd5b09p-1, 0x1.2d52092ce19f8p-4, 0x1.fe9cdad01883ap-1, 0x1.f656e79f820ebp-5, 0x1.ff095658e71adp-1, 0x1.91f65f10dd825p-5, 0x1.ff621e3796d7ep-1, 0x1.2d865759455e4p-5, 0x1.ffa72effef75dp-1, 0x1.92155f7a36678p-6, 0x1.ffd886084cd0dp-1, 0x1.921d1fcdec78fp-7, 0x1.fff62169b92dbp-1, 0x1.1a62633145c07p-54, 0x1p+0, 
-0x1.921d1fcdec749p-7, 0x1.fff62169b92dbp-1, -0x1.92155f7a36654p-6, 0x1.ffd886084cd0dp-1, -0x1.2d865759455d2p-5, 0x1.ffa72effef75dp-1, -0x1.91f65f10dd813p-5, 0x1.ff621e3796d7ep-1, -0x1.f656e79f820d9p-5, 0x1.ff095658e71adp-1, -0x1.2d52092ce19fp-4, 0x1.fe9cdad01883ap-1, -0x1.5f6d00a9aa41p-4, 0x1.fe1cafcbd5b09p-1, -0x1.917a6bc29b43p-4, 0x1.fd88da3d12526p-1, 
-0x1.c3785c79ec2d6p-4, 0x1.fce15fd6da67bp-1, -0x1.f564e56a9730cp-4, 0x1.fc26470e19fd3p-1, -0x1.139f0cedaf574p-3, 0x1.fb5797195d741p-1, -0x1.2c8106e8e6136p-3, 0x1.fa7557f08a517p-1, -0x1.45576b1293e54p-3, 0x1.f97f924c9099bp-1, -0x1.5e214448b3fc7p-3, 0x1.f8764fa714ba9p-1, -0x1.76dd9de50bf31p-3, 0x1.f7599a3a12077p-1, -0x1.8f8b83c69a608p-3, 0x1.f6297cff75cbp-1, 
-0x1.a82a025b0044dp-3, 0x1.f4e603b0b2f2dp-1, -0x1.c0b826a7e4f5ep-3, 0x1.f38f3ac64e589p-1, -0x1.d934fe5454313p-3, 0x1.f2252f7763adap-1, -0x1.f19f97b215f1ap-3, 0x1.f0a7efb9230d7p-1, -0x1.04fb80e37fdadp-2, 0x1.ef178a3e473c2p-1, -0x1.111d262b1f676p-2, 0x1.ed740e7684963p-1, -0x1.1d3443f4cdb3bp-2, 0x1.ebbd8c8df0b75p-1, -0x1.294062ed59f03p-2, 0x1.e9f4156c62ddbp-1, 
-0x1.35410c2e18152p-2, 0x1.e817bab4cd10dp-1, -0x1.4135c94176601p-2, 0x1.e6288ec48e112p-1, -0x1.4d1e24278e769p-2, 0x1.e426a4b2bc17fp-1, -0x1.58f9a75ab1fdbp-2, 0x1.e212104f686e5p-1, -0x1.64c7ddd3f27c3p-2, 0x1.dfeae622dbe2bp-1, -0x1.7088530fa459fp-2, 0x1.ddb13b6ccc23cp-1, -0x1.7c3a9311dcce7p-2, 0x1.db6526238a09bp-1, -0x1.87de2a6aea962p-2, 0x1.d906bcf328d46p-1, 
-0x1.9372a63bc93d5p-2, 0x1.d696173c9e68bp-1, -0x1.9ef7943a8ed88p-2, 0x1.d4134d14dc93ap-1, -0x1.aa6c82b6d3fc6p-2, 0x1.d17e7743e35ddp-1, -0x1.b5d1009e15cbcp-2, 0x1.ced7af43cc774p-1, -0x1.c1249d8011ee2p-2, 0x1.cc1f0f3fcfc5dp-1, -0x1.cc66e9931c46p-2, 0x1.c954b213411f4p-1, -0x1.d79775b86e38bp-2, 0x1.c678b3488739bp-1, -0x1.e2b5d3806f63cp-2, 0x1.c38b2f180bdb1p-1, 
-0x1.edc1952ef78d5p-2, 0x1.c08c426725549p-1, -0x1.f8ba4dbf89ab8p-2, 0x1.bd7c0ac6f952ap-1, -0x1.01cfc874c3eb6p-1, 0x1.ba5aa673590d3p-1, -0x1.073879922ffecp-1, 0x1.b728345196e3ep-1, -0x1.0c9704d5d898dp-1, 0x1.b3e4d3ef55712p-1, -0x1.11eb3541b4b2p-1, 0x1.b090a58150201p-1, -0x1.1734d63dedb46p-1, 0x1.ad2bc9e21d512p-1, -0x1.1c73b39ae68c6p-1, 0x1.a9b66290ea1a5p-1, 
-0x1.21a799933eb59p-1, 0x1.a63091b02fae2p-1, -0x1.26d054cdd12dfp-1, 0x1.a29a7a0462782p-1, -0x1.2bedb25faf3eap-1, 0x1.9ef43ef29af94p-1, -0x1.30ff7fce17034p-1, 0x1.9b3e047f38741p-1, -0x1.36058b10659f2p-1, 0x1.9777ef4c7d742p-1, -0x1.3affa292050b8p-1, 0x1.93a22499263fcp-1, -0x1.3fed9534556d3p-1, 0x1.8fbcca3ef940ep-1, -0x1.44cf325091dd4p-1, 0x1.8bc806b151742p-1, 
-0x1.49a449b9b0937p-1, 0x1.87c400fba2ecp-1, -0x1.4e6cabbe3e5e7p-1, 0x1.83b0e0bff977p-1, -0x1.5328292a35596p-1, 0x1.7f8ece357177p-1, -0x1.57d69348cecap-1, 0x1.7b5df226aafaep-1, -0x1.5c77bbe65018cp-1, 0x1.771e75f037261p-1, -0x1.610b7551d2cdep-1, 0x1.72d0837efff97p-1, -0x1.6591925f0783dp-1, 0x1.6e74454eaa8afp-1, -0x1.6a09e667f3bccp-1, 0x1.6a09e667f3bcdp-1, 
-0x1.6e74454eaa8aep-1, 0x1.6591925f0783ep-1, -0x1.72d0837efff96p-1, 0x1.610b7551d2cep-1, -0x1.771e75f03726p-1, 0x1.5c77bbe65018ep-1, -0x1.7b5df226aafadp-1, 0x1.57d69348ceca1p-1, -0x1.7f8ece357176ep-1, 0x1.5328292a35598p-1, -0x1.83b0e0bff976fp-1, 0x1.4e6cabbe3e5e8p-1, -0x1.87c400fba2ebfp-1, 0x1.49a449b9b0938p-1, -0x1.8bc806b151741p-1, 0x1.44cf325091dd6p-1, 
-0x1.8fbcca3ef940dp-1, 0x1.3fed9534556d4p-1, -0x1.93a22499263fbp-1, 0x1.3affa292050bap-1, -0x1.9777ef4c7d741p-1, 0x1.36058b10659f3p-1, -0x1.9b3e047f3874p-1, 0x1.30ff7fce17036p-1, -0x1.9ef43ef29af93p-1, 0x1.2bedb25faf3ebp-1, -0x1.a29a7a0462781p-1, 0x1.26d054cdd12ep-1, -0x1.a63091b02faep-1, 0x1.21a799933eb5bp-1, -0x1.a9b66290ea1a4p-1, 0x1.1c73b39ae68c8p-1, 
-0x1.ad2bc9e21d511p-1, 0x1.1734d63dedb48p-1, -0x1.b090a581502p-1, 0x1.11eb3541b4b22p-1, -0x1.b3e4d3ef55712p-1, 0x1.0c9704d5d898fp-1, -0x1.b728345196e3ep-1, 0x1.073879922ffeep-1, -0x1.ba5aa673590d2p-1, 0x1.01cfc874c3eb7p-1, -0x1.bd7c0ac6f9529p-1, 0x1.f8ba4dbf89abcp-2, -0x1.c08c426725548p-1, 0x1.edc1952ef78d8p-2, -0x1.c38b2f180bdbp-1, 0x1.e2b5d3806f63ep-2, 
-0x1.c678b3488739ap-1, 0x1.d79775b86e38dp-2, -0x1.c954b213411f4p-1, 0x1.cc66e9931c463p-2, -0x1.cc1f0f3fcfc5dp-1, 0x1.c1249d8011ee5p-2, -0x1.ced7af43cc773p-1, 0x1.b5d1009e15cbfp-2, -0x1.d17e7743e35dcp-1, 0x1.aa6c82b6d3fc9p-2, -0x1.d4134d14dc93ap-1, 0x1.9ef7943a8ed8ap-2, -0x1.d696173c9e68bp-1, 0x1.9372a63bc93d8p-2, -0x1.d906bcf328d46p-1, 0x1.87de2a6aea964p-2, 
-0x1.db6526238a09ap-1, 0x1.7c3a9311dcce9p-2, -0x1.ddb13b6ccc23cp-1, 0x1.7088530fa45a2p-2, -0x1.dfeae622dbe2ap-1, 0x1.64c7ddd3f27cap-2, -0x1.e212104f686e4p-1, 0x1.58f9a75ab1fe1p-2, -0x1.e426a4b2bc17ep-1, 0x1.4d1e24278e76fp-2, -0x1.e6288ec48e112p-1, 0x1.4135c941766p-2, -0x1.e817bab4cd10dp-1, 0x1.35410c2e18151p-2, -0x1.e9f4156c62ddap-1, 0x1.294062ed59f05p-2, 
-0x1.ebbd8c8df0b74p-1, 0x1.1d3443f4cdb3ep-2, -0x1.ed740e7684963p-1, 0x1.111d262b1f679p-2, -0x1.ef178a3e473c2p-1, 0x1.04fb80e37fdbp-2, -0x1.f0a7efb9230d7p-1, 0x1.f19f97b215f2p-3, -0x1.f2252f7763ad9p-1, 0x1.d934fe5454318p-3, -0x1.f38f3ac64e588p-1, 0x1.c0b826a7e4f6bp-3, -0x1.f4e603b0b2f2cp-1, 0x1.a82a025b0045bp-3, -0x1.f6297cff75cbp-1, 0x1.8f8b83c69a616p-3, 
-0x1.f7599a3a12078p-1, 0x1.76dd9de50bf2fp-3, -0x1.f8764fa714ba9p-1, 0x1.5e214448b3fc5p-3, -0x1.f97f924c9099bp-1, 0x1.45576b1293e5ap-3, -0x1.fa7557f08a517p-1, 0x1.2c8106e8e613cp-3, -0x1.fb5797195d741p-1, 0x1.139f0cedaf57ap-3, -0x1.fc26470e19fd3p-1, 0x1.f564e56a97319p-4, -0x1.fce15fd6da67bp-1, 0x1.c3785c79ec2e3p-4, -0x1.fd88da3d12525p-1, 0x1.917a6bc29b43dp-4, 
-0x1.fe1cafcbd5b09p-1, 0x1.5f6d00a9aa42cp-4, -0x1.fe9cdad01883ap-1, 0x1.2d52092ce1a0dp-4, -0x1.ff095658e71adp-1, 0x1.f656e79f820d4p-5, -0x1.ff621e3796d7ep-1, 0x1.91f65f10dd80ep-5, -0x1.ffa72effef75dp-1, 0x1.2d865759455cdp-5, -0x1.ffd886084cd0dp-1, 0x1.92155f7a36689p-6, -0x1.fff62169b92dbp-1, 0x1.921d1fcdec7b3p-7, 0x1p+0, 0x0p+0, 
0x1.fffd8858e8a92p-1, 0x1.921f0fe670071p-8, 0x1.fff62169b92dbp-1, 0x1.921d1fcdec784p-7, 0x1.ffe9cb44b51a1p-1, 0x1.2d936bbe30efdp-6, 0x1.ffd886084cd0dp-1, 0x1.92155f7a3667ep-6, 0x1.ffc251df1d3f8p-1, 0x1.f693731d1cf01p-6, 0x1.ffa72effef75dp-1, 0x1.2d865759455cdp-5, 0x1.ff871dadb81dfp-1, 0x1.5fc00d290cd43p-5, 0x1.ff621e3796d7ep-1, 0x1.91f65f10dd814p-5, 
0x1.ff3830f8d575cp-1, 0x1.c428d12c0d7e3p-5, 0x1.ff095658e71adp-1, 0x1.f656e79f820ep-5, 0x1.fed58ecb673c4p-1, 0x1.1440134d709b2p-4, 0x1.fe9cdad01883ap-1, 0x1.2d52092ce19f6p-4, 0x1.fe5f3af2e394p-1, 0x1.4661179272096p-4, 0x1.fe1cafcbd5b09p-1, 0x1.5f6d00a9aa419p-4, 0x1.fdd539ff1f456p-1, 0x1.787586a5d5b21p-4, 0x1.fd88da3d12526p-1, 0x1.917a6bc29b42cp-4, 
0x1.fd37914220b84p-1, 0x1.aa7b724495c04p-4, 0x1.fce15fd6da67bp-1, 0x1.c3785c79ec2d5p-4, 0x1.fc8646cfeb721p-1, 0x1.dc70ecbae9fc8p-4, 0x1.fc26470e19fd3p-1, 0x1.f564e56a9730ep-4, 0x1.fbc1617e44186p-1, 0x1.072a047ba831dp-3, 0x1.fb5797195d741p-1, 0x1.139f0cedaf576p-3, 0x1.fae8e8e46cfbbp-1, 0x1.20116d4ec7bcep-3, 0x1.fa7557f08a517p-1, 0x1.2c8106e8e613ap-3, 
0x1.f9fce55adb2c8p-1, 0x1.38edbb0cd8d14p-3, 0x1.f97f924c9099bp-1, 0x1.45576b1293e5ap-3, 0x1.f8fd5ffae41dbp-1, 0x1.51bdf8597c5f2p-3, 0x1.f8764fa714ba9p-1, 0x1.5e214448b3fc6p-3, 0x1.f7ea629e63d6ep-1, 0x1.6a81304f64ab2p-3, 0x1.f7599a3a12077p-1, 0x1.76dd9de50bf31p-3, 0x1.f6c3f7df5bbb7p-1, 0x1.83366e89c64c5p-3, 0x1.f6297cff75cbp-1, 0x1.8f8b83c69a60ap-3, 
0x1.f58a2b1789e84p-1, 0x1.9bdcbf2dc4366p-3, 0x1.f4e603b0b2f2dp-1, 0x1.a82a025b00451p-3, 0x1.f43d085ff92ddp-1, 0x1.b4732ef3d6722p-3, 0x1.f38f3ac64e589p-1, 0x1.c0b826a7e4f63p-3, 0x1.f2dc9c9089a9dp-1, 0x1.ccf8cb312b286p-3, 0x1.f2252f7763adap-1, 0x1.d934fe5454311p-3, 0x1.f168f53f7205dp-1, 0x1.e56ca1e101a1bp-3, 0x1.f0a7efb9230d7p-1, 0x1.f19f97b215f1ap-3, 
0x1.efe220c0b95ecp-1, 0x1.fdcdc1adfedf8p-3, 0x1.ef178a3e473c2p-1, 0x1.04fb80e37fdaep-2, 0x1.ee482e25a9dbcp-1, 0x1.0b0d9cfdbdb9p-2, 0x1.ed740e7684963p-1, 0x1.111d262b1f677p-2, 0x1.ec9b2d3c3bf84p-1, 0x1.172a0d7765177p-2, 0x1.ebbd8c8df0b74p-1, 0x1.1d3443f4cdb3dp-2, 0x1.eadb2e8e7a88ep-1, 0x1.233bbabc3bb72p-2, 0x1.e9f4156c62ddap-1, 0x1.294062ed59f05p-2, 
0x1.e9084361df7f2p-1, 0x1.2f422daec0386p-2, 0x1.e817bab4cd10dp-1, 0x1.35410c2e18152p-2, 0x1.e7227db6a9744p-1, 0x1.3b3cefa0414b7p-2, 0x1.e6288ec48e112p-1, 0x1.4135c94176602p-2, 0x1.e529f04729ffcp-1, 0x1.472b8a5571054p-2, 0x1.e426a4b2bc17ep-1, 0x1.4d1e24278e76ap-2, 0x1.e31eae870ce25p-1, 0x1.530d880af3c24p-2, 0x1.e212104f686e5p-1, 0x1.58f9a75ab1fddp-2, 
0x1.e100cca2980acp-1, 0x1.5ee27379ea693p-2, 0x1.dfeae622dbe2bp-1, 0x1.64c7ddd3f27c6p-2, 0x1.ded05f7de47dap-1, 0x1.6aa9d7dc77e16p-2, 0x1.ddb13b6ccc23dp-1, 0x1.7088530fa459ep-2, 0x1.dc8d7cb41026p-1, 0x1.766340f2418f6p-2, 0x1.db6526238a09bp-1, 0x1.7c3a9311dcce7p-2, 0x1.da383a9668988p-1, 0x1.820e3b04eaac4p-2, 0x1.d906bcf328d46p-1, 0x1.87de2a6aea963p-2, 
0x1.d7d0b02b8ecf9p-1, 0x1.8daa52ec8a4afp-2, 0x1.d696173c9e68bp-1, 0x1.9372a63bc93d7p-2, 0x1.d556f52e93eb1p-1, 0x1.993716141bdfep-2, 0x1.d4134d14dc93ap-1, 0x1.9ef7943a8ed8ap-2, 0x1.d2cb220e0ef9fp-1, 0x1.a4b4127dea1e4p-2, 0x1.d17e7743e35dcp-1, 0x1.aa6c82b6d3fc9p-2, 0x1.d02d4feb2bd92p-1, 0x1.b020d6c7f4009p-2, 0x1.ced7af43cc773p-1, 0x1.b5d1009e15ccp-2, 
0x1.cd7d9898b32f6p-1, 0x1.bb7cf2304bd01p-2, 0x1.cc1f0f3fcfc5cp-1, 0x1.c1249d8011ee7p-2, 0x1.cabc169a0b901p-1, 0x1.c6c7f4997000ap-2, 0x1.c954b213411f5p-1, 0x1.cc66e9931c45dp-2, 0x1.c7e8e52233cf3p-1, 0x1.d2016e8e9db5bp-2, 0x1.c678b3488739bp-1, 0x1.d79775b86e389p-2, 0x1.c5042012b6907p-1, 0x1.dd28f1481cc58p-2, 0x1.c38b2f180bdb1p-1, 0x1.e2b5d3806f63bp-2, 
0x1.c20de3fa971bp-1, 0x1.e83e0eaf85113p-2, 0x1.c08c426725549p-1, 0x1.edc1952ef78d5p-2, 0x1.bf064e15377ddp-1, 0x1.f3405963fd068p-2, 0x1.bd7c0ac6f952ap-1, 0x1.f8ba4dbf89abap-2, 0x1.bbed7c49380eap-1, 0x1.fe2f64be7121p-2, 0x1.ba5aa673590d2p-1, 0x1.01cfc874c3eb7p-1, 0x1.b8c38d27504e9p-1, 0x1.0485626ae221ap-1, 0x1.b728345196e3ep-1, 0x1.073879922ffedp-1, 
0x1.b5889fe921405p-1, 0x1.09e907417c5e1p-1, 0x1.b3e4d3ef55712p-1, 0x1.0c9704d5d898fp-1, 0x1.b23cd470013b4p-1, 0x1.0f426bb2a8e7dp-1, 0x1.b090a581502p-1, 0x1.11eb3541b4b22p-1, 0x1.aee04b43c1474p-1, 0x1.14915af336cebp-1, 0x1.ad2bc9e21d51p-1, 0x1.1734d63dedb49p-1, 0x1.ab7325916c0d4p-1, 0x1.19d5a09f2b9b8p-1, 0x1.a9b66290ea1a3p-1, 0x1.1c73b39ae68c8p-1, 
0x1.a7f58529fe69dp-1, 0x1.1f0f08bbc861bp-1, 0x1.a63091b02fae2p-1, 0x1.21a799933eb58p-1, 0x1.a4678c8119ac8p-1, 0x1.243d5fb98ac1fp-1, 0x1.a29a7a0462782p-1, 0x1.26d054cdd12dfp-1, 0x1.a0c95eabaf937p-1, 0x1.2960727629ca8p-1, 0x1.9ef43ef29af94p-1, 0x1.2bedb25faf3eap-1, 0x1.9d1b1f5ea80d6p-1, 0x1.2e780e3e8ea16p-1, 0x1.9b3e047f38741p-1, 0x1.30ff7fce17035p-1, 
0x1.995cf2ed80d22p-1, 0x1.338400d0c8e57p-1, 0x1.9777ef4c7d742p-1, 0x1.36058b10659f3p-1, 0x1.958efe48e6dd7p-1, 0x1.3884185dfeb22p-1, 0x1.93a22499263fcp-1, 0x1.3affa292050b9p-1, 0x1.91b166fd49da2p-1, 0x1.3d78238c58343p-1, 0x1.8fbcca3ef940dp-1, 0x1.3fed9534556d4p-1, 0x1.8dc45331698ccp-1, 0x1.425ff178e6bb1p-1, 0x1.8bc806b151741p-1, 0x1.44cf325091dd6p-1, 
0x1.89c7e9a4dd4abp-1, 0x1.473b51b987347p-1, 0x1.87c400fba2ebfp-1, 0x1.49a449b9b0938p-1, 0x1.85bc51ae958ccp-1, 0x1.4c0a145ec0004p-1, 0x1.83b0e0bff976ep-1, 0x1.4e6cabbe3e5e9p-1, 0x1.81a1b33b57accp-1, 0x1.50cc09f59a09bp-1, 0x1.7f8ece3571771p-1, 0x1.5328292a35596p-1, 0x1.7d7836cc33db2p-1, 0x1.5581038975137p-1, 0x1.7b5df226aafbp-1, 0x1.57d69348cec9fp-1, 
0x1.79400574f55e4p-1, 0x1.5a28d2a5d725p-1, 0x1.771e75f037261p-1, 0x1.5c77bbe65018cp-1, 0x1.74f948da8d28dp-1, 0x1.5ec3495837074p-1, 0x1.72d0837efff97p-1, 0x1.610b7551d2cdep-1, 0x1.70a42b3176d7ap-1, 0x1.63503a31c1be8p-1, 0x1.6e74454eaa8aep-1, 0x1.6591925f0783ep-1, 0x1.6c40d73c18275p-1, 0x1.67cf78491af1p-1, 0x1.6a09e667f3bcdp-1, 0x1.6a09e667f3bccp-1, 
0x1.67cf78491af11p-1, 0x1.6c40d73c18274p-1, 0x1.6591925f0783ep-1, 0x1.6e74454eaa8aep-1, 0x1.63503a31c1be9p-1, 0x1.70a42b3176d7ap-1, 0x1.610b7551d2cdfp-1, 0x1.72d0837efff96p-1, 0x1.5ec3495837075p-1, 0x1.74f948da8d28dp-1, 0x1.5c77bbe65018dp-1, 0x1.771e75f03726p-1, 0x1.5a28d2a5d7251p-1, 0x1.79400574f55e4p-1, 0x1.57d69348cecap-1, 0x1.7b5df226aafaep-1, 
0x1.5581038975138p-1, 0x1.7d7836cc33db2p-1, 0x1.5328292a35596p-1, 0x1.7f8ece357177p-1, 0x1.50cc09f59a09cp-1, 0x1.81a1b33b57acbp-1, 0x1.4e6cabbe3e5eap-1, 0x1.83b0e0bff976dp-1, 0x1.4c0a145ec0005p-1, 0x1.85bc51ae958ccp-1, 0x1.49a449b9b0939p-1, 0x1.87c400fba2ebep-1, 0x1.473b51b987348p-1, 0x1.89c7e9a4dd4aap-1, 0x1.44cf325091dd7p-1, 0x1.8bc806b15174p-1, 
0x1.425ff178e6bb2p-1, 0x1.8dc45331698ccp-1, 0x1.3fed9534556d5p-1, 0x1.8fbcca3ef940cp-1, 0x1.3d78238c58344p-1, 0x1.91b166fd49da2p-1, 0x1.3affa292050bap-1, 0x1.93a22499263fbp-1, 0x1.3884185dfeb22p-1, 0x1.958efe48e6dd6p-1, 0x1.36058b10659f3p-1, 0x1.9777ef4c7d741p-1, 0x1.338400d0c8e57p-1, 0x1.995cf2ed80d22p-1, 0x1.30ff7fce17036p-1, 0x1.9b3e047f3874p-1, 
0x1.2e780e3e8ea17p-1, 0x1.9d1b1f5ea80d5p-1, 0x1.2bedb25faf3eap-1, 0x1.9ef43ef29af94p-1, 0x1.2960727629ca9p-1, 0x1.a0c95eabaf936p-1, 0x1.26d054cdd12ep-1, 0x1.a29a7a0462782p-1, 0x1.243d5fb98ac2p-1, 0x1.a4678c8119ac8p-1, 0x1.21a799933eb59p-1, 0x1.a63091b02fae2p-1, 0x1.1f0f08bbc861bp-1, 0x1.a7f58529fe69cp-1, 0x1.1c73b39ae68c9p-1, 0x1.a9b66290ea1a2p-1, 
0x1.19d5a09f2b9b9p-1, 0x1.ab7325916c0d4p-1, 0x1.1734d63dedb4ap-1, 0x1.ad2bc9e21d51p-1, 0x1.14915af336cecp-1, 0x1.aee04b43c1473p-1, 0x1.11eb3541b4b24p-1, 0x1.b090a581501ffp-1, 0x1.0f426bb2a8e7fp-1, 0x1.b23cd470013b3p-1, 0x1.0c9704d5d898fp-1, 0x1.b3e4d3ef55712p-1, 0x1.09e907417c5e1p-1, 0x1.b5889fe921405p-1, 0x1.073879922ffeep-1, 0x1.b728345196e3ep-1, 
0x1.0485626ae221bp-1, 0x1.b8c38d27504e8p-1, 0x1.01cfc874c3eb7p-1, 0x1.ba5aa673590d2p-1, 0x1.fe2f64be71211p-2, 0x1.bbed7c49380eap-1, 0x1.f8ba4dbf89abcp-2, 0x1.bd7c0ac6f9529p-1, 0x1.f3405963fd06ap-2, 0x1.bf064e15377dcp-1, 0x1.edc1952ef78d8p-2, 0x1.c08c426725548p-1, 0x1.e83e0eaf85116p-2, 0x1.c20de3fa971afp-1, 0x1.e2b5d3806f63ep-2, 0x1.c38b2f180bdbp-1, 
0x1.dd28f1481cc57p-2, 0x1.c5042012b6907p-1, 0x1.d79775b86e389p-2, 0x1.c678b3488739bp-1, 0x1.d2016e8e9db5bp-2, 0x1.c7e8e52233cf3p-1, 0x1.cc66e9931c45ep-2, 0x1.c954b213411f5p-1, 0x1.c6c7f4997000bp-2, 0x1.cabc169a0b9p-1, 0x1.c1249d8011ee8p-2, 0x1.cc1f0f3fcfc5cp-1, 0x1.bb7cf2304bd02p-2, 0x1.cd7d9898b32f6p-1, 0x1.b5d1009e15cc2p-2, 0x1.ced7af43cc773p-1, 
0x1.b020d6c7f400bp-2, 0x1.d02d4feb2bd92p-1, 0x1.aa6c82b6d3fccp-2, 0x1.d17e7743e35dcp-1, 0x1.a4b4127dea1e4p-2, 0x1.d2cb220e0ef9fp-1, 0x1.9ef7943a8ed89p-2, 0x1.d4134d14dc93ap-1, 0x1.993716141bdfep-2, 0x1.d556f52e93eb1p-1, 0x1.9372a63bc93d7p-2, 0x1.d696173c9e68bp-1, 0x1.8daa52ec8a4bp-2, 0x1.d7d0b02b8ecf9p-1, 0x1.87de2a6aea964p-2, 0x1.d906bcf328d46p-1, 
0x1.820e3b04eaac5p-2, 0x1.da383a9668988p-1, 0x1.7c3a9311dcce8p-2, 0x1.db6526238a09ap-1, 0x1.766340f2418f8p-2, 0x1.dc8d7cb41026p-1, 0x1.7088530fa45a1p-2, 0x1.ddb13b6ccc23cp-1, 0x1.6aa9d7dc77e19p-2, 0x1.ded05f7de47d9p-1, 0x1.64c7ddd3f27c5p-2, 0x1.dfeae622dbe2bp-1, 0x1.5ee27379ea693p-2, 0x1.e100cca2980acp-1, 0x1.58f9a75ab1fddp-2, 0x1.e212104f686e5p-1, 
0x1.530d880af3c24p-2, 0x1.e31eae870ce25p-1, 0x1.4d1e24278e76bp-2, 0x1.e426a4b2bc17ep-1, 0x1.472b8a5571055p-2, 0x1.e529f04729ffcp-1, 0x1.4135c94176602p-2, 0x1.e6288ec48e112p-1, 0x1.3b3cefa0414b9p-2, 0x1.e7227db6a9744p-1, 0x1.35410c2e18154p-2, 0x1.e817bab4cd10cp-1, 0x1.2f422daec0389p-2, 0x1.e9084361df7f2p-1, 0x1.294062ed59f04p-2, 0x1.e9f4156c62ddbp-1, 
0x1.233bbabc3bb71p-2, 0x1.eadb2e8e7a88ep-1, 0x1.1d3443f4cdb3dp-2, 0x1.ebbd8c8df0b74p-1, 0x1.172a0d7765177p-2, 0x1.ec9b2d3c3bf84p-1, 0x1.111d262b1f678p-2, 0x1.ed740e7684963p-1, 0x1.0b0d9cfdbdb91p-2, 0x1.ee482e25a9dbcp-1, 0x1.04fb80e37fdafp-2, 0x1.ef178a3e473c2p-1, 0x1.fdcdc1adfedfcp-3, 0x1.efe220c0b95ecp-1, 0x1.f19f97b215f1ep-3, 0x1.f0a7efb9230d7p-1, 
0x1.e56ca1e101a2p-3, 0x1.f168f53f7205dp-1, 0x1.d934fe5454316p-3, 0x1.f2252f7763ad9p-1, 0x1.ccf8cb312b284p-3, 0x1.f2dc9c9089a9dp-1, 0x1.c0b826a7e4f62p-3, 0x1.f38f3ac64e589p-1, 0x1.b4732ef3d6722p-3, 0x1.f43d085ff92ddp-1, 0x1.a82a025b00451p-3, 0x1.f4e603b0b2f2dp-1, 0x1.9bdcbf2dc4367p-3, 0x1.f58a2b1789e84p-1, 0x1.8f8b83c69a60cp-3, 0x1.f6297cff75cbp-1, 
0x1.83366e89c64c8p-3, 0x1.f6c3f7df5bbb7p-1, 0x1.76dd9de50bf34p-3, 0x1.f7599a3a12077p-1, 0x1.6a81304f64ab6p-3, 0x1.f7ea629e63d6ep-1, 0x1.5e214448b3fcbp-3, 0x1.f8764fa714ba9p-1, 0x1.51bdf8597c5f7p-3, 0x1.f8fd5ffae41dbp-1, 0x1.45576b1293e58p-3, 0x1.f97f924c9099bp-1, 0x1.38edbb0cd8d13p-3, 0x1.f9fce55adb2c8p-1, 0x1.2c8106e8e613ap-3, 0x1.fa7557f08a517p-1, 
0x1.20116d4ec7bcfp-3, 0x1.fae8e8e46cfbbp-1, 0x1.139f0cedaf578p-3, 0x1.fb5797195d741p-1, 0x1.072a047ba831fp-3, 0x1.fbc1617e44186p-1, 0x1.f564e56a97314p-4, 0x1.fc26470e19fd3p-1, 0x1.dc70ecbae9fdp-4, 0x1.fc8646cfeb721p-1, 0x1.c3785c79ec2dep-4, 0x1.fce15fd6da67bp-1, 0x1.aa7b724495c0ep-4, 0x1.fd37914220b84p-1, 0x1.917a6bc29b438p-4, 0x1.fd88da3d12525p-1, 
0x1.787586a5d5b1fp-4, 0x1.fdd539ff1f456p-1, 0x1.5f6d00a9aa418p-4, 0x1.fe1cafcbd5b09p-1, 0x1.4661179272096p-4, 0x1.fe5f3af2e394p-1, 0x1.2d52092ce19f8p-4, 0x1.fe9cdad01883ap-1, 0x1.1440134d709b6p-4, 0x1.fed58ecb673c4p-1, 0x1.f656e79f820ebp-5, 0x1.ff095658e71adp-1, 0x1.c428d12c0d7fp-5, 0x1.ff3830f8d575cp-1, 0x1.91f65f10dd825p-5, 0x1.ff621e3796d7ep-1, 
0x1.5fc00d290cd57p-5, 0x1.ff871dadb81dfp-1, 0x1.2d865759455e4p-5, 0x1.ffa72effef75dp-1, 0x1.f693731d1cef5p-6, 0x1.ffc251df1d3f8p-1, 0x1.92155f7a36678p-6, 0x1.ffd886084cd0dp-1, 0x1.2d936bbe30efdp-6, 0x1.ffe9cb44b51a1p-1, 0x1.921d1fcdec78fp-7, 0x1.fff62169b92dbp-1, 0x1.921f0fe6700ap-8, 0x1.fffd8858e8a92p-1, 0x1.1a62633145c07p-54, 0x1p+0, 
-0x1.921f0fe670012p-8, 0x1.fffd8858e8a92p-1, -0x1.921d1fcdec749p-7, 0x1.fff62169b92dbp-1, -0x1.2d936bbe30ed9p-6, 0x1.ffe9cb44b51a1p-1, -0x1.92155f7a36654p-6, 0x1.ffd886084cd0dp-1, -0x1.f693731d1ced1p-6, 0x1.ffc251df1d3f8p-1, -0x1.2d865759455d2p-5, 0x1.ffa72effef75dp-1, -0x1.5fc00d290cd45p-5, 0x1.ff871dadb81dfp-1, -0x1.91f65f10dd813p-5, 0x1.ff621e3796d7ep-1, 
-0x1.c428d12c0d7dfp-5, 0x1.ff3830f8d575cp-1, -0x1.f656e79f820d9p-5, 0x1.ff095658e71adp-1, -0x1.1440134d709aep-4, 0x1.fed58ecb673c4p-1, -0x1.2d52092ce19fp-4, 0x1.fe9cdad01883ap-1, -0x1.466117927208ep-4, 0x1.fe5f3af2e394p-1, -0x1.5f6d00a9aa41p-4, 0x1.fe1cafcbd5b09p-1, -0x1.787586a5d5b17p-4, 0x1.fdd539ff1f456p-1, -0x1.917a6bc29b43p-4, 0x1.fd88da3d12526p-1, 
-0x1.aa7b724495c06p-4, 0x1.fd37914220b84p-1, -0x1.c3785c79ec2d6p-4, 0x1.fce15fd6da67bp-1, -0x1.dc70ecbae9fc8p-4, 0x1.fc8646cfeb721p-1, -0x1.f564e56a9730cp-4, 0x1.fc26470e19fd3p-1, -0x1.072a047ba831bp-3, 0x1.fbc1617e44186p-1, -0x1.139f0cedaf574p-3, 0x1.fb5797195d741p-1, -0x1.20116d4ec7bcbp-3, 0x1.fae8e8e46cfbbp-1, -0x1.2c8106e8e6136p-3, 0x1.fa7557f08a517p-1, 
-0x1.38edbb0cd8d0fp-3, 0x1.f9fce55adb2c8p-1, -0x1.45576b1293e54p-3, 0x1.f97f924c9099bp-1, -0x1.51bdf8597c5f3p-3, 0x1.f8fd5ffae41dbp-1, -0x1.5e214448b3fc7p-3, 0x1.f8764fa714ba9p-1, -0x1.6a81304f64ab2p-3, 0x1.f7ea629e63d6ep-1, -0x1.76dd9de50bf31p-3, 0x1.f7599a3a12077p-1, -0x1.83366e89c64c4p-3, 0x1.f6c3f7df5bbb7p-1, -0x1.8f8b83c69a608p-3, 0x1.f6297cff75cbp-1, 
-0x1.9bdcbf2dc4363p-3, 0x1.f58a2b1789e84p-1, -0x1.a82a025b0044dp-3, 0x1.f4e603b0b2f2dp-1, -0x1.b4732ef3d671ep-3, 0x1.f43d085ff92ddp-1, -0x1.c0b826a7e4f5ep-3, 0x1.f38f3ac64e589p-1, -0x1.ccf8cb312b28p-3, 0x1.f2dc9c9089a9dp-1, -0x1.d934fe5454313p-3, 0x1.f2252f7763adap-1, -0x1.e56ca1e101a1cp-3, 0x1.f168f53f7205dp-1, -0x1.f19f97b215f1ap-3, 0x1.f0a7efb9230d7p-1, 
-0x1.fdcdc1adfedf8p-3, 0x1.efe220c0b95ecp-1, -0x1.04fb80e37fdadp-2, 0x1.ef178a3e473c2p-1, -0x1.0b0d9cfdbdb8fp-2, 0x1.ee482e25a9dbcp-1, -0x1.111d262b1f676p-2, 0x1.ed740e7684963p-1, -0x1.172a0d7765175p-2, 0x1.ec9b2d3c3bf84p-1, -0x1.1d3443f4cdb3bp-2, 0x1.ebbd8c8df0b75p-1, -0x1.233bbabc3bb6fp-2, 0x1.eadb2e8e7a88ep-1, -0x1.294062ed59f03p-2, 0x1.e9f4156c62ddbp-1, 
-0x1.2f422daec0387p-2, 0x1.e9084361df7f2p-1, -0x1.35410c2e18152p-2, 0x1.e817bab4cd10dp-1, -0x1.3b3cefa0414b7p-2, 0x1.e7227db6a9744p-1, -0x1.4135c94176601p-2, 0x1.e6288ec48e112p-1, -0x1.472b8a5571053p-2, 0x1.e529f04729ffdp-1, -0x1.4d1e24278e769p-2, 0x1.e426a4b2bc17fp-1, -0x1.530d880af3c22p-2, 0x1.e31eae870ce25p-1, -0x1.58f9a75ab1fdbp-2, 0x1.e212104f686e5p-1, 
-0x1.5ee27379ea691p-2, 0x1.e100cca2980acp-1, -0x1.64c7ddd3f27c3p-2, 0x1.dfeae622dbe2bp-1, -0x1.6aa9d7dc77e17p-2, 0x1.ded05f7de47dap-1, -0x1.7088530fa459fp-2, 0x1.ddb13b6ccc23cp-1, -0x1.766340f2418f6p-2, 0x1.dc8d7cb41026p-1, -0x1.7c3a9311dcce7p-2, 0x1.db6526238a09bp-1, -0x1.820e3b04eaac3p-2, 0x1.da383a9668988p-1, -0x1.87de2a6aea962p-2, 0x1.d906bcf328d46p-1, 
-0x1.8daa52ec8a4aep-2, 0x1.d7d0b02b8ecfap-1, -0x1.9372a63bc93d5p-2, 0x1.d696173c9e68bp-1, -0x1.993716141bdfdp-2, 0x1.d556f52e93eb1p-1, -0x1.9ef7943a8ed88p-2, 0x1.d4134d14dc93ap-1, -0x1.a4b4127dea1e2p-2, 0x1.d2cb220e0ef9fp-1, -0x1.aa6c82b6d3fc6p-2, 0x1.d17e7743e35ddp-1, -0x1.b020d6c7f4009p-2, 0x1.d02d4feb2bd92p-1, -0x1.b5d1009e15cbcp-2, 0x1.ced7af43cc774p-1, 
-0x1.bb7cf2304bd01p-2, 0x1.cd7d9898b32f6p-1, -0x1.c1249d8011ee2p-2, 0x1.cc1f0f3fcfc5dp-1, -0x1.c6c7f49970009p-2, 0x1.cabc169a0b901p-1, -0x1.cc66e9931c46p-2, 0x1.c954b213411f4p-1, -0x1.d2016e8e9db59p-2, 0x1.c7e8e52233cf4p-1, -0x1.d79775b86e38bp-2, 0x1.c678b3488739bp-1, -0x1.dd28f1481cc55p-2, 0x1.c5042012b6908p-1, -0x1.e2b5d3806f63cp-2, 0x1.c38b2f180bdb1p-1, 
-0x1.e83e0eaf85111p-2, 0x1.c20de3fa971bp-1, -0x1.edc1952ef78d5p-2, 0x1.c08c426725549p-1, -0x1.f3405963fd063p-2, 0x1.bf064e15377dep-1, -0x1.f8ba4dbf89ab8p-2, 0x1.bd7c0ac6f952ap-1, -0x1.fe2f64be7120ap-2, 0x1.bbed7c49380ecp-1, -0x1.01cfc874c3eb6p-1, 0x1.ba5aa673590d3p-1, -0x1.0485626ae221bp-1, 0x1.b8c38d27504e8p-1, -0x1.073879922ffecp-1, 0x1.b728345196e3ep-1, 
-0x1.09e907417c5e1p-1, 0x1.b5889fe921405p-1, -0x1.0c9704d5d898dp-1, 0x1.b3e4d3ef55712p-1, -0x1.0f426bb2a8e7dp-1, 0x1.b23cd470013b4p-1, -0x1.11eb3541b4b2p-1, 0x1.b090a58150201p-1, -0x1.14915af336cebp-1, 0x1.aee04b43c1474p-1, -0x1.1734d63dedb46p-1, 0x1.ad2bc9e21d512p-1, -0x1.19d5a09f2b9b7p-1, 0x1.ab7325916c0d5p-1, -0x1.1c73b39ae68c6p-1, 0x1.a9b66290ea1a5p-1, 
-0x1.1f0f08bbc861ap-1, 0x1.a7f58529fe69ep-1, -0x1.21a799933eb59p-1, 0x1.a63091b02fae2p-1, -0x1.243d5fb98ac1ep-1, 0x1.a4678c8119ac9p-1, -0x1.26d054cdd12dfp-1, 0x1.a29a7a0462782p-1, -0x1.2960727629ca6p-1, 0x1.a0c95eabaf938p-1, -0x1.2bedb25faf3eap-1, 0x1.9ef43ef29af94p-1, -0x1.2e780e3e8ea15p-1, 0x1.9d1b1f5ea80d7p-1, -0x1.30ff7fce17034p-1, 0x1.9b3e047f38741p-1, 
-0x1.338400d0c8e54p-1, 0x1.995cf2ed80d24p-1, -0x1.36058b10659f2p-1, 0x1.9777ef4c7d742p-1, -0x1.3884185dfeb22p-1, 0x1.958efe48e6dd6p-1, -0x1.3affa292050b8p-1, 0x1.93a22499263fcp-1, -0x1.3d78238c58344p-1, 0x1.91b166fd49da2p-1, -0x1.3fed9534556d3p-1, 0x1.8fbcca3ef940ep-1, -0x1.425ff178e6bb1p-1, 0x1.8dc45331698ccp-1, -0x1.44cf325091dd4p-1, 0x1.8bc806b151742p-1, 
-0x1.473b51b987347p-1, 0x1.89c7e9a4dd4abp-1, -0x1.49a449b9b0937p-1, 0x1.87c400fba2ecp-1, -0x1.4c0a145ec0004p-1, 0x1.85bc51ae958cdp-1, -0x1.4e6cabbe3e5e7p-1, 0x1.83b0e0bff977p-1, -0x1.50cc09f59a09ap-1, 0x1.81a1b33b57accp-1, -0x1.5328292a35596p-1, 0x1.7f8ece357177p-1, -0x1.5581038975136p-1, 0x1.7d7836cc33db3p-1, -0x1.57d69348cecap-1, 0x1.7b5df226aafaep-1, 
-0x1.5a28d2a5d724fp-1, 0x1.79400574f55e6p-1, -0x1.5c77bbe65018cp-1, 0x1.771e75f037261p-1, -0x1.5ec3495837073p-1, 0x1.74f948da8d28ep-1, -0x1.610b7551d2cdep-1, 0x1.72d0837efff97p-1, -0x1.63503a31c1be7p-1, 0x1.70a42b3176d7cp-1, -0x1.6591925f0783dp-1, 0x1.6e74454eaa8afp-1, -0x1.67cf78491af0ep-1, 0x1.6c40d73c18278p-1, -0x1.6a09e667f3bccp-1, 0x1.6a09e667f3bcdp-1, 
-0x1.6c40d73c18276p-1, 0x1.67cf78491af0fp-1, -0x1.6e74454eaa8aep-1, 0x1.6591925f0783ep-1, -0x1.70a42b3176d7ap-1, 0x1.63503a31c1be8p-1, -0x1.72d0837efff96p-1, 0x1.610b7551d2cep-1, -0x1.74f948da8d28dp-1, 0x1.5ec3495837074p-1, -0x1.771e75f03726p-1, 0x1.5c77bbe65018ep-1, -0x1.79400574f55e4p-1, 0x1.5a28d2a5d725p-1, -0x1.7b5df226aafadp-1, 0x1.57d69348ceca1p-1, 
-0x1.7d7836cc33db2p-1, 0x1.5581038975138p-1, -0x1.7f8ece357176ep-1, 0x1.5328292a35598p-1, -0x1.81a1b33b57acbp-1, 0x1.50cc09f59a09cp-1, -0x1.83b0e0bff976fp-1, 0x1.4e6cabbe3e5e8p-1, -0x1.85bc51ae958ccp-1, 0x1.4c0a145ec0005p-1, -0x1.87c400fba2ebfp-1, 0x1.49a449b9b0938p-1, -0x1.89c7e9a4dd4aap-1, 0x1.473b51b987348p-1, -0x1.8bc806b151741p-1, 0x1.44cf325091dd6p-1, 
-0x1.8dc45331698cbp-1, 0x1.425ff178e6bb3p-1, -0x1.8fbcca3ef940dp-1, 0x1.3fed9534556d4p-1, -0x1.91b166fd49da1p-1, 0x1.3d78238c58346p-1, -0x1.93a22499263fbp-1, 0x1.3affa292050bap-1, -0x1.958efe48e6dd5p-1, 0x1.3884185dfeb24p-1, -0x1.9777ef4c7d741p-1, 0x1.36058b10659f3p-1, -0x1.995cf2ed80d22p-1, 0x1.338400d0c8e56p-1, -0x1.9b3e047f3874p-1, 0x1.30ff7fce17036p-1, 
-0x1.9d1b1f5ea80d6p-1, 0x1.2e780e3e8ea16p-1, -0x1.9ef43ef29af93p-1, 0x1.2bedb25faf3ebp-1, -0x1.a0c95eabaf937p-1, 0x1.2960727629ca8p-1, -0x1.a29a7a0462781p-1, 0x1.26d054cdd12ep-1, -0x1.a4678c8119ac8p-1, 0x1.243d5fb98ac1fp-1, -0x1.a63091b02faep-1, 0x1.21a799933eb5bp-1, -0x1.a7f58529fe69cp-1, 0x1.1f0f08bbc861bp-1, -0x1.a9b66290ea1a4p-1, 0x1.1c73b39ae68c8p-1, 
-0x1.ab7325916c0d4p-1, 0x1.19d5a09f2b9b9p-1, -0x1.ad2bc9e21d511p-1, 0x1.1734d63dedb48p-1, -0x1.aee04b43c1473p-1, 0x1.14915af336cecp-1, -0x1.b090a581502p-1, 0x1.11eb3541b4b22p-1, -0x1.b23cd470013b3p-1, 0x1.0f426bb2a8e7fp-1, -0x1.b3e4d3ef55712p-1, 0x1.0c9704d5d898fp-1, -0x1.b5889fe921404p-1, 0x1.09e907417c5e2p-1, -0x1.b728345196e3ep-1, 0x1.073879922ffeep-1, 
-0x1.b8c38d27504e8p-1, 0x1.0485626ae221dp-1, -0x1.ba5aa673590d2p-1, 0x1.01cfc874c3eb7p-1, -0x1.bbed7c49380eap-1, 0x1.fe2f64be7120ep-2, -0x1.bd7c0ac6f9529p-1, 0x1.f8ba4dbf89abcp-2, -0x1.bf064e15377dep-1, 0x1.f3405963fd066p-2, -0x1.c08c426725548p-1, 0x1.edc1952ef78d8p-2, -0x1.c20de3fa971bp-1, 0x1.e83e0eaf85113p-2, -0x1.c38b2f180bdbp-1, 0x1.e2b5d3806f63ep-2, 
-0x1.c5042012b6907p-1, 0x1.dd28f1481cc58p-2, -0x1.c678b3488739ap-1, 0x1.d79775b86e38dp-2, -0x1.c7e8e52233cf3p-1, 0x1.d2016e8e9db5cp-2, -0x1.c954b213411f4p-1, 0x1.cc66e9931c463p-2, -0x1.cabc169a0b9p-1, 0x1.c6c7f4997000cp-2, -0x1.cc1f0f3fcfc5dp-1, 0x1.c1249d8011ee5p-2, -0x1.cd7d9898b32f5p-1, 0x1.bb7cf2304bd03p-2, -0x1.ced7af43cc773p-1, 0x1.b5d1009e15cbfp-2, 
-0x1.d02d4feb2bd92p-1, 0x1.b020d6c7f400cp-2, -0x1.d17e7743e35dcp-1, 0x1.aa6c82b6d3fc9p-2, -0x1.d2cb220e0ef9ep-1, 0x1.a4b4127dea1e8p-2, -0x1.d4134d14dc93ap-1, 0x1.9ef7943a8ed8ap-2, -0x1.d556f52e93ebp-1, 0x1.993716141be03p-2, -0x1.d696173c9e68bp-1, 0x1.9372a63bc93d8p-2, -0x1.d7d0b02b8ecf8p-1, 0x1.8daa52ec8a4b5p-2, -0x1.d906bcf328d46p-1, 0x1.87de2a6aea964p-2, 
-0x1.da383a9668988p-1, 0x1.820e3b04eaac2p-2, -0x1.db6526238a09ap-1, 0x1.7c3a9311dcce9p-2, -0x1.dc8d7cb41026p-1, 0x1.766340f2418f5p-2, -0x1.ddb13b6ccc23cp-1, 0x1.7088530fa45a2p-2, -0x1.ded05f7de47dap-1, 0x1.6aa9d7dc77e16p-2, -0x1.dfeae622dbe2ap-1, 0x1.64c7ddd3f27cap-2, -0x1.e100cca2980acp-1, 0x1.5ee27379ea694p-2, -0x1.e212104f686e4p-1, 0x1.58f9a75ab1fe1p-2, 
-0x1.e31eae870ce25p-1, 0x1.530d880af3c25p-2, -0x1.e426a4b2bc17ep-1, 0x1.4d1e24278e76fp-2, -0x1.e529f04729ffcp-1, 0x1.472b8a5571056p-2, -0x1.e6288ec48e112p-1, 0x1.4135c941766p-2, -0x1.e7227db6a9744p-1, 0x1.3b3cefa0414bap-2, -0x1.e817bab4cd10dp-1, 0x1.35410c2e18151p-2, -0x1.e9084361df7f2p-1, 0x1.2f422daec038ap-2, -0x1.e9f4156c62ddap-1, 0x1.294062ed59f05p-2, 
-0x1.eadb2e8e7a88dp-1, 0x1.233bbabc3bb75p-2, -0x1.ebbd8c8df0b74p-1, 0x1.1d3443f4cdb3ep-2, -0x1.ec9b2d3c3bf84p-1, 0x1.172a0d776517cp-2, -0x1.ed740e7684963p-1, 0x1.111d262b1f679p-2, -0x1.ee482e25a9dbbp-1, 0x1.0b0d9cfdbdb96p-2, -0x1.ef178a3e473c2p-1, 0x1.04fb80e37fdbp-2, -0x1.efe220c0b95edp-1, 0x1.fdcdc1adfedf6p-3, -0x1.f0a7efb9230d7p-1, 0x1.f19f97b215f2p-3, 
-0x1.f168f53f7205dp-1, 0x1.e56ca1e101a1ap-3, -0x1.f2252f7763ad9p-1, 0x1.d934fe5454318p-3, -0x1.f2dc9c9089a9dp-1, 0x1.ccf8cb312b286p-3, -0x1.f38f3ac64e588p-1, 0x1.c0b826a7e4f6bp-3, -0x1.f43d085ff92ddp-1, 0x1.b4732ef3d6724p-3, -0x1.f4e603b0b2f2cp-1, 0x1.a82a025b0045bp-3, -0x1.f58a2b1789e84p-1, 0x1.9bdcbf2dc4369p-3, -0x1.f6297cff75cbp-1, 0x1.8f8b83c69a616p-3, 
-0x1.f6c3f7df5bbb7p-1, 0x1.83366e89c64cap-3, -0x1.f7599a3a12078p-1, 0x1.76dd9de50bf2fp-3, -0x1.f7ea629e63d6ep-1, 0x1.6a81304f64ab8p-3, -0x1.f8764fa714ba9p-1, 0x1.5e214448b3fc5p-3, -0x1.f8fd5ffae41dap-1, 0x1.51bdf8597c5f9p-3, -0x1.f97f924c9099bp-1, 0x1.45576b1293e5ap-3, -0x1.f9fce55adb2c8p-1, 0x1.38edbb0cd8d1dp-3, -0x1.fa7557f08a517p-1, 0x1.2c8106e8e613cp-3, 
-0x1.fae8e8e46cfbap-1, 0x1.20116d4ec7bd9p-3, -0x1.fb5797195d741p-1, 0x1.139f0cedaf57ap-3, -0x1.fbc1617e44186p-1, 0x1.072a047ba8319p-3, -0x1.fc26470e19fd3p-1, 0x1.f564e56a97319p-4, -0x1.fc8646cfeb721p-1, 0x1.dc70ecbae9fc5p-4, -0x1.fce15fd6da67bp-1, 0x1.c3785c79ec2e3p-4, -0x1.fd37914220b84p-1, 0x1.aa7b724495c03p-4, -0x1.fd88da3d12525p-1, 0x1.917a6bc29b43dp-4, 
-0x1.fdd539ff1f456p-1, 0x1.787586a5d5b24p-4, -0x1.fe1cafcbd5b09p-1, 0x1.5f6d00a9aa42cp-4, -0x1.fe5f3af2e394p-1, 0x1.466117927209bp-4, -0x1.fe9cdad01883ap-1, 0x1.2d52092ce1a0dp-4, -0x1.fed58ecb673c4p-1, 0x1.1440134d709bbp-4, -0x1.ff095658e71adp-1, 0x1.f656e79f820d4p-5, -0x1.ff3830f8d575cp-1, 0x1.c428d12c0d7f9p-5, -0x1.ff621e3796d7ep-1, 0x1.91f65f10dd80ep-5, 
-0x1.ff871dadb81dfp-1, 0x1.5fc00d290cd6p-5, -0x1.ffa72effef75dp-1, 0x1.2d865759455cdp-5, -0x1.ffc251df1d3f8p-1, 0x1.f693731d1cf46p-6, -0x1.ffd886084cd0dp-1, 0x1.92155f7a36689p-6, -0x1.ffe9cb44b51a1p-1, 0x1.2d936bbe30f4ep-6, -0x1.fff62169b92dbp-1, 0x1.921d1fcdec7b3p-7, -0x1.fffd8858e8a92p-1, 0x1.921f0fe6701e6p-8    
};



int bitReversalMap1024[1024] = {
    0, 512, 256, 768, 128, 640, 384, 896, 64, 576, 320, 832, 192, 704, 448, 960,
    32, 544, 288, 800, 160, 672, 416, 928, 96, 608, 352, 864, 224, 736, 480, 992,
    16, 528, 272, 784, 144, 656, 400, 912, 80, 592, 336, 848, 208, 720, 464, 976,
    48, 560, 304, 816, 176, 688, 432, 944, 112, 624, 368, 880, 240, 752, 496, 1008,
    8, 520, 264, 776, 136, 648, 392, 904, 72, 584, 328, 840, 200, 712, 456, 968,
    40, 552, 296, 808, 168, 680, 424, 936, 104, 616, 360, 872, 232, 744, 488, 1000,
    24, 536, 280, 792, 152, 664, 408, 920, 88, 600, 344, 856, 216, 728, 472, 984,
    56, 568, 312, 824, 184, 696, 440, 952, 120, 632, 376, 888, 248, 760, 504, 1016,
    4, 516, 260, 772, 132, 644, 388, 900, 68, 580, 324, 836, 196, 708, 452, 964,
    36, 548, 292, 804, 164, 676, 420, 932, 100, 612, 356, 868, 228, 740, 484, 996,
    20, 532, 276, 788, 148, 660, 404, 916, 84, 596, 340, 852, 212, 724, 468, 980,
    52, 564, 308, 820, 180, 692, 436, 948, 116, 628, 372, 884, 244, 756, 500, 1012,
    12, 524, 268, 780, 140, 652, 396, 908, 76, 588, 332, 844, 204, 716, 460, 972,
    44, 556, 300, 812, 172, 684, 428, 940, 108, 620, 364, 876, 236, 748, 492, 1004,
    28, 540, 284, 796, 156, 668, 412, 924, 92, 604, 348, 860, 220, 732, 476, 988,
    60, 572, 316, 828, 188, 700, 444, 956, 124, 636, 380, 892, 252, 764, 508, 1020,
    2, 514, 258, 770, 130, 642, 386, 898, 66, 578, 322, 834, 194, 706, 450, 962,
    34, 546, 290, 802, 162, 674, 418, 930, 98, 610, 354, 866, 226, 738, 482, 994,
    18, 530, 274, 786, 146, 658, 402, 914, 82, 594, 338, 850, 210, 722, 466, 978,
    50, 562, 306, 818, 178, 690, 434, 946, 114, 626, 370, 882, 242, 754, 498, 1010,
    10, 522, 266, 778, 138, 650, 394, 906, 74, 586, 330, 842, 202, 714, 458, 970,
    42, 554, 298, 810, 170, 682, 426, 938, 106, 618, 362, 874, 234, 746, 490, 1002,
    26, 538, 282, 794, 154, 666, 410, 922, 90, 602, 346, 858, 218, 730, 474, 986,
    58, 570, 314, 826, 186, 698, 442, 954, 122, 634, 378, 890, 250, 762, 506, 1018,
    6, 518, 262, 774, 134, 646, 390, 902, 70, 582, 326, 838, 198, 710, 454, 966,
    38, 550, 294, 806, 166, 678, 422, 934, 102, 614, 358, 870, 230, 742, 486, 998,
    22, 534, 278, 790, 150, 662, 406, 918, 86, 598, 342, 854, 214, 726, 470, 982,
    54, 566, 310, 822, 182, 694, 438, 950, 118, 630, 374, 886, 246, 758, 502, 1014,
    14, 526, 270, 782, 142, 654, 398, 910, 78, 590, 334, 846, 206, 718, 462, 974,
    46, 558, 302, 814, 174, 686, 430, 942, 110, 622, 366, 878, 238, 750, 494, 1006,
    30, 542, 286, 798, 158, 670, 414, 926, 94, 606, 350, 862, 222, 734, 478, 990,
    62, 574, 318, 830, 190, 702, 446, 958, 126, 638, 382, 894, 254, 766, 510, 1022,
    1, 513, 257, 769, 129, 641, 385, 897, 65, 577, 321, 833, 193, 705, 449, 961,
    33, 545, 289, 801, 161, 673, 417, 929, 97, 609, 353, 865, 225, 737, 481, 993,
    17, 529, 273, 785, 145, 657, 401, 913, 81, 593, 337, 849, 209, 721, 465, 977,
    49, 561, 305, 817, 177, 689, 433, 945, 113, 625, 369, 881, 241, 753, 497, 1009,
    9, 521, 265, 777, 137, 649, 393, 905, 73, 585, 329, 841, 201, 713, 457, 969,
    41, 553, 297, 809, 169, 681, 425, 937, 105, 617, 361, 873, 233, 745, 489, 1001,
    25, 537, 281, 793, 153, 665, 409, 921, 89, 601, 345, 857, 217, 729, 473, 985,
    57, 569, 313, 825, 185, 697, 441, 953, 121, 633, 377, 889, 249, 761, 505, 1017,
    5, 517, 261, 773, 133, 645, 389, 901, 69, 581, 325, 837, 197, 709, 453, 965,
    37, 549, 293, 805, 165, 677, 421, 933, 101, 613, 357, 869, 229, 741, 485, 997,
    21, 533, 277, 789, 149, 661, 405, 917, 85, 597, 341, 853, 213, 725, 469, 981,
    53, 565, 309, 821, 181, 693, 437, 949, 117, 629, 373, 885, 245, 757, 501, 1013,
    13, 525, 269, 781, 141, 653, 397, 909, 77, 589, 333, 845, 205, 717, 461, 973,
    45, 557, 301, 813, 173, 685, 429, 941, 109, 621, 365, 877, 237, 749, 493, 1005,
    29, 541, 285, 797, 157, 669, 413, 925, 93, 605, 349, 861, 221, 733, 477, 989,
    61, 573, 317, 829, 189, 701, 445, 957, 125, 637, 381, 893, 253, 765, 509, 1021,
    3, 515, 259, 771, 131, 643, 387, 899, 67, 579, 323, 835, 195, 707, 451, 963,
    35, 547, 291, 803, 163, 675, 419, 931, 99, 611, 355, 867, 227, 739, 483, 995,
    19, 531, 275, 787, 147, 659, 403, 915, 83, 595, 339, 851, 211, 723, 467, 979,
    51, 563, 307, 819, 179, 691, 435, 947, 115, 627, 371, 883, 243, 755, 499, 1011,
    11, 523, 267, 779, 139, 651, 395, 907, 75, 587, 331, 843, 203, 715, 459, 971,
    43, 555, 299, 811, 171, 683, 427, 939, 107, 619, 363, 875, 235, 747, 491, 1003,
    27, 539, 283, 795, 155, 667, 411, 923, 91, 603, 347, 859, 219, 731, 475, 987,
    59, 571, 315, 827, 187, 699, 443, 955, 123, 635, 379, 891, 251, 763, 507, 1019,
    7, 519, 263, 775, 135, 647, 391, 903, 71, 583, 327, 839, 199, 711, 455, 967,
    39, 551, 295, 807, 167, 679, 423, 935, 103, 615, 359, 871, 231, 743, 487, 999,
    23, 535, 279, 791, 151, 663, 407, 919, 87, 599, 343, 855, 215, 727, 471, 983,
    55, 567, 311, 823, 183, 695, 439, 951, 119, 631, 375, 887, 247, 759, 503, 1015,
    15, 527, 271, 783, 143, 655, 399, 911, 79, 591, 335, 847, 207, 719, 463, 975,
    47, 559, 303, 815, 175, 687, 431, 943, 111, 623, 367, 879, 239, 751, 495, 1007,
    31, 543, 287, 799, 159, 671, 415, 927, 95, 607, 351, 863, 223, 735, 479, 991,
    63, 575, 319, 831, 191, 703, 447, 959, 127, 639, 383, 895, 255, 767, 511, 1023
};

/*
// Variable assignments
float t1Re_1b = 0x1.6a09e6p-1f;

float t1Re_2b = 0x1.d906bcp-1f;
float t1Re_2c = 0x1.6a09e6p-1f;
float t1Re_2d = 0x1.87de2ap-2f;

float t1Re_1b2b = 0x1.4e7ae8p-1f; // t1Re_1b * t1Re_2b;
float t1Re_1b2d = 0x1.1517a8p-2f; //t1Re_1b * t1Re_2d;

float t2Re_1b = 0x1.f6297cp-1f;
float t2Re_1c = 0x1.d906bcp-1f;
float t2Re_1d = 0x1.a9b662p-1f;
float t2Re_1e = 0x1.6a09e6p-1f;
float t2Re_1f = 0x1.1c73b4p-1f;
float t2Re_1g = 0x1.87de2ap-2f;
float t2Re_1h = 0x1.8f8b88p-3f;

float t2Re_2b = 0x1.fd88dap-1f;
float t2Re_2c = 0x1.f6297cp-1f;
float t2Re_2d = 0x1.e9f416p-1f;
float t2Re_2e = 0x1.d906bcp-1f;
float t2Re_2f = 0x1.c38b3p-1f;
float t2Re_2g = 0x1.a9b662p-1f;
float t2Re_2h = 0x1.8bc808p-1f;
float t2Re_2i = 0x1.6a09e6p-1f;
float t2Re_2j = 0x1.44cf32p-1f;
float t2Re_2k = 0x1.1c73b4p-1f;
float t2Re_2l = 0x1.e2b5d6p-2f;
float t2Re_2m = 0x1.87de2ap-2f;
float t2Re_2n = 0x1.29406p-2f;
float t2Re_2o = 0x1.8f8b88p-3f;
float t2Re_2p = 0x1.917a6ap-4f;

float tRe0 =  0x1p+0f;
float tIm0 =  0x0p+0f;
float tRe1 =  0x1.ff621ep-1f;
float tIm1 = 0x1.91f66p-5f;
float tRe2 = 0x1.fd88dap-1f;
float tIm2 = 0x1.917a6cp-4f;
float tRe3 = 0x1.fa7558p-1f;
float tIm3 = 0x1.2c8106p-3f;
float tRe4 = 0x1.f6297cp-1f;
float tIm4 = 0x1.8f8b84p-3f;
float tRe5 = 0x1.f0a7fp-1f;
float tIm5 = 0x1.f19f98p-3f;
float tRe6 = 0x1.e9f416p-1f;
float tIm6 = 0x1.294062p-2f;
float tRe7 = 0x1.e2121p-1f;
float tIm7 = 0x1.58f9a6p-2f;
float tRe8 = 0x1.d906bcp-1f;
float tIm8 = 0x1.87de2cp-2f;
float tRe9 = 0x1.ced7bp-1f;
float tIm9 = 0x1.b5d1p-2f;
float tRe10 = 0x1.c38b3p-1f;
float tIm10 = 0x1.e2b5d2p-2f;
float tRe11 = 0x1.b72834p-1f;
float tIm11 = 0x1.07387ap-1f;
float tRe12 = 0x1.a9b662p-1f;
float tIm12 = 0x1.1c73b4p-1f;
float tRe13 = 0x1.9b3e04p-1f;
float tIm13 = 0x1.30ff8p-1f;
float tRe14 = 0x1.8bc808p-1f;
float tIm14 = 0x1.44cf32p-1f;
float tRe15 = 0x1.7b5df2p-1f;
float tIm15 = 0x1.57d694p-1f;
float tRe16 = 0x1.6a09e6p-1f;
float tIm16 = 0x1.6a09e6p-1f;
float tRe17 = 0x1.57d694p-1f;
float tIm17 = 0x1.7b5df2p-1f;
float tRe18 = 0x1.44cf32p-1f;
float tIm18 = 0x1.8bc806p-1f;
float tRe19 = 0x1.30ff8p-1f;
float tIm19 = 0x1.9b3e04p-1f;
float tRe20 = 0x1.1c73b4p-1f;
float tIm20 = 0x1.a9b662p-1f;
float tRe21 = 0x1.07387cp-1f;
float tIm21 = 0x1.b72834p-1f;
float tRe22 = 0x1.e2b5d6p-2f;
float tIm22 = 0x1.c38b2ep-1f;
float tRe23 = 0x1.b5d102p-2f;
float tIm23 = 0x1.ced7bp-1f;
float tRe24 = 0x1.87de2ap-2f;
float tIm24 = 0x1.d906bcp-1f;
float tRe25 = 0x1.58f9a6p-2f;
float tIm25 = 0x1.e2121p-1f;
float tRe26 = 0x1.29406p-2f;
float tIm26 = 0x1.e9f416p-1f;
float tRe27 = 0x1.f19fap-3f;
float tIm27 = 0x1.f0a7fp-1f;
float tRe28 = 0x1.8f8b88p-3f;
float tIm28 = 0x1.f6297cp-1f;
float tRe29 = 0x1.2c810ap-3f;
float tIm29 = 0x1.fa7558p-1f;
float tRe30 = 0x1.917a6ap-4f;
float tIm30 = 0x1.fd88dap-1f;
float tRe31 = 0x1.91f652p-5f;
float tIm31 = 0x1.ff621ep-1f;
*/


// Define global arrays
//double inputBR1024[1024];
//double paddedInput[1024];
// Define the out1024 array outside of the function
//double out1024[2048];

double inputBR1024[1024] __attribute__((aligned(32)));
double paddingInput[1024] __attribute__((aligned(32)));
double out1024[2048] __attribute__((aligned(32)));
double *paddedInput;  // Declare as a pointer


// Export out1024 array
EMSCRIPTEN_KEEPALIVE
double* getOut1024Ptr() {
    return out1024;
}

// Modified function to accept pointer to output array
void fftReal1024(double* realInput, int size) {
    // Padding the input if necessary
    if (size != 1024) {
        for (int i = 0; i < 1024; i++) {
            paddingInput[i] = (i < size) ? realInput[i] : 0;
        }
        paddedInput = paddingInput;
    } else {
        // Use the original input array directly
        paddedInput = realInput;
    }


inputBR1024[0]=paddedInput[0];
inputBR1024[1]=paddedInput[512];
inputBR1024[2]=paddedInput[256];
inputBR1024[3]=paddedInput[768];
inputBR1024[4]=paddedInput[128];
inputBR1024[5]=paddedInput[640];
inputBR1024[6]=paddedInput[384];
inputBR1024[7]=paddedInput[896];
inputBR1024[8]=paddedInput[64];
inputBR1024[9]=paddedInput[576];
inputBR1024[10]=paddedInput[320];
inputBR1024[11]=paddedInput[832];
inputBR1024[12]=paddedInput[192];
inputBR1024[13]=paddedInput[704];
inputBR1024[14]=paddedInput[448];
inputBR1024[15]=paddedInput[960];
inputBR1024[16]=paddedInput[32];
inputBR1024[17]=paddedInput[544];
inputBR1024[18]=paddedInput[288];
inputBR1024[19]=paddedInput[800];
inputBR1024[20]=paddedInput[160];
inputBR1024[21]=paddedInput[672];
inputBR1024[22]=paddedInput[416];
inputBR1024[23]=paddedInput[928];
inputBR1024[24]=paddedInput[96];
inputBR1024[25]=paddedInput[608];
inputBR1024[26]=paddedInput[352];
inputBR1024[27]=paddedInput[864];
inputBR1024[28]=paddedInput[224];
inputBR1024[29]=paddedInput[736];
inputBR1024[30]=paddedInput[480];
inputBR1024[31]=paddedInput[992];
inputBR1024[32]=paddedInput[16];
inputBR1024[33]=paddedInput[528];
inputBR1024[34]=paddedInput[272];
inputBR1024[35]=paddedInput[784];
inputBR1024[36]=paddedInput[144];
inputBR1024[37]=paddedInput[656];
inputBR1024[38]=paddedInput[400];
inputBR1024[39]=paddedInput[912];
inputBR1024[40]=paddedInput[80];
inputBR1024[41]=paddedInput[592];
inputBR1024[42]=paddedInput[336];
inputBR1024[43]=paddedInput[848];
inputBR1024[44]=paddedInput[208];
inputBR1024[45]=paddedInput[720];
inputBR1024[46]=paddedInput[464];
inputBR1024[47]=paddedInput[976];
inputBR1024[48]=paddedInput[48];
inputBR1024[49]=paddedInput[560];
inputBR1024[50]=paddedInput[304];
inputBR1024[51]=paddedInput[816];
inputBR1024[52]=paddedInput[176];
inputBR1024[53]=paddedInput[688];
inputBR1024[54]=paddedInput[432];
inputBR1024[55]=paddedInput[944];
inputBR1024[56]=paddedInput[112];
inputBR1024[57]=paddedInput[624];
inputBR1024[58]=paddedInput[368];
inputBR1024[59]=paddedInput[880];
inputBR1024[60]=paddedInput[240];
inputBR1024[61]=paddedInput[752];
inputBR1024[62]=paddedInput[496];
inputBR1024[63]=paddedInput[1008];
inputBR1024[64]=paddedInput[8];
inputBR1024[65]=paddedInput[520];
inputBR1024[66]=paddedInput[264];
inputBR1024[67]=paddedInput[776];
inputBR1024[68]=paddedInput[136];
inputBR1024[69]=paddedInput[648];
inputBR1024[70]=paddedInput[392];
inputBR1024[71]=paddedInput[904];
inputBR1024[72]=paddedInput[72];
inputBR1024[73]=paddedInput[584];
inputBR1024[74]=paddedInput[328];
inputBR1024[75]=paddedInput[840];
inputBR1024[76]=paddedInput[200];
inputBR1024[77]=paddedInput[712];
inputBR1024[78]=paddedInput[456];
inputBR1024[79]=paddedInput[968];
inputBR1024[80]=paddedInput[40];
inputBR1024[81]=paddedInput[552];
inputBR1024[82]=paddedInput[296];
inputBR1024[83]=paddedInput[808];
inputBR1024[84]=paddedInput[168];
inputBR1024[85]=paddedInput[680];
inputBR1024[86]=paddedInput[424];
inputBR1024[87]=paddedInput[936];
inputBR1024[88]=paddedInput[104];
inputBR1024[89]=paddedInput[616];
inputBR1024[90]=paddedInput[360];
inputBR1024[91]=paddedInput[872];
inputBR1024[92]=paddedInput[232];
inputBR1024[93]=paddedInput[744];
inputBR1024[94]=paddedInput[488];
inputBR1024[95]=paddedInput[1000];
inputBR1024[96]=paddedInput[24];
inputBR1024[97]=paddedInput[536];
inputBR1024[98]=paddedInput[280];
inputBR1024[99]=paddedInput[792];
inputBR1024[100]=paddedInput[152];
inputBR1024[101]=paddedInput[664];
inputBR1024[102]=paddedInput[408];
inputBR1024[103]=paddedInput[920];
inputBR1024[104]=paddedInput[88];
inputBR1024[105]=paddedInput[600];
inputBR1024[106]=paddedInput[344];
inputBR1024[107]=paddedInput[856];
inputBR1024[108]=paddedInput[216];
inputBR1024[109]=paddedInput[728];
inputBR1024[110]=paddedInput[472];
inputBR1024[111]=paddedInput[984];
inputBR1024[112]=paddedInput[56];
inputBR1024[113]=paddedInput[568];
inputBR1024[114]=paddedInput[312];
inputBR1024[115]=paddedInput[824];
inputBR1024[116]=paddedInput[184];
inputBR1024[117]=paddedInput[696];
inputBR1024[118]=paddedInput[440];
inputBR1024[119]=paddedInput[952];
inputBR1024[120]=paddedInput[120];
inputBR1024[121]=paddedInput[632];
inputBR1024[122]=paddedInput[376];
inputBR1024[123]=paddedInput[888];
inputBR1024[124]=paddedInput[248];
inputBR1024[125]=paddedInput[760];
inputBR1024[126]=paddedInput[504];
inputBR1024[127]=paddedInput[1016];
inputBR1024[128]=paddedInput[4];
inputBR1024[129]=paddedInput[516];
inputBR1024[130]=paddedInput[260];
inputBR1024[131]=paddedInput[772];
inputBR1024[132]=paddedInput[132];
inputBR1024[133]=paddedInput[644];
inputBR1024[134]=paddedInput[388];
inputBR1024[135]=paddedInput[900];
inputBR1024[136]=paddedInput[68];
inputBR1024[137]=paddedInput[580];
inputBR1024[138]=paddedInput[324];
inputBR1024[139]=paddedInput[836];
inputBR1024[140]=paddedInput[196];
inputBR1024[141]=paddedInput[708];
inputBR1024[142]=paddedInput[452];
inputBR1024[143]=paddedInput[964];
inputBR1024[144]=paddedInput[36];
inputBR1024[145]=paddedInput[548];
inputBR1024[146]=paddedInput[292];
inputBR1024[147]=paddedInput[804];
inputBR1024[148]=paddedInput[164];
inputBR1024[149]=paddedInput[676];
inputBR1024[150]=paddedInput[420];
inputBR1024[151]=paddedInput[932];
inputBR1024[152]=paddedInput[100];
inputBR1024[153]=paddedInput[612];
inputBR1024[154]=paddedInput[356];
inputBR1024[155]=paddedInput[868];
inputBR1024[156]=paddedInput[228];
inputBR1024[157]=paddedInput[740];
inputBR1024[158]=paddedInput[484];
inputBR1024[159]=paddedInput[996];
inputBR1024[160]=paddedInput[20];
inputBR1024[161]=paddedInput[532];
inputBR1024[162]=paddedInput[276];
inputBR1024[163]=paddedInput[788];
inputBR1024[164]=paddedInput[148];
inputBR1024[165]=paddedInput[660];
inputBR1024[166]=paddedInput[404];
inputBR1024[167]=paddedInput[916];
inputBR1024[168]=paddedInput[84];
inputBR1024[169]=paddedInput[596];
inputBR1024[170]=paddedInput[340];
inputBR1024[171]=paddedInput[852];
inputBR1024[172]=paddedInput[212];
inputBR1024[173]=paddedInput[724];
inputBR1024[174]=paddedInput[468];
inputBR1024[175]=paddedInput[980];
inputBR1024[176]=paddedInput[52];
inputBR1024[177]=paddedInput[564];
inputBR1024[178]=paddedInput[308];
inputBR1024[179]=paddedInput[820];
inputBR1024[180]=paddedInput[180];
inputBR1024[181]=paddedInput[692];
inputBR1024[182]=paddedInput[436];
inputBR1024[183]=paddedInput[948];
inputBR1024[184]=paddedInput[116];
inputBR1024[185]=paddedInput[628];
inputBR1024[186]=paddedInput[372];
inputBR1024[187]=paddedInput[884];
inputBR1024[188]=paddedInput[244];
inputBR1024[189]=paddedInput[756];
inputBR1024[190]=paddedInput[500];
inputBR1024[191]=paddedInput[1012];
inputBR1024[192]=paddedInput[12];
inputBR1024[193]=paddedInput[524];
inputBR1024[194]=paddedInput[268];
inputBR1024[195]=paddedInput[780];
inputBR1024[196]=paddedInput[140];
inputBR1024[197]=paddedInput[652];
inputBR1024[198]=paddedInput[396];
inputBR1024[199]=paddedInput[908];
inputBR1024[200]=paddedInput[76];
inputBR1024[201]=paddedInput[588];
inputBR1024[202]=paddedInput[332];
inputBR1024[203]=paddedInput[844];
inputBR1024[204]=paddedInput[204];
inputBR1024[205]=paddedInput[716];
inputBR1024[206]=paddedInput[460];
inputBR1024[207]=paddedInput[972];
inputBR1024[208]=paddedInput[44];
inputBR1024[209]=paddedInput[556];
inputBR1024[210]=paddedInput[300];
inputBR1024[211]=paddedInput[812];
inputBR1024[212]=paddedInput[172];
inputBR1024[213]=paddedInput[684];
inputBR1024[214]=paddedInput[428];
inputBR1024[215]=paddedInput[940];
inputBR1024[216]=paddedInput[108];
inputBR1024[217]=paddedInput[620];
inputBR1024[218]=paddedInput[364];
inputBR1024[219]=paddedInput[876];
inputBR1024[220]=paddedInput[236];
inputBR1024[221]=paddedInput[748];
inputBR1024[222]=paddedInput[492];
inputBR1024[223]=paddedInput[1004];
inputBR1024[224]=paddedInput[28];
inputBR1024[225]=paddedInput[540];
inputBR1024[226]=paddedInput[284];
inputBR1024[227]=paddedInput[796];
inputBR1024[228]=paddedInput[156];
inputBR1024[229]=paddedInput[668];
inputBR1024[230]=paddedInput[412];
inputBR1024[231]=paddedInput[924];
inputBR1024[232]=paddedInput[92];
inputBR1024[233]=paddedInput[604];
inputBR1024[234]=paddedInput[348];
inputBR1024[235]=paddedInput[860];
inputBR1024[236]=paddedInput[220];
inputBR1024[237]=paddedInput[732];
inputBR1024[238]=paddedInput[476];
inputBR1024[239]=paddedInput[988];
inputBR1024[240]=paddedInput[60];
inputBR1024[241]=paddedInput[572];
inputBR1024[242]=paddedInput[316];
inputBR1024[243]=paddedInput[828];
inputBR1024[244]=paddedInput[188];
inputBR1024[245]=paddedInput[700];
inputBR1024[246]=paddedInput[444];
inputBR1024[247]=paddedInput[956];
inputBR1024[248]=paddedInput[124];
inputBR1024[249]=paddedInput[636];
inputBR1024[250]=paddedInput[380];
inputBR1024[251]=paddedInput[892];
inputBR1024[252]=paddedInput[252];
inputBR1024[253]=paddedInput[764];
inputBR1024[254]=paddedInput[508];
inputBR1024[255]=paddedInput[1020];
inputBR1024[256]=paddedInput[2];
inputBR1024[257]=paddedInput[514];
inputBR1024[258]=paddedInput[258];
inputBR1024[259]=paddedInput[770];
inputBR1024[260]=paddedInput[130];
inputBR1024[261]=paddedInput[642];
inputBR1024[262]=paddedInput[386];
inputBR1024[263]=paddedInput[898];
inputBR1024[264]=paddedInput[66];
inputBR1024[265]=paddedInput[578];
inputBR1024[266]=paddedInput[322];
inputBR1024[267]=paddedInput[834];
inputBR1024[268]=paddedInput[194];
inputBR1024[269]=paddedInput[706];
inputBR1024[270]=paddedInput[450];
inputBR1024[271]=paddedInput[962];
inputBR1024[272]=paddedInput[34];
inputBR1024[273]=paddedInput[546];
inputBR1024[274]=paddedInput[290];
inputBR1024[275]=paddedInput[802];
inputBR1024[276]=paddedInput[162];
inputBR1024[277]=paddedInput[674];
inputBR1024[278]=paddedInput[418];
inputBR1024[279]=paddedInput[930];
inputBR1024[280]=paddedInput[98];
inputBR1024[281]=paddedInput[610];
inputBR1024[282]=paddedInput[354];
inputBR1024[283]=paddedInput[866];
inputBR1024[284]=paddedInput[226];
inputBR1024[285]=paddedInput[738];
inputBR1024[286]=paddedInput[482];
inputBR1024[287]=paddedInput[994];
inputBR1024[288]=paddedInput[18];
inputBR1024[289]=paddedInput[530];
inputBR1024[290]=paddedInput[274];
inputBR1024[291]=paddedInput[786];
inputBR1024[292]=paddedInput[146];
inputBR1024[293]=paddedInput[658];
inputBR1024[294]=paddedInput[402];
inputBR1024[295]=paddedInput[914];
inputBR1024[296]=paddedInput[82];
inputBR1024[297]=paddedInput[594];
inputBR1024[298]=paddedInput[338];
inputBR1024[299]=paddedInput[850];
inputBR1024[300]=paddedInput[210];
inputBR1024[301]=paddedInput[722];
inputBR1024[302]=paddedInput[466];
inputBR1024[303]=paddedInput[978];
inputBR1024[304]=paddedInput[50];
inputBR1024[305]=paddedInput[562];
inputBR1024[306]=paddedInput[306];
inputBR1024[307]=paddedInput[818];
inputBR1024[308]=paddedInput[178];
inputBR1024[309]=paddedInput[690];
inputBR1024[310]=paddedInput[434];
inputBR1024[311]=paddedInput[946];
inputBR1024[312]=paddedInput[114];
inputBR1024[313]=paddedInput[626];
inputBR1024[314]=paddedInput[370];
inputBR1024[315]=paddedInput[882];
inputBR1024[316]=paddedInput[242];
inputBR1024[317]=paddedInput[754];
inputBR1024[318]=paddedInput[498];
inputBR1024[319]=paddedInput[1010];
inputBR1024[320]=paddedInput[10];
inputBR1024[321]=paddedInput[522];
inputBR1024[322]=paddedInput[266];
inputBR1024[323]=paddedInput[778];
inputBR1024[324]=paddedInput[138];
inputBR1024[325]=paddedInput[650];
inputBR1024[326]=paddedInput[394];
inputBR1024[327]=paddedInput[906];
inputBR1024[328]=paddedInput[74];
inputBR1024[329]=paddedInput[586];
inputBR1024[330]=paddedInput[330];
inputBR1024[331]=paddedInput[842];
inputBR1024[332]=paddedInput[202];
inputBR1024[333]=paddedInput[714];
inputBR1024[334]=paddedInput[458];
inputBR1024[335]=paddedInput[970];
inputBR1024[336]=paddedInput[42];
inputBR1024[337]=paddedInput[554];
inputBR1024[338]=paddedInput[298];
inputBR1024[339]=paddedInput[810];
inputBR1024[340]=paddedInput[170];
inputBR1024[341]=paddedInput[682];
inputBR1024[342]=paddedInput[426];
inputBR1024[343]=paddedInput[938];
inputBR1024[344]=paddedInput[106];
inputBR1024[345]=paddedInput[618];
inputBR1024[346]=paddedInput[362];
inputBR1024[347]=paddedInput[874];
inputBR1024[348]=paddedInput[234];
inputBR1024[349]=paddedInput[746];
inputBR1024[350]=paddedInput[490];
inputBR1024[351]=paddedInput[1002];
inputBR1024[352]=paddedInput[26];
inputBR1024[353]=paddedInput[538];
inputBR1024[354]=paddedInput[282];
inputBR1024[355]=paddedInput[794];
inputBR1024[356]=paddedInput[154];
inputBR1024[357]=paddedInput[666];
inputBR1024[358]=paddedInput[410];
inputBR1024[359]=paddedInput[922];
inputBR1024[360]=paddedInput[90];
inputBR1024[361]=paddedInput[602];
inputBR1024[362]=paddedInput[346];
inputBR1024[363]=paddedInput[858];
inputBR1024[364]=paddedInput[218];
inputBR1024[365]=paddedInput[730];
inputBR1024[366]=paddedInput[474];
inputBR1024[367]=paddedInput[986];
inputBR1024[368]=paddedInput[58];
inputBR1024[369]=paddedInput[570];
inputBR1024[370]=paddedInput[314];
inputBR1024[371]=paddedInput[826];
inputBR1024[372]=paddedInput[186];
inputBR1024[373]=paddedInput[698];
inputBR1024[374]=paddedInput[442];
inputBR1024[375]=paddedInput[954];
inputBR1024[376]=paddedInput[122];
inputBR1024[377]=paddedInput[634];
inputBR1024[378]=paddedInput[378];
inputBR1024[379]=paddedInput[890];
inputBR1024[380]=paddedInput[250];
inputBR1024[381]=paddedInput[762];
inputBR1024[382]=paddedInput[506];
inputBR1024[383]=paddedInput[1018];
inputBR1024[384]=paddedInput[6];
inputBR1024[385]=paddedInput[518];
inputBR1024[386]=paddedInput[262];
inputBR1024[387]=paddedInput[774];
inputBR1024[388]=paddedInput[134];
inputBR1024[389]=paddedInput[646];
inputBR1024[390]=paddedInput[390];
inputBR1024[391]=paddedInput[902];
inputBR1024[392]=paddedInput[70];
inputBR1024[393]=paddedInput[582];
inputBR1024[394]=paddedInput[326];
inputBR1024[395]=paddedInput[838];
inputBR1024[396]=paddedInput[198];
inputBR1024[397]=paddedInput[710];
inputBR1024[398]=paddedInput[454];
inputBR1024[399]=paddedInput[966];
inputBR1024[400]=paddedInput[38];
inputBR1024[401]=paddedInput[550];
inputBR1024[402]=paddedInput[294];
inputBR1024[403]=paddedInput[806];
inputBR1024[404]=paddedInput[166];
inputBR1024[405]=paddedInput[678];
inputBR1024[406]=paddedInput[422];
inputBR1024[407]=paddedInput[934];
inputBR1024[408]=paddedInput[102];
inputBR1024[409]=paddedInput[614];
inputBR1024[410]=paddedInput[358];
inputBR1024[411]=paddedInput[870];
inputBR1024[412]=paddedInput[230];
inputBR1024[413]=paddedInput[742];
inputBR1024[414]=paddedInput[486];
inputBR1024[415]=paddedInput[998];
inputBR1024[416]=paddedInput[22];
inputBR1024[417]=paddedInput[534];
inputBR1024[418]=paddedInput[278];
inputBR1024[419]=paddedInput[790];
inputBR1024[420]=paddedInput[150];
inputBR1024[421]=paddedInput[662];
inputBR1024[422]=paddedInput[406];
inputBR1024[423]=paddedInput[918];
inputBR1024[424]=paddedInput[86];
inputBR1024[425]=paddedInput[598];
inputBR1024[426]=paddedInput[342];
inputBR1024[427]=paddedInput[854];
inputBR1024[428]=paddedInput[214];
inputBR1024[429]=paddedInput[726];
inputBR1024[430]=paddedInput[470];
inputBR1024[431]=paddedInput[982];
inputBR1024[432]=paddedInput[54];
inputBR1024[433]=paddedInput[566];
inputBR1024[434]=paddedInput[310];
inputBR1024[435]=paddedInput[822];
inputBR1024[436]=paddedInput[182];
inputBR1024[437]=paddedInput[694];
inputBR1024[438]=paddedInput[438];
inputBR1024[439]=paddedInput[950];
inputBR1024[440]=paddedInput[118];
inputBR1024[441]=paddedInput[630];
inputBR1024[442]=paddedInput[374];
inputBR1024[443]=paddedInput[886];
inputBR1024[444]=paddedInput[246];
inputBR1024[445]=paddedInput[758];
inputBR1024[446]=paddedInput[502];
inputBR1024[447]=paddedInput[1014];
inputBR1024[448]=paddedInput[14];
inputBR1024[449]=paddedInput[526];
inputBR1024[450]=paddedInput[270];
inputBR1024[451]=paddedInput[782];
inputBR1024[452]=paddedInput[142];
inputBR1024[453]=paddedInput[654];
inputBR1024[454]=paddedInput[398];
inputBR1024[455]=paddedInput[910];
inputBR1024[456]=paddedInput[78];
inputBR1024[457]=paddedInput[590];
inputBR1024[458]=paddedInput[334];
inputBR1024[459]=paddedInput[846];
inputBR1024[460]=paddedInput[206];
inputBR1024[461]=paddedInput[718];
inputBR1024[462]=paddedInput[462];
inputBR1024[463]=paddedInput[974];
inputBR1024[464]=paddedInput[46];
inputBR1024[465]=paddedInput[558];
inputBR1024[466]=paddedInput[302];
inputBR1024[467]=paddedInput[814];
inputBR1024[468]=paddedInput[174];
inputBR1024[469]=paddedInput[686];
inputBR1024[470]=paddedInput[430];
inputBR1024[471]=paddedInput[942];
inputBR1024[472]=paddedInput[110];
inputBR1024[473]=paddedInput[622];
inputBR1024[474]=paddedInput[366];
inputBR1024[475]=paddedInput[878];
inputBR1024[476]=paddedInput[238];
inputBR1024[477]=paddedInput[750];
inputBR1024[478]=paddedInput[494];
inputBR1024[479]=paddedInput[1006];
inputBR1024[480]=paddedInput[30];
inputBR1024[481]=paddedInput[542];
inputBR1024[482]=paddedInput[286];
inputBR1024[483]=paddedInput[798];
inputBR1024[484]=paddedInput[158];
inputBR1024[485]=paddedInput[670];
inputBR1024[486]=paddedInput[414];
inputBR1024[487]=paddedInput[926];
inputBR1024[488]=paddedInput[94];
inputBR1024[489]=paddedInput[606];
inputBR1024[490]=paddedInput[350];
inputBR1024[491]=paddedInput[862];
inputBR1024[492]=paddedInput[222];
inputBR1024[493]=paddedInput[734];
inputBR1024[494]=paddedInput[478];
inputBR1024[495]=paddedInput[990];
inputBR1024[496]=paddedInput[62];
inputBR1024[497]=paddedInput[574];
inputBR1024[498]=paddedInput[318];
inputBR1024[499]=paddedInput[830];
inputBR1024[500]=paddedInput[190];
inputBR1024[501]=paddedInput[702];
inputBR1024[502]=paddedInput[446];
inputBR1024[503]=paddedInput[958];
inputBR1024[504]=paddedInput[126];
inputBR1024[505]=paddedInput[638];
inputBR1024[506]=paddedInput[382];
inputBR1024[507]=paddedInput[894];
inputBR1024[508]=paddedInput[254];
inputBR1024[509]=paddedInput[766];
inputBR1024[510]=paddedInput[510];
inputBR1024[511]=paddedInput[1022];
inputBR1024[512]=paddedInput[1];
inputBR1024[513]=paddedInput[513];
inputBR1024[514]=paddedInput[257];
inputBR1024[515]=paddedInput[769];
inputBR1024[516]=paddedInput[129];
inputBR1024[517]=paddedInput[641];
inputBR1024[518]=paddedInput[385];
inputBR1024[519]=paddedInput[897];
inputBR1024[520]=paddedInput[65];
inputBR1024[521]=paddedInput[577];
inputBR1024[522]=paddedInput[321];
inputBR1024[523]=paddedInput[833];
inputBR1024[524]=paddedInput[193];
inputBR1024[525]=paddedInput[705];
inputBR1024[526]=paddedInput[449];
inputBR1024[527]=paddedInput[961];
inputBR1024[528]=paddedInput[33];
inputBR1024[529]=paddedInput[545];
inputBR1024[530]=paddedInput[289];
inputBR1024[531]=paddedInput[801];
inputBR1024[532]=paddedInput[161];
inputBR1024[533]=paddedInput[673];
inputBR1024[534]=paddedInput[417];
inputBR1024[535]=paddedInput[929];
inputBR1024[536]=paddedInput[97];
inputBR1024[537]=paddedInput[609];
inputBR1024[538]=paddedInput[353];
inputBR1024[539]=paddedInput[865];
inputBR1024[540]=paddedInput[225];
inputBR1024[541]=paddedInput[737];
inputBR1024[542]=paddedInput[481];
inputBR1024[543]=paddedInput[993];
inputBR1024[544]=paddedInput[17];
inputBR1024[545]=paddedInput[529];
inputBR1024[546]=paddedInput[273];
inputBR1024[547]=paddedInput[785];
inputBR1024[548]=paddedInput[145];
inputBR1024[549]=paddedInput[657];
inputBR1024[550]=paddedInput[401];
inputBR1024[551]=paddedInput[913];
inputBR1024[552]=paddedInput[81];
inputBR1024[553]=paddedInput[593];
inputBR1024[554]=paddedInput[337];
inputBR1024[555]=paddedInput[849];
inputBR1024[556]=paddedInput[209];
inputBR1024[557]=paddedInput[721];
inputBR1024[558]=paddedInput[465];
inputBR1024[559]=paddedInput[977];
inputBR1024[560]=paddedInput[49];
inputBR1024[561]=paddedInput[561];
inputBR1024[562]=paddedInput[305];
inputBR1024[563]=paddedInput[817];
inputBR1024[564]=paddedInput[177];
inputBR1024[565]=paddedInput[689];
inputBR1024[566]=paddedInput[433];
inputBR1024[567]=paddedInput[945];
inputBR1024[568]=paddedInput[113];
inputBR1024[569]=paddedInput[625];
inputBR1024[570]=paddedInput[369];
inputBR1024[571]=paddedInput[881];
inputBR1024[572]=paddedInput[241];
inputBR1024[573]=paddedInput[753];
inputBR1024[574]=paddedInput[497];
inputBR1024[575]=paddedInput[1009];
inputBR1024[576]=paddedInput[9];
inputBR1024[577]=paddedInput[521];
inputBR1024[578]=paddedInput[265];
inputBR1024[579]=paddedInput[777];
inputBR1024[580]=paddedInput[137];
inputBR1024[581]=paddedInput[649];
inputBR1024[582]=paddedInput[393];
inputBR1024[583]=paddedInput[905];
inputBR1024[584]=paddedInput[73];
inputBR1024[585]=paddedInput[585];
inputBR1024[586]=paddedInput[329];
inputBR1024[587]=paddedInput[841];
inputBR1024[588]=paddedInput[201];
inputBR1024[589]=paddedInput[713];
inputBR1024[590]=paddedInput[457];
inputBR1024[591]=paddedInput[969];
inputBR1024[592]=paddedInput[41];
inputBR1024[593]=paddedInput[553];
inputBR1024[594]=paddedInput[297];
inputBR1024[595]=paddedInput[809];
inputBR1024[596]=paddedInput[169];
inputBR1024[597]=paddedInput[681];
inputBR1024[598]=paddedInput[425];
inputBR1024[599]=paddedInput[937];
inputBR1024[600]=paddedInput[105];
inputBR1024[601]=paddedInput[617];
inputBR1024[602]=paddedInput[361];
inputBR1024[603]=paddedInput[873];
inputBR1024[604]=paddedInput[233];
inputBR1024[605]=paddedInput[745];
inputBR1024[606]=paddedInput[489];
inputBR1024[607]=paddedInput[1001];
inputBR1024[608]=paddedInput[25];
inputBR1024[609]=paddedInput[537];
inputBR1024[610]=paddedInput[281];
inputBR1024[611]=paddedInput[793];
inputBR1024[612]=paddedInput[153];
inputBR1024[613]=paddedInput[665];
inputBR1024[614]=paddedInput[409];
inputBR1024[615]=paddedInput[921];
inputBR1024[616]=paddedInput[89];
inputBR1024[617]=paddedInput[601];
inputBR1024[618]=paddedInput[345];
inputBR1024[619]=paddedInput[857];
inputBR1024[620]=paddedInput[217];
inputBR1024[621]=paddedInput[729];
inputBR1024[622]=paddedInput[473];
inputBR1024[623]=paddedInput[985];
inputBR1024[624]=paddedInput[57];
inputBR1024[625]=paddedInput[569];
inputBR1024[626]=paddedInput[313];
inputBR1024[627]=paddedInput[825];
inputBR1024[628]=paddedInput[185];
inputBR1024[629]=paddedInput[697];
inputBR1024[630]=paddedInput[441];
inputBR1024[631]=paddedInput[953];
inputBR1024[632]=paddedInput[121];
inputBR1024[633]=paddedInput[633];
inputBR1024[634]=paddedInput[377];
inputBR1024[635]=paddedInput[889];
inputBR1024[636]=paddedInput[249];
inputBR1024[637]=paddedInput[761];
inputBR1024[638]=paddedInput[505];
inputBR1024[639]=paddedInput[1017];
inputBR1024[640]=paddedInput[5];
inputBR1024[641]=paddedInput[517];
inputBR1024[642]=paddedInput[261];
inputBR1024[643]=paddedInput[773];
inputBR1024[644]=paddedInput[133];
inputBR1024[645]=paddedInput[645];
inputBR1024[646]=paddedInput[389];
inputBR1024[647]=paddedInput[901];
inputBR1024[648]=paddedInput[69];
inputBR1024[649]=paddedInput[581];
inputBR1024[650]=paddedInput[325];
inputBR1024[651]=paddedInput[837];
inputBR1024[652]=paddedInput[197];
inputBR1024[653]=paddedInput[709];
inputBR1024[654]=paddedInput[453];
inputBR1024[655]=paddedInput[965];
inputBR1024[656]=paddedInput[37];
inputBR1024[657]=paddedInput[549];
inputBR1024[658]=paddedInput[293];
inputBR1024[659]=paddedInput[805];
inputBR1024[660]=paddedInput[165];
inputBR1024[661]=paddedInput[677];
inputBR1024[662]=paddedInput[421];
inputBR1024[663]=paddedInput[933];
inputBR1024[664]=paddedInput[101];
inputBR1024[665]=paddedInput[613];
inputBR1024[666]=paddedInput[357];
inputBR1024[667]=paddedInput[869];
inputBR1024[668]=paddedInput[229];
inputBR1024[669]=paddedInput[741];
inputBR1024[670]=paddedInput[485];
inputBR1024[671]=paddedInput[997];
inputBR1024[672]=paddedInput[21];
inputBR1024[673]=paddedInput[533];
inputBR1024[674]=paddedInput[277];
inputBR1024[675]=paddedInput[789];
inputBR1024[676]=paddedInput[149];
inputBR1024[677]=paddedInput[661];
inputBR1024[678]=paddedInput[405];
inputBR1024[679]=paddedInput[917];
inputBR1024[680]=paddedInput[85];
inputBR1024[681]=paddedInput[597];
inputBR1024[682]=paddedInput[341];
inputBR1024[683]=paddedInput[853];
inputBR1024[684]=paddedInput[213];
inputBR1024[685]=paddedInput[725];
inputBR1024[686]=paddedInput[469];
inputBR1024[687]=paddedInput[981];
inputBR1024[688]=paddedInput[53];
inputBR1024[689]=paddedInput[565];
inputBR1024[690]=paddedInput[309];
inputBR1024[691]=paddedInput[821];
inputBR1024[692]=paddedInput[181];
inputBR1024[693]=paddedInput[693];
inputBR1024[694]=paddedInput[437];
inputBR1024[695]=paddedInput[949];
inputBR1024[696]=paddedInput[117];
inputBR1024[697]=paddedInput[629];
inputBR1024[698]=paddedInput[373];
inputBR1024[699]=paddedInput[885];
inputBR1024[700]=paddedInput[245];
inputBR1024[701]=paddedInput[757];
inputBR1024[702]=paddedInput[501];
inputBR1024[703]=paddedInput[1013];
inputBR1024[704]=paddedInput[13];
inputBR1024[705]=paddedInput[525];
inputBR1024[706]=paddedInput[269];
inputBR1024[707]=paddedInput[781];
inputBR1024[708]=paddedInput[141];
inputBR1024[709]=paddedInput[653];
inputBR1024[710]=paddedInput[397];
inputBR1024[711]=paddedInput[909];
inputBR1024[712]=paddedInput[77];
inputBR1024[713]=paddedInput[589];
inputBR1024[714]=paddedInput[333];
inputBR1024[715]=paddedInput[845];
inputBR1024[716]=paddedInput[205];
inputBR1024[717]=paddedInput[717];
inputBR1024[718]=paddedInput[461];
inputBR1024[719]=paddedInput[973];
inputBR1024[720]=paddedInput[45];
inputBR1024[721]=paddedInput[557];
inputBR1024[722]=paddedInput[301];
inputBR1024[723]=paddedInput[813];
inputBR1024[724]=paddedInput[173];
inputBR1024[725]=paddedInput[685];
inputBR1024[726]=paddedInput[429];
inputBR1024[727]=paddedInput[941];
inputBR1024[728]=paddedInput[109];
inputBR1024[729]=paddedInput[621];
inputBR1024[730]=paddedInput[365];
inputBR1024[731]=paddedInput[877];
inputBR1024[732]=paddedInput[237];
inputBR1024[733]=paddedInput[749];
inputBR1024[734]=paddedInput[493];
inputBR1024[735]=paddedInput[1005];
inputBR1024[736]=paddedInput[29];
inputBR1024[737]=paddedInput[541];
inputBR1024[738]=paddedInput[285];
inputBR1024[739]=paddedInput[797];
inputBR1024[740]=paddedInput[157];
inputBR1024[741]=paddedInput[669];
inputBR1024[742]=paddedInput[413];
inputBR1024[743]=paddedInput[925];
inputBR1024[744]=paddedInput[93];
inputBR1024[745]=paddedInput[605];
inputBR1024[746]=paddedInput[349];
inputBR1024[747]=paddedInput[861];
inputBR1024[748]=paddedInput[221];
inputBR1024[749]=paddedInput[733];
inputBR1024[750]=paddedInput[477];
inputBR1024[751]=paddedInput[989];
inputBR1024[752]=paddedInput[61];
inputBR1024[753]=paddedInput[573];
inputBR1024[754]=paddedInput[317];
inputBR1024[755]=paddedInput[829];
inputBR1024[756]=paddedInput[189];
inputBR1024[757]=paddedInput[701];
inputBR1024[758]=paddedInput[445];
inputBR1024[759]=paddedInput[957];
inputBR1024[760]=paddedInput[125];
inputBR1024[761]=paddedInput[637];
inputBR1024[762]=paddedInput[381];
inputBR1024[763]=paddedInput[893];
inputBR1024[764]=paddedInput[253];
inputBR1024[765]=paddedInput[765];
inputBR1024[766]=paddedInput[509];
inputBR1024[767]=paddedInput[1021];
inputBR1024[768]=paddedInput[3];
inputBR1024[769]=paddedInput[515];
inputBR1024[770]=paddedInput[259];
inputBR1024[771]=paddedInput[771];
inputBR1024[772]=paddedInput[131];
inputBR1024[773]=paddedInput[643];
inputBR1024[774]=paddedInput[387];
inputBR1024[775]=paddedInput[899];
inputBR1024[776]=paddedInput[67];
inputBR1024[777]=paddedInput[579];
inputBR1024[778]=paddedInput[323];
inputBR1024[779]=paddedInput[835];
inputBR1024[780]=paddedInput[195];
inputBR1024[781]=paddedInput[707];
inputBR1024[782]=paddedInput[451];
inputBR1024[783]=paddedInput[963];
inputBR1024[784]=paddedInput[35];
inputBR1024[785]=paddedInput[547];
inputBR1024[786]=paddedInput[291];
inputBR1024[787]=paddedInput[803];
inputBR1024[788]=paddedInput[163];
inputBR1024[789]=paddedInput[675];
inputBR1024[790]=paddedInput[419];
inputBR1024[791]=paddedInput[931];
inputBR1024[792]=paddedInput[99];
inputBR1024[793]=paddedInput[611];
inputBR1024[794]=paddedInput[355];
inputBR1024[795]=paddedInput[867];
inputBR1024[796]=paddedInput[227];
inputBR1024[797]=paddedInput[739];
inputBR1024[798]=paddedInput[483];
inputBR1024[799]=paddedInput[995];
inputBR1024[800]=paddedInput[19];
inputBR1024[801]=paddedInput[531];
inputBR1024[802]=paddedInput[275];
inputBR1024[803]=paddedInput[787];
inputBR1024[804]=paddedInput[147];
inputBR1024[805]=paddedInput[659];
inputBR1024[806]=paddedInput[403];
inputBR1024[807]=paddedInput[915];
inputBR1024[808]=paddedInput[83];
inputBR1024[809]=paddedInput[595];
inputBR1024[810]=paddedInput[339];
inputBR1024[811]=paddedInput[851];
inputBR1024[812]=paddedInput[211];
inputBR1024[813]=paddedInput[723];
inputBR1024[814]=paddedInput[467];
inputBR1024[815]=paddedInput[979];
inputBR1024[816]=paddedInput[51];
inputBR1024[817]=paddedInput[563];
inputBR1024[818]=paddedInput[307];
inputBR1024[819]=paddedInput[819];
inputBR1024[820]=paddedInput[179];
inputBR1024[821]=paddedInput[691];
inputBR1024[822]=paddedInput[435];
inputBR1024[823]=paddedInput[947];
inputBR1024[824]=paddedInput[115];
inputBR1024[825]=paddedInput[627];
inputBR1024[826]=paddedInput[371];
inputBR1024[827]=paddedInput[883];
inputBR1024[828]=paddedInput[243];
inputBR1024[829]=paddedInput[755];
inputBR1024[830]=paddedInput[499];
inputBR1024[831]=paddedInput[1011];
inputBR1024[832]=paddedInput[11];
inputBR1024[833]=paddedInput[523];
inputBR1024[834]=paddedInput[267];
inputBR1024[835]=paddedInput[779];
inputBR1024[836]=paddedInput[139];
inputBR1024[837]=paddedInput[651];
inputBR1024[838]=paddedInput[395];
inputBR1024[839]=paddedInput[907];
inputBR1024[840]=paddedInput[75];
inputBR1024[841]=paddedInput[587];
inputBR1024[842]=paddedInput[331];
inputBR1024[843]=paddedInput[843];
inputBR1024[844]=paddedInput[203];
inputBR1024[845]=paddedInput[715];
inputBR1024[846]=paddedInput[459];
inputBR1024[847]=paddedInput[971];
inputBR1024[848]=paddedInput[43];
inputBR1024[849]=paddedInput[555];
inputBR1024[850]=paddedInput[299];
inputBR1024[851]=paddedInput[811];
inputBR1024[852]=paddedInput[171];
inputBR1024[853]=paddedInput[683];
inputBR1024[854]=paddedInput[427];
inputBR1024[855]=paddedInput[939];
inputBR1024[856]=paddedInput[107];
inputBR1024[857]=paddedInput[619];
inputBR1024[858]=paddedInput[363];
inputBR1024[859]=paddedInput[875];
inputBR1024[860]=paddedInput[235];
inputBR1024[861]=paddedInput[747];
inputBR1024[862]=paddedInput[491];
inputBR1024[863]=paddedInput[1003];
inputBR1024[864]=paddedInput[27];
inputBR1024[865]=paddedInput[539];
inputBR1024[866]=paddedInput[283];
inputBR1024[867]=paddedInput[795];
inputBR1024[868]=paddedInput[155];
inputBR1024[869]=paddedInput[667];
inputBR1024[870]=paddedInput[411];
inputBR1024[871]=paddedInput[923];
inputBR1024[872]=paddedInput[91];
inputBR1024[873]=paddedInput[603];
inputBR1024[874]=paddedInput[347];
inputBR1024[875]=paddedInput[859];
inputBR1024[876]=paddedInput[219];
inputBR1024[877]=paddedInput[731];
inputBR1024[878]=paddedInput[475];
inputBR1024[879]=paddedInput[987];
inputBR1024[880]=paddedInput[59];
inputBR1024[881]=paddedInput[571];
inputBR1024[882]=paddedInput[315];
inputBR1024[883]=paddedInput[827];
inputBR1024[884]=paddedInput[187];
inputBR1024[885]=paddedInput[699];
inputBR1024[886]=paddedInput[443];
inputBR1024[887]=paddedInput[955];
inputBR1024[888]=paddedInput[123];
inputBR1024[889]=paddedInput[635];
inputBR1024[890]=paddedInput[379];
inputBR1024[891]=paddedInput[891];
inputBR1024[892]=paddedInput[251];
inputBR1024[893]=paddedInput[763];
inputBR1024[894]=paddedInput[507];
inputBR1024[895]=paddedInput[1019];
inputBR1024[896]=paddedInput[7];
inputBR1024[897]=paddedInput[519];
inputBR1024[898]=paddedInput[263];
inputBR1024[899]=paddedInput[775];
inputBR1024[900]=paddedInput[135];
inputBR1024[901]=paddedInput[647];
inputBR1024[902]=paddedInput[391];
inputBR1024[903]=paddedInput[903];
inputBR1024[904]=paddedInput[71];
inputBR1024[905]=paddedInput[583];
inputBR1024[906]=paddedInput[327];
inputBR1024[907]=paddedInput[839];
inputBR1024[908]=paddedInput[199];
inputBR1024[909]=paddedInput[711];
inputBR1024[910]=paddedInput[455];
inputBR1024[911]=paddedInput[967];
inputBR1024[912]=paddedInput[39];
inputBR1024[913]=paddedInput[551];
inputBR1024[914]=paddedInput[295];
inputBR1024[915]=paddedInput[807];
inputBR1024[916]=paddedInput[167];
inputBR1024[917]=paddedInput[679];
inputBR1024[918]=paddedInput[423];
inputBR1024[919]=paddedInput[935];
inputBR1024[920]=paddedInput[103];
inputBR1024[921]=paddedInput[615];
inputBR1024[922]=paddedInput[359];
inputBR1024[923]=paddedInput[871];
inputBR1024[924]=paddedInput[231];
inputBR1024[925]=paddedInput[743];
inputBR1024[926]=paddedInput[487];
inputBR1024[927]=paddedInput[999];
inputBR1024[928]=paddedInput[23];
inputBR1024[929]=paddedInput[535];
inputBR1024[930]=paddedInput[279];
inputBR1024[931]=paddedInput[791];
inputBR1024[932]=paddedInput[151];
inputBR1024[933]=paddedInput[663];
inputBR1024[934]=paddedInput[407];
inputBR1024[935]=paddedInput[919];
inputBR1024[936]=paddedInput[87];
inputBR1024[937]=paddedInput[599];
inputBR1024[938]=paddedInput[343];
inputBR1024[939]=paddedInput[855];
inputBR1024[940]=paddedInput[215];
inputBR1024[941]=paddedInput[727];
inputBR1024[942]=paddedInput[471];
inputBR1024[943]=paddedInput[983];
inputBR1024[944]=paddedInput[55];
inputBR1024[945]=paddedInput[567];
inputBR1024[946]=paddedInput[311];
inputBR1024[947]=paddedInput[823];
inputBR1024[948]=paddedInput[183];
inputBR1024[949]=paddedInput[695];
inputBR1024[950]=paddedInput[439];
inputBR1024[951]=paddedInput[951];
inputBR1024[952]=paddedInput[119];
inputBR1024[953]=paddedInput[631];
inputBR1024[954]=paddedInput[375];
inputBR1024[955]=paddedInput[887];
inputBR1024[956]=paddedInput[247];
inputBR1024[957]=paddedInput[759];
inputBR1024[958]=paddedInput[503];
inputBR1024[959]=paddedInput[1015];
inputBR1024[960]=paddedInput[15];
inputBR1024[961]=paddedInput[527];
inputBR1024[962]=paddedInput[271];
inputBR1024[963]=paddedInput[783];
inputBR1024[964]=paddedInput[143];
inputBR1024[965]=paddedInput[655];
inputBR1024[966]=paddedInput[399];
inputBR1024[967]=paddedInput[911];
inputBR1024[968]=paddedInput[79];
inputBR1024[969]=paddedInput[591];
inputBR1024[970]=paddedInput[335];
inputBR1024[971]=paddedInput[847];
inputBR1024[972]=paddedInput[207];
inputBR1024[973]=paddedInput[719];
inputBR1024[974]=paddedInput[463];
inputBR1024[975]=paddedInput[975];
inputBR1024[976]=paddedInput[47];
inputBR1024[977]=paddedInput[559];
inputBR1024[978]=paddedInput[303];
inputBR1024[979]=paddedInput[815];
inputBR1024[980]=paddedInput[175];
inputBR1024[981]=paddedInput[687];
inputBR1024[982]=paddedInput[431];
inputBR1024[983]=paddedInput[943];
inputBR1024[984]=paddedInput[111];
inputBR1024[985]=paddedInput[623];
inputBR1024[986]=paddedInput[367];
inputBR1024[987]=paddedInput[879];
inputBR1024[988]=paddedInput[239];
inputBR1024[989]=paddedInput[751];
inputBR1024[990]=paddedInput[495];
inputBR1024[991]=paddedInput[1007];
inputBR1024[992]=paddedInput[31];
inputBR1024[993]=paddedInput[543];
inputBR1024[994]=paddedInput[287];
inputBR1024[995]=paddedInput[799];
inputBR1024[996]=paddedInput[159];
inputBR1024[997]=paddedInput[671];
inputBR1024[998]=paddedInput[415];
inputBR1024[999]=paddedInput[927];
inputBR1024[1000]=paddedInput[95];
inputBR1024[1001]=paddedInput[607];
inputBR1024[1002]=paddedInput[351];
inputBR1024[1003]=paddedInput[863];
inputBR1024[1004]=paddedInput[223];
inputBR1024[1005]=paddedInput[735];
inputBR1024[1006]=paddedInput[479];
inputBR1024[1007]=paddedInput[991];
inputBR1024[1008]=paddedInput[63];
inputBR1024[1009]=paddedInput[575];
inputBR1024[1010]=paddedInput[319];
inputBR1024[1011]=paddedInput[831];
inputBR1024[1012]=paddedInput[191];
inputBR1024[1013]=paddedInput[703];
inputBR1024[1014]=paddedInput[447];
inputBR1024[1015]=paddedInput[959];
inputBR1024[1016]=paddedInput[127];
inputBR1024[1017]=paddedInput[639];
inputBR1024[1018]=paddedInput[383];
inputBR1024[1019]=paddedInput[895];
inputBR1024[1020]=paddedInput[255];
inputBR1024[1021]=paddedInput[767];
inputBR1024[1022]=paddedInput[511];
inputBR1024[1023]=paddedInput[1023];


    // P = 0  -> 4
    for (int idx = 0, out_idx = 0; idx < 1024; idx += 4, out_idx += 8) {
        double x0aRe = inputBR1024[idx];
        double x1aRe = inputBR1024[idx + 1];
        double x2aRe = inputBR1024[idx + 2];
        double x3aRe = inputBR1024[idx + 3];

        double sum1 = x0aRe + x1aRe;
        double sum2 = x2aRe + x3aRe;
        double diff1 = x0aRe - x1aRe;
        double diff2 = x2aRe - x3aRe;

        out1024[out_idx] = sum1 + sum2;
        out1024[out_idx + 1] = 0;
        out1024[out_idx + 2] = diff1;
        out1024[out_idx + 3] = diff2;
        out1024[out_idx + 4] = sum1 - sum2;
        out1024[out_idx + 5] = 0;
        out1024[out_idx + 6] = diff1;
        out1024[out_idx + 7] = -diff2;
    }


    // P = 1  -> 16
    for (int idx = 0; idx < 2048; idx += 32) {
        double x0aRe = out1024[idx     ];
        double x0bRe = out1024[idx +  2]; 
        double x0bIm = out1024[idx +  3];
        double x0cRe = out1024[idx +  4];

        double x1aRe = out1024[idx +  8];
        out1024[idx +   8] = x0aRe - x1aRe; 
        double x1bRe = out1024[idx + 10];
        double x1bIm = out1024[idx + 11];
        double x1cRe = out1024[idx + 12];

        double x2aRe = out1024[idx + 16];
        double x2bRe = out1024[idx + 18];
        double x2bIm = out1024[idx + 19];
        double x2cRe = out1024[idx + 20];

        double x3aRe = out1024[idx + 24];
        out1024[idx +  24] = x0aRe - x1aRe;
        out1024[idx +  25] = x3aRe - x2aRe;  
        double x3bRe = out1024[idx + 26];
        double x3bIm = out1024[idx + 27];
        double x3cRe = out1024[idx + 28];

        out1024[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;  
        out1024[idx +   9] = x2aRe - x3aRe;      
        out1024[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;


double t1Re_2c = 0x1.6a09e667f3bcdp-1;

        double x2cRe_tRe_2c = x2cRe * t1Re_2c;
        double x3cRe_tRe_2c = x3cRe * t1Re_2c;

        double resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
        out1024[idx +  28] =   resReC1; 
        out1024[idx +   4] =   resReC1; 
        double resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c; 
        out1024[idx +   5] =   resImC1; 
        out1024[idx +  29] = - resImC1;
        double resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c; 
        out1024[idx +  20] =   resReC2;
        out1024[idx +  12] =   resReC2; 
        double resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c; 
        out1024[idx +  13] = - resImC2; 
        out1024[idx +  21] =   resImC2;  

        double x1dif = (x1bRe-x1bIm);
        double x1sum = (x1bRe+x1bIm);
        double x3dif = (x3bRe-x3bIm);
        double x3sum = (x3bRe+x3bIm);

double t1Re_1b = 0x1.6a09e667f3bcdp-1;

        double x1dif_tRe_1b = x1dif * t1Re_1b;
        double x1sum_tRe_1b = x1sum * t1Re_1b;
          
double t1Re_1b2b = 0x1.4e7ae9144f0fcp-1; //t1Re_1b * t1Re_2b;
double t1Re_1b2d = 0x1.1517a7bdb3896p-2; //t1Re_1b * t1Re_2d;

        double x3dif_tRe_1b2b = x3dif * t1Re_1b2b;
        double x3dif_tRe_1b2d = x3dif * t1Re_1b2d;
        double x3sum_tRe_1b2b = x3sum * t1Re_1b2b;
        double x3sum_tRe_1b2d = x3sum * t1Re_1b2d;

double t1Re_2b = 0x1.d906bcf328d46p-1;
double t1Re_2d = 0x1.87de2a6aea964p-2;

        double tempReB = (x3dif_tRe_1b2b - x3sum_tRe_1b2d + x2bRe*t1Re_2b - x2bIm*t1Re_2d);
        double tempImB = (x3dif_tRe_1b2d + x3sum_tRe_1b2b + x2bRe*t1Re_2d + x2bIm*t1Re_2b);
        double tempReD = (x3dif_tRe_1b2d + x3sum_tRe_1b2b - x2bRe*t1Re_2d - x2bIm*t1Re_2b);
        double tempImD = (x3dif_tRe_1b2b - x3sum_tRe_1b2d - x2bRe*t1Re_2b + x2bIm*t1Re_2d);

        double resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;     
        out1024[idx +   2] =   resReB1; 
        out1024[idx +  30] =   resReB1;  
        double resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;     
        out1024[idx +  18] =   resReB2;
        out1024[idx +  14] =   resReB2; 
        double resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;     
        out1024[idx +   6] =   resReD1; 
        out1024[idx +  26] =   resReD1; 
        double resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;     
        out1024[idx +  22] =   resReD2;
        out1024[idx +  10] =   resReD2; 

        double resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;     
        out1024[idx +   3] =   resImB1; 
        out1024[idx +  31] = - resImB1;  
        double resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;     
        out1024[idx +  19] =   resImB2;
        out1024[idx +  15] = - resImB2; 
        double resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;     
        out1024[idx +   7] =   resImD1; 
        out1024[idx +  27] = - resImD1; 
        double resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;     
        out1024[idx +  23] =   resImD2;  
        out1024[idx +  11] = - resImD2; 
    }

    // P = 2  -> 64
    for(int idx = 0; idx < 2048; idx+=128){
        double x0aRe_0 = out1024[idx       ];
        double x0bRe_0 = out1024[idx   +  2]; double x0bIm_0 = out1024[idx   +  3];
        double x0cRe_0 = out1024[idx   +  4]; double x0cIm_0 = out1024[idx   +  5];
        double x0dRe_0 = out1024[idx   +  6]; double x0dIm_0 = out1024[idx   +  7];
        double x0aRe_4 = out1024[idx   +  8]; double x0aIm_4 = out1024[idx   +  9];
        double x0bRe_4 = out1024[idx   + 10]; double x0bIm_4 = out1024[idx   + 11];
        double x0cRe_4 = out1024[idx   + 12]; double x0cIm_4 = out1024[idx   + 13];
        double x0dRe_4 = out1024[idx   + 14]; double x0dIm_4 = out1024[idx   + 15];
        double x0aRe_8 = out1024[idx   + 16];                                   

        double x1aRe_0 = out1024[idx   + 32];
        double x1bRe_0 = out1024[idx   + 34]; double x1bIm_0 = out1024[idx   + 35];
        double x1cRe_0 = out1024[idx   + 36]; double x1cIm_0 = out1024[idx   + 37];
        double x1dRe_0 = out1024[idx   + 38]; double x1dIm_0 = out1024[idx   + 39];
        double x1aRe_4 = out1024[idx   + 40]; double x1aIm_4 = out1024[idx   + 41];
        double x1bRe_4 = out1024[idx   + 42]; double x1bIm_4 = out1024[idx   + 43];
        double x1cRe_4 = out1024[idx   + 44]; double x1cIm_4 = out1024[idx   + 45];
        double x1dRe_4 = out1024[idx   + 46]; double x1dIm_4 = out1024[idx   + 47];
        double x1aRe_8 = out1024[idx   + 48]; double x1aIm_8 = out1024[idx   + 49];

        double x2aRe_0 = out1024[idx   + 64]; double x2aIm_0 = out1024[idx   + 65];
        double x2bRe_0 = out1024[idx   + 66]; double x2bIm_0 = out1024[idx   + 67];
        double x2cRe_0 = out1024[idx   + 68]; double x2cIm_0 = out1024[idx   + 69];
        double x2dRe_0 = out1024[idx   + 70]; double x2dIm_0 = out1024[idx   + 71];
        double x2aRe_4 = out1024[idx   + 72]; double x2aIm_4 = out1024[idx   + 73];
        double x2bRe_4 = out1024[idx   + 74]; double x2bIm_4 = out1024[idx   + 75];
        double x2cRe_4 = out1024[idx   + 76]; double x2cIm_4 = out1024[idx   + 77];
        double x2dRe_4 = out1024[idx   + 78]; double x2dIm_4 = out1024[idx   + 79];
        double x2aRe_8 = out1024[idx   + 80]; double x2aIm_8 = out1024[idx   + 81];

        double x3aRe_0 = out1024[idx   + 96]; double x3aIm_0 = out1024[idx   + 97];
        double x3bRe_0 = out1024[idx   + 98]; double x3bIm_0 = out1024[idx   + 99];
        double x3cRe_0 = out1024[idx   +100]; double x3cIm_0 = out1024[idx   +101];
        double x3dRe_0 = out1024[idx   +102]; double x3dIm_0 = out1024[idx   +103];
        double x3aRe_4 = out1024[idx   +104]; double x3aIm_4 = out1024[idx   +105];
        double x3bRe_4 = out1024[idx   +106]; double x3bIm_4 = out1024[idx   +107];
        double x3cRe_4 = out1024[idx   +108]; double x3cIm_4 = out1024[idx   +109];
        double x3dRe_4 = out1024[idx   +110]; double x3dIm_4 = out1024[idx   +111];
        double x3aRe_8 = out1024[idx   +112]; double x3aIm_8 = out1024[idx   +113];

double t2Re_1b = 0x1.f6297cff75cbp-1;
double t2Re_1h = 0x1.8f8b83c69a60cp-3;

        double T0x1bRe = (x1bRe_0 * t2Re_1b - x1bIm_0 * t2Re_1h);
        double T0x1bIm = (x1bRe_0 * t2Re_1h + x1bIm_0 * t2Re_1b);
        double T0x3bRe = (x3bRe_0 * t2Re_1b - x3bIm_0 * t2Re_1h);
        double T0x3bIm = (x3bRe_0 * t2Re_1h + x3bIm_0 * t2Re_1b);

double t2Re_1c = 0x1.d906bcf328d46p-1;
double t2Re_1g = 0x1.87de2a6aea964p-2;

        double T0x0cRe = (x1cRe_0 * t2Re_1c - x1cIm_0 * t2Re_1g);
        double T0x0cIm = (x1cRe_0 * t2Re_1g + x1cIm_0 * t2Re_1c);
        double T0x2cRe = (x3cRe_0 * t2Re_1c - x3cIm_0 * t2Re_1g);
        double T0x2cIm = (x3cRe_0 * t2Re_1g + x3cIm_0 * t2Re_1c);

double t2Re_1d = 0x1.a9b66290ea1a3p-1;
double t2Re_1f = 0x1.1c73b39ae68c9p-1;

        double T0x1dRe = (x1dRe_0 * t2Re_1d - x1dIm_0 * t2Re_1f);
        double T0x1dIm = (x1dRe_0 * t2Re_1f + x1dIm_0 * t2Re_1d);
        double T0x3dRe = (x3dRe_0 * t2Re_1d - x3dIm_0 * t2Re_1f);
        double T0x3dIm = (x3dRe_0 * t2Re_1f + x3dIm_0 * t2Re_1d);

        out1024[idx       ] =   (x0aRe_0 + x1aRe_0) + (x2aRe_0 + x3aRe_0);
        out1024[idx  +  64] =   (x0aRe_0 + x1aRe_0) - (x2aRe_0 + x3aRe_0);
        out1024[idx  +  65] =                       - (x2aIm_0 + x3aIm_0);
        out1024[idx  +   1] =                         (x2aIm_0 + x3aIm_0); 

double t2Re_2b = 0x1.fd88da3d12526p-1;
double t2Re_2p = 0x1.917a6bc29b438p-4;

        double res0ReB = x0bRe_0 + T0x1bRe + ((x2bRe_0 + T0x3bRe)*  t2Re_2b - ((x2bIm_0 + T0x3bIm)*  t2Re_2p));
        out1024[idx  +   2] =   res0ReB;
        out1024[idx  + 126] =   res0ReB; 
        double res0ImB = x0bIm_0 + T0x1bIm + ((x2bRe_0 + T0x3bRe)*  t2Re_2p + ((x2bIm_0 + T0x3bIm)*  t2Re_2b)); 
        out1024[idx  + 127] = - res0ImB;
        out1024[idx  +   3] =   res0ImB;

double t2Re_2c = 0x1.f6297cff75cbp-1;
double t2Re_2o = 0x1.8f8b83c69a60cp-3;

        double res0ReC = x0cRe_0 + T0x0cRe + ((x2cRe_0 + T0x2cRe)*  t2Re_2c - ((x2cIm_0 + T0x2cIm)*  t2Re_2o));  
        out1024[idx  +   4] =   res0ReC;
        out1024[idx  + 124] =   res0ReC;
        double res0ImC = x0cIm_0 + T0x0cIm + ((x2cRe_0 + T0x2cRe)*  t2Re_2o + ((x2cIm_0 + T0x2cIm)*  t2Re_2c));
        out1024[idx  + 125] = - res0ImC;
        out1024[idx  +   5] =   res0ImC; 

double t2Re_2d = 0x1.e9f4156c62ddap-1;
double t2Re_2n = 0x1.294062ed59f04p-2;

        double res0ReD = x0dRe_0 + T0x1dRe + ((x2dRe_0 + T0x3dRe)*  t2Re_2d - ((x2dIm_0 + T0x3dIm)*  t2Re_2n));  
        out1024[idx  +   6] =   res0ReD;
        out1024[idx  + 122] =   res0ReD;
        double res0ImD = x0dIm_0 + T0x1dIm + ((x2dRe_0 + T0x3dRe)*  t2Re_2n + ((x2dIm_0 + T0x3dIm)*  t2Re_2d)); 
        out1024[idx  + 123] = - res0ImD;
        out1024[idx  +   7] =   res0ImD;  
        double res1ReA =    (x0aRe_0 - x1aRe_0) - (x2aIm_0 - x3aIm_0);
        out1024[idx  +  32] =   res1ReA;
        out1024[idx  +  96] =   res1ReA;
        double res1ImA =                          (x2aRe_0 - x3aRe_0); 
        out1024[idx  +  97] = - res1ImA;
        out1024[idx  +  33] =   res1ImA;
        double res1ReB = x0bRe_0 - T0x1bRe + ((x2bRe_0 - T0x3bRe)* -t2Re_2p  - ((x2bIm_0 - T0x3bIm)*  t2Re_2b ));
        out1024[idx  +  34] =   res1ReB;
        out1024[idx  +  94] =   res1ReB;
        double res1ImB = x0bIm_0 - T0x1bIm + ((x2bRe_0 - T0x3bRe)*  t2Re_2b  + ((x2bIm_0 - T0x3bIm)* -t2Re_2p )); 
        out1024[idx  +  95] = - res1ImB; 
        out1024[idx  +  35] =   res1ImB;
        double res1ReC = x0cRe_0 - T0x0cRe + ((x2cRe_0 - T0x2cRe)* -t2Re_2o  - ((x2cIm_0 - T0x2cIm)*  t2Re_2c )); 
        out1024[idx  +  36] =   res1ReC;
        out1024[idx  +  92] =   res1ReC;
        double res1ImC = x0cIm_0 - T0x0cIm + ((x2cRe_0 - T0x2cRe)*  t2Re_2c  + ((x2cIm_0 - T0x2cIm)* -t2Re_2o ));
        out1024[idx  +  93] = - res1ImC;  
        out1024[idx  +  37] =   res1ImC; 
        double res1ReD = x0dRe_0 - T0x1dRe + ((x2dRe_0 - T0x3dRe)* -t2Re_2n  - ((x2dIm_0 - T0x3dIm)*  t2Re_2d ));
        out1024[idx  +  38] =   res1ReD;
        out1024[idx  +  90] =   res1ReD;
        double res1ImD = x0dIm_0 - T0x1dIm + ((x2dRe_0 - T0x3dRe)*  t2Re_2d  + ((x2dIm_0 - T0x3dIm)* -t2Re_2n ));  
        out1024[idx  +  91] = - res1ImD; 
        out1024[idx  +  39] =   res1ImD;

double t2Re_1e = 0x1.6a09e667f3bcdp-1;
        double T1x0aRe = (x1aRe_4 * t2Re_1e - x1aIm_4 * t2Re_1e);
        double T1x0aIm = (x1aRe_4 * t2Re_1e + x1aIm_4 * t2Re_1e);
        double T1x2aRe = (x3aRe_4 * t2Re_1e - x3aIm_4 * t2Re_1e);
        double T1x2aIm = (x3aRe_4 * t2Re_1e + x3aIm_4 * t2Re_1e);

        double T1x1bRe = (x1bRe_4 * t2Re_1f - x1bIm_4 * t2Re_1d);
        double T1x1bIm = (x1bRe_4 * t2Re_1d + x1bIm_4 * t2Re_1f);
        double T1x3bRe = (x3bRe_4 * t2Re_1f - x3bIm_4 * t2Re_1d);
        double T1x3bIm = (x3bRe_4 * t2Re_1d + x3bIm_4 * t2Re_1f);

        double T1x0cRe = (x1cRe_4 * t2Re_1g - x1cIm_4 * t2Re_1c);
        double T1x0cIm = (x1cRe_4 * t2Re_1c + x1cIm_4 * t2Re_1g);
        double T1x2cRe = (x3cRe_4 * t2Re_1g - x3cIm_4 * t2Re_1c);
        double T1x2cIm = (x3cRe_4 * t2Re_1c + x3cIm_4 * t2Re_1g);

        double T1x1dRe = (x1dRe_4 * t2Re_1h - x1dIm_4 * t2Re_1b);
        double T1x1dIm = (x1dRe_4 * t2Re_1b + x1dIm_4 * t2Re_1h);
        double T1x3dRe = (x3dRe_4 * t2Re_1h - x3dIm_4 * t2Re_1b);
        double T1x3dIm = (x3dRe_4 * t2Re_1b + x3dIm_4 * t2Re_1h);

double t2Re_2e = 0x1.d906bcf328d46p-1;
double t2Re_2m = 0x1.87de2a6aea964p-2;

        double res2ReA = x0aRe_4 + T1x0aRe + ((x2aRe_4 + T1x2aRe)*  t2Re_2e - ((x2aIm_4 + T1x2aIm)*  t2Re_2m));  
        out1024[idx  +   8] =   res2ReA;
        out1024[idx  + 120] =   res2ReA;
        double res2ImA = x0aIm_4 + T1x0aIm + ((x2aRe_4 + T1x2aRe)*  t2Re_2m + ((x2aIm_4 + T1x2aIm)*  t2Re_2e)); 
        out1024[idx  + 121] = - res2ImA; 
        out1024[idx  +   9] =   res2ImA;

double t2Re_2f = 0x1.c38b2f180bdb1p-1;
double t2Re_2l = 0x1.e2b5d3806f63ep-2;

        double res2ReB = x0bRe_4 + T1x1bRe + ((x2bRe_4 + T1x3bRe)*  t2Re_2f - ((x2bIm_4 + T1x3bIm)*  t2Re_2l));
        out1024[idx  +  10] =   res2ReB;
        out1024[idx  + 118] =   res2ReB; 
        double res2ImB = x0bIm_4 + T1x1bIm + ((x2bRe_4 + T1x3bRe)*  t2Re_2l + ((x2bIm_4 + T1x3bIm)*  t2Re_2f));  
        out1024[idx  + 119] = - res2ImB; 
        out1024[idx  +  11] =   res2ImB; 

double t2Re_2g = 0x1.a9b66290ea1a3p-1;
double t2Re_2k = 0x1.1c73b39ae68c9p-1;

        double res2ReC = x0cRe_4 + T1x0cRe + ((x2cRe_4 + T1x2cRe)*  t2Re_2g - ((x2cIm_4 + T1x2cIm)*  t2Re_2k));
        out1024[idx  +  12] =   res2ReC;
        out1024[idx  + 116] =   res2ReC;  
        double res2ImC = x0cIm_4 + T1x0cIm + ((x2cRe_4 + T1x2cRe)*  t2Re_2k + ((x2cIm_4 + T1x2cIm)*  t2Re_2g)); 
        out1024[idx  + 117] = - res2ImC; 
        out1024[idx  +  13] =   res2ImC; 

double t2Re_2h = 0x1.8bc806b151741p-1;
double t2Re_2j = 0x1.44cf325091dd7p-1;

        double res2ReD = x0dRe_4 + T1x1dRe + ((x2dRe_4 + T1x3dRe)*  t2Re_2h - ((x2dIm_4 + T1x3dIm)*  t2Re_2j));  
        out1024[idx  +  14] =   res2ReD;
        out1024[idx  + 114] =   res2ReD;
        double res2ImD = x0dIm_4 + T1x1dIm + ((x2dRe_4 + T1x3dRe)*  t2Re_2j + ((x2dIm_4 + T1x3dIm)*  t2Re_2h));
        out1024[idx  + 115] = - res2ImD; 
        out1024[idx  +  15] =   res2ImD;
        double res3ReA = x0aRe_4 - T1x0aRe + ((x2aRe_4 - T1x2aRe)* -t2Re_2m  - ((x2aIm_4 - T1x2aIm)*  t2Re_2e ));
        out1024[idx  +  40] =   res3ReA;
        out1024[idx  +  88] =   res3ReA;
        double res3ImA = x0aIm_4 - T1x0aIm + ((x2aRe_4 - T1x2aRe)*  t2Re_2e  + ((x2aIm_4 - T1x2aIm)* -t2Re_2m )); 
        out1024[idx  +  89] = - res3ImA;
        out1024[idx  +  41] =   res3ImA; 
        double res3ReB = x0bRe_4 - T1x1bRe + ((x2bRe_4 - T1x3bRe)* -t2Re_2l  - ((x2bIm_4 - T1x3bIm)*  t2Re_2f ));
        out1024[idx  +  42] =   res3ReB; 
        out1024[idx  +  86] =   res3ReB;
        double res3ImB = x0bIm_4 - T1x1bIm + ((x2bRe_4 - T1x3bRe)*  t2Re_2f  + ((x2bIm_4 - T1x3bIm)* -t2Re_2l ));
        out1024[idx  +  87] = - res3ImB; 
        out1024[idx  +  43] =   res3ImB; 
        double res3ReC = x0cRe_4 - T1x0cRe + ((x2cRe_4 - T1x2cRe)* -t2Re_2k  - ((x2cIm_4 - T1x2cIm)*  t2Re_2g ));
        out1024[idx  +  44] =   res3ReC;
        out1024[idx  +  84] =   res3ReC;
        double res3ImC = x0cIm_4 - T1x0cIm + ((x2cRe_4 - T1x2cRe)*  t2Re_2g  + ((x2cIm_4 - T1x2cIm)* -t2Re_2k )); 
        out1024[idx  +  85] = - res3ImC;
        out1024[idx  +  45] =   res3ImC;
        double res3ReD = x0dRe_4 - T1x1dRe + ((x2dRe_4 - T1x3dRe)* -t2Re_2j  - ((x2dIm_4 - T1x3dIm)*  t2Re_2h ));
        out1024[idx  +  46] =   res3ReD;
        out1024[idx  +  82] =   res3ReD;
        double res3ImD = x0dIm_4 - T1x1dIm + ((x2dRe_4 - T1x3dRe)*  t2Re_2h  + ((x2dIm_4 - T1x3dIm)* -t2Re_2j ));
        out1024[idx  +  83] = - res3ImD;
        out1024[idx  +  47] =   res3ImD; 

        double T2x0aRe = - x1aIm_8;
        double T2x0aIm =   x1aRe_8;
        double T2x2aRe = - x3aIm_8;
        double T2x2aIm =   x3aRe_8;

        double T2x1bRe = (x1dRe_4 * -t2Re_1h - -x1dIm_4 *  t2Re_1b);
        double T2x1bIm = (x1dRe_4 *  t2Re_1b + -x1dIm_4 * -t2Re_1h);
        double T2x3bRe = (x3dRe_4 * -t2Re_1h - -x3dIm_4 *  t2Re_1b);
        double T2x3bIm = (x3dRe_4 *  t2Re_1b + -x3dIm_4 * -t2Re_1h);

        double T2x0cRe = (x1cRe_4 * -t2Re_1g - -x1cIm_4 *  t2Re_1c);
        double T2x0cIm = (x1cRe_4 *  t2Re_1c + -x1cIm_4 * -t2Re_1g);
        double T2x2cRe = (x3cRe_4 * -t2Re_1g - -x3cIm_4 *  t2Re_1c);
        double T2x2cIm = (x3cRe_4 *  t2Re_1c + -x3cIm_4 * -t2Re_1g);

        double T2x1dRe = (x1bRe_4 * -t2Re_1f - -x1bIm_4 *  t2Re_1d);
        double T2x1dIm = (x1bRe_4 *  t2Re_1d + -x1bIm_4 * -t2Re_1f);
        double T2x3dRe = (x3bRe_4 * -t2Re_1f - -x3bIm_4 *  t2Re_1d);
        double T2x3dIm = (x3bRe_4 *  t2Re_1d + -x3bIm_4 * -t2Re_1f);

double t2Re_2i = 0x1.6a09e667f3bcdp-1;

        double res4ReA =  x0aRe_8 + T2x0aRe + ((x2aRe_8 + T2x2aRe)*  t2Re_2i - (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
        out1024[idx  +  16] =   res4ReA;
        out1024[idx  + 112] =   res4ReA; 
        double res4ImA =  0       + T2x0aIm + ((x2aRe_8 + T2x2aRe)*  t2Re_2i + (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
        out1024[idx  + 113] = - res4ImA; 
        out1024[idx  +  17] =   res4ImA;
        double res4ReB =  x0dRe_4 + T2x1bRe + ((x2dRe_4 + T2x3bRe)*  t2Re_2j - ((-x2dIm_4 + T2x3bIm)*  t2Re_2h)); 
        out1024[idx  +  18] =   res4ReB;
        out1024[idx  + 110] =   res4ReB;
        double res4ImB = -x0dIm_4 + T2x1bIm + ((x2dRe_4 + T2x3bRe)*  t2Re_2h + ((-x2dIm_4 + T2x3bIm)*  t2Re_2j)); 
        out1024[idx  + 111] = - res4ImB; 
        out1024[idx  +  19] =   res4ImB; 
        double res4ReC =  x0cRe_4 + T2x0cRe + ((x2cRe_4 + T2x2cRe)*  t2Re_2k - ((-x2cIm_4 + T2x2cIm)*  t2Re_2g)); 
        out1024[idx  +  20] =   res4ReC;
        out1024[idx  + 108] =   res4ReC; 
        double res4ImC = -x0cIm_4 + T2x0cIm + ((x2cRe_4 + T2x2cRe)*  t2Re_2g + ((-x2cIm_4 + T2x2cIm)*  t2Re_2k));   
        out1024[idx  + 109] = - res4ImC;
        out1024[idx  +  21] =   res4ImC;
        double res4ReD =  x0bRe_4 + T2x1dRe + ((x2bRe_4 + T2x3dRe)*  t2Re_2l - ((-x2bIm_4 + T2x3dIm)*  t2Re_2f)); 
        out1024[idx  +  22] =   res4ReD;
        out1024[idx  + 106] =   res4ReD; 
        double res4ImD = -x0bIm_4 + T2x1dIm + ((x2bRe_4 + T2x3dRe)*  t2Re_2f + ((-x2bIm_4 + T2x3dIm)*  t2Re_2l)); 
        out1024[idx  + 107] = - res4ImD;
        out1024[idx  +  23] =   res4ImD;
        double res5ReA =  x0aRe_8 - T2x0aRe + ((x2aRe_8 - T2x2aRe)* -t2Re_2i  - (( x2aIm_8 - T2x2aIm)*  t2Re_2i ));
        out1024[idx  +  48] =   res5ReA;
        out1024[idx  +  80] =   res5ReA;
        double res5ImA =  0       - T2x0aIm + ((x2aRe_8 - T2x2aRe)*  t2Re_2i  + (( x2aIm_8 - T2x2aIm)* -t2Re_2i ));
        out1024[idx  +  81] = - res5ImA;
        out1024[idx  +  49] =   res5ImA; 
        double res5ReB =  x0dRe_4 - T2x1bRe + ((x2dRe_4 - T2x3bRe)* -t2Re_2h  - ((-x2dIm_4 - T2x3bIm)*  t2Re_2j ));
        out1024[idx  +  50] =   res5ReB;
        out1024[idx  +  78] =   res5ReB;
        double res5ImB = -x0dIm_4 - T2x1bIm + ((x2dRe_4 - T2x3bRe)*  t2Re_2j  + ((-x2dIm_4 - T2x3bIm)* -t2Re_2h ));
        out1024[idx  +  79] = - res5ImB;
        out1024[idx  +  51] =   res5ImB; 
        double res5ReC =  x0cRe_4 - T2x0cRe + ((x2cRe_4 - T2x2cRe)* -t2Re_2g  - ((-x2cIm_4 - T2x2cIm)*  t2Re_2k ));
        out1024[idx  +  52] =   res5ReC;
        out1024[idx  +  76] =   res5ReC;
        double res5ImC = -x0cIm_4 - T2x0cIm + ((x2cRe_4 - T2x2cRe)*  t2Re_2k  + ((-x2cIm_4 - T2x2cIm)* -t2Re_2g ));
        out1024[idx  +  77] = - res5ImC; 
        out1024[idx  +  53] =   res5ImC;
        double res5ReD =  x0bRe_4 - T2x1dRe + ((x2bRe_4 - T2x3dRe)* -t2Re_2f  - ((-x2bIm_4 - T2x3dIm)*  t2Re_2l ));
        out1024[idx  +  54] =   res5ReD;
        out1024[idx  +  74] =   res5ReD;
        double res5ImD = -x0bIm_4 - T2x1dIm + ((x2bRe_4 - T2x3dRe)*  t2Re_2l  + ((-x2bIm_4 - T2x3dIm)* -t2Re_2f ));
        out1024[idx  +  75] = - res5ImD;
        out1024[idx  +  55] =   res5ImD;

        double T3x0aRe = (x1aRe_4  * -t2Re_1e - -x1aIm_4 *  t2Re_1e);
        double T3x0aIm = (x1aRe_4  *  t2Re_1e + -x1aIm_4 * -t2Re_1e);
        double T3x2aRe = (x3aRe_4  * -t2Re_1e - -x3aIm_4 *  t2Re_1e);
        double T3x2aIm = (x3aRe_4  *  t2Re_1e + -x3aIm_4 * -t2Re_1e);

        double T3x1bRe = (x1dRe_0  * -t2Re_1d - -x1dIm_0 *  t2Re_1f);
        double T3x1bIm = (x1dRe_0  *  t2Re_1f + -x1dIm_0 * -t2Re_1d);
        double T3x3bRe = (x3dRe_0  * -t2Re_1d - -x3dIm_0 *  t2Re_1f);
        double T3x3bIm = (x3dRe_0  *  t2Re_1f + -x3dIm_0 * -t2Re_1d);

        double T3x0cRe = (x1cRe_0  * -t2Re_1c - -x1cIm_0 *  t2Re_1g);
        double T3x0cIm = (x1cRe_0  *  t2Re_1g + -x1cIm_0 * -t2Re_1c);
        double T3x2cRe = (x3cRe_0  * -t2Re_1c - -x3cIm_0 *  t2Re_1g);
        double T3x2cIm = (x3cRe_0  *  t2Re_1g + -x3cIm_0 * -t2Re_1c);

        double T3x1dRe = (x1bRe_0  * -t2Re_1b - -x1bIm_0 *  t2Re_1h);
        double T3x1dIm = (x1bRe_0  *  t2Re_1h + -x1bIm_0 * -t2Re_1b);
        double T3x3dRe = (x3bRe_0  * -t2Re_1b - -x3bIm_0 *  t2Re_1h);
        double T3x3dIm = (x3bRe_0  *  t2Re_1h + -x3bIm_0 * -t2Re_1b);

        double res6ReA =  x0aRe_4 + T3x0aRe + ((x2aRe_4 + T3x2aRe)*  t2Re_2m - ((-x2aIm_4 + T3x2aIm)*  t2Re_2e));  
        out1024[idx  +  24] =   res6ReA;
        out1024[idx  + 104] =   res6ReA;
        double res6ImA = -x0aIm_4 + T3x0aIm + ((x2aRe_4 + T3x2aRe)*  t2Re_2e + ((-x2aIm_4 + T3x2aIm)*  t2Re_2m)); 
        out1024[idx  + 105] = - res6ImA; 
        out1024[idx  +  25] =   res6ImA;
        double res6ReB =  x0dRe_0 + T3x1bRe + ((x2dRe_0 + T3x3bRe)*  t2Re_2n - ((-x2dIm_0 + T3x3bIm)*  t2Re_2d)); 
        out1024[idx  +  26] =   res6ReB;
        out1024[idx  + 102] =   res6ReB;
        double res6ImB = -x0dIm_0 + T3x1bIm + ((x2dRe_0 + T3x3bRe)*  t2Re_2d + ((-x2dIm_0 + T3x3bIm)*  t2Re_2n)); 
        out1024[idx  + 103] = - res6ImB; 
        out1024[idx  +  27] =   res6ImB; 
        double res6ReC =  x0cRe_0 + T3x0cRe + ((x2cRe_0 + T3x2cRe)*  t2Re_2o - ((-x2cIm_0 + T3x2cIm)*  t2Re_2c));  
        out1024[idx  +  28] =   res6ReC;
        out1024[idx  + 100] =   res6ReC;
        double res6ImC = -x0cIm_0 + T3x0cIm + ((x2cRe_0 + T3x2cRe)*  t2Re_2c + ((-x2cIm_0 + T3x2cIm)*  t2Re_2o)); 
        out1024[idx  + 101] = - res6ImC; 
        out1024[idx  +  29] =   res6ImC; 
        double res6ReD =  x0bRe_0 + T3x1dRe + ((x2bRe_0 + T3x3dRe)*  t2Re_2p - ((-x2bIm_0 + T3x3dIm)*  t2Re_2b)); 
        out1024[idx  +  30] =   res6ReD;
        out1024[idx  +  98] =   res6ReD; 
        double res6ImD = -x0bIm_0 + T3x1dIm + ((x2bRe_0 + T3x3dRe)*  t2Re_2b + ((-x2bIm_0 + T3x3dIm)*  t2Re_2p)); 
        out1024[idx  +  99] = - res6ImD;
        out1024[idx  +  31] =   res6ImD;
        double res7ReA =  x0aRe_4 - T3x0aRe + ((x2aRe_4 - T3x2aRe)* -t2Re_2e  - ((-x2aIm_4 - T3x2aIm)*  t2Re_2m ));
        out1024[idx  +  56] =   res7ReA;
        out1024[idx  +  72] =   res7ReA;
        double res7ImA = -x0aIm_4 - T3x0aIm + ((x2aRe_4 - T3x2aRe)*  t2Re_2m  + ((-x2aIm_4 - T3x2aIm)* -t2Re_2e ));
        out1024[idx  +  73] = - res7ImA;
        out1024[idx  +  57] =   res7ImA;
        double res7ReB =  x0dRe_0 - T3x1bRe + ((x2dRe_0 - T3x3bRe)* -t2Re_2d  - ((-x2dIm_0 - T3x3bIm)*  t2Re_2n ));
        out1024[idx  +  58] =   res7ReB;
        out1024[idx  +  70] =   res7ReB;
        double res7ImB = -x0dIm_0 - T3x1bIm + ((x2dRe_0 - T3x3bRe)*  t2Re_2n  + ((-x2dIm_0 - T3x3bIm)* -t2Re_2d ));
        out1024[idx  +  71] = - res7ImB; 
        out1024[idx  +  59] =   res7ImB;
        double res7ReC =  x0cRe_0 - T3x0cRe + ((x2cRe_0 - T3x2cRe)* -t2Re_2c  - ((-x2cIm_0 - T3x2cIm)*  t2Re_2o ));
        out1024[idx  +  60] =   res7ReC;
        out1024[idx  +  68] =   res7ReC;
        double res7ImC = -x0cIm_0 - T3x0cIm + ((x2cRe_0 - T3x2cRe)*  t2Re_2o  + ((-x2cIm_0 - T3x2cIm)* -t2Re_2c ));
        out1024[idx  +  69] = - res7ImC;
        out1024[idx  +  61] =   res7ImC;
        double res7ReD =  x0bRe_0 - T3x1dRe + ((x2bRe_0 - T3x3dRe)* -t2Re_2b  - ((-x2bIm_0 - T3x3dIm)*  t2Re_2p ));
        out1024[idx  +  62] =   res7ReD;
        out1024[idx  +  66] =   res7ReD;
        double res7ImD = -x0bIm_0 - T3x1dIm + ((x2bRe_0 - T3x3dRe)*  t2Re_2p  + ((-x2bIm_0 - T3x3dIm)* -t2Re_2b ));
        out1024[idx  +  67] = - res7ImD;
        out1024[idx  +  63] =   res7ImD;
    }


    /////////////////////////////////////////////
    // P = 2.5  -> 128
    //////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // FFT step for SIZE 128 
    ////////////////////////////////////////////////
    for(int idx = 0; idx < 2048; idx += 256){ 
        double oRe0 = out1024[idx + 128];
        double oIm0 = out1024[idx + 129];
        double eRe0 = out1024[idx + 0];
        double eIm0 = out1024[idx + 1];
        double resRe0_s = eRe0 + oRe0;
        out1024[idx] = resRe0_s;
        double resIm0_s = eIm0 + oIm0;
        out1024[idx + 1] = resRe0_s;
        double resRe0_d = eRe0 - oRe0;
        out1024[idx + 128] = resRe0_d;
        double resIm0_d = eIm0 - oIm0;
        out1024[idx + 129] = resIm0_d;
        
        double oRe1 = out1024[idx + 130];
        double oIm1 = out1024[idx + 131];
        double eRe1 = out1024[idx + 2];
        double eIm1 = out1024[idx + 3];
        double tRe1 = 0x1.ff621e3796d7ep-1;
        double tRe31 = 0x1.91f65f10dd825p-5;
        double resIm1_s = eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out1024[idx + 3] = resIm1_s;
        out1024[idx + 255] = -resIm1_s;
        double resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe31);
        out1024[idx + 254] = resRe1_s;
        out1024[idx + 2] = resRe1_s;
        double resRe31_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe31);
        out1024[idx + 130] = resRe63_s;
        out1024[idx + 126] = resRe63_s;
        double resIm31_s = -eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out1024[idx + 127] = resIm63_s;
        out1024[idx + 131] = -resIm63_s;
        
        double oRe2 = out1024[idx + 132];
        double oIm2 = out1024[idx + 133];
        double eRe2 = out1024[idx + 4];
        double eIm2 = out1024[idx + 5];
        double tRe2 = 0x1.fd88da3d12526p-1;
        double tRe30 = 0x1.917a6bc29b438p-4;
        double resIm2_s = eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out1024[idx + 5] = resIm2_s;
        out1024[idx + 253] = -resIm2_s;
        double resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe30);
        out1024[idx + 252] = resRe2_s;
        out1024[idx + 4] = resRe2_s;
        double resRe30_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe30);
        out1024[idx + 132] = resRe62_s;
        out1024[idx + 124] = resRe62_s;
        double resIm30_s = -eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out1024[idx + 125] = resIm62_s;
        out1024[idx + 133] = -resIm62_s;
        
        double oRe3 = out1024[idx + 134];
        double oIm3 = out1024[idx + 135];
        double eRe3 = out1024[idx + 6];
        double eIm3 = out1024[idx + 7];
        double tRe3 = 0x1.fa7557f08a517p-1;
        double tRe29 = 0x1.2c8106e8e613ap-3;
        double resIm3_s = eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out1024[idx + 7] = resIm3_s;
        out1024[idx + 251] = -resIm3_s;
        double resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe29);
        out1024[idx + 250] = resRe3_s;
        out1024[idx + 6] = resRe3_s;
        double resRe29_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe29);
        out1024[idx + 134] = resRe61_s;
        out1024[idx + 122] = resRe61_s;
        double resIm29_s = -eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out1024[idx + 123] = resIm61_s;
        out1024[idx + 135] = -resIm61_s;
        
        double oRe4 = out1024[idx + 136];
        double oIm4 = out1024[idx + 137];
        double eRe4 = out1024[idx + 8];
        double eIm4 = out1024[idx + 9];
        double tRe4 = 0x1.f6297cff75cbp-1;
        double tRe28 = 0x1.8f8b83c69a60cp-3;
        double resIm4_s = eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out1024[idx + 9] = resIm4_s;
        out1024[idx + 249] = -resIm4_s;
        double resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe28);
        out1024[idx + 248] = resRe4_s;
        out1024[idx + 8] = resRe4_s;
        double resRe28_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe28);
        out1024[idx + 136] = resRe60_s;
        out1024[idx + 120] = resRe60_s;
        double resIm28_s = -eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out1024[idx + 121] = resIm60_s;
        out1024[idx + 137] = -resIm60_s;
        
        double oRe5 = out1024[idx + 138];
        double oIm5 = out1024[idx + 139];
        double eRe5 = out1024[idx + 10];
        double eIm5 = out1024[idx + 11];
        double tRe5 = 0x1.f0a7efb9230d7p-1;
        double tRe27 = 0x1.f19f97b215f1ep-3;
        double resIm5_s = eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out1024[idx + 11] = resIm5_s;
        out1024[idx + 247] = -resIm5_s;
        double resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe27);
        out1024[idx + 246] = resRe5_s;
        out1024[idx + 10] = resRe5_s;
        double resRe27_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe27);
        out1024[idx + 138] = resRe59_s;
        out1024[idx + 118] = resRe59_s;
        double resIm27_s = -eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out1024[idx + 119] = resIm59_s;
        out1024[idx + 139] = -resIm59_s;
        
        double oRe6 = out1024[idx + 140];
        double oIm6 = out1024[idx + 141];
        double eRe6 = out1024[idx + 12];
        double eIm6 = out1024[idx + 13];
        double tRe6 = 0x1.e9f4156c62ddap-1;
        double tRe26 = 0x1.294062ed59f04p-2;
        double resIm6_s = eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out1024[idx + 13] = resIm6_s;
        out1024[idx + 245] = -resIm6_s;
        double resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe26);
        out1024[idx + 244] = resRe6_s;
        out1024[idx + 12] = resRe6_s;
        double resRe26_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe26);
        out1024[idx + 140] = resRe58_s;
        out1024[idx + 116] = resRe58_s;
        double resIm26_s = -eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out1024[idx + 117] = resIm58_s;
        out1024[idx + 141] = -resIm58_s;
        
        double oRe7 = out1024[idx + 142];
        double oIm7 = out1024[idx + 143];
        double eRe7 = out1024[idx + 14];
        double eIm7 = out1024[idx + 15];
        double tRe7 = 0x1.e212104f686e5p-1;
        double tRe25 = 0x1.58f9a75ab1fddp-2;
        double resIm7_s = eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out1024[idx + 15] = resIm7_s;
        out1024[idx + 243] = -resIm7_s;
        double resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe25);
        out1024[idx + 242] = resRe7_s;
        out1024[idx + 14] = resRe7_s;
        double resRe25_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe25);
        out1024[idx + 142] = resRe57_s;
        out1024[idx + 114] = resRe57_s;
        double resIm25_s = -eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out1024[idx + 115] = resIm57_s;
        out1024[idx + 143] = -resIm57_s;
        
        double oRe8 = out1024[idx + 144];
        double oIm8 = out1024[idx + 145];
        double eRe8 = out1024[idx + 16];
        double eIm8 = out1024[idx + 17];
        double tRe8 = 0x1.d906bcf328d46p-1;
        double tRe24 = 0x1.87de2a6aea964p-2;
        double resIm8_s = eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out1024[idx + 17] = resIm8_s;
        out1024[idx + 241] = -resIm8_s;
        double resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe24);
        out1024[idx + 240] = resRe8_s;
        out1024[idx + 16] = resRe8_s;
        double resRe24_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe24);
        out1024[idx + 144] = resRe56_s;
        out1024[idx + 112] = resRe56_s;
        double resIm24_s = -eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out1024[idx + 113] = resIm56_s;
        out1024[idx + 145] = -resIm56_s;
        
        double oRe9 = out1024[idx + 146];
        double oIm9 = out1024[idx + 147];
        double eRe9 = out1024[idx + 18];
        double eIm9 = out1024[idx + 19];
        double tRe9 = 0x1.ced7af43cc773p-1;
        double tRe23 = 0x1.b5d1009e15cc2p-2;
        double resIm9_s = eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out1024[idx + 19] = resIm9_s;
        out1024[idx + 239] = -resIm9_s;
        double resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe23);
        out1024[idx + 238] = resRe9_s;
        out1024[idx + 18] = resRe9_s;
        double resRe23_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe23);
        out1024[idx + 146] = resRe55_s;
        out1024[idx + 110] = resRe55_s;
        double resIm23_s = -eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out1024[idx + 111] = resIm55_s;
        out1024[idx + 147] = -resIm55_s;
        
        double oRe10 = out1024[idx + 148];
        double oIm10 = out1024[idx + 149];
        double eRe10 = out1024[idx + 20];
        double eIm10 = out1024[idx + 21];
        double tRe10 = 0x1.c38b2f180bdb1p-1;
        double tRe22 = 0x1.e2b5d3806f63ep-2;
        double resIm10_s = eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out1024[idx + 21] = resIm10_s;
        out1024[idx + 237] = -resIm10_s;
        double resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe22);
        out1024[idx + 236] = resRe10_s;
        out1024[idx + 20] = resRe10_s;
        double resRe22_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe22);
        out1024[idx + 148] = resRe54_s;
        out1024[idx + 108] = resRe54_s;
        double resIm22_s = -eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out1024[idx + 109] = resIm54_s;
        out1024[idx + 149] = -resIm54_s;
        
        double oRe11 = out1024[idx + 150];
        double oIm11 = out1024[idx + 151];
        double eRe11 = out1024[idx + 22];
        double eIm11 = out1024[idx + 23];
        double tRe11 = 0x1.b728345196e3ep-1;
        double tRe21 = 0x1.073879922ffeep-1;
        double resIm11_s = eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out1024[idx + 23] = resIm11_s;
        out1024[idx + 235] = -resIm11_s;
        double resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe21);
        out1024[idx + 234] = resRe11_s;
        out1024[idx + 22] = resRe11_s;
        double resRe21_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe21);
        out1024[idx + 150] = resRe53_s;
        out1024[idx + 106] = resRe53_s;
        double resIm21_s = -eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out1024[idx + 107] = resIm53_s;
        out1024[idx + 151] = -resIm53_s;
        
        double oRe12 = out1024[idx + 152];
        double oIm12 = out1024[idx + 153];
        double eRe12 = out1024[idx + 24];
        double eIm12 = out1024[idx + 25];
        double tRe12 = 0x1.a9b66290ea1a3p-1;
        double tRe20 = 0x1.1c73b39ae68c9p-1;
        double resIm12_s = eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out1024[idx + 25] = resIm12_s;
        out1024[idx + 233] = -resIm12_s;
        double resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe20);
        out1024[idx + 232] = resRe12_s;
        out1024[idx + 24] = resRe12_s;
        double resRe20_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe20);
        out1024[idx + 152] = resRe52_s;
        out1024[idx + 104] = resRe52_s;
        double resIm20_s = -eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out1024[idx + 105] = resIm52_s;
        out1024[idx + 153] = -resIm52_s;
        
        double oRe13 = out1024[idx + 154];
        double oIm13 = out1024[idx + 155];
        double eRe13 = out1024[idx + 26];
        double eIm13 = out1024[idx + 27];
        double tRe13 = 0x1.9b3e047f38741p-1;
        double tRe19 = 0x1.30ff7fce17036p-1;
        double resIm13_s = eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out1024[idx + 27] = resIm13_s;
        out1024[idx + 231] = -resIm13_s;
        double resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe19);
        out1024[idx + 230] = resRe13_s;
        out1024[idx + 26] = resRe13_s;
        double resRe19_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe19);
        out1024[idx + 154] = resRe51_s;
        out1024[idx + 102] = resRe51_s;
        double resIm19_s = -eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out1024[idx + 103] = resIm51_s;
        out1024[idx + 155] = -resIm51_s;
        
        double oRe14 = out1024[idx + 156];
        double oIm14 = out1024[idx + 157];
        double eRe14 = out1024[idx + 28];
        double eIm14 = out1024[idx + 29];
        double tRe14 = 0x1.8bc806b151741p-1;
        double tRe18 = 0x1.44cf325091dd7p-1;
        double resIm14_s = eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out1024[idx + 29] = resIm14_s;
        out1024[idx + 229] = -resIm14_s;
        double resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe18);
        out1024[idx + 228] = resRe14_s;
        out1024[idx + 28] = resRe14_s;
        double resRe18_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe18);
        out1024[idx + 156] = resRe50_s;
        out1024[idx + 100] = resRe50_s;
        double resIm18_s = -eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out1024[idx + 101] = resIm50_s;
        out1024[idx + 157] = -resIm50_s;
        
        double oRe15 = out1024[idx + 158];
        double oIm15 = out1024[idx + 159];
        double eRe15 = out1024[idx + 30];
        double eIm15 = out1024[idx + 31];
        double tRe15 = 0x1.7b5df226aafbp-1;
        double tRe17 = 0x1.57d69348cecap-1;
        double resIm15_s = eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out1024[idx + 31] = resIm15_s;
        out1024[idx + 227] = -resIm15_s;
        double resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe17);
        out1024[idx + 226] = resRe15_s;
        out1024[idx + 30] = resRe15_s;
        double resRe17_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe17);
        out1024[idx + 158] = resRe49_s;
        out1024[idx + 98] = resRe49_s;
        double resIm17_s = -eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out1024[idx + 99] = resIm49_s;
        out1024[idx + 159] = -resIm49_s;
        
        double oRe16 = out1024[idx + 160];
        double oIm16 = out1024[idx + 161];
        double eRe16 = out1024[idx + 32];
        double eIm16 = out1024[idx + 33];
        double tRe16 = 0x1.6a09e667f3bcdp-1;
        double resIm16_s = eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out1024[idx + 33] = resIm16_s;
        out1024[idx + 225] = -resIm16_s;
        double resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe16);
        out1024[idx + 224] = resRe16_s;
        out1024[idx + 32] = resRe16_s;
        double resRe16_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe16);
        out1024[idx + 160] = resRe48_s;
        out1024[idx + 96] = resRe48_s;
        double resIm16_s = -eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out1024[idx + 97] = resIm48_s;
        out1024[idx + 161] = -resIm48_s;
        
        double oRe17 = out1024[idx + 162];
        double oIm17 = out1024[idx + 163];
        double eRe17 = out1024[idx + 34];
        double eIm17 = out1024[idx + 35];
        double resIm17_s = eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out1024[idx + 35] = resIm17_s;
        out1024[idx + 223] = -resIm17_s;
        double resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe15);
        out1024[idx + 222] = resRe17_s;
        out1024[idx + 34] = resRe17_s;
        double resRe15_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe15);
        out1024[idx + 162] = resRe47_s;
        out1024[idx + 94] = resRe47_s;
        double resIm15_s = -eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out1024[idx + 95] = resIm47_s;
        out1024[idx + 163] = -resIm47_s;
        
        double oRe18 = out1024[idx + 164];
        double oIm18 = out1024[idx + 165];
        double eRe18 = out1024[idx + 36];
        double eIm18 = out1024[idx + 37];
        double resIm18_s = eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out1024[idx + 37] = resIm18_s;
        out1024[idx + 221] = -resIm18_s;
        double resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe14);
        out1024[idx + 220] = resRe18_s;
        out1024[idx + 36] = resRe18_s;
        double resRe14_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe14);
        out1024[idx + 164] = resRe46_s;
        out1024[idx + 92] = resRe46_s;
        double resIm14_s = -eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out1024[idx + 93] = resIm46_s;
        out1024[idx + 165] = -resIm46_s;
        
        double oRe19 = out1024[idx + 166];
        double oIm19 = out1024[idx + 167];
        double eRe19 = out1024[idx + 38];
        double eIm19 = out1024[idx + 39];
        double resIm19_s = eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out1024[idx + 39] = resIm19_s;
        out1024[idx + 219] = -resIm19_s;
        double resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe13);
        out1024[idx + 218] = resRe19_s;
        out1024[idx + 38] = resRe19_s;
        double resRe13_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe13);
        out1024[idx + 166] = resRe45_s;
        out1024[idx + 90] = resRe45_s;
        double resIm13_s = -eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out1024[idx + 91] = resIm45_s;
        out1024[idx + 167] = -resIm45_s;
        
        double oRe20 = out1024[idx + 168];
        double oIm20 = out1024[idx + 169];
        double eRe20 = out1024[idx + 40];
        double eIm20 = out1024[idx + 41];
        double resIm20_s = eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out1024[idx + 41] = resIm20_s;
        out1024[idx + 217] = -resIm20_s;
        double resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe12);
        out1024[idx + 216] = resRe20_s;
        out1024[idx + 40] = resRe20_s;
        double resRe12_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe12);
        out1024[idx + 168] = resRe44_s;
        out1024[idx + 88] = resRe44_s;
        double resIm12_s = -eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out1024[idx + 89] = resIm44_s;
        out1024[idx + 169] = -resIm44_s;
        
        double oRe21 = out1024[idx + 170];
        double oIm21 = out1024[idx + 171];
        double eRe21 = out1024[idx + 42];
        double eIm21 = out1024[idx + 43];
        double resIm21_s = eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out1024[idx + 43] = resIm21_s;
        out1024[idx + 215] = -resIm21_s;
        double resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe11);
        out1024[idx + 214] = resRe21_s;
        out1024[idx + 42] = resRe21_s;
        double resRe11_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe11);
        out1024[idx + 170] = resRe43_s;
        out1024[idx + 86] = resRe43_s;
        double resIm11_s = -eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out1024[idx + 87] = resIm43_s;
        out1024[idx + 171] = -resIm43_s;
        
        double oRe22 = out1024[idx + 172];
        double oIm22 = out1024[idx + 173];
        double eRe22 = out1024[idx + 44];
        double eIm22 = out1024[idx + 45];
        double resIm22_s = eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out1024[idx + 45] = resIm22_s;
        out1024[idx + 213] = -resIm22_s;
        double resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe10);
        out1024[idx + 212] = resRe22_s;
        out1024[idx + 44] = resRe22_s;
        double resRe10_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe10);
        out1024[idx + 172] = resRe42_s;
        out1024[idx + 84] = resRe42_s;
        double resIm10_s = -eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out1024[idx + 85] = resIm42_s;
        out1024[idx + 173] = -resIm42_s;
        
        double oRe23 = out1024[idx + 174];
        double oIm23 = out1024[idx + 175];
        double eRe23 = out1024[idx + 46];
        double eIm23 = out1024[idx + 47];
        double resIm23_s = eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out1024[idx + 47] = resIm23_s;
        out1024[idx + 211] = -resIm23_s;
        double resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe9);
        out1024[idx + 210] = resRe23_s;
        out1024[idx + 46] = resRe23_s;
        double resRe9_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe9);
        out1024[idx + 174] = resRe41_s;
        out1024[idx + 82] = resRe41_s;
        double resIm9_s = -eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out1024[idx + 83] = resIm41_s;
        out1024[idx + 175] = -resIm41_s;
        
        double oRe24 = out1024[idx + 176];
        double oIm24 = out1024[idx + 177];
        double eRe24 = out1024[idx + 48];
        double eIm24 = out1024[idx + 49];
        double resIm24_s = eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out1024[idx + 49] = resIm24_s;
        out1024[idx + 209] = -resIm24_s;
        double resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe8);
        out1024[idx + 208] = resRe24_s;
        out1024[idx + 48] = resRe24_s;
        double resRe8_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe8);
        out1024[idx + 176] = resRe40_s;
        out1024[idx + 80] = resRe40_s;
        double resIm8_s = -eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out1024[idx + 81] = resIm40_s;
        out1024[idx + 177] = -resIm40_s;
        
        double oRe25 = out1024[idx + 178];
        double oIm25 = out1024[idx + 179];
        double eRe25 = out1024[idx + 50];
        double eIm25 = out1024[idx + 51];
        double resIm25_s = eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out1024[idx + 51] = resIm25_s;
        out1024[idx + 207] = -resIm25_s;
        double resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe7);
        out1024[idx + 206] = resRe25_s;
        out1024[idx + 50] = resRe25_s;
        double resRe7_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe7);
        out1024[idx + 178] = resRe39_s;
        out1024[idx + 78] = resRe39_s;
        double resIm7_s = -eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out1024[idx + 79] = resIm39_s;
        out1024[idx + 179] = -resIm39_s;
        
        double oRe26 = out1024[idx + 180];
        double oIm26 = out1024[idx + 181];
        double eRe26 = out1024[idx + 52];
        double eIm26 = out1024[idx + 53];
        double resIm26_s = eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out1024[idx + 53] = resIm26_s;
        out1024[idx + 205] = -resIm26_s;
        double resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe6);
        out1024[idx + 204] = resRe26_s;
        out1024[idx + 52] = resRe26_s;
        double resRe6_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe6);
        out1024[idx + 180] = resRe38_s;
        out1024[idx + 76] = resRe38_s;
        double resIm6_s = -eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out1024[idx + 77] = resIm38_s;
        out1024[idx + 181] = -resIm38_s;
        
        double oRe27 = out1024[idx + 182];
        double oIm27 = out1024[idx + 183];
        double eRe27 = out1024[idx + 54];
        double eIm27 = out1024[idx + 55];
        double resIm27_s = eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out1024[idx + 55] = resIm27_s;
        out1024[idx + 203] = -resIm27_s;
        double resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe5);
        out1024[idx + 202] = resRe27_s;
        out1024[idx + 54] = resRe27_s;
        double resRe5_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe5);
        out1024[idx + 182] = resRe37_s;
        out1024[idx + 74] = resRe37_s;
        double resIm5_s = -eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out1024[idx + 75] = resIm37_s;
        out1024[idx + 183] = -resIm37_s;
        
        double oRe28 = out1024[idx + 184];
        double oIm28 = out1024[idx + 185];
        double eRe28 = out1024[idx + 56];
        double eIm28 = out1024[idx + 57];
        double resIm28_s = eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out1024[idx + 57] = resIm28_s;
        out1024[idx + 201] = -resIm28_s;
        double resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe4);
        out1024[idx + 200] = resRe28_s;
        out1024[idx + 56] = resRe28_s;
        double resRe4_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe4);
        out1024[idx + 184] = resRe36_s;
        out1024[idx + 72] = resRe36_s;
        double resIm4_s = -eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out1024[idx + 73] = resIm36_s;
        out1024[idx + 185] = -resIm36_s;
        
        double oRe29 = out1024[idx + 186];
        double oIm29 = out1024[idx + 187];
        double eRe29 = out1024[idx + 58];
        double eIm29 = out1024[idx + 59];
        double resIm29_s = eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out1024[idx + 59] = resIm29_s;
        out1024[idx + 199] = -resIm29_s;
        double resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe3);
        out1024[idx + 198] = resRe29_s;
        out1024[idx + 58] = resRe29_s;
        double resRe3_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe3);
        out1024[idx + 186] = resRe35_s;
        out1024[idx + 70] = resRe35_s;
        double resIm3_s = -eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out1024[idx + 71] = resIm35_s;
        out1024[idx + 187] = -resIm35_s;
        
        double oRe30 = out1024[idx + 188];
        double oIm30 = out1024[idx + 189];
        double eRe30 = out1024[idx + 60];
        double eIm30 = out1024[idx + 61];
        double resIm30_s = eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out1024[idx + 61] = resIm30_s;
        out1024[idx + 197] = -resIm30_s;
        double resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe2);
        out1024[idx + 196] = resRe30_s;
        out1024[idx + 60] = resRe30_s;
        double resRe2_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe2);
        out1024[idx + 188] = resRe34_s;
        out1024[idx + 68] = resRe34_s;
        double resIm2_s = -eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out1024[idx + 69] = resIm34_s;
        out1024[idx + 189] = -resIm34_s;
        
        double oRe31 = out1024[idx + 190];
        double oIm31 = out1024[idx + 191];
        double eRe31 = out1024[idx + 62];
        double eIm31 = out1024[idx + 63];
        double resIm31_s = eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out1024[idx + 63] = resIm31_s;
        out1024[idx + 195] = -resIm31_s;
        double resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe1);
        out1024[idx + 194] = resRe31_s;
        out1024[idx + 62] = resRe31_s;
        double resRe1_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe1);
        out1024[idx + 190] = resRe33_s;
        out1024[idx + 66] = resRe33_s;
        double resIm1_s = -eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out1024[idx + 67] = resIm33_s;
        out1024[idx + 191] = -resIm33_s;
        
        double oRe32 = out1024[idx + 192];
        double oIm32 = out1024[idx + 193];
        double eRe32 = out1024[idx + 64];
        double eIm32 = out1024[idx + 65];
        double resIm32_s = eIm32 + oRe32;
        out1024[idx + 65] = resIm32_s;
        out1024[idx + 193] = -resIm32_s;
        double resRe32_s = eRe32 - oIm32;
        out1024[idx + 192] = resRe32_s;
        out1024[idx + 64] = resRe32_s;    
    } 


    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // FFT step for SIZE 256
    ////////////////////////////////////////////////
    for(int idx = 0; idx < 2048; idx += 512){ 
        double oRe0 = out1024[idx + 256];
        double oIm0 = out1024[idx + 257];
        double eRe0 = out1024[idx + 0];
        double eIm0 = out1024[idx + 1];
        double resRe0_s = eRe0 + oRe0;
        out1024[idx] = resRe0_s;
        double resIm0_s = eIm0 + oIm0;
        out1024[idx + 1] = resRe0_s;
        double resRe0_d = eRe0 - oRe0;
        out1024[idx + 256] = resRe0_d;
        double resIm0_d = eIm0 - oIm0;
        out1024[idx + 257] = resIm0_d;
        
        double oRe1 = out1024[idx + 258];
        double oIm1 = out1024[idx + 259];
        double eRe1 = out1024[idx + 2];
        double eIm1 = out1024[idx + 3];
        double tRe1 = 0x1.ffd886084cd0dp-1;
        double tRe63 = 0x1.92155f7a36678p-6;
        double resIm1_s = eIm1 + (oRe1 * tRe63 + oIm1 * tRe1);
        out1024[idx + 3] = resIm1_s;
        out1024[idx + 511] = -resIm1_s;
        double resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe63);
        out1024[idx + 510] = resRe1_s;
        out1024[idx + 2] = resRe1_s;
        double resRe63_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe63);
        out1024[idx + 258] = resRe127_s;
        out1024[idx + 254] = resRe127_s;
        double resIm63_s = -eIm1 + (oRe1 * tRe63 + oIm1 * tRe1);
        out1024[idx + 255] = resIm127_s;
        out1024[idx + 259] = -resIm127_s;
        
        double oRe2 = out1024[idx + 260];
        double oIm2 = out1024[idx + 261];
        double eRe2 = out1024[idx + 4];
        double eIm2 = out1024[idx + 5];
        double tRe2 = 0x1.ff621e3796d7ep-1;
        double tRe62 = 0x1.91f65f10dd825p-5;
        double resIm2_s = eIm2 + (oRe2 * tRe62 + oIm2 * tRe2);
        out1024[idx + 5] = resIm2_s;
        out1024[idx + 509] = -resIm2_s;
        double resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe62);
        out1024[idx + 508] = resRe2_s;
        out1024[idx + 4] = resRe2_s;
        double resRe62_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe62);
        out1024[idx + 260] = resRe126_s;
        out1024[idx + 252] = resRe126_s;
        double resIm62_s = -eIm2 + (oRe2 * tRe62 + oIm2 * tRe2);
        out1024[idx + 253] = resIm126_s;
        out1024[idx + 261] = -resIm126_s;
        
        double oRe3 = out1024[idx + 262];
        double oIm3 = out1024[idx + 263];
        double eRe3 = out1024[idx + 6];
        double eIm3 = out1024[idx + 7];
        double tRe3 = 0x1.fe9cdad01883ap-1;
        double tRe61 = 0x1.2d52092ce19f8p-4;
        double resIm3_s = eIm3 + (oRe3 * tRe61 + oIm3 * tRe3);
        out1024[idx + 7] = resIm3_s;
        out1024[idx + 507] = -resIm3_s;
        double resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe61);
        out1024[idx + 506] = resRe3_s;
        out1024[idx + 6] = resRe3_s;
        double resRe61_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe61);
        out1024[idx + 262] = resRe125_s;
        out1024[idx + 250] = resRe125_s;
        double resIm61_s = -eIm3 + (oRe3 * tRe61 + oIm3 * tRe3);
        out1024[idx + 251] = resIm125_s;
        out1024[idx + 263] = -resIm125_s;
        
        double oRe4 = out1024[idx + 264];
        double oIm4 = out1024[idx + 265];
        double eRe4 = out1024[idx + 8];
        double eIm4 = out1024[idx + 9];
        double tRe4 = 0x1.fd88da3d12526p-1;
        double tRe60 = 0x1.917a6bc29b438p-4;
        double resIm4_s = eIm4 + (oRe4 * tRe60 + oIm4 * tRe4);
        out1024[idx + 9] = resIm4_s;
        out1024[idx + 505] = -resIm4_s;
        double resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe60);
        out1024[idx + 504] = resRe4_s;
        out1024[idx + 8] = resRe4_s;
        double resRe60_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe60);
        out1024[idx + 264] = resRe124_s;
        out1024[idx + 248] = resRe124_s;
        double resIm60_s = -eIm4 + (oRe4 * tRe60 + oIm4 * tRe4);
        out1024[idx + 249] = resIm124_s;
        out1024[idx + 265] = -resIm124_s;
        
        double oRe5 = out1024[idx + 266];
        double oIm5 = out1024[idx + 267];
        double eRe5 = out1024[idx + 10];
        double eIm5 = out1024[idx + 11];
        double tRe5 = 0x1.fc26470e19fd3p-1;
        double tRe59 = 0x1.f564e56a97314p-4;
        double resIm5_s = eIm5 + (oRe5 * tRe59 + oIm5 * tRe5);
        out1024[idx + 11] = resIm5_s;
        out1024[idx + 503] = -resIm5_s;
        double resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe59);
        out1024[idx + 502] = resRe5_s;
        out1024[idx + 10] = resRe5_s;
        double resRe59_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe59);
        out1024[idx + 266] = resRe123_s;
        out1024[idx + 246] = resRe123_s;
        double resIm59_s = -eIm5 + (oRe5 * tRe59 + oIm5 * tRe5);
        out1024[idx + 247] = resIm123_s;
        out1024[idx + 267] = -resIm123_s;
        
        double oRe6 = out1024[idx + 268];
        double oIm6 = out1024[idx + 269];
        double eRe6 = out1024[idx + 12];
        double eIm6 = out1024[idx + 13];
        double tRe6 = 0x1.fa7557f08a517p-1;
        double tRe58 = 0x1.2c8106e8e613ap-3;
        double resIm6_s = eIm6 + (oRe6 * tRe58 + oIm6 * tRe6);
        out1024[idx + 13] = resIm6_s;
        out1024[idx + 501] = -resIm6_s;
        double resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe58);
        out1024[idx + 500] = resRe6_s;
        out1024[idx + 12] = resRe6_s;
        double resRe58_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe58);
        out1024[idx + 268] = resRe122_s;
        out1024[idx + 244] = resRe122_s;
        double resIm58_s = -eIm6 + (oRe6 * tRe58 + oIm6 * tRe6);
        out1024[idx + 245] = resIm122_s;
        out1024[idx + 269] = -resIm122_s;
        
        double oRe7 = out1024[idx + 270];
        double oIm7 = out1024[idx + 271];
        double eRe7 = out1024[idx + 14];
        double eIm7 = out1024[idx + 15];
        double tRe7 = 0x1.f8764fa714ba9p-1;
        double tRe57 = 0x1.5e214448b3fcbp-3;
        double resIm7_s = eIm7 + (oRe7 * tRe57 + oIm7 * tRe7);
        out1024[idx + 15] = resIm7_s;
        out1024[idx + 499] = -resIm7_s;
        double resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe57);
        out1024[idx + 498] = resRe7_s;
        out1024[idx + 14] = resRe7_s;
        double resRe57_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe57);
        out1024[idx + 270] = resRe121_s;
        out1024[idx + 242] = resRe121_s;
        double resIm57_s = -eIm7 + (oRe7 * tRe57 + oIm7 * tRe7);
        out1024[idx + 243] = resIm121_s;
        out1024[idx + 271] = -resIm121_s;
        
        double oRe8 = out1024[idx + 272];
        double oIm8 = out1024[idx + 273];
        double eRe8 = out1024[idx + 16];
        double eIm8 = out1024[idx + 17];
        double tRe8 = 0x1.f6297cff75cbp-1;
        double tRe56 = 0x1.8f8b83c69a60cp-3;
        double resIm8_s = eIm8 + (oRe8 * tRe56 + oIm8 * tRe8);
        out1024[idx + 17] = resIm8_s;
        out1024[idx + 497] = -resIm8_s;
        double resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe56);
        out1024[idx + 496] = resRe8_s;
        out1024[idx + 16] = resRe8_s;
        double resRe56_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe56);
        out1024[idx + 272] = resRe120_s;
        out1024[idx + 240] = resRe120_s;
        double resIm56_s = -eIm8 + (oRe8 * tRe56 + oIm8 * tRe8);
        out1024[idx + 241] = resIm120_s;
        out1024[idx + 273] = -resIm120_s;
        
        double oRe9 = out1024[idx + 274];
        double oIm9 = out1024[idx + 275];
        double eRe9 = out1024[idx + 18];
        double eIm9 = out1024[idx + 19];
        double tRe9 = 0x1.f38f3ac64e589p-1;
        double tRe55 = 0x1.c0b826a7e4f62p-3;
        double resIm9_s = eIm9 + (oRe9 * tRe55 + oIm9 * tRe9);
        out1024[idx + 19] = resIm9_s;
        out1024[idx + 495] = -resIm9_s;
        double resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe55);
        out1024[idx + 494] = resRe9_s;
        out1024[idx + 18] = resRe9_s;
        double resRe55_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe55);
        out1024[idx + 274] = resRe119_s;
        out1024[idx + 238] = resRe119_s;
        double resIm55_s = -eIm9 + (oRe9 * tRe55 + oIm9 * tRe9);
        out1024[idx + 239] = resIm119_s;
        out1024[idx + 275] = -resIm119_s;
        
        double oRe10 = out1024[idx + 276];
        double oIm10 = out1024[idx + 277];
        double eRe10 = out1024[idx + 20];
        double eIm10 = out1024[idx + 21];
        double tRe10 = 0x1.f0a7efb9230d7p-1;
        double tRe54 = 0x1.f19f97b215f1ep-3;
        double resIm10_s = eIm10 + (oRe10 * tRe54 + oIm10 * tRe10);
        out1024[idx + 21] = resIm10_s;
        out1024[idx + 493] = -resIm10_s;
        double resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe54);
        out1024[idx + 492] = resRe10_s;
        out1024[idx + 20] = resRe10_s;
        double resRe54_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe54);
        out1024[idx + 276] = resRe118_s;
        out1024[idx + 236] = resRe118_s;
        double resIm54_s = -eIm10 + (oRe10 * tRe54 + oIm10 * tRe10);
        out1024[idx + 237] = resIm118_s;
        out1024[idx + 277] = -resIm118_s;
        
        double oRe11 = out1024[idx + 278];
        double oIm11 = out1024[idx + 279];
        double eRe11 = out1024[idx + 22];
        double eIm11 = out1024[idx + 23];
        double tRe11 = 0x1.ed740e7684963p-1;
        double tRe53 = 0x1.111d262b1f678p-2;
        double resIm11_s = eIm11 + (oRe11 * tRe53 + oIm11 * tRe11);
        out1024[idx + 23] = resIm11_s;
        out1024[idx + 491] = -resIm11_s;
        double resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe53);
        out1024[idx + 490] = resRe11_s;
        out1024[idx + 22] = resRe11_s;
        double resRe53_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe53);
        out1024[idx + 278] = resRe117_s;
        out1024[idx + 234] = resRe117_s;
        double resIm53_s = -eIm11 + (oRe11 * tRe53 + oIm11 * tRe11);
        out1024[idx + 235] = resIm117_s;
        out1024[idx + 279] = -resIm117_s;
        
        double oRe12 = out1024[idx + 280];
        double oIm12 = out1024[idx + 281];
        double eRe12 = out1024[idx + 24];
        double eIm12 = out1024[idx + 25];
        double tRe12 = 0x1.e9f4156c62ddap-1;
        double tRe52 = 0x1.294062ed59f04p-2;
        double resIm12_s = eIm12 + (oRe12 * tRe52 + oIm12 * tRe12);
        out1024[idx + 25] = resIm12_s;
        out1024[idx + 489] = -resIm12_s;
        double resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe52);
        out1024[idx + 488] = resRe12_s;
        out1024[idx + 24] = resRe12_s;
        double resRe52_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe52);
        out1024[idx + 280] = resRe116_s;
        out1024[idx + 232] = resRe116_s;
        double resIm52_s = -eIm12 + (oRe12 * tRe52 + oIm12 * tRe12);
        out1024[idx + 233] = resIm116_s;
        out1024[idx + 281] = -resIm116_s;
        
        double oRe13 = out1024[idx + 282];
        double oIm13 = out1024[idx + 283];
        double eRe13 = out1024[idx + 26];
        double eIm13 = out1024[idx + 27];
        double tRe13 = 0x1.e6288ec48e112p-1;
        double tRe51 = 0x1.4135c94176602p-2;
        double resIm13_s = eIm13 + (oRe13 * tRe51 + oIm13 * tRe13);
        out1024[idx + 27] = resIm13_s;
        out1024[idx + 487] = -resIm13_s;
        double resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe51);
        out1024[idx + 486] = resRe13_s;
        out1024[idx + 26] = resRe13_s;
        double resRe51_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe51);
        out1024[idx + 282] = resRe115_s;
        out1024[idx + 230] = resRe115_s;
        double resIm51_s = -eIm13 + (oRe13 * tRe51 + oIm13 * tRe13);
        out1024[idx + 231] = resIm115_s;
        out1024[idx + 283] = -resIm115_s;
        
        double oRe14 = out1024[idx + 284];
        double oIm14 = out1024[idx + 285];
        double eRe14 = out1024[idx + 28];
        double eIm14 = out1024[idx + 29];
        double tRe14 = 0x1.e212104f686e5p-1;
        double tRe50 = 0x1.58f9a75ab1fddp-2;
        double resIm14_s = eIm14 + (oRe14 * tRe50 + oIm14 * tRe14);
        out1024[idx + 29] = resIm14_s;
        out1024[idx + 485] = -resIm14_s;
        double resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe50);
        out1024[idx + 484] = resRe14_s;
        out1024[idx + 28] = resRe14_s;
        double resRe50_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe50);
        out1024[idx + 284] = resRe114_s;
        out1024[idx + 228] = resRe114_s;
        double resIm50_s = -eIm14 + (oRe14 * tRe50 + oIm14 * tRe14);
        out1024[idx + 229] = resIm114_s;
        out1024[idx + 285] = -resIm114_s;
        
        double oRe15 = out1024[idx + 286];
        double oIm15 = out1024[idx + 287];
        double eRe15 = out1024[idx + 30];
        double eIm15 = out1024[idx + 31];
        double tRe15 = 0x1.ddb13b6ccc23dp-1;
        double tRe49 = 0x1.7088530fa45a1p-2;
        double resIm15_s = eIm15 + (oRe15 * tRe49 + oIm15 * tRe15);
        out1024[idx + 31] = resIm15_s;
        out1024[idx + 483] = -resIm15_s;
        double resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe49);
        out1024[idx + 482] = resRe15_s;
        out1024[idx + 30] = resRe15_s;
        double resRe49_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe49);
        out1024[idx + 286] = resRe113_s;
        out1024[idx + 226] = resRe113_s;
        double resIm49_s = -eIm15 + (oRe15 * tRe49 + oIm15 * tRe15);
        out1024[idx + 227] = resIm113_s;
        out1024[idx + 287] = -resIm113_s;
        
        double oRe16 = out1024[idx + 288];
        double oIm16 = out1024[idx + 289];
        double eRe16 = out1024[idx + 32];
        double eIm16 = out1024[idx + 33];
        double tRe16 = 0x1.d906bcf328d46p-1;
        double tRe48 = 0x1.87de2a6aea964p-2;
        double resIm16_s = eIm16 + (oRe16 * tRe48 + oIm16 * tRe16);
        out1024[idx + 33] = resIm16_s;
        out1024[idx + 481] = -resIm16_s;
        double resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe48);
        out1024[idx + 480] = resRe16_s;
        out1024[idx + 32] = resRe16_s;
        double resRe48_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe48);
        out1024[idx + 288] = resRe112_s;
        out1024[idx + 224] = resRe112_s;
        double resIm48_s = -eIm16 + (oRe16 * tRe48 + oIm16 * tRe16);
        out1024[idx + 225] = resIm112_s;
        out1024[idx + 289] = -resIm112_s;
        
        double oRe17 = out1024[idx + 290];
        double oIm17 = out1024[idx + 291];
        double eRe17 = out1024[idx + 34];
        double eIm17 = out1024[idx + 35];
        double tRe17 = 0x1.d4134d14dc93ap-1;
        double tRe47 = 0x1.9ef7943a8ed89p-2;
        double resIm17_s = eIm17 + (oRe17 * tRe47 + oIm17 * tRe17);
        out1024[idx + 35] = resIm17_s;
        out1024[idx + 479] = -resIm17_s;
        double resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe47);
        out1024[idx + 478] = resRe17_s;
        out1024[idx + 34] = resRe17_s;
        double resRe47_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe47);
        out1024[idx + 290] = resRe111_s;
        out1024[idx + 222] = resRe111_s;
        double resIm47_s = -eIm17 + (oRe17 * tRe47 + oIm17 * tRe17);
        out1024[idx + 223] = resIm111_s;
        out1024[idx + 291] = -resIm111_s;
        
        double oRe18 = out1024[idx + 292];
        double oIm18 = out1024[idx + 293];
        double eRe18 = out1024[idx + 36];
        double eIm18 = out1024[idx + 37];
        double tRe18 = 0x1.ced7af43cc773p-1;
        double tRe46 = 0x1.b5d1009e15cc2p-2;
        double resIm18_s = eIm18 + (oRe18 * tRe46 + oIm18 * tRe18);
        out1024[idx + 37] = resIm18_s;
        out1024[idx + 477] = -resIm18_s;
        double resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe46);
        out1024[idx + 476] = resRe18_s;
        out1024[idx + 36] = resRe18_s;
        double resRe46_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe46);
        out1024[idx + 292] = resRe110_s;
        out1024[idx + 220] = resRe110_s;
        double resIm46_s = -eIm18 + (oRe18 * tRe46 + oIm18 * tRe18);
        out1024[idx + 221] = resIm110_s;
        out1024[idx + 293] = -resIm110_s;
        
        double oRe19 = out1024[idx + 294];
        double oIm19 = out1024[idx + 295];
        double eRe19 = out1024[idx + 38];
        double eIm19 = out1024[idx + 39];
        double tRe19 = 0x1.c954b213411f5p-1;
        double tRe45 = 0x1.cc66e9931c45ep-2;
        double resIm19_s = eIm19 + (oRe19 * tRe45 + oIm19 * tRe19);
        out1024[idx + 39] = resIm19_s;
        out1024[idx + 475] = -resIm19_s;
        double resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe45);
        out1024[idx + 474] = resRe19_s;
        out1024[idx + 38] = resRe19_s;
        double resRe45_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe45);
        out1024[idx + 294] = resRe109_s;
        out1024[idx + 218] = resRe109_s;
        double resIm45_s = -eIm19 + (oRe19 * tRe45 + oIm19 * tRe19);
        out1024[idx + 219] = resIm109_s;
        out1024[idx + 295] = -resIm109_s;
        
        double oRe20 = out1024[idx + 296];
        double oIm20 = out1024[idx + 297];
        double eRe20 = out1024[idx + 40];
        double eIm20 = out1024[idx + 41];
        double tRe20 = 0x1.c38b2f180bdb1p-1;
        double tRe44 = 0x1.e2b5d3806f63ep-2;
        double resIm20_s = eIm20 + (oRe20 * tRe44 + oIm20 * tRe20);
        out1024[idx + 41] = resIm20_s;
        out1024[idx + 473] = -resIm20_s;
        double resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe44);
        out1024[idx + 472] = resRe20_s;
        out1024[idx + 40] = resRe20_s;
        double resRe44_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe44);
        out1024[idx + 296] = resRe108_s;
        out1024[idx + 216] = resRe108_s;
        double resIm44_s = -eIm20 + (oRe20 * tRe44 + oIm20 * tRe20);
        out1024[idx + 217] = resIm108_s;
        out1024[idx + 297] = -resIm108_s;
        
        double oRe21 = out1024[idx + 298];
        double oIm21 = out1024[idx + 299];
        double eRe21 = out1024[idx + 42];
        double eIm21 = out1024[idx + 43];
        double tRe21 = 0x1.bd7c0ac6f952ap-1;
        double tRe43 = 0x1.f8ba4dbf89abcp-2;
        double resIm21_s = eIm21 + (oRe21 * tRe43 + oIm21 * tRe21);
        out1024[idx + 43] = resIm21_s;
        out1024[idx + 471] = -resIm21_s;
        double resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe43);
        out1024[idx + 470] = resRe21_s;
        out1024[idx + 42] = resRe21_s;
        double resRe43_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe43);
        out1024[idx + 298] = resRe107_s;
        out1024[idx + 214] = resRe107_s;
        double resIm43_s = -eIm21 + (oRe21 * tRe43 + oIm21 * tRe21);
        out1024[idx + 215] = resIm107_s;
        out1024[idx + 299] = -resIm107_s;
        
        double oRe22 = out1024[idx + 300];
        double oIm22 = out1024[idx + 301];
        double eRe22 = out1024[idx + 44];
        double eIm22 = out1024[idx + 45];
        double tRe22 = 0x1.b728345196e3ep-1;
        double tRe42 = 0x1.073879922ffeep-1;
        double resIm22_s = eIm22 + (oRe22 * tRe42 + oIm22 * tRe22);
        out1024[idx + 45] = resIm22_s;
        out1024[idx + 469] = -resIm22_s;
        double resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe42);
        out1024[idx + 468] = resRe22_s;
        out1024[idx + 44] = resRe22_s;
        double resRe42_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe42);
        out1024[idx + 300] = resRe106_s;
        out1024[idx + 212] = resRe106_s;
        double resIm42_s = -eIm22 + (oRe22 * tRe42 + oIm22 * tRe22);
        out1024[idx + 213] = resIm106_s;
        out1024[idx + 301] = -resIm106_s;
        
        double oRe23 = out1024[idx + 302];
        double oIm23 = out1024[idx + 303];
        double eRe23 = out1024[idx + 46];
        double eIm23 = out1024[idx + 47];
        double tRe23 = 0x1.b090a581502p-1;
        double tRe41 = 0x1.11eb3541b4b24p-1;
        double resIm23_s = eIm23 + (oRe23 * tRe41 + oIm23 * tRe23);
        out1024[idx + 47] = resIm23_s;
        out1024[idx + 467] = -resIm23_s;
        double resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe41);
        out1024[idx + 466] = resRe23_s;
        out1024[idx + 46] = resRe23_s;
        double resRe41_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe41);
        out1024[idx + 302] = resRe105_s;
        out1024[idx + 210] = resRe105_s;
        double resIm41_s = -eIm23 + (oRe23 * tRe41 + oIm23 * tRe23);
        out1024[idx + 211] = resIm105_s;
        out1024[idx + 303] = -resIm105_s;
        
        double oRe24 = out1024[idx + 304];
        double oIm24 = out1024[idx + 305];
        double eRe24 = out1024[idx + 48];
        double eIm24 = out1024[idx + 49];
        double tRe24 = 0x1.a9b66290ea1a3p-1;
        double tRe40 = 0x1.1c73b39ae68c9p-1;
        double resIm24_s = eIm24 + (oRe24 * tRe40 + oIm24 * tRe24);
        out1024[idx + 49] = resIm24_s;
        out1024[idx + 465] = -resIm24_s;
        double resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe40);
        out1024[idx + 464] = resRe24_s;
        out1024[idx + 48] = resRe24_s;
        double resRe40_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe40);
        out1024[idx + 304] = resRe104_s;
        out1024[idx + 208] = resRe104_s;
        double resIm40_s = -eIm24 + (oRe24 * tRe40 + oIm24 * tRe24);
        out1024[idx + 209] = resIm104_s;
        out1024[idx + 305] = -resIm104_s;
        
        double oRe25 = out1024[idx + 306];
        double oIm25 = out1024[idx + 307];
        double eRe25 = out1024[idx + 50];
        double eIm25 = out1024[idx + 51];
        double tRe25 = 0x1.a29a7a0462782p-1;
        double tRe39 = 0x1.26d054cdd12ep-1;
        double resIm25_s = eIm25 + (oRe25 * tRe39 + oIm25 * tRe25);
        out1024[idx + 51] = resIm25_s;
        out1024[idx + 463] = -resIm25_s;
        double resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe39);
        out1024[idx + 462] = resRe25_s;
        out1024[idx + 50] = resRe25_s;
        double resRe39_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe39);
        out1024[idx + 306] = resRe103_s;
        out1024[idx + 206] = resRe103_s;
        double resIm39_s = -eIm25 + (oRe25 * tRe39 + oIm25 * tRe25);
        out1024[idx + 207] = resIm103_s;
        out1024[idx + 307] = -resIm103_s;
        
        double oRe26 = out1024[idx + 308];
        double oIm26 = out1024[idx + 309];
        double eRe26 = out1024[idx + 52];
        double eIm26 = out1024[idx + 53];
        double tRe26 = 0x1.9b3e047f38741p-1;
        double tRe38 = 0x1.30ff7fce17036p-1;
        double resIm26_s = eIm26 + (oRe26 * tRe38 + oIm26 * tRe26);
        out1024[idx + 53] = resIm26_s;
        out1024[idx + 461] = -resIm26_s;
        double resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe38);
        out1024[idx + 460] = resRe26_s;
        out1024[idx + 52] = resRe26_s;
        double resRe38_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe38);
        out1024[idx + 308] = resRe102_s;
        out1024[idx + 204] = resRe102_s;
        double resIm38_s = -eIm26 + (oRe26 * tRe38 + oIm26 * tRe26);
        out1024[idx + 205] = resIm102_s;
        out1024[idx + 309] = -resIm102_s;
        
        double oRe27 = out1024[idx + 310];
        double oIm27 = out1024[idx + 311];
        double eRe27 = out1024[idx + 54];
        double eIm27 = out1024[idx + 55];
        double tRe27 = 0x1.93a22499263fcp-1;
        double tRe37 = 0x1.3affa292050bap-1;
        double resIm27_s = eIm27 + (oRe27 * tRe37 + oIm27 * tRe27);
        out1024[idx + 55] = resIm27_s;
        out1024[idx + 459] = -resIm27_s;
        double resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe37);
        out1024[idx + 458] = resRe27_s;
        out1024[idx + 54] = resRe27_s;
        double resRe37_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe37);
        out1024[idx + 310] = resRe101_s;
        out1024[idx + 202] = resRe101_s;
        double resIm37_s = -eIm27 + (oRe27 * tRe37 + oIm27 * tRe27);
        out1024[idx + 203] = resIm101_s;
        out1024[idx + 311] = -resIm101_s;
        
        double oRe28 = out1024[idx + 312];
        double oIm28 = out1024[idx + 313];
        double eRe28 = out1024[idx + 56];
        double eIm28 = out1024[idx + 57];
        double tRe28 = 0x1.8bc806b151741p-1;
        double tRe36 = 0x1.44cf325091dd7p-1;
        double resIm28_s = eIm28 + (oRe28 * tRe36 + oIm28 * tRe28);
        out1024[idx + 57] = resIm28_s;
        out1024[idx + 457] = -resIm28_s;
        double resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe36);
        out1024[idx + 456] = resRe28_s;
        out1024[idx + 56] = resRe28_s;
        double resRe36_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe36);
        out1024[idx + 312] = resRe100_s;
        out1024[idx + 200] = resRe100_s;
        double resIm36_s = -eIm28 + (oRe28 * tRe36 + oIm28 * tRe28);
        out1024[idx + 201] = resIm100_s;
        out1024[idx + 313] = -resIm100_s;
        
        double oRe29 = out1024[idx + 314];
        double oIm29 = out1024[idx + 315];
        double eRe29 = out1024[idx + 58];
        double eIm29 = out1024[idx + 59];
        double tRe29 = 0x1.83b0e0bff976ep-1;
        double tRe35 = 0x1.4e6cabbe3e5eap-1;
        double resIm29_s = eIm29 + (oRe29 * tRe35 + oIm29 * tRe29);
        out1024[idx + 59] = resIm29_s;
        out1024[idx + 455] = -resIm29_s;
        double resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe35);
        out1024[idx + 454] = resRe29_s;
        out1024[idx + 58] = resRe29_s;
        double resRe35_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe35);
        out1024[idx + 314] = resRe99_s;
        out1024[idx + 198] = resRe99_s;
        double resIm35_s = -eIm29 + (oRe29 * tRe35 + oIm29 * tRe29);
        out1024[idx + 199] = resIm99_s;
        out1024[idx + 315] = -resIm99_s;
        
        double oRe30 = out1024[idx + 316];
        double oIm30 = out1024[idx + 317];
        double eRe30 = out1024[idx + 60];
        double eIm30 = out1024[idx + 61];
        double tRe30 = 0x1.7b5df226aafbp-1;
        double tRe34 = 0x1.57d69348cecap-1;
        double resIm30_s = eIm30 + (oRe30 * tRe34 + oIm30 * tRe30);
        out1024[idx + 61] = resIm30_s;
        out1024[idx + 453] = -resIm30_s;
        double resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe34);
        out1024[idx + 452] = resRe30_s;
        out1024[idx + 60] = resRe30_s;
        double resRe34_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe34);
        out1024[idx + 316] = resRe98_s;
        out1024[idx + 196] = resRe98_s;
        double resIm34_s = -eIm30 + (oRe30 * tRe34 + oIm30 * tRe30);
        out1024[idx + 197] = resIm98_s;
        out1024[idx + 317] = -resIm98_s;
        
        double oRe31 = out1024[idx + 318];
        double oIm31 = out1024[idx + 319];
        double eRe31 = out1024[idx + 62];
        double eIm31 = out1024[idx + 63];
        double tRe31 = 0x1.72d0837efff97p-1;
        double tRe33 = 0x1.610b7551d2cdfp-1;
        double resIm31_s = eIm31 + (oRe31 * tRe33 + oIm31 * tRe31);
        out1024[idx + 63] = resIm31_s;
        out1024[idx + 451] = -resIm31_s;
        double resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe33);
        out1024[idx + 450] = resRe31_s;
        out1024[idx + 62] = resRe31_s;
        double resRe33_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe33);
        out1024[idx + 318] = resRe97_s;
        out1024[idx + 194] = resRe97_s;
        double resIm33_s = -eIm31 + (oRe31 * tRe33 + oIm31 * tRe31);
        out1024[idx + 195] = resIm97_s;
        out1024[idx + 319] = -resIm97_s;
        
        double oRe32 = out1024[idx + 320];
        double oIm32 = out1024[idx + 321];
        double eRe32 = out1024[idx + 64];
        double eIm32 = out1024[idx + 65];
        double tRe32 = 0x1.6a09e667f3bcdp-1;
        double resIm32_s = eIm32 + (oRe32 * tRe32 + oIm32 * tRe32);
        out1024[idx + 65] = resIm32_s;
        out1024[idx + 449] = -resIm32_s;
        double resRe32_s = eRe32 + (oRe32 * tRe32 - oIm32 * tRe32);
        out1024[idx + 448] = resRe32_s;
        out1024[idx + 64] = resRe32_s;
        double resRe32_s = eRe32 - (oRe32 * tRe32 - oIm32 * tRe32);
        out1024[idx + 320] = resRe96_s;
        out1024[idx + 192] = resRe96_s;
        double resIm32_s = -eIm32 + (oRe32 * tRe32 + oIm32 * tRe32);
        out1024[idx + 193] = resIm96_s;
        out1024[idx + 321] = -resIm96_s;
        
        double oRe33 = out1024[idx + 322];
        double oIm33 = out1024[idx + 323];
        double eRe33 = out1024[idx + 66];
        double eIm33 = out1024[idx + 67];
        double resIm33_s = eIm33 + (oRe33 * tRe31 + oIm33 * tRe33);
        out1024[idx + 67] = resIm33_s;
        out1024[idx + 447] = -resIm33_s;
        double resRe33_s = eRe33 + (oRe33 * tRe33 - oIm33 * tRe31);
        out1024[idx + 446] = resRe33_s;
        out1024[idx + 66] = resRe33_s;
        double resRe31_s = eRe33 - (oRe33 * tRe33 - oIm33 * tRe31);
        out1024[idx + 322] = resRe95_s;
        out1024[idx + 190] = resRe95_s;
        double resIm31_s = -eIm33 + (oRe33 * tRe31 + oIm33 * tRe33);
        out1024[idx + 191] = resIm95_s;
        out1024[idx + 323] = -resIm95_s;
        
        double oRe34 = out1024[idx + 324];
        double oIm34 = out1024[idx + 325];
        double eRe34 = out1024[idx + 68];
        double eIm34 = out1024[idx + 69];
        double resIm34_s = eIm34 + (oRe34 * tRe30 + oIm34 * tRe34);
        out1024[idx + 69] = resIm34_s;
        out1024[idx + 445] = -resIm34_s;
        double resRe34_s = eRe34 + (oRe34 * tRe34 - oIm34 * tRe30);
        out1024[idx + 444] = resRe34_s;
        out1024[idx + 68] = resRe34_s;
        double resRe30_s = eRe34 - (oRe34 * tRe34 - oIm34 * tRe30);
        out1024[idx + 324] = resRe94_s;
        out1024[idx + 188] = resRe94_s;
        double resIm30_s = -eIm34 + (oRe34 * tRe30 + oIm34 * tRe34);
        out1024[idx + 189] = resIm94_s;
        out1024[idx + 325] = -resIm94_s;
        
        double oRe35 = out1024[idx + 326];
        double oIm35 = out1024[idx + 327];
        double eRe35 = out1024[idx + 70];
        double eIm35 = out1024[idx + 71];
        double resIm35_s = eIm35 + (oRe35 * tRe29 + oIm35 * tRe35);
        out1024[idx + 71] = resIm35_s;
        out1024[idx + 443] = -resIm35_s;
        double resRe35_s = eRe35 + (oRe35 * tRe35 - oIm35 * tRe29);
        out1024[idx + 442] = resRe35_s;
        out1024[idx + 70] = resRe35_s;
        double resRe29_s = eRe35 - (oRe35 * tRe35 - oIm35 * tRe29);
        out1024[idx + 326] = resRe93_s;
        out1024[idx + 186] = resRe93_s;
        double resIm29_s = -eIm35 + (oRe35 * tRe29 + oIm35 * tRe35);
        out1024[idx + 187] = resIm93_s;
        out1024[idx + 327] = -resIm93_s;
        
        double oRe36 = out1024[idx + 328];
        double oIm36 = out1024[idx + 329];
        double eRe36 = out1024[idx + 72];
        double eIm36 = out1024[idx + 73];
        double resIm36_s = eIm36 + (oRe36 * tRe28 + oIm36 * tRe36);
        out1024[idx + 73] = resIm36_s;
        out1024[idx + 441] = -resIm36_s;
        double resRe36_s = eRe36 + (oRe36 * tRe36 - oIm36 * tRe28);
        out1024[idx + 440] = resRe36_s;
        out1024[idx + 72] = resRe36_s;
        double resRe28_s = eRe36 - (oRe36 * tRe36 - oIm36 * tRe28);
        out1024[idx + 328] = resRe92_s;
        out1024[idx + 184] = resRe92_s;
        double resIm28_s = -eIm36 + (oRe36 * tRe28 + oIm36 * tRe36);
        out1024[idx + 185] = resIm92_s;
        out1024[idx + 329] = -resIm92_s;
        
        double oRe37 = out1024[idx + 330];
        double oIm37 = out1024[idx + 331];
        double eRe37 = out1024[idx + 74];
        double eIm37 = out1024[idx + 75];
        double resIm37_s = eIm37 + (oRe37 * tRe27 + oIm37 * tRe37);
        out1024[idx + 75] = resIm37_s;
        out1024[idx + 439] = -resIm37_s;
        double resRe37_s = eRe37 + (oRe37 * tRe37 - oIm37 * tRe27);
        out1024[idx + 438] = resRe37_s;
        out1024[idx + 74] = resRe37_s;
        double resRe27_s = eRe37 - (oRe37 * tRe37 - oIm37 * tRe27);
        out1024[idx + 330] = resRe91_s;
        out1024[idx + 182] = resRe91_s;
        double resIm27_s = -eIm37 + (oRe37 * tRe27 + oIm37 * tRe37);
        out1024[idx + 183] = resIm91_s;
        out1024[idx + 331] = -resIm91_s;
        
        double oRe38 = out1024[idx + 332];
        double oIm38 = out1024[idx + 333];
        double eRe38 = out1024[idx + 76];
        double eIm38 = out1024[idx + 77];
        double resIm38_s = eIm38 + (oRe38 * tRe26 + oIm38 * tRe38);
        out1024[idx + 77] = resIm38_s;
        out1024[idx + 437] = -resIm38_s;
        double resRe38_s = eRe38 + (oRe38 * tRe38 - oIm38 * tRe26);
        out1024[idx + 436] = resRe38_s;
        out1024[idx + 76] = resRe38_s;
        double resRe26_s = eRe38 - (oRe38 * tRe38 - oIm38 * tRe26);
        out1024[idx + 332] = resRe90_s;
        out1024[idx + 180] = resRe90_s;
        double resIm26_s = -eIm38 + (oRe38 * tRe26 + oIm38 * tRe38);
        out1024[idx + 181] = resIm90_s;
        out1024[idx + 333] = -resIm90_s;
        
        double oRe39 = out1024[idx + 334];
        double oIm39 = out1024[idx + 335];
        double eRe39 = out1024[idx + 78];
        double eIm39 = out1024[idx + 79];
        double resIm39_s = eIm39 + (oRe39 * tRe25 + oIm39 * tRe39);
        out1024[idx + 79] = resIm39_s;
        out1024[idx + 435] = -resIm39_s;
        double resRe39_s = eRe39 + (oRe39 * tRe39 - oIm39 * tRe25);
        out1024[idx + 434] = resRe39_s;
        out1024[idx + 78] = resRe39_s;
        double resRe25_s = eRe39 - (oRe39 * tRe39 - oIm39 * tRe25);
        out1024[idx + 334] = resRe89_s;
        out1024[idx + 178] = resRe89_s;
        double resIm25_s = -eIm39 + (oRe39 * tRe25 + oIm39 * tRe39);
        out1024[idx + 179] = resIm89_s;
        out1024[idx + 335] = -resIm89_s;
        
        double oRe40 = out1024[idx + 336];
        double oIm40 = out1024[idx + 337];
        double eRe40 = out1024[idx + 80];
        double eIm40 = out1024[idx + 81];
        double resIm40_s = eIm40 + (oRe40 * tRe24 + oIm40 * tRe40);
        out1024[idx + 81] = resIm40_s;
        out1024[idx + 433] = -resIm40_s;
        double resRe40_s = eRe40 + (oRe40 * tRe40 - oIm40 * tRe24);
        out1024[idx + 432] = resRe40_s;
        out1024[idx + 80] = resRe40_s;
        double resRe24_s = eRe40 - (oRe40 * tRe40 - oIm40 * tRe24);
        out1024[idx + 336] = resRe88_s;
        out1024[idx + 176] = resRe88_s;
        double resIm24_s = -eIm40 + (oRe40 * tRe24 + oIm40 * tRe40);
        out1024[idx + 177] = resIm88_s;
        out1024[idx + 337] = -resIm88_s;
        
        double oRe41 = out1024[idx + 338];
        double oIm41 = out1024[idx + 339];
        double eRe41 = out1024[idx + 82];
        double eIm41 = out1024[idx + 83];
        double resIm41_s = eIm41 + (oRe41 * tRe23 + oIm41 * tRe41);
        out1024[idx + 83] = resIm41_s;
        out1024[idx + 431] = -resIm41_s;
        double resRe41_s = eRe41 + (oRe41 * tRe41 - oIm41 * tRe23);
        out1024[idx + 430] = resRe41_s;
        out1024[idx + 82] = resRe41_s;
        double resRe23_s = eRe41 - (oRe41 * tRe41 - oIm41 * tRe23);
        out1024[idx + 338] = resRe87_s;
        out1024[idx + 174] = resRe87_s;
        double resIm23_s = -eIm41 + (oRe41 * tRe23 + oIm41 * tRe41);
        out1024[idx + 175] = resIm87_s;
        out1024[idx + 339] = -resIm87_s;
        
        double oRe42 = out1024[idx + 340];
        double oIm42 = out1024[idx + 341];
        double eRe42 = out1024[idx + 84];
        double eIm42 = out1024[idx + 85];
        double resIm42_s = eIm42 + (oRe42 * tRe22 + oIm42 * tRe42);
        out1024[idx + 85] = resIm42_s;
        out1024[idx + 429] = -resIm42_s;
        double resRe42_s = eRe42 + (oRe42 * tRe42 - oIm42 * tRe22);
        out1024[idx + 428] = resRe42_s;
        out1024[idx + 84] = resRe42_s;
        double resRe22_s = eRe42 - (oRe42 * tRe42 - oIm42 * tRe22);
        out1024[idx + 340] = resRe86_s;
        out1024[idx + 172] = resRe86_s;
        double resIm22_s = -eIm42 + (oRe42 * tRe22 + oIm42 * tRe42);
        out1024[idx + 173] = resIm86_s;
        out1024[idx + 341] = -resIm86_s;
        
        double oRe43 = out1024[idx + 342];
        double oIm43 = out1024[idx + 343];
        double eRe43 = out1024[idx + 86];
        double eIm43 = out1024[idx + 87];
        double resIm43_s = eIm43 + (oRe43 * tRe21 + oIm43 * tRe43);
        out1024[idx + 87] = resIm43_s;
        out1024[idx + 427] = -resIm43_s;
        double resRe43_s = eRe43 + (oRe43 * tRe43 - oIm43 * tRe21);
        out1024[idx + 426] = resRe43_s;
        out1024[idx + 86] = resRe43_s;
        double resRe21_s = eRe43 - (oRe43 * tRe43 - oIm43 * tRe21);
        out1024[idx + 342] = resRe85_s;
        out1024[idx + 170] = resRe85_s;
        double resIm21_s = -eIm43 + (oRe43 * tRe21 + oIm43 * tRe43);
        out1024[idx + 171] = resIm85_s;
        out1024[idx + 343] = -resIm85_s;
        
        double oRe44 = out1024[idx + 344];
        double oIm44 = out1024[idx + 345];
        double eRe44 = out1024[idx + 88];
        double eIm44 = out1024[idx + 89];
        double resIm44_s = eIm44 + (oRe44 * tRe20 + oIm44 * tRe44);
        out1024[idx + 89] = resIm44_s;
        out1024[idx + 425] = -resIm44_s;
        double resRe44_s = eRe44 + (oRe44 * tRe44 - oIm44 * tRe20);
        out1024[idx + 424] = resRe44_s;
        out1024[idx + 88] = resRe44_s;
        double resRe20_s = eRe44 - (oRe44 * tRe44 - oIm44 * tRe20);
        out1024[idx + 344] = resRe84_s;
        out1024[idx + 168] = resRe84_s;
        double resIm20_s = -eIm44 + (oRe44 * tRe20 + oIm44 * tRe44);
        out1024[idx + 169] = resIm84_s;
        out1024[idx + 345] = -resIm84_s;
        
        double oRe45 = out1024[idx + 346];
        double oIm45 = out1024[idx + 347];
        double eRe45 = out1024[idx + 90];
        double eIm45 = out1024[idx + 91];
        double resIm45_s = eIm45 + (oRe45 * tRe19 + oIm45 * tRe45);
        out1024[idx + 91] = resIm45_s;
        out1024[idx + 423] = -resIm45_s;
        double resRe45_s = eRe45 + (oRe45 * tRe45 - oIm45 * tRe19);
        out1024[idx + 422] = resRe45_s;
        out1024[idx + 90] = resRe45_s;
        double resRe19_s = eRe45 - (oRe45 * tRe45 - oIm45 * tRe19);
        out1024[idx + 346] = resRe83_s;
        out1024[idx + 166] = resRe83_s;
        double resIm19_s = -eIm45 + (oRe45 * tRe19 + oIm45 * tRe45);
        out1024[idx + 167] = resIm83_s;
        out1024[idx + 347] = -resIm83_s;
        
        double oRe46 = out1024[idx + 348];
        double oIm46 = out1024[idx + 349];
        double eRe46 = out1024[idx + 92];
        double eIm46 = out1024[idx + 93];
        double resIm46_s = eIm46 + (oRe46 * tRe18 + oIm46 * tRe46);
        out1024[idx + 93] = resIm46_s;
        out1024[idx + 421] = -resIm46_s;
        double resRe46_s = eRe46 + (oRe46 * tRe46 - oIm46 * tRe18);
        out1024[idx + 420] = resRe46_s;
        out1024[idx + 92] = resRe46_s;
        double resRe18_s = eRe46 - (oRe46 * tRe46 - oIm46 * tRe18);
        out1024[idx + 348] = resRe82_s;
        out1024[idx + 164] = resRe82_s;
        double resIm18_s = -eIm46 + (oRe46 * tRe18 + oIm46 * tRe46);
        out1024[idx + 165] = resIm82_s;
        out1024[idx + 349] = -resIm82_s;
        
        double oRe47 = out1024[idx + 350];
        double oIm47 = out1024[idx + 351];
        double eRe47 = out1024[idx + 94];
        double eIm47 = out1024[idx + 95];
        double resIm47_s = eIm47 + (oRe47 * tRe17 + oIm47 * tRe47);
        out1024[idx + 95] = resIm47_s;
        out1024[idx + 419] = -resIm47_s;
        double resRe47_s = eRe47 + (oRe47 * tRe47 - oIm47 * tRe17);
        out1024[idx + 418] = resRe47_s;
        out1024[idx + 94] = resRe47_s;
        double resRe17_s = eRe47 - (oRe47 * tRe47 - oIm47 * tRe17);
        out1024[idx + 350] = resRe81_s;
        out1024[idx + 162] = resRe81_s;
        double resIm17_s = -eIm47 + (oRe47 * tRe17 + oIm47 * tRe47);
        out1024[idx + 163] = resIm81_s;
        out1024[idx + 351] = -resIm81_s;
        
        double oRe48 = out1024[idx + 352];
        double oIm48 = out1024[idx + 353];
        double eRe48 = out1024[idx + 96];
        double eIm48 = out1024[idx + 97];
        double resIm48_s = eIm48 + (oRe48 * tRe16 + oIm48 * tRe48);
        out1024[idx + 97] = resIm48_s;
        out1024[idx + 417] = -resIm48_s;
        double resRe48_s = eRe48 + (oRe48 * tRe48 - oIm48 * tRe16);
        out1024[idx + 416] = resRe48_s;
        out1024[idx + 96] = resRe48_s;
        double resRe16_s = eRe48 - (oRe48 * tRe48 - oIm48 * tRe16);
        out1024[idx + 352] = resRe80_s;
        out1024[idx + 160] = resRe80_s;
        double resIm16_s = -eIm48 + (oRe48 * tRe16 + oIm48 * tRe48);
        out1024[idx + 161] = resIm80_s;
        out1024[idx + 353] = -resIm80_s;
        
        double oRe49 = out1024[idx + 354];
        double oIm49 = out1024[idx + 355];
        double eRe49 = out1024[idx + 98];
        double eIm49 = out1024[idx + 99];
        double resIm49_s = eIm49 + (oRe49 * tRe15 + oIm49 * tRe49);
        out1024[idx + 99] = resIm49_s;
        out1024[idx + 415] = -resIm49_s;
        double resRe49_s = eRe49 + (oRe49 * tRe49 - oIm49 * tRe15);
        out1024[idx + 414] = resRe49_s;
        out1024[idx + 98] = resRe49_s;
        double resRe15_s = eRe49 - (oRe49 * tRe49 - oIm49 * tRe15);
        out1024[idx + 354] = resRe79_s;
        out1024[idx + 158] = resRe79_s;
        double resIm15_s = -eIm49 + (oRe49 * tRe15 + oIm49 * tRe49);
        out1024[idx + 159] = resIm79_s;
        out1024[idx + 355] = -resIm79_s;
        
        double oRe50 = out1024[idx + 356];
        double oIm50 = out1024[idx + 357];
        double eRe50 = out1024[idx + 100];
        double eIm50 = out1024[idx + 101];
        double resIm50_s = eIm50 + (oRe50 * tRe14 + oIm50 * tRe50);
        out1024[idx + 101] = resIm50_s;
        out1024[idx + 413] = -resIm50_s;
        double resRe50_s = eRe50 + (oRe50 * tRe50 - oIm50 * tRe14);
        out1024[idx + 412] = resRe50_s;
        out1024[idx + 100] = resRe50_s;
        double resRe14_s = eRe50 - (oRe50 * tRe50 - oIm50 * tRe14);
        out1024[idx + 356] = resRe78_s;
        out1024[idx + 156] = resRe78_s;
        double resIm14_s = -eIm50 + (oRe50 * tRe14 + oIm50 * tRe50);
        out1024[idx + 157] = resIm78_s;
        out1024[idx + 357] = -resIm78_s;
        
        double oRe51 = out1024[idx + 358];
        double oIm51 = out1024[idx + 359];
        double eRe51 = out1024[idx + 102];
        double eIm51 = out1024[idx + 103];
        double resIm51_s = eIm51 + (oRe51 * tRe13 + oIm51 * tRe51);
        out1024[idx + 103] = resIm51_s;
        out1024[idx + 411] = -resIm51_s;
        double resRe51_s = eRe51 + (oRe51 * tRe51 - oIm51 * tRe13);
        out1024[idx + 410] = resRe51_s;
        out1024[idx + 102] = resRe51_s;
        double resRe13_s = eRe51 - (oRe51 * tRe51 - oIm51 * tRe13);
        out1024[idx + 358] = resRe77_s;
        out1024[idx + 154] = resRe77_s;
        double resIm13_s = -eIm51 + (oRe51 * tRe13 + oIm51 * tRe51);
        out1024[idx + 155] = resIm77_s;
        out1024[idx + 359] = -resIm77_s;
        
        double oRe52 = out1024[idx + 360];
        double oIm52 = out1024[idx + 361];
        double eRe52 = out1024[idx + 104];
        double eIm52 = out1024[idx + 105];
        double resIm52_s = eIm52 + (oRe52 * tRe12 + oIm52 * tRe52);
        out1024[idx + 105] = resIm52_s;
        out1024[idx + 409] = -resIm52_s;
        double resRe52_s = eRe52 + (oRe52 * tRe52 - oIm52 * tRe12);
        out1024[idx + 408] = resRe52_s;
        out1024[idx + 104] = resRe52_s;
        double resRe12_s = eRe52 - (oRe52 * tRe52 - oIm52 * tRe12);
        out1024[idx + 360] = resRe76_s;
        out1024[idx + 152] = resRe76_s;
        double resIm12_s = -eIm52 + (oRe52 * tRe12 + oIm52 * tRe52);
        out1024[idx + 153] = resIm76_s;
        out1024[idx + 361] = -resIm76_s;
        
        double oRe53 = out1024[idx + 362];
        double oIm53 = out1024[idx + 363];
        double eRe53 = out1024[idx + 106];
        double eIm53 = out1024[idx + 107];
        double resIm53_s = eIm53 + (oRe53 * tRe11 + oIm53 * tRe53);
        out1024[idx + 107] = resIm53_s;
        out1024[idx + 407] = -resIm53_s;
        double resRe53_s = eRe53 + (oRe53 * tRe53 - oIm53 * tRe11);
        out1024[idx + 406] = resRe53_s;
        out1024[idx + 106] = resRe53_s;
        double resRe11_s = eRe53 - (oRe53 * tRe53 - oIm53 * tRe11);
        out1024[idx + 362] = resRe75_s;
        out1024[idx + 150] = resRe75_s;
        double resIm11_s = -eIm53 + (oRe53 * tRe11 + oIm53 * tRe53);
        out1024[idx + 151] = resIm75_s;
        out1024[idx + 363] = -resIm75_s;
        
        double oRe54 = out1024[idx + 364];
        double oIm54 = out1024[idx + 365];
        double eRe54 = out1024[idx + 108];
        double eIm54 = out1024[idx + 109];
        double resIm54_s = eIm54 + (oRe54 * tRe10 + oIm54 * tRe54);
        out1024[idx + 109] = resIm54_s;
        out1024[idx + 405] = -resIm54_s;
        double resRe54_s = eRe54 + (oRe54 * tRe54 - oIm54 * tRe10);
        out1024[idx + 404] = resRe54_s;
        out1024[idx + 108] = resRe54_s;
        double resRe10_s = eRe54 - (oRe54 * tRe54 - oIm54 * tRe10);
        out1024[idx + 364] = resRe74_s;
        out1024[idx + 148] = resRe74_s;
        double resIm10_s = -eIm54 + (oRe54 * tRe10 + oIm54 * tRe54);
        out1024[idx + 149] = resIm74_s;
        out1024[idx + 365] = -resIm74_s;
        
        double oRe55 = out1024[idx + 366];
        double oIm55 = out1024[idx + 367];
        double eRe55 = out1024[idx + 110];
        double eIm55 = out1024[idx + 111];
        double resIm55_s = eIm55 + (oRe55 * tRe9 + oIm55 * tRe55);
        out1024[idx + 111] = resIm55_s;
        out1024[idx + 403] = -resIm55_s;
        double resRe55_s = eRe55 + (oRe55 * tRe55 - oIm55 * tRe9);
        out1024[idx + 402] = resRe55_s;
        out1024[idx + 110] = resRe55_s;
        double resRe9_s = eRe55 - (oRe55 * tRe55 - oIm55 * tRe9);
        out1024[idx + 366] = resRe73_s;
        out1024[idx + 146] = resRe73_s;
        double resIm9_s = -eIm55 + (oRe55 * tRe9 + oIm55 * tRe55);
        out1024[idx + 147] = resIm73_s;
        out1024[idx + 367] = -resIm73_s;
        
        double oRe56 = out1024[idx + 368];
        double oIm56 = out1024[idx + 369];
        double eRe56 = out1024[idx + 112];
        double eIm56 = out1024[idx + 113];
        double resIm56_s = eIm56 + (oRe56 * tRe8 + oIm56 * tRe56);
        out1024[idx + 113] = resIm56_s;
        out1024[idx + 401] = -resIm56_s;
        double resRe56_s = eRe56 + (oRe56 * tRe56 - oIm56 * tRe8);
        out1024[idx + 400] = resRe56_s;
        out1024[idx + 112] = resRe56_s;
        double resRe8_s = eRe56 - (oRe56 * tRe56 - oIm56 * tRe8);
        out1024[idx + 368] = resRe72_s;
        out1024[idx + 144] = resRe72_s;
        double resIm8_s = -eIm56 + (oRe56 * tRe8 + oIm56 * tRe56);
        out1024[idx + 145] = resIm72_s;
        out1024[idx + 369] = -resIm72_s;
        
        double oRe57 = out1024[idx + 370];
        double oIm57 = out1024[idx + 371];
        double eRe57 = out1024[idx + 114];
        double eIm57 = out1024[idx + 115];
        double resIm57_s = eIm57 + (oRe57 * tRe7 + oIm57 * tRe57);
        out1024[idx + 115] = resIm57_s;
        out1024[idx + 399] = -resIm57_s;
        double resRe57_s = eRe57 + (oRe57 * tRe57 - oIm57 * tRe7);
        out1024[idx + 398] = resRe57_s;
        out1024[idx + 114] = resRe57_s;
        double resRe7_s = eRe57 - (oRe57 * tRe57 - oIm57 * tRe7);
        out1024[idx + 370] = resRe71_s;
        out1024[idx + 142] = resRe71_s;
        double resIm7_s = -eIm57 + (oRe57 * tRe7 + oIm57 * tRe57);
        out1024[idx + 143] = resIm71_s;
        out1024[idx + 371] = -resIm71_s;
        
        double oRe58 = out1024[idx + 372];
        double oIm58 = out1024[idx + 373];
        double eRe58 = out1024[idx + 116];
        double eIm58 = out1024[idx + 117];
        double resIm58_s = eIm58 + (oRe58 * tRe6 + oIm58 * tRe58);
        out1024[idx + 117] = resIm58_s;
        out1024[idx + 397] = -resIm58_s;
        double resRe58_s = eRe58 + (oRe58 * tRe58 - oIm58 * tRe6);
        out1024[idx + 396] = resRe58_s;
        out1024[idx + 116] = resRe58_s;
        double resRe6_s = eRe58 - (oRe58 * tRe58 - oIm58 * tRe6);
        out1024[idx + 372] = resRe70_s;
        out1024[idx + 140] = resRe70_s;
        double resIm6_s = -eIm58 + (oRe58 * tRe6 + oIm58 * tRe58);
        out1024[idx + 141] = resIm70_s;
        out1024[idx + 373] = -resIm70_s;
        
        double oRe59 = out1024[idx + 374];
        double oIm59 = out1024[idx + 375];
        double eRe59 = out1024[idx + 118];
        double eIm59 = out1024[idx + 119];
        double resIm59_s = eIm59 + (oRe59 * tRe5 + oIm59 * tRe59);
        out1024[idx + 119] = resIm59_s;
        out1024[idx + 395] = -resIm59_s;
        double resRe59_s = eRe59 + (oRe59 * tRe59 - oIm59 * tRe5);
        out1024[idx + 394] = resRe59_s;
        out1024[idx + 118] = resRe59_s;
        double resRe5_s = eRe59 - (oRe59 * tRe59 - oIm59 * tRe5);
        out1024[idx + 374] = resRe69_s;
        out1024[idx + 138] = resRe69_s;
        double resIm5_s = -eIm59 + (oRe59 * tRe5 + oIm59 * tRe59);
        out1024[idx + 139] = resIm69_s;
        out1024[idx + 375] = -resIm69_s;
        
        double oRe60 = out1024[idx + 376];
        double oIm60 = out1024[idx + 377];
        double eRe60 = out1024[idx + 120];
        double eIm60 = out1024[idx + 121];
        double resIm60_s = eIm60 + (oRe60 * tRe4 + oIm60 * tRe60);
        out1024[idx + 121] = resIm60_s;
        out1024[idx + 393] = -resIm60_s;
        double resRe60_s = eRe60 + (oRe60 * tRe60 - oIm60 * tRe4);
        out1024[idx + 392] = resRe60_s;
        out1024[idx + 120] = resRe60_s;
        double resRe4_s = eRe60 - (oRe60 * tRe60 - oIm60 * tRe4);
        out1024[idx + 376] = resRe68_s;
        out1024[idx + 136] = resRe68_s;
        double resIm4_s = -eIm60 + (oRe60 * tRe4 + oIm60 * tRe60);
        out1024[idx + 137] = resIm68_s;
        out1024[idx + 377] = -resIm68_s;
        
        double oRe61 = out1024[idx + 378];
        double oIm61 = out1024[idx + 379];
        double eRe61 = out1024[idx + 122];
        double eIm61 = out1024[idx + 123];
        double resIm61_s = eIm61 + (oRe61 * tRe3 + oIm61 * tRe61);
        out1024[idx + 123] = resIm61_s;
        out1024[idx + 391] = -resIm61_s;
        double resRe61_s = eRe61 + (oRe61 * tRe61 - oIm61 * tRe3);
        out1024[idx + 390] = resRe61_s;
        out1024[idx + 122] = resRe61_s;
        double resRe3_s = eRe61 - (oRe61 * tRe61 - oIm61 * tRe3);
        out1024[idx + 378] = resRe67_s;
        out1024[idx + 134] = resRe67_s;
        double resIm3_s = -eIm61 + (oRe61 * tRe3 + oIm61 * tRe61);
        out1024[idx + 135] = resIm67_s;
        out1024[idx + 379] = -resIm67_s;
        
        double oRe62 = out1024[idx + 380];
        double oIm62 = out1024[idx + 381];
        double eRe62 = out1024[idx + 124];
        double eIm62 = out1024[idx + 125];
        double resIm62_s = eIm62 + (oRe62 * tRe2 + oIm62 * tRe62);
        out1024[idx + 125] = resIm62_s;
        out1024[idx + 389] = -resIm62_s;
        double resRe62_s = eRe62 + (oRe62 * tRe62 - oIm62 * tRe2);
        out1024[idx + 388] = resRe62_s;
        out1024[idx + 124] = resRe62_s;
        double resRe2_s = eRe62 - (oRe62 * tRe62 - oIm62 * tRe2);
        out1024[idx + 380] = resRe66_s;
        out1024[idx + 132] = resRe66_s;
        double resIm2_s = -eIm62 + (oRe62 * tRe2 + oIm62 * tRe62);
        out1024[idx + 133] = resIm66_s;
        out1024[idx + 381] = -resIm66_s;
        
        double oRe63 = out1024[idx + 382];
        double oIm63 = out1024[idx + 383];
        double eRe63 = out1024[idx + 126];
        double eIm63 = out1024[idx + 127];
        double resIm63_s = eIm63 + (oRe63 * tRe1 + oIm63 * tRe63);
        out1024[idx + 127] = resIm63_s;
        out1024[idx + 387] = -resIm63_s;
        double resRe63_s = eRe63 + (oRe63 * tRe63 - oIm63 * tRe1);
        out1024[idx + 386] = resRe63_s;
        out1024[idx + 126] = resRe63_s;
        double resRe1_s = eRe63 - (oRe63 * tRe63 - oIm63 * tRe1);
        out1024[idx + 382] = resRe65_s;
        out1024[idx + 130] = resRe65_s;
        double resIm1_s = -eIm63 + (oRe63 * tRe1 + oIm63 * tRe63);
        out1024[idx + 131] = resIm65_s;
        out1024[idx + 383] = -resIm65_s;
        
        double oRe64 = out1024[idx + 384];
        double oIm64 = out1024[idx + 385];
        double eRe64 = out1024[idx + 128];
        double eIm64 = out1024[idx + 129];
        double resIm64_s = eIm64 + oRe64;
        out1024[idx + 129] = resIm64_s;
        out1024[idx + 385] = -resIm64_s;
        double resRe64_s = eRe64 - oIm64;
        out1024[idx + 384] = resRe64_s;
        out1024[idx + 128] = resRe64_s;
    } 


    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // FFT step for SIZE 512
    ////////////////////////////////////////////////
    for(int idx = 0; idx < 2048; idx += 1024){ 
        double oRe0 = out1024[idx + 512];
        double oIm0 = out1024[idx + 513];
        double eRe0 = out1024[idx + 0];
        double eIm0 = out1024[idx + 1];
        double resRe0_s = eRe0 + oRe0;
        out1024[idx] = resRe0_s;
        double resIm0_s = eIm0 + oIm0;
        out1024[idx + 1] = resRe0_s;
        double resRe0_d = eRe0 - oRe0;
        out1024[idx + 512] = resRe0_d;
        double resIm0_d = eIm0 - oIm0;
        out1024[idx + 513] = resIm0_d;
        
        double oRe1 = out1024[idx + 514];
        double oIm1 = out1024[idx + 515];
        double eRe1 = out1024[idx + 2];
        double eIm1 = out1024[idx + 3];
        double tRe1 = 0x1.fff62169b92dbp-1;
        double tRe127 = 0x1.921d1fcdec78fp-7;
        double resIm1_s = eIm1 + (oRe1 * tRe127 + oIm1 * tRe1);
        out1024[idx + 3] = resIm1_s;
        out1024[idx + 1023] = -resIm1_s;
        double resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe127);
        out1024[idx + 1022] = resRe1_s;
        out1024[idx + 2] = resRe1_s;
        double resRe127_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe127);
        out1024[idx + 514] = resRe255_s;
        out1024[idx + 510] = resRe255_s;
        double resIm127_s = -eIm1 + (oRe1 * tRe127 + oIm1 * tRe1);
        out1024[idx + 511] = resIm255_s;
        out1024[idx + 515] = -resIm255_s;
        
        double oRe2 = out1024[idx + 516];
        double oIm2 = out1024[idx + 517];
        double eRe2 = out1024[idx + 4];
        double eIm2 = out1024[idx + 5];
        double tRe2 = 0x1.ffd886084cd0dp-1;
        double tRe126 = 0x1.92155f7a36678p-6;
        double resIm2_s = eIm2 + (oRe2 * tRe126 + oIm2 * tRe2);
        out1024[idx + 5] = resIm2_s;
        out1024[idx + 1021] = -resIm2_s;
        double resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe126);
        out1024[idx + 1020] = resRe2_s;
        out1024[idx + 4] = resRe2_s;
        double resRe126_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe126);
        out1024[idx + 516] = resRe254_s;
        out1024[idx + 508] = resRe254_s;
        double resIm126_s = -eIm2 + (oRe2 * tRe126 + oIm2 * tRe2);
        out1024[idx + 509] = resIm254_s;
        out1024[idx + 517] = -resIm254_s;
        
        double oRe3 = out1024[idx + 518];
        double oIm3 = out1024[idx + 519];
        double eRe3 = out1024[idx + 6];
        double eIm3 = out1024[idx + 7];
        double tRe3 = 0x1.ffa72effef75dp-1;
        double tRe125 = 0x1.2d865759455e4p-5;
        double resIm3_s = eIm3 + (oRe3 * tRe125 + oIm3 * tRe3);
        out1024[idx + 7] = resIm3_s;
        out1024[idx + 1019] = -resIm3_s;
        double resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe125);
        out1024[idx + 1018] = resRe3_s;
        out1024[idx + 6] = resRe3_s;
        double resRe125_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe125);
        out1024[idx + 518] = resRe253_s;
        out1024[idx + 506] = resRe253_s;
        double resIm125_s = -eIm3 + (oRe3 * tRe125 + oIm3 * tRe3);
        out1024[idx + 507] = resIm253_s;
        out1024[idx + 519] = -resIm253_s;
        
        double oRe4 = out1024[idx + 520];
        double oIm4 = out1024[idx + 521];
        double eRe4 = out1024[idx + 8];
        double eIm4 = out1024[idx + 9];
        double tRe4 = 0x1.ff621e3796d7ep-1;
        double tRe124 = 0x1.91f65f10dd825p-5;
        double resIm4_s = eIm4 + (oRe4 * tRe124 + oIm4 * tRe4);
        out1024[idx + 9] = resIm4_s;
        out1024[idx + 1017] = -resIm4_s;
        double resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe124);
        out1024[idx + 1016] = resRe4_s;
        out1024[idx + 8] = resRe4_s;
        double resRe124_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe124);
        out1024[idx + 520] = resRe252_s;
        out1024[idx + 504] = resRe252_s;
        double resIm124_s = -eIm4 + (oRe4 * tRe124 + oIm4 * tRe4);
        out1024[idx + 505] = resIm252_s;
        out1024[idx + 521] = -resIm252_s;
        
        double oRe5 = out1024[idx + 522];
        double oIm5 = out1024[idx + 523];
        double eRe5 = out1024[idx + 10];
        double eIm5 = out1024[idx + 11];
        double tRe5 = 0x1.ff095658e71adp-1;
        double tRe123 = 0x1.f656e79f820ebp-5;
        double resIm5_s = eIm5 + (oRe5 * tRe123 + oIm5 * tRe5);
        out1024[idx + 11] = resIm5_s;
        out1024[idx + 1015] = -resIm5_s;
        double resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe123);
        out1024[idx + 1014] = resRe5_s;
        out1024[idx + 10] = resRe5_s;
        double resRe123_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe123);
        out1024[idx + 522] = resRe251_s;
        out1024[idx + 502] = resRe251_s;
        double resIm123_s = -eIm5 + (oRe5 * tRe123 + oIm5 * tRe5);
        out1024[idx + 503] = resIm251_s;
        out1024[idx + 523] = -resIm251_s;
        
        double oRe6 = out1024[idx + 524];
        double oIm6 = out1024[idx + 525];
        double eRe6 = out1024[idx + 12];
        double eIm6 = out1024[idx + 13];
        double tRe6 = 0x1.fe9cdad01883ap-1;
        double tRe122 = 0x1.2d52092ce19f8p-4;
        double resIm6_s = eIm6 + (oRe6 * tRe122 + oIm6 * tRe6);
        out1024[idx + 13] = resIm6_s;
        out1024[idx + 1013] = -resIm6_s;
        double resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe122);
        out1024[idx + 1012] = resRe6_s;
        out1024[idx + 12] = resRe6_s;
        double resRe122_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe122);
        out1024[idx + 524] = resRe250_s;
        out1024[idx + 500] = resRe250_s;
        double resIm122_s = -eIm6 + (oRe6 * tRe122 + oIm6 * tRe6);
        out1024[idx + 501] = resIm250_s;
        out1024[idx + 525] = -resIm250_s;
        
        double oRe7 = out1024[idx + 526];
        double oIm7 = out1024[idx + 527];
        double eRe7 = out1024[idx + 14];
        double eIm7 = out1024[idx + 15];
        double tRe7 = 0x1.fe1cafcbd5b09p-1;
        double tRe121 = 0x1.5f6d00a9aa418p-4;
        double resIm7_s = eIm7 + (oRe7 * tRe121 + oIm7 * tRe7);
        out1024[idx + 15] = resIm7_s;
        out1024[idx + 1011] = -resIm7_s;
        double resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe121);
        out1024[idx + 1010] = resRe7_s;
        out1024[idx + 14] = resRe7_s;
        double resRe121_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe121);
        out1024[idx + 526] = resRe249_s;
        out1024[idx + 498] = resRe249_s;
        double resIm121_s = -eIm7 + (oRe7 * tRe121 + oIm7 * tRe7);
        out1024[idx + 499] = resIm249_s;
        out1024[idx + 527] = -resIm249_s;
        
        double oRe8 = out1024[idx + 528];
        double oIm8 = out1024[idx + 529];
        double eRe8 = out1024[idx + 16];
        double eIm8 = out1024[idx + 17];
        double tRe8 = 0x1.fd88da3d12526p-1;
        double tRe120 = 0x1.917a6bc29b438p-4;
        double resIm8_s = eIm8 + (oRe8 * tRe120 + oIm8 * tRe8);
        out1024[idx + 17] = resIm8_s;
        out1024[idx + 1009] = -resIm8_s;
        double resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe120);
        out1024[idx + 1008] = resRe8_s;
        out1024[idx + 16] = resRe8_s;
        double resRe120_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe120);
        out1024[idx + 528] = resRe248_s;
        out1024[idx + 496] = resRe248_s;
        double resIm120_s = -eIm8 + (oRe8 * tRe120 + oIm8 * tRe8);
        out1024[idx + 497] = resIm248_s;
        out1024[idx + 529] = -resIm248_s;
        
        double oRe9 = out1024[idx + 530];
        double oIm9 = out1024[idx + 531];
        double eRe9 = out1024[idx + 18];
        double eIm9 = out1024[idx + 19];
        double tRe9 = 0x1.fce15fd6da67bp-1;
        double tRe119 = 0x1.c3785c79ec2dep-4;
        double resIm9_s = eIm9 + (oRe9 * tRe119 + oIm9 * tRe9);
        out1024[idx + 19] = resIm9_s;
        out1024[idx + 1007] = -resIm9_s;
        double resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe119);
        out1024[idx + 1006] = resRe9_s;
        out1024[idx + 18] = resRe9_s;
        double resRe119_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe119);
        out1024[idx + 530] = resRe247_s;
        out1024[idx + 494] = resRe247_s;
        double resIm119_s = -eIm9 + (oRe9 * tRe119 + oIm9 * tRe9);
        out1024[idx + 495] = resIm247_s;
        out1024[idx + 531] = -resIm247_s;
        
        double oRe10 = out1024[idx + 532];
        double oIm10 = out1024[idx + 533];
        double eRe10 = out1024[idx + 20];
        double eIm10 = out1024[idx + 21];
        double tRe10 = 0x1.fc26470e19fd3p-1;
        double tRe118 = 0x1.f564e56a97314p-4;
        double resIm10_s = eIm10 + (oRe10 * tRe118 + oIm10 * tRe10);
        out1024[idx + 21] = resIm10_s;
        out1024[idx + 1005] = -resIm10_s;
        double resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe118);
        out1024[idx + 1004] = resRe10_s;
        out1024[idx + 20] = resRe10_s;
        double resRe118_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe118);
        out1024[idx + 532] = resRe246_s;
        out1024[idx + 492] = resRe246_s;
        double resIm118_s = -eIm10 + (oRe10 * tRe118 + oIm10 * tRe10);
        out1024[idx + 493] = resIm246_s;
        out1024[idx + 533] = -resIm246_s;
        
        double oRe11 = out1024[idx + 534];
        double oIm11 = out1024[idx + 535];
        double eRe11 = out1024[idx + 22];
        double eIm11 = out1024[idx + 23];
        double tRe11 = 0x1.fb5797195d741p-1;
        double tRe117 = 0x1.139f0cedaf578p-3;
        double resIm11_s = eIm11 + (oRe11 * tRe117 + oIm11 * tRe11);
        out1024[idx + 23] = resIm11_s;
        out1024[idx + 1003] = -resIm11_s;
        double resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe117);
        out1024[idx + 1002] = resRe11_s;
        out1024[idx + 22] = resRe11_s;
        double resRe117_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe117);
        out1024[idx + 534] = resRe245_s;
        out1024[idx + 490] = resRe245_s;
        double resIm117_s = -eIm11 + (oRe11 * tRe117 + oIm11 * tRe11);
        out1024[idx + 491] = resIm245_s;
        out1024[idx + 535] = -resIm245_s;
        
        double oRe12 = out1024[idx + 536];
        double oIm12 = out1024[idx + 537];
        double eRe12 = out1024[idx + 24];
        double eIm12 = out1024[idx + 25];
        double tRe12 = 0x1.fa7557f08a517p-1;
        double tRe116 = 0x1.2c8106e8e613ap-3;
        double resIm12_s = eIm12 + (oRe12 * tRe116 + oIm12 * tRe12);
        out1024[idx + 25] = resIm12_s;
        out1024[idx + 1001] = -resIm12_s;
        double resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe116);
        out1024[idx + 1000] = resRe12_s;
        out1024[idx + 24] = resRe12_s;
        double resRe116_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe116);
        out1024[idx + 536] = resRe244_s;
        out1024[idx + 488] = resRe244_s;
        double resIm116_s = -eIm12 + (oRe12 * tRe116 + oIm12 * tRe12);
        out1024[idx + 489] = resIm244_s;
        out1024[idx + 537] = -resIm244_s;
        
        double oRe13 = out1024[idx + 538];
        double oIm13 = out1024[idx + 539];
        double eRe13 = out1024[idx + 26];
        double eIm13 = out1024[idx + 27];
        double tRe13 = 0x1.f97f924c9099bp-1;
        double tRe115 = 0x1.45576b1293e58p-3;
        double resIm13_s = eIm13 + (oRe13 * tRe115 + oIm13 * tRe13);
        out1024[idx + 27] = resIm13_s;
        out1024[idx + 999] = -resIm13_s;
        double resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe115);
        out1024[idx + 998] = resRe13_s;
        out1024[idx + 26] = resRe13_s;
        double resRe115_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe115);
        out1024[idx + 538] = resRe243_s;
        out1024[idx + 486] = resRe243_s;
        double resIm115_s = -eIm13 + (oRe13 * tRe115 + oIm13 * tRe13);
        out1024[idx + 487] = resIm243_s;
        out1024[idx + 539] = -resIm243_s;
        
        double oRe14 = out1024[idx + 540];
        double oIm14 = out1024[idx + 541];
        double eRe14 = out1024[idx + 28];
        double eIm14 = out1024[idx + 29];
        double tRe14 = 0x1.f8764fa714ba9p-1;
        double tRe114 = 0x1.5e214448b3fcbp-3;
        double resIm14_s = eIm14 + (oRe14 * tRe114 + oIm14 * tRe14);
        out1024[idx + 29] = resIm14_s;
        out1024[idx + 997] = -resIm14_s;
        double resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe114);
        out1024[idx + 996] = resRe14_s;
        out1024[idx + 28] = resRe14_s;
        double resRe114_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe114);
        out1024[idx + 540] = resRe242_s;
        out1024[idx + 484] = resRe242_s;
        double resIm114_s = -eIm14 + (oRe14 * tRe114 + oIm14 * tRe14);
        out1024[idx + 485] = resIm242_s;
        out1024[idx + 541] = -resIm242_s;
        
        double oRe15 = out1024[idx + 542];
        double oIm15 = out1024[idx + 543];
        double eRe15 = out1024[idx + 30];
        double eIm15 = out1024[idx + 31];
        double tRe15 = 0x1.f7599a3a12077p-1;
        double tRe113 = 0x1.76dd9de50bf34p-3;
        double resIm15_s = eIm15 + (oRe15 * tRe113 + oIm15 * tRe15);
        out1024[idx + 31] = resIm15_s;
        out1024[idx + 995] = -resIm15_s;
        double resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe113);
        out1024[idx + 994] = resRe15_s;
        out1024[idx + 30] = resRe15_s;
        double resRe113_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe113);
        out1024[idx + 542] = resRe241_s;
        out1024[idx + 482] = resRe241_s;
        double resIm113_s = -eIm15 + (oRe15 * tRe113 + oIm15 * tRe15);
        out1024[idx + 483] = resIm241_s;
        out1024[idx + 543] = -resIm241_s;
        
        double oRe16 = out1024[idx + 544];
        double oIm16 = out1024[idx + 545];
        double eRe16 = out1024[idx + 32];
        double eIm16 = out1024[idx + 33];
        double tRe16 = 0x1.f6297cff75cbp-1;
        double tRe112 = 0x1.8f8b83c69a60cp-3;
        double resIm16_s = eIm16 + (oRe16 * tRe112 + oIm16 * tRe16);
        out1024[idx + 33] = resIm16_s;
        out1024[idx + 993] = -resIm16_s;
        double resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe112);
        out1024[idx + 992] = resRe16_s;
        out1024[idx + 32] = resRe16_s;
        double resRe112_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe112);
        out1024[idx + 544] = resRe240_s;
        out1024[idx + 480] = resRe240_s;
        double resIm112_s = -eIm16 + (oRe16 * tRe112 + oIm16 * tRe16);
        out1024[idx + 481] = resIm240_s;
        out1024[idx + 545] = -resIm240_s;
        
        double oRe17 = out1024[idx + 546];
        double oIm17 = out1024[idx + 547];
        double eRe17 = out1024[idx + 34];
        double eIm17 = out1024[idx + 35];
        double tRe17 = 0x1.f4e603b0b2f2dp-1;
        double tRe111 = 0x1.a82a025b00451p-3;
        double resIm17_s = eIm17 + (oRe17 * tRe111 + oIm17 * tRe17);
        out1024[idx + 35] = resIm17_s;
        out1024[idx + 991] = -resIm17_s;
        double resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe111);
        out1024[idx + 990] = resRe17_s;
        out1024[idx + 34] = resRe17_s;
        double resRe111_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe111);
        out1024[idx + 546] = resRe239_s;
        out1024[idx + 478] = resRe239_s;
        double resIm111_s = -eIm17 + (oRe17 * tRe111 + oIm17 * tRe17);
        out1024[idx + 479] = resIm239_s;
        out1024[idx + 547] = -resIm239_s;
        
        double oRe18 = out1024[idx + 548];
        double oIm18 = out1024[idx + 549];
        double eRe18 = out1024[idx + 36];
        double eIm18 = out1024[idx + 37];
        double tRe18 = 0x1.f38f3ac64e589p-1;
        double tRe110 = 0x1.c0b826a7e4f62p-3;
        double resIm18_s = eIm18 + (oRe18 * tRe110 + oIm18 * tRe18);
        out1024[idx + 37] = resIm18_s;
        out1024[idx + 989] = -resIm18_s;
        double resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe110);
        out1024[idx + 988] = resRe18_s;
        out1024[idx + 36] = resRe18_s;
        double resRe110_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe110);
        out1024[idx + 548] = resRe238_s;
        out1024[idx + 476] = resRe238_s;
        double resIm110_s = -eIm18 + (oRe18 * tRe110 + oIm18 * tRe18);
        out1024[idx + 477] = resIm238_s;
        out1024[idx + 549] = -resIm238_s;
        
        double oRe19 = out1024[idx + 550];
        double oIm19 = out1024[idx + 551];
        double eRe19 = out1024[idx + 38];
        double eIm19 = out1024[idx + 39];
        double tRe19 = 0x1.f2252f7763adap-1;
        double tRe109 = 0x1.d934fe5454316p-3;
        double resIm19_s = eIm19 + (oRe19 * tRe109 + oIm19 * tRe19);
        out1024[idx + 39] = resIm19_s;
        out1024[idx + 987] = -resIm19_s;
        double resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe109);
        out1024[idx + 986] = resRe19_s;
        out1024[idx + 38] = resRe19_s;
        double resRe109_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe109);
        out1024[idx + 550] = resRe237_s;
        out1024[idx + 474] = resRe237_s;
        double resIm109_s = -eIm19 + (oRe19 * tRe109 + oIm19 * tRe19);
        out1024[idx + 475] = resIm237_s;
        out1024[idx + 551] = -resIm237_s;
        
        double oRe20 = out1024[idx + 552];
        double oIm20 = out1024[idx + 553];
        double eRe20 = out1024[idx + 40];
        double eIm20 = out1024[idx + 41];
        double tRe20 = 0x1.f0a7efb9230d7p-1;
        double tRe108 = 0x1.f19f97b215f1ep-3;
        double resIm20_s = eIm20 + (oRe20 * tRe108 + oIm20 * tRe20);
        out1024[idx + 41] = resIm20_s;
        out1024[idx + 985] = -resIm20_s;
        double resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe108);
        out1024[idx + 984] = resRe20_s;
        out1024[idx + 40] = resRe20_s;
        double resRe108_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe108);
        out1024[idx + 552] = resRe236_s;
        out1024[idx + 472] = resRe236_s;
        double resIm108_s = -eIm20 + (oRe20 * tRe108 + oIm20 * tRe20);
        out1024[idx + 473] = resIm236_s;
        out1024[idx + 553] = -resIm236_s;
        
        double oRe21 = out1024[idx + 554];
        double oIm21 = out1024[idx + 555];
        double eRe21 = out1024[idx + 42];
        double eIm21 = out1024[idx + 43];
        double tRe21 = 0x1.ef178a3e473c2p-1;
        double tRe107 = 0x1.04fb80e37fdafp-2;
        double resIm21_s = eIm21 + (oRe21 * tRe107 + oIm21 * tRe21);
        out1024[idx + 43] = resIm21_s;
        out1024[idx + 983] = -resIm21_s;
        double resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe107);
        out1024[idx + 982] = resRe21_s;
        out1024[idx + 42] = resRe21_s;
        double resRe107_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe107);
        out1024[idx + 554] = resRe235_s;
        out1024[idx + 470] = resRe235_s;
        double resIm107_s = -eIm21 + (oRe21 * tRe107 + oIm21 * tRe21);
        out1024[idx + 471] = resIm235_s;
        out1024[idx + 555] = -resIm235_s;
        
        double oRe22 = out1024[idx + 556];
        double oIm22 = out1024[idx + 557];
        double eRe22 = out1024[idx + 44];
        double eIm22 = out1024[idx + 45];
        double tRe22 = 0x1.ed740e7684963p-1;
        double tRe106 = 0x1.111d262b1f678p-2;
        double resIm22_s = eIm22 + (oRe22 * tRe106 + oIm22 * tRe22);
        out1024[idx + 45] = resIm22_s;
        out1024[idx + 981] = -resIm22_s;
        double resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe106);
        out1024[idx + 980] = resRe22_s;
        out1024[idx + 44] = resRe22_s;
        double resRe106_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe106);
        out1024[idx + 556] = resRe234_s;
        out1024[idx + 468] = resRe234_s;
        double resIm106_s = -eIm22 + (oRe22 * tRe106 + oIm22 * tRe22);
        out1024[idx + 469] = resIm234_s;
        out1024[idx + 557] = -resIm234_s;
        
        double oRe23 = out1024[idx + 558];
        double oIm23 = out1024[idx + 559];
        double eRe23 = out1024[idx + 46];
        double eIm23 = out1024[idx + 47];
        double tRe23 = 0x1.ebbd8c8df0b74p-1;
        double tRe105 = 0x1.1d3443f4cdb3dp-2;
        double resIm23_s = eIm23 + (oRe23 * tRe105 + oIm23 * tRe23);
        out1024[idx + 47] = resIm23_s;
        out1024[idx + 979] = -resIm23_s;
        double resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe105);
        out1024[idx + 978] = resRe23_s;
        out1024[idx + 46] = resRe23_s;
        double resRe105_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe105);
        out1024[idx + 558] = resRe233_s;
        out1024[idx + 466] = resRe233_s;
        double resIm105_s = -eIm23 + (oRe23 * tRe105 + oIm23 * tRe23);
        out1024[idx + 467] = resIm233_s;
        out1024[idx + 559] = -resIm233_s;
        
        double oRe24 = out1024[idx + 560];
        double oIm24 = out1024[idx + 561];
        double eRe24 = out1024[idx + 48];
        double eIm24 = out1024[idx + 49];
        double tRe24 = 0x1.e9f4156c62ddap-1;
        double tRe104 = 0x1.294062ed59f04p-2;
        double resIm24_s = eIm24 + (oRe24 * tRe104 + oIm24 * tRe24);
        out1024[idx + 49] = resIm24_s;
        out1024[idx + 977] = -resIm24_s;
        double resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe104);
        out1024[idx + 976] = resRe24_s;
        out1024[idx + 48] = resRe24_s;
        double resRe104_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe104);
        out1024[idx + 560] = resRe232_s;
        out1024[idx + 464] = resRe232_s;
        double resIm104_s = -eIm24 + (oRe24 * tRe104 + oIm24 * tRe24);
        out1024[idx + 465] = resIm232_s;
        out1024[idx + 561] = -resIm232_s;
        
        double oRe25 = out1024[idx + 562];
        double oIm25 = out1024[idx + 563];
        double eRe25 = out1024[idx + 50];
        double eIm25 = out1024[idx + 51];
        double tRe25 = 0x1.e817bab4cd10dp-1;
        double tRe103 = 0x1.35410c2e18154p-2;
        double resIm25_s = eIm25 + (oRe25 * tRe103 + oIm25 * tRe25);
        out1024[idx + 51] = resIm25_s;
        out1024[idx + 975] = -resIm25_s;
        double resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe103);
        out1024[idx + 974] = resRe25_s;
        out1024[idx + 50] = resRe25_s;
        double resRe103_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe103);
        out1024[idx + 562] = resRe231_s;
        out1024[idx + 462] = resRe231_s;
        double resIm103_s = -eIm25 + (oRe25 * tRe103 + oIm25 * tRe25);
        out1024[idx + 463] = resIm231_s;
        out1024[idx + 563] = -resIm231_s;
        
        double oRe26 = out1024[idx + 564];
        double oIm26 = out1024[idx + 565];
        double eRe26 = out1024[idx + 52];
        double eIm26 = out1024[idx + 53];
        double tRe26 = 0x1.e6288ec48e112p-1;
        double tRe102 = 0x1.4135c94176602p-2;
        double resIm26_s = eIm26 + (oRe26 * tRe102 + oIm26 * tRe26);
        out1024[idx + 53] = resIm26_s;
        out1024[idx + 973] = -resIm26_s;
        double resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe102);
        out1024[idx + 972] = resRe26_s;
        out1024[idx + 52] = resRe26_s;
        double resRe102_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe102);
        out1024[idx + 564] = resRe230_s;
        out1024[idx + 460] = resRe230_s;
        double resIm102_s = -eIm26 + (oRe26 * tRe102 + oIm26 * tRe26);
        out1024[idx + 461] = resIm230_s;
        out1024[idx + 565] = -resIm230_s;
        
        double oRe27 = out1024[idx + 566];
        double oIm27 = out1024[idx + 567];
        double eRe27 = out1024[idx + 54];
        double eIm27 = out1024[idx + 55];
        double tRe27 = 0x1.e426a4b2bc17ep-1;
        double tRe101 = 0x1.4d1e24278e76bp-2;
        double resIm27_s = eIm27 + (oRe27 * tRe101 + oIm27 * tRe27);
        out1024[idx + 55] = resIm27_s;
        out1024[idx + 971] = -resIm27_s;
        double resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe101);
        out1024[idx + 970] = resRe27_s;
        out1024[idx + 54] = resRe27_s;
        double resRe101_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe101);
        out1024[idx + 566] = resRe229_s;
        out1024[idx + 458] = resRe229_s;
        double resIm101_s = -eIm27 + (oRe27 * tRe101 + oIm27 * tRe27);
        out1024[idx + 459] = resIm229_s;
        out1024[idx + 567] = -resIm229_s;
        
        double oRe28 = out1024[idx + 568];
        double oIm28 = out1024[idx + 569];
        double eRe28 = out1024[idx + 56];
        double eIm28 = out1024[idx + 57];
        double tRe28 = 0x1.e212104f686e5p-1;
        double tRe100 = 0x1.58f9a75ab1fddp-2;
        double resIm28_s = eIm28 + (oRe28 * tRe100 + oIm28 * tRe28);
        out1024[idx + 57] = resIm28_s;
        out1024[idx + 969] = -resIm28_s;
        double resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe100);
        out1024[idx + 968] = resRe28_s;
        out1024[idx + 56] = resRe28_s;
        double resRe100_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe100);
        out1024[idx + 568] = resRe228_s;
        out1024[idx + 456] = resRe228_s;
        double resIm100_s = -eIm28 + (oRe28 * tRe100 + oIm28 * tRe28);
        out1024[idx + 457] = resIm228_s;
        out1024[idx + 569] = -resIm228_s;
        
        double oRe29 = out1024[idx + 570];
        double oIm29 = out1024[idx + 571];
        double eRe29 = out1024[idx + 58];
        double eIm29 = out1024[idx + 59];
        double tRe29 = 0x1.dfeae622dbe2bp-1;
        double tRe99 = 0x1.64c7ddd3f27c5p-2;
        double resIm29_s = eIm29 + (oRe29 * tRe99 + oIm29 * tRe29);
        out1024[idx + 59] = resIm29_s;
        out1024[idx + 967] = -resIm29_s;
        double resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe99);
        out1024[idx + 966] = resRe29_s;
        out1024[idx + 58] = resRe29_s;
        double resRe99_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe99);
        out1024[idx + 570] = resRe227_s;
        out1024[idx + 454] = resRe227_s;
        double resIm99_s = -eIm29 + (oRe29 * tRe99 + oIm29 * tRe29);
        out1024[idx + 455] = resIm227_s;
        out1024[idx + 571] = -resIm227_s;
        
        double oRe30 = out1024[idx + 572];
        double oIm30 = out1024[idx + 573];
        double eRe30 = out1024[idx + 60];
        double eIm30 = out1024[idx + 61];
        double tRe30 = 0x1.ddb13b6ccc23dp-1;
        double tRe98 = 0x1.7088530fa45a1p-2;
        double resIm30_s = eIm30 + (oRe30 * tRe98 + oIm30 * tRe30);
        out1024[idx + 61] = resIm30_s;
        out1024[idx + 965] = -resIm30_s;
        double resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe98);
        out1024[idx + 964] = resRe30_s;
        out1024[idx + 60] = resRe30_s;
        double resRe98_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe98);
        out1024[idx + 572] = resRe226_s;
        out1024[idx + 452] = resRe226_s;
        double resIm98_s = -eIm30 + (oRe30 * tRe98 + oIm30 * tRe30);
        out1024[idx + 453] = resIm226_s;
        out1024[idx + 573] = -resIm226_s;
        
        double oRe31 = out1024[idx + 574];
        double oIm31 = out1024[idx + 575];
        double eRe31 = out1024[idx + 62];
        double eIm31 = out1024[idx + 63];
        double tRe31 = 0x1.db6526238a09bp-1;
        double tRe97 = 0x1.7c3a9311dcce8p-2;
        double resIm31_s = eIm31 + (oRe31 * tRe97 + oIm31 * tRe31);
        out1024[idx + 63] = resIm31_s;
        out1024[idx + 963] = -resIm31_s;
        double resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe97);
        out1024[idx + 962] = resRe31_s;
        out1024[idx + 62] = resRe31_s;
        double resRe97_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe97);
        out1024[idx + 574] = resRe225_s;
        out1024[idx + 450] = resRe225_s;
        double resIm97_s = -eIm31 + (oRe31 * tRe97 + oIm31 * tRe31);
        out1024[idx + 451] = resIm225_s;
        out1024[idx + 575] = -resIm225_s;
        
        double oRe32 = out1024[idx + 576];
        double oIm32 = out1024[idx + 577];
        double eRe32 = out1024[idx + 64];
        double eIm32 = out1024[idx + 65];
        double tRe32 = 0x1.d906bcf328d46p-1;
        double tRe96 = 0x1.87de2a6aea964p-2;
        double resIm32_s = eIm32 + (oRe32 * tRe96 + oIm32 * tRe32);
        out1024[idx + 65] = resIm32_s;
        out1024[idx + 961] = -resIm32_s;
        double resRe32_s = eRe32 + (oRe32 * tRe32 - oIm32 * tRe96);
        out1024[idx + 960] = resRe32_s;
        out1024[idx + 64] = resRe32_s;
        double resRe96_s = eRe32 - (oRe32 * tRe32 - oIm32 * tRe96);
        out1024[idx + 576] = resRe224_s;
        out1024[idx + 448] = resRe224_s;
        double resIm96_s = -eIm32 + (oRe32 * tRe96 + oIm32 * tRe32);
        out1024[idx + 449] = resIm224_s;
        out1024[idx + 577] = -resIm224_s;
        
        double oRe33 = out1024[idx + 578];
        double oIm33 = out1024[idx + 579];
        double eRe33 = out1024[idx + 66];
        double eIm33 = out1024[idx + 67];
        double tRe33 = 0x1.d696173c9e68bp-1;
        double tRe95 = 0x1.9372a63bc93d7p-2;
        double resIm33_s = eIm33 + (oRe33 * tRe95 + oIm33 * tRe33);
        out1024[idx + 67] = resIm33_s;
        out1024[idx + 959] = -resIm33_s;
        double resRe33_s = eRe33 + (oRe33 * tRe33 - oIm33 * tRe95);
        out1024[idx + 958] = resRe33_s;
        out1024[idx + 66] = resRe33_s;
        double resRe95_s = eRe33 - (oRe33 * tRe33 - oIm33 * tRe95);
        out1024[idx + 578] = resRe223_s;
        out1024[idx + 446] = resRe223_s;
        double resIm95_s = -eIm33 + (oRe33 * tRe95 + oIm33 * tRe33);
        out1024[idx + 447] = resIm223_s;
        out1024[idx + 579] = -resIm223_s;
        
        double oRe34 = out1024[idx + 580];
        double oIm34 = out1024[idx + 581];
        double eRe34 = out1024[idx + 68];
        double eIm34 = out1024[idx + 69];
        double tRe34 = 0x1.d4134d14dc93ap-1;
        double tRe94 = 0x1.9ef7943a8ed89p-2;
        double resIm34_s = eIm34 + (oRe34 * tRe94 + oIm34 * tRe34);
        out1024[idx + 69] = resIm34_s;
        out1024[idx + 957] = -resIm34_s;
        double resRe34_s = eRe34 + (oRe34 * tRe34 - oIm34 * tRe94);
        out1024[idx + 956] = resRe34_s;
        out1024[idx + 68] = resRe34_s;
        double resRe94_s = eRe34 - (oRe34 * tRe34 - oIm34 * tRe94);
        out1024[idx + 580] = resRe222_s;
        out1024[idx + 444] = resRe222_s;
        double resIm94_s = -eIm34 + (oRe34 * tRe94 + oIm34 * tRe34);
        out1024[idx + 445] = resIm222_s;
        out1024[idx + 581] = -resIm222_s;
        
        double oRe35 = out1024[idx + 582];
        double oIm35 = out1024[idx + 583];
        double eRe35 = out1024[idx + 70];
        double eIm35 = out1024[idx + 71];
        double tRe35 = 0x1.d17e7743e35dcp-1;
        double tRe93 = 0x1.aa6c82b6d3fccp-2;
        double resIm35_s = eIm35 + (oRe35 * tRe93 + oIm35 * tRe35);
        out1024[idx + 71] = resIm35_s;
        out1024[idx + 955] = -resIm35_s;
        double resRe35_s = eRe35 + (oRe35 * tRe35 - oIm35 * tRe93);
        out1024[idx + 954] = resRe35_s;
        out1024[idx + 70] = resRe35_s;
        double resRe93_s = eRe35 - (oRe35 * tRe35 - oIm35 * tRe93);
        out1024[idx + 582] = resRe221_s;
        out1024[idx + 442] = resRe221_s;
        double resIm93_s = -eIm35 + (oRe35 * tRe93 + oIm35 * tRe35);
        out1024[idx + 443] = resIm221_s;
        out1024[idx + 583] = -resIm221_s;
        
        double oRe36 = out1024[idx + 584];
        double oIm36 = out1024[idx + 585];
        double eRe36 = out1024[idx + 72];
        double eIm36 = out1024[idx + 73];
        double tRe36 = 0x1.ced7af43cc773p-1;
        double tRe92 = 0x1.b5d1009e15cc2p-2;
        double resIm36_s = eIm36 + (oRe36 * tRe92 + oIm36 * tRe36);
        out1024[idx + 73] = resIm36_s;
        out1024[idx + 953] = -resIm36_s;
        double resRe36_s = eRe36 + (oRe36 * tRe36 - oIm36 * tRe92);
        out1024[idx + 952] = resRe36_s;
        out1024[idx + 72] = resRe36_s;
        double resRe92_s = eRe36 - (oRe36 * tRe36 - oIm36 * tRe92);
        out1024[idx + 584] = resRe220_s;
        out1024[idx + 440] = resRe220_s;
        double resIm92_s = -eIm36 + (oRe36 * tRe92 + oIm36 * tRe36);
        out1024[idx + 441] = resIm220_s;
        out1024[idx + 585] = -resIm220_s;
        
        double oRe37 = out1024[idx + 586];
        double oIm37 = out1024[idx + 587];
        double eRe37 = out1024[idx + 74];
        double eIm37 = out1024[idx + 75];
        double tRe37 = 0x1.cc1f0f3fcfc5cp-1;
        double tRe91 = 0x1.c1249d8011ee8p-2;
        double resIm37_s = eIm37 + (oRe37 * tRe91 + oIm37 * tRe37);
        out1024[idx + 75] = resIm37_s;
        out1024[idx + 951] = -resIm37_s;
        double resRe37_s = eRe37 + (oRe37 * tRe37 - oIm37 * tRe91);
        out1024[idx + 950] = resRe37_s;
        out1024[idx + 74] = resRe37_s;
        double resRe91_s = eRe37 - (oRe37 * tRe37 - oIm37 * tRe91);
        out1024[idx + 586] = resRe219_s;
        out1024[idx + 438] = resRe219_s;
        double resIm91_s = -eIm37 + (oRe37 * tRe91 + oIm37 * tRe37);
        out1024[idx + 439] = resIm219_s;
        out1024[idx + 587] = -resIm219_s;
        
        double oRe38 = out1024[idx + 588];
        double oIm38 = out1024[idx + 589];
        double eRe38 = out1024[idx + 76];
        double eIm38 = out1024[idx + 77];
        double tRe38 = 0x1.c954b213411f5p-1;
        double tRe90 = 0x1.cc66e9931c45ep-2;
        double resIm38_s = eIm38 + (oRe38 * tRe90 + oIm38 * tRe38);
        out1024[idx + 77] = resIm38_s;
        out1024[idx + 949] = -resIm38_s;
        double resRe38_s = eRe38 + (oRe38 * tRe38 - oIm38 * tRe90);
        out1024[idx + 948] = resRe38_s;
        out1024[idx + 76] = resRe38_s;
        double resRe90_s = eRe38 - (oRe38 * tRe38 - oIm38 * tRe90);
        out1024[idx + 588] = resRe218_s;
        out1024[idx + 436] = resRe218_s;
        double resIm90_s = -eIm38 + (oRe38 * tRe90 + oIm38 * tRe38);
        out1024[idx + 437] = resIm218_s;
        out1024[idx + 589] = -resIm218_s;
        
        double oRe39 = out1024[idx + 590];
        double oIm39 = out1024[idx + 591];
        double eRe39 = out1024[idx + 78];
        double eIm39 = out1024[idx + 79];
        double tRe39 = 0x1.c678b3488739bp-1;
        double tRe89 = 0x1.d79775b86e389p-2;
        double resIm39_s = eIm39 + (oRe39 * tRe89 + oIm39 * tRe39);
        out1024[idx + 79] = resIm39_s;
        out1024[idx + 947] = -resIm39_s;
        double resRe39_s = eRe39 + (oRe39 * tRe39 - oIm39 * tRe89);
        out1024[idx + 946] = resRe39_s;
        out1024[idx + 78] = resRe39_s;
        double resRe89_s = eRe39 - (oRe39 * tRe39 - oIm39 * tRe89);
        out1024[idx + 590] = resRe217_s;
        out1024[idx + 434] = resRe217_s;
        double resIm89_s = -eIm39 + (oRe39 * tRe89 + oIm39 * tRe39);
        out1024[idx + 435] = resIm217_s;
        out1024[idx + 591] = -resIm217_s;
        
        double oRe40 = out1024[idx + 592];
        double oIm40 = out1024[idx + 593];
        double eRe40 = out1024[idx + 80];
        double eIm40 = out1024[idx + 81];
        double tRe40 = 0x1.c38b2f180bdb1p-1;
        double tRe88 = 0x1.e2b5d3806f63ep-2;
        double resIm40_s = eIm40 + (oRe40 * tRe88 + oIm40 * tRe40);
        out1024[idx + 81] = resIm40_s;
        out1024[idx + 945] = -resIm40_s;
        double resRe40_s = eRe40 + (oRe40 * tRe40 - oIm40 * tRe88);
        out1024[idx + 944] = resRe40_s;
        out1024[idx + 80] = resRe40_s;
        double resRe88_s = eRe40 - (oRe40 * tRe40 - oIm40 * tRe88);
        out1024[idx + 592] = resRe216_s;
        out1024[idx + 432] = resRe216_s;
        double resIm88_s = -eIm40 + (oRe40 * tRe88 + oIm40 * tRe40);
        out1024[idx + 433] = resIm216_s;
        out1024[idx + 593] = -resIm216_s;
        
        double oRe41 = out1024[idx + 594];
        double oIm41 = out1024[idx + 595];
        double eRe41 = out1024[idx + 82];
        double eIm41 = out1024[idx + 83];
        double tRe41 = 0x1.c08c426725549p-1;
        double tRe87 = 0x1.edc1952ef78d8p-2;
        double resIm41_s = eIm41 + (oRe41 * tRe87 + oIm41 * tRe41);
        out1024[idx + 83] = resIm41_s;
        out1024[idx + 943] = -resIm41_s;
        double resRe41_s = eRe41 + (oRe41 * tRe41 - oIm41 * tRe87);
        out1024[idx + 942] = resRe41_s;
        out1024[idx + 82] = resRe41_s;
        double resRe87_s = eRe41 - (oRe41 * tRe41 - oIm41 * tRe87);
        out1024[idx + 594] = resRe215_s;
        out1024[idx + 430] = resRe215_s;
        double resIm87_s = -eIm41 + (oRe41 * tRe87 + oIm41 * tRe41);
        out1024[idx + 431] = resIm215_s;
        out1024[idx + 595] = -resIm215_s;
        
        double oRe42 = out1024[idx + 596];
        double oIm42 = out1024[idx + 597];
        double eRe42 = out1024[idx + 84];
        double eIm42 = out1024[idx + 85];
        double tRe42 = 0x1.bd7c0ac6f952ap-1;
        double tRe86 = 0x1.f8ba4dbf89abcp-2;
        double resIm42_s = eIm42 + (oRe42 * tRe86 + oIm42 * tRe42);
        out1024[idx + 85] = resIm42_s;
        out1024[idx + 941] = -resIm42_s;
        double resRe42_s = eRe42 + (oRe42 * tRe42 - oIm42 * tRe86);
        out1024[idx + 940] = resRe42_s;
        out1024[idx + 84] = resRe42_s;
        double resRe86_s = eRe42 - (oRe42 * tRe42 - oIm42 * tRe86);
        out1024[idx + 596] = resRe214_s;
        out1024[idx + 428] = resRe214_s;
        double resIm86_s = -eIm42 + (oRe42 * tRe86 + oIm42 * tRe42);
        out1024[idx + 429] = resIm214_s;
        out1024[idx + 597] = -resIm214_s;
        
        double oRe43 = out1024[idx + 598];
        double oIm43 = out1024[idx + 599];
        double eRe43 = out1024[idx + 86];
        double eIm43 = out1024[idx + 87];
        double tRe43 = 0x1.ba5aa673590d2p-1;
        double tRe85 = 0x1.01cfc874c3eb7p-1;
        double resIm43_s = eIm43 + (oRe43 * tRe85 + oIm43 * tRe43);
        out1024[idx + 87] = resIm43_s;
        out1024[idx + 939] = -resIm43_s;
        double resRe43_s = eRe43 + (oRe43 * tRe43 - oIm43 * tRe85);
        out1024[idx + 938] = resRe43_s;
        out1024[idx + 86] = resRe43_s;
        double resRe85_s = eRe43 - (oRe43 * tRe43 - oIm43 * tRe85);
        out1024[idx + 598] = resRe213_s;
        out1024[idx + 426] = resRe213_s;
        double resIm85_s = -eIm43 + (oRe43 * tRe85 + oIm43 * tRe43);
        out1024[idx + 427] = resIm213_s;
        out1024[idx + 599] = -resIm213_s;
        
        double oRe44 = out1024[idx + 600];
        double oIm44 = out1024[idx + 601];
        double eRe44 = out1024[idx + 88];
        double eIm44 = out1024[idx + 89];
        double tRe44 = 0x1.b728345196e3ep-1;
        double tRe84 = 0x1.073879922ffeep-1;
        double resIm44_s = eIm44 + (oRe44 * tRe84 + oIm44 * tRe44);
        out1024[idx + 89] = resIm44_s;
        out1024[idx + 937] = -resIm44_s;
        double resRe44_s = eRe44 + (oRe44 * tRe44 - oIm44 * tRe84);
        out1024[idx + 936] = resRe44_s;
        out1024[idx + 88] = resRe44_s;
        double resRe84_s = eRe44 - (oRe44 * tRe44 - oIm44 * tRe84);
        out1024[idx + 600] = resRe212_s;
        out1024[idx + 424] = resRe212_s;
        double resIm84_s = -eIm44 + (oRe44 * tRe84 + oIm44 * tRe44);
        out1024[idx + 425] = resIm212_s;
        out1024[idx + 601] = -resIm212_s;
        
        double oRe45 = out1024[idx + 602];
        double oIm45 = out1024[idx + 603];
        double eRe45 = out1024[idx + 90];
        double eIm45 = out1024[idx + 91];
        double tRe45 = 0x1.b3e4d3ef55712p-1;
        double tRe83 = 0x1.0c9704d5d898fp-1;
        double resIm45_s = eIm45 + (oRe45 * tRe83 + oIm45 * tRe45);
        out1024[idx + 91] = resIm45_s;
        out1024[idx + 935] = -resIm45_s;
        double resRe45_s = eRe45 + (oRe45 * tRe45 - oIm45 * tRe83);
        out1024[idx + 934] = resRe45_s;
        out1024[idx + 90] = resRe45_s;
        double resRe83_s = eRe45 - (oRe45 * tRe45 - oIm45 * tRe83);
        out1024[idx + 602] = resRe211_s;
        out1024[idx + 422] = resRe211_s;
        double resIm83_s = -eIm45 + (oRe45 * tRe83 + oIm45 * tRe45);
        out1024[idx + 423] = resIm211_s;
        out1024[idx + 603] = -resIm211_s;
        
        double oRe46 = out1024[idx + 604];
        double oIm46 = out1024[idx + 605];
        double eRe46 = out1024[idx + 92];
        double eIm46 = out1024[idx + 93];
        double tRe46 = 0x1.b090a581502p-1;
        double tRe82 = 0x1.11eb3541b4b24p-1;
        double resIm46_s = eIm46 + (oRe46 * tRe82 + oIm46 * tRe46);
        out1024[idx + 93] = resIm46_s;
        out1024[idx + 933] = -resIm46_s;
        double resRe46_s = eRe46 + (oRe46 * tRe46 - oIm46 * tRe82);
        out1024[idx + 932] = resRe46_s;
        out1024[idx + 92] = resRe46_s;
        double resRe82_s = eRe46 - (oRe46 * tRe46 - oIm46 * tRe82);
        out1024[idx + 604] = resRe210_s;
        out1024[idx + 420] = resRe210_s;
        double resIm82_s = -eIm46 + (oRe46 * tRe82 + oIm46 * tRe46);
        out1024[idx + 421] = resIm210_s;
        out1024[idx + 605] = -resIm210_s;
        
        double oRe47 = out1024[idx + 606];
        double oIm47 = out1024[idx + 607];
        double eRe47 = out1024[idx + 94];
        double eIm47 = out1024[idx + 95];
        double tRe47 = 0x1.ad2bc9e21d51p-1;
        double tRe81 = 0x1.1734d63dedb4ap-1;
        double resIm47_s = eIm47 + (oRe47 * tRe81 + oIm47 * tRe47);
        out1024[idx + 95] = resIm47_s;
        out1024[idx + 931] = -resIm47_s;
        double resRe47_s = eRe47 + (oRe47 * tRe47 - oIm47 * tRe81);
        out1024[idx + 930] = resRe47_s;
        out1024[idx + 94] = resRe47_s;
        double resRe81_s = eRe47 - (oRe47 * tRe47 - oIm47 * tRe81);
        out1024[idx + 606] = resRe209_s;
        out1024[idx + 418] = resRe209_s;
        double resIm81_s = -eIm47 + (oRe47 * tRe81 + oIm47 * tRe47);
        out1024[idx + 419] = resIm209_s;
        out1024[idx + 607] = -resIm209_s;
        
        double oRe48 = out1024[idx + 608];
        double oIm48 = out1024[idx + 609];
        double eRe48 = out1024[idx + 96];
        double eIm48 = out1024[idx + 97];
        double tRe48 = 0x1.a9b66290ea1a3p-1;
        double tRe80 = 0x1.1c73b39ae68c9p-1;
        double resIm48_s = eIm48 + (oRe48 * tRe80 + oIm48 * tRe48);
        out1024[idx + 97] = resIm48_s;
        out1024[idx + 929] = -resIm48_s;
        double resRe48_s = eRe48 + (oRe48 * tRe48 - oIm48 * tRe80);
        out1024[idx + 928] = resRe48_s;
        out1024[idx + 96] = resRe48_s;
        double resRe80_s = eRe48 - (oRe48 * tRe48 - oIm48 * tRe80);
        out1024[idx + 608] = resRe208_s;
        out1024[idx + 416] = resRe208_s;
        double resIm80_s = -eIm48 + (oRe48 * tRe80 + oIm48 * tRe48);
        out1024[idx + 417] = resIm208_s;
        out1024[idx + 609] = -resIm208_s;
        
        double oRe49 = out1024[idx + 610];
        double oIm49 = out1024[idx + 611];
        double eRe49 = out1024[idx + 98];
        double eIm49 = out1024[idx + 99];
        double tRe49 = 0x1.a63091b02fae2p-1;
        double tRe79 = 0x1.21a799933eb59p-1;
        double resIm49_s = eIm49 + (oRe49 * tRe79 + oIm49 * tRe49);
        out1024[idx + 99] = resIm49_s;
        out1024[idx + 927] = -resIm49_s;
        double resRe49_s = eRe49 + (oRe49 * tRe49 - oIm49 * tRe79);
        out1024[idx + 926] = resRe49_s;
        out1024[idx + 98] = resRe49_s;
        double resRe79_s = eRe49 - (oRe49 * tRe49 - oIm49 * tRe79);
        out1024[idx + 610] = resRe207_s;
        out1024[idx + 414] = resRe207_s;
        double resIm79_s = -eIm49 + (oRe49 * tRe79 + oIm49 * tRe49);
        out1024[idx + 415] = resIm207_s;
        out1024[idx + 611] = -resIm207_s;
        
        double oRe50 = out1024[idx + 612];
        double oIm50 = out1024[idx + 613];
        double eRe50 = out1024[idx + 100];
        double eIm50 = out1024[idx + 101];
        double tRe50 = 0x1.a29a7a0462782p-1;
        double tRe78 = 0x1.26d054cdd12ep-1;
        double resIm50_s = eIm50 + (oRe50 * tRe78 + oIm50 * tRe50);
        out1024[idx + 101] = resIm50_s;
        out1024[idx + 925] = -resIm50_s;
        double resRe50_s = eRe50 + (oRe50 * tRe50 - oIm50 * tRe78);
        out1024[idx + 924] = resRe50_s;
        out1024[idx + 100] = resRe50_s;
        double resRe78_s = eRe50 - (oRe50 * tRe50 - oIm50 * tRe78);
        out1024[idx + 612] = resRe206_s;
        out1024[idx + 412] = resRe206_s;
        double resIm78_s = -eIm50 + (oRe50 * tRe78 + oIm50 * tRe50);
        out1024[idx + 413] = resIm206_s;
        out1024[idx + 613] = -resIm206_s;
        
        double oRe51 = out1024[idx + 614];
        double oIm51 = out1024[idx + 615];
        double eRe51 = out1024[idx + 102];
        double eIm51 = out1024[idx + 103];
        double tRe51 = 0x1.9ef43ef29af94p-1;
        double tRe77 = 0x1.2bedb25faf3eap-1;
        double resIm51_s = eIm51 + (oRe51 * tRe77 + oIm51 * tRe51);
        out1024[idx + 103] = resIm51_s;
        out1024[idx + 923] = -resIm51_s;
        double resRe51_s = eRe51 + (oRe51 * tRe51 - oIm51 * tRe77);
        out1024[idx + 922] = resRe51_s;
        out1024[idx + 102] = resRe51_s;
        double resRe77_s = eRe51 - (oRe51 * tRe51 - oIm51 * tRe77);
        out1024[idx + 614] = resRe205_s;
        out1024[idx + 410] = resRe205_s;
        double resIm77_s = -eIm51 + (oRe51 * tRe77 + oIm51 * tRe51);
        out1024[idx + 411] = resIm205_s;
        out1024[idx + 615] = -resIm205_s;
        
        double oRe52 = out1024[idx + 616];
        double oIm52 = out1024[idx + 617];
        double eRe52 = out1024[idx + 104];
        double eIm52 = out1024[idx + 105];
        double tRe52 = 0x1.9b3e047f38741p-1;
        double tRe76 = 0x1.30ff7fce17036p-1;
        double resIm52_s = eIm52 + (oRe52 * tRe76 + oIm52 * tRe52);
        out1024[idx + 105] = resIm52_s;
        out1024[idx + 921] = -resIm52_s;
        double resRe52_s = eRe52 + (oRe52 * tRe52 - oIm52 * tRe76);
        out1024[idx + 920] = resRe52_s;
        out1024[idx + 104] = resRe52_s;
        double resRe76_s = eRe52 - (oRe52 * tRe52 - oIm52 * tRe76);
        out1024[idx + 616] = resRe204_s;
        out1024[idx + 408] = resRe204_s;
        double resIm76_s = -eIm52 + (oRe52 * tRe76 + oIm52 * tRe52);
        out1024[idx + 409] = resIm204_s;
        out1024[idx + 617] = -resIm204_s;
        
        double oRe53 = out1024[idx + 618];
        double oIm53 = out1024[idx + 619];
        double eRe53 = out1024[idx + 106];
        double eIm53 = out1024[idx + 107];
        double tRe53 = 0x1.9777ef4c7d742p-1;
        double tRe75 = 0x1.36058b10659f3p-1;
        double resIm53_s = eIm53 + (oRe53 * tRe75 + oIm53 * tRe53);
        out1024[idx + 107] = resIm53_s;
        out1024[idx + 919] = -resIm53_s;
        double resRe53_s = eRe53 + (oRe53 * tRe53 - oIm53 * tRe75);
        out1024[idx + 918] = resRe53_s;
        out1024[idx + 106] = resRe53_s;
        double resRe75_s = eRe53 - (oRe53 * tRe53 - oIm53 * tRe75);
        out1024[idx + 618] = resRe203_s;
        out1024[idx + 406] = resRe203_s;
        double resIm75_s = -eIm53 + (oRe53 * tRe75 + oIm53 * tRe53);
        out1024[idx + 407] = resIm203_s;
        out1024[idx + 619] = -resIm203_s;
        
        double oRe54 = out1024[idx + 620];
        double oIm54 = out1024[idx + 621];
        double eRe54 = out1024[idx + 108];
        double eIm54 = out1024[idx + 109];
        double tRe54 = 0x1.93a22499263fcp-1;
        double tRe74 = 0x1.3affa292050bap-1;
        double resIm54_s = eIm54 + (oRe54 * tRe74 + oIm54 * tRe54);
        out1024[idx + 109] = resIm54_s;
        out1024[idx + 917] = -resIm54_s;
        double resRe54_s = eRe54 + (oRe54 * tRe54 - oIm54 * tRe74);
        out1024[idx + 916] = resRe54_s;
        out1024[idx + 108] = resRe54_s;
        double resRe74_s = eRe54 - (oRe54 * tRe54 - oIm54 * tRe74);
        out1024[idx + 620] = resRe202_s;
        out1024[idx + 404] = resRe202_s;
        double resIm74_s = -eIm54 + (oRe54 * tRe74 + oIm54 * tRe54);
        out1024[idx + 405] = resIm202_s;
        out1024[idx + 621] = -resIm202_s;
        
        double oRe55 = out1024[idx + 622];
        double oIm55 = out1024[idx + 623];
        double eRe55 = out1024[idx + 110];
        double eIm55 = out1024[idx + 111];
        double tRe55 = 0x1.8fbcca3ef940dp-1;
        double tRe73 = 0x1.3fed9534556d5p-1;
        double resIm55_s = eIm55 + (oRe55 * tRe73 + oIm55 * tRe55);
        out1024[idx + 111] = resIm55_s;
        out1024[idx + 915] = -resIm55_s;
        double resRe55_s = eRe55 + (oRe55 * tRe55 - oIm55 * tRe73);
        out1024[idx + 914] = resRe55_s;
        out1024[idx + 110] = resRe55_s;
        double resRe73_s = eRe55 - (oRe55 * tRe55 - oIm55 * tRe73);
        out1024[idx + 622] = resRe201_s;
        out1024[idx + 402] = resRe201_s;
        double resIm73_s = -eIm55 + (oRe55 * tRe73 + oIm55 * tRe55);
        out1024[idx + 403] = resIm201_s;
        out1024[idx + 623] = -resIm201_s;
        
        double oRe56 = out1024[idx + 624];
        double oIm56 = out1024[idx + 625];
        double eRe56 = out1024[idx + 112];
        double eIm56 = out1024[idx + 113];
        double tRe56 = 0x1.8bc806b151741p-1;
        double tRe72 = 0x1.44cf325091dd7p-1;
        double resIm56_s = eIm56 + (oRe56 * tRe72 + oIm56 * tRe56);
        out1024[idx + 113] = resIm56_s;
        out1024[idx + 913] = -resIm56_s;
        double resRe56_s = eRe56 + (oRe56 * tRe56 - oIm56 * tRe72);
        out1024[idx + 912] = resRe56_s;
        out1024[idx + 112] = resRe56_s;
        double resRe72_s = eRe56 - (oRe56 * tRe56 - oIm56 * tRe72);
        out1024[idx + 624] = resRe200_s;
        out1024[idx + 400] = resRe200_s;
        double resIm72_s = -eIm56 + (oRe56 * tRe72 + oIm56 * tRe56);
        out1024[idx + 401] = resIm200_s;
        out1024[idx + 625] = -resIm200_s;
        
        double oRe57 = out1024[idx + 626];
        double oIm57 = out1024[idx + 627];
        double eRe57 = out1024[idx + 114];
        double eIm57 = out1024[idx + 115];
        double tRe57 = 0x1.87c400fba2ebfp-1;
        double tRe71 = 0x1.49a449b9b0939p-1;
        double resIm57_s = eIm57 + (oRe57 * tRe71 + oIm57 * tRe57);
        out1024[idx + 115] = resIm57_s;
        out1024[idx + 911] = -resIm57_s;
        double resRe57_s = eRe57 + (oRe57 * tRe57 - oIm57 * tRe71);
        out1024[idx + 910] = resRe57_s;
        out1024[idx + 114] = resRe57_s;
        double resRe71_s = eRe57 - (oRe57 * tRe57 - oIm57 * tRe71);
        out1024[idx + 626] = resRe199_s;
        out1024[idx + 398] = resRe199_s;
        double resIm71_s = -eIm57 + (oRe57 * tRe71 + oIm57 * tRe57);
        out1024[idx + 399] = resIm199_s;
        out1024[idx + 627] = -resIm199_s;
        
        double oRe58 = out1024[idx + 628];
        double oIm58 = out1024[idx + 629];
        double eRe58 = out1024[idx + 116];
        double eIm58 = out1024[idx + 117];
        double tRe58 = 0x1.83b0e0bff976ep-1;
        double tRe70 = 0x1.4e6cabbe3e5eap-1;
        double resIm58_s = eIm58 + (oRe58 * tRe70 + oIm58 * tRe58);
        out1024[idx + 117] = resIm58_s;
        out1024[idx + 909] = -resIm58_s;
        double resRe58_s = eRe58 + (oRe58 * tRe58 - oIm58 * tRe70);
        out1024[idx + 908] = resRe58_s;
        out1024[idx + 116] = resRe58_s;
        double resRe70_s = eRe58 - (oRe58 * tRe58 - oIm58 * tRe70);
        out1024[idx + 628] = resRe198_s;
        out1024[idx + 396] = resRe198_s;
        double resIm70_s = -eIm58 + (oRe58 * tRe70 + oIm58 * tRe58);
        out1024[idx + 397] = resIm198_s;
        out1024[idx + 629] = -resIm198_s;
        
        double oRe59 = out1024[idx + 630];
        double oIm59 = out1024[idx + 631];
        double eRe59 = out1024[idx + 118];
        double eIm59 = out1024[idx + 119];
        double tRe59 = 0x1.7f8ece3571771p-1;
        double tRe69 = 0x1.5328292a35596p-1;
        double resIm59_s = eIm59 + (oRe59 * tRe69 + oIm59 * tRe59);
        out1024[idx + 119] = resIm59_s;
        out1024[idx + 907] = -resIm59_s;
        double resRe59_s = eRe59 + (oRe59 * tRe59 - oIm59 * tRe69);
        out1024[idx + 906] = resRe59_s;
        out1024[idx + 118] = resRe59_s;
        double resRe69_s = eRe59 - (oRe59 * tRe59 - oIm59 * tRe69);
        out1024[idx + 630] = resRe197_s;
        out1024[idx + 394] = resRe197_s;
        double resIm69_s = -eIm59 + (oRe59 * tRe69 + oIm59 * tRe59);
        out1024[idx + 395] = resIm197_s;
        out1024[idx + 631] = -resIm197_s;
        
        double oRe60 = out1024[idx + 632];
        double oIm60 = out1024[idx + 633];
        double eRe60 = out1024[idx + 120];
        double eIm60 = out1024[idx + 121];
        double tRe60 = 0x1.7b5df226aafbp-1;
        double tRe68 = 0x1.57d69348cecap-1;
        double resIm60_s = eIm60 + (oRe60 * tRe68 + oIm60 * tRe60);
        out1024[idx + 121] = resIm60_s;
        out1024[idx + 905] = -resIm60_s;
        double resRe60_s = eRe60 + (oRe60 * tRe60 - oIm60 * tRe68);
        out1024[idx + 904] = resRe60_s;
        out1024[idx + 120] = resRe60_s;
        double resRe68_s = eRe60 - (oRe60 * tRe60 - oIm60 * tRe68);
        out1024[idx + 632] = resRe196_s;
        out1024[idx + 392] = resRe196_s;
        double resIm68_s = -eIm60 + (oRe60 * tRe68 + oIm60 * tRe60);
        out1024[idx + 393] = resIm196_s;
        out1024[idx + 633] = -resIm196_s;
        
        double oRe61 = out1024[idx + 634];
        double oIm61 = out1024[idx + 635];
        double eRe61 = out1024[idx + 122];
        double eIm61 = out1024[idx + 123];
        double tRe61 = 0x1.771e75f037261p-1;
        double tRe67 = 0x1.5c77bbe65018dp-1;
        double resIm61_s = eIm61 + (oRe61 * tRe67 + oIm61 * tRe61);
        out1024[idx + 123] = resIm61_s;
        out1024[idx + 903] = -resIm61_s;
        double resRe61_s = eRe61 + (oRe61 * tRe61 - oIm61 * tRe67);
        out1024[idx + 902] = resRe61_s;
        out1024[idx + 122] = resRe61_s;
        double resRe67_s = eRe61 - (oRe61 * tRe61 - oIm61 * tRe67);
        out1024[idx + 634] = resRe195_s;
        out1024[idx + 390] = resRe195_s;
        double resIm67_s = -eIm61 + (oRe61 * tRe67 + oIm61 * tRe61);
        out1024[idx + 391] = resIm195_s;
        out1024[idx + 635] = -resIm195_s;
        
        double oRe62 = out1024[idx + 636];
        double oIm62 = out1024[idx + 637];
        double eRe62 = out1024[idx + 124];
        double eIm62 = out1024[idx + 125];
        double tRe62 = 0x1.72d0837efff97p-1;
        double tRe66 = 0x1.610b7551d2cdfp-1;
        double resIm62_s = eIm62 + (oRe62 * tRe66 + oIm62 * tRe62);
        out1024[idx + 125] = resIm62_s;
        out1024[idx + 901] = -resIm62_s;
        double resRe62_s = eRe62 + (oRe62 * tRe62 - oIm62 * tRe66);
        out1024[idx + 900] = resRe62_s;
        out1024[idx + 124] = resRe62_s;
        double resRe66_s = eRe62 - (oRe62 * tRe62 - oIm62 * tRe66);
        out1024[idx + 636] = resRe194_s;
        out1024[idx + 388] = resRe194_s;
        double resIm66_s = -eIm62 + (oRe62 * tRe66 + oIm62 * tRe62);
        out1024[idx + 389] = resIm194_s;
        out1024[idx + 637] = -resIm194_s;
        
        double oRe63 = out1024[idx + 638];
        double oIm63 = out1024[idx + 639];
        double eRe63 = out1024[idx + 126];
        double eIm63 = out1024[idx + 127];
        double tRe63 = 0x1.6e74454eaa8aep-1;
        double tRe65 = 0x1.6591925f0783ep-1;
        double resIm63_s = eIm63 + (oRe63 * tRe65 + oIm63 * tRe63);
        out1024[idx + 127] = resIm63_s;
        out1024[idx + 899] = -resIm63_s;
        double resRe63_s = eRe63 + (oRe63 * tRe63 - oIm63 * tRe65);
        out1024[idx + 898] = resRe63_s;
        out1024[idx + 126] = resRe63_s;
        double resRe65_s = eRe63 - (oRe63 * tRe63 - oIm63 * tRe65);
        out1024[idx + 638] = resRe193_s;
        out1024[idx + 386] = resRe193_s;
        double resIm65_s = -eIm63 + (oRe63 * tRe65 + oIm63 * tRe63);
        out1024[idx + 387] = resIm193_s;
        out1024[idx + 639] = -resIm193_s;
        
        double oRe64 = out1024[idx + 640];
        double oIm64 = out1024[idx + 641];
        double eRe64 = out1024[idx + 128];
        double eIm64 = out1024[idx + 129];
        double tRe64 = 0x1.6a09e667f3bcdp-1;
        double resIm64_s = eIm64 + (oRe64 * tRe64 + oIm64 * tRe64);
        out1024[idx + 129] = resIm64_s;
        out1024[idx + 897] = -resIm64_s;
        double resRe64_s = eRe64 + (oRe64 * tRe64 - oIm64 * tRe64);
        out1024[idx + 896] = resRe64_s;
        out1024[idx + 128] = resRe64_s;
        double resRe64_s = eRe64 - (oRe64 * tRe64 - oIm64 * tRe64);
        out1024[idx + 640] = resRe192_s;
        out1024[idx + 384] = resRe192_s;
        double resIm64_s = -eIm64 + (oRe64 * tRe64 + oIm64 * tRe64);
        out1024[idx + 385] = resIm192_s;
        out1024[idx + 641] = -resIm192_s;
        
        double oRe65 = out1024[idx + 642];
        double oIm65 = out1024[idx + 643];
        double eRe65 = out1024[idx + 130];
        double eIm65 = out1024[idx + 131];
        double resIm65_s = eIm65 + (oRe65 * tRe63 + oIm65 * tRe65);
        out1024[idx + 131] = resIm65_s;
        out1024[idx + 895] = -resIm65_s;
        double resRe65_s = eRe65 + (oRe65 * tRe65 - oIm65 * tRe63);
        out1024[idx + 894] = resRe65_s;
        out1024[idx + 130] = resRe65_s;
        double resRe63_s = eRe65 - (oRe65 * tRe65 - oIm65 * tRe63);
        out1024[idx + 642] = resRe191_s;
        out1024[idx + 382] = resRe191_s;
        double resIm63_s = -eIm65 + (oRe65 * tRe63 + oIm65 * tRe65);
        out1024[idx + 383] = resIm191_s;
        out1024[idx + 643] = -resIm191_s;
        
        double oRe66 = out1024[idx + 644];
        double oIm66 = out1024[idx + 645];
        double eRe66 = out1024[idx + 132];
        double eIm66 = out1024[idx + 133];
        double resIm66_s = eIm66 + (oRe66 * tRe62 + oIm66 * tRe66);
        out1024[idx + 133] = resIm66_s;
        out1024[idx + 893] = -resIm66_s;
        double resRe66_s = eRe66 + (oRe66 * tRe66 - oIm66 * tRe62);
        out1024[idx + 892] = resRe66_s;
        out1024[idx + 132] = resRe66_s;
        double resRe62_s = eRe66 - (oRe66 * tRe66 - oIm66 * tRe62);
        out1024[idx + 644] = resRe190_s;
        out1024[idx + 380] = resRe190_s;
        double resIm62_s = -eIm66 + (oRe66 * tRe62 + oIm66 * tRe66);
        out1024[idx + 381] = resIm190_s;
        out1024[idx + 645] = -resIm190_s;
        
        double oRe67 = out1024[idx + 646];
        double oIm67 = out1024[idx + 647];
        double eRe67 = out1024[idx + 134];
        double eIm67 = out1024[idx + 135];
        double resIm67_s = eIm67 + (oRe67 * tRe61 + oIm67 * tRe67);
        out1024[idx + 135] = resIm67_s;
        out1024[idx + 891] = -resIm67_s;
        double resRe67_s = eRe67 + (oRe67 * tRe67 - oIm67 * tRe61);
        out1024[idx + 890] = resRe67_s;
        out1024[idx + 134] = resRe67_s;
        double resRe61_s = eRe67 - (oRe67 * tRe67 - oIm67 * tRe61);
        out1024[idx + 646] = resRe189_s;
        out1024[idx + 378] = resRe189_s;
        double resIm61_s = -eIm67 + (oRe67 * tRe61 + oIm67 * tRe67);
        out1024[idx + 379] = resIm189_s;
        out1024[idx + 647] = -resIm189_s;
        
        double oRe68 = out1024[idx + 648];
        double oIm68 = out1024[idx + 649];
        double eRe68 = out1024[idx + 136];
        double eIm68 = out1024[idx + 137];
        double resIm68_s = eIm68 + (oRe68 * tRe60 + oIm68 * tRe68);
        out1024[idx + 137] = resIm68_s;
        out1024[idx + 889] = -resIm68_s;
        double resRe68_s = eRe68 + (oRe68 * tRe68 - oIm68 * tRe60);
        out1024[idx + 888] = resRe68_s;
        out1024[idx + 136] = resRe68_s;
        double resRe60_s = eRe68 - (oRe68 * tRe68 - oIm68 * tRe60);
        out1024[idx + 648] = resRe188_s;
        out1024[idx + 376] = resRe188_s;
        double resIm60_s = -eIm68 + (oRe68 * tRe60 + oIm68 * tRe68);
        out1024[idx + 377] = resIm188_s;
        out1024[idx + 649] = -resIm188_s;
        
        double oRe69 = out1024[idx + 650];
        double oIm69 = out1024[idx + 651];
        double eRe69 = out1024[idx + 138];
        double eIm69 = out1024[idx + 139];
        double resIm69_s = eIm69 + (oRe69 * tRe59 + oIm69 * tRe69);
        out1024[idx + 139] = resIm69_s;
        out1024[idx + 887] = -resIm69_s;
        double resRe69_s = eRe69 + (oRe69 * tRe69 - oIm69 * tRe59);
        out1024[idx + 886] = resRe69_s;
        out1024[idx + 138] = resRe69_s;
        double resRe59_s = eRe69 - (oRe69 * tRe69 - oIm69 * tRe59);
        out1024[idx + 650] = resRe187_s;
        out1024[idx + 374] = resRe187_s;
        double resIm59_s = -eIm69 + (oRe69 * tRe59 + oIm69 * tRe69);
        out1024[idx + 375] = resIm187_s;
        out1024[idx + 651] = -resIm187_s;
        
        double oRe70 = out1024[idx + 652];
        double oIm70 = out1024[idx + 653];
        double eRe70 = out1024[idx + 140];
        double eIm70 = out1024[idx + 141];
        double resIm70_s = eIm70 + (oRe70 * tRe58 + oIm70 * tRe70);
        out1024[idx + 141] = resIm70_s;
        out1024[idx + 885] = -resIm70_s;
        double resRe70_s = eRe70 + (oRe70 * tRe70 - oIm70 * tRe58);
        out1024[idx + 884] = resRe70_s;
        out1024[idx + 140] = resRe70_s;
        double resRe58_s = eRe70 - (oRe70 * tRe70 - oIm70 * tRe58);
        out1024[idx + 652] = resRe186_s;
        out1024[idx + 372] = resRe186_s;
        double resIm58_s = -eIm70 + (oRe70 * tRe58 + oIm70 * tRe70);
        out1024[idx + 373] = resIm186_s;
        out1024[idx + 653] = -resIm186_s;
        
        double oRe71 = out1024[idx + 654];
        double oIm71 = out1024[idx + 655];
        double eRe71 = out1024[idx + 142];
        double eIm71 = out1024[idx + 143];
        double resIm71_s = eIm71 + (oRe71 * tRe57 + oIm71 * tRe71);
        out1024[idx + 143] = resIm71_s;
        out1024[idx + 883] = -resIm71_s;
        double resRe71_s = eRe71 + (oRe71 * tRe71 - oIm71 * tRe57);
        out1024[idx + 882] = resRe71_s;
        out1024[idx + 142] = resRe71_s;
        double resRe57_s = eRe71 - (oRe71 * tRe71 - oIm71 * tRe57);
        out1024[idx + 654] = resRe185_s;
        out1024[idx + 370] = resRe185_s;
        double resIm57_s = -eIm71 + (oRe71 * tRe57 + oIm71 * tRe71);
        out1024[idx + 371] = resIm185_s;
        out1024[idx + 655] = -resIm185_s;
        
        double oRe72 = out1024[idx + 656];
        double oIm72 = out1024[idx + 657];
        double eRe72 = out1024[idx + 144];
        double eIm72 = out1024[idx + 145];
        double resIm72_s = eIm72 + (oRe72 * tRe56 + oIm72 * tRe72);
        out1024[idx + 145] = resIm72_s;
        out1024[idx + 881] = -resIm72_s;
        double resRe72_s = eRe72 + (oRe72 * tRe72 - oIm72 * tRe56);
        out1024[idx + 880] = resRe72_s;
        out1024[idx + 144] = resRe72_s;
        double resRe56_s = eRe72 - (oRe72 * tRe72 - oIm72 * tRe56);
        out1024[idx + 656] = resRe184_s;
        out1024[idx + 368] = resRe184_s;
        double resIm56_s = -eIm72 + (oRe72 * tRe56 + oIm72 * tRe72);
        out1024[idx + 369] = resIm184_s;
        out1024[idx + 657] = -resIm184_s;
        
        double oRe73 = out1024[idx + 658];
        double oIm73 = out1024[idx + 659];
        double eRe73 = out1024[idx + 146];
        double eIm73 = out1024[idx + 147];
        double resIm73_s = eIm73 + (oRe73 * tRe55 + oIm73 * tRe73);
        out1024[idx + 147] = resIm73_s;
        out1024[idx + 879] = -resIm73_s;
        double resRe73_s = eRe73 + (oRe73 * tRe73 - oIm73 * tRe55);
        out1024[idx + 878] = resRe73_s;
        out1024[idx + 146] = resRe73_s;
        double resRe55_s = eRe73 - (oRe73 * tRe73 - oIm73 * tRe55);
        out1024[idx + 658] = resRe183_s;
        out1024[idx + 366] = resRe183_s;
        double resIm55_s = -eIm73 + (oRe73 * tRe55 + oIm73 * tRe73);
        out1024[idx + 367] = resIm183_s;
        out1024[idx + 659] = -resIm183_s;
        
        double oRe74 = out1024[idx + 660];
        double oIm74 = out1024[idx + 661];
        double eRe74 = out1024[idx + 148];
        double eIm74 = out1024[idx + 149];
        double resIm74_s = eIm74 + (oRe74 * tRe54 + oIm74 * tRe74);
        out1024[idx + 149] = resIm74_s;
        out1024[idx + 877] = -resIm74_s;
        double resRe74_s = eRe74 + (oRe74 * tRe74 - oIm74 * tRe54);
        out1024[idx + 876] = resRe74_s;
        out1024[idx + 148] = resRe74_s;
        double resRe54_s = eRe74 - (oRe74 * tRe74 - oIm74 * tRe54);
        out1024[idx + 660] = resRe182_s;
        out1024[idx + 364] = resRe182_s;
        double resIm54_s = -eIm74 + (oRe74 * tRe54 + oIm74 * tRe74);
        out1024[idx + 365] = resIm182_s;
        out1024[idx + 661] = -resIm182_s;
        
        double oRe75 = out1024[idx + 662];
        double oIm75 = out1024[idx + 663];
        double eRe75 = out1024[idx + 150];
        double eIm75 = out1024[idx + 151];
        double resIm75_s = eIm75 + (oRe75 * tRe53 + oIm75 * tRe75);
        out1024[idx + 151] = resIm75_s;
        out1024[idx + 875] = -resIm75_s;
        double resRe75_s = eRe75 + (oRe75 * tRe75 - oIm75 * tRe53);
        out1024[idx + 874] = resRe75_s;
        out1024[idx + 150] = resRe75_s;
        double resRe53_s = eRe75 - (oRe75 * tRe75 - oIm75 * tRe53);
        out1024[idx + 662] = resRe181_s;
        out1024[idx + 362] = resRe181_s;
        double resIm53_s = -eIm75 + (oRe75 * tRe53 + oIm75 * tRe75);
        out1024[idx + 363] = resIm181_s;
        out1024[idx + 663] = -resIm181_s;
        
        double oRe76 = out1024[idx + 664];
        double oIm76 = out1024[idx + 665];
        double eRe76 = out1024[idx + 152];
        double eIm76 = out1024[idx + 153];
        double resIm76_s = eIm76 + (oRe76 * tRe52 + oIm76 * tRe76);
        out1024[idx + 153] = resIm76_s;
        out1024[idx + 873] = -resIm76_s;
        double resRe76_s = eRe76 + (oRe76 * tRe76 - oIm76 * tRe52);
        out1024[idx + 872] = resRe76_s;
        out1024[idx + 152] = resRe76_s;
        double resRe52_s = eRe76 - (oRe76 * tRe76 - oIm76 * tRe52);
        out1024[idx + 664] = resRe180_s;
        out1024[idx + 360] = resRe180_s;
        double resIm52_s = -eIm76 + (oRe76 * tRe52 + oIm76 * tRe76);
        out1024[idx + 361] = resIm180_s;
        out1024[idx + 665] = -resIm180_s;
        
        double oRe77 = out1024[idx + 666];
        double oIm77 = out1024[idx + 667];
        double eRe77 = out1024[idx + 154];
        double eIm77 = out1024[idx + 155];
        double resIm77_s = eIm77 + (oRe77 * tRe51 + oIm77 * tRe77);
        out1024[idx + 155] = resIm77_s;
        out1024[idx + 871] = -resIm77_s;
        double resRe77_s = eRe77 + (oRe77 * tRe77 - oIm77 * tRe51);
        out1024[idx + 870] = resRe77_s;
        out1024[idx + 154] = resRe77_s;
        double resRe51_s = eRe77 - (oRe77 * tRe77 - oIm77 * tRe51);
        out1024[idx + 666] = resRe179_s;
        out1024[idx + 358] = resRe179_s;
        double resIm51_s = -eIm77 + (oRe77 * tRe51 + oIm77 * tRe77);
        out1024[idx + 359] = resIm179_s;
        out1024[idx + 667] = -resIm179_s;
        
        double oRe78 = out1024[idx + 668];
        double oIm78 = out1024[idx + 669];
        double eRe78 = out1024[idx + 156];
        double eIm78 = out1024[idx + 157];
        double resIm78_s = eIm78 + (oRe78 * tRe50 + oIm78 * tRe78);
        out1024[idx + 157] = resIm78_s;
        out1024[idx + 869] = -resIm78_s;
        double resRe78_s = eRe78 + (oRe78 * tRe78 - oIm78 * tRe50);
        out1024[idx + 868] = resRe78_s;
        out1024[idx + 156] = resRe78_s;
        double resRe50_s = eRe78 - (oRe78 * tRe78 - oIm78 * tRe50);
        out1024[idx + 668] = resRe178_s;
        out1024[idx + 356] = resRe178_s;
        double resIm50_s = -eIm78 + (oRe78 * tRe50 + oIm78 * tRe78);
        out1024[idx + 357] = resIm178_s;
        out1024[idx + 669] = -resIm178_s;
        
        double oRe79 = out1024[idx + 670];
        double oIm79 = out1024[idx + 671];
        double eRe79 = out1024[idx + 158];
        double eIm79 = out1024[idx + 159];
        double resIm79_s = eIm79 + (oRe79 * tRe49 + oIm79 * tRe79);
        out1024[idx + 159] = resIm79_s;
        out1024[idx + 867] = -resIm79_s;
        double resRe79_s = eRe79 + (oRe79 * tRe79 - oIm79 * tRe49);
        out1024[idx + 866] = resRe79_s;
        out1024[idx + 158] = resRe79_s;
        double resRe49_s = eRe79 - (oRe79 * tRe79 - oIm79 * tRe49);
        out1024[idx + 670] = resRe177_s;
        out1024[idx + 354] = resRe177_s;
        double resIm49_s = -eIm79 + (oRe79 * tRe49 + oIm79 * tRe79);
        out1024[idx + 355] = resIm177_s;
        out1024[idx + 671] = -resIm177_s;
        
        double oRe80 = out1024[idx + 672];
        double oIm80 = out1024[idx + 673];
        double eRe80 = out1024[idx + 160];
        double eIm80 = out1024[idx + 161];
        double resIm80_s = eIm80 + (oRe80 * tRe48 + oIm80 * tRe80);
        out1024[idx + 161] = resIm80_s;
        out1024[idx + 865] = -resIm80_s;
        double resRe80_s = eRe80 + (oRe80 * tRe80 - oIm80 * tRe48);
        out1024[idx + 864] = resRe80_s;
        out1024[idx + 160] = resRe80_s;
        double resRe48_s = eRe80 - (oRe80 * tRe80 - oIm80 * tRe48);
        out1024[idx + 672] = resRe176_s;
        out1024[idx + 352] = resRe176_s;
        double resIm48_s = -eIm80 + (oRe80 * tRe48 + oIm80 * tRe80);
        out1024[idx + 353] = resIm176_s;
        out1024[idx + 673] = -resIm176_s;
        
        double oRe81 = out1024[idx + 674];
        double oIm81 = out1024[idx + 675];
        double eRe81 = out1024[idx + 162];
        double eIm81 = out1024[idx + 163];
        double resIm81_s = eIm81 + (oRe81 * tRe47 + oIm81 * tRe81);
        out1024[idx + 163] = resIm81_s;
        out1024[idx + 863] = -resIm81_s;
        double resRe81_s = eRe81 + (oRe81 * tRe81 - oIm81 * tRe47);
        out1024[idx + 862] = resRe81_s;
        out1024[idx + 162] = resRe81_s;
        double resRe47_s = eRe81 - (oRe81 * tRe81 - oIm81 * tRe47);
        out1024[idx + 674] = resRe175_s;
        out1024[idx + 350] = resRe175_s;
        double resIm47_s = -eIm81 + (oRe81 * tRe47 + oIm81 * tRe81);
        out1024[idx + 351] = resIm175_s;
        out1024[idx + 675] = -resIm175_s;
        
        double oRe82 = out1024[idx + 676];
        double oIm82 = out1024[idx + 677];
        double eRe82 = out1024[idx + 164];
        double eIm82 = out1024[idx + 165];
        double resIm82_s = eIm82 + (oRe82 * tRe46 + oIm82 * tRe82);
        out1024[idx + 165] = resIm82_s;
        out1024[idx + 861] = -resIm82_s;
        double resRe82_s = eRe82 + (oRe82 * tRe82 - oIm82 * tRe46);
        out1024[idx + 860] = resRe82_s;
        out1024[idx + 164] = resRe82_s;
        double resRe46_s = eRe82 - (oRe82 * tRe82 - oIm82 * tRe46);
        out1024[idx + 676] = resRe174_s;
        out1024[idx + 348] = resRe174_s;
        double resIm46_s = -eIm82 + (oRe82 * tRe46 + oIm82 * tRe82);
        out1024[idx + 349] = resIm174_s;
        out1024[idx + 677] = -resIm174_s;
        
        double oRe83 = out1024[idx + 678];
        double oIm83 = out1024[idx + 679];
        double eRe83 = out1024[idx + 166];
        double eIm83 = out1024[idx + 167];
        double resIm83_s = eIm83 + (oRe83 * tRe45 + oIm83 * tRe83);
        out1024[idx + 167] = resIm83_s;
        out1024[idx + 859] = -resIm83_s;
        double resRe83_s = eRe83 + (oRe83 * tRe83 - oIm83 * tRe45);
        out1024[idx + 858] = resRe83_s;
        out1024[idx + 166] = resRe83_s;
        double resRe45_s = eRe83 - (oRe83 * tRe83 - oIm83 * tRe45);
        out1024[idx + 678] = resRe173_s;
        out1024[idx + 346] = resRe173_s;
        double resIm45_s = -eIm83 + (oRe83 * tRe45 + oIm83 * tRe83);
        out1024[idx + 347] = resIm173_s;
        out1024[idx + 679] = -resIm173_s;
        
        double oRe84 = out1024[idx + 680];
        double oIm84 = out1024[idx + 681];
        double eRe84 = out1024[idx + 168];
        double eIm84 = out1024[idx + 169];
        double resIm84_s = eIm84 + (oRe84 * tRe44 + oIm84 * tRe84);
        out1024[idx + 169] = resIm84_s;
        out1024[idx + 857] = -resIm84_s;
        double resRe84_s = eRe84 + (oRe84 * tRe84 - oIm84 * tRe44);
        out1024[idx + 856] = resRe84_s;
        out1024[idx + 168] = resRe84_s;
        double resRe44_s = eRe84 - (oRe84 * tRe84 - oIm84 * tRe44);
        out1024[idx + 680] = resRe172_s;
        out1024[idx + 344] = resRe172_s;
        double resIm44_s = -eIm84 + (oRe84 * tRe44 + oIm84 * tRe84);
        out1024[idx + 345] = resIm172_s;
        out1024[idx + 681] = -resIm172_s;
        
        double oRe85 = out1024[idx + 682];
        double oIm85 = out1024[idx + 683];
        double eRe85 = out1024[idx + 170];
        double eIm85 = out1024[idx + 171];
        double resIm85_s = eIm85 + (oRe85 * tRe43 + oIm85 * tRe85);
        out1024[idx + 171] = resIm85_s;
        out1024[idx + 855] = -resIm85_s;
        double resRe85_s = eRe85 + (oRe85 * tRe85 - oIm85 * tRe43);
        out1024[idx + 854] = resRe85_s;
        out1024[idx + 170] = resRe85_s;
        double resRe43_s = eRe85 - (oRe85 * tRe85 - oIm85 * tRe43);
        out1024[idx + 682] = resRe171_s;
        out1024[idx + 342] = resRe171_s;
        double resIm43_s = -eIm85 + (oRe85 * tRe43 + oIm85 * tRe85);
        out1024[idx + 343] = resIm171_s;
        out1024[idx + 683] = -resIm171_s;
        
        double oRe86 = out1024[idx + 684];
        double oIm86 = out1024[idx + 685];
        double eRe86 = out1024[idx + 172];
        double eIm86 = out1024[idx + 173];
        double resIm86_s = eIm86 + (oRe86 * tRe42 + oIm86 * tRe86);
        out1024[idx + 173] = resIm86_s;
        out1024[idx + 853] = -resIm86_s;
        double resRe86_s = eRe86 + (oRe86 * tRe86 - oIm86 * tRe42);
        out1024[idx + 852] = resRe86_s;
        out1024[idx + 172] = resRe86_s;
        double resRe42_s = eRe86 - (oRe86 * tRe86 - oIm86 * tRe42);
        out1024[idx + 684] = resRe170_s;
        out1024[idx + 340] = resRe170_s;
        double resIm42_s = -eIm86 + (oRe86 * tRe42 + oIm86 * tRe86);
        out1024[idx + 341] = resIm170_s;
        out1024[idx + 685] = -resIm170_s;
        
        double oRe87 = out1024[idx + 686];
        double oIm87 = out1024[idx + 687];
        double eRe87 = out1024[idx + 174];
        double eIm87 = out1024[idx + 175];
        double resIm87_s = eIm87 + (oRe87 * tRe41 + oIm87 * tRe87);
        out1024[idx + 175] = resIm87_s;
        out1024[idx + 851] = -resIm87_s;
        double resRe87_s = eRe87 + (oRe87 * tRe87 - oIm87 * tRe41);
        out1024[idx + 850] = resRe87_s;
        out1024[idx + 174] = resRe87_s;
        double resRe41_s = eRe87 - (oRe87 * tRe87 - oIm87 * tRe41);
        out1024[idx + 686] = resRe169_s;
        out1024[idx + 338] = resRe169_s;
        double resIm41_s = -eIm87 + (oRe87 * tRe41 + oIm87 * tRe87);
        out1024[idx + 339] = resIm169_s;
        out1024[idx + 687] = -resIm169_s;
        
        double oRe88 = out1024[idx + 688];
        double oIm88 = out1024[idx + 689];
        double eRe88 = out1024[idx + 176];
        double eIm88 = out1024[idx + 177];
        double resIm88_s = eIm88 + (oRe88 * tRe40 + oIm88 * tRe88);
        out1024[idx + 177] = resIm88_s;
        out1024[idx + 849] = -resIm88_s;
        double resRe88_s = eRe88 + (oRe88 * tRe88 - oIm88 * tRe40);
        out1024[idx + 848] = resRe88_s;
        out1024[idx + 176] = resRe88_s;
        double resRe40_s = eRe88 - (oRe88 * tRe88 - oIm88 * tRe40);
        out1024[idx + 688] = resRe168_s;
        out1024[idx + 336] = resRe168_s;
        double resIm40_s = -eIm88 + (oRe88 * tRe40 + oIm88 * tRe88);
        out1024[idx + 337] = resIm168_s;
        out1024[idx + 689] = -resIm168_s;
        
        double oRe89 = out1024[idx + 690];
        double oIm89 = out1024[idx + 691];
        double eRe89 = out1024[idx + 178];
        double eIm89 = out1024[idx + 179];
        double resIm89_s = eIm89 + (oRe89 * tRe39 + oIm89 * tRe89);
        out1024[idx + 179] = resIm89_s;
        out1024[idx + 847] = -resIm89_s;
        double resRe89_s = eRe89 + (oRe89 * tRe89 - oIm89 * tRe39);
        out1024[idx + 846] = resRe89_s;
        out1024[idx + 178] = resRe89_s;
        double resRe39_s = eRe89 - (oRe89 * tRe89 - oIm89 * tRe39);
        out1024[idx + 690] = resRe167_s;
        out1024[idx + 334] = resRe167_s;
        double resIm39_s = -eIm89 + (oRe89 * tRe39 + oIm89 * tRe89);
        out1024[idx + 335] = resIm167_s;
        out1024[idx + 691] = -resIm167_s;
        
        double oRe90 = out1024[idx + 692];
        double oIm90 = out1024[idx + 693];
        double eRe90 = out1024[idx + 180];
        double eIm90 = out1024[idx + 181];
        double resIm90_s = eIm90 + (oRe90 * tRe38 + oIm90 * tRe90);
        out1024[idx + 181] = resIm90_s;
        out1024[idx + 845] = -resIm90_s;
        double resRe90_s = eRe90 + (oRe90 * tRe90 - oIm90 * tRe38);
        out1024[idx + 844] = resRe90_s;
        out1024[idx + 180] = resRe90_s;
        double resRe38_s = eRe90 - (oRe90 * tRe90 - oIm90 * tRe38);
        out1024[idx + 692] = resRe166_s;
        out1024[idx + 332] = resRe166_s;
        double resIm38_s = -eIm90 + (oRe90 * tRe38 + oIm90 * tRe90);
        out1024[idx + 333] = resIm166_s;
        out1024[idx + 693] = -resIm166_s;
        
        double oRe91 = out1024[idx + 694];
        double oIm91 = out1024[idx + 695];
        double eRe91 = out1024[idx + 182];
        double eIm91 = out1024[idx + 183];
        double resIm91_s = eIm91 + (oRe91 * tRe37 + oIm91 * tRe91);
        out1024[idx + 183] = resIm91_s;
        out1024[idx + 843] = -resIm91_s;
        double resRe91_s = eRe91 + (oRe91 * tRe91 - oIm91 * tRe37);
        out1024[idx + 842] = resRe91_s;
        out1024[idx + 182] = resRe91_s;
        double resRe37_s = eRe91 - (oRe91 * tRe91 - oIm91 * tRe37);
        out1024[idx + 694] = resRe165_s;
        out1024[idx + 330] = resRe165_s;
        double resIm37_s = -eIm91 + (oRe91 * tRe37 + oIm91 * tRe91);
        out1024[idx + 331] = resIm165_s;
        out1024[idx + 695] = -resIm165_s;
        
        double oRe92 = out1024[idx + 696];
        double oIm92 = out1024[idx + 697];
        double eRe92 = out1024[idx + 184];
        double eIm92 = out1024[idx + 185];
        double resIm92_s = eIm92 + (oRe92 * tRe36 + oIm92 * tRe92);
        out1024[idx + 185] = resIm92_s;
        out1024[idx + 841] = -resIm92_s;
        double resRe92_s = eRe92 + (oRe92 * tRe92 - oIm92 * tRe36);
        out1024[idx + 840] = resRe92_s;
        out1024[idx + 184] = resRe92_s;
        double resRe36_s = eRe92 - (oRe92 * tRe92 - oIm92 * tRe36);
        out1024[idx + 696] = resRe164_s;
        out1024[idx + 328] = resRe164_s;
        double resIm36_s = -eIm92 + (oRe92 * tRe36 + oIm92 * tRe92);
        out1024[idx + 329] = resIm164_s;
        out1024[idx + 697] = -resIm164_s;
        
        double oRe93 = out1024[idx + 698];
        double oIm93 = out1024[idx + 699];
        double eRe93 = out1024[idx + 186];
        double eIm93 = out1024[idx + 187];
        double resIm93_s = eIm93 + (oRe93 * tRe35 + oIm93 * tRe93);
        out1024[idx + 187] = resIm93_s;
        out1024[idx + 839] = -resIm93_s;
        double resRe93_s = eRe93 + (oRe93 * tRe93 - oIm93 * tRe35);
        out1024[idx + 838] = resRe93_s;
        out1024[idx + 186] = resRe93_s;
        double resRe35_s = eRe93 - (oRe93 * tRe93 - oIm93 * tRe35);
        out1024[idx + 698] = resRe163_s;
        out1024[idx + 326] = resRe163_s;
        double resIm35_s = -eIm93 + (oRe93 * tRe35 + oIm93 * tRe93);
        out1024[idx + 327] = resIm163_s;
        out1024[idx + 699] = -resIm163_s;
        
        double oRe94 = out1024[idx + 700];
        double oIm94 = out1024[idx + 701];
        double eRe94 = out1024[idx + 188];
        double eIm94 = out1024[idx + 189];
        double resIm94_s = eIm94 + (oRe94 * tRe34 + oIm94 * tRe94);
        out1024[idx + 189] = resIm94_s;
        out1024[idx + 837] = -resIm94_s;
        double resRe94_s = eRe94 + (oRe94 * tRe94 - oIm94 * tRe34);
        out1024[idx + 836] = resRe94_s;
        out1024[idx + 188] = resRe94_s;
        double resRe34_s = eRe94 - (oRe94 * tRe94 - oIm94 * tRe34);
        out1024[idx + 700] = resRe162_s;
        out1024[idx + 324] = resRe162_s;
        double resIm34_s = -eIm94 + (oRe94 * tRe34 + oIm94 * tRe94);
        out1024[idx + 325] = resIm162_s;
        out1024[idx + 701] = -resIm162_s;
        
        double oRe95 = out1024[idx + 702];
        double oIm95 = out1024[idx + 703];
        double eRe95 = out1024[idx + 190];
        double eIm95 = out1024[idx + 191];
        double resIm95_s = eIm95 + (oRe95 * tRe33 + oIm95 * tRe95);
        out1024[idx + 191] = resIm95_s;
        out1024[idx + 835] = -resIm95_s;
        double resRe95_s = eRe95 + (oRe95 * tRe95 - oIm95 * tRe33);
        out1024[idx + 834] = resRe95_s;
        out1024[idx + 190] = resRe95_s;
        double resRe33_s = eRe95 - (oRe95 * tRe95 - oIm95 * tRe33);
        out1024[idx + 702] = resRe161_s;
        out1024[idx + 322] = resRe161_s;
        double resIm33_s = -eIm95 + (oRe95 * tRe33 + oIm95 * tRe95);
        out1024[idx + 323] = resIm161_s;
        out1024[idx + 703] = -resIm161_s;
        
        double oRe96 = out1024[idx + 704];
        double oIm96 = out1024[idx + 705];
        double eRe96 = out1024[idx + 192];
        double eIm96 = out1024[idx + 193];
        double resIm96_s = eIm96 + (oRe96 * tRe32 + oIm96 * tRe96);
        out1024[idx + 193] = resIm96_s;
        out1024[idx + 833] = -resIm96_s;
        double resRe96_s = eRe96 + (oRe96 * tRe96 - oIm96 * tRe32);
        out1024[idx + 832] = resRe96_s;
        out1024[idx + 192] = resRe96_s;
        double resRe32_s = eRe96 - (oRe96 * tRe96 - oIm96 * tRe32);
        out1024[idx + 704] = resRe160_s;
        out1024[idx + 320] = resRe160_s;
        double resIm32_s = -eIm96 + (oRe96 * tRe32 + oIm96 * tRe96);
        out1024[idx + 321] = resIm160_s;
        out1024[idx + 705] = -resIm160_s;
        
        double oRe97 = out1024[idx + 706];
        double oIm97 = out1024[idx + 707];
        double eRe97 = out1024[idx + 194];
        double eIm97 = out1024[idx + 195];
        double resIm97_s = eIm97 + (oRe97 * tRe31 + oIm97 * tRe97);
        out1024[idx + 195] = resIm97_s;
        out1024[idx + 831] = -resIm97_s;
        double resRe97_s = eRe97 + (oRe97 * tRe97 - oIm97 * tRe31);
        out1024[idx + 830] = resRe97_s;
        out1024[idx + 194] = resRe97_s;
        double resRe31_s = eRe97 - (oRe97 * tRe97 - oIm97 * tRe31);
        out1024[idx + 706] = resRe159_s;
        out1024[idx + 318] = resRe159_s;
        double resIm31_s = -eIm97 + (oRe97 * tRe31 + oIm97 * tRe97);
        out1024[idx + 319] = resIm159_s;
        out1024[idx + 707] = -resIm159_s;
        
        double oRe98 = out1024[idx + 708];
        double oIm98 = out1024[idx + 709];
        double eRe98 = out1024[idx + 196];
        double eIm98 = out1024[idx + 197];
        double resIm98_s = eIm98 + (oRe98 * tRe30 + oIm98 * tRe98);
        out1024[idx + 197] = resIm98_s;
        out1024[idx + 829] = -resIm98_s;
        double resRe98_s = eRe98 + (oRe98 * tRe98 - oIm98 * tRe30);
        out1024[idx + 828] = resRe98_s;
        out1024[idx + 196] = resRe98_s;
        double resRe30_s = eRe98 - (oRe98 * tRe98 - oIm98 * tRe30);
        out1024[idx + 708] = resRe158_s;
        out1024[idx + 316] = resRe158_s;
        double resIm30_s = -eIm98 + (oRe98 * tRe30 + oIm98 * tRe98);
        out1024[idx + 317] = resIm158_s;
        out1024[idx + 709] = -resIm158_s;
        
        double oRe99 = out1024[idx + 710];
        double oIm99 = out1024[idx + 711];
        double eRe99 = out1024[idx + 198];
        double eIm99 = out1024[idx + 199];
        double resIm99_s = eIm99 + (oRe99 * tRe29 + oIm99 * tRe99);
        out1024[idx + 199] = resIm99_s;
        out1024[idx + 827] = -resIm99_s;
        double resRe99_s = eRe99 + (oRe99 * tRe99 - oIm99 * tRe29);
        out1024[idx + 826] = resRe99_s;
        out1024[idx + 198] = resRe99_s;
        double resRe29_s = eRe99 - (oRe99 * tRe99 - oIm99 * tRe29);
        out1024[idx + 710] = resRe157_s;
        out1024[idx + 314] = resRe157_s;
        double resIm29_s = -eIm99 + (oRe99 * tRe29 + oIm99 * tRe99);
        out1024[idx + 315] = resIm157_s;
        out1024[idx + 711] = -resIm157_s;
        
        double oRe100 = out1024[idx + 712];
        double oIm100 = out1024[idx + 713];
        double eRe100 = out1024[idx + 200];
        double eIm100 = out1024[idx + 201];
        double resIm100_s = eIm100 + (oRe100 * tRe28 + oIm100 * tRe100);
        out1024[idx + 201] = resIm100_s;
        out1024[idx + 825] = -resIm100_s;
        double resRe100_s = eRe100 + (oRe100 * tRe100 - oIm100 * tRe28);
        out1024[idx + 824] = resRe100_s;
        out1024[idx + 200] = resRe100_s;
        double resRe28_s = eRe100 - (oRe100 * tRe100 - oIm100 * tRe28);
        out1024[idx + 712] = resRe156_s;
        out1024[idx + 312] = resRe156_s;
        double resIm28_s = -eIm100 + (oRe100 * tRe28 + oIm100 * tRe100);
        out1024[idx + 313] = resIm156_s;
        out1024[idx + 713] = -resIm156_s;
        
        double oRe101 = out1024[idx + 714];
        double oIm101 = out1024[idx + 715];
        double eRe101 = out1024[idx + 202];
        double eIm101 = out1024[idx + 203];
        double resIm101_s = eIm101 + (oRe101 * tRe27 + oIm101 * tRe101);
        out1024[idx + 203] = resIm101_s;
        out1024[idx + 823] = -resIm101_s;
        double resRe101_s = eRe101 + (oRe101 * tRe101 - oIm101 * tRe27);
        out1024[idx + 822] = resRe101_s;
        out1024[idx + 202] = resRe101_s;
        double resRe27_s = eRe101 - (oRe101 * tRe101 - oIm101 * tRe27);
        out1024[idx + 714] = resRe155_s;
        out1024[idx + 310] = resRe155_s;
        double resIm27_s = -eIm101 + (oRe101 * tRe27 + oIm101 * tRe101);
        out1024[idx + 311] = resIm155_s;
        out1024[idx + 715] = -resIm155_s;
        
        double oRe102 = out1024[idx + 716];
        double oIm102 = out1024[idx + 717];
        double eRe102 = out1024[idx + 204];
        double eIm102 = out1024[idx + 205];
        double resIm102_s = eIm102 + (oRe102 * tRe26 + oIm102 * tRe102);
        out1024[idx + 205] = resIm102_s;
        out1024[idx + 821] = -resIm102_s;
        double resRe102_s = eRe102 + (oRe102 * tRe102 - oIm102 * tRe26);
        out1024[idx + 820] = resRe102_s;
        out1024[idx + 204] = resRe102_s;
        double resRe26_s = eRe102 - (oRe102 * tRe102 - oIm102 * tRe26);
        out1024[idx + 716] = resRe154_s;
        out1024[idx + 308] = resRe154_s;
        double resIm26_s = -eIm102 + (oRe102 * tRe26 + oIm102 * tRe102);
        out1024[idx + 309] = resIm154_s;
        out1024[idx + 717] = -resIm154_s;
        
        double oRe103 = out1024[idx + 718];
        double oIm103 = out1024[idx + 719];
        double eRe103 = out1024[idx + 206];
        double eIm103 = out1024[idx + 207];
        double resIm103_s = eIm103 + (oRe103 * tRe25 + oIm103 * tRe103);
        out1024[idx + 207] = resIm103_s;
        out1024[idx + 819] = -resIm103_s;
        double resRe103_s = eRe103 + (oRe103 * tRe103 - oIm103 * tRe25);
        out1024[idx + 818] = resRe103_s;
        out1024[idx + 206] = resRe103_s;
        double resRe25_s = eRe103 - (oRe103 * tRe103 - oIm103 * tRe25);
        out1024[idx + 718] = resRe153_s;
        out1024[idx + 306] = resRe153_s;
        double resIm25_s = -eIm103 + (oRe103 * tRe25 + oIm103 * tRe103);
        out1024[idx + 307] = resIm153_s;
        out1024[idx + 719] = -resIm153_s;
        
        double oRe104 = out1024[idx + 720];
        double oIm104 = out1024[idx + 721];
        double eRe104 = out1024[idx + 208];
        double eIm104 = out1024[idx + 209];
        double resIm104_s = eIm104 + (oRe104 * tRe24 + oIm104 * tRe104);
        out1024[idx + 209] = resIm104_s;
        out1024[idx + 817] = -resIm104_s;
        double resRe104_s = eRe104 + (oRe104 * tRe104 - oIm104 * tRe24);
        out1024[idx + 816] = resRe104_s;
        out1024[idx + 208] = resRe104_s;
        double resRe24_s = eRe104 - (oRe104 * tRe104 - oIm104 * tRe24);
        out1024[idx + 720] = resRe152_s;
        out1024[idx + 304] = resRe152_s;
        double resIm24_s = -eIm104 + (oRe104 * tRe24 + oIm104 * tRe104);
        out1024[idx + 305] = resIm152_s;
        out1024[idx + 721] = -resIm152_s;
        
        double oRe105 = out1024[idx + 722];
        double oIm105 = out1024[idx + 723];
        double eRe105 = out1024[idx + 210];
        double eIm105 = out1024[idx + 211];
        double resIm105_s = eIm105 + (oRe105 * tRe23 + oIm105 * tRe105);
        out1024[idx + 211] = resIm105_s;
        out1024[idx + 815] = -resIm105_s;
        double resRe105_s = eRe105 + (oRe105 * tRe105 - oIm105 * tRe23);
        out1024[idx + 814] = resRe105_s;
        out1024[idx + 210] = resRe105_s;
        double resRe23_s = eRe105 - (oRe105 * tRe105 - oIm105 * tRe23);
        out1024[idx + 722] = resRe151_s;
        out1024[idx + 302] = resRe151_s;
        double resIm23_s = -eIm105 + (oRe105 * tRe23 + oIm105 * tRe105);
        out1024[idx + 303] = resIm151_s;
        out1024[idx + 723] = -resIm151_s;
        
        double oRe106 = out1024[idx + 724];
        double oIm106 = out1024[idx + 725];
        double eRe106 = out1024[idx + 212];
        double eIm106 = out1024[idx + 213];
        double resIm106_s = eIm106 + (oRe106 * tRe22 + oIm106 * tRe106);
        out1024[idx + 213] = resIm106_s;
        out1024[idx + 813] = -resIm106_s;
        double resRe106_s = eRe106 + (oRe106 * tRe106 - oIm106 * tRe22);
        out1024[idx + 812] = resRe106_s;
        out1024[idx + 212] = resRe106_s;
        double resRe22_s = eRe106 - (oRe106 * tRe106 - oIm106 * tRe22);
        out1024[idx + 724] = resRe150_s;
        out1024[idx + 300] = resRe150_s;
        double resIm22_s = -eIm106 + (oRe106 * tRe22 + oIm106 * tRe106);
        out1024[idx + 301] = resIm150_s;
        out1024[idx + 725] = -resIm150_s;
        
        double oRe107 = out1024[idx + 726];
        double oIm107 = out1024[idx + 727];
        double eRe107 = out1024[idx + 214];
        double eIm107 = out1024[idx + 215];
        double resIm107_s = eIm107 + (oRe107 * tRe21 + oIm107 * tRe107);
        out1024[idx + 215] = resIm107_s;
        out1024[idx + 811] = -resIm107_s;
        double resRe107_s = eRe107 + (oRe107 * tRe107 - oIm107 * tRe21);
        out1024[idx + 810] = resRe107_s;
        out1024[idx + 214] = resRe107_s;
        double resRe21_s = eRe107 - (oRe107 * tRe107 - oIm107 * tRe21);
        out1024[idx + 726] = resRe149_s;
        out1024[idx + 298] = resRe149_s;
        double resIm21_s = -eIm107 + (oRe107 * tRe21 + oIm107 * tRe107);
        out1024[idx + 299] = resIm149_s;
        out1024[idx + 727] = -resIm149_s;
        
        double oRe108 = out1024[idx + 728];
        double oIm108 = out1024[idx + 729];
        double eRe108 = out1024[idx + 216];
        double eIm108 = out1024[idx + 217];
        double resIm108_s = eIm108 + (oRe108 * tRe20 + oIm108 * tRe108);
        out1024[idx + 217] = resIm108_s;
        out1024[idx + 809] = -resIm108_s;
        double resRe108_s = eRe108 + (oRe108 * tRe108 - oIm108 * tRe20);
        out1024[idx + 808] = resRe108_s;
        out1024[idx + 216] = resRe108_s;
        double resRe20_s = eRe108 - (oRe108 * tRe108 - oIm108 * tRe20);
        out1024[idx + 728] = resRe148_s;
        out1024[idx + 296] = resRe148_s;
        double resIm20_s = -eIm108 + (oRe108 * tRe20 + oIm108 * tRe108);
        out1024[idx + 297] = resIm148_s;
        out1024[idx + 729] = -resIm148_s;
        
        double oRe109 = out1024[idx + 730];
        double oIm109 = out1024[idx + 731];
        double eRe109 = out1024[idx + 218];
        double eIm109 = out1024[idx + 219];
        double resIm109_s = eIm109 + (oRe109 * tRe19 + oIm109 * tRe109);
        out1024[idx + 219] = resIm109_s;
        out1024[idx + 807] = -resIm109_s;
        double resRe109_s = eRe109 + (oRe109 * tRe109 - oIm109 * tRe19);
        out1024[idx + 806] = resRe109_s;
        out1024[idx + 218] = resRe109_s;
        double resRe19_s = eRe109 - (oRe109 * tRe109 - oIm109 * tRe19);
        out1024[idx + 730] = resRe147_s;
        out1024[idx + 294] = resRe147_s;
        double resIm19_s = -eIm109 + (oRe109 * tRe19 + oIm109 * tRe109);
        out1024[idx + 295] = resIm147_s;
        out1024[idx + 731] = -resIm147_s;
        
        double oRe110 = out1024[idx + 732];
        double oIm110 = out1024[idx + 733];
        double eRe110 = out1024[idx + 220];
        double eIm110 = out1024[idx + 221];
        double resIm110_s = eIm110 + (oRe110 * tRe18 + oIm110 * tRe110);
        out1024[idx + 221] = resIm110_s;
        out1024[idx + 805] = -resIm110_s;
        double resRe110_s = eRe110 + (oRe110 * tRe110 - oIm110 * tRe18);
        out1024[idx + 804] = resRe110_s;
        out1024[idx + 220] = resRe110_s;
        double resRe18_s = eRe110 - (oRe110 * tRe110 - oIm110 * tRe18);
        out1024[idx + 732] = resRe146_s;
        out1024[idx + 292] = resRe146_s;
        double resIm18_s = -eIm110 + (oRe110 * tRe18 + oIm110 * tRe110);
        out1024[idx + 293] = resIm146_s;
        out1024[idx + 733] = -resIm146_s;
        
        double oRe111 = out1024[idx + 734];
        double oIm111 = out1024[idx + 735];
        double eRe111 = out1024[idx + 222];
        double eIm111 = out1024[idx + 223];
        double resIm111_s = eIm111 + (oRe111 * tRe17 + oIm111 * tRe111);
        out1024[idx + 223] = resIm111_s;
        out1024[idx + 803] = -resIm111_s;
        double resRe111_s = eRe111 + (oRe111 * tRe111 - oIm111 * tRe17);
        out1024[idx + 802] = resRe111_s;
        out1024[idx + 222] = resRe111_s;
        double resRe17_s = eRe111 - (oRe111 * tRe111 - oIm111 * tRe17);
        out1024[idx + 734] = resRe145_s;
        out1024[idx + 290] = resRe145_s;
        double resIm17_s = -eIm111 + (oRe111 * tRe17 + oIm111 * tRe111);
        out1024[idx + 291] = resIm145_s;
        out1024[idx + 735] = -resIm145_s;
        
        double oRe112 = out1024[idx + 736];
        double oIm112 = out1024[idx + 737];
        double eRe112 = out1024[idx + 224];
        double eIm112 = out1024[idx + 225];
        double resIm112_s = eIm112 + (oRe112 * tRe16 + oIm112 * tRe112);
        out1024[idx + 225] = resIm112_s;
        out1024[idx + 801] = -resIm112_s;
        double resRe112_s = eRe112 + (oRe112 * tRe112 - oIm112 * tRe16);
        out1024[idx + 800] = resRe112_s;
        out1024[idx + 224] = resRe112_s;
        double resRe16_s = eRe112 - (oRe112 * tRe112 - oIm112 * tRe16);
        out1024[idx + 736] = resRe144_s;
        out1024[idx + 288] = resRe144_s;
        double resIm16_s = -eIm112 + (oRe112 * tRe16 + oIm112 * tRe112);
        out1024[idx + 289] = resIm144_s;
        out1024[idx + 737] = -resIm144_s;
        
        double oRe113 = out1024[idx + 738];
        double oIm113 = out1024[idx + 739];
        double eRe113 = out1024[idx + 226];
        double eIm113 = out1024[idx + 227];
        double resIm113_s = eIm113 + (oRe113 * tRe15 + oIm113 * tRe113);
        out1024[idx + 227] = resIm113_s;
        out1024[idx + 799] = -resIm113_s;
        double resRe113_s = eRe113 + (oRe113 * tRe113 - oIm113 * tRe15);
        out1024[idx + 798] = resRe113_s;
        out1024[idx + 226] = resRe113_s;
        double resRe15_s = eRe113 - (oRe113 * tRe113 - oIm113 * tRe15);
        out1024[idx + 738] = resRe143_s;
        out1024[idx + 286] = resRe143_s;
        double resIm15_s = -eIm113 + (oRe113 * tRe15 + oIm113 * tRe113);
        out1024[idx + 287] = resIm143_s;
        out1024[idx + 739] = -resIm143_s;
        
        double oRe114 = out1024[idx + 740];
        double oIm114 = out1024[idx + 741];
        double eRe114 = out1024[idx + 228];
        double eIm114 = out1024[idx + 229];
        double resIm114_s = eIm114 + (oRe114 * tRe14 + oIm114 * tRe114);
        out1024[idx + 229] = resIm114_s;
        out1024[idx + 797] = -resIm114_s;
        double resRe114_s = eRe114 + (oRe114 * tRe114 - oIm114 * tRe14);
        out1024[idx + 796] = resRe114_s;
        out1024[idx + 228] = resRe114_s;
        double resRe14_s = eRe114 - (oRe114 * tRe114 - oIm114 * tRe14);
        out1024[idx + 740] = resRe142_s;
        out1024[idx + 284] = resRe142_s;
        double resIm14_s = -eIm114 + (oRe114 * tRe14 + oIm114 * tRe114);
        out1024[idx + 285] = resIm142_s;
        out1024[idx + 741] = -resIm142_s;
        
        double oRe115 = out1024[idx + 742];
        double oIm115 = out1024[idx + 743];
        double eRe115 = out1024[idx + 230];
        double eIm115 = out1024[idx + 231];
        double resIm115_s = eIm115 + (oRe115 * tRe13 + oIm115 * tRe115);
        out1024[idx + 231] = resIm115_s;
        out1024[idx + 795] = -resIm115_s;
        double resRe115_s = eRe115 + (oRe115 * tRe115 - oIm115 * tRe13);
        out1024[idx + 794] = resRe115_s;
        out1024[idx + 230] = resRe115_s;
        double resRe13_s = eRe115 - (oRe115 * tRe115 - oIm115 * tRe13);
        out1024[idx + 742] = resRe141_s;
        out1024[idx + 282] = resRe141_s;
        double resIm13_s = -eIm115 + (oRe115 * tRe13 + oIm115 * tRe115);
        out1024[idx + 283] = resIm141_s;
        out1024[idx + 743] = -resIm141_s;
        
        double oRe116 = out1024[idx + 744];
        double oIm116 = out1024[idx + 745];
        double eRe116 = out1024[idx + 232];
        double eIm116 = out1024[idx + 233];
        double resIm116_s = eIm116 + (oRe116 * tRe12 + oIm116 * tRe116);
        out1024[idx + 233] = resIm116_s;
        out1024[idx + 793] = -resIm116_s;
        double resRe116_s = eRe116 + (oRe116 * tRe116 - oIm116 * tRe12);
        out1024[idx + 792] = resRe116_s;
        out1024[idx + 232] = resRe116_s;
        double resRe12_s = eRe116 - (oRe116 * tRe116 - oIm116 * tRe12);
        out1024[idx + 744] = resRe140_s;
        out1024[idx + 280] = resRe140_s;
        double resIm12_s = -eIm116 + (oRe116 * tRe12 + oIm116 * tRe116);
        out1024[idx + 281] = resIm140_s;
        out1024[idx + 745] = -resIm140_s;
        
        double oRe117 = out1024[idx + 746];
        double oIm117 = out1024[idx + 747];
        double eRe117 = out1024[idx + 234];
        double eIm117 = out1024[idx + 235];
        double resIm117_s = eIm117 + (oRe117 * tRe11 + oIm117 * tRe117);
        out1024[idx + 235] = resIm117_s;
        out1024[idx + 791] = -resIm117_s;
        double resRe117_s = eRe117 + (oRe117 * tRe117 - oIm117 * tRe11);
        out1024[idx + 790] = resRe117_s;
        out1024[idx + 234] = resRe117_s;
        double resRe11_s = eRe117 - (oRe117 * tRe117 - oIm117 * tRe11);
        out1024[idx + 746] = resRe139_s;
        out1024[idx + 278] = resRe139_s;
        double resIm11_s = -eIm117 + (oRe117 * tRe11 + oIm117 * tRe117);
        out1024[idx + 279] = resIm139_s;
        out1024[idx + 747] = -resIm139_s;
        
        double oRe118 = out1024[idx + 748];
        double oIm118 = out1024[idx + 749];
        double eRe118 = out1024[idx + 236];
        double eIm118 = out1024[idx + 237];
        double resIm118_s = eIm118 + (oRe118 * tRe10 + oIm118 * tRe118);
        out1024[idx + 237] = resIm118_s;
        out1024[idx + 789] = -resIm118_s;
        double resRe118_s = eRe118 + (oRe118 * tRe118 - oIm118 * tRe10);
        out1024[idx + 788] = resRe118_s;
        out1024[idx + 236] = resRe118_s;
        double resRe10_s = eRe118 - (oRe118 * tRe118 - oIm118 * tRe10);
        out1024[idx + 748] = resRe138_s;
        out1024[idx + 276] = resRe138_s;
        double resIm10_s = -eIm118 + (oRe118 * tRe10 + oIm118 * tRe118);
        out1024[idx + 277] = resIm138_s;
        out1024[idx + 749] = -resIm138_s;
        
        double oRe119 = out1024[idx + 750];
        double oIm119 = out1024[idx + 751];
        double eRe119 = out1024[idx + 238];
        double eIm119 = out1024[idx + 239];
        double resIm119_s = eIm119 + (oRe119 * tRe9 + oIm119 * tRe119);
        out1024[idx + 239] = resIm119_s;
        out1024[idx + 787] = -resIm119_s;
        double resRe119_s = eRe119 + (oRe119 * tRe119 - oIm119 * tRe9);
        out1024[idx + 786] = resRe119_s;
        out1024[idx + 238] = resRe119_s;
        double resRe9_s = eRe119 - (oRe119 * tRe119 - oIm119 * tRe9);
        out1024[idx + 750] = resRe137_s;
        out1024[idx + 274] = resRe137_s;
        double resIm9_s = -eIm119 + (oRe119 * tRe9 + oIm119 * tRe119);
        out1024[idx + 275] = resIm137_s;
        out1024[idx + 751] = -resIm137_s;
        
        double oRe120 = out1024[idx + 752];
        double oIm120 = out1024[idx + 753];
        double eRe120 = out1024[idx + 240];
        double eIm120 = out1024[idx + 241];
        double resIm120_s = eIm120 + (oRe120 * tRe8 + oIm120 * tRe120);
        out1024[idx + 241] = resIm120_s;
        out1024[idx + 785] = -resIm120_s;
        double resRe120_s = eRe120 + (oRe120 * tRe120 - oIm120 * tRe8);
        out1024[idx + 784] = resRe120_s;
        out1024[idx + 240] = resRe120_s;
        double resRe8_s = eRe120 - (oRe120 * tRe120 - oIm120 * tRe8);
        out1024[idx + 752] = resRe136_s;
        out1024[idx + 272] = resRe136_s;
        double resIm8_s = -eIm120 + (oRe120 * tRe8 + oIm120 * tRe120);
        out1024[idx + 273] = resIm136_s;
        out1024[idx + 753] = -resIm136_s;
        
        double oRe121 = out1024[idx + 754];
        double oIm121 = out1024[idx + 755];
        double eRe121 = out1024[idx + 242];
        double eIm121 = out1024[idx + 243];
        double resIm121_s = eIm121 + (oRe121 * tRe7 + oIm121 * tRe121);
        out1024[idx + 243] = resIm121_s;
        out1024[idx + 783] = -resIm121_s;
        double resRe121_s = eRe121 + (oRe121 * tRe121 - oIm121 * tRe7);
        out1024[idx + 782] = resRe121_s;
        out1024[idx + 242] = resRe121_s;
        double resRe7_s = eRe121 - (oRe121 * tRe121 - oIm121 * tRe7);
        out1024[idx + 754] = resRe135_s;
        out1024[idx + 270] = resRe135_s;
        double resIm7_s = -eIm121 + (oRe121 * tRe7 + oIm121 * tRe121);
        out1024[idx + 271] = resIm135_s;
        out1024[idx + 755] = -resIm135_s;
        
        double oRe122 = out1024[idx + 756];
        double oIm122 = out1024[idx + 757];
        double eRe122 = out1024[idx + 244];
        double eIm122 = out1024[idx + 245];
        double resIm122_s = eIm122 + (oRe122 * tRe6 + oIm122 * tRe122);
        out1024[idx + 245] = resIm122_s;
        out1024[idx + 781] = -resIm122_s;
        double resRe122_s = eRe122 + (oRe122 * tRe122 - oIm122 * tRe6);
        out1024[idx + 780] = resRe122_s;
        out1024[idx + 244] = resRe122_s;
        double resRe6_s = eRe122 - (oRe122 * tRe122 - oIm122 * tRe6);
        out1024[idx + 756] = resRe134_s;
        out1024[idx + 268] = resRe134_s;
        double resIm6_s = -eIm122 + (oRe122 * tRe6 + oIm122 * tRe122);
        out1024[idx + 269] = resIm134_s;
        out1024[idx + 757] = -resIm134_s;
        
        double oRe123 = out1024[idx + 758];
        double oIm123 = out1024[idx + 759];
        double eRe123 = out1024[idx + 246];
        double eIm123 = out1024[idx + 247];
        double resIm123_s = eIm123 + (oRe123 * tRe5 + oIm123 * tRe123);
        out1024[idx + 247] = resIm123_s;
        out1024[idx + 779] = -resIm123_s;
        double resRe123_s = eRe123 + (oRe123 * tRe123 - oIm123 * tRe5);
        out1024[idx + 778] = resRe123_s;
        out1024[idx + 246] = resRe123_s;
        double resRe5_s = eRe123 - (oRe123 * tRe123 - oIm123 * tRe5);
        out1024[idx + 758] = resRe133_s;
        out1024[idx + 266] = resRe133_s;
        double resIm5_s = -eIm123 + (oRe123 * tRe5 + oIm123 * tRe123);
        out1024[idx + 267] = resIm133_s;
        out1024[idx + 759] = -resIm133_s;
        
        double oRe124 = out1024[idx + 760];
        double oIm124 = out1024[idx + 761];
        double eRe124 = out1024[idx + 248];
        double eIm124 = out1024[idx + 249];
        double resIm124_s = eIm124 + (oRe124 * tRe4 + oIm124 * tRe124);
        out1024[idx + 249] = resIm124_s;
        out1024[idx + 777] = -resIm124_s;
        double resRe124_s = eRe124 + (oRe124 * tRe124 - oIm124 * tRe4);
        out1024[idx + 776] = resRe124_s;
        out1024[idx + 248] = resRe124_s;
        double resRe4_s = eRe124 - (oRe124 * tRe124 - oIm124 * tRe4);
        out1024[idx + 760] = resRe132_s;
        out1024[idx + 264] = resRe132_s;
        double resIm4_s = -eIm124 + (oRe124 * tRe4 + oIm124 * tRe124);
        out1024[idx + 265] = resIm132_s;
        out1024[idx + 761] = -resIm132_s;
        
        double oRe125 = out1024[idx + 762];
        double oIm125 = out1024[idx + 763];
        double eRe125 = out1024[idx + 250];
        double eIm125 = out1024[idx + 251];
        double resIm125_s = eIm125 + (oRe125 * tRe3 + oIm125 * tRe125);
        out1024[idx + 251] = resIm125_s;
        out1024[idx + 775] = -resIm125_s;
        double resRe125_s = eRe125 + (oRe125 * tRe125 - oIm125 * tRe3);
        out1024[idx + 774] = resRe125_s;
        out1024[idx + 250] = resRe125_s;
        double resRe3_s = eRe125 - (oRe125 * tRe125 - oIm125 * tRe3);
        out1024[idx + 762] = resRe131_s;
        out1024[idx + 262] = resRe131_s;
        double resIm3_s = -eIm125 + (oRe125 * tRe3 + oIm125 * tRe125);
        out1024[idx + 263] = resIm131_s;
        out1024[idx + 763] = -resIm131_s;
        
        double oRe126 = out1024[idx + 764];
        double oIm126 = out1024[idx + 765];
        double eRe126 = out1024[idx + 252];
        double eIm126 = out1024[idx + 253];
        double resIm126_s = eIm126 + (oRe126 * tRe2 + oIm126 * tRe126);
        out1024[idx + 253] = resIm126_s;
        out1024[idx + 773] = -resIm126_s;
        double resRe126_s = eRe126 + (oRe126 * tRe126 - oIm126 * tRe2);
        out1024[idx + 772] = resRe126_s;
        out1024[idx + 252] = resRe126_s;
        double resRe2_s = eRe126 - (oRe126 * tRe126 - oIm126 * tRe2);
        out1024[idx + 764] = resRe130_s;
        out1024[idx + 260] = resRe130_s;
        double resIm2_s = -eIm126 + (oRe126 * tRe2 + oIm126 * tRe126);
        out1024[idx + 261] = resIm130_s;
        out1024[idx + 765] = -resIm130_s;
        
        double oRe127 = out1024[idx + 766];
        double oIm127 = out1024[idx + 767];
        double eRe127 = out1024[idx + 254];
        double eIm127 = out1024[idx + 255];
        double resIm127_s = eIm127 + (oRe127 * tRe1 + oIm127 * tRe127);
        out1024[idx + 255] = resIm127_s;
        out1024[idx + 771] = -resIm127_s;
        double resRe127_s = eRe127 + (oRe127 * tRe127 - oIm127 * tRe1);
        out1024[idx + 770] = resRe127_s;
        out1024[idx + 254] = resRe127_s;
        double resRe1_s = eRe127 - (oRe127 * tRe127 - oIm127 * tRe1);
        out1024[idx + 766] = resRe129_s;
        out1024[idx + 258] = resRe129_s;
        double resIm1_s = -eIm127 + (oRe127 * tRe1 + oIm127 * tRe127);
        out1024[idx + 259] = resIm129_s;
        out1024[idx + 767] = -resIm129_s;
        
        double oRe128 = out1024[idx + 768];
        double oIm128 = out1024[idx + 769];
        double eRe128 = out1024[idx + 256];
        double eIm128 = out1024[idx + 257];
        double resIm128_s = eIm128 + oRe128;
        out1024[idx + 257] = resIm128_s;
        out1024[idx + 769] = -resIm128_s;
        double resRe128_s = eRe128 - oIm128;
        out1024[idx + 768] = resRe128_s;
        out1024[idx + 256] = resRe128_s;
    } 

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    // FFT step for SIZE 1024
    ////////////////////////////////////////////////

        double oRe0 = out1024[idx + 1024];
        double oIm0 = out1024[idx + 1025];
        double eRe0 = out1024[idx + 0];
        double eIm0 = out1024[idx + 1];
        double resRe0_s = eRe0 + oRe0;
        out1024[idx] = resRe0_s;
        double resIm0_s = eIm0 + oIm0;
        out1024[idx + 1] = resRe0_s;
        double resRe0_d = eRe0 - oRe0;
        out1024[idx + 1024] = resRe0_d;
        double resIm0_d = eIm0 - oIm0;
        out1024[idx + 1025] = resIm0_d;
        
        double oRe1 = out1024[idx + 1026];
        double oIm1 = out1024[idx + 1027];
        double eRe1 = out1024[idx + 2];
        double eIm1 = out1024[idx + 3];
        double tRe1 = 0x1.fffd8858e8a92p-1;
        double tRe255 = 0x1.921f0fe6700ap-8;
        double resIm1_s = eIm1 + (oRe1 * tRe255 + oIm1 * tRe1);
        out1024[idx + 3] = resIm1_s;
        out1024[idx + 2047] = -resIm1_s;
        double resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe255);
        out1024[idx + 2046] = resRe1_s;
        out1024[idx + 2] = resRe1_s;
        double resRe255_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe255);
        out1024[idx + 1026] = resRe511_s;
        out1024[idx + 1022] = resRe511_s;
        double resIm255_s = -eIm1 + (oRe1 * tRe255 + oIm1 * tRe1);
        out1024[idx + 1023] = resIm511_s;
        out1024[idx + 1027] = -resIm511_s;
        
        double oRe2 = out1024[idx + 1028];
        double oIm2 = out1024[idx + 1029];
        double eRe2 = out1024[idx + 4];
        double eIm2 = out1024[idx + 5];
        double tRe2 = 0x1.fff62169b92dbp-1;
        double tRe254 = 0x1.921d1fcdec78fp-7;
        double resIm2_s = eIm2 + (oRe2 * tRe254 + oIm2 * tRe2);
        out1024[idx + 5] = resIm2_s;
        out1024[idx + 2045] = -resIm2_s;
        double resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe254);
        out1024[idx + 2044] = resRe2_s;
        out1024[idx + 4] = resRe2_s;
        double resRe254_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe254);
        out1024[idx + 1028] = resRe510_s;
        out1024[idx + 1020] = resRe510_s;
        double resIm254_s = -eIm2 + (oRe2 * tRe254 + oIm2 * tRe2);
        out1024[idx + 1021] = resIm510_s;
        out1024[idx + 1029] = -resIm510_s;
        
        double oRe3 = out1024[idx + 1030];
        double oIm3 = out1024[idx + 1031];
        double eRe3 = out1024[idx + 6];
        double eIm3 = out1024[idx + 7];
        double tRe3 = 0x1.ffe9cb44b51a1p-1;
        double tRe253 = 0x1.2d936bbe30efdp-6;
        double resIm3_s = eIm3 + (oRe3 * tRe253 + oIm3 * tRe3);
        out1024[idx + 7] = resIm3_s;
        out1024[idx + 2043] = -resIm3_s;
        double resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe253);
        out1024[idx + 2042] = resRe3_s;
        out1024[idx + 6] = resRe3_s;
        double resRe253_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe253);
        out1024[idx + 1030] = resRe509_s;
        out1024[idx + 1018] = resRe509_s;
        double resIm253_s = -eIm3 + (oRe3 * tRe253 + oIm3 * tRe3);
        out1024[idx + 1019] = resIm509_s;
        out1024[idx + 1031] = -resIm509_s;
        
        double oRe4 = out1024[idx + 1032];
        double oIm4 = out1024[idx + 1033];
        double eRe4 = out1024[idx + 8];
        double eIm4 = out1024[idx + 9];
        double tRe4 = 0x1.ffd886084cd0dp-1;
        double tRe252 = 0x1.92155f7a36678p-6;
        double resIm4_s = eIm4 + (oRe4 * tRe252 + oIm4 * tRe4);
        out1024[idx + 9] = resIm4_s;
        out1024[idx + 2041] = -resIm4_s;
        double resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe252);
        out1024[idx + 2040] = resRe4_s;
        out1024[idx + 8] = resRe4_s;
        double resRe252_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe252);
        out1024[idx + 1032] = resRe508_s;
        out1024[idx + 1016] = resRe508_s;
        double resIm252_s = -eIm4 + (oRe4 * tRe252 + oIm4 * tRe4);
        out1024[idx + 1017] = resIm508_s;
        out1024[idx + 1033] = -resIm508_s;
        
        double oRe5 = out1024[idx + 1034];
        double oIm5 = out1024[idx + 1035];
        double eRe5 = out1024[idx + 10];
        double eIm5 = out1024[idx + 11];
        double tRe5 = 0x1.ffc251df1d3f8p-1;
        double tRe251 = 0x1.f693731d1cef5p-6;
        double resIm5_s = eIm5 + (oRe5 * tRe251 + oIm5 * tRe5);
        out1024[idx + 11] = resIm5_s;
        out1024[idx + 2039] = -resIm5_s;
        double resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe251);
        out1024[idx + 2038] = resRe5_s;
        out1024[idx + 10] = resRe5_s;
        double resRe251_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe251);
        out1024[idx + 1034] = resRe507_s;
        out1024[idx + 1014] = resRe507_s;
        double resIm251_s = -eIm5 + (oRe5 * tRe251 + oIm5 * tRe5);
        out1024[idx + 1015] = resIm507_s;
        out1024[idx + 1035] = -resIm507_s;
        
        double oRe6 = out1024[idx + 1036];
        double oIm6 = out1024[idx + 1037];
        double eRe6 = out1024[idx + 12];
        double eIm6 = out1024[idx + 13];
        double tRe6 = 0x1.ffa72effef75dp-1;
        double tRe250 = 0x1.2d865759455e4p-5;
        double resIm6_s = eIm6 + (oRe6 * tRe250 + oIm6 * tRe6);
        out1024[idx + 13] = resIm6_s;
        out1024[idx + 2037] = -resIm6_s;
        double resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe250);
        out1024[idx + 2036] = resRe6_s;
        out1024[idx + 12] = resRe6_s;
        double resRe250_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe250);
        out1024[idx + 1036] = resRe506_s;
        out1024[idx + 1012] = resRe506_s;
        double resIm250_s = -eIm6 + (oRe6 * tRe250 + oIm6 * tRe6);
        out1024[idx + 1013] = resIm506_s;
        out1024[idx + 1037] = -resIm506_s;
        
        double oRe7 = out1024[idx + 1038];
        double oIm7 = out1024[idx + 1039];
        double eRe7 = out1024[idx + 14];
        double eIm7 = out1024[idx + 15];
        double tRe7 = 0x1.ff871dadb81dfp-1;
        double tRe249 = 0x1.5fc00d290cd57p-5;
        double resIm7_s = eIm7 + (oRe7 * tRe249 + oIm7 * tRe7);
        out1024[idx + 15] = resIm7_s;
        out1024[idx + 2035] = -resIm7_s;
        double resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe249);
        out1024[idx + 2034] = resRe7_s;
        out1024[idx + 14] = resRe7_s;
        double resRe249_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe249);
        out1024[idx + 1038] = resRe505_s;
        out1024[idx + 1010] = resRe505_s;
        double resIm249_s = -eIm7 + (oRe7 * tRe249 + oIm7 * tRe7);
        out1024[idx + 1011] = resIm505_s;
        out1024[idx + 1039] = -resIm505_s;
        
        double oRe8 = out1024[idx + 1040];
        double oIm8 = out1024[idx + 1041];
        double eRe8 = out1024[idx + 16];
        double eIm8 = out1024[idx + 17];
        double tRe8 = 0x1.ff621e3796d7ep-1;
        double tRe248 = 0x1.91f65f10dd825p-5;
        double resIm8_s = eIm8 + (oRe8 * tRe248 + oIm8 * tRe8);
        out1024[idx + 17] = resIm8_s;
        out1024[idx + 2033] = -resIm8_s;
        double resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe248);
        out1024[idx + 2032] = resRe8_s;
        out1024[idx + 16] = resRe8_s;
        double resRe248_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe248);
        out1024[idx + 1040] = resRe504_s;
        out1024[idx + 1008] = resRe504_s;
        double resIm248_s = -eIm8 + (oRe8 * tRe248 + oIm8 * tRe8);
        out1024[idx + 1009] = resIm504_s;
        out1024[idx + 1041] = -resIm504_s;
        
        double oRe9 = out1024[idx + 1042];
        double oIm9 = out1024[idx + 1043];
        double eRe9 = out1024[idx + 18];
        double eIm9 = out1024[idx + 19];
        double tRe9 = 0x1.ff3830f8d575cp-1;
        double tRe247 = 0x1.c428d12c0d7fp-5;
        double resIm9_s = eIm9 + (oRe9 * tRe247 + oIm9 * tRe9);
        out1024[idx + 19] = resIm9_s;
        out1024[idx + 2031] = -resIm9_s;
        double resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe247);
        out1024[idx + 2030] = resRe9_s;
        out1024[idx + 18] = resRe9_s;
        double resRe247_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe247);
        out1024[idx + 1042] = resRe503_s;
        out1024[idx + 1006] = resRe503_s;
        double resIm247_s = -eIm9 + (oRe9 * tRe247 + oIm9 * tRe9);
        out1024[idx + 1007] = resIm503_s;
        out1024[idx + 1043] = -resIm503_s;
        
        double oRe10 = out1024[idx + 1044];
        double oIm10 = out1024[idx + 1045];
        double eRe10 = out1024[idx + 20];
        double eIm10 = out1024[idx + 21];
        double tRe10 = 0x1.ff095658e71adp-1;
        double tRe246 = 0x1.f656e79f820ebp-5;
        double resIm10_s = eIm10 + (oRe10 * tRe246 + oIm10 * tRe10);
        out1024[idx + 21] = resIm10_s;
        out1024[idx + 2029] = -resIm10_s;
        double resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe246);
        out1024[idx + 2028] = resRe10_s;
        out1024[idx + 20] = resRe10_s;
        double resRe246_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe246);
        out1024[idx + 1044] = resRe502_s;
        out1024[idx + 1004] = resRe502_s;
        double resIm246_s = -eIm10 + (oRe10 * tRe246 + oIm10 * tRe10);
        out1024[idx + 1005] = resIm502_s;
        out1024[idx + 1045] = -resIm502_s;
        
        double oRe11 = out1024[idx + 1046];
        double oIm11 = out1024[idx + 1047];
        double eRe11 = out1024[idx + 22];
        double eIm11 = out1024[idx + 23];
        double tRe11 = 0x1.fed58ecb673c4p-1;
        double tRe245 = 0x1.1440134d709b6p-4;
        double resIm11_s = eIm11 + (oRe11 * tRe245 + oIm11 * tRe11);
        out1024[idx + 23] = resIm11_s;
        out1024[idx + 2027] = -resIm11_s;
        double resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe245);
        out1024[idx + 2026] = resRe11_s;
        out1024[idx + 22] = resRe11_s;
        double resRe245_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe245);
        out1024[idx + 1046] = resRe501_s;
        out1024[idx + 1002] = resRe501_s;
        double resIm245_s = -eIm11 + (oRe11 * tRe245 + oIm11 * tRe11);
        out1024[idx + 1003] = resIm501_s;
        out1024[idx + 1047] = -resIm501_s;
        
        double oRe12 = out1024[idx + 1048];
        double oIm12 = out1024[idx + 1049];
        double eRe12 = out1024[idx + 24];
        double eIm12 = out1024[idx + 25];
        double tRe12 = 0x1.fe9cdad01883ap-1;
        double tRe244 = 0x1.2d52092ce19f8p-4;
        double resIm12_s = eIm12 + (oRe12 * tRe244 + oIm12 * tRe12);
        out1024[idx + 25] = resIm12_s;
        out1024[idx + 2025] = -resIm12_s;
        double resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe244);
        out1024[idx + 2024] = resRe12_s;
        out1024[idx + 24] = resRe12_s;
        double resRe244_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe244);
        out1024[idx + 1048] = resRe500_s;
        out1024[idx + 1000] = resRe500_s;
        double resIm244_s = -eIm12 + (oRe12 * tRe244 + oIm12 * tRe12);
        out1024[idx + 1001] = resIm500_s;
        out1024[idx + 1049] = -resIm500_s;
        
        double oRe13 = out1024[idx + 1050];
        double oIm13 = out1024[idx + 1051];
        double eRe13 = out1024[idx + 26];
        double eIm13 = out1024[idx + 27];
        double tRe13 = 0x1.fe5f3af2e394p-1;
        double tRe243 = 0x1.4661179272096p-4;
        double resIm13_s = eIm13 + (oRe13 * tRe243 + oIm13 * tRe13);
        out1024[idx + 27] = resIm13_s;
        out1024[idx + 2023] = -resIm13_s;
        double resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe243);
        out1024[idx + 2022] = resRe13_s;
        out1024[idx + 26] = resRe13_s;
        double resRe243_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe243);
        out1024[idx + 1050] = resRe499_s;
        out1024[idx + 998] = resRe499_s;
        double resIm243_s = -eIm13 + (oRe13 * tRe243 + oIm13 * tRe13);
        out1024[idx + 999] = resIm499_s;
        out1024[idx + 1051] = -resIm499_s;
        
        double oRe14 = out1024[idx + 1052];
        double oIm14 = out1024[idx + 1053];
        double eRe14 = out1024[idx + 28];
        double eIm14 = out1024[idx + 29];
        double tRe14 = 0x1.fe1cafcbd5b09p-1;
        double tRe242 = 0x1.5f6d00a9aa418p-4;
        double resIm14_s = eIm14 + (oRe14 * tRe242 + oIm14 * tRe14);
        out1024[idx + 29] = resIm14_s;
        out1024[idx + 2021] = -resIm14_s;
        double resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe242);
        out1024[idx + 2020] = resRe14_s;
        out1024[idx + 28] = resRe14_s;
        double resRe242_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe242);
        out1024[idx + 1052] = resRe498_s;
        out1024[idx + 996] = resRe498_s;
        double resIm242_s = -eIm14 + (oRe14 * tRe242 + oIm14 * tRe14);
        out1024[idx + 997] = resIm498_s;
        out1024[idx + 1053] = -resIm498_s;
        
        double oRe15 = out1024[idx + 1054];
        double oIm15 = out1024[idx + 1055];
        double eRe15 = out1024[idx + 30];
        double eIm15 = out1024[idx + 31];
        double tRe15 = 0x1.fdd539ff1f456p-1;
        double tRe241 = 0x1.787586a5d5b1fp-4;
        double resIm15_s = eIm15 + (oRe15 * tRe241 + oIm15 * tRe15);
        out1024[idx + 31] = resIm15_s;
        out1024[idx + 2019] = -resIm15_s;
        double resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe241);
        out1024[idx + 2018] = resRe15_s;
        out1024[idx + 30] = resRe15_s;
        double resRe241_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe241);
        out1024[idx + 1054] = resRe497_s;
        out1024[idx + 994] = resRe497_s;
        double resIm241_s = -eIm15 + (oRe15 * tRe241 + oIm15 * tRe15);
        out1024[idx + 995] = resIm497_s;
        out1024[idx + 1055] = -resIm497_s;
        
        double oRe16 = out1024[idx + 1056];
        double oIm16 = out1024[idx + 1057];
        double eRe16 = out1024[idx + 32];
        double eIm16 = out1024[idx + 33];
        double tRe16 = 0x1.fd88da3d12526p-1;
        double tRe240 = 0x1.917a6bc29b438p-4;
        double resIm16_s = eIm16 + (oRe16 * tRe240 + oIm16 * tRe16);
        out1024[idx + 33] = resIm16_s;
        out1024[idx + 2017] = -resIm16_s;
        double resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe240);
        out1024[idx + 2016] = resRe16_s;
        out1024[idx + 32] = resRe16_s;
        double resRe240_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe240);
        out1024[idx + 1056] = resRe496_s;
        out1024[idx + 992] = resRe496_s;
        double resIm240_s = -eIm16 + (oRe16 * tRe240 + oIm16 * tRe16);
        out1024[idx + 993] = resIm496_s;
        out1024[idx + 1057] = -resIm496_s;
        
        double oRe17 = out1024[idx + 1058];
        double oIm17 = out1024[idx + 1059];
        double eRe17 = out1024[idx + 34];
        double eIm17 = out1024[idx + 35];
        double tRe17 = 0x1.fd37914220b84p-1;
        double tRe239 = 0x1.aa7b724495c0ep-4;
        double resIm17_s = eIm17 + (oRe17 * tRe239 + oIm17 * tRe17);
        out1024[idx + 35] = resIm17_s;
        out1024[idx + 2015] = -resIm17_s;
        double resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe239);
        out1024[idx + 2014] = resRe17_s;
        out1024[idx + 34] = resRe17_s;
        double resRe239_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe239);
        out1024[idx + 1058] = resRe495_s;
        out1024[idx + 990] = resRe495_s;
        double resIm239_s = -eIm17 + (oRe17 * tRe239 + oIm17 * tRe17);
        out1024[idx + 991] = resIm495_s;
        out1024[idx + 1059] = -resIm495_s;
        
        double oRe18 = out1024[idx + 1060];
        double oIm18 = out1024[idx + 1061];
        double eRe18 = out1024[idx + 36];
        double eIm18 = out1024[idx + 37];
        double tRe18 = 0x1.fce15fd6da67bp-1;
        double tRe238 = 0x1.c3785c79ec2dep-4;
        double resIm18_s = eIm18 + (oRe18 * tRe238 + oIm18 * tRe18);
        out1024[idx + 37] = resIm18_s;
        out1024[idx + 2013] = -resIm18_s;
        double resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe238);
        out1024[idx + 2012] = resRe18_s;
        out1024[idx + 36] = resRe18_s;
        double resRe238_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe238);
        out1024[idx + 1060] = resRe494_s;
        out1024[idx + 988] = resRe494_s;
        double resIm238_s = -eIm18 + (oRe18 * tRe238 + oIm18 * tRe18);
        out1024[idx + 989] = resIm494_s;
        out1024[idx + 1061] = -resIm494_s;
        
        double oRe19 = out1024[idx + 1062];
        double oIm19 = out1024[idx + 1063];
        double eRe19 = out1024[idx + 38];
        double eIm19 = out1024[idx + 39];
        double tRe19 = 0x1.fc8646cfeb721p-1;
        double tRe237 = 0x1.dc70ecbae9fdp-4;
        double resIm19_s = eIm19 + (oRe19 * tRe237 + oIm19 * tRe19);
        out1024[idx + 39] = resIm19_s;
        out1024[idx + 2011] = -resIm19_s;
        double resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe237);
        out1024[idx + 2010] = resRe19_s;
        out1024[idx + 38] = resRe19_s;
        double resRe237_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe237);
        out1024[idx + 1062] = resRe493_s;
        out1024[idx + 986] = resRe493_s;
        double resIm237_s = -eIm19 + (oRe19 * tRe237 + oIm19 * tRe19);
        out1024[idx + 987] = resIm493_s;
        out1024[idx + 1063] = -resIm493_s;
        
        double oRe20 = out1024[idx + 1064];
        double oIm20 = out1024[idx + 1065];
        double eRe20 = out1024[idx + 40];
        double eIm20 = out1024[idx + 41];
        double tRe20 = 0x1.fc26470e19fd3p-1;
        double tRe236 = 0x1.f564e56a97314p-4;
        double resIm20_s = eIm20 + (oRe20 * tRe236 + oIm20 * tRe20);
        out1024[idx + 41] = resIm20_s;
        out1024[idx + 2009] = -resIm20_s;
        double resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe236);
        out1024[idx + 2008] = resRe20_s;
        out1024[idx + 40] = resRe20_s;
        double resRe236_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe236);
        out1024[idx + 1064] = resRe492_s;
        out1024[idx + 984] = resRe492_s;
        double resIm236_s = -eIm20 + (oRe20 * tRe236 + oIm20 * tRe20);
        out1024[idx + 985] = resIm492_s;
        out1024[idx + 1065] = -resIm492_s;
        
        double oRe21 = out1024[idx + 1066];
        double oIm21 = out1024[idx + 1067];
        double eRe21 = out1024[idx + 42];
        double eIm21 = out1024[idx + 43];
        double tRe21 = 0x1.fbc1617e44186p-1;
        double tRe235 = 0x1.072a047ba831fp-3;
        double resIm21_s = eIm21 + (oRe21 * tRe235 + oIm21 * tRe21);
        out1024[idx + 43] = resIm21_s;
        out1024[idx + 2007] = -resIm21_s;
        double resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe235);
        out1024[idx + 2006] = resRe21_s;
        out1024[idx + 42] = resRe21_s;
        double resRe235_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe235);
        out1024[idx + 1066] = resRe491_s;
        out1024[idx + 982] = resRe491_s;
        double resIm235_s = -eIm21 + (oRe21 * tRe235 + oIm21 * tRe21);
        out1024[idx + 983] = resIm491_s;
        out1024[idx + 1067] = -resIm491_s;
        
        double oRe22 = out1024[idx + 1068];
        double oIm22 = out1024[idx + 1069];
        double eRe22 = out1024[idx + 44];
        double eIm22 = out1024[idx + 45];
        double tRe22 = 0x1.fb5797195d741p-1;
        double tRe234 = 0x1.139f0cedaf578p-3;
        double resIm22_s = eIm22 + (oRe22 * tRe234 + oIm22 * tRe22);
        out1024[idx + 45] = resIm22_s;
        out1024[idx + 2005] = -resIm22_s;
        double resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe234);
        out1024[idx + 2004] = resRe22_s;
        out1024[idx + 44] = resRe22_s;
        double resRe234_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe234);
        out1024[idx + 1068] = resRe490_s;
        out1024[idx + 980] = resRe490_s;
        double resIm234_s = -eIm22 + (oRe22 * tRe234 + oIm22 * tRe22);
        out1024[idx + 981] = resIm490_s;
        out1024[idx + 1069] = -resIm490_s;
        
        double oRe23 = out1024[idx + 1070];
        double oIm23 = out1024[idx + 1071];
        double eRe23 = out1024[idx + 46];
        double eIm23 = out1024[idx + 47];
        double tRe23 = 0x1.fae8e8e46cfbbp-1;
        double tRe233 = 0x1.20116d4ec7bcfp-3;
        double resIm23_s = eIm23 + (oRe23 * tRe233 + oIm23 * tRe23);
        out1024[idx + 47] = resIm23_s;
        out1024[idx + 2003] = -resIm23_s;
        double resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe233);
        out1024[idx + 2002] = resRe23_s;
        out1024[idx + 46] = resRe23_s;
        double resRe233_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe233);
        out1024[idx + 1070] = resRe489_s;
        out1024[idx + 978] = resRe489_s;
        double resIm233_s = -eIm23 + (oRe23 * tRe233 + oIm23 * tRe23);
        out1024[idx + 979] = resIm489_s;
        out1024[idx + 1071] = -resIm489_s;
        
        double oRe24 = out1024[idx + 1072];
        double oIm24 = out1024[idx + 1073];
        double eRe24 = out1024[idx + 48];
        double eIm24 = out1024[idx + 49];
        double tRe24 = 0x1.fa7557f08a517p-1;
        double tRe232 = 0x1.2c8106e8e613ap-3;
        double resIm24_s = eIm24 + (oRe24 * tRe232 + oIm24 * tRe24);
        out1024[idx + 49] = resIm24_s;
        out1024[idx + 2001] = -resIm24_s;
        double resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe232);
        out1024[idx + 2000] = resRe24_s;
        out1024[idx + 48] = resRe24_s;
        double resRe232_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe232);
        out1024[idx + 1072] = resRe488_s;
        out1024[idx + 976] = resRe488_s;
        double resIm232_s = -eIm24 + (oRe24 * tRe232 + oIm24 * tRe24);
        out1024[idx + 977] = resIm488_s;
        out1024[idx + 1073] = -resIm488_s;
        
        double oRe25 = out1024[idx + 1074];
        double oIm25 = out1024[idx + 1075];
        double eRe25 = out1024[idx + 50];
        double eIm25 = out1024[idx + 51];
        double tRe25 = 0x1.f9fce55adb2c8p-1;
        double tRe231 = 0x1.38edbb0cd8d13p-3;
        double resIm25_s = eIm25 + (oRe25 * tRe231 + oIm25 * tRe25);
        out1024[idx + 51] = resIm25_s;
        out1024[idx + 1999] = -resIm25_s;
        double resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe231);
        out1024[idx + 1998] = resRe25_s;
        out1024[idx + 50] = resRe25_s;
        double resRe231_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe231);
        out1024[idx + 1074] = resRe487_s;
        out1024[idx + 974] = resRe487_s;
        double resIm231_s = -eIm25 + (oRe25 * tRe231 + oIm25 * tRe25);
        out1024[idx + 975] = resIm487_s;
        out1024[idx + 1075] = -resIm487_s;
        
        double oRe26 = out1024[idx + 1076];
        double oIm26 = out1024[idx + 1077];
        double eRe26 = out1024[idx + 52];
        double eIm26 = out1024[idx + 53];
        double tRe26 = 0x1.f97f924c9099bp-1;
        double tRe230 = 0x1.45576b1293e58p-3;
        double resIm26_s = eIm26 + (oRe26 * tRe230 + oIm26 * tRe26);
        out1024[idx + 53] = resIm26_s;
        out1024[idx + 1997] = -resIm26_s;
        double resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe230);
        out1024[idx + 1996] = resRe26_s;
        out1024[idx + 52] = resRe26_s;
        double resRe230_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe230);
        out1024[idx + 1076] = resRe486_s;
        out1024[idx + 972] = resRe486_s;
        double resIm230_s = -eIm26 + (oRe26 * tRe230 + oIm26 * tRe26);
        out1024[idx + 973] = resIm486_s;
        out1024[idx + 1077] = -resIm486_s;
        
        double oRe27 = out1024[idx + 1078];
        double oIm27 = out1024[idx + 1079];
        double eRe27 = out1024[idx + 54];
        double eIm27 = out1024[idx + 55];
        double tRe27 = 0x1.f8fd5ffae41dbp-1;
        double tRe229 = 0x1.51bdf8597c5f7p-3;
        double resIm27_s = eIm27 + (oRe27 * tRe229 + oIm27 * tRe27);
        out1024[idx + 55] = resIm27_s;
        out1024[idx + 1995] = -resIm27_s;
        double resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe229);
        out1024[idx + 1994] = resRe27_s;
        out1024[idx + 54] = resRe27_s;
        double resRe229_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe229);
        out1024[idx + 1078] = resRe485_s;
        out1024[idx + 970] = resRe485_s;
        double resIm229_s = -eIm27 + (oRe27 * tRe229 + oIm27 * tRe27);
        out1024[idx + 971] = resIm485_s;
        out1024[idx + 1079] = -resIm485_s;
        
        double oRe28 = out1024[idx + 1080];
        double oIm28 = out1024[idx + 1081];
        double eRe28 = out1024[idx + 56];
        double eIm28 = out1024[idx + 57];
        double tRe28 = 0x1.f8764fa714ba9p-1;
        double tRe228 = 0x1.5e214448b3fcbp-3;
        double resIm28_s = eIm28 + (oRe28 * tRe228 + oIm28 * tRe28);
        out1024[idx + 57] = resIm28_s;
        out1024[idx + 1993] = -resIm28_s;
        double resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe228);
        out1024[idx + 1992] = resRe28_s;
        out1024[idx + 56] = resRe28_s;
        double resRe228_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe228);
        out1024[idx + 1080] = resRe484_s;
        out1024[idx + 968] = resRe484_s;
        double resIm228_s = -eIm28 + (oRe28 * tRe228 + oIm28 * tRe28);
        out1024[idx + 969] = resIm484_s;
        out1024[idx + 1081] = -resIm484_s;
        
        double oRe29 = out1024[idx + 1082];
        double oIm29 = out1024[idx + 1083];
        double eRe29 = out1024[idx + 58];
        double eIm29 = out1024[idx + 59];
        double tRe29 = 0x1.f7ea629e63d6ep-1;
        double tRe227 = 0x1.6a81304f64ab6p-3;
        double resIm29_s = eIm29 + (oRe29 * tRe227 + oIm29 * tRe29);
        out1024[idx + 59] = resIm29_s;
        out1024[idx + 1991] = -resIm29_s;
        double resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe227);
        out1024[idx + 1990] = resRe29_s;
        out1024[idx + 58] = resRe29_s;
        double resRe227_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe227);
        out1024[idx + 1082] = resRe483_s;
        out1024[idx + 966] = resRe483_s;
        double resIm227_s = -eIm29 + (oRe29 * tRe227 + oIm29 * tRe29);
        out1024[idx + 967] = resIm483_s;
        out1024[idx + 1083] = -resIm483_s;
        
        double oRe30 = out1024[idx + 1084];
        double oIm30 = out1024[idx + 1085];
        double eRe30 = out1024[idx + 60];
        double eIm30 = out1024[idx + 61];
        double tRe30 = 0x1.f7599a3a12077p-1;
        double tRe226 = 0x1.76dd9de50bf34p-3;
        double resIm30_s = eIm30 + (oRe30 * tRe226 + oIm30 * tRe30);
        out1024[idx + 61] = resIm30_s;
        out1024[idx + 1989] = -resIm30_s;
        double resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe226);
        out1024[idx + 1988] = resRe30_s;
        out1024[idx + 60] = resRe30_s;
        double resRe226_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe226);
        out1024[idx + 1084] = resRe482_s;
        out1024[idx + 964] = resRe482_s;
        double resIm226_s = -eIm30 + (oRe30 * tRe226 + oIm30 * tRe30);
        out1024[idx + 965] = resIm482_s;
        out1024[idx + 1085] = -resIm482_s;
        
        double oRe31 = out1024[idx + 1086];
        double oIm31 = out1024[idx + 1087];
        double eRe31 = out1024[idx + 62];
        double eIm31 = out1024[idx + 63];
        double tRe31 = 0x1.f6c3f7df5bbb7p-1;
        double tRe225 = 0x1.83366e89c64c8p-3;
        double resIm31_s = eIm31 + (oRe31 * tRe225 + oIm31 * tRe31);
        out1024[idx + 63] = resIm31_s;
        out1024[idx + 1987] = -resIm31_s;
        double resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe225);
        out1024[idx + 1986] = resRe31_s;
        out1024[idx + 62] = resRe31_s;
        double resRe225_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe225);
        out1024[idx + 1086] = resRe481_s;
        out1024[idx + 962] = resRe481_s;
        double resIm225_s = -eIm31 + (oRe31 * tRe225 + oIm31 * tRe31);
        out1024[idx + 963] = resIm481_s;
        out1024[idx + 1087] = -resIm481_s;
        
        double oRe32 = out1024[idx + 1088];
        double oIm32 = out1024[idx + 1089];
        double eRe32 = out1024[idx + 64];
        double eIm32 = out1024[idx + 65];
        double tRe32 = 0x1.f6297cff75cbp-1;
        double tRe224 = 0x1.8f8b83c69a60cp-3;
        double resIm32_s = eIm32 + (oRe32 * tRe224 + oIm32 * tRe32);
        out1024[idx + 65] = resIm32_s;
        out1024[idx + 1985] = -resIm32_s;
        double resRe32_s = eRe32 + (oRe32 * tRe32 - oIm32 * tRe224);
        out1024[idx + 1984] = resRe32_s;
        out1024[idx + 64] = resRe32_s;
        double resRe224_s = eRe32 - (oRe32 * tRe32 - oIm32 * tRe224);
        out1024[idx + 1088] = resRe480_s;
        out1024[idx + 960] = resRe480_s;
        double resIm224_s = -eIm32 + (oRe32 * tRe224 + oIm32 * tRe32);
        out1024[idx + 961] = resIm480_s;
        out1024[idx + 1089] = -resIm480_s;
        
        double oRe33 = out1024[idx + 1090];
        double oIm33 = out1024[idx + 1091];
        double eRe33 = out1024[idx + 66];
        double eIm33 = out1024[idx + 67];
        double tRe33 = 0x1.f58a2b1789e84p-1;
        double tRe223 = 0x1.9bdcbf2dc4367p-3;
        double resIm33_s = eIm33 + (oRe33 * tRe223 + oIm33 * tRe33);
        out1024[idx + 67] = resIm33_s;
        out1024[idx + 1983] = -resIm33_s;
        double resRe33_s = eRe33 + (oRe33 * tRe33 - oIm33 * tRe223);
        out1024[idx + 1982] = resRe33_s;
        out1024[idx + 66] = resRe33_s;
        double resRe223_s = eRe33 - (oRe33 * tRe33 - oIm33 * tRe223);
        out1024[idx + 1090] = resRe479_s;
        out1024[idx + 958] = resRe479_s;
        double resIm223_s = -eIm33 + (oRe33 * tRe223 + oIm33 * tRe33);
        out1024[idx + 959] = resIm479_s;
        out1024[idx + 1091] = -resIm479_s;
        
        double oRe34 = out1024[idx + 1092];
        double oIm34 = out1024[idx + 1093];
        double eRe34 = out1024[idx + 68];
        double eIm34 = out1024[idx + 69];
        double tRe34 = 0x1.f4e603b0b2f2dp-1;
        double tRe222 = 0x1.a82a025b00451p-3;
        double resIm34_s = eIm34 + (oRe34 * tRe222 + oIm34 * tRe34);
        out1024[idx + 69] = resIm34_s;
        out1024[idx + 1981] = -resIm34_s;
        double resRe34_s = eRe34 + (oRe34 * tRe34 - oIm34 * tRe222);
        out1024[idx + 1980] = resRe34_s;
        out1024[idx + 68] = resRe34_s;
        double resRe222_s = eRe34 - (oRe34 * tRe34 - oIm34 * tRe222);
        out1024[idx + 1092] = resRe478_s;
        out1024[idx + 956] = resRe478_s;
        double resIm222_s = -eIm34 + (oRe34 * tRe222 + oIm34 * tRe34);
        out1024[idx + 957] = resIm478_s;
        out1024[idx + 1093] = -resIm478_s;
        
        double oRe35 = out1024[idx + 1094];
        double oIm35 = out1024[idx + 1095];
        double eRe35 = out1024[idx + 70];
        double eIm35 = out1024[idx + 71];
        double tRe35 = 0x1.f43d085ff92ddp-1;
        double tRe221 = 0x1.b4732ef3d6722p-3;
        double resIm35_s = eIm35 + (oRe35 * tRe221 + oIm35 * tRe35);
        out1024[idx + 71] = resIm35_s;
        out1024[idx + 1979] = -resIm35_s;
        double resRe35_s = eRe35 + (oRe35 * tRe35 - oIm35 * tRe221);
        out1024[idx + 1978] = resRe35_s;
        out1024[idx + 70] = resRe35_s;
        double resRe221_s = eRe35 - (oRe35 * tRe35 - oIm35 * tRe221);
        out1024[idx + 1094] = resRe477_s;
        out1024[idx + 954] = resRe477_s;
        double resIm221_s = -eIm35 + (oRe35 * tRe221 + oIm35 * tRe35);
        out1024[idx + 955] = resIm477_s;
        out1024[idx + 1095] = -resIm477_s;
        
        double oRe36 = out1024[idx + 1096];
        double oIm36 = out1024[idx + 1097];
        double eRe36 = out1024[idx + 72];
        double eIm36 = out1024[idx + 73];
        double tRe36 = 0x1.f38f3ac64e589p-1;
        double tRe220 = 0x1.c0b826a7e4f62p-3;
        double resIm36_s = eIm36 + (oRe36 * tRe220 + oIm36 * tRe36);
        out1024[idx + 73] = resIm36_s;
        out1024[idx + 1977] = -resIm36_s;
        double resRe36_s = eRe36 + (oRe36 * tRe36 - oIm36 * tRe220);
        out1024[idx + 1976] = resRe36_s;
        out1024[idx + 72] = resRe36_s;
        double resRe220_s = eRe36 - (oRe36 * tRe36 - oIm36 * tRe220);
        out1024[idx + 1096] = resRe476_s;
        out1024[idx + 952] = resRe476_s;
        double resIm220_s = -eIm36 + (oRe36 * tRe220 + oIm36 * tRe36);
        out1024[idx + 953] = resIm476_s;
        out1024[idx + 1097] = -resIm476_s;
        
        double oRe37 = out1024[idx + 1098];
        double oIm37 = out1024[idx + 1099];
        double eRe37 = out1024[idx + 74];
        double eIm37 = out1024[idx + 75];
        double tRe37 = 0x1.f2dc9c9089a9dp-1;
        double tRe219 = 0x1.ccf8cb312b284p-3;
        double resIm37_s = eIm37 + (oRe37 * tRe219 + oIm37 * tRe37);
        out1024[idx + 75] = resIm37_s;
        out1024[idx + 1975] = -resIm37_s;
        double resRe37_s = eRe37 + (oRe37 * tRe37 - oIm37 * tRe219);
        out1024[idx + 1974] = resRe37_s;
        out1024[idx + 74] = resRe37_s;
        double resRe219_s = eRe37 - (oRe37 * tRe37 - oIm37 * tRe219);
        out1024[idx + 1098] = resRe475_s;
        out1024[idx + 950] = resRe475_s;
        double resIm219_s = -eIm37 + (oRe37 * tRe219 + oIm37 * tRe37);
        out1024[idx + 951] = resIm475_s;
        out1024[idx + 1099] = -resIm475_s;
        
        double oRe38 = out1024[idx + 1100];
        double oIm38 = out1024[idx + 1101];
        double eRe38 = out1024[idx + 76];
        double eIm38 = out1024[idx + 77];
        double tRe38 = 0x1.f2252f7763adap-1;
        double tRe218 = 0x1.d934fe5454316p-3;
        double resIm38_s = eIm38 + (oRe38 * tRe218 + oIm38 * tRe38);
        out1024[idx + 77] = resIm38_s;
        out1024[idx + 1973] = -resIm38_s;
        double resRe38_s = eRe38 + (oRe38 * tRe38 - oIm38 * tRe218);
        out1024[idx + 1972] = resRe38_s;
        out1024[idx + 76] = resRe38_s;
        double resRe218_s = eRe38 - (oRe38 * tRe38 - oIm38 * tRe218);
        out1024[idx + 1100] = resRe474_s;
        out1024[idx + 948] = resRe474_s;
        double resIm218_s = -eIm38 + (oRe38 * tRe218 + oIm38 * tRe38);
        out1024[idx + 949] = resIm474_s;
        out1024[idx + 1101] = -resIm474_s;
        
        double oRe39 = out1024[idx + 1102];
        double oIm39 = out1024[idx + 1103];
        double eRe39 = out1024[idx + 78];
        double eIm39 = out1024[idx + 79];
        double tRe39 = 0x1.f168f53f7205dp-1;
        double tRe217 = 0x1.e56ca1e101a2p-3;
        double resIm39_s = eIm39 + (oRe39 * tRe217 + oIm39 * tRe39);
        out1024[idx + 79] = resIm39_s;
        out1024[idx + 1971] = -resIm39_s;
        double resRe39_s = eRe39 + (oRe39 * tRe39 - oIm39 * tRe217);
        out1024[idx + 1970] = resRe39_s;
        out1024[idx + 78] = resRe39_s;
        double resRe217_s = eRe39 - (oRe39 * tRe39 - oIm39 * tRe217);
        out1024[idx + 1102] = resRe473_s;
        out1024[idx + 946] = resRe473_s;
        double resIm217_s = -eIm39 + (oRe39 * tRe217 + oIm39 * tRe39);
        out1024[idx + 947] = resIm473_s;
        out1024[idx + 1103] = -resIm473_s;
        
        double oRe40 = out1024[idx + 1104];
        double oIm40 = out1024[idx + 1105];
        double eRe40 = out1024[idx + 80];
        double eIm40 = out1024[idx + 81];
        double tRe40 = 0x1.f0a7efb9230d7p-1;
        double tRe216 = 0x1.f19f97b215f1ep-3;
        double resIm40_s = eIm40 + (oRe40 * tRe216 + oIm40 * tRe40);
        out1024[idx + 81] = resIm40_s;
        out1024[idx + 1969] = -resIm40_s;
        double resRe40_s = eRe40 + (oRe40 * tRe40 - oIm40 * tRe216);
        out1024[idx + 1968] = resRe40_s;
        out1024[idx + 80] = resRe40_s;
        double resRe216_s = eRe40 - (oRe40 * tRe40 - oIm40 * tRe216);
        out1024[idx + 1104] = resRe472_s;
        out1024[idx + 944] = resRe472_s;
        double resIm216_s = -eIm40 + (oRe40 * tRe216 + oIm40 * tRe40);
        out1024[idx + 945] = resIm472_s;
        out1024[idx + 1105] = -resIm472_s;
        
        double oRe41 = out1024[idx + 1106];
        double oIm41 = out1024[idx + 1107];
        double eRe41 = out1024[idx + 82];
        double eIm41 = out1024[idx + 83];
        double tRe41 = 0x1.efe220c0b95ecp-1;
        double tRe215 = 0x1.fdcdc1adfedfcp-3;
        double resIm41_s = eIm41 + (oRe41 * tRe215 + oIm41 * tRe41);
        out1024[idx + 83] = resIm41_s;
        out1024[idx + 1967] = -resIm41_s;
        double resRe41_s = eRe41 + (oRe41 * tRe41 - oIm41 * tRe215);
        out1024[idx + 1966] = resRe41_s;
        out1024[idx + 82] = resRe41_s;
        double resRe215_s = eRe41 - (oRe41 * tRe41 - oIm41 * tRe215);
        out1024[idx + 1106] = resRe471_s;
        out1024[idx + 942] = resRe471_s;
        double resIm215_s = -eIm41 + (oRe41 * tRe215 + oIm41 * tRe41);
        out1024[idx + 943] = resIm471_s;
        out1024[idx + 1107] = -resIm471_s;
        
        double oRe42 = out1024[idx + 1108];
        double oIm42 = out1024[idx + 1109];
        double eRe42 = out1024[idx + 84];
        double eIm42 = out1024[idx + 85];
        double tRe42 = 0x1.ef178a3e473c2p-1;
        double tRe214 = 0x1.04fb80e37fdafp-2;
        double resIm42_s = eIm42 + (oRe42 * tRe214 + oIm42 * tRe42);
        out1024[idx + 85] = resIm42_s;
        out1024[idx + 1965] = -resIm42_s;
        double resRe42_s = eRe42 + (oRe42 * tRe42 - oIm42 * tRe214);
        out1024[idx + 1964] = resRe42_s;
        out1024[idx + 84] = resRe42_s;
        double resRe214_s = eRe42 - (oRe42 * tRe42 - oIm42 * tRe214);
        out1024[idx + 1108] = resRe470_s;
        out1024[idx + 940] = resRe470_s;
        double resIm214_s = -eIm42 + (oRe42 * tRe214 + oIm42 * tRe42);
        out1024[idx + 941] = resIm470_s;
        out1024[idx + 1109] = -resIm470_s;
        
        double oRe43 = out1024[idx + 1110];
        double oIm43 = out1024[idx + 1111];
        double eRe43 = out1024[idx + 86];
        double eIm43 = out1024[idx + 87];
        double tRe43 = 0x1.ee482e25a9dbcp-1;
        double tRe213 = 0x1.0b0d9cfdbdb91p-2;
        double resIm43_s = eIm43 + (oRe43 * tRe213 + oIm43 * tRe43);
        out1024[idx + 87] = resIm43_s;
        out1024[idx + 1963] = -resIm43_s;
        double resRe43_s = eRe43 + (oRe43 * tRe43 - oIm43 * tRe213);
        out1024[idx + 1962] = resRe43_s;
        out1024[idx + 86] = resRe43_s;
        double resRe213_s = eRe43 - (oRe43 * tRe43 - oIm43 * tRe213);
        out1024[idx + 1110] = resRe469_s;
        out1024[idx + 938] = resRe469_s;
        double resIm213_s = -eIm43 + (oRe43 * tRe213 + oIm43 * tRe43);
        out1024[idx + 939] = resIm469_s;
        out1024[idx + 1111] = -resIm469_s;
        
        double oRe44 = out1024[idx + 1112];
        double oIm44 = out1024[idx + 1113];
        double eRe44 = out1024[idx + 88];
        double eIm44 = out1024[idx + 89];
        double tRe44 = 0x1.ed740e7684963p-1;
        double tRe212 = 0x1.111d262b1f678p-2;
        double resIm44_s = eIm44 + (oRe44 * tRe212 + oIm44 * tRe44);
        out1024[idx + 89] = resIm44_s;
        out1024[idx + 1961] = -resIm44_s;
        double resRe44_s = eRe44 + (oRe44 * tRe44 - oIm44 * tRe212);
        out1024[idx + 1960] = resRe44_s;
        out1024[idx + 88] = resRe44_s;
        double resRe212_s = eRe44 - (oRe44 * tRe44 - oIm44 * tRe212);
        out1024[idx + 1112] = resRe468_s;
        out1024[idx + 936] = resRe468_s;
        double resIm212_s = -eIm44 + (oRe44 * tRe212 + oIm44 * tRe44);
        out1024[idx + 937] = resIm468_s;
        out1024[idx + 1113] = -resIm468_s;
        
        double oRe45 = out1024[idx + 1114];
        double oIm45 = out1024[idx + 1115];
        double eRe45 = out1024[idx + 90];
        double eIm45 = out1024[idx + 91];
        double tRe45 = 0x1.ec9b2d3c3bf84p-1;
        double tRe211 = 0x1.172a0d7765177p-2;
        double resIm45_s = eIm45 + (oRe45 * tRe211 + oIm45 * tRe45);
        out1024[idx + 91] = resIm45_s;
        out1024[idx + 1959] = -resIm45_s;
        double resRe45_s = eRe45 + (oRe45 * tRe45 - oIm45 * tRe211);
        out1024[idx + 1958] = resRe45_s;
        out1024[idx + 90] = resRe45_s;
        double resRe211_s = eRe45 - (oRe45 * tRe45 - oIm45 * tRe211);
        out1024[idx + 1114] = resRe467_s;
        out1024[idx + 934] = resRe467_s;
        double resIm211_s = -eIm45 + (oRe45 * tRe211 + oIm45 * tRe45);
        out1024[idx + 935] = resIm467_s;
        out1024[idx + 1115] = -resIm467_s;
        
        double oRe46 = out1024[idx + 1116];
        double oIm46 = out1024[idx + 1117];
        double eRe46 = out1024[idx + 92];
        double eIm46 = out1024[idx + 93];
        double tRe46 = 0x1.ebbd8c8df0b74p-1;
        double tRe210 = 0x1.1d3443f4cdb3dp-2;
        double resIm46_s = eIm46 + (oRe46 * tRe210 + oIm46 * tRe46);
        out1024[idx + 93] = resIm46_s;
        out1024[idx + 1957] = -resIm46_s;
        double resRe46_s = eRe46 + (oRe46 * tRe46 - oIm46 * tRe210);
        out1024[idx + 1956] = resRe46_s;
        out1024[idx + 92] = resRe46_s;
        double resRe210_s = eRe46 - (oRe46 * tRe46 - oIm46 * tRe210);
        out1024[idx + 1116] = resRe466_s;
        out1024[idx + 932] = resRe466_s;
        double resIm210_s = -eIm46 + (oRe46 * tRe210 + oIm46 * tRe46);
        out1024[idx + 933] = resIm466_s;
        out1024[idx + 1117] = -resIm466_s;
        
        double oRe47 = out1024[idx + 1118];
        double oIm47 = out1024[idx + 1119];
        double eRe47 = out1024[idx + 94];
        double eIm47 = out1024[idx + 95];
        double tRe47 = 0x1.eadb2e8e7a88ep-1;
        double tRe209 = 0x1.233bbabc3bb71p-2;
        double resIm47_s = eIm47 + (oRe47 * tRe209 + oIm47 * tRe47);
        out1024[idx + 95] = resIm47_s;
        out1024[idx + 1955] = -resIm47_s;
        double resRe47_s = eRe47 + (oRe47 * tRe47 - oIm47 * tRe209);
        out1024[idx + 1954] = resRe47_s;
        out1024[idx + 94] = resRe47_s;
        double resRe209_s = eRe47 - (oRe47 * tRe47 - oIm47 * tRe209);
        out1024[idx + 1118] = resRe465_s;
        out1024[idx + 930] = resRe465_s;
        double resIm209_s = -eIm47 + (oRe47 * tRe209 + oIm47 * tRe47);
        out1024[idx + 931] = resIm465_s;
        out1024[idx + 1119] = -resIm465_s;
        
        double oRe48 = out1024[idx + 1120];
        double oIm48 = out1024[idx + 1121];
        double eRe48 = out1024[idx + 96];
        double eIm48 = out1024[idx + 97];
        double tRe48 = 0x1.e9f4156c62ddap-1;
        double tRe208 = 0x1.294062ed59f04p-2;
        double resIm48_s = eIm48 + (oRe48 * tRe208 + oIm48 * tRe48);
        out1024[idx + 97] = resIm48_s;
        out1024[idx + 1953] = -resIm48_s;
        double resRe48_s = eRe48 + (oRe48 * tRe48 - oIm48 * tRe208);
        out1024[idx + 1952] = resRe48_s;
        out1024[idx + 96] = resRe48_s;
        double resRe208_s = eRe48 - (oRe48 * tRe48 - oIm48 * tRe208);
        out1024[idx + 1120] = resRe464_s;
        out1024[idx + 928] = resRe464_s;
        double resIm208_s = -eIm48 + (oRe48 * tRe208 + oIm48 * tRe48);
        out1024[idx + 929] = resIm464_s;
        out1024[idx + 1121] = -resIm464_s;
        
        double oRe49 = out1024[idx + 1122];
        double oIm49 = out1024[idx + 1123];
        double eRe49 = out1024[idx + 98];
        double eIm49 = out1024[idx + 99];
        double tRe49 = 0x1.e9084361df7f2p-1;
        double tRe207 = 0x1.2f422daec0389p-2;
        double resIm49_s = eIm49 + (oRe49 * tRe207 + oIm49 * tRe49);
        out1024[idx + 99] = resIm49_s;
        out1024[idx + 1951] = -resIm49_s;
        double resRe49_s = eRe49 + (oRe49 * tRe49 - oIm49 * tRe207);
        out1024[idx + 1950] = resRe49_s;
        out1024[idx + 98] = resRe49_s;
        double resRe207_s = eRe49 - (oRe49 * tRe49 - oIm49 * tRe207);
        out1024[idx + 1122] = resRe463_s;
        out1024[idx + 926] = resRe463_s;
        double resIm207_s = -eIm49 + (oRe49 * tRe207 + oIm49 * tRe49);
        out1024[idx + 927] = resIm463_s;
        out1024[idx + 1123] = -resIm463_s;
        
        double oRe50 = out1024[idx + 1124];
        double oIm50 = out1024[idx + 1125];
        double eRe50 = out1024[idx + 100];
        double eIm50 = out1024[idx + 101];
        double tRe50 = 0x1.e817bab4cd10dp-1;
        double tRe206 = 0x1.35410c2e18154p-2;
        double resIm50_s = eIm50 + (oRe50 * tRe206 + oIm50 * tRe50);
        out1024[idx + 101] = resIm50_s;
        out1024[idx + 1949] = -resIm50_s;
        double resRe50_s = eRe50 + (oRe50 * tRe50 - oIm50 * tRe206);
        out1024[idx + 1948] = resRe50_s;
        out1024[idx + 100] = resRe50_s;
        double resRe206_s = eRe50 - (oRe50 * tRe50 - oIm50 * tRe206);
        out1024[idx + 1124] = resRe462_s;
        out1024[idx + 924] = resRe462_s;
        double resIm206_s = -eIm50 + (oRe50 * tRe206 + oIm50 * tRe50);
        out1024[idx + 925] = resIm462_s;
        out1024[idx + 1125] = -resIm462_s;
        
        double oRe51 = out1024[idx + 1126];
        double oIm51 = out1024[idx + 1127];
        double eRe51 = out1024[idx + 102];
        double eIm51 = out1024[idx + 103];
        double tRe51 = 0x1.e7227db6a9744p-1;
        double tRe205 = 0x1.3b3cefa0414b9p-2;
        double resIm51_s = eIm51 + (oRe51 * tRe205 + oIm51 * tRe51);
        out1024[idx + 103] = resIm51_s;
        out1024[idx + 1947] = -resIm51_s;
        double resRe51_s = eRe51 + (oRe51 * tRe51 - oIm51 * tRe205);
        out1024[idx + 1946] = resRe51_s;
        out1024[idx + 102] = resRe51_s;
        double resRe205_s = eRe51 - (oRe51 * tRe51 - oIm51 * tRe205);
        out1024[idx + 1126] = resRe461_s;
        out1024[idx + 922] = resRe461_s;
        double resIm205_s = -eIm51 + (oRe51 * tRe205 + oIm51 * tRe51);
        out1024[idx + 923] = resIm461_s;
        out1024[idx + 1127] = -resIm461_s;
        
        double oRe52 = out1024[idx + 1128];
        double oIm52 = out1024[idx + 1129];
        double eRe52 = out1024[idx + 104];
        double eIm52 = out1024[idx + 105];
        double tRe52 = 0x1.e6288ec48e112p-1;
        double tRe204 = 0x1.4135c94176602p-2;
        double resIm52_s = eIm52 + (oRe52 * tRe204 + oIm52 * tRe52);
        out1024[idx + 105] = resIm52_s;
        out1024[idx + 1945] = -resIm52_s;
        double resRe52_s = eRe52 + (oRe52 * tRe52 - oIm52 * tRe204);
        out1024[idx + 1944] = resRe52_s;
        out1024[idx + 104] = resRe52_s;
        double resRe204_s = eRe52 - (oRe52 * tRe52 - oIm52 * tRe204);
        out1024[idx + 1128] = resRe460_s;
        out1024[idx + 920] = resRe460_s;
        double resIm204_s = -eIm52 + (oRe52 * tRe204 + oIm52 * tRe52);
        out1024[idx + 921] = resIm460_s;
        out1024[idx + 1129] = -resIm460_s;
        
        double oRe53 = out1024[idx + 1130];
        double oIm53 = out1024[idx + 1131];
        double eRe53 = out1024[idx + 106];
        double eIm53 = out1024[idx + 107];
        double tRe53 = 0x1.e529f04729ffcp-1;
        double tRe203 = 0x1.472b8a5571055p-2;
        double resIm53_s = eIm53 + (oRe53 * tRe203 + oIm53 * tRe53);
        out1024[idx + 107] = resIm53_s;
        out1024[idx + 1943] = -resIm53_s;
        double resRe53_s = eRe53 + (oRe53 * tRe53 - oIm53 * tRe203);
        out1024[idx + 1942] = resRe53_s;
        out1024[idx + 106] = resRe53_s;
        double resRe203_s = eRe53 - (oRe53 * tRe53 - oIm53 * tRe203);
        out1024[idx + 1130] = resRe459_s;
        out1024[idx + 918] = resRe459_s;
        double resIm203_s = -eIm53 + (oRe53 * tRe203 + oIm53 * tRe53);
        out1024[idx + 919] = resIm459_s;
        out1024[idx + 1131] = -resIm459_s;
        
        double oRe54 = out1024[idx + 1132];
        double oIm54 = out1024[idx + 1133];
        double eRe54 = out1024[idx + 108];
        double eIm54 = out1024[idx + 109];
        double tRe54 = 0x1.e426a4b2bc17ep-1;
        double tRe202 = 0x1.4d1e24278e76bp-2;
        double resIm54_s = eIm54 + (oRe54 * tRe202 + oIm54 * tRe54);
        out1024[idx + 109] = resIm54_s;
        out1024[idx + 1941] = -resIm54_s;
        double resRe54_s = eRe54 + (oRe54 * tRe54 - oIm54 * tRe202);
        out1024[idx + 1940] = resRe54_s;
        out1024[idx + 108] = resRe54_s;
        double resRe202_s = eRe54 - (oRe54 * tRe54 - oIm54 * tRe202);
        out1024[idx + 1132] = resRe458_s;
        out1024[idx + 916] = resRe458_s;
        double resIm202_s = -eIm54 + (oRe54 * tRe202 + oIm54 * tRe54);
        out1024[idx + 917] = resIm458_s;
        out1024[idx + 1133] = -resIm458_s;
        
        double oRe55 = out1024[idx + 1134];
        double oIm55 = out1024[idx + 1135];
        double eRe55 = out1024[idx + 110];
        double eIm55 = out1024[idx + 111];
        double tRe55 = 0x1.e31eae870ce25p-1;
        double tRe201 = 0x1.530d880af3c24p-2;
        double resIm55_s = eIm55 + (oRe55 * tRe201 + oIm55 * tRe55);
        out1024[idx + 111] = resIm55_s;
        out1024[idx + 1939] = -resIm55_s;
        double resRe55_s = eRe55 + (oRe55 * tRe55 - oIm55 * tRe201);
        out1024[idx + 1938] = resRe55_s;
        out1024[idx + 110] = resRe55_s;
        double resRe201_s = eRe55 - (oRe55 * tRe55 - oIm55 * tRe201);
        out1024[idx + 1134] = resRe457_s;
        out1024[idx + 914] = resRe457_s;
        double resIm201_s = -eIm55 + (oRe55 * tRe201 + oIm55 * tRe55);
        out1024[idx + 915] = resIm457_s;
        out1024[idx + 1135] = -resIm457_s;
        
        double oRe56 = out1024[idx + 1136];
        double oIm56 = out1024[idx + 1137];
        double eRe56 = out1024[idx + 112];
        double eIm56 = out1024[idx + 113];
        double tRe56 = 0x1.e212104f686e5p-1;
        double tRe200 = 0x1.58f9a75ab1fddp-2;
        double resIm56_s = eIm56 + (oRe56 * tRe200 + oIm56 * tRe56);
        out1024[idx + 113] = resIm56_s;
        out1024[idx + 1937] = -resIm56_s;
        double resRe56_s = eRe56 + (oRe56 * tRe56 - oIm56 * tRe200);
        out1024[idx + 1936] = resRe56_s;
        out1024[idx + 112] = resRe56_s;
        double resRe200_s = eRe56 - (oRe56 * tRe56 - oIm56 * tRe200);
        out1024[idx + 1136] = resRe456_s;
        out1024[idx + 912] = resRe456_s;
        double resIm200_s = -eIm56 + (oRe56 * tRe200 + oIm56 * tRe56);
        out1024[idx + 913] = resIm456_s;
        out1024[idx + 1137] = -resIm456_s;
        
        double oRe57 = out1024[idx + 1138];
        double oIm57 = out1024[idx + 1139];
        double eRe57 = out1024[idx + 114];
        double eIm57 = out1024[idx + 115];
        double tRe57 = 0x1.e100cca2980acp-1;
        double tRe199 = 0x1.5ee27379ea693p-2;
        double resIm57_s = eIm57 + (oRe57 * tRe199 + oIm57 * tRe57);
        out1024[idx + 115] = resIm57_s;
        out1024[idx + 1935] = -resIm57_s;
        double resRe57_s = eRe57 + (oRe57 * tRe57 - oIm57 * tRe199);
        out1024[idx + 1934] = resRe57_s;
        out1024[idx + 114] = resRe57_s;
        double resRe199_s = eRe57 - (oRe57 * tRe57 - oIm57 * tRe199);
        out1024[idx + 1138] = resRe455_s;
        out1024[idx + 910] = resRe455_s;
        double resIm199_s = -eIm57 + (oRe57 * tRe199 + oIm57 * tRe57);
        out1024[idx + 911] = resIm455_s;
        out1024[idx + 1139] = -resIm455_s;
        
        double oRe58 = out1024[idx + 1140];
        double oIm58 = out1024[idx + 1141];
        double eRe58 = out1024[idx + 116];
        double eIm58 = out1024[idx + 117];
        double tRe58 = 0x1.dfeae622dbe2bp-1;
        double tRe198 = 0x1.64c7ddd3f27c5p-2;
        double resIm58_s = eIm58 + (oRe58 * tRe198 + oIm58 * tRe58);
        out1024[idx + 117] = resIm58_s;
        out1024[idx + 1933] = -resIm58_s;
        double resRe58_s = eRe58 + (oRe58 * tRe58 - oIm58 * tRe198);
        out1024[idx + 1932] = resRe58_s;
        out1024[idx + 116] = resRe58_s;
        double resRe198_s = eRe58 - (oRe58 * tRe58 - oIm58 * tRe198);
        out1024[idx + 1140] = resRe454_s;
        out1024[idx + 908] = resRe454_s;
        double resIm198_s = -eIm58 + (oRe58 * tRe198 + oIm58 * tRe58);
        out1024[idx + 909] = resIm454_s;
        out1024[idx + 1141] = -resIm454_s;
        
        double oRe59 = out1024[idx + 1142];
        double oIm59 = out1024[idx + 1143];
        double eRe59 = out1024[idx + 118];
        double eIm59 = out1024[idx + 119];
        double tRe59 = 0x1.ded05f7de47dap-1;
        double tRe197 = 0x1.6aa9d7dc77e19p-2;
        double resIm59_s = eIm59 + (oRe59 * tRe197 + oIm59 * tRe59);
        out1024[idx + 119] = resIm59_s;
        out1024[idx + 1931] = -resIm59_s;
        double resRe59_s = eRe59 + (oRe59 * tRe59 - oIm59 * tRe197);
        out1024[idx + 1930] = resRe59_s;
        out1024[idx + 118] = resRe59_s;
        double resRe197_s = eRe59 - (oRe59 * tRe59 - oIm59 * tRe197);
        out1024[idx + 1142] = resRe453_s;
        out1024[idx + 906] = resRe453_s;
        double resIm197_s = -eIm59 + (oRe59 * tRe197 + oIm59 * tRe59);
        out1024[idx + 907] = resIm453_s;
        out1024[idx + 1143] = -resIm453_s;
        
        double oRe60 = out1024[idx + 1144];
        double oIm60 = out1024[idx + 1145];
        double eRe60 = out1024[idx + 120];
        double eIm60 = out1024[idx + 121];
        double tRe60 = 0x1.ddb13b6ccc23dp-1;
        double tRe196 = 0x1.7088530fa45a1p-2;
        double resIm60_s = eIm60 + (oRe60 * tRe196 + oIm60 * tRe60);
        out1024[idx + 121] = resIm60_s;
        out1024[idx + 1929] = -resIm60_s;
        double resRe60_s = eRe60 + (oRe60 * tRe60 - oIm60 * tRe196);
        out1024[idx + 1928] = resRe60_s;
        out1024[idx + 120] = resRe60_s;
        double resRe196_s = eRe60 - (oRe60 * tRe60 - oIm60 * tRe196);
        out1024[idx + 1144] = resRe452_s;
        out1024[idx + 904] = resRe452_s;
        double resIm196_s = -eIm60 + (oRe60 * tRe196 + oIm60 * tRe60);
        out1024[idx + 905] = resIm452_s;
        out1024[idx + 1145] = -resIm452_s;
        
        double oRe61 = out1024[idx + 1146];
        double oIm61 = out1024[idx + 1147];
        double eRe61 = out1024[idx + 122];
        double eIm61 = out1024[idx + 123];
        double tRe61 = 0x1.dc8d7cb41026p-1;
        double tRe195 = 0x1.766340f2418f8p-2;
        double resIm61_s = eIm61 + (oRe61 * tRe195 + oIm61 * tRe61);
        out1024[idx + 123] = resIm61_s;
        out1024[idx + 1927] = -resIm61_s;
        double resRe61_s = eRe61 + (oRe61 * tRe61 - oIm61 * tRe195);
        out1024[idx + 1926] = resRe61_s;
        out1024[idx + 122] = resRe61_s;
        double resRe195_s = eRe61 - (oRe61 * tRe61 - oIm61 * tRe195);
        out1024[idx + 1146] = resRe451_s;
        out1024[idx + 902] = resRe451_s;
        double resIm195_s = -eIm61 + (oRe61 * tRe195 + oIm61 * tRe61);
        out1024[idx + 903] = resIm451_s;
        out1024[idx + 1147] = -resIm451_s;
        
        double oRe62 = out1024[idx + 1148];
        double oIm62 = out1024[idx + 1149];
        double eRe62 = out1024[idx + 124];
        double eIm62 = out1024[idx + 125];
        double tRe62 = 0x1.db6526238a09bp-1;
        double tRe194 = 0x1.7c3a9311dcce8p-2;
        double resIm62_s = eIm62 + (oRe62 * tRe194 + oIm62 * tRe62);
        out1024[idx + 125] = resIm62_s;
        out1024[idx + 1925] = -resIm62_s;
        double resRe62_s = eRe62 + (oRe62 * tRe62 - oIm62 * tRe194);
        out1024[idx + 1924] = resRe62_s;
        out1024[idx + 124] = resRe62_s;
        double resRe194_s = eRe62 - (oRe62 * tRe62 - oIm62 * tRe194);
        out1024[idx + 1148] = resRe450_s;
        out1024[idx + 900] = resRe450_s;
        double resIm194_s = -eIm62 + (oRe62 * tRe194 + oIm62 * tRe62);
        out1024[idx + 901] = resIm450_s;
        out1024[idx + 1149] = -resIm450_s;
        
        double oRe63 = out1024[idx + 1150];
        double oIm63 = out1024[idx + 1151];
        double eRe63 = out1024[idx + 126];
        double eIm63 = out1024[idx + 127];
        double tRe63 = 0x1.da383a9668988p-1;
        double tRe193 = 0x1.820e3b04eaac5p-2;
        double resIm63_s = eIm63 + (oRe63 * tRe193 + oIm63 * tRe63);
        out1024[idx + 127] = resIm63_s;
        out1024[idx + 1923] = -resIm63_s;
        double resRe63_s = eRe63 + (oRe63 * tRe63 - oIm63 * tRe193);
        out1024[idx + 1922] = resRe63_s;
        out1024[idx + 126] = resRe63_s;
        double resRe193_s = eRe63 - (oRe63 * tRe63 - oIm63 * tRe193);
        out1024[idx + 1150] = resRe449_s;
        out1024[idx + 898] = resRe449_s;
        double resIm193_s = -eIm63 + (oRe63 * tRe193 + oIm63 * tRe63);
        out1024[idx + 899] = resIm449_s;
        out1024[idx + 1151] = -resIm449_s;
        
        double oRe64 = out1024[idx + 1152];
        double oIm64 = out1024[idx + 1153];
        double eRe64 = out1024[idx + 128];
        double eIm64 = out1024[idx + 129];
        double tRe64 = 0x1.d906bcf328d46p-1;
        double tRe192 = 0x1.87de2a6aea964p-2;
        double resIm64_s = eIm64 + (oRe64 * tRe192 + oIm64 * tRe64);
        out1024[idx + 129] = resIm64_s;
        out1024[idx + 1921] = -resIm64_s;
        double resRe64_s = eRe64 + (oRe64 * tRe64 - oIm64 * tRe192);
        out1024[idx + 1920] = resRe64_s;
        out1024[idx + 128] = resRe64_s;
        double resRe192_s = eRe64 - (oRe64 * tRe64 - oIm64 * tRe192);
        out1024[idx + 1152] = resRe448_s;
        out1024[idx + 896] = resRe448_s;
        double resIm192_s = -eIm64 + (oRe64 * tRe192 + oIm64 * tRe64);
        out1024[idx + 897] = resIm448_s;
        out1024[idx + 1153] = -resIm448_s;
        
        double oRe65 = out1024[idx + 1154];
        double oIm65 = out1024[idx + 1155];
        double eRe65 = out1024[idx + 130];
        double eIm65 = out1024[idx + 131];
        double tRe65 = 0x1.d7d0b02b8ecf9p-1;
        double tRe191 = 0x1.8daa52ec8a4bp-2;
        double resIm65_s = eIm65 + (oRe65 * tRe191 + oIm65 * tRe65);
        out1024[idx + 131] = resIm65_s;
        out1024[idx + 1919] = -resIm65_s;
        double resRe65_s = eRe65 + (oRe65 * tRe65 - oIm65 * tRe191);
        out1024[idx + 1918] = resRe65_s;
        out1024[idx + 130] = resRe65_s;
        double resRe191_s = eRe65 - (oRe65 * tRe65 - oIm65 * tRe191);
        out1024[idx + 1154] = resRe447_s;
        out1024[idx + 894] = resRe447_s;
        double resIm191_s = -eIm65 + (oRe65 * tRe191 + oIm65 * tRe65);
        out1024[idx + 895] = resIm447_s;
        out1024[idx + 1155] = -resIm447_s;
        
        double oRe66 = out1024[idx + 1156];
        double oIm66 = out1024[idx + 1157];
        double eRe66 = out1024[idx + 132];
        double eIm66 = out1024[idx + 133];
        double tRe66 = 0x1.d696173c9e68bp-1;
        double tRe190 = 0x1.9372a63bc93d7p-2;
        double resIm66_s = eIm66 + (oRe66 * tRe190 + oIm66 * tRe66);
        out1024[idx + 133] = resIm66_s;
        out1024[idx + 1917] = -resIm66_s;
        double resRe66_s = eRe66 + (oRe66 * tRe66 - oIm66 * tRe190);
        out1024[idx + 1916] = resRe66_s;
        out1024[idx + 132] = resRe66_s;
        double resRe190_s = eRe66 - (oRe66 * tRe66 - oIm66 * tRe190);
        out1024[idx + 1156] = resRe446_s;
        out1024[idx + 892] = resRe446_s;
        double resIm190_s = -eIm66 + (oRe66 * tRe190 + oIm66 * tRe66);
        out1024[idx + 893] = resIm446_s;
        out1024[idx + 1157] = -resIm446_s;
        
        double oRe67 = out1024[idx + 1158];
        double oIm67 = out1024[idx + 1159];
        double eRe67 = out1024[idx + 134];
        double eIm67 = out1024[idx + 135];
        double tRe67 = 0x1.d556f52e93eb1p-1;
        double tRe189 = 0x1.993716141bdfep-2;
        double resIm67_s = eIm67 + (oRe67 * tRe189 + oIm67 * tRe67);
        out1024[idx + 135] = resIm67_s;
        out1024[idx + 1915] = -resIm67_s;
        double resRe67_s = eRe67 + (oRe67 * tRe67 - oIm67 * tRe189);
        out1024[idx + 1914] = resRe67_s;
        out1024[idx + 134] = resRe67_s;
        double resRe189_s = eRe67 - (oRe67 * tRe67 - oIm67 * tRe189);
        out1024[idx + 1158] = resRe445_s;
        out1024[idx + 890] = resRe445_s;
        double resIm189_s = -eIm67 + (oRe67 * tRe189 + oIm67 * tRe67);
        out1024[idx + 891] = resIm445_s;
        out1024[idx + 1159] = -resIm445_s;
        
        double oRe68 = out1024[idx + 1160];
        double oIm68 = out1024[idx + 1161];
        double eRe68 = out1024[idx + 136];
        double eIm68 = out1024[idx + 137];
        double tRe68 = 0x1.d4134d14dc93ap-1;
        double tRe188 = 0x1.9ef7943a8ed89p-2;
        double resIm68_s = eIm68 + (oRe68 * tRe188 + oIm68 * tRe68);
        out1024[idx + 137] = resIm68_s;
        out1024[idx + 1913] = -resIm68_s;
        double resRe68_s = eRe68 + (oRe68 * tRe68 - oIm68 * tRe188);
        out1024[idx + 1912] = resRe68_s;
        out1024[idx + 136] = resRe68_s;
        double resRe188_s = eRe68 - (oRe68 * tRe68 - oIm68 * tRe188);
        out1024[idx + 1160] = resRe444_s;
        out1024[idx + 888] = resRe444_s;
        double resIm188_s = -eIm68 + (oRe68 * tRe188 + oIm68 * tRe68);
        out1024[idx + 889] = resIm444_s;
        out1024[idx + 1161] = -resIm444_s;
        
        double oRe69 = out1024[idx + 1162];
        double oIm69 = out1024[idx + 1163];
        double eRe69 = out1024[idx + 138];
        double eIm69 = out1024[idx + 139];
        double tRe69 = 0x1.d2cb220e0ef9fp-1;
        double tRe187 = 0x1.a4b4127dea1e4p-2;
        double resIm69_s = eIm69 + (oRe69 * tRe187 + oIm69 * tRe69);
        out1024[idx + 139] = resIm69_s;
        out1024[idx + 1911] = -resIm69_s;
        double resRe69_s = eRe69 + (oRe69 * tRe69 - oIm69 * tRe187);
        out1024[idx + 1910] = resRe69_s;
        out1024[idx + 138] = resRe69_s;
        double resRe187_s = eRe69 - (oRe69 * tRe69 - oIm69 * tRe187);
        out1024[idx + 1162] = resRe443_s;
        out1024[idx + 886] = resRe443_s;
        double resIm187_s = -eIm69 + (oRe69 * tRe187 + oIm69 * tRe69);
        out1024[idx + 887] = resIm443_s;
        out1024[idx + 1163] = -resIm443_s;
        
        double oRe70 = out1024[idx + 1164];
        double oIm70 = out1024[idx + 1165];
        double eRe70 = out1024[idx + 140];
        double eIm70 = out1024[idx + 141];
        double tRe70 = 0x1.d17e7743e35dcp-1;
        double tRe186 = 0x1.aa6c82b6d3fccp-2;
        double resIm70_s = eIm70 + (oRe70 * tRe186 + oIm70 * tRe70);
        out1024[idx + 141] = resIm70_s;
        out1024[idx + 1909] = -resIm70_s;
        double resRe70_s = eRe70 + (oRe70 * tRe70 - oIm70 * tRe186);
        out1024[idx + 1908] = resRe70_s;
        out1024[idx + 140] = resRe70_s;
        double resRe186_s = eRe70 - (oRe70 * tRe70 - oIm70 * tRe186);
        out1024[idx + 1164] = resRe442_s;
        out1024[idx + 884] = resRe442_s;
        double resIm186_s = -eIm70 + (oRe70 * tRe186 + oIm70 * tRe70);
        out1024[idx + 885] = resIm442_s;
        out1024[idx + 1165] = -resIm442_s;
        
        double oRe71 = out1024[idx + 1166];
        double oIm71 = out1024[idx + 1167];
        double eRe71 = out1024[idx + 142];
        double eIm71 = out1024[idx + 143];
        double tRe71 = 0x1.d02d4feb2bd92p-1;
        double tRe185 = 0x1.b020d6c7f400bp-2;
        double resIm71_s = eIm71 + (oRe71 * tRe185 + oIm71 * tRe71);
        out1024[idx + 143] = resIm71_s;
        out1024[idx + 1907] = -resIm71_s;
        double resRe71_s = eRe71 + (oRe71 * tRe71 - oIm71 * tRe185);
        out1024[idx + 1906] = resRe71_s;
        out1024[idx + 142] = resRe71_s;
        double resRe185_s = eRe71 - (oRe71 * tRe71 - oIm71 * tRe185);
        out1024[idx + 1166] = resRe441_s;
        out1024[idx + 882] = resRe441_s;
        double resIm185_s = -eIm71 + (oRe71 * tRe185 + oIm71 * tRe71);
        out1024[idx + 883] = resIm441_s;
        out1024[idx + 1167] = -resIm441_s;
        
        double oRe72 = out1024[idx + 1168];
        double oIm72 = out1024[idx + 1169];
        double eRe72 = out1024[idx + 144];
        double eIm72 = out1024[idx + 145];
        double tRe72 = 0x1.ced7af43cc773p-1;
        double tRe184 = 0x1.b5d1009e15cc2p-2;
        double resIm72_s = eIm72 + (oRe72 * tRe184 + oIm72 * tRe72);
        out1024[idx + 145] = resIm72_s;
        out1024[idx + 1905] = -resIm72_s;
        double resRe72_s = eRe72 + (oRe72 * tRe72 - oIm72 * tRe184);
        out1024[idx + 1904] = resRe72_s;
        out1024[idx + 144] = resRe72_s;
        double resRe184_s = eRe72 - (oRe72 * tRe72 - oIm72 * tRe184);
        out1024[idx + 1168] = resRe440_s;
        out1024[idx + 880] = resRe440_s;
        double resIm184_s = -eIm72 + (oRe72 * tRe184 + oIm72 * tRe72);
        out1024[idx + 881] = resIm440_s;
        out1024[idx + 1169] = -resIm440_s;
        
        double oRe73 = out1024[idx + 1170];
        double oIm73 = out1024[idx + 1171];
        double eRe73 = out1024[idx + 146];
        double eIm73 = out1024[idx + 147];
        double tRe73 = 0x1.cd7d9898b32f6p-1;
        double tRe183 = 0x1.bb7cf2304bd02p-2;
        double resIm73_s = eIm73 + (oRe73 * tRe183 + oIm73 * tRe73);
        out1024[idx + 147] = resIm73_s;
        out1024[idx + 1903] = -resIm73_s;
        double resRe73_s = eRe73 + (oRe73 * tRe73 - oIm73 * tRe183);
        out1024[idx + 1902] = resRe73_s;
        out1024[idx + 146] = resRe73_s;
        double resRe183_s = eRe73 - (oRe73 * tRe73 - oIm73 * tRe183);
        out1024[idx + 1170] = resRe439_s;
        out1024[idx + 878] = resRe439_s;
        double resIm183_s = -eIm73 + (oRe73 * tRe183 + oIm73 * tRe73);
        out1024[idx + 879] = resIm439_s;
        out1024[idx + 1171] = -resIm439_s;
        
        double oRe74 = out1024[idx + 1172];
        double oIm74 = out1024[idx + 1173];
        double eRe74 = out1024[idx + 148];
        double eIm74 = out1024[idx + 149];
        double tRe74 = 0x1.cc1f0f3fcfc5cp-1;
        double tRe182 = 0x1.c1249d8011ee8p-2;
        double resIm74_s = eIm74 + (oRe74 * tRe182 + oIm74 * tRe74);
        out1024[idx + 149] = resIm74_s;
        out1024[idx + 1901] = -resIm74_s;
        double resRe74_s = eRe74 + (oRe74 * tRe74 - oIm74 * tRe182);
        out1024[idx + 1900] = resRe74_s;
        out1024[idx + 148] = resRe74_s;
        double resRe182_s = eRe74 - (oRe74 * tRe74 - oIm74 * tRe182);
        out1024[idx + 1172] = resRe438_s;
        out1024[idx + 876] = resRe438_s;
        double resIm182_s = -eIm74 + (oRe74 * tRe182 + oIm74 * tRe74);
        out1024[idx + 877] = resIm438_s;
        out1024[idx + 1173] = -resIm438_s;
        
        double oRe75 = out1024[idx + 1174];
        double oIm75 = out1024[idx + 1175];
        double eRe75 = out1024[idx + 150];
        double eIm75 = out1024[idx + 151];
        double tRe75 = 0x1.cabc169a0b901p-1;
        double tRe181 = 0x1.c6c7f4997000bp-2;
        double resIm75_s = eIm75 + (oRe75 * tRe181 + oIm75 * tRe75);
        out1024[idx + 151] = resIm75_s;
        out1024[idx + 1899] = -resIm75_s;
        double resRe75_s = eRe75 + (oRe75 * tRe75 - oIm75 * tRe181);
        out1024[idx + 1898] = resRe75_s;
        out1024[idx + 150] = resRe75_s;
        double resRe181_s = eRe75 - (oRe75 * tRe75 - oIm75 * tRe181);
        out1024[idx + 1174] = resRe437_s;
        out1024[idx + 874] = resRe437_s;
        double resIm181_s = -eIm75 + (oRe75 * tRe181 + oIm75 * tRe75);
        out1024[idx + 875] = resIm437_s;
        out1024[idx + 1175] = -resIm437_s;
        
        double oRe76 = out1024[idx + 1176];
        double oIm76 = out1024[idx + 1177];
        double eRe76 = out1024[idx + 152];
        double eIm76 = out1024[idx + 153];
        double tRe76 = 0x1.c954b213411f5p-1;
        double tRe180 = 0x1.cc66e9931c45ep-2;
        double resIm76_s = eIm76 + (oRe76 * tRe180 + oIm76 * tRe76);
        out1024[idx + 153] = resIm76_s;
        out1024[idx + 1897] = -resIm76_s;
        double resRe76_s = eRe76 + (oRe76 * tRe76 - oIm76 * tRe180);
        out1024[idx + 1896] = resRe76_s;
        out1024[idx + 152] = resRe76_s;
        double resRe180_s = eRe76 - (oRe76 * tRe76 - oIm76 * tRe180);
        out1024[idx + 1176] = resRe436_s;
        out1024[idx + 872] = resRe436_s;
        double resIm180_s = -eIm76 + (oRe76 * tRe180 + oIm76 * tRe76);
        out1024[idx + 873] = resIm436_s;
        out1024[idx + 1177] = -resIm436_s;
        
        double oRe77 = out1024[idx + 1178];
        double oIm77 = out1024[idx + 1179];
        double eRe77 = out1024[idx + 154];
        double eIm77 = out1024[idx + 155];
        double tRe77 = 0x1.c7e8e52233cf3p-1;
        double tRe179 = 0x1.d2016e8e9db5bp-2;
        double resIm77_s = eIm77 + (oRe77 * tRe179 + oIm77 * tRe77);
        out1024[idx + 155] = resIm77_s;
        out1024[idx + 1895] = -resIm77_s;
        double resRe77_s = eRe77 + (oRe77 * tRe77 - oIm77 * tRe179);
        out1024[idx + 1894] = resRe77_s;
        out1024[idx + 154] = resRe77_s;
        double resRe179_s = eRe77 - (oRe77 * tRe77 - oIm77 * tRe179);
        out1024[idx + 1178] = resRe435_s;
        out1024[idx + 870] = resRe435_s;
        double resIm179_s = -eIm77 + (oRe77 * tRe179 + oIm77 * tRe77);
        out1024[idx + 871] = resIm435_s;
        out1024[idx + 1179] = -resIm435_s;
        
        double oRe78 = out1024[idx + 1180];
        double oIm78 = out1024[idx + 1181];
        double eRe78 = out1024[idx + 156];
        double eIm78 = out1024[idx + 157];
        double tRe78 = 0x1.c678b3488739bp-1;
        double tRe178 = 0x1.d79775b86e389p-2;
        double resIm78_s = eIm78 + (oRe78 * tRe178 + oIm78 * tRe78);
        out1024[idx + 157] = resIm78_s;
        out1024[idx + 1893] = -resIm78_s;
        double resRe78_s = eRe78 + (oRe78 * tRe78 - oIm78 * tRe178);
        out1024[idx + 1892] = resRe78_s;
        out1024[idx + 156] = resRe78_s;
        double resRe178_s = eRe78 - (oRe78 * tRe78 - oIm78 * tRe178);
        out1024[idx + 1180] = resRe434_s;
        out1024[idx + 868] = resRe434_s;
        double resIm178_s = -eIm78 + (oRe78 * tRe178 + oIm78 * tRe78);
        out1024[idx + 869] = resIm434_s;
        out1024[idx + 1181] = -resIm434_s;
        
        double oRe79 = out1024[idx + 1182];
        double oIm79 = out1024[idx + 1183];
        double eRe79 = out1024[idx + 158];
        double eIm79 = out1024[idx + 159];
        double tRe79 = 0x1.c5042012b6907p-1;
        double tRe177 = 0x1.dd28f1481cc57p-2;
        double resIm79_s = eIm79 + (oRe79 * tRe177 + oIm79 * tRe79);
        out1024[idx + 159] = resIm79_s;
        out1024[idx + 1891] = -resIm79_s;
        double resRe79_s = eRe79 + (oRe79 * tRe79 - oIm79 * tRe177);
        out1024[idx + 1890] = resRe79_s;
        out1024[idx + 158] = resRe79_s;
        double resRe177_s = eRe79 - (oRe79 * tRe79 - oIm79 * tRe177);
        out1024[idx + 1182] = resRe433_s;
        out1024[idx + 866] = resRe433_s;
        double resIm177_s = -eIm79 + (oRe79 * tRe177 + oIm79 * tRe79);
        out1024[idx + 867] = resIm433_s;
        out1024[idx + 1183] = -resIm433_s;
        
        double oRe80 = out1024[idx + 1184];
        double oIm80 = out1024[idx + 1185];
        double eRe80 = out1024[idx + 160];
        double eIm80 = out1024[idx + 161];
        double tRe80 = 0x1.c38b2f180bdb1p-1;
        double tRe176 = 0x1.e2b5d3806f63ep-2;
        double resIm80_s = eIm80 + (oRe80 * tRe176 + oIm80 * tRe80);
        out1024[idx + 161] = resIm80_s;
        out1024[idx + 1889] = -resIm80_s;
        double resRe80_s = eRe80 + (oRe80 * tRe80 - oIm80 * tRe176);
        out1024[idx + 1888] = resRe80_s;
        out1024[idx + 160] = resRe80_s;
        double resRe176_s = eRe80 - (oRe80 * tRe80 - oIm80 * tRe176);
        out1024[idx + 1184] = resRe432_s;
        out1024[idx + 864] = resRe432_s;
        double resIm176_s = -eIm80 + (oRe80 * tRe176 + oIm80 * tRe80);
        out1024[idx + 865] = resIm432_s;
        out1024[idx + 1185] = -resIm432_s;
        
        double oRe81 = out1024[idx + 1186];
        double oIm81 = out1024[idx + 1187];
        double eRe81 = out1024[idx + 162];
        double eIm81 = out1024[idx + 163];
        double tRe81 = 0x1.c20de3fa971bp-1;
        double tRe175 = 0x1.e83e0eaf85116p-2;
        double resIm81_s = eIm81 + (oRe81 * tRe175 + oIm81 * tRe81);
        out1024[idx + 163] = resIm81_s;
        out1024[idx + 1887] = -resIm81_s;
        double resRe81_s = eRe81 + (oRe81 * tRe81 - oIm81 * tRe175);
        out1024[idx + 1886] = resRe81_s;
        out1024[idx + 162] = resRe81_s;
        double resRe175_s = eRe81 - (oRe81 * tRe81 - oIm81 * tRe175);
        out1024[idx + 1186] = resRe431_s;
        out1024[idx + 862] = resRe431_s;
        double resIm175_s = -eIm81 + (oRe81 * tRe175 + oIm81 * tRe81);
        out1024[idx + 863] = resIm431_s;
        out1024[idx + 1187] = -resIm431_s;
        
        double oRe82 = out1024[idx + 1188];
        double oIm82 = out1024[idx + 1189];
        double eRe82 = out1024[idx + 164];
        double eIm82 = out1024[idx + 165];
        double tRe82 = 0x1.c08c426725549p-1;
        double tRe174 = 0x1.edc1952ef78d8p-2;
        double resIm82_s = eIm82 + (oRe82 * tRe174 + oIm82 * tRe82);
        out1024[idx + 165] = resIm82_s;
        out1024[idx + 1885] = -resIm82_s;
        double resRe82_s = eRe82 + (oRe82 * tRe82 - oIm82 * tRe174);
        out1024[idx + 1884] = resRe82_s;
        out1024[idx + 164] = resRe82_s;
        double resRe174_s = eRe82 - (oRe82 * tRe82 - oIm82 * tRe174);
        out1024[idx + 1188] = resRe430_s;
        out1024[idx + 860] = resRe430_s;
        double resIm174_s = -eIm82 + (oRe82 * tRe174 + oIm82 * tRe82);
        out1024[idx + 861] = resIm430_s;
        out1024[idx + 1189] = -resIm430_s;
        
        double oRe83 = out1024[idx + 1190];
        double oIm83 = out1024[idx + 1191];
        double eRe83 = out1024[idx + 166];
        double eIm83 = out1024[idx + 167];
        double tRe83 = 0x1.bf064e15377ddp-1;
        double tRe173 = 0x1.f3405963fd06ap-2;
        double resIm83_s = eIm83 + (oRe83 * tRe173 + oIm83 * tRe83);
        out1024[idx + 167] = resIm83_s;
        out1024[idx + 1883] = -resIm83_s;
        double resRe83_s = eRe83 + (oRe83 * tRe83 - oIm83 * tRe173);
        out1024[idx + 1882] = resRe83_s;
        out1024[idx + 166] = resRe83_s;
        double resRe173_s = eRe83 - (oRe83 * tRe83 - oIm83 * tRe173);
        out1024[idx + 1190] = resRe429_s;
        out1024[idx + 858] = resRe429_s;
        double resIm173_s = -eIm83 + (oRe83 * tRe173 + oIm83 * tRe83);
        out1024[idx + 859] = resIm429_s;
        out1024[idx + 1191] = -resIm429_s;
        
        double oRe84 = out1024[idx + 1192];
        double oIm84 = out1024[idx + 1193];
        double eRe84 = out1024[idx + 168];
        double eIm84 = out1024[idx + 169];
        double tRe84 = 0x1.bd7c0ac6f952ap-1;
        double tRe172 = 0x1.f8ba4dbf89abcp-2;
        double resIm84_s = eIm84 + (oRe84 * tRe172 + oIm84 * tRe84);
        out1024[idx + 169] = resIm84_s;
        out1024[idx + 1881] = -resIm84_s;
        double resRe84_s = eRe84 + (oRe84 * tRe84 - oIm84 * tRe172);
        out1024[idx + 1880] = resRe84_s;
        out1024[idx + 168] = resRe84_s;
        double resRe172_s = eRe84 - (oRe84 * tRe84 - oIm84 * tRe172);
        out1024[idx + 1192] = resRe428_s;
        out1024[idx + 856] = resRe428_s;
        double resIm172_s = -eIm84 + (oRe84 * tRe172 + oIm84 * tRe84);
        out1024[idx + 857] = resIm428_s;
        out1024[idx + 1193] = -resIm428_s;
        
        double oRe85 = out1024[idx + 1194];
        double oIm85 = out1024[idx + 1195];
        double eRe85 = out1024[idx + 170];
        double eIm85 = out1024[idx + 171];
        double tRe85 = 0x1.bbed7c49380eap-1;
        double tRe171 = 0x1.fe2f64be71211p-2;
        double resIm85_s = eIm85 + (oRe85 * tRe171 + oIm85 * tRe85);
        out1024[idx + 171] = resIm85_s;
        out1024[idx + 1879] = -resIm85_s;
        double resRe85_s = eRe85 + (oRe85 * tRe85 - oIm85 * tRe171);
        out1024[idx + 1878] = resRe85_s;
        out1024[idx + 170] = resRe85_s;
        double resRe171_s = eRe85 - (oRe85 * tRe85 - oIm85 * tRe171);
        out1024[idx + 1194] = resRe427_s;
        out1024[idx + 854] = resRe427_s;
        double resIm171_s = -eIm85 + (oRe85 * tRe171 + oIm85 * tRe85);
        out1024[idx + 855] = resIm427_s;
        out1024[idx + 1195] = -resIm427_s;
        
        double oRe86 = out1024[idx + 1196];
        double oIm86 = out1024[idx + 1197];
        double eRe86 = out1024[idx + 172];
        double eIm86 = out1024[idx + 173];
        double tRe86 = 0x1.ba5aa673590d2p-1;
        double tRe170 = 0x1.01cfc874c3eb7p-1;
        double resIm86_s = eIm86 + (oRe86 * tRe170 + oIm86 * tRe86);
        out1024[idx + 173] = resIm86_s;
        out1024[idx + 1877] = -resIm86_s;
        double resRe86_s = eRe86 + (oRe86 * tRe86 - oIm86 * tRe170);
        out1024[idx + 1876] = resRe86_s;
        out1024[idx + 172] = resRe86_s;
        double resRe170_s = eRe86 - (oRe86 * tRe86 - oIm86 * tRe170);
        out1024[idx + 1196] = resRe426_s;
        out1024[idx + 852] = resRe426_s;
        double resIm170_s = -eIm86 + (oRe86 * tRe170 + oIm86 * tRe86);
        out1024[idx + 853] = resIm426_s;
        out1024[idx + 1197] = -resIm426_s;
        
        double oRe87 = out1024[idx + 1198];
        double oIm87 = out1024[idx + 1199];
        double eRe87 = out1024[idx + 174];
        double eIm87 = out1024[idx + 175];
        double tRe87 = 0x1.b8c38d27504e9p-1;
        double tRe169 = 0x1.0485626ae221bp-1;
        double resIm87_s = eIm87 + (oRe87 * tRe169 + oIm87 * tRe87);
        out1024[idx + 175] = resIm87_s;
        out1024[idx + 1875] = -resIm87_s;
        double resRe87_s = eRe87 + (oRe87 * tRe87 - oIm87 * tRe169);
        out1024[idx + 1874] = resRe87_s;
        out1024[idx + 174] = resRe87_s;
        double resRe169_s = eRe87 - (oRe87 * tRe87 - oIm87 * tRe169);
        out1024[idx + 1198] = resRe425_s;
        out1024[idx + 850] = resRe425_s;
        double resIm169_s = -eIm87 + (oRe87 * tRe169 + oIm87 * tRe87);
        out1024[idx + 851] = resIm425_s;
        out1024[idx + 1199] = -resIm425_s;
        
        double oRe88 = out1024[idx + 1200];
        double oIm88 = out1024[idx + 1201];
        double eRe88 = out1024[idx + 176];
        double eIm88 = out1024[idx + 177];
        double tRe88 = 0x1.b728345196e3ep-1;
        double tRe168 = 0x1.073879922ffeep-1;
        double resIm88_s = eIm88 + (oRe88 * tRe168 + oIm88 * tRe88);
        out1024[idx + 177] = resIm88_s;
        out1024[idx + 1873] = -resIm88_s;
        double resRe88_s = eRe88 + (oRe88 * tRe88 - oIm88 * tRe168);
        out1024[idx + 1872] = resRe88_s;
        out1024[idx + 176] = resRe88_s;
        double resRe168_s = eRe88 - (oRe88 * tRe88 - oIm88 * tRe168);
        out1024[idx + 1200] = resRe424_s;
        out1024[idx + 848] = resRe424_s;
        double resIm168_s = -eIm88 + (oRe88 * tRe168 + oIm88 * tRe88);
        out1024[idx + 849] = resIm424_s;
        out1024[idx + 1201] = -resIm424_s;
        
        double oRe89 = out1024[idx + 1202];
        double oIm89 = out1024[idx + 1203];
        double eRe89 = out1024[idx + 178];
        double eIm89 = out1024[idx + 179];
        double tRe89 = 0x1.b5889fe921405p-1;
        double tRe167 = 0x1.09e907417c5e1p-1;
        double resIm89_s = eIm89 + (oRe89 * tRe167 + oIm89 * tRe89);
        out1024[idx + 179] = resIm89_s;
        out1024[idx + 1871] = -resIm89_s;
        double resRe89_s = eRe89 + (oRe89 * tRe89 - oIm89 * tRe167);
        out1024[idx + 1870] = resRe89_s;
        out1024[idx + 178] = resRe89_s;
        double resRe167_s = eRe89 - (oRe89 * tRe89 - oIm89 * tRe167);
        out1024[idx + 1202] = resRe423_s;
        out1024[idx + 846] = resRe423_s;
        double resIm167_s = -eIm89 + (oRe89 * tRe167 + oIm89 * tRe89);
        out1024[idx + 847] = resIm423_s;
        out1024[idx + 1203] = -resIm423_s;
        
        double oRe90 = out1024[idx + 1204];
        double oIm90 = out1024[idx + 1205];
        double eRe90 = out1024[idx + 180];
        double eIm90 = out1024[idx + 181];
        double tRe90 = 0x1.b3e4d3ef55712p-1;
        double tRe166 = 0x1.0c9704d5d898fp-1;
        double resIm90_s = eIm90 + (oRe90 * tRe166 + oIm90 * tRe90);
        out1024[idx + 181] = resIm90_s;
        out1024[idx + 1869] = -resIm90_s;
        double resRe90_s = eRe90 + (oRe90 * tRe90 - oIm90 * tRe166);
        out1024[idx + 1868] = resRe90_s;
        out1024[idx + 180] = resRe90_s;
        double resRe166_s = eRe90 - (oRe90 * tRe90 - oIm90 * tRe166);
        out1024[idx + 1204] = resRe422_s;
        out1024[idx + 844] = resRe422_s;
        double resIm166_s = -eIm90 + (oRe90 * tRe166 + oIm90 * tRe90);
        out1024[idx + 845] = resIm422_s;
        out1024[idx + 1205] = -resIm422_s;
        
        double oRe91 = out1024[idx + 1206];
        double oIm91 = out1024[idx + 1207];
        double eRe91 = out1024[idx + 182];
        double eIm91 = out1024[idx + 183];
        double tRe91 = 0x1.b23cd470013b4p-1;
        double tRe165 = 0x1.0f426bb2a8e7fp-1;
        double resIm91_s = eIm91 + (oRe91 * tRe165 + oIm91 * tRe91);
        out1024[idx + 183] = resIm91_s;
        out1024[idx + 1867] = -resIm91_s;
        double resRe91_s = eRe91 + (oRe91 * tRe91 - oIm91 * tRe165);
        out1024[idx + 1866] = resRe91_s;
        out1024[idx + 182] = resRe91_s;
        double resRe165_s = eRe91 - (oRe91 * tRe91 - oIm91 * tRe165);
        out1024[idx + 1206] = resRe421_s;
        out1024[idx + 842] = resRe421_s;
        double resIm165_s = -eIm91 + (oRe91 * tRe165 + oIm91 * tRe91);
        out1024[idx + 843] = resIm421_s;
        out1024[idx + 1207] = -resIm421_s;
        
        double oRe92 = out1024[idx + 1208];
        double oIm92 = out1024[idx + 1209];
        double eRe92 = out1024[idx + 184];
        double eIm92 = out1024[idx + 185];
        double tRe92 = 0x1.b090a581502p-1;
        double tRe164 = 0x1.11eb3541b4b24p-1;
        double resIm92_s = eIm92 + (oRe92 * tRe164 + oIm92 * tRe92);
        out1024[idx + 185] = resIm92_s;
        out1024[idx + 1865] = -resIm92_s;
        double resRe92_s = eRe92 + (oRe92 * tRe92 - oIm92 * tRe164);
        out1024[idx + 1864] = resRe92_s;
        out1024[idx + 184] = resRe92_s;
        double resRe164_s = eRe92 - (oRe92 * tRe92 - oIm92 * tRe164);
        out1024[idx + 1208] = resRe420_s;
        out1024[idx + 840] = resRe420_s;
        double resIm164_s = -eIm92 + (oRe92 * tRe164 + oIm92 * tRe92);
        out1024[idx + 841] = resIm420_s;
        out1024[idx + 1209] = -resIm420_s;
        
        double oRe93 = out1024[idx + 1210];
        double oIm93 = out1024[idx + 1211];
        double eRe93 = out1024[idx + 186];
        double eIm93 = out1024[idx + 187];
        double tRe93 = 0x1.aee04b43c1474p-1;
        double tRe163 = 0x1.14915af336cecp-1;
        double resIm93_s = eIm93 + (oRe93 * tRe163 + oIm93 * tRe93);
        out1024[idx + 187] = resIm93_s;
        out1024[idx + 1863] = -resIm93_s;
        double resRe93_s = eRe93 + (oRe93 * tRe93 - oIm93 * tRe163);
        out1024[idx + 1862] = resRe93_s;
        out1024[idx + 186] = resRe93_s;
        double resRe163_s = eRe93 - (oRe93 * tRe93 - oIm93 * tRe163);
        out1024[idx + 1210] = resRe419_s;
        out1024[idx + 838] = resRe419_s;
        double resIm163_s = -eIm93 + (oRe93 * tRe163 + oIm93 * tRe93);
        out1024[idx + 839] = resIm419_s;
        out1024[idx + 1211] = -resIm419_s;
        
        double oRe94 = out1024[idx + 1212];
        double oIm94 = out1024[idx + 1213];
        double eRe94 = out1024[idx + 188];
        double eIm94 = out1024[idx + 189];
        double tRe94 = 0x1.ad2bc9e21d51p-1;
        double tRe162 = 0x1.1734d63dedb4ap-1;
        double resIm94_s = eIm94 + (oRe94 * tRe162 + oIm94 * tRe94);
        out1024[idx + 189] = resIm94_s;
        out1024[idx + 1861] = -resIm94_s;
        double resRe94_s = eRe94 + (oRe94 * tRe94 - oIm94 * tRe162);
        out1024[idx + 1860] = resRe94_s;
        out1024[idx + 188] = resRe94_s;
        double resRe162_s = eRe94 - (oRe94 * tRe94 - oIm94 * tRe162);
        out1024[idx + 1212] = resRe418_s;
        out1024[idx + 836] = resRe418_s;
        double resIm162_s = -eIm94 + (oRe94 * tRe162 + oIm94 * tRe94);
        out1024[idx + 837] = resIm418_s;
        out1024[idx + 1213] = -resIm418_s;
        
        double oRe95 = out1024[idx + 1214];
        double oIm95 = out1024[idx + 1215];
        double eRe95 = out1024[idx + 190];
        double eIm95 = out1024[idx + 191];
        double tRe95 = 0x1.ab7325916c0d4p-1;
        double tRe161 = 0x1.19d5a09f2b9b9p-1;
        double resIm95_s = eIm95 + (oRe95 * tRe161 + oIm95 * tRe95);
        out1024[idx + 191] = resIm95_s;
        out1024[idx + 1859] = -resIm95_s;
        double resRe95_s = eRe95 + (oRe95 * tRe95 - oIm95 * tRe161);
        out1024[idx + 1858] = resRe95_s;
        out1024[idx + 190] = resRe95_s;
        double resRe161_s = eRe95 - (oRe95 * tRe95 - oIm95 * tRe161);
        out1024[idx + 1214] = resRe417_s;
        out1024[idx + 834] = resRe417_s;
        double resIm161_s = -eIm95 + (oRe95 * tRe161 + oIm95 * tRe95);
        out1024[idx + 835] = resIm417_s;
        out1024[idx + 1215] = -resIm417_s;
        
        double oRe96 = out1024[idx + 1216];
        double oIm96 = out1024[idx + 1217];
        double eRe96 = out1024[idx + 192];
        double eIm96 = out1024[idx + 193];
        double tRe96 = 0x1.a9b66290ea1a3p-1;
        double tRe160 = 0x1.1c73b39ae68c9p-1;
        double resIm96_s = eIm96 + (oRe96 * tRe160 + oIm96 * tRe96);
        out1024[idx + 193] = resIm96_s;
        out1024[idx + 1857] = -resIm96_s;
        double resRe96_s = eRe96 + (oRe96 * tRe96 - oIm96 * tRe160);
        out1024[idx + 1856] = resRe96_s;
        out1024[idx + 192] = resRe96_s;
        double resRe160_s = eRe96 - (oRe96 * tRe96 - oIm96 * tRe160);
        out1024[idx + 1216] = resRe416_s;
        out1024[idx + 832] = resRe416_s;
        double resIm160_s = -eIm96 + (oRe96 * tRe160 + oIm96 * tRe96);
        out1024[idx + 833] = resIm416_s;
        out1024[idx + 1217] = -resIm416_s;
        
        double oRe97 = out1024[idx + 1218];
        double oIm97 = out1024[idx + 1219];
        double eRe97 = out1024[idx + 194];
        double eIm97 = out1024[idx + 195];
        double tRe97 = 0x1.a7f58529fe69dp-1;
        double tRe159 = 0x1.1f0f08bbc861bp-1;
        double resIm97_s = eIm97 + (oRe97 * tRe159 + oIm97 * tRe97);
        out1024[idx + 195] = resIm97_s;
        out1024[idx + 1855] = -resIm97_s;
        double resRe97_s = eRe97 + (oRe97 * tRe97 - oIm97 * tRe159);
        out1024[idx + 1854] = resRe97_s;
        out1024[idx + 194] = resRe97_s;
        double resRe159_s = eRe97 - (oRe97 * tRe97 - oIm97 * tRe159);
        out1024[idx + 1218] = resRe415_s;
        out1024[idx + 830] = resRe415_s;
        double resIm159_s = -eIm97 + (oRe97 * tRe159 + oIm97 * tRe97);
        out1024[idx + 831] = resIm415_s;
        out1024[idx + 1219] = -resIm415_s;
        
        double oRe98 = out1024[idx + 1220];
        double oIm98 = out1024[idx + 1221];
        double eRe98 = out1024[idx + 196];
        double eIm98 = out1024[idx + 197];
        double tRe98 = 0x1.a63091b02fae2p-1;
        double tRe158 = 0x1.21a799933eb59p-1;
        double resIm98_s = eIm98 + (oRe98 * tRe158 + oIm98 * tRe98);
        out1024[idx + 197] = resIm98_s;
        out1024[idx + 1853] = -resIm98_s;
        double resRe98_s = eRe98 + (oRe98 * tRe98 - oIm98 * tRe158);
        out1024[idx + 1852] = resRe98_s;
        out1024[idx + 196] = resRe98_s;
        double resRe158_s = eRe98 - (oRe98 * tRe98 - oIm98 * tRe158);
        out1024[idx + 1220] = resRe414_s;
        out1024[idx + 828] = resRe414_s;
        double resIm158_s = -eIm98 + (oRe98 * tRe158 + oIm98 * tRe98);
        out1024[idx + 829] = resIm414_s;
        out1024[idx + 1221] = -resIm414_s;
        
        double oRe99 = out1024[idx + 1222];
        double oIm99 = out1024[idx + 1223];
        double eRe99 = out1024[idx + 198];
        double eIm99 = out1024[idx + 199];
        double tRe99 = 0x1.a4678c8119ac8p-1;
        double tRe157 = 0x1.243d5fb98ac2p-1;
        double resIm99_s = eIm99 + (oRe99 * tRe157 + oIm99 * tRe99);
        out1024[idx + 199] = resIm99_s;
        out1024[idx + 1851] = -resIm99_s;
        double resRe99_s = eRe99 + (oRe99 * tRe99 - oIm99 * tRe157);
        out1024[idx + 1850] = resRe99_s;
        out1024[idx + 198] = resRe99_s;
        double resRe157_s = eRe99 - (oRe99 * tRe99 - oIm99 * tRe157);
        out1024[idx + 1222] = resRe413_s;
        out1024[idx + 826] = resRe413_s;
        double resIm157_s = -eIm99 + (oRe99 * tRe157 + oIm99 * tRe99);
        out1024[idx + 827] = resIm413_s;
        out1024[idx + 1223] = -resIm413_s;
        
        double oRe100 = out1024[idx + 1224];
        double oIm100 = out1024[idx + 1225];
        double eRe100 = out1024[idx + 200];
        double eIm100 = out1024[idx + 201];
        double tRe100 = 0x1.a29a7a0462782p-1;
        double tRe156 = 0x1.26d054cdd12ep-1;
        double resIm100_s = eIm100 + (oRe100 * tRe156 + oIm100 * tRe100);
        out1024[idx + 201] = resIm100_s;
        out1024[idx + 1849] = -resIm100_s;
        double resRe100_s = eRe100 + (oRe100 * tRe100 - oIm100 * tRe156);
        out1024[idx + 1848] = resRe100_s;
        out1024[idx + 200] = resRe100_s;
        double resRe156_s = eRe100 - (oRe100 * tRe100 - oIm100 * tRe156);
        out1024[idx + 1224] = resRe412_s;
        out1024[idx + 824] = resRe412_s;
        double resIm156_s = -eIm100 + (oRe100 * tRe156 + oIm100 * tRe100);
        out1024[idx + 825] = resIm412_s;
        out1024[idx + 1225] = -resIm412_s;
        
        double oRe101 = out1024[idx + 1226];
        double oIm101 = out1024[idx + 1227];
        double eRe101 = out1024[idx + 202];
        double eIm101 = out1024[idx + 203];
        double tRe101 = 0x1.a0c95eabaf937p-1;
        double tRe155 = 0x1.2960727629ca9p-1;
        double resIm101_s = eIm101 + (oRe101 * tRe155 + oIm101 * tRe101);
        out1024[idx + 203] = resIm101_s;
        out1024[idx + 1847] = -resIm101_s;
        double resRe101_s = eRe101 + (oRe101 * tRe101 - oIm101 * tRe155);
        out1024[idx + 1846] = resRe101_s;
        out1024[idx + 202] = resRe101_s;
        double resRe155_s = eRe101 - (oRe101 * tRe101 - oIm101 * tRe155);
        out1024[idx + 1226] = resRe411_s;
        out1024[idx + 822] = resRe411_s;
        double resIm155_s = -eIm101 + (oRe101 * tRe155 + oIm101 * tRe101);
        out1024[idx + 823] = resIm411_s;
        out1024[idx + 1227] = -resIm411_s;
        
        double oRe102 = out1024[idx + 1228];
        double oIm102 = out1024[idx + 1229];
        double eRe102 = out1024[idx + 204];
        double eIm102 = out1024[idx + 205];
        double tRe102 = 0x1.9ef43ef29af94p-1;
        double tRe154 = 0x1.2bedb25faf3eap-1;
        double resIm102_s = eIm102 + (oRe102 * tRe154 + oIm102 * tRe102);
        out1024[idx + 205] = resIm102_s;
        out1024[idx + 1845] = -resIm102_s;
        double resRe102_s = eRe102 + (oRe102 * tRe102 - oIm102 * tRe154);
        out1024[idx + 1844] = resRe102_s;
        out1024[idx + 204] = resRe102_s;
        double resRe154_s = eRe102 - (oRe102 * tRe102 - oIm102 * tRe154);
        out1024[idx + 1228] = resRe410_s;
        out1024[idx + 820] = resRe410_s;
        double resIm154_s = -eIm102 + (oRe102 * tRe154 + oIm102 * tRe102);
        out1024[idx + 821] = resIm410_s;
        out1024[idx + 1229] = -resIm410_s;
        
        double oRe103 = out1024[idx + 1230];
        double oIm103 = out1024[idx + 1231];
        double eRe103 = out1024[idx + 206];
        double eIm103 = out1024[idx + 207];
        double tRe103 = 0x1.9d1b1f5ea80d6p-1;
        double tRe153 = 0x1.2e780e3e8ea17p-1;
        double resIm103_s = eIm103 + (oRe103 * tRe153 + oIm103 * tRe103);
        out1024[idx + 207] = resIm103_s;
        out1024[idx + 1843] = -resIm103_s;
        double resRe103_s = eRe103 + (oRe103 * tRe103 - oIm103 * tRe153);
        out1024[idx + 1842] = resRe103_s;
        out1024[idx + 206] = resRe103_s;
        double resRe153_s = eRe103 - (oRe103 * tRe103 - oIm103 * tRe153);
        out1024[idx + 1230] = resRe409_s;
        out1024[idx + 818] = resRe409_s;
        double resIm153_s = -eIm103 + (oRe103 * tRe153 + oIm103 * tRe103);
        out1024[idx + 819] = resIm409_s;
        out1024[idx + 1231] = -resIm409_s;
        
        double oRe104 = out1024[idx + 1232];
        double oIm104 = out1024[idx + 1233];
        double eRe104 = out1024[idx + 208];
        double eIm104 = out1024[idx + 209];
        double tRe104 = 0x1.9b3e047f38741p-1;
        double tRe152 = 0x1.30ff7fce17036p-1;
        double resIm104_s = eIm104 + (oRe104 * tRe152 + oIm104 * tRe104);
        out1024[idx + 209] = resIm104_s;
        out1024[idx + 1841] = -resIm104_s;
        double resRe104_s = eRe104 + (oRe104 * tRe104 - oIm104 * tRe152);
        out1024[idx + 1840] = resRe104_s;
        out1024[idx + 208] = resRe104_s;
        double resRe152_s = eRe104 - (oRe104 * tRe104 - oIm104 * tRe152);
        out1024[idx + 1232] = resRe408_s;
        out1024[idx + 816] = resRe408_s;
        double resIm152_s = -eIm104 + (oRe104 * tRe152 + oIm104 * tRe104);
        out1024[idx + 817] = resIm408_s;
        out1024[idx + 1233] = -resIm408_s;
        
        double oRe105 = out1024[idx + 1234];
        double oIm105 = out1024[idx + 1235];
        double eRe105 = out1024[idx + 210];
        double eIm105 = out1024[idx + 211];
        double tRe105 = 0x1.995cf2ed80d22p-1;
        double tRe151 = 0x1.338400d0c8e57p-1;
        double resIm105_s = eIm105 + (oRe105 * tRe151 + oIm105 * tRe105);
        out1024[idx + 211] = resIm105_s;
        out1024[idx + 1839] = -resIm105_s;
        double resRe105_s = eRe105 + (oRe105 * tRe105 - oIm105 * tRe151);
        out1024[idx + 1838] = resRe105_s;
        out1024[idx + 210] = resRe105_s;
        double resRe151_s = eRe105 - (oRe105 * tRe105 - oIm105 * tRe151);
        out1024[idx + 1234] = resRe407_s;
        out1024[idx + 814] = resRe407_s;
        double resIm151_s = -eIm105 + (oRe105 * tRe151 + oIm105 * tRe105);
        out1024[idx + 815] = resIm407_s;
        out1024[idx + 1235] = -resIm407_s;
        
        double oRe106 = out1024[idx + 1236];
        double oIm106 = out1024[idx + 1237];
        double eRe106 = out1024[idx + 212];
        double eIm106 = out1024[idx + 213];
        double tRe106 = 0x1.9777ef4c7d742p-1;
        double tRe150 = 0x1.36058b10659f3p-1;
        double resIm106_s = eIm106 + (oRe106 * tRe150 + oIm106 * tRe106);
        out1024[idx + 213] = resIm106_s;
        out1024[idx + 1837] = -resIm106_s;
        double resRe106_s = eRe106 + (oRe106 * tRe106 - oIm106 * tRe150);
        out1024[idx + 1836] = resRe106_s;
        out1024[idx + 212] = resRe106_s;
        double resRe150_s = eRe106 - (oRe106 * tRe106 - oIm106 * tRe150);
        out1024[idx + 1236] = resRe406_s;
        out1024[idx + 812] = resRe406_s;
        double resIm150_s = -eIm106 + (oRe106 * tRe150 + oIm106 * tRe106);
        out1024[idx + 813] = resIm406_s;
        out1024[idx + 1237] = -resIm406_s;
        
        double oRe107 = out1024[idx + 1238];
        double oIm107 = out1024[idx + 1239];
        double eRe107 = out1024[idx + 214];
        double eIm107 = out1024[idx + 215];
        double tRe107 = 0x1.958efe48e6dd7p-1;
        double tRe149 = 0x1.3884185dfeb22p-1;
        double resIm107_s = eIm107 + (oRe107 * tRe149 + oIm107 * tRe107);
        out1024[idx + 215] = resIm107_s;
        out1024[idx + 1835] = -resIm107_s;
        double resRe107_s = eRe107 + (oRe107 * tRe107 - oIm107 * tRe149);
        out1024[idx + 1834] = resRe107_s;
        out1024[idx + 214] = resRe107_s;
        double resRe149_s = eRe107 - (oRe107 * tRe107 - oIm107 * tRe149);
        out1024[idx + 1238] = resRe405_s;
        out1024[idx + 810] = resRe405_s;
        double resIm149_s = -eIm107 + (oRe107 * tRe149 + oIm107 * tRe107);
        out1024[idx + 811] = resIm405_s;
        out1024[idx + 1239] = -resIm405_s;
        
        double oRe108 = out1024[idx + 1240];
        double oIm108 = out1024[idx + 1241];
        double eRe108 = out1024[idx + 216];
        double eIm108 = out1024[idx + 217];
        double tRe108 = 0x1.93a22499263fcp-1;
        double tRe148 = 0x1.3affa292050bap-1;
        double resIm108_s = eIm108 + (oRe108 * tRe148 + oIm108 * tRe108);
        out1024[idx + 217] = resIm108_s;
        out1024[idx + 1833] = -resIm108_s;
        double resRe108_s = eRe108 + (oRe108 * tRe108 - oIm108 * tRe148);
        out1024[idx + 1832] = resRe108_s;
        out1024[idx + 216] = resRe108_s;
        double resRe148_s = eRe108 - (oRe108 * tRe108 - oIm108 * tRe148);
        out1024[idx + 1240] = resRe404_s;
        out1024[idx + 808] = resRe404_s;
        double resIm148_s = -eIm108 + (oRe108 * tRe148 + oIm108 * tRe108);
        out1024[idx + 809] = resIm404_s;
        out1024[idx + 1241] = -resIm404_s;
        
        double oRe109 = out1024[idx + 1242];
        double oIm109 = out1024[idx + 1243];
        double eRe109 = out1024[idx + 218];
        double eIm109 = out1024[idx + 219];
        double tRe109 = 0x1.91b166fd49da2p-1;
        double tRe147 = 0x1.3d78238c58344p-1;
        double resIm109_s = eIm109 + (oRe109 * tRe147 + oIm109 * tRe109);
        out1024[idx + 219] = resIm109_s;
        out1024[idx + 1831] = -resIm109_s;
        double resRe109_s = eRe109 + (oRe109 * tRe109 - oIm109 * tRe147);
        out1024[idx + 1830] = resRe109_s;
        out1024[idx + 218] = resRe109_s;
        double resRe147_s = eRe109 - (oRe109 * tRe109 - oIm109 * tRe147);
        out1024[idx + 1242] = resRe403_s;
        out1024[idx + 806] = resRe403_s;
        double resIm147_s = -eIm109 + (oRe109 * tRe147 + oIm109 * tRe109);
        out1024[idx + 807] = resIm403_s;
        out1024[idx + 1243] = -resIm403_s;
        
        double oRe110 = out1024[idx + 1244];
        double oIm110 = out1024[idx + 1245];
        double eRe110 = out1024[idx + 220];
        double eIm110 = out1024[idx + 221];
        double tRe110 = 0x1.8fbcca3ef940dp-1;
        double tRe146 = 0x1.3fed9534556d5p-1;
        double resIm110_s = eIm110 + (oRe110 * tRe146 + oIm110 * tRe110);
        out1024[idx + 221] = resIm110_s;
        out1024[idx + 1829] = -resIm110_s;
        double resRe110_s = eRe110 + (oRe110 * tRe110 - oIm110 * tRe146);
        out1024[idx + 1828] = resRe110_s;
        out1024[idx + 220] = resRe110_s;
        double resRe146_s = eRe110 - (oRe110 * tRe110 - oIm110 * tRe146);
        out1024[idx + 1244] = resRe402_s;
        out1024[idx + 804] = resRe402_s;
        double resIm146_s = -eIm110 + (oRe110 * tRe146 + oIm110 * tRe110);
        out1024[idx + 805] = resIm402_s;
        out1024[idx + 1245] = -resIm402_s;
        
        double oRe111 = out1024[idx + 1246];
        double oIm111 = out1024[idx + 1247];
        double eRe111 = out1024[idx + 222];
        double eIm111 = out1024[idx + 223];
        double tRe111 = 0x1.8dc45331698ccp-1;
        double tRe145 = 0x1.425ff178e6bb2p-1;
        double resIm111_s = eIm111 + (oRe111 * tRe145 + oIm111 * tRe111);
        out1024[idx + 223] = resIm111_s;
        out1024[idx + 1827] = -resIm111_s;
        double resRe111_s = eRe111 + (oRe111 * tRe111 - oIm111 * tRe145);
        out1024[idx + 1826] = resRe111_s;
        out1024[idx + 222] = resRe111_s;
        double resRe145_s = eRe111 - (oRe111 * tRe111 - oIm111 * tRe145);
        out1024[idx + 1246] = resRe401_s;
        out1024[idx + 802] = resRe401_s;
        double resIm145_s = -eIm111 + (oRe111 * tRe145 + oIm111 * tRe111);
        out1024[idx + 803] = resIm401_s;
        out1024[idx + 1247] = -resIm401_s;
        
        double oRe112 = out1024[idx + 1248];
        double oIm112 = out1024[idx + 1249];
        double eRe112 = out1024[idx + 224];
        double eIm112 = out1024[idx + 225];
        double tRe112 = 0x1.8bc806b151741p-1;
        double tRe144 = 0x1.44cf325091dd7p-1;
        double resIm112_s = eIm112 + (oRe112 * tRe144 + oIm112 * tRe112);
        out1024[idx + 225] = resIm112_s;
        out1024[idx + 1825] = -resIm112_s;
        double resRe112_s = eRe112 + (oRe112 * tRe112 - oIm112 * tRe144);
        out1024[idx + 1824] = resRe112_s;
        out1024[idx + 224] = resRe112_s;
        double resRe144_s = eRe112 - (oRe112 * tRe112 - oIm112 * tRe144);
        out1024[idx + 1248] = resRe400_s;
        out1024[idx + 800] = resRe400_s;
        double resIm144_s = -eIm112 + (oRe112 * tRe144 + oIm112 * tRe112);
        out1024[idx + 801] = resIm400_s;
        out1024[idx + 1249] = -resIm400_s;
        
        double oRe113 = out1024[idx + 1250];
        double oIm113 = out1024[idx + 1251];
        double eRe113 = out1024[idx + 226];
        double eIm113 = out1024[idx + 227];
        double tRe113 = 0x1.89c7e9a4dd4abp-1;
        double tRe143 = 0x1.473b51b987348p-1;
        double resIm113_s = eIm113 + (oRe113 * tRe143 + oIm113 * tRe113);
        out1024[idx + 227] = resIm113_s;
        out1024[idx + 1823] = -resIm113_s;
        double resRe113_s = eRe113 + (oRe113 * tRe113 - oIm113 * tRe143);
        out1024[idx + 1822] = resRe113_s;
        out1024[idx + 226] = resRe113_s;
        double resRe143_s = eRe113 - (oRe113 * tRe113 - oIm113 * tRe143);
        out1024[idx + 1250] = resRe399_s;
        out1024[idx + 798] = resRe399_s;
        double resIm143_s = -eIm113 + (oRe113 * tRe143 + oIm113 * tRe113);
        out1024[idx + 799] = resIm399_s;
        out1024[idx + 1251] = -resIm399_s;
        
        double oRe114 = out1024[idx + 1252];
        double oIm114 = out1024[idx + 1253];
        double eRe114 = out1024[idx + 228];
        double eIm114 = out1024[idx + 229];
        double tRe114 = 0x1.87c400fba2ebfp-1;
        double tRe142 = 0x1.49a449b9b0939p-1;
        double resIm114_s = eIm114 + (oRe114 * tRe142 + oIm114 * tRe114);
        out1024[idx + 229] = resIm114_s;
        out1024[idx + 1821] = -resIm114_s;
        double resRe114_s = eRe114 + (oRe114 * tRe114 - oIm114 * tRe142);
        out1024[idx + 1820] = resRe114_s;
        out1024[idx + 228] = resRe114_s;
        double resRe142_s = eRe114 - (oRe114 * tRe114 - oIm114 * tRe142);
        out1024[idx + 1252] = resRe398_s;
        out1024[idx + 796] = resRe398_s;
        double resIm142_s = -eIm114 + (oRe114 * tRe142 + oIm114 * tRe114);
        out1024[idx + 797] = resIm398_s;
        out1024[idx + 1253] = -resIm398_s;
        
        double oRe115 = out1024[idx + 1254];
        double oIm115 = out1024[idx + 1255];
        double eRe115 = out1024[idx + 230];
        double eIm115 = out1024[idx + 231];
        double tRe115 = 0x1.85bc51ae958ccp-1;
        double tRe141 = 0x1.4c0a145ec0005p-1;
        double resIm115_s = eIm115 + (oRe115 * tRe141 + oIm115 * tRe115);
        out1024[idx + 231] = resIm115_s;
        out1024[idx + 1819] = -resIm115_s;
        double resRe115_s = eRe115 + (oRe115 * tRe115 - oIm115 * tRe141);
        out1024[idx + 1818] = resRe115_s;
        out1024[idx + 230] = resRe115_s;
        double resRe141_s = eRe115 - (oRe115 * tRe115 - oIm115 * tRe141);
        out1024[idx + 1254] = resRe397_s;
        out1024[idx + 794] = resRe397_s;
        double resIm141_s = -eIm115 + (oRe115 * tRe141 + oIm115 * tRe115);
        out1024[idx + 795] = resIm397_s;
        out1024[idx + 1255] = -resIm397_s;
        
        double oRe116 = out1024[idx + 1256];
        double oIm116 = out1024[idx + 1257];
        double eRe116 = out1024[idx + 232];
        double eIm116 = out1024[idx + 233];
        double tRe116 = 0x1.83b0e0bff976ep-1;
        double tRe140 = 0x1.4e6cabbe3e5eap-1;
        double resIm116_s = eIm116 + (oRe116 * tRe140 + oIm116 * tRe116);
        out1024[idx + 233] = resIm116_s;
        out1024[idx + 1817] = -resIm116_s;
        double resRe116_s = eRe116 + (oRe116 * tRe116 - oIm116 * tRe140);
        out1024[idx + 1816] = resRe116_s;
        out1024[idx + 232] = resRe116_s;
        double resRe140_s = eRe116 - (oRe116 * tRe116 - oIm116 * tRe140);
        out1024[idx + 1256] = resRe396_s;
        out1024[idx + 792] = resRe396_s;
        double resIm140_s = -eIm116 + (oRe116 * tRe140 + oIm116 * tRe116);
        out1024[idx + 793] = resIm396_s;
        out1024[idx + 1257] = -resIm396_s;
        
        double oRe117 = out1024[idx + 1258];
        double oIm117 = out1024[idx + 1259];
        double eRe117 = out1024[idx + 234];
        double eIm117 = out1024[idx + 235];
        double tRe117 = 0x1.81a1b33b57accp-1;
        double tRe139 = 0x1.50cc09f59a09cp-1;
        double resIm117_s = eIm117 + (oRe117 * tRe139 + oIm117 * tRe117);
        out1024[idx + 235] = resIm117_s;
        out1024[idx + 1815] = -resIm117_s;
        double resRe117_s = eRe117 + (oRe117 * tRe117 - oIm117 * tRe139);
        out1024[idx + 1814] = resRe117_s;
        out1024[idx + 234] = resRe117_s;
        double resRe139_s = eRe117 - (oRe117 * tRe117 - oIm117 * tRe139);
        out1024[idx + 1258] = resRe395_s;
        out1024[idx + 790] = resRe395_s;
        double resIm139_s = -eIm117 + (oRe117 * tRe139 + oIm117 * tRe117);
        out1024[idx + 791] = resIm395_s;
        out1024[idx + 1259] = -resIm395_s;
        
        double oRe118 = out1024[idx + 1260];
        double oIm118 = out1024[idx + 1261];
        double eRe118 = out1024[idx + 236];
        double eIm118 = out1024[idx + 237];
        double tRe118 = 0x1.7f8ece3571771p-1;
        double tRe138 = 0x1.5328292a35596p-1;
        double resIm118_s = eIm118 + (oRe118 * tRe138 + oIm118 * tRe118);
        out1024[idx + 237] = resIm118_s;
        out1024[idx + 1813] = -resIm118_s;
        double resRe118_s = eRe118 + (oRe118 * tRe118 - oIm118 * tRe138);
        out1024[idx + 1812] = resRe118_s;
        out1024[idx + 236] = resRe118_s;
        double resRe138_s = eRe118 - (oRe118 * tRe118 - oIm118 * tRe138);
        out1024[idx + 1260] = resRe394_s;
        out1024[idx + 788] = resRe394_s;
        double resIm138_s = -eIm118 + (oRe118 * tRe138 + oIm118 * tRe118);
        out1024[idx + 789] = resIm394_s;
        out1024[idx + 1261] = -resIm394_s;
        
        double oRe119 = out1024[idx + 1262];
        double oIm119 = out1024[idx + 1263];
        double eRe119 = out1024[idx + 238];
        double eIm119 = out1024[idx + 239];
        double tRe119 = 0x1.7d7836cc33db2p-1;
        double tRe137 = 0x1.5581038975138p-1;
        double resIm119_s = eIm119 + (oRe119 * tRe137 + oIm119 * tRe119);
        out1024[idx + 239] = resIm119_s;
        out1024[idx + 1811] = -resIm119_s;
        double resRe119_s = eRe119 + (oRe119 * tRe119 - oIm119 * tRe137);
        out1024[idx + 1810] = resRe119_s;
        out1024[idx + 238] = resRe119_s;
        double resRe137_s = eRe119 - (oRe119 * tRe119 - oIm119 * tRe137);
        out1024[idx + 1262] = resRe393_s;
        out1024[idx + 786] = resRe393_s;
        double resIm137_s = -eIm119 + (oRe119 * tRe137 + oIm119 * tRe119);
        out1024[idx + 787] = resIm393_s;
        out1024[idx + 1263] = -resIm393_s;
        
        double oRe120 = out1024[idx + 1264];
        double oIm120 = out1024[idx + 1265];
        double eRe120 = out1024[idx + 240];
        double eIm120 = out1024[idx + 241];
        double tRe120 = 0x1.7b5df226aafbp-1;
        double tRe136 = 0x1.57d69348cecap-1;
        double resIm120_s = eIm120 + (oRe120 * tRe136 + oIm120 * tRe120);
        out1024[idx + 241] = resIm120_s;
        out1024[idx + 1809] = -resIm120_s;
        double resRe120_s = eRe120 + (oRe120 * tRe120 - oIm120 * tRe136);
        out1024[idx + 1808] = resRe120_s;
        out1024[idx + 240] = resRe120_s;
        double resRe136_s = eRe120 - (oRe120 * tRe120 - oIm120 * tRe136);
        out1024[idx + 1264] = resRe392_s;
        out1024[idx + 784] = resRe392_s;
        double resIm136_s = -eIm120 + (oRe120 * tRe136 + oIm120 * tRe120);
        out1024[idx + 785] = resIm392_s;
        out1024[idx + 1265] = -resIm392_s;
        
        double oRe121 = out1024[idx + 1266];
        double oIm121 = out1024[idx + 1267];
        double eRe121 = out1024[idx + 242];
        double eIm121 = out1024[idx + 243];
        double tRe121 = 0x1.79400574f55e4p-1;
        double tRe135 = 0x1.5a28d2a5d7251p-1;
        double resIm121_s = eIm121 + (oRe121 * tRe135 + oIm121 * tRe121);
        out1024[idx + 243] = resIm121_s;
        out1024[idx + 1807] = -resIm121_s;
        double resRe121_s = eRe121 + (oRe121 * tRe121 - oIm121 * tRe135);
        out1024[idx + 1806] = resRe121_s;
        out1024[idx + 242] = resRe121_s;
        double resRe135_s = eRe121 - (oRe121 * tRe121 - oIm121 * tRe135);
        out1024[idx + 1266] = resRe391_s;
        out1024[idx + 782] = resRe391_s;
        double resIm135_s = -eIm121 + (oRe121 * tRe135 + oIm121 * tRe121);
        out1024[idx + 783] = resIm391_s;
        out1024[idx + 1267] = -resIm391_s;
        
        double oRe122 = out1024[idx + 1268];
        double oIm122 = out1024[idx + 1269];
        double eRe122 = out1024[idx + 244];
        double eIm122 = out1024[idx + 245];
        double tRe122 = 0x1.771e75f037261p-1;
        double tRe134 = 0x1.5c77bbe65018dp-1;
        double resIm122_s = eIm122 + (oRe122 * tRe134 + oIm122 * tRe122);
        out1024[idx + 245] = resIm122_s;
        out1024[idx + 1805] = -resIm122_s;
        double resRe122_s = eRe122 + (oRe122 * tRe122 - oIm122 * tRe134);
        out1024[idx + 1804] = resRe122_s;
        out1024[idx + 244] = resRe122_s;
        double resRe134_s = eRe122 - (oRe122 * tRe122 - oIm122 * tRe134);
        out1024[idx + 1268] = resRe390_s;
        out1024[idx + 780] = resRe390_s;
        double resIm134_s = -eIm122 + (oRe122 * tRe134 + oIm122 * tRe122);
        out1024[idx + 781] = resIm390_s;
        out1024[idx + 1269] = -resIm390_s;
        
        double oRe123 = out1024[idx + 1270];
        double oIm123 = out1024[idx + 1271];
        double eRe123 = out1024[idx + 246];
        double eIm123 = out1024[idx + 247];
        double tRe123 = 0x1.74f948da8d28dp-1;
        double tRe133 = 0x1.5ec3495837075p-1;
        double resIm123_s = eIm123 + (oRe123 * tRe133 + oIm123 * tRe123);
        out1024[idx + 247] = resIm123_s;
        out1024[idx + 1803] = -resIm123_s;
        double resRe123_s = eRe123 + (oRe123 * tRe123 - oIm123 * tRe133);
        out1024[idx + 1802] = resRe123_s;
        out1024[idx + 246] = resRe123_s;
        double resRe133_s = eRe123 - (oRe123 * tRe123 - oIm123 * tRe133);
        out1024[idx + 1270] = resRe389_s;
        out1024[idx + 778] = resRe389_s;
        double resIm133_s = -eIm123 + (oRe123 * tRe133 + oIm123 * tRe123);
        out1024[idx + 779] = resIm389_s;
        out1024[idx + 1271] = -resIm389_s;
        
        double oRe124 = out1024[idx + 1272];
        double oIm124 = out1024[idx + 1273];
        double eRe124 = out1024[idx + 248];
        double eIm124 = out1024[idx + 249];
        double tRe124 = 0x1.72d0837efff97p-1;
        double tRe132 = 0x1.610b7551d2cdfp-1;
        double resIm124_s = eIm124 + (oRe124 * tRe132 + oIm124 * tRe124);
        out1024[idx + 249] = resIm124_s;
        out1024[idx + 1801] = -resIm124_s;
        double resRe124_s = eRe124 + (oRe124 * tRe124 - oIm124 * tRe132);
        out1024[idx + 1800] = resRe124_s;
        out1024[idx + 248] = resRe124_s;
        double resRe132_s = eRe124 - (oRe124 * tRe124 - oIm124 * tRe132);
        out1024[idx + 1272] = resRe388_s;
        out1024[idx + 776] = resRe388_s;
        double resIm132_s = -eIm124 + (oRe124 * tRe132 + oIm124 * tRe124);
        out1024[idx + 777] = resIm388_s;
        out1024[idx + 1273] = -resIm388_s;
        
        double oRe125 = out1024[idx + 1274];
        double oIm125 = out1024[idx + 1275];
        double eRe125 = out1024[idx + 250];
        double eIm125 = out1024[idx + 251];
        double tRe125 = 0x1.70a42b3176d7ap-1;
        double tRe131 = 0x1.63503a31c1be9p-1;
        double resIm125_s = eIm125 + (oRe125 * tRe131 + oIm125 * tRe125);
        out1024[idx + 251] = resIm125_s;
        out1024[idx + 1799] = -resIm125_s;
        double resRe125_s = eRe125 + (oRe125 * tRe125 - oIm125 * tRe131);
        out1024[idx + 1798] = resRe125_s;
        out1024[idx + 250] = resRe125_s;
        double resRe131_s = eRe125 - (oRe125 * tRe125 - oIm125 * tRe131);
        out1024[idx + 1274] = resRe387_s;
        out1024[idx + 774] = resRe387_s;
        double resIm131_s = -eIm125 + (oRe125 * tRe131 + oIm125 * tRe125);
        out1024[idx + 775] = resIm387_s;
        out1024[idx + 1275] = -resIm387_s;
        
        double oRe126 = out1024[idx + 1276];
        double oIm126 = out1024[idx + 1277];
        double eRe126 = out1024[idx + 252];
        double eIm126 = out1024[idx + 253];
        double tRe126 = 0x1.6e74454eaa8aep-1;
        double tRe130 = 0x1.6591925f0783ep-1;
        double resIm126_s = eIm126 + (oRe126 * tRe130 + oIm126 * tRe126);
        out1024[idx + 253] = resIm126_s;
        out1024[idx + 1797] = -resIm126_s;
        double resRe126_s = eRe126 + (oRe126 * tRe126 - oIm126 * tRe130);
        out1024[idx + 1796] = resRe126_s;
        out1024[idx + 252] = resRe126_s;
        double resRe130_s = eRe126 - (oRe126 * tRe126 - oIm126 * tRe130);
        out1024[idx + 1276] = resRe386_s;
        out1024[idx + 772] = resRe386_s;
        double resIm130_s = -eIm126 + (oRe126 * tRe130 + oIm126 * tRe126);
        out1024[idx + 773] = resIm386_s;
        out1024[idx + 1277] = -resIm386_s;
        
        double oRe127 = out1024[idx + 1278];
        double oIm127 = out1024[idx + 1279];
        double eRe127 = out1024[idx + 254];
        double eIm127 = out1024[idx + 255];
        double tRe127 = 0x1.6c40d73c18275p-1;
        double tRe129 = 0x1.67cf78491af11p-1;
        double resIm127_s = eIm127 + (oRe127 * tRe129 + oIm127 * tRe127);
        out1024[idx + 255] = resIm127_s;
        out1024[idx + 1795] = -resIm127_s;
        double resRe127_s = eRe127 + (oRe127 * tRe127 - oIm127 * tRe129);
        out1024[idx + 1794] = resRe127_s;
        out1024[idx + 254] = resRe127_s;
        double resRe129_s = eRe127 - (oRe127 * tRe127 - oIm127 * tRe129);
        out1024[idx + 1278] = resRe385_s;
        out1024[idx + 770] = resRe385_s;
        double resIm129_s = -eIm127 + (oRe127 * tRe129 + oIm127 * tRe127);
        out1024[idx + 771] = resIm385_s;
        out1024[idx + 1279] = -resIm385_s;
        
        double oRe128 = out1024[idx + 1280];
        double oIm128 = out1024[idx + 1281];
        double eRe128 = out1024[idx + 256];
        double eIm128 = out1024[idx + 257];
        double tRe128 = 0x1.6a09e667f3bcdp-1;
        double resIm128_s = eIm128 + (oRe128 * tRe128 + oIm128 * tRe128);
        out1024[idx + 257] = resIm128_s;
        out1024[idx + 1793] = -resIm128_s;
        double resRe128_s = eRe128 + (oRe128 * tRe128 - oIm128 * tRe128);
        out1024[idx + 1792] = resRe128_s;
        out1024[idx + 256] = resRe128_s;
        double resRe128_s = eRe128 - (oRe128 * tRe128 - oIm128 * tRe128);
        out1024[idx + 1280] = resRe384_s;
        out1024[idx + 768] = resRe384_s;
        double resIm128_s = -eIm128 + (oRe128 * tRe128 + oIm128 * tRe128);
        out1024[idx + 769] = resIm384_s;
        out1024[idx + 1281] = -resIm384_s;
        
        double oRe129 = out1024[idx + 1282];
        double oIm129 = out1024[idx + 1283];
        double eRe129 = out1024[idx + 258];
        double eIm129 = out1024[idx + 259];
        double resIm129_s = eIm129 + (oRe129 * tRe127 + oIm129 * tRe129);
        out1024[idx + 259] = resIm129_s;
        out1024[idx + 1791] = -resIm129_s;
        double resRe129_s = eRe129 + (oRe129 * tRe129 - oIm129 * tRe127);
        out1024[idx + 1790] = resRe129_s;
        out1024[idx + 258] = resRe129_s;
        double resRe127_s = eRe129 - (oRe129 * tRe129 - oIm129 * tRe127);
        out1024[idx + 1282] = resRe383_s;
        out1024[idx + 766] = resRe383_s;
        double resIm127_s = -eIm129 + (oRe129 * tRe127 + oIm129 * tRe129);
        out1024[idx + 767] = resIm383_s;
        out1024[idx + 1283] = -resIm383_s;
        
        double oRe130 = out1024[idx + 1284];
        double oIm130 = out1024[idx + 1285];
        double eRe130 = out1024[idx + 260];
        double eIm130 = out1024[idx + 261];
        double resIm130_s = eIm130 + (oRe130 * tRe126 + oIm130 * tRe130);
        out1024[idx + 261] = resIm130_s;
        out1024[idx + 1789] = -resIm130_s;
        double resRe130_s = eRe130 + (oRe130 * tRe130 - oIm130 * tRe126);
        out1024[idx + 1788] = resRe130_s;
        out1024[idx + 260] = resRe130_s;
        double resRe126_s = eRe130 - (oRe130 * tRe130 - oIm130 * tRe126);
        out1024[idx + 1284] = resRe382_s;
        out1024[idx + 764] = resRe382_s;
        double resIm126_s = -eIm130 + (oRe130 * tRe126 + oIm130 * tRe130);
        out1024[idx + 765] = resIm382_s;
        out1024[idx + 1285] = -resIm382_s;
        
        double oRe131 = out1024[idx + 1286];
        double oIm131 = out1024[idx + 1287];
        double eRe131 = out1024[idx + 262];
        double eIm131 = out1024[idx + 263];
        double resIm131_s = eIm131 + (oRe131 * tRe125 + oIm131 * tRe131);
        out1024[idx + 263] = resIm131_s;
        out1024[idx + 1787] = -resIm131_s;
        double resRe131_s = eRe131 + (oRe131 * tRe131 - oIm131 * tRe125);
        out1024[idx + 1786] = resRe131_s;
        out1024[idx + 262] = resRe131_s;
        double resRe125_s = eRe131 - (oRe131 * tRe131 - oIm131 * tRe125);
        out1024[idx + 1286] = resRe381_s;
        out1024[idx + 762] = resRe381_s;
        double resIm125_s = -eIm131 + (oRe131 * tRe125 + oIm131 * tRe131);
        out1024[idx + 763] = resIm381_s;
        out1024[idx + 1287] = -resIm381_s;
        
        double oRe132 = out1024[idx + 1288];
        double oIm132 = out1024[idx + 1289];
        double eRe132 = out1024[idx + 264];
        double eIm132 = out1024[idx + 265];
        double resIm132_s = eIm132 + (oRe132 * tRe124 + oIm132 * tRe132);
        out1024[idx + 265] = resIm132_s;
        out1024[idx + 1785] = -resIm132_s;
        double resRe132_s = eRe132 + (oRe132 * tRe132 - oIm132 * tRe124);
        out1024[idx + 1784] = resRe132_s;
        out1024[idx + 264] = resRe132_s;
        double resRe124_s = eRe132 - (oRe132 * tRe132 - oIm132 * tRe124);
        out1024[idx + 1288] = resRe380_s;
        out1024[idx + 760] = resRe380_s;
        double resIm124_s = -eIm132 + (oRe132 * tRe124 + oIm132 * tRe132);
        out1024[idx + 761] = resIm380_s;
        out1024[idx + 1289] = -resIm380_s;
        
        double oRe133 = out1024[idx + 1290];
        double oIm133 = out1024[idx + 1291];
        double eRe133 = out1024[idx + 266];
        double eIm133 = out1024[idx + 267];
        double resIm133_s = eIm133 + (oRe133 * tRe123 + oIm133 * tRe133);
        out1024[idx + 267] = resIm133_s;
        out1024[idx + 1783] = -resIm133_s;
        double resRe133_s = eRe133 + (oRe133 * tRe133 - oIm133 * tRe123);
        out1024[idx + 1782] = resRe133_s;
        out1024[idx + 266] = resRe133_s;
        double resRe123_s = eRe133 - (oRe133 * tRe133 - oIm133 * tRe123);
        out1024[idx + 1290] = resRe379_s;
        out1024[idx + 758] = resRe379_s;
        double resIm123_s = -eIm133 + (oRe133 * tRe123 + oIm133 * tRe133);
        out1024[idx + 759] = resIm379_s;
        out1024[idx + 1291] = -resIm379_s;
        
        double oRe134 = out1024[idx + 1292];
        double oIm134 = out1024[idx + 1293];
        double eRe134 = out1024[idx + 268];
        double eIm134 = out1024[idx + 269];
        double resIm134_s = eIm134 + (oRe134 * tRe122 + oIm134 * tRe134);
        out1024[idx + 269] = resIm134_s;
        out1024[idx + 1781] = -resIm134_s;
        double resRe134_s = eRe134 + (oRe134 * tRe134 - oIm134 * tRe122);
        out1024[idx + 1780] = resRe134_s;
        out1024[idx + 268] = resRe134_s;
        double resRe122_s = eRe134 - (oRe134 * tRe134 - oIm134 * tRe122);
        out1024[idx + 1292] = resRe378_s;
        out1024[idx + 756] = resRe378_s;
        double resIm122_s = -eIm134 + (oRe134 * tRe122 + oIm134 * tRe134);
        out1024[idx + 757] = resIm378_s;
        out1024[idx + 1293] = -resIm378_s;
        
        double oRe135 = out1024[idx + 1294];
        double oIm135 = out1024[idx + 1295];
        double eRe135 = out1024[idx + 270];
        double eIm135 = out1024[idx + 271];
        double resIm135_s = eIm135 + (oRe135 * tRe121 + oIm135 * tRe135);
        out1024[idx + 271] = resIm135_s;
        out1024[idx + 1779] = -resIm135_s;
        double resRe135_s = eRe135 + (oRe135 * tRe135 - oIm135 * tRe121);
        out1024[idx + 1778] = resRe135_s;
        out1024[idx + 270] = resRe135_s;
        double resRe121_s = eRe135 - (oRe135 * tRe135 - oIm135 * tRe121);
        out1024[idx + 1294] = resRe377_s;
        out1024[idx + 754] = resRe377_s;
        double resIm121_s = -eIm135 + (oRe135 * tRe121 + oIm135 * tRe135);
        out1024[idx + 755] = resIm377_s;
        out1024[idx + 1295] = -resIm377_s;
        
        double oRe136 = out1024[idx + 1296];
        double oIm136 = out1024[idx + 1297];
        double eRe136 = out1024[idx + 272];
        double eIm136 = out1024[idx + 273];
        double resIm136_s = eIm136 + (oRe136 * tRe120 + oIm136 * tRe136);
        out1024[idx + 273] = resIm136_s;
        out1024[idx + 1777] = -resIm136_s;
        double resRe136_s = eRe136 + (oRe136 * tRe136 - oIm136 * tRe120);
        out1024[idx + 1776] = resRe136_s;
        out1024[idx + 272] = resRe136_s;
        double resRe120_s = eRe136 - (oRe136 * tRe136 - oIm136 * tRe120);
        out1024[idx + 1296] = resRe376_s;
        out1024[idx + 752] = resRe376_s;
        double resIm120_s = -eIm136 + (oRe136 * tRe120 + oIm136 * tRe136);
        out1024[idx + 753] = resIm376_s;
        out1024[idx + 1297] = -resIm376_s;
        
        double oRe137 = out1024[idx + 1298];
        double oIm137 = out1024[idx + 1299];
        double eRe137 = out1024[idx + 274];
        double eIm137 = out1024[idx + 275];
        double resIm137_s = eIm137 + (oRe137 * tRe119 + oIm137 * tRe137);
        out1024[idx + 275] = resIm137_s;
        out1024[idx + 1775] = -resIm137_s;
        double resRe137_s = eRe137 + (oRe137 * tRe137 - oIm137 * tRe119);
        out1024[idx + 1774] = resRe137_s;
        out1024[idx + 274] = resRe137_s;
        double resRe119_s = eRe137 - (oRe137 * tRe137 - oIm137 * tRe119);
        out1024[idx + 1298] = resRe375_s;
        out1024[idx + 750] = resRe375_s;
        double resIm119_s = -eIm137 + (oRe137 * tRe119 + oIm137 * tRe137);
        out1024[idx + 751] = resIm375_s;
        out1024[idx + 1299] = -resIm375_s;
        
        double oRe138 = out1024[idx + 1300];
        double oIm138 = out1024[idx + 1301];
        double eRe138 = out1024[idx + 276];
        double eIm138 = out1024[idx + 277];
        double resIm138_s = eIm138 + (oRe138 * tRe118 + oIm138 * tRe138);
        out1024[idx + 277] = resIm138_s;
        out1024[idx + 1773] = -resIm138_s;
        double resRe138_s = eRe138 + (oRe138 * tRe138 - oIm138 * tRe118);
        out1024[idx + 1772] = resRe138_s;
        out1024[idx + 276] = resRe138_s;
        double resRe118_s = eRe138 - (oRe138 * tRe138 - oIm138 * tRe118);
        out1024[idx + 1300] = resRe374_s;
        out1024[idx + 748] = resRe374_s;
        double resIm118_s = -eIm138 + (oRe138 * tRe118 + oIm138 * tRe138);
        out1024[idx + 749] = resIm374_s;
        out1024[idx + 1301] = -resIm374_s;
        
        double oRe139 = out1024[idx + 1302];
        double oIm139 = out1024[idx + 1303];
        double eRe139 = out1024[idx + 278];
        double eIm139 = out1024[idx + 279];
        double resIm139_s = eIm139 + (oRe139 * tRe117 + oIm139 * tRe139);
        out1024[idx + 279] = resIm139_s;
        out1024[idx + 1771] = -resIm139_s;
        double resRe139_s = eRe139 + (oRe139 * tRe139 - oIm139 * tRe117);
        out1024[idx + 1770] = resRe139_s;
        out1024[idx + 278] = resRe139_s;
        double resRe117_s = eRe139 - (oRe139 * tRe139 - oIm139 * tRe117);
        out1024[idx + 1302] = resRe373_s;
        out1024[idx + 746] = resRe373_s;
        double resIm117_s = -eIm139 + (oRe139 * tRe117 + oIm139 * tRe139);
        out1024[idx + 747] = resIm373_s;
        out1024[idx + 1303] = -resIm373_s;
        
        double oRe140 = out1024[idx + 1304];
        double oIm140 = out1024[idx + 1305];
        double eRe140 = out1024[idx + 280];
        double eIm140 = out1024[idx + 281];
        double resIm140_s = eIm140 + (oRe140 * tRe116 + oIm140 * tRe140);
        out1024[idx + 281] = resIm140_s;
        out1024[idx + 1769] = -resIm140_s;
        double resRe140_s = eRe140 + (oRe140 * tRe140 - oIm140 * tRe116);
        out1024[idx + 1768] = resRe140_s;
        out1024[idx + 280] = resRe140_s;
        double resRe116_s = eRe140 - (oRe140 * tRe140 - oIm140 * tRe116);
        out1024[idx + 1304] = resRe372_s;
        out1024[idx + 744] = resRe372_s;
        double resIm116_s = -eIm140 + (oRe140 * tRe116 + oIm140 * tRe140);
        out1024[idx + 745] = resIm372_s;
        out1024[idx + 1305] = -resIm372_s;
        
        double oRe141 = out1024[idx + 1306];
        double oIm141 = out1024[idx + 1307];
        double eRe141 = out1024[idx + 282];
        double eIm141 = out1024[idx + 283];
        double resIm141_s = eIm141 + (oRe141 * tRe115 + oIm141 * tRe141);
        out1024[idx + 283] = resIm141_s;
        out1024[idx + 1767] = -resIm141_s;
        double resRe141_s = eRe141 + (oRe141 * tRe141 - oIm141 * tRe115);
        out1024[idx + 1766] = resRe141_s;
        out1024[idx + 282] = resRe141_s;
        double resRe115_s = eRe141 - (oRe141 * tRe141 - oIm141 * tRe115);
        out1024[idx + 1306] = resRe371_s;
        out1024[idx + 742] = resRe371_s;
        double resIm115_s = -eIm141 + (oRe141 * tRe115 + oIm141 * tRe141);
        out1024[idx + 743] = resIm371_s;
        out1024[idx + 1307] = -resIm371_s;
        
        double oRe142 = out1024[idx + 1308];
        double oIm142 = out1024[idx + 1309];
        double eRe142 = out1024[idx + 284];
        double eIm142 = out1024[idx + 285];
        double resIm142_s = eIm142 + (oRe142 * tRe114 + oIm142 * tRe142);
        out1024[idx + 285] = resIm142_s;
        out1024[idx + 1765] = -resIm142_s;
        double resRe142_s = eRe142 + (oRe142 * tRe142 - oIm142 * tRe114);
        out1024[idx + 1764] = resRe142_s;
        out1024[idx + 284] = resRe142_s;
        double resRe114_s = eRe142 - (oRe142 * tRe142 - oIm142 * tRe114);
        out1024[idx + 1308] = resRe370_s;
        out1024[idx + 740] = resRe370_s;
        double resIm114_s = -eIm142 + (oRe142 * tRe114 + oIm142 * tRe142);
        out1024[idx + 741] = resIm370_s;
        out1024[idx + 1309] = -resIm370_s;
        
        double oRe143 = out1024[idx + 1310];
        double oIm143 = out1024[idx + 1311];
        double eRe143 = out1024[idx + 286];
        double eIm143 = out1024[idx + 287];
        double resIm143_s = eIm143 + (oRe143 * tRe113 + oIm143 * tRe143);
        out1024[idx + 287] = resIm143_s;
        out1024[idx + 1763] = -resIm143_s;
        double resRe143_s = eRe143 + (oRe143 * tRe143 - oIm143 * tRe113);
        out1024[idx + 1762] = resRe143_s;
        out1024[idx + 286] = resRe143_s;
        double resRe113_s = eRe143 - (oRe143 * tRe143 - oIm143 * tRe113);
        out1024[idx + 1310] = resRe369_s;
        out1024[idx + 738] = resRe369_s;
        double resIm113_s = -eIm143 + (oRe143 * tRe113 + oIm143 * tRe143);
        out1024[idx + 739] = resIm369_s;
        out1024[idx + 1311] = -resIm369_s;
        
        double oRe144 = out1024[idx + 1312];
        double oIm144 = out1024[idx + 1313];
        double eRe144 = out1024[idx + 288];
        double eIm144 = out1024[idx + 289];
        double resIm144_s = eIm144 + (oRe144 * tRe112 + oIm144 * tRe144);
        out1024[idx + 289] = resIm144_s;
        out1024[idx + 1761] = -resIm144_s;
        double resRe144_s = eRe144 + (oRe144 * tRe144 - oIm144 * tRe112);
        out1024[idx + 1760] = resRe144_s;
        out1024[idx + 288] = resRe144_s;
        double resRe112_s = eRe144 - (oRe144 * tRe144 - oIm144 * tRe112);
        out1024[idx + 1312] = resRe368_s;
        out1024[idx + 736] = resRe368_s;
        double resIm112_s = -eIm144 + (oRe144 * tRe112 + oIm144 * tRe144);
        out1024[idx + 737] = resIm368_s;
        out1024[idx + 1313] = -resIm368_s;
        
        double oRe145 = out1024[idx + 1314];
        double oIm145 = out1024[idx + 1315];
        double eRe145 = out1024[idx + 290];
        double eIm145 = out1024[idx + 291];
        double resIm145_s = eIm145 + (oRe145 * tRe111 + oIm145 * tRe145);
        out1024[idx + 291] = resIm145_s;
        out1024[idx + 1759] = -resIm145_s;
        double resRe145_s = eRe145 + (oRe145 * tRe145 - oIm145 * tRe111);
        out1024[idx + 1758] = resRe145_s;
        out1024[idx + 290] = resRe145_s;
        double resRe111_s = eRe145 - (oRe145 * tRe145 - oIm145 * tRe111);
        out1024[idx + 1314] = resRe367_s;
        out1024[idx + 734] = resRe367_s;
        double resIm111_s = -eIm145 + (oRe145 * tRe111 + oIm145 * tRe145);
        out1024[idx + 735] = resIm367_s;
        out1024[idx + 1315] = -resIm367_s;
        
        double oRe146 = out1024[idx + 1316];
        double oIm146 = out1024[idx + 1317];
        double eRe146 = out1024[idx + 292];
        double eIm146 = out1024[idx + 293];
        double resIm146_s = eIm146 + (oRe146 * tRe110 + oIm146 * tRe146);
        out1024[idx + 293] = resIm146_s;
        out1024[idx + 1757] = -resIm146_s;
        double resRe146_s = eRe146 + (oRe146 * tRe146 - oIm146 * tRe110);
        out1024[idx + 1756] = resRe146_s;
        out1024[idx + 292] = resRe146_s;
        double resRe110_s = eRe146 - (oRe146 * tRe146 - oIm146 * tRe110);
        out1024[idx + 1316] = resRe366_s;
        out1024[idx + 732] = resRe366_s;
        double resIm110_s = -eIm146 + (oRe146 * tRe110 + oIm146 * tRe146);
        out1024[idx + 733] = resIm366_s;
        out1024[idx + 1317] = -resIm366_s;
        
        double oRe147 = out1024[idx + 1318];
        double oIm147 = out1024[idx + 1319];
        double eRe147 = out1024[idx + 294];
        double eIm147 = out1024[idx + 295];
        double resIm147_s = eIm147 + (oRe147 * tRe109 + oIm147 * tRe147);
        out1024[idx + 295] = resIm147_s;
        out1024[idx + 1755] = -resIm147_s;
        double resRe147_s = eRe147 + (oRe147 * tRe147 - oIm147 * tRe109);
        out1024[idx + 1754] = resRe147_s;
        out1024[idx + 294] = resRe147_s;
        double resRe109_s = eRe147 - (oRe147 * tRe147 - oIm147 * tRe109);
        out1024[idx + 1318] = resRe365_s;
        out1024[idx + 730] = resRe365_s;
        double resIm109_s = -eIm147 + (oRe147 * tRe109 + oIm147 * tRe147);
        out1024[idx + 731] = resIm365_s;
        out1024[idx + 1319] = -resIm365_s;
        
        double oRe148 = out1024[idx + 1320];
        double oIm148 = out1024[idx + 1321];
        double eRe148 = out1024[idx + 296];
        double eIm148 = out1024[idx + 297];
        double resIm148_s = eIm148 + (oRe148 * tRe108 + oIm148 * tRe148);
        out1024[idx + 297] = resIm148_s;
        out1024[idx + 1753] = -resIm148_s;
        double resRe148_s = eRe148 + (oRe148 * tRe148 - oIm148 * tRe108);
        out1024[idx + 1752] = resRe148_s;
        out1024[idx + 296] = resRe148_s;
        double resRe108_s = eRe148 - (oRe148 * tRe148 - oIm148 * tRe108);
        out1024[idx + 1320] = resRe364_s;
        out1024[idx + 728] = resRe364_s;
        double resIm108_s = -eIm148 + (oRe148 * tRe108 + oIm148 * tRe148);
        out1024[idx + 729] = resIm364_s;
        out1024[idx + 1321] = -resIm364_s;
        
        double oRe149 = out1024[idx + 1322];
        double oIm149 = out1024[idx + 1323];
        double eRe149 = out1024[idx + 298];
        double eIm149 = out1024[idx + 299];
        double resIm149_s = eIm149 + (oRe149 * tRe107 + oIm149 * tRe149);
        out1024[idx + 299] = resIm149_s;
        out1024[idx + 1751] = -resIm149_s;
        double resRe149_s = eRe149 + (oRe149 * tRe149 - oIm149 * tRe107);
        out1024[idx + 1750] = resRe149_s;
        out1024[idx + 298] = resRe149_s;
        double resRe107_s = eRe149 - (oRe149 * tRe149 - oIm149 * tRe107);
        out1024[idx + 1322] = resRe363_s;
        out1024[idx + 726] = resRe363_s;
        double resIm107_s = -eIm149 + (oRe149 * tRe107 + oIm149 * tRe149);
        out1024[idx + 727] = resIm363_s;
        out1024[idx + 1323] = -resIm363_s;
        
        double oRe150 = out1024[idx + 1324];
        double oIm150 = out1024[idx + 1325];
        double eRe150 = out1024[idx + 300];
        double eIm150 = out1024[idx + 301];
        double resIm150_s = eIm150 + (oRe150 * tRe106 + oIm150 * tRe150);
        out1024[idx + 301] = resIm150_s;
        out1024[idx + 1749] = -resIm150_s;
        double resRe150_s = eRe150 + (oRe150 * tRe150 - oIm150 * tRe106);
        out1024[idx + 1748] = resRe150_s;
        out1024[idx + 300] = resRe150_s;
        double resRe106_s = eRe150 - (oRe150 * tRe150 - oIm150 * tRe106);
        out1024[idx + 1324] = resRe362_s;
        out1024[idx + 724] = resRe362_s;
        double resIm106_s = -eIm150 + (oRe150 * tRe106 + oIm150 * tRe150);
        out1024[idx + 725] = resIm362_s;
        out1024[idx + 1325] = -resIm362_s;
        
        double oRe151 = out1024[idx + 1326];
        double oIm151 = out1024[idx + 1327];
        double eRe151 = out1024[idx + 302];
        double eIm151 = out1024[idx + 303];
        double resIm151_s = eIm151 + (oRe151 * tRe105 + oIm151 * tRe151);
        out1024[idx + 303] = resIm151_s;
        out1024[idx + 1747] = -resIm151_s;
        double resRe151_s = eRe151 + (oRe151 * tRe151 - oIm151 * tRe105);
        out1024[idx + 1746] = resRe151_s;
        out1024[idx + 302] = resRe151_s;
        double resRe105_s = eRe151 - (oRe151 * tRe151 - oIm151 * tRe105);
        out1024[idx + 1326] = resRe361_s;
        out1024[idx + 722] = resRe361_s;
        double resIm105_s = -eIm151 + (oRe151 * tRe105 + oIm151 * tRe151);
        out1024[idx + 723] = resIm361_s;
        out1024[idx + 1327] = -resIm361_s;
        
        double oRe152 = out1024[idx + 1328];
        double oIm152 = out1024[idx + 1329];
        double eRe152 = out1024[idx + 304];
        double eIm152 = out1024[idx + 305];
        double resIm152_s = eIm152 + (oRe152 * tRe104 + oIm152 * tRe152);
        out1024[idx + 305] = resIm152_s;
        out1024[idx + 1745] = -resIm152_s;
        double resRe152_s = eRe152 + (oRe152 * tRe152 - oIm152 * tRe104);
        out1024[idx + 1744] = resRe152_s;
        out1024[idx + 304] = resRe152_s;
        double resRe104_s = eRe152 - (oRe152 * tRe152 - oIm152 * tRe104);
        out1024[idx + 1328] = resRe360_s;
        out1024[idx + 720] = resRe360_s;
        double resIm104_s = -eIm152 + (oRe152 * tRe104 + oIm152 * tRe152);
        out1024[idx + 721] = resIm360_s;
        out1024[idx + 1329] = -resIm360_s;
        
        double oRe153 = out1024[idx + 1330];
        double oIm153 = out1024[idx + 1331];
        double eRe153 = out1024[idx + 306];
        double eIm153 = out1024[idx + 307];
        double resIm153_s = eIm153 + (oRe153 * tRe103 + oIm153 * tRe153);
        out1024[idx + 307] = resIm153_s;
        out1024[idx + 1743] = -resIm153_s;
        double resRe153_s = eRe153 + (oRe153 * tRe153 - oIm153 * tRe103);
        out1024[idx + 1742] = resRe153_s;
        out1024[idx + 306] = resRe153_s;
        double resRe103_s = eRe153 - (oRe153 * tRe153 - oIm153 * tRe103);
        out1024[idx + 1330] = resRe359_s;
        out1024[idx + 718] = resRe359_s;
        double resIm103_s = -eIm153 + (oRe153 * tRe103 + oIm153 * tRe153);
        out1024[idx + 719] = resIm359_s;
        out1024[idx + 1331] = -resIm359_s;
        
        double oRe154 = out1024[idx + 1332];
        double oIm154 = out1024[idx + 1333];
        double eRe154 = out1024[idx + 308];
        double eIm154 = out1024[idx + 309];
        double resIm154_s = eIm154 + (oRe154 * tRe102 + oIm154 * tRe154);
        out1024[idx + 309] = resIm154_s;
        out1024[idx + 1741] = -resIm154_s;
        double resRe154_s = eRe154 + (oRe154 * tRe154 - oIm154 * tRe102);
        out1024[idx + 1740] = resRe154_s;
        out1024[idx + 308] = resRe154_s;
        double resRe102_s = eRe154 - (oRe154 * tRe154 - oIm154 * tRe102);
        out1024[idx + 1332] = resRe358_s;
        out1024[idx + 716] = resRe358_s;
        double resIm102_s = -eIm154 + (oRe154 * tRe102 + oIm154 * tRe154);
        out1024[idx + 717] = resIm358_s;
        out1024[idx + 1333] = -resIm358_s;
        
        double oRe155 = out1024[idx + 1334];
        double oIm155 = out1024[idx + 1335];
        double eRe155 = out1024[idx + 310];
        double eIm155 = out1024[idx + 311];
        double resIm155_s = eIm155 + (oRe155 * tRe101 + oIm155 * tRe155);
        out1024[idx + 311] = resIm155_s;
        out1024[idx + 1739] = -resIm155_s;
        double resRe155_s = eRe155 + (oRe155 * tRe155 - oIm155 * tRe101);
        out1024[idx + 1738] = resRe155_s;
        out1024[idx + 310] = resRe155_s;
        double resRe101_s = eRe155 - (oRe155 * tRe155 - oIm155 * tRe101);
        out1024[idx + 1334] = resRe357_s;
        out1024[idx + 714] = resRe357_s;
        double resIm101_s = -eIm155 + (oRe155 * tRe101 + oIm155 * tRe155);
        out1024[idx + 715] = resIm357_s;
        out1024[idx + 1335] = -resIm357_s;
        
        double oRe156 = out1024[idx + 1336];
        double oIm156 = out1024[idx + 1337];
        double eRe156 = out1024[idx + 312];
        double eIm156 = out1024[idx + 313];
        double resIm156_s = eIm156 + (oRe156 * tRe100 + oIm156 * tRe156);
        out1024[idx + 313] = resIm156_s;
        out1024[idx + 1737] = -resIm156_s;
        double resRe156_s = eRe156 + (oRe156 * tRe156 - oIm156 * tRe100);
        out1024[idx + 1736] = resRe156_s;
        out1024[idx + 312] = resRe156_s;
        double resRe100_s = eRe156 - (oRe156 * tRe156 - oIm156 * tRe100);
        out1024[idx + 1336] = resRe356_s;
        out1024[idx + 712] = resRe356_s;
        double resIm100_s = -eIm156 + (oRe156 * tRe100 + oIm156 * tRe156);
        out1024[idx + 713] = resIm356_s;
        out1024[idx + 1337] = -resIm356_s;
        
        double oRe157 = out1024[idx + 1338];
        double oIm157 = out1024[idx + 1339];
        double eRe157 = out1024[idx + 314];
        double eIm157 = out1024[idx + 315];
        double resIm157_s = eIm157 + (oRe157 * tRe99 + oIm157 * tRe157);
        out1024[idx + 315] = resIm157_s;
        out1024[idx + 1735] = -resIm157_s;
        double resRe157_s = eRe157 + (oRe157 * tRe157 - oIm157 * tRe99);
        out1024[idx + 1734] = resRe157_s;
        out1024[idx + 314] = resRe157_s;
        double resRe99_s = eRe157 - (oRe157 * tRe157 - oIm157 * tRe99);
        out1024[idx + 1338] = resRe355_s;
        out1024[idx + 710] = resRe355_s;
        double resIm99_s = -eIm157 + (oRe157 * tRe99 + oIm157 * tRe157);
        out1024[idx + 711] = resIm355_s;
        out1024[idx + 1339] = -resIm355_s;
        
        double oRe158 = out1024[idx + 1340];
        double oIm158 = out1024[idx + 1341];
        double eRe158 = out1024[idx + 316];
        double eIm158 = out1024[idx + 317];
        double resIm158_s = eIm158 + (oRe158 * tRe98 + oIm158 * tRe158);
        out1024[idx + 317] = resIm158_s;
        out1024[idx + 1733] = -resIm158_s;
        double resRe158_s = eRe158 + (oRe158 * tRe158 - oIm158 * tRe98);
        out1024[idx + 1732] = resRe158_s;
        out1024[idx + 316] = resRe158_s;
        double resRe98_s = eRe158 - (oRe158 * tRe158 - oIm158 * tRe98);
        out1024[idx + 1340] = resRe354_s;
        out1024[idx + 708] = resRe354_s;
        double resIm98_s = -eIm158 + (oRe158 * tRe98 + oIm158 * tRe158);
        out1024[idx + 709] = resIm354_s;
        out1024[idx + 1341] = -resIm354_s;
        
        double oRe159 = out1024[idx + 1342];
        double oIm159 = out1024[idx + 1343];
        double eRe159 = out1024[idx + 318];
        double eIm159 = out1024[idx + 319];
        double resIm159_s = eIm159 + (oRe159 * tRe97 + oIm159 * tRe159);
        out1024[idx + 319] = resIm159_s;
        out1024[idx + 1731] = -resIm159_s;
        double resRe159_s = eRe159 + (oRe159 * tRe159 - oIm159 * tRe97);
        out1024[idx + 1730] = resRe159_s;
        out1024[idx + 318] = resRe159_s;
        double resRe97_s = eRe159 - (oRe159 * tRe159 - oIm159 * tRe97);
        out1024[idx + 1342] = resRe353_s;
        out1024[idx + 706] = resRe353_s;
        double resIm97_s = -eIm159 + (oRe159 * tRe97 + oIm159 * tRe159);
        out1024[idx + 707] = resIm353_s;
        out1024[idx + 1343] = -resIm353_s;
        
        double oRe160 = out1024[idx + 1344];
        double oIm160 = out1024[idx + 1345];
        double eRe160 = out1024[idx + 320];
        double eIm160 = out1024[idx + 321];
        double resIm160_s = eIm160 + (oRe160 * tRe96 + oIm160 * tRe160);
        out1024[idx + 321] = resIm160_s;
        out1024[idx + 1729] = -resIm160_s;
        double resRe160_s = eRe160 + (oRe160 * tRe160 - oIm160 * tRe96);
        out1024[idx + 1728] = resRe160_s;
        out1024[idx + 320] = resRe160_s;
        double resRe96_s = eRe160 - (oRe160 * tRe160 - oIm160 * tRe96);
        out1024[idx + 1344] = resRe352_s;
        out1024[idx + 704] = resRe352_s;
        double resIm96_s = -eIm160 + (oRe160 * tRe96 + oIm160 * tRe160);
        out1024[idx + 705] = resIm352_s;
        out1024[idx + 1345] = -resIm352_s;
        
        double oRe161 = out1024[idx + 1346];
        double oIm161 = out1024[idx + 1347];
        double eRe161 = out1024[idx + 322];
        double eIm161 = out1024[idx + 323];
        double resIm161_s = eIm161 + (oRe161 * tRe95 + oIm161 * tRe161);
        out1024[idx + 323] = resIm161_s;
        out1024[idx + 1727] = -resIm161_s;
        double resRe161_s = eRe161 + (oRe161 * tRe161 - oIm161 * tRe95);
        out1024[idx + 1726] = resRe161_s;
        out1024[idx + 322] = resRe161_s;
        double resRe95_s = eRe161 - (oRe161 * tRe161 - oIm161 * tRe95);
        out1024[idx + 1346] = resRe351_s;
        out1024[idx + 702] = resRe351_s;
        double resIm95_s = -eIm161 + (oRe161 * tRe95 + oIm161 * tRe161);
        out1024[idx + 703] = resIm351_s;
        out1024[idx + 1347] = -resIm351_s;
        
        double oRe162 = out1024[idx + 1348];
        double oIm162 = out1024[idx + 1349];
        double eRe162 = out1024[idx + 324];
        double eIm162 = out1024[idx + 325];
        double resIm162_s = eIm162 + (oRe162 * tRe94 + oIm162 * tRe162);
        out1024[idx + 325] = resIm162_s;
        out1024[idx + 1725] = -resIm162_s;
        double resRe162_s = eRe162 + (oRe162 * tRe162 - oIm162 * tRe94);
        out1024[idx + 1724] = resRe162_s;
        out1024[idx + 324] = resRe162_s;
        double resRe94_s = eRe162 - (oRe162 * tRe162 - oIm162 * tRe94);
        out1024[idx + 1348] = resRe350_s;
        out1024[idx + 700] = resRe350_s;
        double resIm94_s = -eIm162 + (oRe162 * tRe94 + oIm162 * tRe162);
        out1024[idx + 701] = resIm350_s;
        out1024[idx + 1349] = -resIm350_s;
        
        double oRe163 = out1024[idx + 1350];
        double oIm163 = out1024[idx + 1351];
        double eRe163 = out1024[idx + 326];
        double eIm163 = out1024[idx + 327];
        double resIm163_s = eIm163 + (oRe163 * tRe93 + oIm163 * tRe163);
        out1024[idx + 327] = resIm163_s;
        out1024[idx + 1723] = -resIm163_s;
        double resRe163_s = eRe163 + (oRe163 * tRe163 - oIm163 * tRe93);
        out1024[idx + 1722] = resRe163_s;
        out1024[idx + 326] = resRe163_s;
        double resRe93_s = eRe163 - (oRe163 * tRe163 - oIm163 * tRe93);
        out1024[idx + 1350] = resRe349_s;
        out1024[idx + 698] = resRe349_s;
        double resIm93_s = -eIm163 + (oRe163 * tRe93 + oIm163 * tRe163);
        out1024[idx + 699] = resIm349_s;
        out1024[idx + 1351] = -resIm349_s;
        
        double oRe164 = out1024[idx + 1352];
        double oIm164 = out1024[idx + 1353];
        double eRe164 = out1024[idx + 328];
        double eIm164 = out1024[idx + 329];
        double resIm164_s = eIm164 + (oRe164 * tRe92 + oIm164 * tRe164);
        out1024[idx + 329] = resIm164_s;
        out1024[idx + 1721] = -resIm164_s;
        double resRe164_s = eRe164 + (oRe164 * tRe164 - oIm164 * tRe92);
        out1024[idx + 1720] = resRe164_s;
        out1024[idx + 328] = resRe164_s;
        double resRe92_s = eRe164 - (oRe164 * tRe164 - oIm164 * tRe92);
        out1024[idx + 1352] = resRe348_s;
        out1024[idx + 696] = resRe348_s;
        double resIm92_s = -eIm164 + (oRe164 * tRe92 + oIm164 * tRe164);
        out1024[idx + 697] = resIm348_s;
        out1024[idx + 1353] = -resIm348_s;
        
        double oRe165 = out1024[idx + 1354];
        double oIm165 = out1024[idx + 1355];
        double eRe165 = out1024[idx + 330];
        double eIm165 = out1024[idx + 331];
        double resIm165_s = eIm165 + (oRe165 * tRe91 + oIm165 * tRe165);
        out1024[idx + 331] = resIm165_s;
        out1024[idx + 1719] = -resIm165_s;
        double resRe165_s = eRe165 + (oRe165 * tRe165 - oIm165 * tRe91);
        out1024[idx + 1718] = resRe165_s;
        out1024[idx + 330] = resRe165_s;
        double resRe91_s = eRe165 - (oRe165 * tRe165 - oIm165 * tRe91);
        out1024[idx + 1354] = resRe347_s;
        out1024[idx + 694] = resRe347_s;
        double resIm91_s = -eIm165 + (oRe165 * tRe91 + oIm165 * tRe165);
        out1024[idx + 695] = resIm347_s;
        out1024[idx + 1355] = -resIm347_s;
        
        double oRe166 = out1024[idx + 1356];
        double oIm166 = out1024[idx + 1357];
        double eRe166 = out1024[idx + 332];
        double eIm166 = out1024[idx + 333];
        double resIm166_s = eIm166 + (oRe166 * tRe90 + oIm166 * tRe166);
        out1024[idx + 333] = resIm166_s;
        out1024[idx + 1717] = -resIm166_s;
        double resRe166_s = eRe166 + (oRe166 * tRe166 - oIm166 * tRe90);
        out1024[idx + 1716] = resRe166_s;
        out1024[idx + 332] = resRe166_s;
        double resRe90_s = eRe166 - (oRe166 * tRe166 - oIm166 * tRe90);
        out1024[idx + 1356] = resRe346_s;
        out1024[idx + 692] = resRe346_s;
        double resIm90_s = -eIm166 + (oRe166 * tRe90 + oIm166 * tRe166);
        out1024[idx + 693] = resIm346_s;
        out1024[idx + 1357] = -resIm346_s;
        
        double oRe167 = out1024[idx + 1358];
        double oIm167 = out1024[idx + 1359];
        double eRe167 = out1024[idx + 334];
        double eIm167 = out1024[idx + 335];
        double resIm167_s = eIm167 + (oRe167 * tRe89 + oIm167 * tRe167);
        out1024[idx + 335] = resIm167_s;
        out1024[idx + 1715] = -resIm167_s;
        double resRe167_s = eRe167 + (oRe167 * tRe167 - oIm167 * tRe89);
        out1024[idx + 1714] = resRe167_s;
        out1024[idx + 334] = resRe167_s;
        double resRe89_s = eRe167 - (oRe167 * tRe167 - oIm167 * tRe89);
        out1024[idx + 1358] = resRe345_s;
        out1024[idx + 690] = resRe345_s;
        double resIm89_s = -eIm167 + (oRe167 * tRe89 + oIm167 * tRe167);
        out1024[idx + 691] = resIm345_s;
        out1024[idx + 1359] = -resIm345_s;
        
        double oRe168 = out1024[idx + 1360];
        double oIm168 = out1024[idx + 1361];
        double eRe168 = out1024[idx + 336];
        double eIm168 = out1024[idx + 337];
        double resIm168_s = eIm168 + (oRe168 * tRe88 + oIm168 * tRe168);
        out1024[idx + 337] = resIm168_s;
        out1024[idx + 1713] = -resIm168_s;
        double resRe168_s = eRe168 + (oRe168 * tRe168 - oIm168 * tRe88);
        out1024[idx + 1712] = resRe168_s;
        out1024[idx + 336] = resRe168_s;
        double resRe88_s = eRe168 - (oRe168 * tRe168 - oIm168 * tRe88);
        out1024[idx + 1360] = resRe344_s;
        out1024[idx + 688] = resRe344_s;
        double resIm88_s = -eIm168 + (oRe168 * tRe88 + oIm168 * tRe168);
        out1024[idx + 689] = resIm344_s;
        out1024[idx + 1361] = -resIm344_s;
        
        double oRe169 = out1024[idx + 1362];
        double oIm169 = out1024[idx + 1363];
        double eRe169 = out1024[idx + 338];
        double eIm169 = out1024[idx + 339];
        double resIm169_s = eIm169 + (oRe169 * tRe87 + oIm169 * tRe169);
        out1024[idx + 339] = resIm169_s;
        out1024[idx + 1711] = -resIm169_s;
        double resRe169_s = eRe169 + (oRe169 * tRe169 - oIm169 * tRe87);
        out1024[idx + 1710] = resRe169_s;
        out1024[idx + 338] = resRe169_s;
        double resRe87_s = eRe169 - (oRe169 * tRe169 - oIm169 * tRe87);
        out1024[idx + 1362] = resRe343_s;
        out1024[idx + 686] = resRe343_s;
        double resIm87_s = -eIm169 + (oRe169 * tRe87 + oIm169 * tRe169);
        out1024[idx + 687] = resIm343_s;
        out1024[idx + 1363] = -resIm343_s;
        
        double oRe170 = out1024[idx + 1364];
        double oIm170 = out1024[idx + 1365];
        double eRe170 = out1024[idx + 340];
        double eIm170 = out1024[idx + 341];
        double resIm170_s = eIm170 + (oRe170 * tRe86 + oIm170 * tRe170);
        out1024[idx + 341] = resIm170_s;
        out1024[idx + 1709] = -resIm170_s;
        double resRe170_s = eRe170 + (oRe170 * tRe170 - oIm170 * tRe86);
        out1024[idx + 1708] = resRe170_s;
        out1024[idx + 340] = resRe170_s;
        double resRe86_s = eRe170 - (oRe170 * tRe170 - oIm170 * tRe86);
        out1024[idx + 1364] = resRe342_s;
        out1024[idx + 684] = resRe342_s;
        double resIm86_s = -eIm170 + (oRe170 * tRe86 + oIm170 * tRe170);
        out1024[idx + 685] = resIm342_s;
        out1024[idx + 1365] = -resIm342_s;
        
        double oRe171 = out1024[idx + 1366];
        double oIm171 = out1024[idx + 1367];
        double eRe171 = out1024[idx + 342];
        double eIm171 = out1024[idx + 343];
        double resIm171_s = eIm171 + (oRe171 * tRe85 + oIm171 * tRe171);
        out1024[idx + 343] = resIm171_s;
        out1024[idx + 1707] = -resIm171_s;
        double resRe171_s = eRe171 + (oRe171 * tRe171 - oIm171 * tRe85);
        out1024[idx + 1706] = resRe171_s;
        out1024[idx + 342] = resRe171_s;
        double resRe85_s = eRe171 - (oRe171 * tRe171 - oIm171 * tRe85);
        out1024[idx + 1366] = resRe341_s;
        out1024[idx + 682] = resRe341_s;
        double resIm85_s = -eIm171 + (oRe171 * tRe85 + oIm171 * tRe171);
        out1024[idx + 683] = resIm341_s;
        out1024[idx + 1367] = -resIm341_s;
        
        double oRe172 = out1024[idx + 1368];
        double oIm172 = out1024[idx + 1369];
        double eRe172 = out1024[idx + 344];
        double eIm172 = out1024[idx + 345];
        double resIm172_s = eIm172 + (oRe172 * tRe84 + oIm172 * tRe172);
        out1024[idx + 345] = resIm172_s;
        out1024[idx + 1705] = -resIm172_s;
        double resRe172_s = eRe172 + (oRe172 * tRe172 - oIm172 * tRe84);
        out1024[idx + 1704] = resRe172_s;
        out1024[idx + 344] = resRe172_s;
        double resRe84_s = eRe172 - (oRe172 * tRe172 - oIm172 * tRe84);
        out1024[idx + 1368] = resRe340_s;
        out1024[idx + 680] = resRe340_s;
        double resIm84_s = -eIm172 + (oRe172 * tRe84 + oIm172 * tRe172);
        out1024[idx + 681] = resIm340_s;
        out1024[idx + 1369] = -resIm340_s;
        
        double oRe173 = out1024[idx + 1370];
        double oIm173 = out1024[idx + 1371];
        double eRe173 = out1024[idx + 346];
        double eIm173 = out1024[idx + 347];
        double resIm173_s = eIm173 + (oRe173 * tRe83 + oIm173 * tRe173);
        out1024[idx + 347] = resIm173_s;
        out1024[idx + 1703] = -resIm173_s;
        double resRe173_s = eRe173 + (oRe173 * tRe173 - oIm173 * tRe83);
        out1024[idx + 1702] = resRe173_s;
        out1024[idx + 346] = resRe173_s;
        double resRe83_s = eRe173 - (oRe173 * tRe173 - oIm173 * tRe83);
        out1024[idx + 1370] = resRe339_s;
        out1024[idx + 678] = resRe339_s;
        double resIm83_s = -eIm173 + (oRe173 * tRe83 + oIm173 * tRe173);
        out1024[idx + 679] = resIm339_s;
        out1024[idx + 1371] = -resIm339_s;
        
        double oRe174 = out1024[idx + 1372];
        double oIm174 = out1024[idx + 1373];
        double eRe174 = out1024[idx + 348];
        double eIm174 = out1024[idx + 349];
        double resIm174_s = eIm174 + (oRe174 * tRe82 + oIm174 * tRe174);
        out1024[idx + 349] = resIm174_s;
        out1024[idx + 1701] = -resIm174_s;
        double resRe174_s = eRe174 + (oRe174 * tRe174 - oIm174 * tRe82);
        out1024[idx + 1700] = resRe174_s;
        out1024[idx + 348] = resRe174_s;
        double resRe82_s = eRe174 - (oRe174 * tRe174 - oIm174 * tRe82);
        out1024[idx + 1372] = resRe338_s;
        out1024[idx + 676] = resRe338_s;
        double resIm82_s = -eIm174 + (oRe174 * tRe82 + oIm174 * tRe174);
        out1024[idx + 677] = resIm338_s;
        out1024[idx + 1373] = -resIm338_s;
        
        double oRe175 = out1024[idx + 1374];
        double oIm175 = out1024[idx + 1375];
        double eRe175 = out1024[idx + 350];
        double eIm175 = out1024[idx + 351];
        double resIm175_s = eIm175 + (oRe175 * tRe81 + oIm175 * tRe175);
        out1024[idx + 351] = resIm175_s;
        out1024[idx + 1699] = -resIm175_s;
        double resRe175_s = eRe175 + (oRe175 * tRe175 - oIm175 * tRe81);
        out1024[idx + 1698] = resRe175_s;
        out1024[idx + 350] = resRe175_s;
        double resRe81_s = eRe175 - (oRe175 * tRe175 - oIm175 * tRe81);
        out1024[idx + 1374] = resRe337_s;
        out1024[idx + 674] = resRe337_s;
        double resIm81_s = -eIm175 + (oRe175 * tRe81 + oIm175 * tRe175);
        out1024[idx + 675] = resIm337_s;
        out1024[idx + 1375] = -resIm337_s;
        
        double oRe176 = out1024[idx + 1376];
        double oIm176 = out1024[idx + 1377];
        double eRe176 = out1024[idx + 352];
        double eIm176 = out1024[idx + 353];
        double resIm176_s = eIm176 + (oRe176 * tRe80 + oIm176 * tRe176);
        out1024[idx + 353] = resIm176_s;
        out1024[idx + 1697] = -resIm176_s;
        double resRe176_s = eRe176 + (oRe176 * tRe176 - oIm176 * tRe80);
        out1024[idx + 1696] = resRe176_s;
        out1024[idx + 352] = resRe176_s;
        double resRe80_s = eRe176 - (oRe176 * tRe176 - oIm176 * tRe80);
        out1024[idx + 1376] = resRe336_s;
        out1024[idx + 672] = resRe336_s;
        double resIm80_s = -eIm176 + (oRe176 * tRe80 + oIm176 * tRe176);
        out1024[idx + 673] = resIm336_s;
        out1024[idx + 1377] = -resIm336_s;
        
        double oRe177 = out1024[idx + 1378];
        double oIm177 = out1024[idx + 1379];
        double eRe177 = out1024[idx + 354];
        double eIm177 = out1024[idx + 355];
        double resIm177_s = eIm177 + (oRe177 * tRe79 + oIm177 * tRe177);
        out1024[idx + 355] = resIm177_s;
        out1024[idx + 1695] = -resIm177_s;
        double resRe177_s = eRe177 + (oRe177 * tRe177 - oIm177 * tRe79);
        out1024[idx + 1694] = resRe177_s;
        out1024[idx + 354] = resRe177_s;
        double resRe79_s = eRe177 - (oRe177 * tRe177 - oIm177 * tRe79);
        out1024[idx + 1378] = resRe335_s;
        out1024[idx + 670] = resRe335_s;
        double resIm79_s = -eIm177 + (oRe177 * tRe79 + oIm177 * tRe177);
        out1024[idx + 671] = resIm335_s;
        out1024[idx + 1379] = -resIm335_s;
        
        double oRe178 = out1024[idx + 1380];
        double oIm178 = out1024[idx + 1381];
        double eRe178 = out1024[idx + 356];
        double eIm178 = out1024[idx + 357];
        double resIm178_s = eIm178 + (oRe178 * tRe78 + oIm178 * tRe178);
        out1024[idx + 357] = resIm178_s;
        out1024[idx + 1693] = -resIm178_s;
        double resRe178_s = eRe178 + (oRe178 * tRe178 - oIm178 * tRe78);
        out1024[idx + 1692] = resRe178_s;
        out1024[idx + 356] = resRe178_s;
        double resRe78_s = eRe178 - (oRe178 * tRe178 - oIm178 * tRe78);
        out1024[idx + 1380] = resRe334_s;
        out1024[idx + 668] = resRe334_s;
        double resIm78_s = -eIm178 + (oRe178 * tRe78 + oIm178 * tRe178);
        out1024[idx + 669] = resIm334_s;
        out1024[idx + 1381] = -resIm334_s;
        
        double oRe179 = out1024[idx + 1382];
        double oIm179 = out1024[idx + 1383];
        double eRe179 = out1024[idx + 358];
        double eIm179 = out1024[idx + 359];
        double resIm179_s = eIm179 + (oRe179 * tRe77 + oIm179 * tRe179);
        out1024[idx + 359] = resIm179_s;
        out1024[idx + 1691] = -resIm179_s;
        double resRe179_s = eRe179 + (oRe179 * tRe179 - oIm179 * tRe77);
        out1024[idx + 1690] = resRe179_s;
        out1024[idx + 358] = resRe179_s;
        double resRe77_s = eRe179 - (oRe179 * tRe179 - oIm179 * tRe77);
        out1024[idx + 1382] = resRe333_s;
        out1024[idx + 666] = resRe333_s;
        double resIm77_s = -eIm179 + (oRe179 * tRe77 + oIm179 * tRe179);
        out1024[idx + 667] = resIm333_s;
        out1024[idx + 1383] = -resIm333_s;
        
        double oRe180 = out1024[idx + 1384];
        double oIm180 = out1024[idx + 1385];
        double eRe180 = out1024[idx + 360];
        double eIm180 = out1024[idx + 361];
        double resIm180_s = eIm180 + (oRe180 * tRe76 + oIm180 * tRe180);
        out1024[idx + 361] = resIm180_s;
        out1024[idx + 1689] = -resIm180_s;
        double resRe180_s = eRe180 + (oRe180 * tRe180 - oIm180 * tRe76);
        out1024[idx + 1688] = resRe180_s;
        out1024[idx + 360] = resRe180_s;
        double resRe76_s = eRe180 - (oRe180 * tRe180 - oIm180 * tRe76);
        out1024[idx + 1384] = resRe332_s;
        out1024[idx + 664] = resRe332_s;
        double resIm76_s = -eIm180 + (oRe180 * tRe76 + oIm180 * tRe180);
        out1024[idx + 665] = resIm332_s;
        out1024[idx + 1385] = -resIm332_s;
        
        double oRe181 = out1024[idx + 1386];
        double oIm181 = out1024[idx + 1387];
        double eRe181 = out1024[idx + 362];
        double eIm181 = out1024[idx + 363];
        double resIm181_s = eIm181 + (oRe181 * tRe75 + oIm181 * tRe181);
        out1024[idx + 363] = resIm181_s;
        out1024[idx + 1687] = -resIm181_s;
        double resRe181_s = eRe181 + (oRe181 * tRe181 - oIm181 * tRe75);
        out1024[idx + 1686] = resRe181_s;
        out1024[idx + 362] = resRe181_s;
        double resRe75_s = eRe181 - (oRe181 * tRe181 - oIm181 * tRe75);
        out1024[idx + 1386] = resRe331_s;
        out1024[idx + 662] = resRe331_s;
        double resIm75_s = -eIm181 + (oRe181 * tRe75 + oIm181 * tRe181);
        out1024[idx + 663] = resIm331_s;
        out1024[idx + 1387] = -resIm331_s;
        
        double oRe182 = out1024[idx + 1388];
        double oIm182 = out1024[idx + 1389];
        double eRe182 = out1024[idx + 364];
        double eIm182 = out1024[idx + 365];
        double resIm182_s = eIm182 + (oRe182 * tRe74 + oIm182 * tRe182);
        out1024[idx + 365] = resIm182_s;
        out1024[idx + 1685] = -resIm182_s;
        double resRe182_s = eRe182 + (oRe182 * tRe182 - oIm182 * tRe74);
        out1024[idx + 1684] = resRe182_s;
        out1024[idx + 364] = resRe182_s;
        double resRe74_s = eRe182 - (oRe182 * tRe182 - oIm182 * tRe74);
        out1024[idx + 1388] = resRe330_s;
        out1024[idx + 660] = resRe330_s;
        double resIm74_s = -eIm182 + (oRe182 * tRe74 + oIm182 * tRe182);
        out1024[idx + 661] = resIm330_s;
        out1024[idx + 1389] = -resIm330_s;
        
        double oRe183 = out1024[idx + 1390];
        double oIm183 = out1024[idx + 1391];
        double eRe183 = out1024[idx + 366];
        double eIm183 = out1024[idx + 367];
        double resIm183_s = eIm183 + (oRe183 * tRe73 + oIm183 * tRe183);
        out1024[idx + 367] = resIm183_s;
        out1024[idx + 1683] = -resIm183_s;
        double resRe183_s = eRe183 + (oRe183 * tRe183 - oIm183 * tRe73);
        out1024[idx + 1682] = resRe183_s;
        out1024[idx + 366] = resRe183_s;
        double resRe73_s = eRe183 - (oRe183 * tRe183 - oIm183 * tRe73);
        out1024[idx + 1390] = resRe329_s;
        out1024[idx + 658] = resRe329_s;
        double resIm73_s = -eIm183 + (oRe183 * tRe73 + oIm183 * tRe183);
        out1024[idx + 659] = resIm329_s;
        out1024[idx + 1391] = -resIm329_s;
        
        double oRe184 = out1024[idx + 1392];
        double oIm184 = out1024[idx + 1393];
        double eRe184 = out1024[idx + 368];
        double eIm184 = out1024[idx + 369];
        double resIm184_s = eIm184 + (oRe184 * tRe72 + oIm184 * tRe184);
        out1024[idx + 369] = resIm184_s;
        out1024[idx + 1681] = -resIm184_s;
        double resRe184_s = eRe184 + (oRe184 * tRe184 - oIm184 * tRe72);
        out1024[idx + 1680] = resRe184_s;
        out1024[idx + 368] = resRe184_s;
        double resRe72_s = eRe184 - (oRe184 * tRe184 - oIm184 * tRe72);
        out1024[idx + 1392] = resRe328_s;
        out1024[idx + 656] = resRe328_s;
        double resIm72_s = -eIm184 + (oRe184 * tRe72 + oIm184 * tRe184);
        out1024[idx + 657] = resIm328_s;
        out1024[idx + 1393] = -resIm328_s;
        
        double oRe185 = out1024[idx + 1394];
        double oIm185 = out1024[idx + 1395];
        double eRe185 = out1024[idx + 370];
        double eIm185 = out1024[idx + 371];
        double resIm185_s = eIm185 + (oRe185 * tRe71 + oIm185 * tRe185);
        out1024[idx + 371] = resIm185_s;
        out1024[idx + 1679] = -resIm185_s;
        double resRe185_s = eRe185 + (oRe185 * tRe185 - oIm185 * tRe71);
        out1024[idx + 1678] = resRe185_s;
        out1024[idx + 370] = resRe185_s;
        double resRe71_s = eRe185 - (oRe185 * tRe185 - oIm185 * tRe71);
        out1024[idx + 1394] = resRe327_s;
        out1024[idx + 654] = resRe327_s;
        double resIm71_s = -eIm185 + (oRe185 * tRe71 + oIm185 * tRe185);
        out1024[idx + 655] = resIm327_s;
        out1024[idx + 1395] = -resIm327_s;
        
        double oRe186 = out1024[idx + 1396];
        double oIm186 = out1024[idx + 1397];
        double eRe186 = out1024[idx + 372];
        double eIm186 = out1024[idx + 373];
        double resIm186_s = eIm186 + (oRe186 * tRe70 + oIm186 * tRe186);
        out1024[idx + 373] = resIm186_s;
        out1024[idx + 1677] = -resIm186_s;
        double resRe186_s = eRe186 + (oRe186 * tRe186 - oIm186 * tRe70);
        out1024[idx + 1676] = resRe186_s;
        out1024[idx + 372] = resRe186_s;
        double resRe70_s = eRe186 - (oRe186 * tRe186 - oIm186 * tRe70);
        out1024[idx + 1396] = resRe326_s;
        out1024[idx + 652] = resRe326_s;
        double resIm70_s = -eIm186 + (oRe186 * tRe70 + oIm186 * tRe186);
        out1024[idx + 653] = resIm326_s;
        out1024[idx + 1397] = -resIm326_s;
        
        double oRe187 = out1024[idx + 1398];
        double oIm187 = out1024[idx + 1399];
        double eRe187 = out1024[idx + 374];
        double eIm187 = out1024[idx + 375];
        double resIm187_s = eIm187 + (oRe187 * tRe69 + oIm187 * tRe187);
        out1024[idx + 375] = resIm187_s;
        out1024[idx + 1675] = -resIm187_s;
        double resRe187_s = eRe187 + (oRe187 * tRe187 - oIm187 * tRe69);
        out1024[idx + 1674] = resRe187_s;
        out1024[idx + 374] = resRe187_s;
        double resRe69_s = eRe187 - (oRe187 * tRe187 - oIm187 * tRe69);
        out1024[idx + 1398] = resRe325_s;
        out1024[idx + 650] = resRe325_s;
        double resIm69_s = -eIm187 + (oRe187 * tRe69 + oIm187 * tRe187);
        out1024[idx + 651] = resIm325_s;
        out1024[idx + 1399] = -resIm325_s;
        
        double oRe188 = out1024[idx + 1400];
        double oIm188 = out1024[idx + 1401];
        double eRe188 = out1024[idx + 376];
        double eIm188 = out1024[idx + 377];
        double resIm188_s = eIm188 + (oRe188 * tRe68 + oIm188 * tRe188);
        out1024[idx + 377] = resIm188_s;
        out1024[idx + 1673] = -resIm188_s;
        double resRe188_s = eRe188 + (oRe188 * tRe188 - oIm188 * tRe68);
        out1024[idx + 1672] = resRe188_s;
        out1024[idx + 376] = resRe188_s;
        double resRe68_s = eRe188 - (oRe188 * tRe188 - oIm188 * tRe68);
        out1024[idx + 1400] = resRe324_s;
        out1024[idx + 648] = resRe324_s;
        double resIm68_s = -eIm188 + (oRe188 * tRe68 + oIm188 * tRe188);
        out1024[idx + 649] = resIm324_s;
        out1024[idx + 1401] = -resIm324_s;
        
        double oRe189 = out1024[idx + 1402];
        double oIm189 = out1024[idx + 1403];
        double eRe189 = out1024[idx + 378];
        double eIm189 = out1024[idx + 379];
        double resIm189_s = eIm189 + (oRe189 * tRe67 + oIm189 * tRe189);
        out1024[idx + 379] = resIm189_s;
        out1024[idx + 1671] = -resIm189_s;
        double resRe189_s = eRe189 + (oRe189 * tRe189 - oIm189 * tRe67);
        out1024[idx + 1670] = resRe189_s;
        out1024[idx + 378] = resRe189_s;
        double resRe67_s = eRe189 - (oRe189 * tRe189 - oIm189 * tRe67);
        out1024[idx + 1402] = resRe323_s;
        out1024[idx + 646] = resRe323_s;
        double resIm67_s = -eIm189 + (oRe189 * tRe67 + oIm189 * tRe189);
        out1024[idx + 647] = resIm323_s;
        out1024[idx + 1403] = -resIm323_s;
        
        double oRe190 = out1024[idx + 1404];
        double oIm190 = out1024[idx + 1405];
        double eRe190 = out1024[idx + 380];
        double eIm190 = out1024[idx + 381];
        double resIm190_s = eIm190 + (oRe190 * tRe66 + oIm190 * tRe190);
        out1024[idx + 381] = resIm190_s;
        out1024[idx + 1669] = -resIm190_s;
        double resRe190_s = eRe190 + (oRe190 * tRe190 - oIm190 * tRe66);
        out1024[idx + 1668] = resRe190_s;
        out1024[idx + 380] = resRe190_s;
        double resRe66_s = eRe190 - (oRe190 * tRe190 - oIm190 * tRe66);
        out1024[idx + 1404] = resRe322_s;
        out1024[idx + 644] = resRe322_s;
        double resIm66_s = -eIm190 + (oRe190 * tRe66 + oIm190 * tRe190);
        out1024[idx + 645] = resIm322_s;
        out1024[idx + 1405] = -resIm322_s;
        
        double oRe191 = out1024[idx + 1406];
        double oIm191 = out1024[idx + 1407];
        double eRe191 = out1024[idx + 382];
        double eIm191 = out1024[idx + 383];
        double resIm191_s = eIm191 + (oRe191 * tRe65 + oIm191 * tRe191);
        out1024[idx + 383] = resIm191_s;
        out1024[idx + 1667] = -resIm191_s;
        double resRe191_s = eRe191 + (oRe191 * tRe191 - oIm191 * tRe65);
        out1024[idx + 1666] = resRe191_s;
        out1024[idx + 382] = resRe191_s;
        double resRe65_s = eRe191 - (oRe191 * tRe191 - oIm191 * tRe65);
        out1024[idx + 1406] = resRe321_s;
        out1024[idx + 642] = resRe321_s;
        double resIm65_s = -eIm191 + (oRe191 * tRe65 + oIm191 * tRe191);
        out1024[idx + 643] = resIm321_s;
        out1024[idx + 1407] = -resIm321_s;
        
        double oRe192 = out1024[idx + 1408];
        double oIm192 = out1024[idx + 1409];
        double eRe192 = out1024[idx + 384];
        double eIm192 = out1024[idx + 385];
        double resIm192_s = eIm192 + (oRe192 * tRe64 + oIm192 * tRe192);
        out1024[idx + 385] = resIm192_s;
        out1024[idx + 1665] = -resIm192_s;
        double resRe192_s = eRe192 + (oRe192 * tRe192 - oIm192 * tRe64);
        out1024[idx + 1664] = resRe192_s;
        out1024[idx + 384] = resRe192_s;
        double resRe64_s = eRe192 - (oRe192 * tRe192 - oIm192 * tRe64);
        out1024[idx + 1408] = resRe320_s;
        out1024[idx + 640] = resRe320_s;
        double resIm64_s = -eIm192 + (oRe192 * tRe64 + oIm192 * tRe192);
        out1024[idx + 641] = resIm320_s;
        out1024[idx + 1409] = -resIm320_s;
        
        double oRe193 = out1024[idx + 1410];
        double oIm193 = out1024[idx + 1411];
        double eRe193 = out1024[idx + 386];
        double eIm193 = out1024[idx + 387];
        double resIm193_s = eIm193 + (oRe193 * tRe63 + oIm193 * tRe193);
        out1024[idx + 387] = resIm193_s;
        out1024[idx + 1663] = -resIm193_s;
        double resRe193_s = eRe193 + (oRe193 * tRe193 - oIm193 * tRe63);
        out1024[idx + 1662] = resRe193_s;
        out1024[idx + 386] = resRe193_s;
        double resRe63_s = eRe193 - (oRe193 * tRe193 - oIm193 * tRe63);
        out1024[idx + 1410] = resRe319_s;
        out1024[idx + 638] = resRe319_s;
        double resIm63_s = -eIm193 + (oRe193 * tRe63 + oIm193 * tRe193);
        out1024[idx + 639] = resIm319_s;
        out1024[idx + 1411] = -resIm319_s;
        
        double oRe194 = out1024[idx + 1412];
        double oIm194 = out1024[idx + 1413];
        double eRe194 = out1024[idx + 388];
        double eIm194 = out1024[idx + 389];
        double resIm194_s = eIm194 + (oRe194 * tRe62 + oIm194 * tRe194);
        out1024[idx + 389] = resIm194_s;
        out1024[idx + 1661] = -resIm194_s;
        double resRe194_s = eRe194 + (oRe194 * tRe194 - oIm194 * tRe62);
        out1024[idx + 1660] = resRe194_s;
        out1024[idx + 388] = resRe194_s;
        double resRe62_s = eRe194 - (oRe194 * tRe194 - oIm194 * tRe62);
        out1024[idx + 1412] = resRe318_s;
        out1024[idx + 636] = resRe318_s;
        double resIm62_s = -eIm194 + (oRe194 * tRe62 + oIm194 * tRe194);
        out1024[idx + 637] = resIm318_s;
        out1024[idx + 1413] = -resIm318_s;
        
        double oRe195 = out1024[idx + 1414];
        double oIm195 = out1024[idx + 1415];
        double eRe195 = out1024[idx + 390];
        double eIm195 = out1024[idx + 391];
        double resIm195_s = eIm195 + (oRe195 * tRe61 + oIm195 * tRe195);
        out1024[idx + 391] = resIm195_s;
        out1024[idx + 1659] = -resIm195_s;
        double resRe195_s = eRe195 + (oRe195 * tRe195 - oIm195 * tRe61);
        out1024[idx + 1658] = resRe195_s;
        out1024[idx + 390] = resRe195_s;
        double resRe61_s = eRe195 - (oRe195 * tRe195 - oIm195 * tRe61);
        out1024[idx + 1414] = resRe317_s;
        out1024[idx + 634] = resRe317_s;
        double resIm61_s = -eIm195 + (oRe195 * tRe61 + oIm195 * tRe195);
        out1024[idx + 635] = resIm317_s;
        out1024[idx + 1415] = -resIm317_s;
        
        double oRe196 = out1024[idx + 1416];
        double oIm196 = out1024[idx + 1417];
        double eRe196 = out1024[idx + 392];
        double eIm196 = out1024[idx + 393];
        double resIm196_s = eIm196 + (oRe196 * tRe60 + oIm196 * tRe196);
        out1024[idx + 393] = resIm196_s;
        out1024[idx + 1657] = -resIm196_s;
        double resRe196_s = eRe196 + (oRe196 * tRe196 - oIm196 * tRe60);
        out1024[idx + 1656] = resRe196_s;
        out1024[idx + 392] = resRe196_s;
        double resRe60_s = eRe196 - (oRe196 * tRe196 - oIm196 * tRe60);
        out1024[idx + 1416] = resRe316_s;
        out1024[idx + 632] = resRe316_s;
        double resIm60_s = -eIm196 + (oRe196 * tRe60 + oIm196 * tRe196);
        out1024[idx + 633] = resIm316_s;
        out1024[idx + 1417] = -resIm316_s;
        
        double oRe197 = out1024[idx + 1418];
        double oIm197 = out1024[idx + 1419];
        double eRe197 = out1024[idx + 394];
        double eIm197 = out1024[idx + 395];
        double resIm197_s = eIm197 + (oRe197 * tRe59 + oIm197 * tRe197);
        out1024[idx + 395] = resIm197_s;
        out1024[idx + 1655] = -resIm197_s;
        double resRe197_s = eRe197 + (oRe197 * tRe197 - oIm197 * tRe59);
        out1024[idx + 1654] = resRe197_s;
        out1024[idx + 394] = resRe197_s;
        double resRe59_s = eRe197 - (oRe197 * tRe197 - oIm197 * tRe59);
        out1024[idx + 1418] = resRe315_s;
        out1024[idx + 630] = resRe315_s;
        double resIm59_s = -eIm197 + (oRe197 * tRe59 + oIm197 * tRe197);
        out1024[idx + 631] = resIm315_s;
        out1024[idx + 1419] = -resIm315_s;
        
        double oRe198 = out1024[idx + 1420];
        double oIm198 = out1024[idx + 1421];
        double eRe198 = out1024[idx + 396];
        double eIm198 = out1024[idx + 397];
        double resIm198_s = eIm198 + (oRe198 * tRe58 + oIm198 * tRe198);
        out1024[idx + 397] = resIm198_s;
        out1024[idx + 1653] = -resIm198_s;
        double resRe198_s = eRe198 + (oRe198 * tRe198 - oIm198 * tRe58);
        out1024[idx + 1652] = resRe198_s;
        out1024[idx + 396] = resRe198_s;
        double resRe58_s = eRe198 - (oRe198 * tRe198 - oIm198 * tRe58);
        out1024[idx + 1420] = resRe314_s;
        out1024[idx + 628] = resRe314_s;
        double resIm58_s = -eIm198 + (oRe198 * tRe58 + oIm198 * tRe198);
        out1024[idx + 629] = resIm314_s;
        out1024[idx + 1421] = -resIm314_s;
        
        double oRe199 = out1024[idx + 1422];
        double oIm199 = out1024[idx + 1423];
        double eRe199 = out1024[idx + 398];
        double eIm199 = out1024[idx + 399];
        double resIm199_s = eIm199 + (oRe199 * tRe57 + oIm199 * tRe199);
        out1024[idx + 399] = resIm199_s;
        out1024[idx + 1651] = -resIm199_s;
        double resRe199_s = eRe199 + (oRe199 * tRe199 - oIm199 * tRe57);
        out1024[idx + 1650] = resRe199_s;
        out1024[idx + 398] = resRe199_s;
        double resRe57_s = eRe199 - (oRe199 * tRe199 - oIm199 * tRe57);
        out1024[idx + 1422] = resRe313_s;
        out1024[idx + 626] = resRe313_s;
        double resIm57_s = -eIm199 + (oRe199 * tRe57 + oIm199 * tRe199);
        out1024[idx + 627] = resIm313_s;
        out1024[idx + 1423] = -resIm313_s;
        
        double oRe200 = out1024[idx + 1424];
        double oIm200 = out1024[idx + 1425];
        double eRe200 = out1024[idx + 400];
        double eIm200 = out1024[idx + 401];
        double resIm200_s = eIm200 + (oRe200 * tRe56 + oIm200 * tRe200);
        out1024[idx + 401] = resIm200_s;
        out1024[idx + 1649] = -resIm200_s;
        double resRe200_s = eRe200 + (oRe200 * tRe200 - oIm200 * tRe56);
        out1024[idx + 1648] = resRe200_s;
        out1024[idx + 400] = resRe200_s;
        double resRe56_s = eRe200 - (oRe200 * tRe200 - oIm200 * tRe56);
        out1024[idx + 1424] = resRe312_s;
        out1024[idx + 624] = resRe312_s;
        double resIm56_s = -eIm200 + (oRe200 * tRe56 + oIm200 * tRe200);
        out1024[idx + 625] = resIm312_s;
        out1024[idx + 1425] = -resIm312_s;
        
        double oRe201 = out1024[idx + 1426];
        double oIm201 = out1024[idx + 1427];
        double eRe201 = out1024[idx + 402];
        double eIm201 = out1024[idx + 403];
        double resIm201_s = eIm201 + (oRe201 * tRe55 + oIm201 * tRe201);
        out1024[idx + 403] = resIm201_s;
        out1024[idx + 1647] = -resIm201_s;
        double resRe201_s = eRe201 + (oRe201 * tRe201 - oIm201 * tRe55);
        out1024[idx + 1646] = resRe201_s;
        out1024[idx + 402] = resRe201_s;
        double resRe55_s = eRe201 - (oRe201 * tRe201 - oIm201 * tRe55);
        out1024[idx + 1426] = resRe311_s;
        out1024[idx + 622] = resRe311_s;
        double resIm55_s = -eIm201 + (oRe201 * tRe55 + oIm201 * tRe201);
        out1024[idx + 623] = resIm311_s;
        out1024[idx + 1427] = -resIm311_s;
        
        double oRe202 = out1024[idx + 1428];
        double oIm202 = out1024[idx + 1429];
        double eRe202 = out1024[idx + 404];
        double eIm202 = out1024[idx + 405];
        double resIm202_s = eIm202 + (oRe202 * tRe54 + oIm202 * tRe202);
        out1024[idx + 405] = resIm202_s;
        out1024[idx + 1645] = -resIm202_s;
        double resRe202_s = eRe202 + (oRe202 * tRe202 - oIm202 * tRe54);
        out1024[idx + 1644] = resRe202_s;
        out1024[idx + 404] = resRe202_s;
        double resRe54_s = eRe202 - (oRe202 * tRe202 - oIm202 * tRe54);
        out1024[idx + 1428] = resRe310_s;
        out1024[idx + 620] = resRe310_s;
        double resIm54_s = -eIm202 + (oRe202 * tRe54 + oIm202 * tRe202);
        out1024[idx + 621] = resIm310_s;
        out1024[idx + 1429] = -resIm310_s;
        
        double oRe203 = out1024[idx + 1430];
        double oIm203 = out1024[idx + 1431];
        double eRe203 = out1024[idx + 406];
        double eIm203 = out1024[idx + 407];
        double resIm203_s = eIm203 + (oRe203 * tRe53 + oIm203 * tRe203);
        out1024[idx + 407] = resIm203_s;
        out1024[idx + 1643] = -resIm203_s;
        double resRe203_s = eRe203 + (oRe203 * tRe203 - oIm203 * tRe53);
        out1024[idx + 1642] = resRe203_s;
        out1024[idx + 406] = resRe203_s;
        double resRe53_s = eRe203 - (oRe203 * tRe203 - oIm203 * tRe53);
        out1024[idx + 1430] = resRe309_s;
        out1024[idx + 618] = resRe309_s;
        double resIm53_s = -eIm203 + (oRe203 * tRe53 + oIm203 * tRe203);
        out1024[idx + 619] = resIm309_s;
        out1024[idx + 1431] = -resIm309_s;
        
        double oRe204 = out1024[idx + 1432];
        double oIm204 = out1024[idx + 1433];
        double eRe204 = out1024[idx + 408];
        double eIm204 = out1024[idx + 409];
        double resIm204_s = eIm204 + (oRe204 * tRe52 + oIm204 * tRe204);
        out1024[idx + 409] = resIm204_s;
        out1024[idx + 1641] = -resIm204_s;
        double resRe204_s = eRe204 + (oRe204 * tRe204 - oIm204 * tRe52);
        out1024[idx + 1640] = resRe204_s;
        out1024[idx + 408] = resRe204_s;
        double resRe52_s = eRe204 - (oRe204 * tRe204 - oIm204 * tRe52);
        out1024[idx + 1432] = resRe308_s;
        out1024[idx + 616] = resRe308_s;
        double resIm52_s = -eIm204 + (oRe204 * tRe52 + oIm204 * tRe204);
        out1024[idx + 617] = resIm308_s;
        out1024[idx + 1433] = -resIm308_s;
        
        double oRe205 = out1024[idx + 1434];
        double oIm205 = out1024[idx + 1435];
        double eRe205 = out1024[idx + 410];
        double eIm205 = out1024[idx + 411];
        double resIm205_s = eIm205 + (oRe205 * tRe51 + oIm205 * tRe205);
        out1024[idx + 411] = resIm205_s;
        out1024[idx + 1639] = -resIm205_s;
        double resRe205_s = eRe205 + (oRe205 * tRe205 - oIm205 * tRe51);
        out1024[idx + 1638] = resRe205_s;
        out1024[idx + 410] = resRe205_s;
        double resRe51_s = eRe205 - (oRe205 * tRe205 - oIm205 * tRe51);
        out1024[idx + 1434] = resRe307_s;
        out1024[idx + 614] = resRe307_s;
        double resIm51_s = -eIm205 + (oRe205 * tRe51 + oIm205 * tRe205);
        out1024[idx + 615] = resIm307_s;
        out1024[idx + 1435] = -resIm307_s;
        
        double oRe206 = out1024[idx + 1436];
        double oIm206 = out1024[idx + 1437];
        double eRe206 = out1024[idx + 412];
        double eIm206 = out1024[idx + 413];
        double resIm206_s = eIm206 + (oRe206 * tRe50 + oIm206 * tRe206);
        out1024[idx + 413] = resIm206_s;
        out1024[idx + 1637] = -resIm206_s;
        double resRe206_s = eRe206 + (oRe206 * tRe206 - oIm206 * tRe50);
        out1024[idx + 1636] = resRe206_s;
        out1024[idx + 412] = resRe206_s;
        double resRe50_s = eRe206 - (oRe206 * tRe206 - oIm206 * tRe50);
        out1024[idx + 1436] = resRe306_s;
        out1024[idx + 612] = resRe306_s;
        double resIm50_s = -eIm206 + (oRe206 * tRe50 + oIm206 * tRe206);
        out1024[idx + 613] = resIm306_s;
        out1024[idx + 1437] = -resIm306_s;
        
        double oRe207 = out1024[idx + 1438];
        double oIm207 = out1024[idx + 1439];
        double eRe207 = out1024[idx + 414];
        double eIm207 = out1024[idx + 415];
        double resIm207_s = eIm207 + (oRe207 * tRe49 + oIm207 * tRe207);
        out1024[idx + 415] = resIm207_s;
        out1024[idx + 1635] = -resIm207_s;
        double resRe207_s = eRe207 + (oRe207 * tRe207 - oIm207 * tRe49);
        out1024[idx + 1634] = resRe207_s;
        out1024[idx + 414] = resRe207_s;
        double resRe49_s = eRe207 - (oRe207 * tRe207 - oIm207 * tRe49);
        out1024[idx + 1438] = resRe305_s;
        out1024[idx + 610] = resRe305_s;
        double resIm49_s = -eIm207 + (oRe207 * tRe49 + oIm207 * tRe207);
        out1024[idx + 611] = resIm305_s;
        out1024[idx + 1439] = -resIm305_s;
        
        double oRe208 = out1024[idx + 1440];
        double oIm208 = out1024[idx + 1441];
        double eRe208 = out1024[idx + 416];
        double eIm208 = out1024[idx + 417];
        double resIm208_s = eIm208 + (oRe208 * tRe48 + oIm208 * tRe208);
        out1024[idx + 417] = resIm208_s;
        out1024[idx + 1633] = -resIm208_s;
        double resRe208_s = eRe208 + (oRe208 * tRe208 - oIm208 * tRe48);
        out1024[idx + 1632] = resRe208_s;
        out1024[idx + 416] = resRe208_s;
        double resRe48_s = eRe208 - (oRe208 * tRe208 - oIm208 * tRe48);
        out1024[idx + 1440] = resRe304_s;
        out1024[idx + 608] = resRe304_s;
        double resIm48_s = -eIm208 + (oRe208 * tRe48 + oIm208 * tRe208);
        out1024[idx + 609] = resIm304_s;
        out1024[idx + 1441] = -resIm304_s;
        
        double oRe209 = out1024[idx + 1442];
        double oIm209 = out1024[idx + 1443];
        double eRe209 = out1024[idx + 418];
        double eIm209 = out1024[idx + 419];
        double resIm209_s = eIm209 + (oRe209 * tRe47 + oIm209 * tRe209);
        out1024[idx + 419] = resIm209_s;
        out1024[idx + 1631] = -resIm209_s;
        double resRe209_s = eRe209 + (oRe209 * tRe209 - oIm209 * tRe47);
        out1024[idx + 1630] = resRe209_s;
        out1024[idx + 418] = resRe209_s;
        double resRe47_s = eRe209 - (oRe209 * tRe209 - oIm209 * tRe47);
        out1024[idx + 1442] = resRe303_s;
        out1024[idx + 606] = resRe303_s;
        double resIm47_s = -eIm209 + (oRe209 * tRe47 + oIm209 * tRe209);
        out1024[idx + 607] = resIm303_s;
        out1024[idx + 1443] = -resIm303_s;
        
        double oRe210 = out1024[idx + 1444];
        double oIm210 = out1024[idx + 1445];
        double eRe210 = out1024[idx + 420];
        double eIm210 = out1024[idx + 421];
        double resIm210_s = eIm210 + (oRe210 * tRe46 + oIm210 * tRe210);
        out1024[idx + 421] = resIm210_s;
        out1024[idx + 1629] = -resIm210_s;
        double resRe210_s = eRe210 + (oRe210 * tRe210 - oIm210 * tRe46);
        out1024[idx + 1628] = resRe210_s;
        out1024[idx + 420] = resRe210_s;
        double resRe46_s = eRe210 - (oRe210 * tRe210 - oIm210 * tRe46);
        out1024[idx + 1444] = resRe302_s;
        out1024[idx + 604] = resRe302_s;
        double resIm46_s = -eIm210 + (oRe210 * tRe46 + oIm210 * tRe210);
        out1024[idx + 605] = resIm302_s;
        out1024[idx + 1445] = -resIm302_s;
        
        double oRe211 = out1024[idx + 1446];
        double oIm211 = out1024[idx + 1447];
        double eRe211 = out1024[idx + 422];
        double eIm211 = out1024[idx + 423];
        double resIm211_s = eIm211 + (oRe211 * tRe45 + oIm211 * tRe211);
        out1024[idx + 423] = resIm211_s;
        out1024[idx + 1627] = -resIm211_s;
        double resRe211_s = eRe211 + (oRe211 * tRe211 - oIm211 * tRe45);
        out1024[idx + 1626] = resRe211_s;
        out1024[idx + 422] = resRe211_s;
        double resRe45_s = eRe211 - (oRe211 * tRe211 - oIm211 * tRe45);
        out1024[idx + 1446] = resRe301_s;
        out1024[idx + 602] = resRe301_s;
        double resIm45_s = -eIm211 + (oRe211 * tRe45 + oIm211 * tRe211);
        out1024[idx + 603] = resIm301_s;
        out1024[idx + 1447] = -resIm301_s;
        
        double oRe212 = out1024[idx + 1448];
        double oIm212 = out1024[idx + 1449];
        double eRe212 = out1024[idx + 424];
        double eIm212 = out1024[idx + 425];
        double resIm212_s = eIm212 + (oRe212 * tRe44 + oIm212 * tRe212);
        out1024[idx + 425] = resIm212_s;
        out1024[idx + 1625] = -resIm212_s;
        double resRe212_s = eRe212 + (oRe212 * tRe212 - oIm212 * tRe44);
        out1024[idx + 1624] = resRe212_s;
        out1024[idx + 424] = resRe212_s;
        double resRe44_s = eRe212 - (oRe212 * tRe212 - oIm212 * tRe44);
        out1024[idx + 1448] = resRe300_s;
        out1024[idx + 600] = resRe300_s;
        double resIm44_s = -eIm212 + (oRe212 * tRe44 + oIm212 * tRe212);
        out1024[idx + 601] = resIm300_s;
        out1024[idx + 1449] = -resIm300_s;
        
        double oRe213 = out1024[idx + 1450];
        double oIm213 = out1024[idx + 1451];
        double eRe213 = out1024[idx + 426];
        double eIm213 = out1024[idx + 427];
        double resIm213_s = eIm213 + (oRe213 * tRe43 + oIm213 * tRe213);
        out1024[idx + 427] = resIm213_s;
        out1024[idx + 1623] = -resIm213_s;
        double resRe213_s = eRe213 + (oRe213 * tRe213 - oIm213 * tRe43);
        out1024[idx + 1622] = resRe213_s;
        out1024[idx + 426] = resRe213_s;
        double resRe43_s = eRe213 - (oRe213 * tRe213 - oIm213 * tRe43);
        out1024[idx + 1450] = resRe299_s;
        out1024[idx + 598] = resRe299_s;
        double resIm43_s = -eIm213 + (oRe213 * tRe43 + oIm213 * tRe213);
        out1024[idx + 599] = resIm299_s;
        out1024[idx + 1451] = -resIm299_s;
        
        double oRe214 = out1024[idx + 1452];
        double oIm214 = out1024[idx + 1453];
        double eRe214 = out1024[idx + 428];
        double eIm214 = out1024[idx + 429];
        double resIm214_s = eIm214 + (oRe214 * tRe42 + oIm214 * tRe214);
        out1024[idx + 429] = resIm214_s;
        out1024[idx + 1621] = -resIm214_s;
        double resRe214_s = eRe214 + (oRe214 * tRe214 - oIm214 * tRe42);
        out1024[idx + 1620] = resRe214_s;
        out1024[idx + 428] = resRe214_s;
        double resRe42_s = eRe214 - (oRe214 * tRe214 - oIm214 * tRe42);
        out1024[idx + 1452] = resRe298_s;
        out1024[idx + 596] = resRe298_s;
        double resIm42_s = -eIm214 + (oRe214 * tRe42 + oIm214 * tRe214);
        out1024[idx + 597] = resIm298_s;
        out1024[idx + 1453] = -resIm298_s;
        
        double oRe215 = out1024[idx + 1454];
        double oIm215 = out1024[idx + 1455];
        double eRe215 = out1024[idx + 430];
        double eIm215 = out1024[idx + 431];
        double resIm215_s = eIm215 + (oRe215 * tRe41 + oIm215 * tRe215);
        out1024[idx + 431] = resIm215_s;
        out1024[idx + 1619] = -resIm215_s;
        double resRe215_s = eRe215 + (oRe215 * tRe215 - oIm215 * tRe41);
        out1024[idx + 1618] = resRe215_s;
        out1024[idx + 430] = resRe215_s;
        double resRe41_s = eRe215 - (oRe215 * tRe215 - oIm215 * tRe41);
        out1024[idx + 1454] = resRe297_s;
        out1024[idx + 594] = resRe297_s;
        double resIm41_s = -eIm215 + (oRe215 * tRe41 + oIm215 * tRe215);
        out1024[idx + 595] = resIm297_s;
        out1024[idx + 1455] = -resIm297_s;
        
        double oRe216 = out1024[idx + 1456];
        double oIm216 = out1024[idx + 1457];
        double eRe216 = out1024[idx + 432];
        double eIm216 = out1024[idx + 433];
        double resIm216_s = eIm216 + (oRe216 * tRe40 + oIm216 * tRe216);
        out1024[idx + 433] = resIm216_s;
        out1024[idx + 1617] = -resIm216_s;
        double resRe216_s = eRe216 + (oRe216 * tRe216 - oIm216 * tRe40);
        out1024[idx + 1616] = resRe216_s;
        out1024[idx + 432] = resRe216_s;
        double resRe40_s = eRe216 - (oRe216 * tRe216 - oIm216 * tRe40);
        out1024[idx + 1456] = resRe296_s;
        out1024[idx + 592] = resRe296_s;
        double resIm40_s = -eIm216 + (oRe216 * tRe40 + oIm216 * tRe216);
        out1024[idx + 593] = resIm296_s;
        out1024[idx + 1457] = -resIm296_s;
        
        double oRe217 = out1024[idx + 1458];
        double oIm217 = out1024[idx + 1459];
        double eRe217 = out1024[idx + 434];
        double eIm217 = out1024[idx + 435];
        double resIm217_s = eIm217 + (oRe217 * tRe39 + oIm217 * tRe217);
        out1024[idx + 435] = resIm217_s;
        out1024[idx + 1615] = -resIm217_s;
        double resRe217_s = eRe217 + (oRe217 * tRe217 - oIm217 * tRe39);
        out1024[idx + 1614] = resRe217_s;
        out1024[idx + 434] = resRe217_s;
        double resRe39_s = eRe217 - (oRe217 * tRe217 - oIm217 * tRe39);
        out1024[idx + 1458] = resRe295_s;
        out1024[idx + 590] = resRe295_s;
        double resIm39_s = -eIm217 + (oRe217 * tRe39 + oIm217 * tRe217);
        out1024[idx + 591] = resIm295_s;
        out1024[idx + 1459] = -resIm295_s;
        
        double oRe218 = out1024[idx + 1460];
        double oIm218 = out1024[idx + 1461];
        double eRe218 = out1024[idx + 436];
        double eIm218 = out1024[idx + 437];
        double resIm218_s = eIm218 + (oRe218 * tRe38 + oIm218 * tRe218);
        out1024[idx + 437] = resIm218_s;
        out1024[idx + 1613] = -resIm218_s;
        double resRe218_s = eRe218 + (oRe218 * tRe218 - oIm218 * tRe38);
        out1024[idx + 1612] = resRe218_s;
        out1024[idx + 436] = resRe218_s;
        double resRe38_s = eRe218 - (oRe218 * tRe218 - oIm218 * tRe38);
        out1024[idx + 1460] = resRe294_s;
        out1024[idx + 588] = resRe294_s;
        double resIm38_s = -eIm218 + (oRe218 * tRe38 + oIm218 * tRe218);
        out1024[idx + 589] = resIm294_s;
        out1024[idx + 1461] = -resIm294_s;
        
        double oRe219 = out1024[idx + 1462];
        double oIm219 = out1024[idx + 1463];
        double eRe219 = out1024[idx + 438];
        double eIm219 = out1024[idx + 439];
        double resIm219_s = eIm219 + (oRe219 * tRe37 + oIm219 * tRe219);
        out1024[idx + 439] = resIm219_s;
        out1024[idx + 1611] = -resIm219_s;
        double resRe219_s = eRe219 + (oRe219 * tRe219 - oIm219 * tRe37);
        out1024[idx + 1610] = resRe219_s;
        out1024[idx + 438] = resRe219_s;
        double resRe37_s = eRe219 - (oRe219 * tRe219 - oIm219 * tRe37);
        out1024[idx + 1462] = resRe293_s;
        out1024[idx + 586] = resRe293_s;
        double resIm37_s = -eIm219 + (oRe219 * tRe37 + oIm219 * tRe219);
        out1024[idx + 587] = resIm293_s;
        out1024[idx + 1463] = -resIm293_s;
        
        double oRe220 = out1024[idx + 1464];
        double oIm220 = out1024[idx + 1465];
        double eRe220 = out1024[idx + 440];
        double eIm220 = out1024[idx + 441];
        double resIm220_s = eIm220 + (oRe220 * tRe36 + oIm220 * tRe220);
        out1024[idx + 441] = resIm220_s;
        out1024[idx + 1609] = -resIm220_s;
        double resRe220_s = eRe220 + (oRe220 * tRe220 - oIm220 * tRe36);
        out1024[idx + 1608] = resRe220_s;
        out1024[idx + 440] = resRe220_s;
        double resRe36_s = eRe220 - (oRe220 * tRe220 - oIm220 * tRe36);
        out1024[idx + 1464] = resRe292_s;
        out1024[idx + 584] = resRe292_s;
        double resIm36_s = -eIm220 + (oRe220 * tRe36 + oIm220 * tRe220);
        out1024[idx + 585] = resIm292_s;
        out1024[idx + 1465] = -resIm292_s;
        
        double oRe221 = out1024[idx + 1466];
        double oIm221 = out1024[idx + 1467];
        double eRe221 = out1024[idx + 442];
        double eIm221 = out1024[idx + 443];
        double resIm221_s = eIm221 + (oRe221 * tRe35 + oIm221 * tRe221);
        out1024[idx + 443] = resIm221_s;
        out1024[idx + 1607] = -resIm221_s;
        double resRe221_s = eRe221 + (oRe221 * tRe221 - oIm221 * tRe35);
        out1024[idx + 1606] = resRe221_s;
        out1024[idx + 442] = resRe221_s;
        double resRe35_s = eRe221 - (oRe221 * tRe221 - oIm221 * tRe35);
        out1024[idx + 1466] = resRe291_s;
        out1024[idx + 582] = resRe291_s;
        double resIm35_s = -eIm221 + (oRe221 * tRe35 + oIm221 * tRe221);
        out1024[idx + 583] = resIm291_s;
        out1024[idx + 1467] = -resIm291_s;
        
        double oRe222 = out1024[idx + 1468];
        double oIm222 = out1024[idx + 1469];
        double eRe222 = out1024[idx + 444];
        double eIm222 = out1024[idx + 445];
        double resIm222_s = eIm222 + (oRe222 * tRe34 + oIm222 * tRe222);
        out1024[idx + 445] = resIm222_s;
        out1024[idx + 1605] = -resIm222_s;
        double resRe222_s = eRe222 + (oRe222 * tRe222 - oIm222 * tRe34);
        out1024[idx + 1604] = resRe222_s;
        out1024[idx + 444] = resRe222_s;
        double resRe34_s = eRe222 - (oRe222 * tRe222 - oIm222 * tRe34);
        out1024[idx + 1468] = resRe290_s;
        out1024[idx + 580] = resRe290_s;
        double resIm34_s = -eIm222 + (oRe222 * tRe34 + oIm222 * tRe222);
        out1024[idx + 581] = resIm290_s;
        out1024[idx + 1469] = -resIm290_s;
        
        double oRe223 = out1024[idx + 1470];
        double oIm223 = out1024[idx + 1471];
        double eRe223 = out1024[idx + 446];
        double eIm223 = out1024[idx + 447];
        double resIm223_s = eIm223 + (oRe223 * tRe33 + oIm223 * tRe223);
        out1024[idx + 447] = resIm223_s;
        out1024[idx + 1603] = -resIm223_s;
        double resRe223_s = eRe223 + (oRe223 * tRe223 - oIm223 * tRe33);
        out1024[idx + 1602] = resRe223_s;
        out1024[idx + 446] = resRe223_s;
        double resRe33_s = eRe223 - (oRe223 * tRe223 - oIm223 * tRe33);
        out1024[idx + 1470] = resRe289_s;
        out1024[idx + 578] = resRe289_s;
        double resIm33_s = -eIm223 + (oRe223 * tRe33 + oIm223 * tRe223);
        out1024[idx + 579] = resIm289_s;
        out1024[idx + 1471] = -resIm289_s;
        
        double oRe224 = out1024[idx + 1472];
        double oIm224 = out1024[idx + 1473];
        double eRe224 = out1024[idx + 448];
        double eIm224 = out1024[idx + 449];
        double resIm224_s = eIm224 + (oRe224 * tRe32 + oIm224 * tRe224);
        out1024[idx + 449] = resIm224_s;
        out1024[idx + 1601] = -resIm224_s;
        double resRe224_s = eRe224 + (oRe224 * tRe224 - oIm224 * tRe32);
        out1024[idx + 1600] = resRe224_s;
        out1024[idx + 448] = resRe224_s;
        double resRe32_s = eRe224 - (oRe224 * tRe224 - oIm224 * tRe32);
        out1024[idx + 1472] = resRe288_s;
        out1024[idx + 576] = resRe288_s;
        double resIm32_s = -eIm224 + (oRe224 * tRe32 + oIm224 * tRe224);
        out1024[idx + 577] = resIm288_s;
        out1024[idx + 1473] = -resIm288_s;
        
        double oRe225 = out1024[idx + 1474];
        double oIm225 = out1024[idx + 1475];
        double eRe225 = out1024[idx + 450];
        double eIm225 = out1024[idx + 451];
        double resIm225_s = eIm225 + (oRe225 * tRe31 + oIm225 * tRe225);
        out1024[idx + 451] = resIm225_s;
        out1024[idx + 1599] = -resIm225_s;
        double resRe225_s = eRe225 + (oRe225 * tRe225 - oIm225 * tRe31);
        out1024[idx + 1598] = resRe225_s;
        out1024[idx + 450] = resRe225_s;
        double resRe31_s = eRe225 - (oRe225 * tRe225 - oIm225 * tRe31);
        out1024[idx + 1474] = resRe287_s;
        out1024[idx + 574] = resRe287_s;
        double resIm31_s = -eIm225 + (oRe225 * tRe31 + oIm225 * tRe225);
        out1024[idx + 575] = resIm287_s;
        out1024[idx + 1475] = -resIm287_s;
        
        double oRe226 = out1024[idx + 1476];
        double oIm226 = out1024[idx + 1477];
        double eRe226 = out1024[idx + 452];
        double eIm226 = out1024[idx + 453];
        double resIm226_s = eIm226 + (oRe226 * tRe30 + oIm226 * tRe226);
        out1024[idx + 453] = resIm226_s;
        out1024[idx + 1597] = -resIm226_s;
        double resRe226_s = eRe226 + (oRe226 * tRe226 - oIm226 * tRe30);
        out1024[idx + 1596] = resRe226_s;
        out1024[idx + 452] = resRe226_s;
        double resRe30_s = eRe226 - (oRe226 * tRe226 - oIm226 * tRe30);
        out1024[idx + 1476] = resRe286_s;
        out1024[idx + 572] = resRe286_s;
        double resIm30_s = -eIm226 + (oRe226 * tRe30 + oIm226 * tRe226);
        out1024[idx + 573] = resIm286_s;
        out1024[idx + 1477] = -resIm286_s;
        
        double oRe227 = out1024[idx + 1478];
        double oIm227 = out1024[idx + 1479];
        double eRe227 = out1024[idx + 454];
        double eIm227 = out1024[idx + 455];
        double resIm227_s = eIm227 + (oRe227 * tRe29 + oIm227 * tRe227);
        out1024[idx + 455] = resIm227_s;
        out1024[idx + 1595] = -resIm227_s;
        double resRe227_s = eRe227 + (oRe227 * tRe227 - oIm227 * tRe29);
        out1024[idx + 1594] = resRe227_s;
        out1024[idx + 454] = resRe227_s;
        double resRe29_s = eRe227 - (oRe227 * tRe227 - oIm227 * tRe29);
        out1024[idx + 1478] = resRe285_s;
        out1024[idx + 570] = resRe285_s;
        double resIm29_s = -eIm227 + (oRe227 * tRe29 + oIm227 * tRe227);
        out1024[idx + 571] = resIm285_s;
        out1024[idx + 1479] = -resIm285_s;
        
        double oRe228 = out1024[idx + 1480];
        double oIm228 = out1024[idx + 1481];
        double eRe228 = out1024[idx + 456];
        double eIm228 = out1024[idx + 457];
        double resIm228_s = eIm228 + (oRe228 * tRe28 + oIm228 * tRe228);
        out1024[idx + 457] = resIm228_s;
        out1024[idx + 1593] = -resIm228_s;
        double resRe228_s = eRe228 + (oRe228 * tRe228 - oIm228 * tRe28);
        out1024[idx + 1592] = resRe228_s;
        out1024[idx + 456] = resRe228_s;
        double resRe28_s = eRe228 - (oRe228 * tRe228 - oIm228 * tRe28);
        out1024[idx + 1480] = resRe284_s;
        out1024[idx + 568] = resRe284_s;
        double resIm28_s = -eIm228 + (oRe228 * tRe28 + oIm228 * tRe228);
        out1024[idx + 569] = resIm284_s;
        out1024[idx + 1481] = -resIm284_s;
        
        double oRe229 = out1024[idx + 1482];
        double oIm229 = out1024[idx + 1483];
        double eRe229 = out1024[idx + 458];
        double eIm229 = out1024[idx + 459];
        double resIm229_s = eIm229 + (oRe229 * tRe27 + oIm229 * tRe229);
        out1024[idx + 459] = resIm229_s;
        out1024[idx + 1591] = -resIm229_s;
        double resRe229_s = eRe229 + (oRe229 * tRe229 - oIm229 * tRe27);
        out1024[idx + 1590] = resRe229_s;
        out1024[idx + 458] = resRe229_s;
        double resRe27_s = eRe229 - (oRe229 * tRe229 - oIm229 * tRe27);
        out1024[idx + 1482] = resRe283_s;
        out1024[idx + 566] = resRe283_s;
        double resIm27_s = -eIm229 + (oRe229 * tRe27 + oIm229 * tRe229);
        out1024[idx + 567] = resIm283_s;
        out1024[idx + 1483] = -resIm283_s;
        
        double oRe230 = out1024[idx + 1484];
        double oIm230 = out1024[idx + 1485];
        double eRe230 = out1024[idx + 460];
        double eIm230 = out1024[idx + 461];
        double resIm230_s = eIm230 + (oRe230 * tRe26 + oIm230 * tRe230);
        out1024[idx + 461] = resIm230_s;
        out1024[idx + 1589] = -resIm230_s;
        double resRe230_s = eRe230 + (oRe230 * tRe230 - oIm230 * tRe26);
        out1024[idx + 1588] = resRe230_s;
        out1024[idx + 460] = resRe230_s;
        double resRe26_s = eRe230 - (oRe230 * tRe230 - oIm230 * tRe26);
        out1024[idx + 1484] = resRe282_s;
        out1024[idx + 564] = resRe282_s;
        double resIm26_s = -eIm230 + (oRe230 * tRe26 + oIm230 * tRe230);
        out1024[idx + 565] = resIm282_s;
        out1024[idx + 1485] = -resIm282_s;
        
        double oRe231 = out1024[idx + 1486];
        double oIm231 = out1024[idx + 1487];
        double eRe231 = out1024[idx + 462];
        double eIm231 = out1024[idx + 463];
        double resIm231_s = eIm231 + (oRe231 * tRe25 + oIm231 * tRe231);
        out1024[idx + 463] = resIm231_s;
        out1024[idx + 1587] = -resIm231_s;
        double resRe231_s = eRe231 + (oRe231 * tRe231 - oIm231 * tRe25);
        out1024[idx + 1586] = resRe231_s;
        out1024[idx + 462] = resRe231_s;
        double resRe25_s = eRe231 - (oRe231 * tRe231 - oIm231 * tRe25);
        out1024[idx + 1486] = resRe281_s;
        out1024[idx + 562] = resRe281_s;
        double resIm25_s = -eIm231 + (oRe231 * tRe25 + oIm231 * tRe231);
        out1024[idx + 563] = resIm281_s;
        out1024[idx + 1487] = -resIm281_s;
        
        double oRe232 = out1024[idx + 1488];
        double oIm232 = out1024[idx + 1489];
        double eRe232 = out1024[idx + 464];
        double eIm232 = out1024[idx + 465];
        double resIm232_s = eIm232 + (oRe232 * tRe24 + oIm232 * tRe232);
        out1024[idx + 465] = resIm232_s;
        out1024[idx + 1585] = -resIm232_s;
        double resRe232_s = eRe232 + (oRe232 * tRe232 - oIm232 * tRe24);
        out1024[idx + 1584] = resRe232_s;
        out1024[idx + 464] = resRe232_s;
        double resRe24_s = eRe232 - (oRe232 * tRe232 - oIm232 * tRe24);
        out1024[idx + 1488] = resRe280_s;
        out1024[idx + 560] = resRe280_s;
        double resIm24_s = -eIm232 + (oRe232 * tRe24 + oIm232 * tRe232);
        out1024[idx + 561] = resIm280_s;
        out1024[idx + 1489] = -resIm280_s;
        
        double oRe233 = out1024[idx + 1490];
        double oIm233 = out1024[idx + 1491];
        double eRe233 = out1024[idx + 466];
        double eIm233 = out1024[idx + 467];
        double resIm233_s = eIm233 + (oRe233 * tRe23 + oIm233 * tRe233);
        out1024[idx + 467] = resIm233_s;
        out1024[idx + 1583] = -resIm233_s;
        double resRe233_s = eRe233 + (oRe233 * tRe233 - oIm233 * tRe23);
        out1024[idx + 1582] = resRe233_s;
        out1024[idx + 466] = resRe233_s;
        double resRe23_s = eRe233 - (oRe233 * tRe233 - oIm233 * tRe23);
        out1024[idx + 1490] = resRe279_s;
        out1024[idx + 558] = resRe279_s;
        double resIm23_s = -eIm233 + (oRe233 * tRe23 + oIm233 * tRe233);
        out1024[idx + 559] = resIm279_s;
        out1024[idx + 1491] = -resIm279_s;
        
        double oRe234 = out1024[idx + 1492];
        double oIm234 = out1024[idx + 1493];
        double eRe234 = out1024[idx + 468];
        double eIm234 = out1024[idx + 469];
        double resIm234_s = eIm234 + (oRe234 * tRe22 + oIm234 * tRe234);
        out1024[idx + 469] = resIm234_s;
        out1024[idx + 1581] = -resIm234_s;
        double resRe234_s = eRe234 + (oRe234 * tRe234 - oIm234 * tRe22);
        out1024[idx + 1580] = resRe234_s;
        out1024[idx + 468] = resRe234_s;
        double resRe22_s = eRe234 - (oRe234 * tRe234 - oIm234 * tRe22);
        out1024[idx + 1492] = resRe278_s;
        out1024[idx + 556] = resRe278_s;
        double resIm22_s = -eIm234 + (oRe234 * tRe22 + oIm234 * tRe234);
        out1024[idx + 557] = resIm278_s;
        out1024[idx + 1493] = -resIm278_s;
        
        double oRe235 = out1024[idx + 1494];
        double oIm235 = out1024[idx + 1495];
        double eRe235 = out1024[idx + 470];
        double eIm235 = out1024[idx + 471];
        double resIm235_s = eIm235 + (oRe235 * tRe21 + oIm235 * tRe235);
        out1024[idx + 471] = resIm235_s;
        out1024[idx + 1579] = -resIm235_s;
        double resRe235_s = eRe235 + (oRe235 * tRe235 - oIm235 * tRe21);
        out1024[idx + 1578] = resRe235_s;
        out1024[idx + 470] = resRe235_s;
        double resRe21_s = eRe235 - (oRe235 * tRe235 - oIm235 * tRe21);
        out1024[idx + 1494] = resRe277_s;
        out1024[idx + 554] = resRe277_s;
        double resIm21_s = -eIm235 + (oRe235 * tRe21 + oIm235 * tRe235);
        out1024[idx + 555] = resIm277_s;
        out1024[idx + 1495] = -resIm277_s;
        
        double oRe236 = out1024[idx + 1496];
        double oIm236 = out1024[idx + 1497];
        double eRe236 = out1024[idx + 472];
        double eIm236 = out1024[idx + 473];
        double resIm236_s = eIm236 + (oRe236 * tRe20 + oIm236 * tRe236);
        out1024[idx + 473] = resIm236_s;
        out1024[idx + 1577] = -resIm236_s;
        double resRe236_s = eRe236 + (oRe236 * tRe236 - oIm236 * tRe20);
        out1024[idx + 1576] = resRe236_s;
        out1024[idx + 472] = resRe236_s;
        double resRe20_s = eRe236 - (oRe236 * tRe236 - oIm236 * tRe20);
        out1024[idx + 1496] = resRe276_s;
        out1024[idx + 552] = resRe276_s;
        double resIm20_s = -eIm236 + (oRe236 * tRe20 + oIm236 * tRe236);
        out1024[idx + 553] = resIm276_s;
        out1024[idx + 1497] = -resIm276_s;
        
        double oRe237 = out1024[idx + 1498];
        double oIm237 = out1024[idx + 1499];
        double eRe237 = out1024[idx + 474];
        double eIm237 = out1024[idx + 475];
        double resIm237_s = eIm237 + (oRe237 * tRe19 + oIm237 * tRe237);
        out1024[idx + 475] = resIm237_s;
        out1024[idx + 1575] = -resIm237_s;
        double resRe237_s = eRe237 + (oRe237 * tRe237 - oIm237 * tRe19);
        out1024[idx + 1574] = resRe237_s;
        out1024[idx + 474] = resRe237_s;
        double resRe19_s = eRe237 - (oRe237 * tRe237 - oIm237 * tRe19);
        out1024[idx + 1498] = resRe275_s;
        out1024[idx + 550] = resRe275_s;
        double resIm19_s = -eIm237 + (oRe237 * tRe19 + oIm237 * tRe237);
        out1024[idx + 551] = resIm275_s;
        out1024[idx + 1499] = -resIm275_s;
        
        double oRe238 = out1024[idx + 1500];
        double oIm238 = out1024[idx + 1501];
        double eRe238 = out1024[idx + 476];
        double eIm238 = out1024[idx + 477];
        double resIm238_s = eIm238 + (oRe238 * tRe18 + oIm238 * tRe238);
        out1024[idx + 477] = resIm238_s;
        out1024[idx + 1573] = -resIm238_s;
        double resRe238_s = eRe238 + (oRe238 * tRe238 - oIm238 * tRe18);
        out1024[idx + 1572] = resRe238_s;
        out1024[idx + 476] = resRe238_s;
        double resRe18_s = eRe238 - (oRe238 * tRe238 - oIm238 * tRe18);
        out1024[idx + 1500] = resRe274_s;
        out1024[idx + 548] = resRe274_s;
        double resIm18_s = -eIm238 + (oRe238 * tRe18 + oIm238 * tRe238);
        out1024[idx + 549] = resIm274_s;
        out1024[idx + 1501] = -resIm274_s;
        
        double oRe239 = out1024[idx + 1502];
        double oIm239 = out1024[idx + 1503];
        double eRe239 = out1024[idx + 478];
        double eIm239 = out1024[idx + 479];
        double resIm239_s = eIm239 + (oRe239 * tRe17 + oIm239 * tRe239);
        out1024[idx + 479] = resIm239_s;
        out1024[idx + 1571] = -resIm239_s;
        double resRe239_s = eRe239 + (oRe239 * tRe239 - oIm239 * tRe17);
        out1024[idx + 1570] = resRe239_s;
        out1024[idx + 478] = resRe239_s;
        double resRe17_s = eRe239 - (oRe239 * tRe239 - oIm239 * tRe17);
        out1024[idx + 1502] = resRe273_s;
        out1024[idx + 546] = resRe273_s;
        double resIm17_s = -eIm239 + (oRe239 * tRe17 + oIm239 * tRe239);
        out1024[idx + 547] = resIm273_s;
        out1024[idx + 1503] = -resIm273_s;
        
        double oRe240 = out1024[idx + 1504];
        double oIm240 = out1024[idx + 1505];
        double eRe240 = out1024[idx + 480];
        double eIm240 = out1024[idx + 481];
        double resIm240_s = eIm240 + (oRe240 * tRe16 + oIm240 * tRe240);
        out1024[idx + 481] = resIm240_s;
        out1024[idx + 1569] = -resIm240_s;
        double resRe240_s = eRe240 + (oRe240 * tRe240 - oIm240 * tRe16);
        out1024[idx + 1568] = resRe240_s;
        out1024[idx + 480] = resRe240_s;
        double resRe16_s = eRe240 - (oRe240 * tRe240 - oIm240 * tRe16);
        out1024[idx + 1504] = resRe272_s;
        out1024[idx + 544] = resRe272_s;
        double resIm16_s = -eIm240 + (oRe240 * tRe16 + oIm240 * tRe240);
        out1024[idx + 545] = resIm272_s;
        out1024[idx + 1505] = -resIm272_s;
        
        double oRe241 = out1024[idx + 1506];
        double oIm241 = out1024[idx + 1507];
        double eRe241 = out1024[idx + 482];
        double eIm241 = out1024[idx + 483];
        double resIm241_s = eIm241 + (oRe241 * tRe15 + oIm241 * tRe241);
        out1024[idx + 483] = resIm241_s;
        out1024[idx + 1567] = -resIm241_s;
        double resRe241_s = eRe241 + (oRe241 * tRe241 - oIm241 * tRe15);
        out1024[idx + 1566] = resRe241_s;
        out1024[idx + 482] = resRe241_s;
        double resRe15_s = eRe241 - (oRe241 * tRe241 - oIm241 * tRe15);
        out1024[idx + 1506] = resRe271_s;
        out1024[idx + 542] = resRe271_s;
        double resIm15_s = -eIm241 + (oRe241 * tRe15 + oIm241 * tRe241);
        out1024[idx + 543] = resIm271_s;
        out1024[idx + 1507] = -resIm271_s;
        
        double oRe242 = out1024[idx + 1508];
        double oIm242 = out1024[idx + 1509];
        double eRe242 = out1024[idx + 484];
        double eIm242 = out1024[idx + 485];
        double resIm242_s = eIm242 + (oRe242 * tRe14 + oIm242 * tRe242);
        out1024[idx + 485] = resIm242_s;
        out1024[idx + 1565] = -resIm242_s;
        double resRe242_s = eRe242 + (oRe242 * tRe242 - oIm242 * tRe14);
        out1024[idx + 1564] = resRe242_s;
        out1024[idx + 484] = resRe242_s;
        double resRe14_s = eRe242 - (oRe242 * tRe242 - oIm242 * tRe14);
        out1024[idx + 1508] = resRe270_s;
        out1024[idx + 540] = resRe270_s;
        double resIm14_s = -eIm242 + (oRe242 * tRe14 + oIm242 * tRe242);
        out1024[idx + 541] = resIm270_s;
        out1024[idx + 1509] = -resIm270_s;
        
        double oRe243 = out1024[idx + 1510];
        double oIm243 = out1024[idx + 1511];
        double eRe243 = out1024[idx + 486];
        double eIm243 = out1024[idx + 487];
        double resIm243_s = eIm243 + (oRe243 * tRe13 + oIm243 * tRe243);
        out1024[idx + 487] = resIm243_s;
        out1024[idx + 1563] = -resIm243_s;
        double resRe243_s = eRe243 + (oRe243 * tRe243 - oIm243 * tRe13);
        out1024[idx + 1562] = resRe243_s;
        out1024[idx + 486] = resRe243_s;
        double resRe13_s = eRe243 - (oRe243 * tRe243 - oIm243 * tRe13);
        out1024[idx + 1510] = resRe269_s;
        out1024[idx + 538] = resRe269_s;
        double resIm13_s = -eIm243 + (oRe243 * tRe13 + oIm243 * tRe243);
        out1024[idx + 539] = resIm269_s;
        out1024[idx + 1511] = -resIm269_s;
        
        double oRe244 = out1024[idx + 1512];
        double oIm244 = out1024[idx + 1513];
        double eRe244 = out1024[idx + 488];
        double eIm244 = out1024[idx + 489];
        double resIm244_s = eIm244 + (oRe244 * tRe12 + oIm244 * tRe244);
        out1024[idx + 489] = resIm244_s;
        out1024[idx + 1561] = -resIm244_s;
        double resRe244_s = eRe244 + (oRe244 * tRe244 - oIm244 * tRe12);
        out1024[idx + 1560] = resRe244_s;
        out1024[idx + 488] = resRe244_s;
        double resRe12_s = eRe244 - (oRe244 * tRe244 - oIm244 * tRe12);
        out1024[idx + 1512] = resRe268_s;
        out1024[idx + 536] = resRe268_s;
        double resIm12_s = -eIm244 + (oRe244 * tRe12 + oIm244 * tRe244);
        out1024[idx + 537] = resIm268_s;
        out1024[idx + 1513] = -resIm268_s;
        
        double oRe245 = out1024[idx + 1514];
        double oIm245 = out1024[idx + 1515];
        double eRe245 = out1024[idx + 490];
        double eIm245 = out1024[idx + 491];
        double resIm245_s = eIm245 + (oRe245 * tRe11 + oIm245 * tRe245);
        out1024[idx + 491] = resIm245_s;
        out1024[idx + 1559] = -resIm245_s;
        double resRe245_s = eRe245 + (oRe245 * tRe245 - oIm245 * tRe11);
        out1024[idx + 1558] = resRe245_s;
        out1024[idx + 490] = resRe245_s;
        double resRe11_s = eRe245 - (oRe245 * tRe245 - oIm245 * tRe11);
        out1024[idx + 1514] = resRe267_s;
        out1024[idx + 534] = resRe267_s;
        double resIm11_s = -eIm245 + (oRe245 * tRe11 + oIm245 * tRe245);
        out1024[idx + 535] = resIm267_s;
        out1024[idx + 1515] = -resIm267_s;
        
        double oRe246 = out1024[idx + 1516];
        double oIm246 = out1024[idx + 1517];
        double eRe246 = out1024[idx + 492];
        double eIm246 = out1024[idx + 493];
        double resIm246_s = eIm246 + (oRe246 * tRe10 + oIm246 * tRe246);
        out1024[idx + 493] = resIm246_s;
        out1024[idx + 1557] = -resIm246_s;
        double resRe246_s = eRe246 + (oRe246 * tRe246 - oIm246 * tRe10);
        out1024[idx + 1556] = resRe246_s;
        out1024[idx + 492] = resRe246_s;
        double resRe10_s = eRe246 - (oRe246 * tRe246 - oIm246 * tRe10);
        out1024[idx + 1516] = resRe266_s;
        out1024[idx + 532] = resRe266_s;
        double resIm10_s = -eIm246 + (oRe246 * tRe10 + oIm246 * tRe246);
        out1024[idx + 533] = resIm266_s;
        out1024[idx + 1517] = -resIm266_s;
        
        double oRe247 = out1024[idx + 1518];
        double oIm247 = out1024[idx + 1519];
        double eRe247 = out1024[idx + 494];
        double eIm247 = out1024[idx + 495];
        double resIm247_s = eIm247 + (oRe247 * tRe9 + oIm247 * tRe247);
        out1024[idx + 495] = resIm247_s;
        out1024[idx + 1555] = -resIm247_s;
        double resRe247_s = eRe247 + (oRe247 * tRe247 - oIm247 * tRe9);
        out1024[idx + 1554] = resRe247_s;
        out1024[idx + 494] = resRe247_s;
        double resRe9_s = eRe247 - (oRe247 * tRe247 - oIm247 * tRe9);
        out1024[idx + 1518] = resRe265_s;
        out1024[idx + 530] = resRe265_s;
        double resIm9_s = -eIm247 + (oRe247 * tRe9 + oIm247 * tRe247);
        out1024[idx + 531] = resIm265_s;
        out1024[idx + 1519] = -resIm265_s;
        
        double oRe248 = out1024[idx + 1520];
        double oIm248 = out1024[idx + 1521];
        double eRe248 = out1024[idx + 496];
        double eIm248 = out1024[idx + 497];
        double resIm248_s = eIm248 + (oRe248 * tRe8 + oIm248 * tRe248);
        out1024[idx + 497] = resIm248_s;
        out1024[idx + 1553] = -resIm248_s;
        double resRe248_s = eRe248 + (oRe248 * tRe248 - oIm248 * tRe8);
        out1024[idx + 1552] = resRe248_s;
        out1024[idx + 496] = resRe248_s;
        double resRe8_s = eRe248 - (oRe248 * tRe248 - oIm248 * tRe8);
        out1024[idx + 1520] = resRe264_s;
        out1024[idx + 528] = resRe264_s;
        double resIm8_s = -eIm248 + (oRe248 * tRe8 + oIm248 * tRe248);
        out1024[idx + 529] = resIm264_s;
        out1024[idx + 1521] = -resIm264_s;
        
        double oRe249 = out1024[idx + 1522];
        double oIm249 = out1024[idx + 1523];
        double eRe249 = out1024[idx + 498];
        double eIm249 = out1024[idx + 499];
        double resIm249_s = eIm249 + (oRe249 * tRe7 + oIm249 * tRe249);
        out1024[idx + 499] = resIm249_s;
        out1024[idx + 1551] = -resIm249_s;
        double resRe249_s = eRe249 + (oRe249 * tRe249 - oIm249 * tRe7);
        out1024[idx + 1550] = resRe249_s;
        out1024[idx + 498] = resRe249_s;
        double resRe7_s = eRe249 - (oRe249 * tRe249 - oIm249 * tRe7);
        out1024[idx + 1522] = resRe263_s;
        out1024[idx + 526] = resRe263_s;
        double resIm7_s = -eIm249 + (oRe249 * tRe7 + oIm249 * tRe249);
        out1024[idx + 527] = resIm263_s;
        out1024[idx + 1523] = -resIm263_s;
        
        double oRe250 = out1024[idx + 1524];
        double oIm250 = out1024[idx + 1525];
        double eRe250 = out1024[idx + 500];
        double eIm250 = out1024[idx + 501];
        double resIm250_s = eIm250 + (oRe250 * tRe6 + oIm250 * tRe250);
        out1024[idx + 501] = resIm250_s;
        out1024[idx + 1549] = -resIm250_s;
        double resRe250_s = eRe250 + (oRe250 * tRe250 - oIm250 * tRe6);
        out1024[idx + 1548] = resRe250_s;
        out1024[idx + 500] = resRe250_s;
        double resRe6_s = eRe250 - (oRe250 * tRe250 - oIm250 * tRe6);
        out1024[idx + 1524] = resRe262_s;
        out1024[idx + 524] = resRe262_s;
        double resIm6_s = -eIm250 + (oRe250 * tRe6 + oIm250 * tRe250);
        out1024[idx + 525] = resIm262_s;
        out1024[idx + 1525] = -resIm262_s;
        
        double oRe251 = out1024[idx + 1526];
        double oIm251 = out1024[idx + 1527];
        double eRe251 = out1024[idx + 502];
        double eIm251 = out1024[idx + 503];
        double resIm251_s = eIm251 + (oRe251 * tRe5 + oIm251 * tRe251);
        out1024[idx + 503] = resIm251_s;
        out1024[idx + 1547] = -resIm251_s;
        double resRe251_s = eRe251 + (oRe251 * tRe251 - oIm251 * tRe5);
        out1024[idx + 1546] = resRe251_s;
        out1024[idx + 502] = resRe251_s;
        double resRe5_s = eRe251 - (oRe251 * tRe251 - oIm251 * tRe5);
        out1024[idx + 1526] = resRe261_s;
        out1024[idx + 522] = resRe261_s;
        double resIm5_s = -eIm251 + (oRe251 * tRe5 + oIm251 * tRe251);
        out1024[idx + 523] = resIm261_s;
        out1024[idx + 1527] = -resIm261_s;
        
        double oRe252 = out1024[idx + 1528];
        double oIm252 = out1024[idx + 1529];
        double eRe252 = out1024[idx + 504];
        double eIm252 = out1024[idx + 505];
        double resIm252_s = eIm252 + (oRe252 * tRe4 + oIm252 * tRe252);
        out1024[idx + 505] = resIm252_s;
        out1024[idx + 1545] = -resIm252_s;
        double resRe252_s = eRe252 + (oRe252 * tRe252 - oIm252 * tRe4);
        out1024[idx + 1544] = resRe252_s;
        out1024[idx + 504] = resRe252_s;
        double resRe4_s = eRe252 - (oRe252 * tRe252 - oIm252 * tRe4);
        out1024[idx + 1528] = resRe260_s;
        out1024[idx + 520] = resRe260_s;
        double resIm4_s = -eIm252 + (oRe252 * tRe4 + oIm252 * tRe252);
        out1024[idx + 521] = resIm260_s;
        out1024[idx + 1529] = -resIm260_s;
        
        double oRe253 = out1024[idx + 1530];
        double oIm253 = out1024[idx + 1531];
        double eRe253 = out1024[idx + 506];
        double eIm253 = out1024[idx + 507];
        double resIm253_s = eIm253 + (oRe253 * tRe3 + oIm253 * tRe253);
        out1024[idx + 507] = resIm253_s;
        out1024[idx + 1543] = -resIm253_s;
        double resRe253_s = eRe253 + (oRe253 * tRe253 - oIm253 * tRe3);
        out1024[idx + 1542] = resRe253_s;
        out1024[idx + 506] = resRe253_s;
        double resRe3_s = eRe253 - (oRe253 * tRe253 - oIm253 * tRe3);
        out1024[idx + 1530] = resRe259_s;
        out1024[idx + 518] = resRe259_s;
        double resIm3_s = -eIm253 + (oRe253 * tRe3 + oIm253 * tRe253);
        out1024[idx + 519] = resIm259_s;
        out1024[idx + 1531] = -resIm259_s;
        
        double oRe254 = out1024[idx + 1532];
        double oIm254 = out1024[idx + 1533];
        double eRe254 = out1024[idx + 508];
        double eIm254 = out1024[idx + 509];
        double resIm254_s = eIm254 + (oRe254 * tRe2 + oIm254 * tRe254);
        out1024[idx + 509] = resIm254_s;
        out1024[idx + 1541] = -resIm254_s;
        double resRe254_s = eRe254 + (oRe254 * tRe254 - oIm254 * tRe2);
        out1024[idx + 1540] = resRe254_s;
        out1024[idx + 508] = resRe254_s;
        double resRe2_s = eRe254 - (oRe254 * tRe254 - oIm254 * tRe2);
        out1024[idx + 1532] = resRe258_s;
        out1024[idx + 516] = resRe258_s;
        double resIm2_s = -eIm254 + (oRe254 * tRe2 + oIm254 * tRe254);
        out1024[idx + 517] = resIm258_s;
        out1024[idx + 1533] = -resIm258_s;
        
        double oRe255 = out1024[idx + 1534];
        double oIm255 = out1024[idx + 1535];
        double eRe255 = out1024[idx + 510];
        double eIm255 = out1024[idx + 511];
        double resIm255_s = eIm255 + (oRe255 * tRe1 + oIm255 * tRe255);
        out1024[idx + 511] = resIm255_s;
        out1024[idx + 1539] = -resIm255_s;
        double resRe255_s = eRe255 + (oRe255 * tRe255 - oIm255 * tRe1);
        out1024[idx + 1538] = resRe255_s;
        out1024[idx + 510] = resRe255_s;
        double resRe1_s = eRe255 - (oRe255 * tRe255 - oIm255 * tRe1);
        out1024[idx + 1534] = resRe257_s;
        out1024[idx + 514] = resRe257_s;
        double resIm1_s = -eIm255 + (oRe255 * tRe1 + oIm255 * tRe255);
        out1024[idx + 515] = resIm257_s;
        out1024[idx + 1535] = -resIm257_s;
        
        double oRe256 = out1024[idx + 1536];
        double oIm256 = out1024[idx + 1537];
        double eRe256 = out1024[idx + 512];
        double eIm256 = out1024[idx + 513];
        double resIm256_s = eIm256 + oRe256;
        out1024[idx + 513] = resIm256_s;
        out1024[idx + 1537] = -resIm256_s;
        double resRe256_s = eRe256 - oIm256;
        out1024[idx + 1536] = resRe256_s;
        out1024[idx + 512] = resRe256_s;
        
}


/*
// Modified function to accept pointer to output array
void fftReal1024(float* realInput, int size) {
    // Padding the input if necessary
    if (size != 1024) {
        for (int i = 0; i < 1024; i++) {
            paddedInput[i] = (i < size) ? realInput[i] : 0;
        }
    } else {
        // Create a copy of the input array
        for (int i = 0; i < 1024; i++) {
            paddedInput[i] = realInput[i];
        }
    }

inputBR1024[0]=paddedInput[0];
inputBR1024[1]=paddedInput[512];
inputBR1024[2]=paddedInput[256];
inputBR1024[3]=paddedInput[768];
inputBR1024[4]=paddedInput[128];
inputBR1024[5]=paddedInput[640];
inputBR1024[6]=paddedInput[384];
inputBR1024[7]=paddedInput[896];
inputBR1024[8]=paddedInput[64];
inputBR1024[9]=paddedInput[576];
inputBR1024[10]=paddedInput[320];
inputBR1024[11]=paddedInput[832];
inputBR1024[12]=paddedInput[192];
inputBR1024[13]=paddedInput[704];
inputBR1024[14]=paddedInput[448];
inputBR1024[15]=paddedInput[960];
inputBR1024[16]=paddedInput[32];
inputBR1024[17]=paddedInput[544];
inputBR1024[18]=paddedInput[288];
inputBR1024[19]=paddedInput[800];
inputBR1024[20]=paddedInput[160];
inputBR1024[21]=paddedInput[672];
inputBR1024[22]=paddedInput[416];
inputBR1024[23]=paddedInput[928];
inputBR1024[24]=paddedInput[96];
inputBR1024[25]=paddedInput[608];
inputBR1024[26]=paddedInput[352];
inputBR1024[27]=paddedInput[864];
inputBR1024[28]=paddedInput[224];
inputBR1024[29]=paddedInput[736];
inputBR1024[30]=paddedInput[480];
inputBR1024[31]=paddedInput[992];
inputBR1024[32]=paddedInput[16];
inputBR1024[33]=paddedInput[528];
inputBR1024[34]=paddedInput[272];
inputBR1024[35]=paddedInput[784];
inputBR1024[36]=paddedInput[144];
inputBR1024[37]=paddedInput[656];
inputBR1024[38]=paddedInput[400];
inputBR1024[39]=paddedInput[912];
inputBR1024[40]=paddedInput[80];
inputBR1024[41]=paddedInput[592];
inputBR1024[42]=paddedInput[336];
inputBR1024[43]=paddedInput[848];
inputBR1024[44]=paddedInput[208];
inputBR1024[45]=paddedInput[720];
inputBR1024[46]=paddedInput[464];
inputBR1024[47]=paddedInput[976];
inputBR1024[48]=paddedInput[48];
inputBR1024[49]=paddedInput[560];
inputBR1024[50]=paddedInput[304];
inputBR1024[51]=paddedInput[816];
inputBR1024[52]=paddedInput[176];
inputBR1024[53]=paddedInput[688];
inputBR1024[54]=paddedInput[432];
inputBR1024[55]=paddedInput[944];
inputBR1024[56]=paddedInput[112];
inputBR1024[57]=paddedInput[624];
inputBR1024[58]=paddedInput[368];
inputBR1024[59]=paddedInput[880];
inputBR1024[60]=paddedInput[240];
inputBR1024[61]=paddedInput[752];
inputBR1024[62]=paddedInput[496];
inputBR1024[63]=paddedInput[1008];
inputBR1024[64]=paddedInput[8];
inputBR1024[65]=paddedInput[520];
inputBR1024[66]=paddedInput[264];
inputBR1024[67]=paddedInput[776];
inputBR1024[68]=paddedInput[136];
inputBR1024[69]=paddedInput[648];
inputBR1024[70]=paddedInput[392];
inputBR1024[71]=paddedInput[904];
inputBR1024[72]=paddedInput[72];
inputBR1024[73]=paddedInput[584];
inputBR1024[74]=paddedInput[328];
inputBR1024[75]=paddedInput[840];
inputBR1024[76]=paddedInput[200];
inputBR1024[77]=paddedInput[712];
inputBR1024[78]=paddedInput[456];
inputBR1024[79]=paddedInput[968];
inputBR1024[80]=paddedInput[40];
inputBR1024[81]=paddedInput[552];
inputBR1024[82]=paddedInput[296];
inputBR1024[83]=paddedInput[808];
inputBR1024[84]=paddedInput[168];
inputBR1024[85]=paddedInput[680];
inputBR1024[86]=paddedInput[424];
inputBR1024[87]=paddedInput[936];
inputBR1024[88]=paddedInput[104];
inputBR1024[89]=paddedInput[616];
inputBR1024[90]=paddedInput[360];
inputBR1024[91]=paddedInput[872];
inputBR1024[92]=paddedInput[232];
inputBR1024[93]=paddedInput[744];
inputBR1024[94]=paddedInput[488];
inputBR1024[95]=paddedInput[1000];
inputBR1024[96]=paddedInput[24];
inputBR1024[97]=paddedInput[536];
inputBR1024[98]=paddedInput[280];
inputBR1024[99]=paddedInput[792];
inputBR1024[100]=paddedInput[152];
inputBR1024[101]=paddedInput[664];
inputBR1024[102]=paddedInput[408];
inputBR1024[103]=paddedInput[920];
inputBR1024[104]=paddedInput[88];
inputBR1024[105]=paddedInput[600];
inputBR1024[106]=paddedInput[344];
inputBR1024[107]=paddedInput[856];
inputBR1024[108]=paddedInput[216];
inputBR1024[109]=paddedInput[728];
inputBR1024[110]=paddedInput[472];
inputBR1024[111]=paddedInput[984];
inputBR1024[112]=paddedInput[56];
inputBR1024[113]=paddedInput[568];
inputBR1024[114]=paddedInput[312];
inputBR1024[115]=paddedInput[824];
inputBR1024[116]=paddedInput[184];
inputBR1024[117]=paddedInput[696];
inputBR1024[118]=paddedInput[440];
inputBR1024[119]=paddedInput[952];
inputBR1024[120]=paddedInput[120];
inputBR1024[121]=paddedInput[632];
inputBR1024[122]=paddedInput[376];
inputBR1024[123]=paddedInput[888];
inputBR1024[124]=paddedInput[248];
inputBR1024[125]=paddedInput[760];
inputBR1024[126]=paddedInput[504];
inputBR1024[127]=paddedInput[1016];
inputBR1024[128]=paddedInput[4];
inputBR1024[129]=paddedInput[516];
inputBR1024[130]=paddedInput[260];
inputBR1024[131]=paddedInput[772];
inputBR1024[132]=paddedInput[132];
inputBR1024[133]=paddedInput[644];
inputBR1024[134]=paddedInput[388];
inputBR1024[135]=paddedInput[900];
inputBR1024[136]=paddedInput[68];
inputBR1024[137]=paddedInput[580];
inputBR1024[138]=paddedInput[324];
inputBR1024[139]=paddedInput[836];
inputBR1024[140]=paddedInput[196];
inputBR1024[141]=paddedInput[708];
inputBR1024[142]=paddedInput[452];
inputBR1024[143]=paddedInput[964];
inputBR1024[144]=paddedInput[36];
inputBR1024[145]=paddedInput[548];
inputBR1024[146]=paddedInput[292];
inputBR1024[147]=paddedInput[804];
inputBR1024[148]=paddedInput[164];
inputBR1024[149]=paddedInput[676];
inputBR1024[150]=paddedInput[420];
inputBR1024[151]=paddedInput[932];
inputBR1024[152]=paddedInput[100];
inputBR1024[153]=paddedInput[612];
inputBR1024[154]=paddedInput[356];
inputBR1024[155]=paddedInput[868];
inputBR1024[156]=paddedInput[228];
inputBR1024[157]=paddedInput[740];
inputBR1024[158]=paddedInput[484];
inputBR1024[159]=paddedInput[996];
inputBR1024[160]=paddedInput[20];
inputBR1024[161]=paddedInput[532];
inputBR1024[162]=paddedInput[276];
inputBR1024[163]=paddedInput[788];
inputBR1024[164]=paddedInput[148];
inputBR1024[165]=paddedInput[660];
inputBR1024[166]=paddedInput[404];
inputBR1024[167]=paddedInput[916];
inputBR1024[168]=paddedInput[84];
inputBR1024[169]=paddedInput[596];
inputBR1024[170]=paddedInput[340];
inputBR1024[171]=paddedInput[852];
inputBR1024[172]=paddedInput[212];
inputBR1024[173]=paddedInput[724];
inputBR1024[174]=paddedInput[468];
inputBR1024[175]=paddedInput[980];
inputBR1024[176]=paddedInput[52];
inputBR1024[177]=paddedInput[564];
inputBR1024[178]=paddedInput[308];
inputBR1024[179]=paddedInput[820];
inputBR1024[180]=paddedInput[180];
inputBR1024[181]=paddedInput[692];
inputBR1024[182]=paddedInput[436];
inputBR1024[183]=paddedInput[948];
inputBR1024[184]=paddedInput[116];
inputBR1024[185]=paddedInput[628];
inputBR1024[186]=paddedInput[372];
inputBR1024[187]=paddedInput[884];
inputBR1024[188]=paddedInput[244];
inputBR1024[189]=paddedInput[756];
inputBR1024[190]=paddedInput[500];
inputBR1024[191]=paddedInput[1012];
inputBR1024[192]=paddedInput[12];
inputBR1024[193]=paddedInput[524];
inputBR1024[194]=paddedInput[268];
inputBR1024[195]=paddedInput[780];
inputBR1024[196]=paddedInput[140];
inputBR1024[197]=paddedInput[652];
inputBR1024[198]=paddedInput[396];
inputBR1024[199]=paddedInput[908];
inputBR1024[200]=paddedInput[76];
inputBR1024[201]=paddedInput[588];
inputBR1024[202]=paddedInput[332];
inputBR1024[203]=paddedInput[844];
inputBR1024[204]=paddedInput[204];
inputBR1024[205]=paddedInput[716];
inputBR1024[206]=paddedInput[460];
inputBR1024[207]=paddedInput[972];
inputBR1024[208]=paddedInput[44];
inputBR1024[209]=paddedInput[556];
inputBR1024[210]=paddedInput[300];
inputBR1024[211]=paddedInput[812];
inputBR1024[212]=paddedInput[172];
inputBR1024[213]=paddedInput[684];
inputBR1024[214]=paddedInput[428];
inputBR1024[215]=paddedInput[940];
inputBR1024[216]=paddedInput[108];
inputBR1024[217]=paddedInput[620];
inputBR1024[218]=paddedInput[364];
inputBR1024[219]=paddedInput[876];
inputBR1024[220]=paddedInput[236];
inputBR1024[221]=paddedInput[748];
inputBR1024[222]=paddedInput[492];
inputBR1024[223]=paddedInput[1004];
inputBR1024[224]=paddedInput[28];
inputBR1024[225]=paddedInput[540];
inputBR1024[226]=paddedInput[284];
inputBR1024[227]=paddedInput[796];
inputBR1024[228]=paddedInput[156];
inputBR1024[229]=paddedInput[668];
inputBR1024[230]=paddedInput[412];
inputBR1024[231]=paddedInput[924];
inputBR1024[232]=paddedInput[92];
inputBR1024[233]=paddedInput[604];
inputBR1024[234]=paddedInput[348];
inputBR1024[235]=paddedInput[860];
inputBR1024[236]=paddedInput[220];
inputBR1024[237]=paddedInput[732];
inputBR1024[238]=paddedInput[476];
inputBR1024[239]=paddedInput[988];
inputBR1024[240]=paddedInput[60];
inputBR1024[241]=paddedInput[572];
inputBR1024[242]=paddedInput[316];
inputBR1024[243]=paddedInput[828];
inputBR1024[244]=paddedInput[188];
inputBR1024[245]=paddedInput[700];
inputBR1024[246]=paddedInput[444];
inputBR1024[247]=paddedInput[956];
inputBR1024[248]=paddedInput[124];
inputBR1024[249]=paddedInput[636];
inputBR1024[250]=paddedInput[380];
inputBR1024[251]=paddedInput[892];
inputBR1024[252]=paddedInput[252];
inputBR1024[253]=paddedInput[764];
inputBR1024[254]=paddedInput[508];
inputBR1024[255]=paddedInput[1020];
inputBR1024[256]=paddedInput[2];
inputBR1024[257]=paddedInput[514];
inputBR1024[258]=paddedInput[258];
inputBR1024[259]=paddedInput[770];
inputBR1024[260]=paddedInput[130];
inputBR1024[261]=paddedInput[642];
inputBR1024[262]=paddedInput[386];
inputBR1024[263]=paddedInput[898];
inputBR1024[264]=paddedInput[66];
inputBR1024[265]=paddedInput[578];
inputBR1024[266]=paddedInput[322];
inputBR1024[267]=paddedInput[834];
inputBR1024[268]=paddedInput[194];
inputBR1024[269]=paddedInput[706];
inputBR1024[270]=paddedInput[450];
inputBR1024[271]=paddedInput[962];
inputBR1024[272]=paddedInput[34];
inputBR1024[273]=paddedInput[546];
inputBR1024[274]=paddedInput[290];
inputBR1024[275]=paddedInput[802];
inputBR1024[276]=paddedInput[162];
inputBR1024[277]=paddedInput[674];
inputBR1024[278]=paddedInput[418];
inputBR1024[279]=paddedInput[930];
inputBR1024[280]=paddedInput[98];
inputBR1024[281]=paddedInput[610];
inputBR1024[282]=paddedInput[354];
inputBR1024[283]=paddedInput[866];
inputBR1024[284]=paddedInput[226];
inputBR1024[285]=paddedInput[738];
inputBR1024[286]=paddedInput[482];
inputBR1024[287]=paddedInput[994];
inputBR1024[288]=paddedInput[18];
inputBR1024[289]=paddedInput[530];
inputBR1024[290]=paddedInput[274];
inputBR1024[291]=paddedInput[786];
inputBR1024[292]=paddedInput[146];
inputBR1024[293]=paddedInput[658];
inputBR1024[294]=paddedInput[402];
inputBR1024[295]=paddedInput[914];
inputBR1024[296]=paddedInput[82];
inputBR1024[297]=paddedInput[594];
inputBR1024[298]=paddedInput[338];
inputBR1024[299]=paddedInput[850];
inputBR1024[300]=paddedInput[210];
inputBR1024[301]=paddedInput[722];
inputBR1024[302]=paddedInput[466];
inputBR1024[303]=paddedInput[978];
inputBR1024[304]=paddedInput[50];
inputBR1024[305]=paddedInput[562];
inputBR1024[306]=paddedInput[306];
inputBR1024[307]=paddedInput[818];
inputBR1024[308]=paddedInput[178];
inputBR1024[309]=paddedInput[690];
inputBR1024[310]=paddedInput[434];
inputBR1024[311]=paddedInput[946];
inputBR1024[312]=paddedInput[114];
inputBR1024[313]=paddedInput[626];
inputBR1024[314]=paddedInput[370];
inputBR1024[315]=paddedInput[882];
inputBR1024[316]=paddedInput[242];
inputBR1024[317]=paddedInput[754];
inputBR1024[318]=paddedInput[498];
inputBR1024[319]=paddedInput[1010];
inputBR1024[320]=paddedInput[10];
inputBR1024[321]=paddedInput[522];
inputBR1024[322]=paddedInput[266];
inputBR1024[323]=paddedInput[778];
inputBR1024[324]=paddedInput[138];
inputBR1024[325]=paddedInput[650];
inputBR1024[326]=paddedInput[394];
inputBR1024[327]=paddedInput[906];
inputBR1024[328]=paddedInput[74];
inputBR1024[329]=paddedInput[586];
inputBR1024[330]=paddedInput[330];
inputBR1024[331]=paddedInput[842];
inputBR1024[332]=paddedInput[202];
inputBR1024[333]=paddedInput[714];
inputBR1024[334]=paddedInput[458];
inputBR1024[335]=paddedInput[970];
inputBR1024[336]=paddedInput[42];
inputBR1024[337]=paddedInput[554];
inputBR1024[338]=paddedInput[298];
inputBR1024[339]=paddedInput[810];
inputBR1024[340]=paddedInput[170];
inputBR1024[341]=paddedInput[682];
inputBR1024[342]=paddedInput[426];
inputBR1024[343]=paddedInput[938];
inputBR1024[344]=paddedInput[106];
inputBR1024[345]=paddedInput[618];
inputBR1024[346]=paddedInput[362];
inputBR1024[347]=paddedInput[874];
inputBR1024[348]=paddedInput[234];
inputBR1024[349]=paddedInput[746];
inputBR1024[350]=paddedInput[490];
inputBR1024[351]=paddedInput[1002];
inputBR1024[352]=paddedInput[26];
inputBR1024[353]=paddedInput[538];
inputBR1024[354]=paddedInput[282];
inputBR1024[355]=paddedInput[794];
inputBR1024[356]=paddedInput[154];
inputBR1024[357]=paddedInput[666];
inputBR1024[358]=paddedInput[410];
inputBR1024[359]=paddedInput[922];
inputBR1024[360]=paddedInput[90];
inputBR1024[361]=paddedInput[602];
inputBR1024[362]=paddedInput[346];
inputBR1024[363]=paddedInput[858];
inputBR1024[364]=paddedInput[218];
inputBR1024[365]=paddedInput[730];
inputBR1024[366]=paddedInput[474];
inputBR1024[367]=paddedInput[986];
inputBR1024[368]=paddedInput[58];
inputBR1024[369]=paddedInput[570];
inputBR1024[370]=paddedInput[314];
inputBR1024[371]=paddedInput[826];
inputBR1024[372]=paddedInput[186];
inputBR1024[373]=paddedInput[698];
inputBR1024[374]=paddedInput[442];
inputBR1024[375]=paddedInput[954];
inputBR1024[376]=paddedInput[122];
inputBR1024[377]=paddedInput[634];
inputBR1024[378]=paddedInput[378];
inputBR1024[379]=paddedInput[890];
inputBR1024[380]=paddedInput[250];
inputBR1024[381]=paddedInput[762];
inputBR1024[382]=paddedInput[506];
inputBR1024[383]=paddedInput[1018];
inputBR1024[384]=paddedInput[6];
inputBR1024[385]=paddedInput[518];
inputBR1024[386]=paddedInput[262];
inputBR1024[387]=paddedInput[774];
inputBR1024[388]=paddedInput[134];
inputBR1024[389]=paddedInput[646];
inputBR1024[390]=paddedInput[390];
inputBR1024[391]=paddedInput[902];
inputBR1024[392]=paddedInput[70];
inputBR1024[393]=paddedInput[582];
inputBR1024[394]=paddedInput[326];
inputBR1024[395]=paddedInput[838];
inputBR1024[396]=paddedInput[198];
inputBR1024[397]=paddedInput[710];
inputBR1024[398]=paddedInput[454];
inputBR1024[399]=paddedInput[966];
inputBR1024[400]=paddedInput[38];
inputBR1024[401]=paddedInput[550];
inputBR1024[402]=paddedInput[294];
inputBR1024[403]=paddedInput[806];
inputBR1024[404]=paddedInput[166];
inputBR1024[405]=paddedInput[678];
inputBR1024[406]=paddedInput[422];
inputBR1024[407]=paddedInput[934];
inputBR1024[408]=paddedInput[102];
inputBR1024[409]=paddedInput[614];
inputBR1024[410]=paddedInput[358];
inputBR1024[411]=paddedInput[870];
inputBR1024[412]=paddedInput[230];
inputBR1024[413]=paddedInput[742];
inputBR1024[414]=paddedInput[486];
inputBR1024[415]=paddedInput[998];
inputBR1024[416]=paddedInput[22];
inputBR1024[417]=paddedInput[534];
inputBR1024[418]=paddedInput[278];
inputBR1024[419]=paddedInput[790];
inputBR1024[420]=paddedInput[150];
inputBR1024[421]=paddedInput[662];
inputBR1024[422]=paddedInput[406];
inputBR1024[423]=paddedInput[918];
inputBR1024[424]=paddedInput[86];
inputBR1024[425]=paddedInput[598];
inputBR1024[426]=paddedInput[342];
inputBR1024[427]=paddedInput[854];
inputBR1024[428]=paddedInput[214];
inputBR1024[429]=paddedInput[726];
inputBR1024[430]=paddedInput[470];
inputBR1024[431]=paddedInput[982];
inputBR1024[432]=paddedInput[54];
inputBR1024[433]=paddedInput[566];
inputBR1024[434]=paddedInput[310];
inputBR1024[435]=paddedInput[822];
inputBR1024[436]=paddedInput[182];
inputBR1024[437]=paddedInput[694];
inputBR1024[438]=paddedInput[438];
inputBR1024[439]=paddedInput[950];
inputBR1024[440]=paddedInput[118];
inputBR1024[441]=paddedInput[630];
inputBR1024[442]=paddedInput[374];
inputBR1024[443]=paddedInput[886];
inputBR1024[444]=paddedInput[246];
inputBR1024[445]=paddedInput[758];
inputBR1024[446]=paddedInput[502];
inputBR1024[447]=paddedInput[1014];
inputBR1024[448]=paddedInput[14];
inputBR1024[449]=paddedInput[526];
inputBR1024[450]=paddedInput[270];
inputBR1024[451]=paddedInput[782];
inputBR1024[452]=paddedInput[142];
inputBR1024[453]=paddedInput[654];
inputBR1024[454]=paddedInput[398];
inputBR1024[455]=paddedInput[910];
inputBR1024[456]=paddedInput[78];
inputBR1024[457]=paddedInput[590];
inputBR1024[458]=paddedInput[334];
inputBR1024[459]=paddedInput[846];
inputBR1024[460]=paddedInput[206];
inputBR1024[461]=paddedInput[718];
inputBR1024[462]=paddedInput[462];
inputBR1024[463]=paddedInput[974];
inputBR1024[464]=paddedInput[46];
inputBR1024[465]=paddedInput[558];
inputBR1024[466]=paddedInput[302];
inputBR1024[467]=paddedInput[814];
inputBR1024[468]=paddedInput[174];
inputBR1024[469]=paddedInput[686];
inputBR1024[470]=paddedInput[430];
inputBR1024[471]=paddedInput[942];
inputBR1024[472]=paddedInput[110];
inputBR1024[473]=paddedInput[622];
inputBR1024[474]=paddedInput[366];
inputBR1024[475]=paddedInput[878];
inputBR1024[476]=paddedInput[238];
inputBR1024[477]=paddedInput[750];
inputBR1024[478]=paddedInput[494];
inputBR1024[479]=paddedInput[1006];
inputBR1024[480]=paddedInput[30];
inputBR1024[481]=paddedInput[542];
inputBR1024[482]=paddedInput[286];
inputBR1024[483]=paddedInput[798];
inputBR1024[484]=paddedInput[158];
inputBR1024[485]=paddedInput[670];
inputBR1024[486]=paddedInput[414];
inputBR1024[487]=paddedInput[926];
inputBR1024[488]=paddedInput[94];
inputBR1024[489]=paddedInput[606];
inputBR1024[490]=paddedInput[350];
inputBR1024[491]=paddedInput[862];
inputBR1024[492]=paddedInput[222];
inputBR1024[493]=paddedInput[734];
inputBR1024[494]=paddedInput[478];
inputBR1024[495]=paddedInput[990];
inputBR1024[496]=paddedInput[62];
inputBR1024[497]=paddedInput[574];
inputBR1024[498]=paddedInput[318];
inputBR1024[499]=paddedInput[830];
inputBR1024[500]=paddedInput[190];
inputBR1024[501]=paddedInput[702];
inputBR1024[502]=paddedInput[446];
inputBR1024[503]=paddedInput[958];
inputBR1024[504]=paddedInput[126];
inputBR1024[505]=paddedInput[638];
inputBR1024[506]=paddedInput[382];
inputBR1024[507]=paddedInput[894];
inputBR1024[508]=paddedInput[254];
inputBR1024[509]=paddedInput[766];
inputBR1024[510]=paddedInput[510];
inputBR1024[511]=paddedInput[1022];
inputBR1024[512]=paddedInput[1];
inputBR1024[513]=paddedInput[513];
inputBR1024[514]=paddedInput[257];
inputBR1024[515]=paddedInput[769];
inputBR1024[516]=paddedInput[129];
inputBR1024[517]=paddedInput[641];
inputBR1024[518]=paddedInput[385];
inputBR1024[519]=paddedInput[897];
inputBR1024[520]=paddedInput[65];
inputBR1024[521]=paddedInput[577];
inputBR1024[522]=paddedInput[321];
inputBR1024[523]=paddedInput[833];
inputBR1024[524]=paddedInput[193];
inputBR1024[525]=paddedInput[705];
inputBR1024[526]=paddedInput[449];
inputBR1024[527]=paddedInput[961];
inputBR1024[528]=paddedInput[33];
inputBR1024[529]=paddedInput[545];
inputBR1024[530]=paddedInput[289];
inputBR1024[531]=paddedInput[801];
inputBR1024[532]=paddedInput[161];
inputBR1024[533]=paddedInput[673];
inputBR1024[534]=paddedInput[417];
inputBR1024[535]=paddedInput[929];
inputBR1024[536]=paddedInput[97];
inputBR1024[537]=paddedInput[609];
inputBR1024[538]=paddedInput[353];
inputBR1024[539]=paddedInput[865];
inputBR1024[540]=paddedInput[225];
inputBR1024[541]=paddedInput[737];
inputBR1024[542]=paddedInput[481];
inputBR1024[543]=paddedInput[993];
inputBR1024[544]=paddedInput[17];
inputBR1024[545]=paddedInput[529];
inputBR1024[546]=paddedInput[273];
inputBR1024[547]=paddedInput[785];
inputBR1024[548]=paddedInput[145];
inputBR1024[549]=paddedInput[657];
inputBR1024[550]=paddedInput[401];
inputBR1024[551]=paddedInput[913];
inputBR1024[552]=paddedInput[81];
inputBR1024[553]=paddedInput[593];
inputBR1024[554]=paddedInput[337];
inputBR1024[555]=paddedInput[849];
inputBR1024[556]=paddedInput[209];
inputBR1024[557]=paddedInput[721];
inputBR1024[558]=paddedInput[465];
inputBR1024[559]=paddedInput[977];
inputBR1024[560]=paddedInput[49];
inputBR1024[561]=paddedInput[561];
inputBR1024[562]=paddedInput[305];
inputBR1024[563]=paddedInput[817];
inputBR1024[564]=paddedInput[177];
inputBR1024[565]=paddedInput[689];
inputBR1024[566]=paddedInput[433];
inputBR1024[567]=paddedInput[945];
inputBR1024[568]=paddedInput[113];
inputBR1024[569]=paddedInput[625];
inputBR1024[570]=paddedInput[369];
inputBR1024[571]=paddedInput[881];
inputBR1024[572]=paddedInput[241];
inputBR1024[573]=paddedInput[753];
inputBR1024[574]=paddedInput[497];
inputBR1024[575]=paddedInput[1009];
inputBR1024[576]=paddedInput[9];
inputBR1024[577]=paddedInput[521];
inputBR1024[578]=paddedInput[265];
inputBR1024[579]=paddedInput[777];
inputBR1024[580]=paddedInput[137];
inputBR1024[581]=paddedInput[649];
inputBR1024[582]=paddedInput[393];
inputBR1024[583]=paddedInput[905];
inputBR1024[584]=paddedInput[73];
inputBR1024[585]=paddedInput[585];
inputBR1024[586]=paddedInput[329];
inputBR1024[587]=paddedInput[841];
inputBR1024[588]=paddedInput[201];
inputBR1024[589]=paddedInput[713];
inputBR1024[590]=paddedInput[457];
inputBR1024[591]=paddedInput[969];
inputBR1024[592]=paddedInput[41];
inputBR1024[593]=paddedInput[553];
inputBR1024[594]=paddedInput[297];
inputBR1024[595]=paddedInput[809];
inputBR1024[596]=paddedInput[169];
inputBR1024[597]=paddedInput[681];
inputBR1024[598]=paddedInput[425];
inputBR1024[599]=paddedInput[937];
inputBR1024[600]=paddedInput[105];
inputBR1024[601]=paddedInput[617];
inputBR1024[602]=paddedInput[361];
inputBR1024[603]=paddedInput[873];
inputBR1024[604]=paddedInput[233];
inputBR1024[605]=paddedInput[745];
inputBR1024[606]=paddedInput[489];
inputBR1024[607]=paddedInput[1001];
inputBR1024[608]=paddedInput[25];
inputBR1024[609]=paddedInput[537];
inputBR1024[610]=paddedInput[281];
inputBR1024[611]=paddedInput[793];
inputBR1024[612]=paddedInput[153];
inputBR1024[613]=paddedInput[665];
inputBR1024[614]=paddedInput[409];
inputBR1024[615]=paddedInput[921];
inputBR1024[616]=paddedInput[89];
inputBR1024[617]=paddedInput[601];
inputBR1024[618]=paddedInput[345];
inputBR1024[619]=paddedInput[857];
inputBR1024[620]=paddedInput[217];
inputBR1024[621]=paddedInput[729];
inputBR1024[622]=paddedInput[473];
inputBR1024[623]=paddedInput[985];
inputBR1024[624]=paddedInput[57];
inputBR1024[625]=paddedInput[569];
inputBR1024[626]=paddedInput[313];
inputBR1024[627]=paddedInput[825];
inputBR1024[628]=paddedInput[185];
inputBR1024[629]=paddedInput[697];
inputBR1024[630]=paddedInput[441];
inputBR1024[631]=paddedInput[953];
inputBR1024[632]=paddedInput[121];
inputBR1024[633]=paddedInput[633];
inputBR1024[634]=paddedInput[377];
inputBR1024[635]=paddedInput[889];
inputBR1024[636]=paddedInput[249];
inputBR1024[637]=paddedInput[761];
inputBR1024[638]=paddedInput[505];
inputBR1024[639]=paddedInput[1017];
inputBR1024[640]=paddedInput[5];
inputBR1024[641]=paddedInput[517];
inputBR1024[642]=paddedInput[261];
inputBR1024[643]=paddedInput[773];
inputBR1024[644]=paddedInput[133];
inputBR1024[645]=paddedInput[645];
inputBR1024[646]=paddedInput[389];
inputBR1024[647]=paddedInput[901];
inputBR1024[648]=paddedInput[69];
inputBR1024[649]=paddedInput[581];
inputBR1024[650]=paddedInput[325];
inputBR1024[651]=paddedInput[837];
inputBR1024[652]=paddedInput[197];
inputBR1024[653]=paddedInput[709];
inputBR1024[654]=paddedInput[453];
inputBR1024[655]=paddedInput[965];
inputBR1024[656]=paddedInput[37];
inputBR1024[657]=paddedInput[549];
inputBR1024[658]=paddedInput[293];
inputBR1024[659]=paddedInput[805];
inputBR1024[660]=paddedInput[165];
inputBR1024[661]=paddedInput[677];
inputBR1024[662]=paddedInput[421];
inputBR1024[663]=paddedInput[933];
inputBR1024[664]=paddedInput[101];
inputBR1024[665]=paddedInput[613];
inputBR1024[666]=paddedInput[357];
inputBR1024[667]=paddedInput[869];
inputBR1024[668]=paddedInput[229];
inputBR1024[669]=paddedInput[741];
inputBR1024[670]=paddedInput[485];
inputBR1024[671]=paddedInput[997];
inputBR1024[672]=paddedInput[21];
inputBR1024[673]=paddedInput[533];
inputBR1024[674]=paddedInput[277];
inputBR1024[675]=paddedInput[789];
inputBR1024[676]=paddedInput[149];
inputBR1024[677]=paddedInput[661];
inputBR1024[678]=paddedInput[405];
inputBR1024[679]=paddedInput[917];
inputBR1024[680]=paddedInput[85];
inputBR1024[681]=paddedInput[597];
inputBR1024[682]=paddedInput[341];
inputBR1024[683]=paddedInput[853];
inputBR1024[684]=paddedInput[213];
inputBR1024[685]=paddedInput[725];
inputBR1024[686]=paddedInput[469];
inputBR1024[687]=paddedInput[981];
inputBR1024[688]=paddedInput[53];
inputBR1024[689]=paddedInput[565];
inputBR1024[690]=paddedInput[309];
inputBR1024[691]=paddedInput[821];
inputBR1024[692]=paddedInput[181];
inputBR1024[693]=paddedInput[693];
inputBR1024[694]=paddedInput[437];
inputBR1024[695]=paddedInput[949];
inputBR1024[696]=paddedInput[117];
inputBR1024[697]=paddedInput[629];
inputBR1024[698]=paddedInput[373];
inputBR1024[699]=paddedInput[885];
inputBR1024[700]=paddedInput[245];
inputBR1024[701]=paddedInput[757];
inputBR1024[702]=paddedInput[501];
inputBR1024[703]=paddedInput[1013];
inputBR1024[704]=paddedInput[13];
inputBR1024[705]=paddedInput[525];
inputBR1024[706]=paddedInput[269];
inputBR1024[707]=paddedInput[781];
inputBR1024[708]=paddedInput[141];
inputBR1024[709]=paddedInput[653];
inputBR1024[710]=paddedInput[397];
inputBR1024[711]=paddedInput[909];
inputBR1024[712]=paddedInput[77];
inputBR1024[713]=paddedInput[589];
inputBR1024[714]=paddedInput[333];
inputBR1024[715]=paddedInput[845];
inputBR1024[716]=paddedInput[205];
inputBR1024[717]=paddedInput[717];
inputBR1024[718]=paddedInput[461];
inputBR1024[719]=paddedInput[973];
inputBR1024[720]=paddedInput[45];
inputBR1024[721]=paddedInput[557];
inputBR1024[722]=paddedInput[301];
inputBR1024[723]=paddedInput[813];
inputBR1024[724]=paddedInput[173];
inputBR1024[725]=paddedInput[685];
inputBR1024[726]=paddedInput[429];
inputBR1024[727]=paddedInput[941];
inputBR1024[728]=paddedInput[109];
inputBR1024[729]=paddedInput[621];
inputBR1024[730]=paddedInput[365];
inputBR1024[731]=paddedInput[877];
inputBR1024[732]=paddedInput[237];
inputBR1024[733]=paddedInput[749];
inputBR1024[734]=paddedInput[493];
inputBR1024[735]=paddedInput[1005];
inputBR1024[736]=paddedInput[29];
inputBR1024[737]=paddedInput[541];
inputBR1024[738]=paddedInput[285];
inputBR1024[739]=paddedInput[797];
inputBR1024[740]=paddedInput[157];
inputBR1024[741]=paddedInput[669];
inputBR1024[742]=paddedInput[413];
inputBR1024[743]=paddedInput[925];
inputBR1024[744]=paddedInput[93];
inputBR1024[745]=paddedInput[605];
inputBR1024[746]=paddedInput[349];
inputBR1024[747]=paddedInput[861];
inputBR1024[748]=paddedInput[221];
inputBR1024[749]=paddedInput[733];
inputBR1024[750]=paddedInput[477];
inputBR1024[751]=paddedInput[989];
inputBR1024[752]=paddedInput[61];
inputBR1024[753]=paddedInput[573];
inputBR1024[754]=paddedInput[317];
inputBR1024[755]=paddedInput[829];
inputBR1024[756]=paddedInput[189];
inputBR1024[757]=paddedInput[701];
inputBR1024[758]=paddedInput[445];
inputBR1024[759]=paddedInput[957];
inputBR1024[760]=paddedInput[125];
inputBR1024[761]=paddedInput[637];
inputBR1024[762]=paddedInput[381];
inputBR1024[763]=paddedInput[893];
inputBR1024[764]=paddedInput[253];
inputBR1024[765]=paddedInput[765];
inputBR1024[766]=paddedInput[509];
inputBR1024[767]=paddedInput[1021];
inputBR1024[768]=paddedInput[3];
inputBR1024[769]=paddedInput[515];
inputBR1024[770]=paddedInput[259];
inputBR1024[771]=paddedInput[771];
inputBR1024[772]=paddedInput[131];
inputBR1024[773]=paddedInput[643];
inputBR1024[774]=paddedInput[387];
inputBR1024[775]=paddedInput[899];
inputBR1024[776]=paddedInput[67];
inputBR1024[777]=paddedInput[579];
inputBR1024[778]=paddedInput[323];
inputBR1024[779]=paddedInput[835];
inputBR1024[780]=paddedInput[195];
inputBR1024[781]=paddedInput[707];
inputBR1024[782]=paddedInput[451];
inputBR1024[783]=paddedInput[963];
inputBR1024[784]=paddedInput[35];
inputBR1024[785]=paddedInput[547];
inputBR1024[786]=paddedInput[291];
inputBR1024[787]=paddedInput[803];
inputBR1024[788]=paddedInput[163];
inputBR1024[789]=paddedInput[675];
inputBR1024[790]=paddedInput[419];
inputBR1024[791]=paddedInput[931];
inputBR1024[792]=paddedInput[99];
inputBR1024[793]=paddedInput[611];
inputBR1024[794]=paddedInput[355];
inputBR1024[795]=paddedInput[867];
inputBR1024[796]=paddedInput[227];
inputBR1024[797]=paddedInput[739];
inputBR1024[798]=paddedInput[483];
inputBR1024[799]=paddedInput[995];
inputBR1024[800]=paddedInput[19];
inputBR1024[801]=paddedInput[531];
inputBR1024[802]=paddedInput[275];
inputBR1024[803]=paddedInput[787];
inputBR1024[804]=paddedInput[147];
inputBR1024[805]=paddedInput[659];
inputBR1024[806]=paddedInput[403];
inputBR1024[807]=paddedInput[915];
inputBR1024[808]=paddedInput[83];
inputBR1024[809]=paddedInput[595];
inputBR1024[810]=paddedInput[339];
inputBR1024[811]=paddedInput[851];
inputBR1024[812]=paddedInput[211];
inputBR1024[813]=paddedInput[723];
inputBR1024[814]=paddedInput[467];
inputBR1024[815]=paddedInput[979];
inputBR1024[816]=paddedInput[51];
inputBR1024[817]=paddedInput[563];
inputBR1024[818]=paddedInput[307];
inputBR1024[819]=paddedInput[819];
inputBR1024[820]=paddedInput[179];
inputBR1024[821]=paddedInput[691];
inputBR1024[822]=paddedInput[435];
inputBR1024[823]=paddedInput[947];
inputBR1024[824]=paddedInput[115];
inputBR1024[825]=paddedInput[627];
inputBR1024[826]=paddedInput[371];
inputBR1024[827]=paddedInput[883];
inputBR1024[828]=paddedInput[243];
inputBR1024[829]=paddedInput[755];
inputBR1024[830]=paddedInput[499];
inputBR1024[831]=paddedInput[1011];
inputBR1024[832]=paddedInput[11];
inputBR1024[833]=paddedInput[523];
inputBR1024[834]=paddedInput[267];
inputBR1024[835]=paddedInput[779];
inputBR1024[836]=paddedInput[139];
inputBR1024[837]=paddedInput[651];
inputBR1024[838]=paddedInput[395];
inputBR1024[839]=paddedInput[907];
inputBR1024[840]=paddedInput[75];
inputBR1024[841]=paddedInput[587];
inputBR1024[842]=paddedInput[331];
inputBR1024[843]=paddedInput[843];
inputBR1024[844]=paddedInput[203];
inputBR1024[845]=paddedInput[715];
inputBR1024[846]=paddedInput[459];
inputBR1024[847]=paddedInput[971];
inputBR1024[848]=paddedInput[43];
inputBR1024[849]=paddedInput[555];
inputBR1024[850]=paddedInput[299];
inputBR1024[851]=paddedInput[811];
inputBR1024[852]=paddedInput[171];
inputBR1024[853]=paddedInput[683];
inputBR1024[854]=paddedInput[427];
inputBR1024[855]=paddedInput[939];
inputBR1024[856]=paddedInput[107];
inputBR1024[857]=paddedInput[619];
inputBR1024[858]=paddedInput[363];
inputBR1024[859]=paddedInput[875];
inputBR1024[860]=paddedInput[235];
inputBR1024[861]=paddedInput[747];
inputBR1024[862]=paddedInput[491];
inputBR1024[863]=paddedInput[1003];
inputBR1024[864]=paddedInput[27];
inputBR1024[865]=paddedInput[539];
inputBR1024[866]=paddedInput[283];
inputBR1024[867]=paddedInput[795];
inputBR1024[868]=paddedInput[155];
inputBR1024[869]=paddedInput[667];
inputBR1024[870]=paddedInput[411];
inputBR1024[871]=paddedInput[923];
inputBR1024[872]=paddedInput[91];
inputBR1024[873]=paddedInput[603];
inputBR1024[874]=paddedInput[347];
inputBR1024[875]=paddedInput[859];
inputBR1024[876]=paddedInput[219];
inputBR1024[877]=paddedInput[731];
inputBR1024[878]=paddedInput[475];
inputBR1024[879]=paddedInput[987];
inputBR1024[880]=paddedInput[59];
inputBR1024[881]=paddedInput[571];
inputBR1024[882]=paddedInput[315];
inputBR1024[883]=paddedInput[827];
inputBR1024[884]=paddedInput[187];
inputBR1024[885]=paddedInput[699];
inputBR1024[886]=paddedInput[443];
inputBR1024[887]=paddedInput[955];
inputBR1024[888]=paddedInput[123];
inputBR1024[889]=paddedInput[635];
inputBR1024[890]=paddedInput[379];
inputBR1024[891]=paddedInput[891];
inputBR1024[892]=paddedInput[251];
inputBR1024[893]=paddedInput[763];
inputBR1024[894]=paddedInput[507];
inputBR1024[895]=paddedInput[1019];
inputBR1024[896]=paddedInput[7];
inputBR1024[897]=paddedInput[519];
inputBR1024[898]=paddedInput[263];
inputBR1024[899]=paddedInput[775];
inputBR1024[900]=paddedInput[135];
inputBR1024[901]=paddedInput[647];
inputBR1024[902]=paddedInput[391];
inputBR1024[903]=paddedInput[903];
inputBR1024[904]=paddedInput[71];
inputBR1024[905]=paddedInput[583];
inputBR1024[906]=paddedInput[327];
inputBR1024[907]=paddedInput[839];
inputBR1024[908]=paddedInput[199];
inputBR1024[909]=paddedInput[711];
inputBR1024[910]=paddedInput[455];
inputBR1024[911]=paddedInput[967];
inputBR1024[912]=paddedInput[39];
inputBR1024[913]=paddedInput[551];
inputBR1024[914]=paddedInput[295];
inputBR1024[915]=paddedInput[807];
inputBR1024[916]=paddedInput[167];
inputBR1024[917]=paddedInput[679];
inputBR1024[918]=paddedInput[423];
inputBR1024[919]=paddedInput[935];
inputBR1024[920]=paddedInput[103];
inputBR1024[921]=paddedInput[615];
inputBR1024[922]=paddedInput[359];
inputBR1024[923]=paddedInput[871];
inputBR1024[924]=paddedInput[231];
inputBR1024[925]=paddedInput[743];
inputBR1024[926]=paddedInput[487];
inputBR1024[927]=paddedInput[999];
inputBR1024[928]=paddedInput[23];
inputBR1024[929]=paddedInput[535];
inputBR1024[930]=paddedInput[279];
inputBR1024[931]=paddedInput[791];
inputBR1024[932]=paddedInput[151];
inputBR1024[933]=paddedInput[663];
inputBR1024[934]=paddedInput[407];
inputBR1024[935]=paddedInput[919];
inputBR1024[936]=paddedInput[87];
inputBR1024[937]=paddedInput[599];
inputBR1024[938]=paddedInput[343];
inputBR1024[939]=paddedInput[855];
inputBR1024[940]=paddedInput[215];
inputBR1024[941]=paddedInput[727];
inputBR1024[942]=paddedInput[471];
inputBR1024[943]=paddedInput[983];
inputBR1024[944]=paddedInput[55];
inputBR1024[945]=paddedInput[567];
inputBR1024[946]=paddedInput[311];
inputBR1024[947]=paddedInput[823];
inputBR1024[948]=paddedInput[183];
inputBR1024[949]=paddedInput[695];
inputBR1024[950]=paddedInput[439];
inputBR1024[951]=paddedInput[951];
inputBR1024[952]=paddedInput[119];
inputBR1024[953]=paddedInput[631];
inputBR1024[954]=paddedInput[375];
inputBR1024[955]=paddedInput[887];
inputBR1024[956]=paddedInput[247];
inputBR1024[957]=paddedInput[759];
inputBR1024[958]=paddedInput[503];
inputBR1024[959]=paddedInput[1015];
inputBR1024[960]=paddedInput[15];
inputBR1024[961]=paddedInput[527];
inputBR1024[962]=paddedInput[271];
inputBR1024[963]=paddedInput[783];
inputBR1024[964]=paddedInput[143];
inputBR1024[965]=paddedInput[655];
inputBR1024[966]=paddedInput[399];
inputBR1024[967]=paddedInput[911];
inputBR1024[968]=paddedInput[79];
inputBR1024[969]=paddedInput[591];
inputBR1024[970]=paddedInput[335];
inputBR1024[971]=paddedInput[847];
inputBR1024[972]=paddedInput[207];
inputBR1024[973]=paddedInput[719];
inputBR1024[974]=paddedInput[463];
inputBR1024[975]=paddedInput[975];
inputBR1024[976]=paddedInput[47];
inputBR1024[977]=paddedInput[559];
inputBR1024[978]=paddedInput[303];
inputBR1024[979]=paddedInput[815];
inputBR1024[980]=paddedInput[175];
inputBR1024[981]=paddedInput[687];
inputBR1024[982]=paddedInput[431];
inputBR1024[983]=paddedInput[943];
inputBR1024[984]=paddedInput[111];
inputBR1024[985]=paddedInput[623];
inputBR1024[986]=paddedInput[367];
inputBR1024[987]=paddedInput[879];
inputBR1024[988]=paddedInput[239];
inputBR1024[989]=paddedInput[751];
inputBR1024[990]=paddedInput[495];
inputBR1024[991]=paddedInput[1007];
inputBR1024[992]=paddedInput[31];
inputBR1024[993]=paddedInput[543];
inputBR1024[994]=paddedInput[287];
inputBR1024[995]=paddedInput[799];
inputBR1024[996]=paddedInput[159];
inputBR1024[997]=paddedInput[671];
inputBR1024[998]=paddedInput[415];
inputBR1024[999]=paddedInput[927];
inputBR1024[1000]=paddedInput[95];
inputBR1024[1001]=paddedInput[607];
inputBR1024[1002]=paddedInput[351];
inputBR1024[1003]=paddedInput[863];
inputBR1024[1004]=paddedInput[223];
inputBR1024[1005]=paddedInput[735];
inputBR1024[1006]=paddedInput[479];
inputBR1024[1007]=paddedInput[991];
inputBR1024[1008]=paddedInput[63];
inputBR1024[1009]=paddedInput[575];
inputBR1024[1010]=paddedInput[319];
inputBR1024[1011]=paddedInput[831];
inputBR1024[1012]=paddedInput[191];
inputBR1024[1013]=paddedInput[703];
inputBR1024[1014]=paddedInput[447];
inputBR1024[1015]=paddedInput[959];
inputBR1024[1016]=paddedInput[127];
inputBR1024[1017]=paddedInput[639];
inputBR1024[1018]=paddedInput[383];
inputBR1024[1019]=paddedInput[895];
inputBR1024[1020]=paddedInput[255];
inputBR1024[1021]=paddedInput[767];
inputBR1024[1022]=paddedInput[511];
inputBR1024[1023]=paddedInput[1023];


    // P = 0  -> 4
    for (int idx = 0, out_idx = 0; idx < 1024; idx += 4, out_idx += 8) {
        float x0aRe = inputBR1024[idx];
        float x1aRe = inputBR1024[idx + 1];
        float x2aRe = inputBR1024[idx + 2];
        float x3aRe = inputBR1024[idx + 3];

        float sum1 = x0aRe + x1aRe;
        float sum2 = x2aRe + x3aRe;
        float diff1 = x0aRe - x1aRe;
        float diff2 = x2aRe - x3aRe;

        out1024[out_idx] = sum1 + sum2;
        out1024[out_idx + 1] = 0;
        out1024[out_idx + 2] = diff1;
        out1024[out_idx + 3] = diff2;
        out1024[out_idx + 4] = sum1 - sum2;
        out1024[out_idx + 5] = 0;
        out1024[out_idx + 6] = diff1;
        out1024[out_idx + 7] = -diff2;
    }


    // P = 1  -> 16
    for (int idx = 0; idx < 2048; idx += 32) {
        float x0aRe = out1024[idx     ];
        float x0bRe = out1024[idx +  2]; 
        float x0bIm = out1024[idx +  3];
        float x0cRe = out1024[idx +  4];

        float x1aRe = out1024[idx +  8];
        out1024[idx +   8] = x0aRe - x1aRe; 
        float x1bRe = out1024[idx + 10];
        float x1bIm = out1024[idx + 11];
        float x1cRe = out1024[idx + 12];

        float x2aRe = out1024[idx + 16];
        float x2bRe = out1024[idx + 18];
        float x2bIm = out1024[idx + 19];
        float x2cRe = out1024[idx + 20];

        float x3aRe = out1024[idx + 24];
        out1024[idx +  24] = x0aRe - x1aRe;
        out1024[idx +  25] = x3aRe - x2aRe;  
        float x3bRe = out1024[idx + 26];
        float x3bIm = out1024[idx + 27];
        float x3cRe = out1024[idx + 28];

        out1024[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;  
        out1024[idx +   9] = x2aRe - x3aRe;      
        out1024[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

        float x2cRe_tRe_2c = x2cRe * t1Re_2c;
        float x3cRe_tRe_2c = x3cRe * t1Re_2c;

        float resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
        out1024[idx +  28] =   resReC1; 
        out1024[idx +   4] =   resReC1; 
        float resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c; 
        out1024[idx +   5] =   resImC1; 
        out1024[idx +  29] = - resImC1;
        float resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c; 
        out1024[idx +  20] =   resReC2;
        out1024[idx +  12] =   resReC2; 
        float resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c; 
        out1024[idx +  13] = - resImC2; 
        out1024[idx +  21] =   resImC2;  

        float x1dif = (x1bRe-x1bIm);
        float x1sum = (x1bRe+x1bIm);
        float x3dif = (x3bRe-x3bIm);
        float x3sum = (x3bRe+x3bIm);

        float x1dif_tRe_1b = x1dif * t1Re_1b;
        float x1sum_tRe_1b = x1sum * t1Re_1b;
          
        float x3dif_tRe_1b2b = x3dif * t1Re_1b2b;
        float x3dif_tRe_1b2d = x3dif * t1Re_1b2d;
        float x3sum_tRe_1b2b = x3sum * t1Re_1b2b;
        float x3sum_tRe_1b2d = x3sum * t1Re_1b2d;

        float tempReB = (x3dif_tRe_1b2b - x3sum_tRe_1b2d + x2bRe*t1Re_2b - x2bIm*t1Re_2d);
        float tempImB = (x3dif_tRe_1b2d + x3sum_tRe_1b2b + x2bRe*t1Re_2d + x2bIm*t1Re_2b);
        float tempReD = (x3dif_tRe_1b2d + x3sum_tRe_1b2b - x2bRe*t1Re_2d - x2bIm*t1Re_2b);
        float tempImD = (x3dif_tRe_1b2b - x3sum_tRe_1b2d - x2bRe*t1Re_2b + x2bIm*t1Re_2d);

        float resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;     
        out1024[idx +   2] =   resReB1; 
        out1024[idx +  30] =   resReB1;  
        float resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;     
        out1024[idx +  18] =   resReB2;
        out1024[idx +  14] =   resReB2; 
        float resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;     
        out1024[idx +   6] =   resReD1; 
        out1024[idx +  26] =   resReD1; 
        float resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;     
        out1024[idx +  22] =   resReD2;
        out1024[idx +  10] =   resReD2; 

        float resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;     
        out1024[idx +   3] =   resImB1; 
        out1024[idx +  31] = - resImB1;  
        float resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;     
        out1024[idx +  19] =   resImB2;
        out1024[idx +  15] = - resImB2; 
        float resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;     
        out1024[idx +   7] =   resImD1; 
        out1024[idx +  27] = - resImD1; 
        float resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;     
        out1024[idx +  23] =   resImD2;  
        out1024[idx +  11] = - resImD2; 
    }

    // P = 2  -> 64
    for(int idx = 0; idx < 2048; idx+=128){
        float x0aRe_0 = out1024[idx       ];
        float x0bRe_0 = out1024[idx   +  2]; float x0bIm_0 = out1024[idx   +  3];
        float x0cRe_0 = out1024[idx   +  4]; float x0cIm_0 = out1024[idx   +  5];
        float x0dRe_0 = out1024[idx   +  6]; float x0dIm_0 = out1024[idx   +  7];
        float x0aRe_4 = out1024[idx   +  8]; float x0aIm_4 = out1024[idx   +  9];
        float x0bRe_4 = out1024[idx   + 10]; float x0bIm_4 = out1024[idx   + 11];
        float x0cRe_4 = out1024[idx   + 12]; float x0cIm_4 = out1024[idx   + 13];
        float x0dRe_4 = out1024[idx   + 14]; float x0dIm_4 = out1024[idx   + 15];
        float x0aRe_8 = out1024[idx   + 16];                                   

        float x1aRe_0 = out1024[idx   + 32];
        float x1bRe_0 = out1024[idx   + 34]; float x1bIm_0 = out1024[idx   + 35];
        float x1cRe_0 = out1024[idx   + 36]; float x1cIm_0 = out1024[idx   + 37];
        float x1dRe_0 = out1024[idx   + 38]; float x1dIm_0 = out1024[idx   + 39];
        float x1aRe_4 = out1024[idx   + 40]; float x1aIm_4 = out1024[idx   + 41];
        float x1bRe_4 = out1024[idx   + 42]; float x1bIm_4 = out1024[idx   + 43];
        float x1cRe_4 = out1024[idx   + 44]; float x1cIm_4 = out1024[idx   + 45];
        float x1dRe_4 = out1024[idx   + 46]; float x1dIm_4 = out1024[idx   + 47];
        float x1aRe_8 = out1024[idx   + 48]; float x1aIm_8 = out1024[idx   + 49];

        float x2aRe_0 = out1024[idx   + 64]; float x2aIm_0 = out1024[idx   + 65];
        float x2bRe_0 = out1024[idx   + 66]; float x2bIm_0 = out1024[idx   + 67];
        float x2cRe_0 = out1024[idx   + 68]; float x2cIm_0 = out1024[idx   + 69];
        float x2dRe_0 = out1024[idx   + 70]; float x2dIm_0 = out1024[idx   + 71];
        float x2aRe_4 = out1024[idx   + 72]; float x2aIm_4 = out1024[idx   + 73];
        float x2bRe_4 = out1024[idx   + 74]; float x2bIm_4 = out1024[idx   + 75];
        float x2cRe_4 = out1024[idx   + 76]; float x2cIm_4 = out1024[idx   + 77];
        float x2dRe_4 = out1024[idx   + 78]; float x2dIm_4 = out1024[idx   + 79];
        float x2aRe_8 = out1024[idx   + 80]; float x2aIm_8 = out1024[idx   + 81];

        float x3aRe_0 = out1024[idx   + 96]; float x3aIm_0 = out1024[idx   + 97];
        float x3bRe_0 = out1024[idx   + 98]; float x3bIm_0 = out1024[idx   + 99];
        float x3cRe_0 = out1024[idx   +100]; float x3cIm_0 = out1024[idx   +101];
        float x3dRe_0 = out1024[idx   +102]; float x3dIm_0 = out1024[idx   +103];
        float x3aRe_4 = out1024[idx   +104]; float x3aIm_4 = out1024[idx   +105];
        float x3bRe_4 = out1024[idx   +106]; float x3bIm_4 = out1024[idx   +107];
        float x3cRe_4 = out1024[idx   +108]; float x3cIm_4 = out1024[idx   +109];
        float x3dRe_4 = out1024[idx   +110]; float x3dIm_4 = out1024[idx   +111];
        float x3aRe_8 = out1024[idx   +112]; float x3aIm_8 = out1024[idx   +113];

        float T0x1bRe = (x1bRe_0 * t2Re_1b - x1bIm_0 * t2Re_1h);
        float T0x1bIm = (x1bRe_0 * t2Re_1h + x1bIm_0 * t2Re_1b);
        float T0x3bRe = (x3bRe_0 * t2Re_1b - x3bIm_0 * t2Re_1h);
        float T0x3bIm = (x3bRe_0 * t2Re_1h + x3bIm_0 * t2Re_1b);

        float T0x0cRe = (x1cRe_0 * t2Re_1c - x1cIm_0 * t2Re_1g);
        float T0x0cIm = (x1cRe_0 * t2Re_1g + x1cIm_0 * t2Re_1c);
        float T0x2cRe = (x3cRe_0 * t2Re_1c - x3cIm_0 * t2Re_1g);
        float T0x2cIm = (x3cRe_0 * t2Re_1g + x3cIm_0 * t2Re_1c);

        float T0x1dRe = (x1dRe_0 * t2Re_1d - x1dIm_0 * t2Re_1f);
        float T0x1dIm = (x1dRe_0 * t2Re_1f + x1dIm_0 * t2Re_1d);
        float T0x3dRe = (x3dRe_0 * t2Re_1d - x3dIm_0 * t2Re_1f);
        float T0x3dIm = (x3dRe_0 * t2Re_1f + x3dIm_0 * t2Re_1d);

        out1024[idx       ] =   (x0aRe_0 + x1aRe_0) + (x2aRe_0 + x3aRe_0);
        out1024[idx  +  64] =   (x0aRe_0 + x1aRe_0) - (x2aRe_0 + x3aRe_0);
        out1024[idx  +  65] =                       - (x2aIm_0 + x3aIm_0);
        out1024[idx  +   1] =                         (x2aIm_0 + x3aIm_0); 
        float res0ReB = x0bRe_0 + T0x1bRe + ((x2bRe_0 + T0x3bRe)*  t2Re_2b - ((x2bIm_0 + T0x3bIm)*  t2Re_2p));
        out1024[idx  +   2] =   res0ReB;
        out1024[idx  + 126] =   res0ReB; 
        float res0ImB = x0bIm_0 + T0x1bIm + ((x2bRe_0 + T0x3bRe)*  t2Re_2p + ((x2bIm_0 + T0x3bIm)*  t2Re_2b)); 
        out1024[idx  + 127] = - res0ImB;
        out1024[idx  +   3] =   res0ImB;
        float res0ReC = x0cRe_0 + T0x0cRe + ((x2cRe_0 + T0x2cRe)*  t2Re_2c - ((x2cIm_0 + T0x2cIm)*  t2Re_2o));  
        out1024[idx  +   4] =   res0ReC;
        out1024[idx  + 124] =   res0ReC;
        float res0ImC = x0cIm_0 + T0x0cIm + ((x2cRe_0 + T0x2cRe)*  t2Re_2o + ((x2cIm_0 + T0x2cIm)*  t2Re_2c));
        out1024[idx  + 125] = - res0ImC;
        out1024[idx  +   5] =   res0ImC; 
        float res0ReD = x0dRe_0 + T0x1dRe + ((x2dRe_0 + T0x3dRe)*  t2Re_2d - ((x2dIm_0 + T0x3dIm)*  t2Re_2n));  
        out1024[idx  +   6] =   res0ReD;
        out1024[idx  + 122] =   res0ReD;
        float res0ImD = x0dIm_0 + T0x1dIm + ((x2dRe_0 + T0x3dRe)*  t2Re_2n + ((x2dIm_0 + T0x3dIm)*  t2Re_2d)); 
        out1024[idx  + 123] = - res0ImD;
        out1024[idx  +   7] =   res0ImD;  
        float res1ReA =    (x0aRe_0 - x1aRe_0) - (x2aIm_0 - x3aIm_0);
        out1024[idx  +  32] =   res1ReA;
        out1024[idx  +  96] =   res1ReA;
        float res1ImA =                          (x2aRe_0 - x3aRe_0); 
        out1024[idx  +  97] = - res1ImA;
        out1024[idx  +  33] =   res1ImA;
        float res1ReB = x0bRe_0 - T0x1bRe + ((x2bRe_0 - T0x3bRe)* -t2Re_2p  - ((x2bIm_0 - T0x3bIm)*  t2Re_2b ));
        out1024[idx  +  34] =   res1ReB;
        out1024[idx  +  94] =   res1ReB;
        float res1ImB = x0bIm_0 - T0x1bIm + ((x2bRe_0 - T0x3bRe)*  t2Re_2b  + ((x2bIm_0 - T0x3bIm)* -t2Re_2p )); 
        out1024[idx  +  95] = - res1ImB; 
        out1024[idx  +  35] =   res1ImB;
        float res1ReC = x0cRe_0 - T0x0cRe + ((x2cRe_0 - T0x2cRe)* -t2Re_2o  - ((x2cIm_0 - T0x2cIm)*  t2Re_2c )); 
        out1024[idx  +  36] =   res1ReC;
        out1024[idx  +  92] =   res1ReC;
        float res1ImC = x0cIm_0 - T0x0cIm + ((x2cRe_0 - T0x2cRe)*  t2Re_2c  + ((x2cIm_0 - T0x2cIm)* -t2Re_2o ));
        out1024[idx  +  93] = - res1ImC;  
        out1024[idx  +  37] =   res1ImC; 
        float res1ReD = x0dRe_0 - T0x1dRe + ((x2dRe_0 - T0x3dRe)* -t2Re_2n  - ((x2dIm_0 - T0x3dIm)*  t2Re_2d ));
        out1024[idx  +  38] =   res1ReD;
        out1024[idx  +  90] =   res1ReD;
        float res1ImD = x0dIm_0 - T0x1dIm + ((x2dRe_0 - T0x3dRe)*  t2Re_2d  + ((x2dIm_0 - T0x3dIm)* -t2Re_2n ));  
        out1024[idx  +  91] = - res1ImD; 
        out1024[idx  +  39] =   res1ImD;

        float T1x0aRe = (x1aRe_4 * t2Re_1e - x1aIm_4 * t2Re_1e);
        float T1x0aIm = (x1aRe_4 * t2Re_1e + x1aIm_4 * t2Re_1e);
        float T1x2aRe = (x3aRe_4 * t2Re_1e - x3aIm_4 * t2Re_1e);
        float T1x2aIm = (x3aRe_4 * t2Re_1e + x3aIm_4 * t2Re_1e);

        float T1x1bRe = (x1bRe_4 * t2Re_1f - x1bIm_4 * t2Re_1d);
        float T1x1bIm = (x1bRe_4 * t2Re_1d + x1bIm_4 * t2Re_1f);
        float T1x3bRe = (x3bRe_4 * t2Re_1f - x3bIm_4 * t2Re_1d);
        float T1x3bIm = (x3bRe_4 * t2Re_1d + x3bIm_4 * t2Re_1f);

        float T1x0cRe = (x1cRe_4 * t2Re_1g - x1cIm_4 * t2Re_1c);
        float T1x0cIm = (x1cRe_4 * t2Re_1c + x1cIm_4 * t2Re_1g);
        float T1x2cRe = (x3cRe_4 * t2Re_1g - x3cIm_4 * t2Re_1c);
        float T1x2cIm = (x3cRe_4 * t2Re_1c + x3cIm_4 * t2Re_1g);

        float T1x1dRe = (x1dRe_4 * t2Re_1h - x1dIm_4 * t2Re_1b);
        float T1x1dIm = (x1dRe_4 * t2Re_1b + x1dIm_4 * t2Re_1h);
        float T1x3dRe = (x3dRe_4 * t2Re_1h - x3dIm_4 * t2Re_1b);
        float T1x3dIm = (x3dRe_4 * t2Re_1b + x3dIm_4 * t2Re_1h);

        float res2ReA = x0aRe_4 + T1x0aRe + ((x2aRe_4 + T1x2aRe)*  t2Re_2e - ((x2aIm_4 + T1x2aIm)*  t2Re_2m));  
        out1024[idx  +   8] =   res2ReA;
        out1024[idx  + 120] =   res2ReA;
        float res2ImA = x0aIm_4 + T1x0aIm + ((x2aRe_4 + T1x2aRe)*  t2Re_2m + ((x2aIm_4 + T1x2aIm)*  t2Re_2e)); 
        out1024[idx  + 121] = - res2ImA; 
        out1024[idx  +   9] =   res2ImA;
        float res2ReB = x0bRe_4 + T1x1bRe + ((x2bRe_4 + T1x3bRe)*  t2Re_2f - ((x2bIm_4 + T1x3bIm)*  t2Re_2l));
        out1024[idx  +  10] =   res2ReB;
        out1024[idx  + 118] =   res2ReB; 
        float res2ImB = x0bIm_4 + T1x1bIm + ((x2bRe_4 + T1x3bRe)*  t2Re_2l + ((x2bIm_4 + T1x3bIm)*  t2Re_2f));  
        out1024[idx  + 119] = - res2ImB; 
        out1024[idx  +  11] =   res2ImB; 
        float res2ReC = x0cRe_4 + T1x0cRe + ((x2cRe_4 + T1x2cRe)*  t2Re_2g - ((x2cIm_4 + T1x2cIm)*  t2Re_2k));
        out1024[idx  +  12] =   res2ReC;
        out1024[idx  + 116] =   res2ReC;  
        float res2ImC = x0cIm_4 + T1x0cIm + ((x2cRe_4 + T1x2cRe)*  t2Re_2k + ((x2cIm_4 + T1x2cIm)*  t2Re_2g)); 
        out1024[idx  + 117] = - res2ImC; 
        out1024[idx  +  13] =   res2ImC; 
        float res2ReD = x0dRe_4 + T1x1dRe + ((x2dRe_4 + T1x3dRe)*  t2Re_2h - ((x2dIm_4 + T1x3dIm)*  t2Re_2j));  
        out1024[idx  +  14] =   res2ReD;
        out1024[idx  + 114] =   res2ReD;
        float res2ImD = x0dIm_4 + T1x1dIm + ((x2dRe_4 + T1x3dRe)*  t2Re_2j + ((x2dIm_4 + T1x3dIm)*  t2Re_2h));
        out1024[idx  + 115] = - res2ImD; 
        out1024[idx  +  15] =   res2ImD;
        float res3ReA = x0aRe_4 - T1x0aRe + ((x2aRe_4 - T1x2aRe)* -t2Re_2m  - ((x2aIm_4 - T1x2aIm)*  t2Re_2e ));
        out1024[idx  +  40] =   res3ReA;
        out1024[idx  +  88] =   res3ReA;
        float res3ImA = x0aIm_4 - T1x0aIm + ((x2aRe_4 - T1x2aRe)*  t2Re_2e  + ((x2aIm_4 - T1x2aIm)* -t2Re_2m )); 
        out1024[idx  +  89] = - res3ImA;
        out1024[idx  +  41] =   res3ImA; 
        float res3ReB = x0bRe_4 - T1x1bRe + ((x2bRe_4 - T1x3bRe)* -t2Re_2l  - ((x2bIm_4 - T1x3bIm)*  t2Re_2f ));
        out1024[idx  +  42] =   res3ReB; 
        out1024[idx  +  86] =   res3ReB;
        float res3ImB = x0bIm_4 - T1x1bIm + ((x2bRe_4 - T1x3bRe)*  t2Re_2f  + ((x2bIm_4 - T1x3bIm)* -t2Re_2l ));
        out1024[idx  +  87] = - res3ImB; 
        out1024[idx  +  43] =   res3ImB; 
        float res3ReC = x0cRe_4 - T1x0cRe + ((x2cRe_4 - T1x2cRe)* -t2Re_2k  - ((x2cIm_4 - T1x2cIm)*  t2Re_2g ));
        out1024[idx  +  44] =   res3ReC;
        out1024[idx  +  84] =   res3ReC;
        float res3ImC = x0cIm_4 - T1x0cIm + ((x2cRe_4 - T1x2cRe)*  t2Re_2g  + ((x2cIm_4 - T1x2cIm)* -t2Re_2k )); 
        out1024[idx  +  85] = - res3ImC;
        out1024[idx  +  45] =   res3ImC;
        float res3ReD = x0dRe_4 - T1x1dRe + ((x2dRe_4 - T1x3dRe)* -t2Re_2j  - ((x2dIm_4 - T1x3dIm)*  t2Re_2h ));
        out1024[idx  +  46] =   res3ReD;
        out1024[idx  +  82] =   res3ReD;
        float res3ImD = x0dIm_4 - T1x1dIm + ((x2dRe_4 - T1x3dRe)*  t2Re_2h  + ((x2dIm_4 - T1x3dIm)* -t2Re_2j ));
        out1024[idx  +  83] = - res3ImD;
        out1024[idx  +  47] =   res3ImD; 

        float T2x0aRe = - x1aIm_8;
        float T2x0aIm =   x1aRe_8;
        float T2x2aRe = - x3aIm_8;
        float T2x2aIm =   x3aRe_8;

        float T2x1bRe = (x1dRe_4 * -t2Re_1h - -x1dIm_4 *  t2Re_1b);
        float T2x1bIm = (x1dRe_4 *  t2Re_1b + -x1dIm_4 * -t2Re_1h);
        float T2x3bRe = (x3dRe_4 * -t2Re_1h - -x3dIm_4 *  t2Re_1b);
        float T2x3bIm = (x3dRe_4 *  t2Re_1b + -x3dIm_4 * -t2Re_1h);

        float T2x0cRe = (x1cRe_4 * -t2Re_1g - -x1cIm_4 *  t2Re_1c);
        float T2x0cIm = (x1cRe_4 *  t2Re_1c + -x1cIm_4 * -t2Re_1g);
        float T2x2cRe = (x3cRe_4 * -t2Re_1g - -x3cIm_4 *  t2Re_1c);
        float T2x2cIm = (x3cRe_4 *  t2Re_1c + -x3cIm_4 * -t2Re_1g);

        float T2x1dRe = (x1bRe_4 * -t2Re_1f - -x1bIm_4 *  t2Re_1d);
        float T2x1dIm = (x1bRe_4 *  t2Re_1d + -x1bIm_4 * -t2Re_1f);
        float T2x3dRe = (x3bRe_4 * -t2Re_1f - -x3bIm_4 *  t2Re_1d);
        float T2x3dIm = (x3bRe_4 *  t2Re_1d + -x3bIm_4 * -t2Re_1f);

        float res4ReA =  x0aRe_8 + T2x0aRe + ((x2aRe_8 + T2x2aRe)*  t2Re_2i - (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
        out1024[idx  +  16] =   res4ReA;
        out1024[idx  + 112] =   res4ReA; 
        float res4ImA =  0       + T2x0aIm + ((x2aRe_8 + T2x2aRe)*  t2Re_2i + (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
        out1024[idx  + 113] = - res4ImA; 
        out1024[idx  +  17] =   res4ImA;
        float res4ReB =  x0dRe_4 + T2x1bRe + ((x2dRe_4 + T2x3bRe)*  t2Re_2j - ((-x2dIm_4 + T2x3bIm)*  t2Re_2h)); 
        out1024[idx  +  18] =   res4ReB;
        out1024[idx  + 110] =   res4ReB;
        float res4ImB = -x0dIm_4 + T2x1bIm + ((x2dRe_4 + T2x3bRe)*  t2Re_2h + ((-x2dIm_4 + T2x3bIm)*  t2Re_2j)); 
        out1024[idx  + 111] = - res4ImB; 
        out1024[idx  +  19] =   res4ImB; 
        float res4ReC =  x0cRe_4 + T2x0cRe + ((x2cRe_4 + T2x2cRe)*  t2Re_2k - ((-x2cIm_4 + T2x2cIm)*  t2Re_2g)); 
        out1024[idx  +  20] =   res4ReC;
        out1024[idx  + 108] =   res4ReC; 
        float res4ImC = -x0cIm_4 + T2x0cIm + ((x2cRe_4 + T2x2cRe)*  t2Re_2g + ((-x2cIm_4 + T2x2cIm)*  t2Re_2k));   
        out1024[idx  + 109] = - res4ImC;
        out1024[idx  +  21] =   res4ImC;
        float res4ReD =  x0bRe_4 + T2x1dRe + ((x2bRe_4 + T2x3dRe)*  t2Re_2l - ((-x2bIm_4 + T2x3dIm)*  t2Re_2f)); 
        out1024[idx  +  22] =   res4ReD;
        out1024[idx  + 106] =   res4ReD; 
        float res4ImD = -x0bIm_4 + T2x1dIm + ((x2bRe_4 + T2x3dRe)*  t2Re_2f + ((-x2bIm_4 + T2x3dIm)*  t2Re_2l)); 
        out1024[idx  + 107] = - res4ImD;
        out1024[idx  +  23] =   res4ImD;
        float res5ReA =  x0aRe_8 - T2x0aRe + ((x2aRe_8 - T2x2aRe)* -t2Re_2i  - (( x2aIm_8 - T2x2aIm)*  t2Re_2i ));
        out1024[idx  +  48] =   res5ReA;
        out1024[idx  +  80] =   res5ReA;
        float res5ImA =  0       - T2x0aIm + ((x2aRe_8 - T2x2aRe)*  t2Re_2i  + (( x2aIm_8 - T2x2aIm)* -t2Re_2i ));
        out1024[idx  +  81] = - res5ImA;
        out1024[idx  +  49] =   res5ImA; 
        float res5ReB =  x0dRe_4 - T2x1bRe + ((x2dRe_4 - T2x3bRe)* -t2Re_2h  - ((-x2dIm_4 - T2x3bIm)*  t2Re_2j ));
        out1024[idx  +  50] =   res5ReB;
        out1024[idx  +  78] =   res5ReB;
        float res5ImB = -x0dIm_4 - T2x1bIm + ((x2dRe_4 - T2x3bRe)*  t2Re_2j  + ((-x2dIm_4 - T2x3bIm)* -t2Re_2h ));
        out1024[idx  +  79] = - res5ImB;
        out1024[idx  +  51] =   res5ImB; 
        float res5ReC =  x0cRe_4 - T2x0cRe + ((x2cRe_4 - T2x2cRe)* -t2Re_2g  - ((-x2cIm_4 - T2x2cIm)*  t2Re_2k ));
        out1024[idx  +  52] =   res5ReC;
        out1024[idx  +  76] =   res5ReC;
        float res5ImC = -x0cIm_4 - T2x0cIm + ((x2cRe_4 - T2x2cRe)*  t2Re_2k  + ((-x2cIm_4 - T2x2cIm)* -t2Re_2g ));
        out1024[idx  +  77] = - res5ImC; 
        out1024[idx  +  53] =   res5ImC;
        float res5ReD =  x0bRe_4 - T2x1dRe + ((x2bRe_4 - T2x3dRe)* -t2Re_2f  - ((-x2bIm_4 - T2x3dIm)*  t2Re_2l ));
        out1024[idx  +  54] =   res5ReD;
        out1024[idx  +  74] =   res5ReD;
        float res5ImD = -x0bIm_4 - T2x1dIm + ((x2bRe_4 - T2x3dRe)*  t2Re_2l  + ((-x2bIm_4 - T2x3dIm)* -t2Re_2f ));
        out1024[idx  +  75] = - res5ImD;
        out1024[idx  +  55] =   res5ImD;

        float T3x0aRe = (x1aRe_4  * -t2Re_1e - -x1aIm_4 *  t2Re_1e);
        float T3x0aIm = (x1aRe_4  *  t2Re_1e + -x1aIm_4 * -t2Re_1e);
        float T3x2aRe = (x3aRe_4  * -t2Re_1e - -x3aIm_4 *  t2Re_1e);
        float T3x2aIm = (x3aRe_4  *  t2Re_1e + -x3aIm_4 * -t2Re_1e);

        float T3x1bRe = (x1dRe_0  * -t2Re_1d - -x1dIm_0 *  t2Re_1f);
        float T3x1bIm = (x1dRe_0  *  t2Re_1f + -x1dIm_0 * -t2Re_1d);
        float T3x3bRe = (x3dRe_0  * -t2Re_1d - -x3dIm_0 *  t2Re_1f);
        float T3x3bIm = (x3dRe_0  *  t2Re_1f + -x3dIm_0 * -t2Re_1d);

        float T3x0cRe = (x1cRe_0  * -t2Re_1c - -x1cIm_0 *  t2Re_1g);
        float T3x0cIm = (x1cRe_0  *  t2Re_1g + -x1cIm_0 * -t2Re_1c);
        float T3x2cRe = (x3cRe_0  * -t2Re_1c - -x3cIm_0 *  t2Re_1g);
        float T3x2cIm = (x3cRe_0  *  t2Re_1g + -x3cIm_0 * -t2Re_1c);

        float T3x1dRe = (x1bRe_0  * -t2Re_1b - -x1bIm_0 *  t2Re_1h);
        float T3x1dIm = (x1bRe_0  *  t2Re_1h + -x1bIm_0 * -t2Re_1b);
        float T3x3dRe = (x3bRe_0  * -t2Re_1b - -x3bIm_0 *  t2Re_1h);
        float T3x3dIm = (x3bRe_0  *  t2Re_1h + -x3bIm_0 * -t2Re_1b);

        float res6ReA =  x0aRe_4 + T3x0aRe + ((x2aRe_4 + T3x2aRe)*  t2Re_2m - ((-x2aIm_4 + T3x2aIm)*  t2Re_2e));  
        out1024[idx  +  24] =   res6ReA;
        out1024[idx  + 104] =   res6ReA;
        float res6ImA = -x0aIm_4 + T3x0aIm + ((x2aRe_4 + T3x2aRe)*  t2Re_2e + ((-x2aIm_4 + T3x2aIm)*  t2Re_2m)); 
        out1024[idx  + 105] = - res6ImA; 
        out1024[idx  +  25] =   res6ImA;
        float res6ReB =  x0dRe_0 + T3x1bRe + ((x2dRe_0 + T3x3bRe)*  t2Re_2n - ((-x2dIm_0 + T3x3bIm)*  t2Re_2d)); 
        out1024[idx  +  26] =   res6ReB;
        out1024[idx  + 102] =   res6ReB;
        float res6ImB = -x0dIm_0 + T3x1bIm + ((x2dRe_0 + T3x3bRe)*  t2Re_2d + ((-x2dIm_0 + T3x3bIm)*  t2Re_2n)); 
        out1024[idx  + 103] = - res6ImB; 
        out1024[idx  +  27] =   res6ImB; 
        float res6ReC =  x0cRe_0 + T3x0cRe + ((x2cRe_0 + T3x2cRe)*  t2Re_2o - ((-x2cIm_0 + T3x2cIm)*  t2Re_2c));  
        out1024[idx  +  28] =   res6ReC;
        out1024[idx  + 100] =   res6ReC;
        float res6ImC = -x0cIm_0 + T3x0cIm + ((x2cRe_0 + T3x2cRe)*  t2Re_2c + ((-x2cIm_0 + T3x2cIm)*  t2Re_2o)); 
        out1024[idx  + 101] = - res6ImC; 
        out1024[idx  +  29] =   res6ImC; 
        float res6ReD =  x0bRe_0 + T3x1dRe + ((x2bRe_0 + T3x3dRe)*  t2Re_2p - ((-x2bIm_0 + T3x3dIm)*  t2Re_2b)); 
        out1024[idx  +  30] =   res6ReD;
        out1024[idx  +  98] =   res6ReD; 
        float res6ImD = -x0bIm_0 + T3x1dIm + ((x2bRe_0 + T3x3dRe)*  t2Re_2b + ((-x2bIm_0 + T3x3dIm)*  t2Re_2p)); 
        out1024[idx  +  99] = - res6ImD;
        out1024[idx  +  31] =   res6ImD;
        float res7ReA =  x0aRe_4 - T3x0aRe + ((x2aRe_4 - T3x2aRe)* -t2Re_2e  - ((-x2aIm_4 - T3x2aIm)*  t2Re_2m ));
        out1024[idx  +  56] =   res7ReA;
        out1024[idx  +  72] =   res7ReA;
        float res7ImA = -x0aIm_4 - T3x0aIm + ((x2aRe_4 - T3x2aRe)*  t2Re_2m  + ((-x2aIm_4 - T3x2aIm)* -t2Re_2e ));
        out1024[idx  +  73] = - res7ImA;
        out1024[idx  +  57] =   res7ImA;
        float res7ReB =  x0dRe_0 - T3x1bRe + ((x2dRe_0 - T3x3bRe)* -t2Re_2d  - ((-x2dIm_0 - T3x3bIm)*  t2Re_2n ));
        out1024[idx  +  58] =   res7ReB;
        out1024[idx  +  70] =   res7ReB;
        float res7ImB = -x0dIm_0 - T3x1bIm + ((x2dRe_0 - T3x3bRe)*  t2Re_2n  + ((-x2dIm_0 - T3x3bIm)* -t2Re_2d ));
        out1024[idx  +  71] = - res7ImB; 
        out1024[idx  +  59] =   res7ImB;
        float res7ReC =  x0cRe_0 - T3x0cRe + ((x2cRe_0 - T3x2cRe)* -t2Re_2c  - ((-x2cIm_0 - T3x2cIm)*  t2Re_2o ));
        out1024[idx  +  60] =   res7ReC;
        out1024[idx  +  68] =   res7ReC;
        float res7ImC = -x0cIm_0 - T3x0cIm + ((x2cRe_0 - T3x2cRe)*  t2Re_2o  + ((-x2cIm_0 - T3x2cIm)* -t2Re_2c ));
        out1024[idx  +  69] = - res7ImC;
        out1024[idx  +  61] =   res7ImC;
        float res7ReD =  x0bRe_0 - T3x1dRe + ((x2bRe_0 - T3x3dRe)* -t2Re_2b  - ((-x2bIm_0 - T3x3dIm)*  t2Re_2p ));
        out1024[idx  +  62] =   res7ReD;
        out1024[idx  +  66] =   res7ReD;
        float res7ImD = -x0bIm_0 - T3x1dIm + ((x2bRe_0 - T3x3dRe)*  t2Re_2p  + ((-x2bIm_0 - T3x3dIm)* -t2Re_2b ));
        out1024[idx  +  67] = - res7ImD;
        out1024[idx  +  63] =   res7ImD;
    }


    /////////////////////////////////////////////
    // P = 2.5  -> 128
    //
    for(int idx = 0; idx < 2048; idx += 256){
        float oRe0 = out1024[idx + 128];
        float oIm0 = out1024[idx + 129];
        float eRe0 = out1024[idx];
        float eIm0 = out1024[idx + 1];
        float resRe0_s = eRe0 + oRe0;
        out1024[idx] = resRe0_s;
        float resIm0_s = eIm0 + oIm0;
        out1024[idx + 1] = resIm0_s;
        float resRe0_d = eRe0 - oRe0;
        out1024[idx + 128] = resRe0_d;
        float resIm0_d = eIm0 - oIm0;
        out1024[idx + 129] = resIm0_d;

        float oRe1 = out1024[idx + 130];
        float oIm1 = out1024[idx + 131];
        float eRe1 = out1024[idx + 2];
        float eIm1 = out1024[idx + 3];
        float resIm1_s = eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out1024[idx + 3] = resIm1_s;
        out1024[idx + 255] = -resIm1_s;
        float resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe31);
        out1024[idx + 254] = resRe1_s;
        out1024[idx + 2] = resRe1_s;
        float resRe63_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe31);
        out1024[idx + 130] = resRe63_s;
        out1024[idx + 126] = resRe63_s;
        float resIm63_s = -eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out1024[idx + 127] = resIm63_s;
        out1024[idx + 131] = -resIm63_s;

        float oRe2 = out1024[idx + 132];
        float oIm2 = out1024[idx + 133];
        float eRe2 = out1024[idx + 4];
        float eIm2 = out1024[idx + 5];
        float resIm2_s = eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out1024[idx + 5] = resIm2_s;
        out1024[idx + 253] = -resIm2_s;
        float resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe30);
        out1024[idx + 252] = resRe2_s;
        out1024[idx + 4] = resRe2_s;
        float resRe62_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe30);
        out1024[idx + 132] = resRe62_s;
        out1024[idx + 124] = resRe62_s;
        float resIm62_s = -eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out1024[idx + 125] = resIm62_s;
        out1024[idx + 133] = -resIm62_s;

        float oRe3 = out1024[idx + 134];
        float oIm3 = out1024[idx + 135];
        float eRe3 = out1024[idx + 6];
        float eIm3 = out1024[idx + 7];
        float resIm3_s = eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out1024[idx + 7] = resIm3_s;
        out1024[idx + 251] = -resIm3_s;
        float resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe29);
        out1024[idx + 250] = resRe3_s;
        out1024[idx + 6] = resRe3_s;
        float resRe61_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe29);
        out1024[idx + 134] = resRe61_s;
        out1024[idx + 122] = resRe61_s;
        float resIm61_s = -eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out1024[idx + 123] = resIm61_s;
        out1024[idx + 135] = -resIm61_s;

        float oRe4   = out1024[idx +  136]; 
        float oIm4  = out1024[idx +  137];
        float eRe4   = out1024[idx +    8]; 
        float eIm4  = out1024[idx +    9];
        float resIm4_s = eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out1024[idx + 9] = resIm4_s;
        out1024[idx + 249] = -resIm4_s;
        float resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe28);
        out1024[idx + 248] = resRe4_s;
        out1024[idx + 8] = resRe4_s; 
        float resRe60_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe28);
        out1024[idx + 136] = resRe60_s;
        out1024[idx + 120] = resRe60_s; 
        float resIm60_s = -eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out1024[idx + 121] = resIm60_s;
        out1024[idx + 137] = -resIm60_s;

        float oRe5 = out1024[idx + 138]; 
        float oIm5 = out1024[idx + 139];
        float eRe5 = out1024[idx + 10]; 
        float eIm5 = out1024[idx + 11];
        float resIm5_s = eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out1024[idx + 11] = resIm5_s;
        out1024[idx + 247] = -resIm5_s;
        float resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe27);
        out1024[idx + 246] = resRe5_s;
        out1024[idx + 10] = resRe5_s; 
        float resRe59_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe27);
        out1024[idx + 138] = resRe59_s;
        out1024[idx + 118] = resRe59_s; 
        float resIm59_s = -eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out1024[idx + 119] = resIm59_s;
        out1024[idx + 139] = -resIm59_s;

        float oRe6 = out1024[idx + 140]; 
        float oIm6 = out1024[idx + 141];
        float eRe6 = out1024[idx + 12]; 
        float eIm6 = out1024[idx + 13];
        float resIm6_s = eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out1024[idx + 13] = resIm6_s;
        out1024[idx + 245] = -resIm6_s;
        float resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe26);
        out1024[idx + 244] = resRe6_s;
        out1024[idx + 12] = resRe6_s; 
        float resRe58_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe26);
        out1024[idx + 140] = resRe58_s;
        out1024[idx + 116] = resRe58_s; 
        float resIm58_s = -eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out1024[idx + 117] = resIm58_s;
        out1024[idx + 141] = -resIm58_s;

        float oRe7 = out1024[idx + 142]; 
        float oIm7 = out1024[idx + 143];
        float eRe7 = out1024[idx + 14]; 
        float eIm7 = out1024[idx + 15];
        float resIm7_s = eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out1024[idx + 15] = resIm7_s;
        out1024[idx + 243] = -resIm7_s;
        float resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe25);
        out1024[idx + 242] = resRe7_s;
        out1024[idx + 14] = resRe7_s; 
        float resRe57_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe25);
        out1024[idx + 142] = resRe57_s;
        out1024[idx + 114] = resRe57_s; 
        float resIm57_s = -eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out1024[idx + 115] = resIm57_s;
        out1024[idx + 143] = -resIm57_s;

        float oRe8 = out1024[idx + 144]; 
        float oIm8 = out1024[idx + 145];
        float eRe8 = out1024[idx + 16]; 
        float eIm8 = out1024[idx + 17];
        float resIm8_s = eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out1024[idx + 17] = resIm8_s;
        out1024[idx + 241] = -resIm8_s;
        float resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe24);
        out1024[idx + 240] = resRe8_s;
        out1024[idx + 16] = resRe8_s; 
        float resRe56_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe24);
        out1024[idx + 144] = resRe56_s;
        out1024[idx + 112] = resRe56_s; 
        float resIm56_s = -eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out1024[idx + 113] = resIm56_s;
        out1024[idx + 145] = -resIm56_s;

        float oRe9 = out1024[idx + 146]; 
        float oIm9 = out1024[idx + 147];
        float eRe9 = out1024[idx + 18]; 
        float eIm9 = out1024[idx + 19];
        float resIm9_s = eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out1024[idx + 19] = resIm9_s;
        out1024[idx + 239] = -resIm9_s;
        float resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe23);
        out1024[idx + 238] = resRe9_s;
        out1024[idx + 18] = resRe9_s; 
        float resRe55_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe23);
        out1024[idx + 146] = resRe55_s;
        out1024[idx + 110] = resRe55_s; 
        float resIm55_s = -eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out1024[idx + 111] = resIm55_s;
        out1024[idx + 147] = -resIm55_s;

        float oRe10 = out1024[idx + 148]; 
        float oIm10 = out1024[idx + 149];
        float eRe10 = out1024[idx + 20]; 
        float eIm10 = out1024[idx + 21];
        float resIm10_s = eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out1024[idx + 21] = resIm10_s;
        out1024[idx + 237] = -resIm10_s;
        float resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe22);
        out1024[idx + 236] = resRe10_s;
        out1024[idx + 20] = resRe10_s; 
        float resRe54_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe22);
        out1024[idx + 148] = resRe54_s;
        out1024[idx + 108] = resRe54_s; 
        float resIm54_s = -eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out1024[idx + 109] = resIm54_s;
        out1024[idx + 149] = -resIm54_s;

        float oRe11 = out1024[idx + 150]; 
        float oIm11 = out1024[idx + 151];
        float eRe11 = out1024[idx + 22]; 
        float eIm11 = out1024[idx + 23];
        float resIm11_s = eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out1024[idx + 23] = resIm11_s;
        out1024[idx + 235] = -resIm11_s;
        float resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe21);
        out1024[idx + 234] = resRe11_s;
        out1024[idx + 22] = resRe11_s; 
        float resRe53_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe21);
        out1024[idx + 150] = resRe53_s;
        out1024[idx + 106] = resRe53_s; 
        float resIm53_s = -eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out1024[idx + 107] = resIm53_s;
        out1024[idx + 151] = -resIm53_s;

        float oRe12 = out1024[idx + 152]; 
        float oIm12 = out1024[idx + 153];
        float eRe12 = out1024[idx + 24]; 
        float eIm12 = out1024[idx + 25];
        float resIm12_s = eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out1024[idx + 25] = resIm12_s;
        out1024[idx + 233] = -resIm12_s;
        float resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe20);
        out1024[idx + 232] = resRe12_s;
        out1024[idx + 24] = resRe12_s; 
        float resRe52_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe20);
        out1024[idx + 152] = resRe52_s;
        out1024[idx + 104] = resRe52_s; 
        float resIm52_s = -eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out1024[idx + 105] = resIm52_s;
        out1024[idx + 153] = -resIm52_s;

        float oRe13 = out1024[idx + 154]; 
        float oIm13 = out1024[idx + 155];
        float eRe13 = out1024[idx + 26]; 
        float eIm13 = out1024[idx + 27];
        float resIm13_s = eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out1024[idx + 27] = resIm13_s;
        out1024[idx + 231] = -resIm13_s;
        float resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe19);
        out1024[idx + 230] = resRe13_s;
        out1024[idx + 26] = resRe13_s; 
        float resRe51_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe19);
        out1024[idx + 154] = resRe51_s;
        out1024[idx + 102] = resRe51_s; 
        float resIm51_s = -eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out1024[idx + 103] = resIm51_s;
        out1024[idx + 155] = -resIm51_s;

        float oRe14 = out1024[idx + 156]; 
        float oIm14 = out1024[idx + 157];
        float eRe14 = out1024[idx + 28]; 
        float eIm14 = out1024[idx + 29];
        float resIm14_s = eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out1024[idx + 29] = resIm14_s;
        out1024[idx + 229] = -resIm14_s;
        float resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe18);
        out1024[idx + 228] = resRe14_s;
        out1024[idx + 28] = resRe14_s; 
        float resRe50_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe18);
        out1024[idx + 156] = resRe50_s;
        out1024[idx + 100] = resRe50_s; 
        float resIm50_s = -eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out1024[idx + 101] = resIm50_s;
        out1024[idx + 157] = -resIm50_s;

        float oRe15 = out1024[idx + 158]; 
        float oIm15 = out1024[idx + 159];
        float eRe15 = out1024[idx + 30]; 
        float eIm15 = out1024[idx + 31];
        float resIm15_s = eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out1024[idx + 31] = resIm15_s;
        out1024[idx + 227] = -resIm15_s;
        float resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe17);
        out1024[idx + 226] = resRe15_s;
        out1024[idx + 30] = resRe15_s; 
        float resRe49_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe17);
        out1024[idx + 158] = resRe49_s;
        out1024[idx + 98] = resRe49_s; 
        float resIm49_s = -eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out1024[idx + 99] = resIm49_s;
        out1024[idx + 159] = -resIm49_s;

        float oRe16 = out1024[idx + 160]; 
        float oIm16 = out1024[idx + 161];
        float eRe16 = out1024[idx + 32]; 
        float eIm16 = out1024[idx + 33];
        float resIm16_s = eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out1024[idx + 33] = resIm16_s;
        out1024[idx + 225] = -resIm16_s;
        float resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe16);
        out1024[idx + 224] = resRe16_s;
        out1024[idx + 32] = resRe16_s; 
        float resRe48_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe16);
        out1024[idx + 160] = resRe48_s;
        out1024[idx + 96] = resRe48_s; 
        float resIm48_s = -eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out1024[idx + 97] = resIm48_s;
        out1024[idx + 161] = -resIm48_s;

        float oRe17 = out1024[idx + 162]; 
        float oIm17 = out1024[idx + 163];
        float eRe17 = out1024[idx + 34]; 
        float eIm17 = out1024[idx + 35];
        float resIm17_s = eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out1024[idx + 35] = resIm17_s;
        out1024[idx + 223] = -resIm17_s;
        float resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe15);
        out1024[idx + 222] = resRe17_s;
        out1024[idx + 34] = resRe17_s; 
        float resRe47_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe15);
        out1024[idx + 162] = resRe47_s;
        out1024[idx + 94] = resRe47_s; 
        float resIm47_s = -eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out1024[idx + 95] = resIm47_s;
        out1024[idx + 163] = -resIm47_s;

        float oRe18 = out1024[idx + 164]; 
        float oIm18 = out1024[idx + 165];
        float eRe18 = out1024[idx + 36]; 
        float eIm18 = out1024[idx + 37];
        float resIm18_s = eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out1024[idx + 37] = resIm18_s;
        out1024[idx + 221] = -resIm18_s;
        float resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe14);
        out1024[idx + 220] = resRe18_s;
        out1024[idx + 36] = resRe18_s; 
        float resRe46_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe14);
        out1024[idx + 164] = resRe46_s;
        out1024[idx + 92] = resRe46_s; 
        float resIm46_s = -eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out1024[idx + 93] = resIm46_s;
        out1024[idx + 165] = -resIm46_s;

        float oRe19 = out1024[idx + 166]; 
        float oIm19 = out1024[idx + 167];
        float eRe19 = out1024[idx + 38]; 
        float eIm19 = out1024[idx + 39];
        float resIm19_s = eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out1024[idx + 39] = resIm19_s;
        out1024[idx + 219] = -resIm19_s;
        float resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe13);
        out1024[idx + 218] = resRe19_s;
        out1024[idx + 38] = resRe19_s; 
        float resRe45_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe13);
        out1024[idx + 166] = resRe45_s;
        out1024[idx + 90] = resRe45_s; 
        float resIm45_s = -eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out1024[idx + 91] = resIm45_s;
        out1024[idx + 167] = -resIm45_s;

        float oRe20 = out1024[idx + 168]; 
        float oIm20 = out1024[idx + 169];
        float eRe20 = out1024[idx + 40]; 
        float eIm20 = out1024[idx + 41];
        float resIm20_s = eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out1024[idx + 41] = resIm20_s;
        out1024[idx + 217] = -resIm20_s;
        float resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe12);
        out1024[idx + 216] = resRe20_s;
        out1024[idx + 40] = resRe20_s; 
        float resRe44_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe12);
        out1024[idx + 168] = resRe44_s;
        out1024[idx + 88] = resRe44_s; 
        float resIm44_s = -eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out1024[idx + 89] = resIm44_s;
        out1024[idx + 169] = -resIm44_s;

        float oRe21 = out1024[idx + 170]; 
        float oIm21 = out1024[idx + 171];
        float eRe21 = out1024[idx + 42]; 
        float eIm21 = out1024[idx + 43];
        float resIm21_s = eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out1024[idx + 43] = resIm21_s;
        out1024[idx + 215] = -resIm21_s;
        float resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe11);
        out1024[idx + 214] = resRe21_s;
        out1024[idx + 42] = resRe21_s; 
        float resRe43_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe11);
        out1024[idx + 170] = resRe43_s;
        out1024[idx + 86] = resRe43_s; 
        float resIm43_s = -eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out1024[idx + 87] = resIm43_s;
        out1024[idx + 171] = -resIm43_s;

        float oRe22 = out1024[idx + 172]; 
        float oIm22 = out1024[idx + 173];
        float eRe22 = out1024[idx + 44]; 
        float eIm22 = out1024[idx + 45];
        float resIm22_s = eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out1024[idx + 45] = resIm22_s;
        out1024[idx + 213] = -resIm22_s;
        float resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe10);
        out1024[idx + 212] = resRe22_s;
        out1024[idx + 44] = resRe22_s; 
        float resRe42_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe10);
        out1024[idx + 172] = resRe42_s;
        out1024[idx + 84] = resRe42_s; 
        float resIm42_s = -eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out1024[idx + 85] = resIm42_s;
        out1024[idx + 173] = -resIm42_s;

        float oRe23 = out1024[idx + 174]; 
        float oIm23 = out1024[idx + 175];
        float eRe23 = out1024[idx + 46]; 
        float eIm23 = out1024[idx + 47];
        float resIm23_s = eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out1024[idx + 47] = resIm23_s;
        out1024[idx + 211] = -resIm23_s;
        float resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe9);
        out1024[idx + 210] = resRe23_s;
        out1024[idx + 46] = resRe23_s; 
        float resRe41_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe9);
        out1024[idx + 174] = resRe41_s;
        out1024[idx + 82] = resRe41_s; 
        float resIm41_s = -eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out1024[idx + 83] = resIm41_s;
        out1024[idx + 175] = -resIm41_s;

        float oRe24 = out1024[idx + 176]; 
        float oIm24 = out1024[idx + 177];
        float eRe24 = out1024[idx + 48]; 
        float eIm24 = out1024[idx + 49];
        float resIm24_s = eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out1024[idx + 49] = resIm24_s;
        out1024[idx + 209] = -resIm24_s;
        float resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe8);
        out1024[idx + 208] = resRe24_s;
        out1024[idx + 48] = resRe24_s; 
        float resRe40_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe8);
        out1024[idx + 176] = resRe40_s;
        out1024[idx + 80] = resRe40_s; 
        float resIm40_s = -eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out1024[idx + 81] = resIm40_s;
        out1024[idx + 177] = -resIm40_s;

        float oRe25 = out1024[idx + 178]; 
        float oIm25 = out1024[idx + 179];
        float eRe25 = out1024[idx + 50]; 
        float eIm25 = out1024[idx + 51];
        float resIm25_s = eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out1024[idx + 51] = resIm25_s;
        out1024[idx + 207] = -resIm25_s;
        float resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe7);
        out1024[idx + 206] = resRe25_s;
        out1024[idx + 50] = resRe25_s; 
        float resRe39_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe7);
        out1024[idx + 178] = resRe39_s;
        out1024[idx + 78] = resRe39_s; 
        float resIm39_s = -eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out1024[idx + 79] = resIm39_s;
        out1024[idx + 179] = -resIm39_s;

        float oRe26 = out1024[idx + 180]; 
        float oIm26 = out1024[idx + 181];
        float eRe26 = out1024[idx + 52]; 
        float eIm26 = out1024[idx + 53];
        float resIm26_s = eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out1024[idx + 53] = resIm26_s;
        out1024[idx + 205] = -resIm26_s;
        float resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe6);
        out1024[idx + 204] = resRe26_s;
        out1024[idx + 52] = resRe26_s; 
        float resRe38_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe6);
        out1024[idx + 180] = resRe38_s;
        out1024[idx + 76] = resRe38_s; 
        float resIm38_s = -eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out1024[idx + 77] = resIm38_s;
        out1024[idx + 181] = -resIm38_s;

        float oRe27 = out1024[idx + 182]; 
        float oIm27 = out1024[idx + 183];
        float eRe27 = out1024[idx + 54]; 
        float eIm27 = out1024[idx + 55];
        float resIm27_s = eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out1024[idx + 55] = resIm27_s;
        out1024[idx + 203] = -resIm27_s;
        float resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe5);
        out1024[idx + 202] = resRe27_s;
        out1024[idx + 54] = resRe27_s; 
        float resRe37_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe5);
        out1024[idx + 182] = resRe37_s;
        out1024[idx + 74] = resRe37_s; 
        float resIm37_s = -eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out1024[idx + 75] = resIm37_s;
        out1024[idx + 183] = -resIm37_s;

        float oRe28 = out1024[idx + 184]; 
        float oIm28 = out1024[idx + 185];
        float eRe28 = out1024[idx + 56]; 
        float eIm28 = out1024[idx + 57];
        float resIm28_s = eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out1024[idx + 57] = resIm28_s;
        out1024[idx + 201] = -resIm28_s;
        float resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe4);
        out1024[idx + 200] = resRe28_s;
        out1024[idx + 56] = resRe28_s; 
        float resRe36_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe4);
        out1024[idx + 184] = resRe36_s;
        out1024[idx + 72] = resRe36_s; 
        float resIm36_s = -eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out1024[idx + 73] = resIm36_s;
        out1024[idx + 185] = -resIm36_s;

        float oRe29 = out1024[idx + 186]; 
        float oIm29 = out1024[idx + 187];
        float eRe29 = out1024[idx + 58]; 
        float eIm29 = out1024[idx + 59];
        float resIm29_s = eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out1024[idx + 59] = resIm29_s;
        out1024[idx + 199] = -resIm29_s;
        float resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe3);
        out1024[idx + 198] = resRe29_s;
        out1024[idx + 58] = resRe29_s; 
        float resRe35_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe3);
        out1024[idx + 186] = resRe35_s;
        out1024[idx + 70] = resRe35_s; 
        float resIm35_s = -eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out1024[idx + 71] = resIm35_s;
        out1024[idx + 187] = -resIm35_s;

        float oRe30 = out1024[idx + 188]; 
        float oIm30 = out1024[idx + 189];
        float eRe30 = out1024[idx + 60]; 
        float eIm30 = out1024[idx + 61];
        float resIm30_s = eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out1024[idx + 61] = resIm30_s;
        out1024[idx + 197] = -resIm30_s;
        float resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe2);
        out1024[idx + 196] = resRe30_s;
        out1024[idx + 60] = resRe30_s; 
        float resRe34_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe2);
        out1024[idx + 188] = resRe34_s;
        out1024[idx + 68] = resRe34_s; 
        float resIm34_s = -eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out1024[idx + 69] = resIm34_s;
        out1024[idx + 189] = -resIm34_s;

        float oRe31 = out1024[idx + 190]; 
        float oIm31 = out1024[idx + 191];
        float eRe31 = out1024[idx + 62]; 
        float eIm31 = out1024[idx + 63];
        float resIm31_s = eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out1024[idx + 63] = resIm31_s;
        out1024[idx + 195] = -resIm31_s;
        float resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe1);
        out1024[idx + 194] = resRe31_s;
        out1024[idx + 62] = resRe31_s; 
        float resRe33_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe1);
        out1024[idx + 190] = resRe33_s;
        out1024[idx + 66] = resRe33_s; 
        float resIm33_s = -eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out1024[idx + 67] = resIm33_s;
        out1024[idx + 191] = -resIm33_s;

        float oRe32  = out1024[idx +  192]; 
        float oIm32  = out1024[idx +  193];
        float eRe32  = out1024[idx +   64]; 
        float eIm32  = out1024[idx +   65];
        float resIm32_s = eIm32 + oRe32;
        out1024[idx +  65] =  resIm32_s;
        out1024[idx + 193] = -resIm32_s;
        float resRe32_s = eRe32 - oIm32;
        out1024[idx + 192] =  resRe32_s;
        out1024[idx +  64] =  resRe32_s; 
    }


   
    /////////////////////////////////////////////
    // P = 3  -> 256
    //

        for (int j = 0; j < 128; j++) {
            int eI  = j;
            int oI  = j + 128;

            if(j > 64){
              out1024[eI * 2]      =  out1024[512 - eI * 2] ;
              out1024[eI * 2 + 1]  = -out1024[512 - eI * 2 + 1];
              out1024[oI * 2]      =  out1024[512 - oI * 2];
              out1024[oI * 2 + 1]  = -out1024[512 - oI * 2 + 1];
              continue;
            }

            float eRe  = out1024[eI * 2];
            float eIm  = out1024[eI * 2 + 1];
            float oRe  = out1024[oI * 2];
            float oIm  = out1024[oI * 2 + 1];

            float tRe = ____F[254 + (j * 2 + 0)];
            float tIm = ____F[254 + (j * 2 + 1)];

            float t_oRe = oRe * tRe - oIm * tIm;
            float t_oIm = oRe * tIm + oIm * tRe;

            out1024[eI * 2]      = eRe + t_oRe;
            out1024[eI * 2 + 1]  = eIm + t_oIm;
            out1024[oI * 2]      = eRe - t_oRe;
            out1024[oI * 2 + 1]  = eIm - t_oIm;
        }

        for (int j = 0; j < 128; j++) {
            int eI = 256 + j;
            int oI  = 256 + j + 128;

            float eRe  = out1024[eI * 2];
            float eIm  = out1024[eI * 2 + 1];
            float oRe  = out1024[oI * 2];
            float oIm  = out1024[oI * 2 + 1];

            float tRe = ____F[254 + (j * 2 + 0)];
            float tIm = ____F[254 + (j * 2 + 1)];

            float t_oRe = oRe * tRe - oIm * tIm;
            float t_oIm = oRe * tIm + oIm * tRe;

            out1024[eI * 2]      = eRe + t_oRe;
            out1024[eI * 2 + 1]  = eIm + t_oIm;
            out1024[oI * 2]      = eRe - t_oRe;
            out1024[oI * 2 + 1]  = eIm - t_oIm;
        }

        for (int j = 0; j < 128; j++) {
            int eI = 512 + j;
            int oI  = 512 + j + 128;

            float eRe  = out1024[eI * 2];
            float eIm  = out1024[eI * 2 + 1];
            float oRe  = out1024[oI * 2];
            float oIm  = out1024[oI * 2 + 1];

            float tRe = ____F[254 + (j * 2 + 0)];
            float tIm = ____F[254 + (j * 2 + 1)];

            float t_oRe = oRe * tRe - oIm * tIm;
            float t_oIm = oRe * tIm + oIm * tRe;

            out1024[eI * 2]      = eRe + t_oRe;
            out1024[eI * 2 + 1]  = eIm + t_oIm;
            out1024[oI * 2]      = eRe - t_oRe;
            out1024[oI * 2 + 1]  = eIm - t_oIm;
        }

        for (int j = 0; j < 128; j++) {
            int eI = 768 + j;
            int oI  = 768 + j + 128;

            float eRe  = out1024[eI * 2];
            float eIm  = out1024[eI * 2 + 1];
            float oRe  = out1024[oI * 2];
            float oIm  = out1024[oI * 2 + 1];

            float tRe = ____F[254 + (j * 2 + 0)];
            float tIm = ____F[254 + (j * 2 + 1)];

            float t_oRe = oRe * tRe - oIm * tIm;
            float t_oIm = oRe * tIm + oIm * tRe;

            out1024[eI * 2]      = eRe + t_oRe;
            out1024[eI * 2 + 1]  = eIm + t_oIm;
            out1024[oI * 2]      = eRe - t_oRe;
            out1024[oI * 2 + 1]  = eIm - t_oIm;
        }


    /////////////////////////////////////////////
    // P = 4  -> 512
    //

        for (int j = 0; j < 256; j++) {
            int eI = j;
            int oI  = j + 256;

            if(j > 128){
              out1024[eI * 2]      =  out1024[1024 - eI * 2] ;
              out1024[eI * 2 + 1]  = -out1024[1024 - eI * 2 + 1];
              out1024[oI * 2]      =  out1024[1024 - oI * 2];
              out1024[oI * 2 + 1]  = -out1024[1024 - oI * 2 + 1];
              continue;
            }

            float eRe  = out1024[eI * 2];
            float eIm  = out1024[eI * 2 + 1];
            float oRe  = out1024[oI * 2];
            float oIm  = out1024[oI * 2 + 1];

            float tRe = ____F[510 + (j * 2 + 0)];
            float tIm = ____F[510 + (j * 2 + 1)];

            float t_oRe = oRe * tRe - oIm * tIm;
            float t_oIm = oRe * tIm + oIm * tRe;

            out1024[eI * 2]      = eRe + t_oRe;
            out1024[eI * 2 + 1]  = eIm + t_oIm;
            out1024[oI * 2]      = eRe - t_oRe;
            out1024[oI * 2 + 1]  = eIm - t_oIm;
        }

        for (int j = 0; j < 256; j++) {
            int eI = 512 + j;
            int oI  = 512 + j + 256;

            float eRe  = out1024[eI * 2];
            float eIm  = out1024[eI * 2 + 1];
            float oRe  = out1024[oI * 2];
            float oIm  = out1024[oI * 2 + 1];

            float tRe = ____F[510 + (j * 2 + 0)];
            float tIm = ____F[510 + (j * 2 + 1)];

            float t_oRe = oRe * tRe - oIm * tIm;
            float t_oIm = oRe * tIm + oIm * tRe;

            out1024[eI * 2]      = eRe + t_oRe;
            out1024[eI * 2 + 1]  = eIm + t_oIm;
            out1024[oI * 2]      = eRe - t_oRe;
            out1024[oI * 2 + 1]  = eIm - t_oIm;
        }

    /////////////////////////////////////////////
    // P = 5  -> 1024
    //

        for (int j = 0; j < 512; j++) {
            int eI = j;
            int oI  = j + 512;

            if(j > 256){
              out1024[eI * 2]      =  out1024[2048 - eI * 2] ;
              out1024[eI * 2 + 1]  = -out1024[2048 - eI * 2 + 1];
              out1024[oI * 2]      =  out1024[2048 - oI * 2];
              out1024[oI * 2 + 1]  = -out1024[2048 - oI * 2 + 1];
              continue;
            }

            float eRe  = out1024[eI * 2];
            float eIm  = out1024[eI * 2 + 1];
            float oRe  = out1024[oI * 2];
            float oIm  = out1024[oI * 2 + 1];

            float tRe = ____F[1022 + (j * 2 + 0)];
            float tIm = ____F[1022 + (j * 2 + 1)];

            float t_oRe = oRe * tRe - oIm * tIm;
            float t_oIm = oRe * tIm + oIm * tRe;

            out1024[eI * 2]      = eRe + t_oRe;
            out1024[eI * 2 + 1]  = eIm + t_oIm;
            out1024[oI * 2]      = eRe - t_oRe;
            out1024[oI * 2 + 1]  = eIm - t_oIm;
        }
}
*/


/*
int main() {
    // Call the function to get the array of factors
    double* factors = precalculateFFTFactorsRADIX2flattened(1024);

    // Print all entries in the array
    for (int i = 0; i < 2046; i++) {
        if(i%16==0){ printf("\n"); }
        printf("%a, ", factors[i]);
    }

    // Don't forget to free the memory allocated for the array
    free(factors);

    return 0;
}
*/

/*
int main() {
    // Print all entries in the array
    for (int i = 0; i < 1024; i++) { 
        printf("inputBR1024[%i]=", i);
        printf("paddedInput[%i];", bitReversalMap1024[i]);
        printf("\n");
    }

    return 0;
}*/

/*
int main() {
    // Print all entries in the array
    printf("%a", t1Re_1b * t1Re_2b);
    printf("\n");
    printf("%a", t1Re_1b * t1Re_2d);
    return 0;
}*/

/*
int main() {
    for (int i = 0; i < 1024; i+=16) { 
        printf("double in%i=", i+0); printf("paddedInput[%i];", bitReversalMap1024[i+0]); printf("\n");
        printf("double in%i=", i+8); printf("paddedInput[%i];", bitReversalMap1024[i+8]); printf("\n");
        printf("double in%i=", i+4); printf("paddedInput[%i];", bitReversalMap1024[i+4]); printf("\n");
        printf("double in%i=", i+12); printf("paddedInput[%i];", bitReversalMap1024[i+12]); printf("\n");
        printf("double in%i=", i+2); printf("paddedInput[%i];", bitReversalMap1024[i+2]); printf("\n");
        printf("double in%i=", i+10); printf("paddedInput[%i];", bitReversalMap1024[i+10]); printf("\n");
        printf("double in%i=", i+6); printf("paddedInput[%i];", bitReversalMap1024[i+6]); printf("\n");
        printf("double in%i=", i+14); printf("paddedInput[%i];", bitReversalMap1024[i+14]); printf("\n");
        printf("double in%i=", i+1); printf("paddedInput[%i];", bitReversalMap1024[i+1]); printf("\n");
        printf("double in%i=", i+9); printf("paddedInput[%i];", bitReversalMap1024[i+9]); printf("\n");
        printf("double in%i=", i+5); printf("paddedInput[%i];", bitReversalMap1024[i+5]); printf("\n");
        printf("double in%i=", i+13); printf("paddedInput[%i];", bitReversalMap1024[i+13]); printf("\n");
        printf("double in%i=", i+3); printf("paddedInput[%i];", bitReversalMap1024[i+3]); printf("\n");
        printf("double in%i=", i+11); printf("paddedInput[%i];", bitReversalMap1024[i+11]); printf("\n");
        printf("double in%i=", i+7); printf("paddedInput[%i];", bitReversalMap1024[i+7]); printf("\n");
        printf("double in%i=", i+15); printf("paddedInput[%i];", bitReversalMap1024[i+15]); printf("\n");
        printf("\n");
        printf("\n");
        printf("inputBR1024[%i]=", i+0); printf("in%i;", i+0); printf("\n");
        printf("inputBR1024[%i]=", i+1); printf("in%i;", i+1); printf("\n");
        printf("inputBR1024[%i]=", i+2); printf("in%i;", i+2); printf("\n");
        printf("inputBR1024[%i]=", i+3); printf("in%i;", i+3); printf("\n");
        printf("inputBR1024[%i]=", i+4); printf("in%i;", i+4); printf("\n");
        printf("inputBR1024[%i]=", i+5); printf("in%i;", i+5); printf("\n");
        printf("inputBR1024[%i]=", i+6); printf("in%i;", i+6); printf("\n");
        printf("inputBR1024[%i]=", i+7); printf("in%i;", i+7); printf("\n");
        printf("inputBR1024[%i]=", i+8); printf("in%i;", i+8); printf("\n");
        printf("inputBR1024[%i]=", i+9); printf("in%i;", i+9); printf("\n");
        printf("inputBR1024[%i]=", i+10); printf("in%i;", i+10); printf("\n");
        printf("inputBR1024[%i]=", i+11); printf("in%i;", i+11); printf("\n");
        printf("inputBR1024[%i]=", i+12); printf("in%i;", i+12); printf("\n");
        printf("inputBR1024[%i]=", i+13); printf("in%i;", i+13); printf("\n");
        printf("inputBR1024[%i]=", i+14); printf("in%i;", i+14); printf("\n");
        printf("inputBR1024[%i]=", i+15); printf("in%i;", i+15); printf("\n");
        printf("\n");
        printf("\n");
    }
    return 0;
}
*/








