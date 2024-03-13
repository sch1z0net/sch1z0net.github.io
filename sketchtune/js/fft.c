#include <stdio.h>
#include <math.h>
#include <stdlib.h>

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


// Variable assignments
float t1Re_1b = 0x1.6a09e6p-1f;

float t1Re_2b = 0x1.d906bcp-1f;
float t1Re_2c = 0x1.6a09e6p-1f;
float t1Re_2d = 0x1.87de2ap-2f;

float t1Re_1b2b = 0x1.fd54adp-1f; // t1Re_1b * t1Re_2b;
float t1Re_1b2d = 0x1.b612f8p-3f; //t1Re_1b * t1Re_2d;

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

/*
float tRe0 = ____F[126 + (0)]; 
float tIm0 = ____F[126 + (1)];
float tRe1 = ____F[126 + (2)]; 
float tIm1 = ____F[126 + (3)];
float tRe2 = ____F[126 + (4)]; 
float tIm2 = ____F[126 + (5)];
float tRe3 = ____F[126 + (6)]; 
float tIm3 = ____F[126 + (7)];
float tRe4 = ____F[126 + (8)]; 
float tIm4 = ____F[126 + (9)];
float tRe5 = ____F[126 + (10)]; 
float tIm5 = ____F[126 + (11)];
float tRe6 = ____F[126 + (12)]; 
float tIm6 = ____F[126 + (13)];
float tRe7 = ____F[126 + (14)]; 
float tIm7 = ____F[126 + (15)];
float tRe8 = ____F[126 + (16)]; 
float tIm8 = ____F[126 + (17)];
float tRe9 = ____F[126 + (18)]; 
float tIm9 = ____F[126 + (19)];
float tRe10 = ____F[126 + (20)]; 
float tIm10 = ____F[126 + (21)];
float tRe11 = ____F[126 + (22)]; 
float tIm11 = ____F[126 + (23)];
float tRe12 = ____F[126 + (24)]; 
float tIm12 = ____F[126 + (25)];
float tRe13 = ____F[126 + (26)]; 
float tIm13 = ____F[126 + (27)];
float tRe14 = ____F[126 + (28)]; 
float tIm14 = ____F[126 + (29)];
float tRe15 = ____F[126 + (30)]; 
float tIm15 = ____F[126 + (31)];
float tRe16 = ____F[126 + (32)]; 
float tIm16 = ____F[126 + (33)];
float tRe17 = ____F[126 + (34)]; 
float tIm17 = ____F[126 + (35)];
float tRe18 = ____F[126 + (36)]; 
float tIm18 = ____F[126 + (37)];
float tRe19 = ____F[126 + (38)]; 
float tIm19 = ____F[126 + (39)];
float tRe20 = ____F[126 + (40)]; 
float tIm20 = ____F[126 + (41)];
float tRe21 = ____F[126 + (42)]; 
float tIm21 = ____F[126 + (43)];
float tRe22 = ____F[126 + (44)]; 
float tIm22 = ____F[126 + (45)];
float tRe23 = ____F[126 + (46)]; 
float tIm23 = ____F[126 + (47)];
float tRe24 = ____F[126 + (48)]; 
float tIm24 = ____F[126 + (49)];
float tRe25 = ____F[126 + (50)]; 
float tIm25 = ____F[126 + (51)];
float tRe26 = ____F[126 + (52)]; 
float tIm26 = ____F[126 + (53)];
float tRe27 = ____F[126 + (54)]; 
float tIm27 = ____F[126 + (55)];
float tRe28 = ____F[126 + (56)]; 
float tIm28 = ____F[126 + (57)];
float tRe29 = ____F[126 + (58)]; 
float tIm29 = ____F[126 + (59)];
float tRe30 = ____F[126 + (60)]; 
float tIm30 = ____F[126 + (61)];
float tRe31 = ____F[126 + (62)]; 
float tIm31 = ____F[126 + (63)];
*/


// Define global arrays
float inputBR1024[1024];
float paddedInput[1024];
// Define global variables for intermediate computations
float x0aRe, x0bRe, x0bIm, x0cRe;
float x1aRe, x1bRe, x1bIm, x1cRe;
float x2aRe, x2bRe, x2bIm, x2cRe;
float x3aRe, x3bRe, x3bIm, x3cRe;

float x2cRe_tRe_2c, x3cRe_tRe_2c;
float resReC1, resImC1, resReC2, resImC2;

float x1dif;
float x1sum;
float x3dif;
float x3sum;

float x1dif_tRe_1b;
float x1sum_tRe_1b;
          
float x3dif_tRe_1b2b;
float x3dif_tRe_1b2d;
float x3sum_tRe_1b2b;
float x3sum_tRe_1b2d;

float tempReB;
float tempImB;
float tempReD;
float tempImD;

float resReB1;    
float resReB2;    
float resReD1;
float resReD2;  

float resImB1;    
float resImB2;     
float resImD1;     
float resImD2;  

float x0aRe_0, x0bRe_0, x0bIm_0, x0cRe_0, x0cIm_0, x0dRe_0, x0dIm_0, x0aRe_4, x0aIm_4, x0bRe_4, x0bIm_4, x0cRe_4, x0cIm_4, x0dRe_4, x0dIm_4, x0aRe_8;
float x1aRe_0, x1bRe_0, x1bIm_0, x1cRe_0, x1cIm_0, x1dRe_0, x1dIm_0, x1aRe_4, x1aIm_4, x1bRe_4, x1bIm_4, x1cRe_4, x1cIm_4, x1dRe_4, x1dIm_4, x1aRe_8, x1aIm_8;
float x2aRe_0, x2aIm_0, x2bRe_0, x2bIm_0, x2cRe_0, x2cIm_0, x2dRe_0, x2dIm_0, x2aRe_4, x2aIm_4, x2bRe_4, x2bIm_4, x2cRe_4, x2cIm_4, x2dRe_4, x2dIm_4, x2aRe_8, x2aIm_8;
float x3aRe_0, x3aIm_0, x3bRe_0, x3bIm_0, x3cRe_0, x3cIm_0, x3dRe_0, x3dIm_0, x3aRe_4, x3aIm_4, x3bRe_4, x3bIm_4, x3cRe_4, x3cIm_4, x3dRe_4, x3dIm_4, x3aRe_8, x3aIm_8;

float T0x1bRe, T0x1bIm, T0x3bRe, T0x3bIm;
float T0x0cRe, T0x0cIm, T0x2cRe, T0x2cIm;
float T0x1dRe, T0x1dIm, T0x3dRe, T0x3dIm;

float T1x0aRe, T1x0aIm, T1x2aRe, T1x2aIm;
float T1x1bRe, T1x1bIm, T1x3bRe, T1x3bIm;
float T1x0cRe, T1x0cIm, T1x2cRe, T1x2cIm;
float T1x1dRe, T1x1dIm, T1x3dRe, T1x3dIm;

float T2x0aRe, T2x0aIm, T2x2aRe, T2x2aIm;
float T2x1bRe, T2x1bIm, T2x3bRe, T2x3bIm;
float T2x0cRe, T2x0cIm, T2x2cRe, T2x2cIm;
float T2x1dRe, T2x1dIm, T2x3dRe, T2x3dIm;

float T3x0aRe, T3x0aIm, T3x2aRe, T3x2aIm;
float T3x1bRe, T3x1bIm, T3x3bRe, T3x3bIm;
float T3x0cRe, T3x0cIm, T3x2cRe, T3x2cIm;
float T3x1dRe, T3x1dIm, T3x3dRe, T3x3dIm;

float res0ReB, res0ImB;
float res0ReC, res0ImC;
float res0ReD, res0ImD;
float res1ReA, res1ImA;
float res1ReB, res1ImB;
float res1ReC, res1ImC;
float res1ReD, res1ImD;
float res2ReA, res2ImA;
float res2ReB, res2ImB;
float res2ReC, res2ImC;
float res2ReD, res2ImD;
float res3ReA, res3ImA;
float res3ReB, res3ImB;
float res3ReC, res3ImC;
float res3ReD, res3ImD;
float res4ReA, res4ImA;
float res4ReB, res4ImB;
float res4ReC, res4ImC;
float res4ReD, res4ImD;
float res5ReA, res5ImA;
float res5ReB, res5ImB;
float res5ReC, res5ImC;
float res5ReD, res5ImD;
float res6ReA, res6ImA;
float res6ReB, res6ImB;
float res6ReC, res6ImC;
float res6ReD, res6ImD;
float res7ReA, res7ImA;
float res7ReB, res7ImB;
float res7ReC, res7ImC;
float res7ReD, res7ImD;


// Modified function to accept pointer to output array
void fftReal1024(float* realInput, int size, float* out1024) {
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

    // Perform bit reversal
    for (int i = 0; i < 1024; i++) {
        inputBR1024[i] = paddedInput[bitReversalMap1024[i]];
    }

    // P = 0  -> 4
    for (int idx = 0; idx < 1024; idx += 4) {
        x0aRe = inputBR1024[idx];
        x1aRe = inputBR1024[idx + 1];
        x2aRe = inputBR1024[idx + 2];
        x3aRe = inputBR1024[idx + 3];

        out1024[2 * idx    ] = x0aRe + x1aRe + x2aRe + x3aRe;
        out1024[2 * idx + 1] = 0;
        out1024[2 * idx + 2] = x0aRe - x1aRe;
        out1024[2 * idx + 3] = x2aRe - x3aRe;
        out1024[2 * idx + 4] = x0aRe + x1aRe - x2aRe - x3aRe;
        out1024[2 * idx + 5] = 0;
        out1024[2 * idx + 6] = x0aRe - x1aRe;
        out1024[2 * idx + 7] = -x2aRe + x3aRe;
    }


    // P = 1  -> 16
    for (int idx = 0; idx < 2048; idx += 32) {
        x0aRe = out1024[idx     ];
        x0bRe = out1024[idx +  2]; 
        x0bIm = out1024[idx +  3];
        x0cRe = out1024[idx +  4];

        x1aRe = out1024[idx +  8];
        out1024[idx +   8] = x0aRe - x1aRe; 
        x1bRe = out1024[idx + 10];
        x1bIm = out1024[idx + 11];
        x1cRe = out1024[idx + 12];

        x2aRe = out1024[idx + 16];
        x2bRe = out1024[idx + 18];
        x2bIm = out1024[idx + 19];
        x2cRe = out1024[idx + 20];

        x3aRe = out1024[idx + 24];
        out1024[idx +  24] = x0aRe - x1aRe;
        out1024[idx +  25] = x3aRe - x2aRe;  
        x3bRe = out1024[idx + 26];
        x3bIm = out1024[idx + 27];
        x3cRe = out1024[idx + 28];

        out1024[idx      ] = x0aRe + x1aRe + x2aRe + x3aRe;  
        out1024[idx +   9] = x2aRe - x3aRe;      
        out1024[idx +  16] = x0aRe + x1aRe - x2aRe - x3aRe;

        x2cRe_tRe_2c = x2cRe * t1Re_2c;
        x3cRe_tRe_2c = x3cRe * t1Re_2c;

        resReC1 = x0cRe + x2cRe_tRe_2c - x3cRe_tRe_2c;
        out1024[idx +  28] =   resReC1; 
        out1024[idx +   4] =   resReC1; 
        resImC1 = x1cRe + x2cRe_tRe_2c + x3cRe_tRe_2c; 
        out1024[idx +   5] =   resImC1; 
        out1024[idx +  29] = - resImC1;
        resReC2 = x0cRe - x2cRe_tRe_2c + x3cRe_tRe_2c; 
        out1024[idx +  20] =   resReC2;
        out1024[idx +  12] =   resReC2; 
        resImC2 = x1cRe - x2cRe_tRe_2c - x3cRe_tRe_2c; 
        out1024[idx +  13] = - resImC2; 
        out1024[idx +  21] =   resImC2;  

        x1dif = (x1bRe-x1bIm);
        x1sum = (x1bRe+x1bIm);
        x3dif = (x3bRe-x3bIm);
        x3sum = (x3bRe+x3bIm);

        x1dif_tRe_1b = x1dif * t1Re_1b;
        x1sum_tRe_1b = x1sum * t1Re_1b;
          
        x3dif_tRe_1b2b = x3dif * t1Re_1b2b;
        x3dif_tRe_1b2d = x3dif * t1Re_1b2d;
        x3sum_tRe_1b2b = x3sum * t1Re_1b2b;
        x3sum_tRe_1b2d = x3sum * t1Re_1b2d;

        tempReB = (x3dif_tRe_1b2b - x3sum_tRe_1b2d + x2bRe*t1Re_2b - x2bIm*t1Re_2d);
        tempImB = (x3dif_tRe_1b2d + x3sum_tRe_1b2b + x2bRe*t1Re_2d + x2bIm*t1Re_2b);
        tempReD = (x3dif_tRe_1b2d + x3sum_tRe_1b2b - x2bRe*t1Re_2d - x2bIm*t1Re_2b);
        tempImD = (x3dif_tRe_1b2b - x3sum_tRe_1b2d - x2bRe*t1Re_2b + x2bIm*t1Re_2d);

        resReB1 = x0bRe  + x1dif_tRe_1b + tempReB;     
        out1024[idx +   2] =   resReB1; 
        out1024[idx +  30] =   resReB1;  
        resReB2 = x0bRe  + x1dif_tRe_1b - tempReB;     
        out1024[idx +  18] =   resReB2;
        out1024[idx +  14] =   resReB2; 
        resReD1 = x0bRe  - x1dif_tRe_1b - tempReD;     
        out1024[idx +   6] =   resReD1; 
        out1024[idx +  26] =   resReD1; 
        resReD2 = x0bRe  - x1dif_tRe_1b + tempReD;     
        out1024[idx +  22] =   resReD2;
        out1024[idx +  10] =   resReD2; 

        resImB1 = x0bIm  + x1sum_tRe_1b + tempImB;     
        out1024[idx +   3] =   resImB1; 
        out1024[idx +  31] = - resImB1;  
        resImB2 = x0bIm  + x1sum_tRe_1b - tempImB;     
        out1024[idx +  19] =   resImB2;
        out1024[idx +  15] = - resImB2; 
        resImD1 =-x0bIm  + x1sum_tRe_1b - tempImD;     
        out1024[idx +   7] =   resImD1; 
        out1024[idx +  27] = - resImD1; 
        resImD2 =-x0bIm  + x1sum_tRe_1b + tempImD;     
        out1024[idx +  23] =   resImD2;  
        out1024[idx +  11] = - resImD2; 
    }

    // P = 2  -> 64
    for(int idx = 0; idx < 2048; idx+=128){
        x0aRe_0 = out1024[idx       ];
        x0bRe_0 = out1024[idx   +  2]; x0bIm_0 = out1024[idx   +  3];
        x0cRe_0 = out1024[idx   +  4]; x0cIm_0 = out1024[idx   +  5];
        x0dRe_0 = out1024[idx   +  6]; x0dIm_0 = out1024[idx   +  7];
        x0aRe_4 = out1024[idx   +  8]; x0aIm_4 = out1024[idx   +  9];
        x0bRe_4 = out1024[idx   + 10]; x0bIm_4 = out1024[idx   + 11];
        x0cRe_4 = out1024[idx   + 12]; x0cIm_4 = out1024[idx   + 13];
        x0dRe_4 = out1024[idx   + 14]; x0dIm_4 = out1024[idx   + 15];
        x0aRe_8 = out1024[idx   + 16];                                   

        x1aRe_0 = out1024[idx   + 32];
        x1bRe_0 = out1024[idx   + 34]; x1bIm_0 = out1024[idx   + 35];
        x1cRe_0 = out1024[idx   + 36]; x1cIm_0 = out1024[idx   + 37];
        x1dRe_0 = out1024[idx   + 38]; x1dIm_0 = out1024[idx   + 39];
        x1aRe_4 = out1024[idx   + 40]; x1aIm_4 = out1024[idx   + 41];
        x1bRe_4 = out1024[idx   + 42]; x1bIm_4 = out1024[idx   + 43];
        x1cRe_4 = out1024[idx   + 44]; x1cIm_4 = out1024[idx   + 45];
        x1dRe_4 = out1024[idx   + 46]; x1dIm_4 = out1024[idx   + 47];
        x1aRe_8 = out1024[idx   + 48]; x1aIm_8 = out1024[idx   + 49];

        x2aRe_0 = out1024[idx   + 64]; x2aIm_0 = out1024[idx   + 65];
        x2bRe_0 = out1024[idx   + 66]; x2bIm_0 = out1024[idx   + 67];
        x2cRe_0 = out1024[idx   + 68]; x2cIm_0 = out1024[idx   + 69];
        x2dRe_0 = out1024[idx   + 70]; x2dIm_0 = out1024[idx   + 71];
        x2aRe_4 = out1024[idx   + 72]; x2aIm_4 = out1024[idx   + 73];
        x2bRe_4 = out1024[idx   + 74]; x2bIm_4 = out1024[idx   + 75];
        x2cRe_4 = out1024[idx   + 76]; x2cIm_4 = out1024[idx   + 77];
        x2dRe_4 = out1024[idx   + 78]; x2dIm_4 = out1024[idx   + 79];
        x2aRe_8 = out1024[idx   + 80]; x2aIm_8 = out1024[idx   + 81];

        x3aRe_0 = out1024[idx   + 96]; x3aIm_0 = out1024[idx   + 97];
        x3bRe_0 = out1024[idx   + 98]; x3bIm_0 = out1024[idx   + 99];
        x3cRe_0 = out1024[idx   +100]; x3cIm_0 = out1024[idx   +101];
        x3dRe_0 = out1024[idx   +102]; x3dIm_0 = out1024[idx   +103];
        x3aRe_4 = out1024[idx   +104]; x3aIm_4 = out1024[idx   +105];
        x3bRe_4 = out1024[idx   +106]; x3bIm_4 = out1024[idx   +107];
        x3cRe_4 = out1024[idx   +108]; x3cIm_4 = out1024[idx   +109];
        x3dRe_4 = out1024[idx   +110]; x3dIm_4 = out1024[idx   +111];
        x3aRe_8 = out1024[idx   +112]; x3aIm_8 = out1024[idx   +113];

        T0x1bRe = (x1bRe_0 * t2Re_1b - x1bIm_0 * t2Re_1h);
        T0x1bIm = (x1bRe_0 * t2Re_1h + x1bIm_0 * t2Re_1b);
        T0x3bRe = (x3bRe_0 * t2Re_1b - x3bIm_0 * t2Re_1h);
        T0x3bIm = (x3bRe_0 * t2Re_1h + x3bIm_0 * t2Re_1b);

        T0x0cRe = (x1cRe_0 * t2Re_1c - x1cIm_0 * t2Re_1g);
        T0x0cIm = (x1cRe_0 * t2Re_1g + x1cIm_0 * t2Re_1c);
        T0x2cRe = (x3cRe_0 * t2Re_1c - x3cIm_0 * t2Re_1g);
        T0x2cIm = (x3cRe_0 * t2Re_1g + x3cIm_0 * t2Re_1c);

        T0x1dRe = (x1dRe_0 * t2Re_1d - x1dIm_0 * t2Re_1f);
        T0x1dIm = (x1dRe_0 * t2Re_1f + x1dIm_0 * t2Re_1d);
        T0x3dRe = (x3dRe_0 * t2Re_1d - x3dIm_0 * t2Re_1f);
        T0x3dIm = (x3dRe_0 * t2Re_1f + x3dIm_0 * t2Re_1d);

        out1024[idx       ] =   (x0aRe_0 + x1aRe_0) + (x2aRe_0 + x3aRe_0);
        out1024[idx  +  64] =   (x0aRe_0 + x1aRe_0) - (x2aRe_0 + x3aRe_0);
        out1024[idx  +  65] =                       - (x2aIm_0 + x3aIm_0);
        out1024[idx  +   1] =                         (x2aIm_0 + x3aIm_0); 
        res0ReB = x0bRe_0 + T0x1bRe + ((x2bRe_0 + T0x3bRe)*  t2Re_2b - ((x2bIm_0 + T0x3bIm)*  t2Re_2p));
        out1024[idx  +   2] =   res0ReB;
        out1024[idx  + 126] =   res0ReB; 
        res0ImB = x0bIm_0 + T0x1bIm + ((x2bRe_0 + T0x3bRe)*  t2Re_2p + ((x2bIm_0 + T0x3bIm)*  t2Re_2b)); 
        out1024[idx  + 127] = - res0ImB;
        out1024[idx  +   3] =   res0ImB;
        res0ReC = x0cRe_0 + T0x0cRe + ((x2cRe_0 + T0x2cRe)*  t2Re_2c - ((x2cIm_0 + T0x2cIm)*  t2Re_2o));  
        out1024[idx  +   4] =   res0ReC;
        out1024[idx  + 124] =   res0ReC;
        res0ImC = x0cIm_0 + T0x0cIm + ((x2cRe_0 + T0x2cRe)*  t2Re_2o + ((x2cIm_0 + T0x2cIm)*  t2Re_2c));
        out1024[idx  + 125] = - res0ImC;
        out1024[idx  +   5] =   res0ImC; 
        res0ReD = x0dRe_0 + T0x1dRe + ((x2dRe_0 + T0x3dRe)*  t2Re_2d - ((x2dIm_0 + T0x3dIm)*  t2Re_2n));  
        out1024[idx  +   6] =   res0ReD;
        out1024[idx  + 122] =   res0ReD;
        res0ImD = x0dIm_0 + T0x1dIm + ((x2dRe_0 + T0x3dRe)*  t2Re_2n + ((x2dIm_0 + T0x3dIm)*  t2Re_2d)); 
        out1024[idx  + 123] = - res0ImD;
        out1024[idx  +   7] =   res0ImD;  
        res1ReA =    (x0aRe_0 - x1aRe_0) - (x2aIm_0 - x3aIm_0);
        out1024[idx  +  32] =   res1ReA;
        out1024[idx  +  96] =   res1ReA;
        res1ImA =                          (x2aRe_0 - x3aRe_0); 
        out1024[idx  +  97] = - res1ImA;
        out1024[idx  +  33] =   res1ImA;
        res1ReB = x0bRe_0 - T0x1bRe + ((x2bRe_0 - T0x3bRe)* -t2Re_2p  - ((x2bIm_0 - T0x3bIm)*  t2Re_2b ));
        out1024[idx  +  34] =   res1ReB;
        out1024[idx  +  94] =   res1ReB;
        res1ImB = x0bIm_0 - T0x1bIm + ((x2bRe_0 - T0x3bRe)*  t2Re_2b  + ((x2bIm_0 - T0x3bIm)* -t2Re_2p )); 
        out1024[idx  +  95] = - res1ImB; 
        out1024[idx  +  35] =   res1ImB;
        res1ReC = x0cRe_0 - T0x0cRe + ((x2cRe_0 - T0x2cRe)* -t2Re_2o  - ((x2cIm_0 - T0x2cIm)*  t2Re_2c )); 
        out1024[idx  +  36] =   res1ReC;
        out1024[idx  +  92] =   res1ReC;
        res1ImC = x0cIm_0 - T0x0cIm + ((x2cRe_0 - T0x2cRe)*  t2Re_2c  + ((x2cIm_0 - T0x2cIm)* -t2Re_2o ));
        out1024[idx  +  93] = - res1ImC;  
        out1024[idx  +  37] =   res1ImC; 
        res1ReD = x0dRe_0 - T0x1dRe + ((x2dRe_0 - T0x3dRe)* -t2Re_2n  - ((x2dIm_0 - T0x3dIm)*  t2Re_2d ));
        out1024[idx  +  38] =   res1ReD;
        out1024[idx  +  90] =   res1ReD;
        res1ImD = x0dIm_0 - T0x1dIm + ((x2dRe_0 - T0x3dRe)*  t2Re_2d  + ((x2dIm_0 - T0x3dIm)* -t2Re_2n ));  
        out1024[idx  +  91] = - res1ImD; 
        out1024[idx  +  39] =   res1ImD;

        T1x0aRe = (x1aRe_4 * t2Re_1e - x1aIm_4 * t2Re_1e);
        T1x0aIm = (x1aRe_4 * t2Re_1e + x1aIm_4 * t2Re_1e);
        T1x2aRe = (x3aRe_4 * t2Re_1e - x3aIm_4 * t2Re_1e);
        T1x2aIm = (x3aRe_4 * t2Re_1e + x3aIm_4 * t2Re_1e);

        T1x1bRe = (x1bRe_4 * t2Re_1f - x1bIm_4 * t2Re_1d);
        T1x1bIm = (x1bRe_4 * t2Re_1d + x1bIm_4 * t2Re_1f);
        T1x3bRe = (x3bRe_4 * t2Re_1f - x3bIm_4 * t2Re_1d);
        T1x3bIm = (x3bRe_4 * t2Re_1d + x3bIm_4 * t2Re_1f);

        T1x0cRe = (x1cRe_4 * t2Re_1g - x1cIm_4 * t2Re_1c);
        T1x0cIm = (x1cRe_4 * t2Re_1c + x1cIm_4 * t2Re_1g);
        T1x2cRe = (x3cRe_4 * t2Re_1g - x3cIm_4 * t2Re_1c);
        T1x2cIm = (x3cRe_4 * t2Re_1c + x3cIm_4 * t2Re_1g);

        T1x1dRe = (x1dRe_4 * t2Re_1h - x1dIm_4 * t2Re_1b);
        T1x1dIm = (x1dRe_4 * t2Re_1b + x1dIm_4 * t2Re_1h);
        T1x3dRe = (x3dRe_4 * t2Re_1h - x3dIm_4 * t2Re_1b);
        T1x3dIm = (x3dRe_4 * t2Re_1b + x3dIm_4 * t2Re_1h);

        res2ReA = x0aRe_4 + T1x0aRe + ((x2aRe_4 + T1x2aRe)*  t2Re_2e - ((x2aIm_4 + T1x2aIm)*  t2Re_2m));  
        out1024[idx  +   8] =   res2ReA;
        out1024[idx  + 120] =   res2ReA;
        res2ImA = x0aIm_4 + T1x0aIm + ((x2aRe_4 + T1x2aRe)*  t2Re_2m + ((x2aIm_4 + T1x2aIm)*  t2Re_2e)); 
        out1024[idx  + 121] = - res2ImA; 
        out1024[idx  +   9] =   res2ImA;
        res2ReB = x0bRe_4 + T1x1bRe + ((x2bRe_4 + T1x3bRe)*  t2Re_2f - ((x2bIm_4 + T1x3bIm)*  t2Re_2l));
        out1024[idx  +  10] =   res2ReB;
        out1024[idx  + 118] =   res2ReB; 
        res2ImB = x0bIm_4 + T1x1bIm + ((x2bRe_4 + T1x3bRe)*  t2Re_2l + ((x2bIm_4 + T1x3bIm)*  t2Re_2f));  
        out1024[idx  + 119] = - res2ImB; 
        out1024[idx  +  11] =   res2ImB; 
        res2ReC = x0cRe_4 + T1x0cRe + ((x2cRe_4 + T1x2cRe)*  t2Re_2g - ((x2cIm_4 + T1x2cIm)*  t2Re_2k));
        out1024[idx  +  12] =   res2ReC;
        out1024[idx  + 116] =   res2ReC;  
        res2ImC = x0cIm_4 + T1x0cIm + ((x2cRe_4 + T1x2cRe)*  t2Re_2k + ((x2cIm_4 + T1x2cIm)*  t2Re_2g)); 
        out1024[idx  + 117] = - res2ImC; 
        out1024[idx  +  13] =   res2ImC; 
        res2ReD = x0dRe_4 + T1x1dRe + ((x2dRe_4 + T1x3dRe)*  t2Re_2h - ((x2dIm_4 + T1x3dIm)*  t2Re_2j));  
        out1024[idx  +  14] =   res2ReD;
        out1024[idx  + 114] =   res2ReD;
        res2ImD = x0dIm_4 + T1x1dIm + ((x2dRe_4 + T1x3dRe)*  t2Re_2j + ((x2dIm_4 + T1x3dIm)*  t2Re_2h));
        out1024[idx  + 115] = - res2ImD; 
        out1024[idx  +  15] =   res2ImD;
        res3ReA = x0aRe_4 - T1x0aRe + ((x2aRe_4 - T1x2aRe)* -t2Re_2m  - ((x2aIm_4 - T1x2aIm)*  t2Re_2e ));
        out1024[idx  +  40] =   res3ReA;
        out1024[idx  +  88] =   res3ReA;
        res3ImA = x0aIm_4 - T1x0aIm + ((x2aRe_4 - T1x2aRe)*  t2Re_2e  + ((x2aIm_4 - T1x2aIm)* -t2Re_2m )); 
        out1024[idx  +  89] = - res3ImA;
        out1024[idx  +  41] =   res3ImA; 
        res3ReB = x0bRe_4 - T1x1bRe + ((x2bRe_4 - T1x3bRe)* -t2Re_2l  - ((x2bIm_4 - T1x3bIm)*  t2Re_2f ));
        out1024[idx  +  42] =   res3ReB; 
        out1024[idx  +  86] =   res3ReB;
        res3ImB = x0bIm_4 - T1x1bIm + ((x2bRe_4 - T1x3bRe)*  t2Re_2f  + ((x2bIm_4 - T1x3bIm)* -t2Re_2l ));
        out1024[idx  +  87] = - res3ImB; 
        out1024[idx  +  43] =   res3ImB; 
        res3ReC = x0cRe_4 - T1x0cRe + ((x2cRe_4 - T1x2cRe)* -t2Re_2k  - ((x2cIm_4 - T1x2cIm)*  t2Re_2g ));
        out1024[idx  +  44] =   res3ReC;
        out1024[idx  +  84] =   res3ReC;
        res3ImC = x0cIm_4 - T1x0cIm + ((x2cRe_4 - T1x2cRe)*  t2Re_2g  + ((x2cIm_4 - T1x2cIm)* -t2Re_2k )); 
        out1024[idx  +  85] = - res3ImC;
        out1024[idx  +  45] =   res3ImC;
        res3ReD = x0dRe_4 - T1x1dRe + ((x2dRe_4 - T1x3dRe)* -t2Re_2j  - ((x2dIm_4 - T1x3dIm)*  t2Re_2h ));
        out1024[idx  +  46] =   res3ReD;
        out1024[idx  +  82] =   res3ReD;
        res3ImD = x0dIm_4 - T1x1dIm + ((x2dRe_4 - T1x3dRe)*  t2Re_2h  + ((x2dIm_4 - T1x3dIm)* -t2Re_2j ));
        out1024[idx  +  83] = - res3ImD;
        out1024[idx  +  47] =   res3ImD; 

        T2x0aRe = - x1aIm_8;
        T2x0aIm =   x1aRe_8;
        T2x2aRe = - x3aIm_8;
        T2x2aIm =   x3aRe_8;

        T2x1bRe = (x1dRe_4 * -t2Re_1h - -x1dIm_4 *  t2Re_1b);
        T2x1bIm = (x1dRe_4 *  t2Re_1b + -x1dIm_4 * -t2Re_1h);
        T2x3bRe = (x3dRe_4 * -t2Re_1h - -x3dIm_4 *  t2Re_1b);
        T2x3bIm = (x3dRe_4 *  t2Re_1b + -x3dIm_4 * -t2Re_1h);

        T2x0cRe = (x1cRe_4 * -t2Re_1g - -x1cIm_4 *  t2Re_1c);
        T2x0cIm = (x1cRe_4 *  t2Re_1c + -x1cIm_4 * -t2Re_1g);
        T2x2cRe = (x3cRe_4 * -t2Re_1g - -x3cIm_4 *  t2Re_1c);
        T2x2cIm = (x3cRe_4 *  t2Re_1c + -x3cIm_4 * -t2Re_1g);

        T2x1dRe = (x1bRe_4 * -t2Re_1f - -x1bIm_4 *  t2Re_1d);
        T2x1dIm = (x1bRe_4 *  t2Re_1d + -x1bIm_4 * -t2Re_1f);
        T2x3dRe = (x3bRe_4 * -t2Re_1f - -x3bIm_4 *  t2Re_1d);
        T2x3dIm = (x3bRe_4 *  t2Re_1d + -x3bIm_4 * -t2Re_1f);

        res4ReA =  x0aRe_8 + T2x0aRe + ((x2aRe_8 + T2x2aRe)*  t2Re_2i - (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
        out1024[idx  +  16] =   res4ReA;
        out1024[idx  + 112] =   res4ReA; 
        res4ImA =  0       + T2x0aIm + ((x2aRe_8 + T2x2aRe)*  t2Re_2i + (( x2aIm_8 + T2x2aIm)*  t2Re_2i)); 
        out1024[idx  + 113] = - res4ImA; 
        out1024[idx  +  17] =   res4ImA;
        res4ReB =  x0dRe_4 + T2x1bRe + ((x2dRe_4 + T2x3bRe)*  t2Re_2j - ((-x2dIm_4 + T2x3bIm)*  t2Re_2h)); 
        out1024[idx  +  18] =   res4ReB;
        out1024[idx  + 110] =   res4ReB;
        res4ImB = -x0dIm_4 + T2x1bIm + ((x2dRe_4 + T2x3bRe)*  t2Re_2h + ((-x2dIm_4 + T2x3bIm)*  t2Re_2j)); 
        out1024[idx  + 111] = - res4ImB; 
        out1024[idx  +  19] =   res4ImB; 
        res4ReC =  x0cRe_4 + T2x0cRe + ((x2cRe_4 + T2x2cRe)*  t2Re_2k - ((-x2cIm_4 + T2x2cIm)*  t2Re_2g)); 
        out1024[idx  +  20] =   res4ReC;
        out1024[idx  + 108] =   res4ReC; 
        res4ImC = -x0cIm_4 + T2x0cIm + ((x2cRe_4 + T2x2cRe)*  t2Re_2g + ((-x2cIm_4 + T2x2cIm)*  t2Re_2k));   
        out1024[idx  + 109] = - res4ImC;
        out1024[idx  +  21] =   res4ImC;
        res4ReD =  x0bRe_4 + T2x1dRe + ((x2bRe_4 + T2x3dRe)*  t2Re_2l - ((-x2bIm_4 + T2x3dIm)*  t2Re_2f)); 
        out1024[idx  +  22] =   res4ReD;
        out1024[idx  + 106] =   res4ReD; 
        res4ImD = -x0bIm_4 + T2x1dIm + ((x2bRe_4 + T2x3dRe)*  t2Re_2f + ((-x2bIm_4 + T2x3dIm)*  t2Re_2l)); 
        out1024[idx  + 107] = - res4ImD;
        out1024[idx  +  23] =   res4ImD;
        res5ReA =  x0aRe_8 - T2x0aRe + ((x2aRe_8 - T2x2aRe)* -t2Re_2i  - (( x2aIm_8 - T2x2aIm)*  t2Re_2i ));
        out1024[idx  +  48] =   res5ReA;
        out1024[idx  +  80] =   res5ReA;
        res5ImA =  0       - T2x0aIm + ((x2aRe_8 - T2x2aRe)*  t2Re_2i  + (( x2aIm_8 - T2x2aIm)* -t2Re_2i ));
        out1024[idx  +  81] = - res5ImA;
        out1024[idx  +  49] =   res5ImA; 
        res5ReB =  x0dRe_4 - T2x1bRe + ((x2dRe_4 - T2x3bRe)* -t2Re_2h  - ((-x2dIm_4 - T2x3bIm)*  t2Re_2j ));
        out1024[idx  +  50] =   res5ReB;
        out1024[idx  +  78] =   res5ReB;
        res5ImB = -x0dIm_4 - T2x1bIm + ((x2dRe_4 - T2x3bRe)*  t2Re_2j  + ((-x2dIm_4 - T2x3bIm)* -t2Re_2h ));
        out1024[idx  +  79] = - res5ImB;
        out1024[idx  +  51] =   res5ImB; 
        res5ReC =  x0cRe_4 - T2x0cRe + ((x2cRe_4 - T2x2cRe)* -t2Re_2g  - ((-x2cIm_4 - T2x2cIm)*  t2Re_2k ));
        out1024[idx  +  52] =   res5ReC;
        out1024[idx  +  76] =   res5ReC;
        res5ImC = -x0cIm_4 - T2x0cIm + ((x2cRe_4 - T2x2cRe)*  t2Re_2k  + ((-x2cIm_4 - T2x2cIm)* -t2Re_2g ));
        out1024[idx  +  77] = - res5ImC; 
        out1024[idx  +  53] =   res5ImC;
        res5ReD =  x0bRe_4 - T2x1dRe + ((x2bRe_4 - T2x3dRe)* -t2Re_2f  - ((-x2bIm_4 - T2x3dIm)*  t2Re_2l ));
        out1024[idx  +  54] =   res5ReD;
        out1024[idx  +  74] =   res5ReD;
        res5ImD = -x0bIm_4 - T2x1dIm + ((x2bRe_4 - T2x3dRe)*  t2Re_2l  + ((-x2bIm_4 - T2x3dIm)* -t2Re_2f ));
        out1024[idx  +  75] = - res5ImD;
        out1024[idx  +  55] =   res5ImD;

        T3x0aRe = (x1aRe_4  * -t2Re_1e - -x1aIm_4 *  t2Re_1e);
        T3x0aIm = (x1aRe_4  *  t2Re_1e + -x1aIm_4 * -t2Re_1e);
        T3x2aRe = (x3aRe_4  * -t2Re_1e - -x3aIm_4 *  t2Re_1e);
        T3x2aIm = (x3aRe_4  *  t2Re_1e + -x3aIm_4 * -t2Re_1e);

        T3x1bRe = (x1dRe_0  * -t2Re_1d - -x1dIm_0 *  t2Re_1f);
        T3x1bIm = (x1dRe_0  *  t2Re_1f + -x1dIm_0 * -t2Re_1d);
        T3x3bRe = (x3dRe_0  * -t2Re_1d - -x3dIm_0 *  t2Re_1f);
        T3x3bIm = (x3dRe_0  *  t2Re_1f + -x3dIm_0 * -t2Re_1d);

        T3x0cRe = (x1cRe_0  * -t2Re_1c - -x1cIm_0 *  t2Re_1g);
        T3x0cIm = (x1cRe_0  *  t2Re_1g + -x1cIm_0 * -t2Re_1c);
        T3x2cRe = (x3cRe_0  * -t2Re_1c - -x3cIm_0 *  t2Re_1g);
        T3x2cIm = (x3cRe_0  *  t2Re_1g + -x3cIm_0 * -t2Re_1c);

        T3x1dRe = (x1bRe_0  * -t2Re_1b - -x1bIm_0 *  t2Re_1h);
        T3x1dIm = (x1bRe_0  *  t2Re_1h + -x1bIm_0 * -t2Re_1b);
        T3x3dRe = (x3bRe_0  * -t2Re_1b - -x3bIm_0 *  t2Re_1h);
        T3x3dIm = (x3bRe_0  *  t2Re_1h + -x3bIm_0 * -t2Re_1b);

        res6ReA =  x0aRe_4 + T3x0aRe + ((x2aRe_4 + T3x2aRe)*  t2Re_2m - ((-x2aIm_4 + T3x2aIm)*  t2Re_2e));  
        out1024[idx  +  24] =   res6ReA;
        out1024[idx  + 104] =   res6ReA;
        res6ImA = -x0aIm_4 + T3x0aIm + ((x2aRe_4 + T3x2aRe)*  t2Re_2e + ((-x2aIm_4 + T3x2aIm)*  t2Re_2m)); 
        out1024[idx  + 105] = - res6ImA; 
        out1024[idx  +  25] =   res6ImA;
        res6ReB =  x0dRe_0 + T3x1bRe + ((x2dRe_0 + T3x3bRe)*  t2Re_2n - ((-x2dIm_0 + T3x3bIm)*  t2Re_2d)); 
        out1024[idx  +  26] =   res6ReB;
        out1024[idx  + 102] =   res6ReB;
        res6ImB = -x0dIm_0 + T3x1bIm + ((x2dRe_0 + T3x3bRe)*  t2Re_2d + ((-x2dIm_0 + T3x3bIm)*  t2Re_2n)); 
        out1024[idx  + 103] = - res6ImB; 
        out1024[idx  +  27] =   res6ImB; 
        res6ReC =  x0cRe_0 + T3x0cRe + ((x2cRe_0 + T3x2cRe)*  t2Re_2o - ((-x2cIm_0 + T3x2cIm)*  t2Re_2c));  
        out1024[idx  +  28] =   res6ReC;
        out1024[idx  + 100] =   res6ReC;
        res6ImC = -x0cIm_0 + T3x0cIm + ((x2cRe_0 + T3x2cRe)*  t2Re_2c + ((-x2cIm_0 + T3x2cIm)*  t2Re_2o)); 
        out1024[idx  + 101] = - res6ImC; 
        out1024[idx  +  29] =   res6ImC; 
        res6ReD =  x0bRe_0 + T3x1dRe + ((x2bRe_0 + T3x3dRe)*  t2Re_2p - ((-x2bIm_0 + T3x3dIm)*  t2Re_2b)); 
        out1024[idx  +  30] =   res6ReD;
        out1024[idx  +  98] =   res6ReD; 
        res6ImD = -x0bIm_0 + T3x1dIm + ((x2bRe_0 + T3x3dRe)*  t2Re_2b + ((-x2bIm_0 + T3x3dIm)*  t2Re_2p)); 
        out1024[idx  +  99] = - res6ImD;
        out1024[idx  +  31] =   res6ImD;
        res7ReA =  x0aRe_4 - T3x0aRe + ((x2aRe_4 - T3x2aRe)* -t2Re_2e  - ((-x2aIm_4 - T3x2aIm)*  t2Re_2m ));
        out1024[idx  +  56] =   res7ReA;
        out1024[idx  +  72] =   res7ReA;
        res7ImA = -x0aIm_4 - T3x0aIm + ((x2aRe_4 - T3x2aRe)*  t2Re_2m  + ((-x2aIm_4 - T3x2aIm)* -t2Re_2e ));
        out1024[idx  +  73] = - res7ImA;
        out1024[idx  +  57] =   res7ImA;
        res7ReB =  x0dRe_0 - T3x1bRe + ((x2dRe_0 - T3x3bRe)* -t2Re_2d  - ((-x2dIm_0 - T3x3bIm)*  t2Re_2n ));
        out1024[idx  +  58] =   res7ReB;
        out1024[idx  +  70] =   res7ReB;
        res7ImB = -x0dIm_0 - T3x1bIm + ((x2dRe_0 - T3x3bRe)*  t2Re_2n  + ((-x2dIm_0 - T3x3bIm)* -t2Re_2d ));
        out1024[idx  +  71] = - res7ImB; 
        out1024[idx  +  59] =   res7ImB;
        res7ReC =  x0cRe_0 - T3x0cRe + ((x2cRe_0 - T3x2cRe)* -t2Re_2c  - ((-x2cIm_0 - T3x2cIm)*  t2Re_2o ));
        out1024[idx  +  60] =   res7ReC;
        out1024[idx  +  68] =   res7ReC;
        res7ImC = -x0cIm_0 - T3x0cIm + ((x2cRe_0 - T3x2cRe)*  t2Re_2o  + ((-x2cIm_0 - T3x2cIm)* -t2Re_2c ));
        out1024[idx  +  69] = - res7ImC;
        out1024[idx  +  61] =   res7ImC;
        res7ReD =  x0bRe_0 - T3x1dRe + ((x2bRe_0 - T3x3dRe)* -t2Re_2b  - ((-x2bIm_0 - T3x3dIm)*  t2Re_2p ));
        out1024[idx  +  62] =   res7ReD;
        out1024[idx  +  66] =   res7ReD;
        res7ImD = -x0bIm_0 - T3x1dIm + ((x2bRe_0 - T3x3dRe)*  t2Re_2p  + ((-x2bIm_0 - T3x3dIm)* -t2Re_2b ));
        out1024[idx  +  67] = - res7ImD;
        out1024[idx  +  63] =   res7ImD;
    }

}


/*
int main() {
  return 0;
}*/

