#include <stdio.h>
#include <math.h>
#include <stdlib.h>


void bitReversalMap(int N) {
    int bits = log2(N);
    int map[N];

    for (int i = 0; i < N; i++) {
        int reversedIndex = 0;
        for (int j = 0; j < bits; j++) {
            reversedIndex = (reversedIndex << 1) | ((i >> j) & 1);
        }
        map[i] = reversedIndex;
    }

    for (int i = 0; i < N; i++) {
        printf("inputBR256[%d]=paddedInput256[%d]; \n", i, map[i]);
    }
}


float* precalculateFFTFactorsRADIX2flattened(int N) {
    float* factors = (float*)malloc(N * sizeof(float));

    for (int i = 0; i < N / 2; i++) {
        float angle1 = (2 * M_PI * i) / N;
        factors[i * 2]     = cos(angle1); // Cosine of angle1
        factors[i * 2 + 1] = sin(angle1); // Sine of angle1
    }

    return factors;
}


void generate_code_unrolled(int FFT_N, int size, FILE *fp) {
    float* FAC = precalculateFFTFactorsRADIX2flattened(size);

    int hsize = size/2;
    int dsize = size*2;
    int n = size/4;
    int h = n/2;
    
    fprintf(fp, "    ////////////////////////////////////////////////\n");
    fprintf(fp, "    ////////////////////////////////////////////////\n");
    fprintf(fp, "    // FFT step for SIZE %d \n", size);
    fprintf(fp, "    ////////////////////////////////////////////////\n");
    for (int x = 0; x < FFT_N*2; x+=size*2) {
      for (int i = 0; i <= n; i++) {
        // Generate variable names based on the current index
        int eRe = i * 2;
        int eIm = i * 2 + 1;
        int oRe = i * 2 + size;
        int oIm = i * 2 + size + 1;
        
        int _i = x+i;

        if(i == 0){
          fprintf(fp, "        float oRe%d = out%d[%d];\n", _i, FFT_N, x + oRe);
          fprintf(fp, "        float oIm%d = out%d[%d];\n", _i, FFT_N, x + oIm);
          fprintf(fp, "        float eRe%d = out%d[%d];\n", _i, FFT_N, x + eRe);
          fprintf(fp, "        float eIm%d = out%d[%d];\n", _i, FFT_N, x + eIm);

          fprintf(fp, "        float resRe%d_s = eRe%d + oRe%d;\n", _i, _i, _i);
          fprintf(fp, "        out%d[%d] = resRe%d_s;\n", FFT_N, x + 0, _i);
          fprintf(fp, "        float resIm%d_s = eIm%d + oIm%d;\n", _i, _i, _i);
          fprintf(fp, "        out%d[%d] = resIm%d_s;\n", FFT_N, x + 1, _i);
          fprintf(fp, "        float resRe%d_d = eRe%d - oRe%d;\n", _i, _i, _i);
          fprintf(fp, "        out%d[%d] = resRe%d_d;\n", FFT_N, x + size, _i);
          fprintf(fp, "        float resIm%d_d = eIm%d - oIm%d;\n", _i, _i, _i);
          fprintf(fp, "        out%d[%d] = resIm%d_d;\n", FFT_N, x + size+1, _i);
          fprintf(fp, "        \n");
          continue;
        }

        if(i == n){
          fprintf(fp, "        float oRe%d = out%d[%d];\n", _i, FFT_N, x + oRe);
          fprintf(fp, "        float oIm%d = out%d[%d];\n", _i, FFT_N, x + oIm);
          fprintf(fp, "        float eRe%d = out%d[%d];\n", _i, FFT_N, x + eRe);
          fprintf(fp, "        float eIm%d = out%d[%d];\n", _i, FFT_N, x + eIm);

          fprintf(fp, "        float resIm%d_s = eIm%d + oRe%d;\n",_i,_i,_i);
          fprintf(fp, "        out%d[%d] = resIm%d_s;\n", FFT_N, x + ((i*2)+1), _i);
          fprintf(fp, "        out%d[%d] = -resIm%d_s;\n", FFT_N, x + (dsize-(i*2)+1), _i);

          fprintf(fp, "        float resRe%d_s = eRe%d - oIm%d;\n",_i,_i,_i);
          fprintf(fp, "        out%d[%d] = resRe%d_s;\n", FFT_N, x + (dsize-(i*2)), _i);
          fprintf(fp, "        out%d[%d] = resRe%d_s;\n", FFT_N, x + (i*2), _i);

          fprintf(fp, "        \n");
          continue;
        }

        // Generate the calculations based on the pattern
        fprintf(fp, "        float oRe%d = out%d[%d];\n", _i, FFT_N, x + oRe);
        fprintf(fp, "        float oIm%d = out%d[%d];\n", _i, FFT_N, x + oIm);
        fprintf(fp, "        float eRe%d = out%d[%d];\n", _i, FFT_N, x + eRe);
        fprintf(fp, "        float eIm%d = out%d[%d];\n", _i, FFT_N, x + eIm);

        if(i < h){
          fprintf(fp, "        float tRe%d = %af;\n", _i, FAC[i*2]);
          fprintf(fp, "        float tRe%d = %af;\n", x + (n - i), FAC[(n - i)*2]);
        }else if(i == h){
          fprintf(fp, "        float tRe%d = %af;\n", _i, FAC[i*2]);
        }

        fprintf(fp, "        float resIm%d_s = eIm%d + (oRe%d * tRe%d + oIm%d * tRe%d);\n", _i, _i, _i, x+(n-i), _i, _i);
        fprintf(fp, "        out%d[%d] = resIm%d_s;\n", FFT_N, x + ((i*2)+1), _i);
        fprintf(fp, "        out%d[%d] = -resIm%d_s;\n", FFT_N, x + (dsize-(i*2)+1), _i);

        fprintf(fp, "        float resRe%d_s = eRe%d + (oRe%d * tRe%d - oIm%d * tRe%d);\n", _i, _i, _i, _i, _i, x+(n-i));
        fprintf(fp, "        out%d[%d] = resRe%d_s;\n", FFT_N, x + (dsize-(i*2)), _i);
        fprintf(fp, "        out%d[%d] = resRe%d_s;\n", FFT_N, x + (i*2), _i);

        fprintf(fp, "        float resRe%d_s = eRe%d - (oRe%d * tRe%d - oIm%d * tRe%d);\n", x+(hsize-i), _i, _i, _i, _i, x+(n-i));
        fprintf(fp, "        out%d[%d] = resRe%d_s;\n", FFT_N, x + (size+(i*2)), x+(hsize-i));
        fprintf(fp, "        out%d[%d] = resRe%d_s;\n", FFT_N, x + (size-(i*2)), x+(hsize-i));

        fprintf(fp, "        float resIm%d_s = -eIm%d + (oRe%d * tRe%d + oIm%d * tRe%d);\n", x+(hsize-i), _i, _i, x+(n-i), _i, _i);
        fprintf(fp, "        out%d[%d] = resIm%d_s;\n", FFT_N, x + (size-(i*2)+1), x+(hsize-i));
        fprintf(fp, "        out%d[%d] = -resIm%d_s;\n", FFT_N, x + (size+(i*2)+1), x+(hsize-i));
       
       fprintf(fp, "        \n");
      }
    } 

    free(FAC);
}

void generate_code(int FFT_N, int size, FILE *fp) {
    float* FAC = precalculateFFTFactorsRADIX2flattened(size);

    int hsize = size/2;
    int dsize = size*2;
    int n = size/4;
    int h = n/2;
    
    fprintf(fp, "    ////////////////////////////////////////////////\n");
    fprintf(fp, "    ////////////////////////////////////////////////\n");
    fprintf(fp, "    // FFT step for SIZE %d \n", size);
    fprintf(fp, "    ////////////////////////////////////////////////\n");
    fprintf(fp, "    for(int idx = 0; idx < 2048; idx += %d){ \n", (size*2));
    for (int i = 0; i <= n; i++) {
        // Generate variable names based on the current index
        int eRe = i * 2;
        int eIm = i * 2 + 1;
        int oRe = i * 2 + size;
        int oIm = i * 2 + size + 1;

        if(i == 0){
          fprintf(fp, "        float oRe%d = out1024[idx + %d];\n", i, oRe);
          fprintf(fp, "        float oIm%d = out1024[idx + %d];\n", i, oIm);
          fprintf(fp, "        float eRe%d = out1024[idx + %d];\n", i, eRe);
          fprintf(fp, "        float eIm%d = out1024[idx + %d];\n", i, eIm);

          fprintf(fp, "        float resRe0_s = eRe0 + oRe0;\n");
          fprintf(fp, "        out1024[idx] = resRe0_s;\n");
          fprintf(fp, "        float resIm0_s = eIm0 + oIm0;\n");
          fprintf(fp, "        out1024[idx + 1] = resRe0_s;\n");
          fprintf(fp, "        float resRe0_d = eRe0 - oRe0;\n");
          fprintf(fp, "        out1024[idx + %d] = resRe0_d;\n", size);
          fprintf(fp, "        float resIm0_d = eIm0 - oIm0;\n");
          fprintf(fp, "        out1024[idx + %d] = resIm0_d;\n", size+1);
          fprintf(fp, "        \n");
          continue;
        }

        if(i == n){
          fprintf(fp, "        float oRe%d = out1024[idx + %d];\n", i, oRe);
          fprintf(fp, "        float oIm%d = out1024[idx + %d];\n", i, oIm);
          fprintf(fp, "        float eRe%d = out1024[idx + %d];\n", i, eRe);
          fprintf(fp, "        float eIm%d = out1024[idx + %d];\n", i, eIm);

          fprintf(fp, "        float resIm%d_s = eIm%d + oRe%d;\n",i,i,i);
          fprintf(fp, "        out1024[idx + %d] = resIm%d_s;\n", (i*2)+1, i);
          fprintf(fp, "        out1024[idx + %d] = -resIm%d_s;\n", dsize-(i*2)+1, i);

          fprintf(fp, "        float resRe%d_s = eRe%d - oIm%d;\n",i,i,i);
          fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", dsize-(i*2), i);
          fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", (i*2), i);

          fprintf(fp, "        \n");
          continue;
        }

        // Generate the calculations based on the pattern
        fprintf(fp, "        float oRe%d = out1024[idx + %d];\n", i, oRe);
        fprintf(fp, "        float oIm%d = out1024[idx + %d];\n", i, oIm);
        fprintf(fp, "        float eRe%d = out1024[idx + %d];\n", i, eRe);
        fprintf(fp, "        float eIm%d = out1024[idx + %d];\n", i, eIm);

        if(i < h){
          fprintf(fp, "        float tRe%d = %af;\n", i, FAC[i*2]);
          fprintf(fp, "        float tRe%d = %af;\n", (n - i), FAC[(n - i)*2]);
        }else if(i == h){
          fprintf(fp, "        float tRe%d = %af;\n", i, FAC[i*2]);
        }

        fprintf(fp, "        float resIm%d_s = eIm%d + (oRe%d * tRe%d + oIm%d * tRe%d);\n", i, i, i, (n-i), i, i);
        fprintf(fp, "        out1024[idx + %d] = resIm%d_s;\n", (i*2)+1, i);
        fprintf(fp, "        out1024[idx + %d] = -resIm%d_s;\n", dsize-(i*2)+1, i);

        fprintf(fp, "        float resRe%d_s = eRe%d + (oRe%d * tRe%d - oIm%d * tRe%d);\n", i, i, i, i, i, (n-i));
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", dsize-(i*2), i);
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", (i*2), i);

        fprintf(fp, "        float resRe%d_s = eRe%d - (oRe%d * tRe%d - oIm%d * tRe%d);\n", (hsize-i), i, i, i, i, (n-i));
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", size+(i*2), (hsize-i));
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", size-(i*2), (hsize-i));

        fprintf(fp, "        float resIm%d_s = -eIm%d + (oRe%d * tRe%d + oIm%d * tRe%d);\n", (hsize-i), i, i, (n-i), i, i);
        fprintf(fp, "        out1024[idx + %d] = resIm%d_s;\n", size-(i*2)+1, (hsize-i));
        fprintf(fp, "        out1024[idx + %d] = -resIm%d_s;\n", size+(i*2)+1, (hsize-i));
       
       fprintf(fp, "        \n");
    }
    fprintf(fp, "    } \n");

    free(FAC);
}

/*
int main() {
    FILE *fp = fopen("generated_code.c", "w");
    if (fp == NULL) {
        printf("Error opening file.\n");
        return 0;
    }

    float* FAC = precalculateFFTFactorsRADIX2flattened(256);
    free(FAC);

    fclose(fp);

    return 0;
}*/



int main() {
    FILE *fp = fopen("generated_code.c", "w");
    if (fp == NULL) {
        printf("Error opening file.\n");
        return 0;
    }

    //generate_code(128, fp);
    //generate_code(256, fp);
    //generate_code(512, fp);
    //generate_code_unrolled(512, 128, fp);
    //generate_code_unrolled(512, 256, fp);
    //generate_code_unrolled(512, 512, fp);
    //generate_code_unrolled(1024, fp);

    //generate_code_unrolled(256, 128, fp);
    //generate_code_unrolled(256, 256, fp);

    generate_code_unrolled(128, 128, fp);

    printf("Generated code written to generated_code.c\n");

    fclose(fp);

    return 0;
}

/*
int main() {
    //bitReversalMap(512);
    bitReversalMap(128);
    return 0;
}*/


