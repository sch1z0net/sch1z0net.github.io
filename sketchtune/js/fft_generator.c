#include <stdio.h>
#include <math.h>
#include <stdlib.h>

double* precalculateFFTFactorsRADIX2flattened(int N) {
    double* factors = (double*)malloc(N * sizeof(double));

    for (int i = 0; i < N / 2; i++) {
        double angle1 = (2 * M_PI * i) / N;
        factors[i * 2]     = cos(angle1); // Cosine of angle1
        factors[i * 2 + 1] = sin(angle1); // Sine of angle1
    }

    return factors;
}


void generate_code(size) {
    double* FAC = precalculateFFTFactorsRADIX2flattened(size);

    FILE *fp = fopen("generated_code.c", "w");
    if (fp == NULL) {
        printf("Error opening file.\n");
        return;
    }

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
          fprintf(fp, "        double oRe%d = out1024[idx + %d];\n", i, oRe);
          fprintf(fp, "        double oIm%d = out1024[idx + %d];\n", i, oIm);
          fprintf(fp, "        double eRe%d = out1024[idx + %d];\n", i, eRe);
          fprintf(fp, "        double eIm%d = out1024[idx + %d];\n", i, eIm);

          fprintf(fp, "        double resRe0_s = eRe0 + oRe0;\n");
          fprintf(fp, "        out1024[idx] = resRe0_s;\n");
          fprintf(fp, "        double resIm0_s = eIm0 + oIm0;\n");
          fprintf(fp, "        out1024[idx + 1] = resRe0_s;\n");
          fprintf(fp, "        double resRe0_d = eRe0 - oRe0;\n");
          fprintf(fp, "        out1024[idx + %d] = resRe0_d;\n", size);
          fprintf(fp, "        double resIm0_d = eIm0 - oIm0;\n");
          fprintf(fp, "        out1024[idx + %d] = resIm0_d;\n", size+1);
          fprintf(fp, "        \n");
          continue;
        }

        if(i == n){
          fprintf(fp, "        double oRe%d = out1024[idx + %d];\n", i, oRe);
          fprintf(fp, "        double oIm%d = out1024[idx + %d];\n", i, oIm);
          fprintf(fp, "        double eRe%d = out1024[idx + %d];\n", i, eRe);
          fprintf(fp, "        double eIm%d = out1024[idx + %d];\n", i, eIm);

          fprintf(fp, "        double resIm%d_s = eIm%d + oRe%d;\n",i,i,i);
          fprintf(fp, "        out1024[idx + %d] = resIm%d_s;\n", (i*2)+1, i);
          fprintf(fp, "        out1024[idx + %d] = -resIm%d_s;\n", dsize-(i*2)+1, i);

          fprintf(fp, "        double resRe%d_s = eRe%d - oIm%d;\n",i,i,i);
          fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", dsize-(i*2), i);
          fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", (i*2), i);

          fprintf(fp, "        \n");
          continue;
        }

        // Generate the calculations based on the pattern
        fprintf(fp, "        double oRe%d = out1024[idx + %d];\n", i, oRe);
        fprintf(fp, "        double oIm%d = out1024[idx + %d];\n", i, oIm);
        fprintf(fp, "        double eRe%d = out1024[idx + %d];\n", i, eRe);
        fprintf(fp, "        double eIm%d = out1024[idx + %d];\n", i, eIm);

        if(i < h){
          fprintf(fp, "        double tRe%d = %a;\n", i, FAC[i*2]);
          fprintf(fp, "        double tRe%d = %a;\n", (n - i), FAC[(n - i)*2]);
        }else if(i == h){
          fprintf(fp, "        double tRe%d = %a;\n", i, FAC[i*2]);
        }

        fprintf(fp, "        double resIm%d_s = eIm%d + (oRe%d * tRe%d + oIm%d * tRe%d);\n", i, i, i, (n-i), i, i);
        fprintf(fp, "        out1024[idx + %d] = resIm%d_s;\n", (i*2)+1, i);
        fprintf(fp, "        out1024[idx + %d] = -resIm%d_s;\n", dsize-(i*2)+1, i);

        fprintf(fp, "        double resRe%d_s = eRe%d + (oRe%d * tRe%d - oIm%d * tRe%d);\n", i, i, i, i, i, (n-i));
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", dsize-(i*2), i);
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", (i*2), i);

        fprintf(fp, "        double resRe%d_s = eRe%d - (oRe%d * tRe%d - oIm%d * tRe%d);\n", (n-i), i, i, i, i, (n-i));
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", size+(i*2), (hsize-i));
        fprintf(fp, "        out1024[idx + %d] = resRe%d_s;\n", size-(i*2), (hsize-i));

        fprintf(fp, "        double resIm%d_s = -eIm%d + (oRe%d * tRe%d + oIm%d * tRe%d);\n", (n-i), i, i, (n-i), i, i);
        fprintf(fp, "        out1024[idx + %d] = resIm%d_s;\n", size-(i*2)+1, (hsize-i));
        fprintf(fp, "        out1024[idx + %d] = -resIm%d_s;\n", size+(i*2)+1, (hsize-i));
        fprintf(fp, "        \n");
    }
    fprintf(fp, "    } \n");

    fclose(fp);
    free(FAC);
}

int main() {
    generate_code(512);
    printf("Generated code written to generated_code.c\n");

    return 0;
}

