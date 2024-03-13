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
}


/*
int main() {
  return 0;
}*/

