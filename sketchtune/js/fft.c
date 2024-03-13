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

float oRe0, oIm0, eRe0, eIm0;
float oRe1, oIm1, eRe1, eIm1;
float oRe2, oIm2, eRe2, eIm2;
float oRe3, oIm3, eRe3, eIm3;
float oRe4, oIm4, eRe4, eIm4;
float oRe5, oIm5, eRe5, eIm5;
float oRe6, oIm6, eRe6, eIm6;
float oRe7, oIm7, eRe7, eIm7;
float oRe8, oIm8, eRe8, eIm8;
float oRe9, oIm9, eRe9, eIm9;
float oRe10, oIm10, eRe10, eIm10;
float oRe11, oIm11, eRe11, eIm11;
float oRe12, oIm12, eRe12, eIm12;
float oRe13, oIm13, eRe13, eIm13;
float oRe14, oIm14, eRe14, eIm14;
float oRe15, oIm15, eRe15, eIm15;
float oRe16, oIm16, eRe16, eIm16;
float oRe17, oIm17, eRe17, eIm17;
float oRe18, oIm18, eRe18, eIm18;
float oRe19, oIm19, eRe19, eIm19;
float oRe20, oIm20, eRe20, eIm20;
float oRe21, oIm21, eRe21, eIm21;
float oRe22, oIm22, eRe22, eIm22;
float oRe23, oIm23, eRe23, eIm23;
float oRe24, oIm24, eRe24, eIm24;
float oRe25, oIm25, eRe25, eIm25;
float oRe26, oIm26, eRe26, eIm26;
float oRe27, oIm27, eRe27, eIm27;
float oRe28, oIm28, eRe28, eIm28;
float oRe29, oIm29, eRe29, eIm29;
float oRe30, oIm30, eRe30, eIm30;
float oRe31, oIm31, eRe31, eIm31;
float oRe32, oIm32, eRe32, eIm32;

float resRe0_s, resIm0_s, resRe0_d, resIm0_d;
float resIm1_s, resRe1_s, resRe63_s, resIm63_s;
float resIm2_s, resRe2_s, resRe62_s, resIm62_s;
float resIm3_s, resRe3_s, resRe61_s, resIm61_s;
float resIm4_s, resRe4_s, resRe60_s, resIm60_s;
float resIm5_s, resRe5_s, resRe59_s, resIm59_s;
float resIm6_s, resRe6_s, resRe58_s, resIm58_s;
float resIm7_s, resRe7_s, resRe57_s, resIm57_s;
float resIm8_s, resRe8_s, resRe56_s, resIm56_s;
float resIm9_s, resRe9_s, resRe55_s, resIm55_s;
float resIm10_s, resRe10_s, resRe54_s, resIm54_s;
float resIm11_s, resRe11_s, resRe53_s, resIm53_s;
float resIm12_s, resRe12_s, resRe52_s, resIm52_s;
float resIm13_s, resRe13_s, resRe51_s, resIm51_s;
float resIm14_s, resRe14_s, resRe50_s, resIm50_s;
float resIm15_s, resRe15_s, resRe49_s, resIm49_s;
float resIm16_s, resRe16_s, resRe48_s, resIm48_s;
float resIm17_s, resRe17_s, resRe47_s, resIm47_s;
float resIm18_s, resRe18_s, resRe46_s, resIm46_s;
float resIm19_s, resRe19_s, resRe45_s, resIm45_s;
float resIm20_s, resRe20_s, resRe44_s, resIm44_s;
float resIm21_s, resRe21_s, resRe43_s, resIm43_s;
float resIm22_s, resRe22_s, resRe42_s, resIm42_s;
float resIm23_s, resRe23_s, resRe41_s, resIm41_s;
float resIm24_s, resRe24_s, resRe40_s, resIm40_s;
float resIm25_s, resRe25_s, resRe39_s, resIm39_s;
float resIm26_s, resRe26_s, resRe38_s, resIm38_s;
float resIm27_s, resRe27_s, resRe37_s, resIm37_s;
float resIm28_s, resRe28_s, resRe36_s, resIm36_s;
float resIm29_s, resRe29_s, resRe35_s, resIm35_s;
float resIm30_s, resRe30_s, resRe34_s, resIm34_s;
float resIm31_s, resRe31_s, resRe33_s, resIm33_s;
float resIm32_s, resRe32_s;


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

    /////////////////////////////////////////////
    // P = 2.5  -> 128
    //
    for(int idx = 0; idx < 2048; idx += 256){
        oRe0 = out1024[idx + 128];
        oIm0 = out1024[idx + 129];
        eRe0 = out1024[idx];
        eIm0 = out1024[idx + 1];
        resRe0_s = eRe0 + oRe0;
        out1024[idx] = resRe0_s;
        resIm0_s = eIm0 + oIm0;
        out1024[idx + 1] = resIm0_s;
        resRe0_d = eRe0 - oRe0;
        out1024[idx + 128] = resRe0_d;
        resIm0_d = eIm0 - oIm0;
        out1024[idx + 129] = resIm0_d;

        oRe1 = out1024[idx + 130];
        oIm1 = out1024[idx + 131];
        eRe1 = out1024[idx + 2];
        eIm1 = out1024[idx + 3];
        resIm1_s = eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out1024[idx + 3] = resIm1_s;
        out1024[idx + 255] = -resIm1_s;
        resRe1_s = eRe1 + (oRe1 * tRe1 - oIm1 * tRe31);
        out1024[idx + 254] = resRe1_s;
        out1024[idx + 2] = resRe1_s;
        resRe63_s = eRe1 - (oRe1 * tRe1 - oIm1 * tRe31);
        out1024[idx + 130] = resRe63_s;
        out1024[idx + 126] = resRe63_s;
        resIm63_s = -eIm1 + (oRe1 * tRe31 + oIm1 * tRe1);
        out1024[idx + 127] = resIm63_s;
        out1024[idx + 131] = -resIm63_s;

        oRe2 = out1024[idx + 132];
        oIm2 = out1024[idx + 133];
        eRe2 = out1024[idx + 4];
        eIm2 = out1024[idx + 5];

        resIm2_s = eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out1024[idx + 5] = resIm2_s;
        out1024[idx + 253] = -resIm2_s;
        resRe2_s = eRe2 + (oRe2 * tRe2 - oIm2 * tRe30);
        out1024[idx + 252] = resRe2_s;
        out1024[idx + 4] = resRe2_s;
        resRe62_s = eRe2 - (oRe2 * tRe2 - oIm2 * tRe30);
        out1024[idx + 132] = resRe62_s;
        out1024[idx + 124] = resRe62_s;
        resIm62_s = -eIm2 + (oRe2 * tRe30 + oIm2 * tRe2);
        out1024[idx + 125] = resIm62_s;
        out1024[idx + 133] = -resIm62_s;

        oRe3 = out1024[idx + 134];
        oIm3 = out1024[idx + 135];
        eRe3 = out1024[idx + 6];
        eIm3 = out1024[idx + 7];

        resIm3_s = eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out1024[idx + 7] = resIm3_s;
        out1024[idx + 251] = -resIm3_s;
        resRe3_s = eRe3 + (oRe3 * tRe3 - oIm3 * tRe29);
        out1024[idx + 250] = resRe3_s;
        out1024[idx + 6] = resRe3_s;
        resRe61_s = eRe3 - (oRe3 * tRe3 - oIm3 * tRe29);
        out1024[idx + 134] = resRe61_s;
        out1024[idx + 122] = resRe61_s;
        resIm61_s = -eIm3 + (oRe3 * tRe29 + oIm3 * tRe3);
        out1024[idx + 123] = resIm61_s;
        out1024[idx + 135] = -resIm61_s;

        oRe4   = out1024[idx +  136]; 
        oIm4  = out1024[idx +  137];
        eRe4   = out1024[idx +    8]; 
        eIm4  = out1024[idx +    9];
        resIm4_s = eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out1024[idx + 9] = resIm4_s;
        out1024[idx + 249] = -resIm4_s;
        resRe4_s = eRe4 + (oRe4 * tRe4 - oIm4 * tRe28);
        out1024[idx + 248] = resRe4_s;
        out1024[idx + 8] = resRe4_s; 
        resRe60_s = eRe4 - (oRe4 * tRe4 - oIm4 * tRe28);
        out1024[idx + 136] = resRe60_s;
        out1024[idx + 120] = resRe60_s; 
        resIm60_s = -eIm4 + (oRe4 * tRe28 + oIm4 * tRe4);
        out1024[idx + 121] = resIm60_s;
        out1024[idx + 137] = -resIm60_s;

        oRe5 = out1024[idx + 138]; 
        oIm5 = out1024[idx + 139];
        eRe5 = out1024[idx + 10]; 
        eIm5 = out1024[idx + 11];
        resIm5_s = eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out1024[idx + 11] = resIm5_s;
        out1024[idx + 247] = -resIm5_s;
        resRe5_s = eRe5 + (oRe5 * tRe5 - oIm5 * tRe27);
        out1024[idx + 246] = resRe5_s;
        out1024[idx + 10] = resRe5_s; 
        resRe59_s = eRe5 - (oRe5 * tRe5 - oIm5 * tRe27);
        out1024[idx + 138] = resRe59_s;
        out1024[idx + 118] = resRe59_s; 
        resIm59_s = -eIm5 + (oRe5 * tRe27 + oIm5 * tRe5);
        out1024[idx + 119] = resIm59_s;
        out1024[idx + 139] = -resIm59_s;

        oRe6 = out1024[idx + 140]; 
        oIm6 = out1024[idx + 141];
        eRe6 = out1024[idx + 12]; 
        eIm6 = out1024[idx + 13];
        resIm6_s = eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out1024[idx + 13] = resIm6_s;
        out1024[idx + 245] = -resIm6_s;
        resRe6_s = eRe6 + (oRe6 * tRe6 - oIm6 * tRe26);
        out1024[idx + 244] = resRe6_s;
        out1024[idx + 12] = resRe6_s; 
        resRe58_s = eRe6 - (oRe6 * tRe6 - oIm6 * tRe26);
        out1024[idx + 140] = resRe58_s;
        out1024[idx + 116] = resRe58_s; 
        resIm58_s = -eIm6 + (oRe6 * tRe26 + oIm6 * tRe6);
        out1024[idx + 117] = resIm58_s;
        out1024[idx + 141] = -resIm58_s;

        oRe7 = out1024[idx + 142]; 
        oIm7 = out1024[idx + 143];
        eRe7 = out1024[idx + 14]; 
        eIm7 = out1024[idx + 15];
        resIm7_s = eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out1024[idx + 15] = resIm7_s;
        out1024[idx + 243] = -resIm7_s;
        resRe7_s = eRe7 + (oRe7 * tRe7 - oIm7 * tRe25);
        out1024[idx + 242] = resRe7_s;
        out1024[idx + 14] = resRe7_s; 
        resRe57_s = eRe7 - (oRe7 * tRe7 - oIm7 * tRe25);
        out1024[idx + 142] = resRe57_s;
        out1024[idx + 114] = resRe57_s; 
        resIm57_s = -eIm7 + (oRe7 * tRe25 + oIm7 * tRe7);
        out1024[idx + 115] = resIm57_s;
        out1024[idx + 143] = -resIm57_s;

        oRe8 = out1024[idx + 144]; 
        oIm8 = out1024[idx + 145];
        eRe8 = out1024[idx + 16]; 
        eIm8 = out1024[idx + 17];
        resIm8_s = eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out1024[idx + 17] = resIm8_s;
        out1024[idx + 241] = -resIm8_s;
        resRe8_s = eRe8 + (oRe8 * tRe8 - oIm8 * tRe24);
        out1024[idx + 240] = resRe8_s;
        out1024[idx + 16] = resRe8_s; 
        resRe56_s = eRe8 - (oRe8 * tRe8 - oIm8 * tRe24);
        out1024[idx + 144] = resRe56_s;
        out1024[idx + 112] = resRe56_s; 
        resIm56_s = -eIm8 + (oRe8 * tRe24 + oIm8 * tRe8);
        out1024[idx + 113] = resIm56_s;
        out1024[idx + 145] = -resIm56_s;

        oRe9 = out1024[idx + 146]; 
        oIm9 = out1024[idx + 147];
        eRe9 = out1024[idx + 18]; 
        eIm9 = out1024[idx + 19];
        resIm9_s = eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out1024[idx + 19] = resIm9_s;
        out1024[idx + 239] = -resIm9_s;
        resRe9_s = eRe9 + (oRe9 * tRe9 - oIm9 * tRe23);
        out1024[idx + 238] = resRe9_s;
        out1024[idx + 18] = resRe9_s; 
        resRe55_s = eRe9 - (oRe9 * tRe9 - oIm9 * tRe23);
        out1024[idx + 146] = resRe55_s;
        out1024[idx + 110] = resRe55_s; 
        resIm55_s = -eIm9 + (oRe9 * tRe23 + oIm9 * tRe9);
        out1024[idx + 111] = resIm55_s;
        out1024[idx + 147] = -resIm55_s;

        oRe10 = out1024[idx + 148]; 
        oIm10 = out1024[idx + 149];
        eRe10 = out1024[idx + 20]; 
        eIm10 = out1024[idx + 21];
        resIm10_s = eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out1024[idx + 21] = resIm10_s;
        out1024[idx + 237] = -resIm10_s;
        resRe10_s = eRe10 + (oRe10 * tRe10 - oIm10 * tRe22);
        out1024[idx + 236] = resRe10_s;
        out1024[idx + 20] = resRe10_s; 
        resRe54_s = eRe10 - (oRe10 * tRe10 - oIm10 * tRe22);
        out1024[idx + 148] = resRe54_s;
        out1024[idx + 108] = resRe54_s; 
        resIm54_s = -eIm10 + (oRe10 * tRe22 + oIm10 * tRe10);
        out1024[idx + 109] = resIm54_s;
        out1024[idx + 149] = -resIm54_s;

        oRe11 = out1024[idx + 150]; 
        oIm11 = out1024[idx + 151];
        eRe11 = out1024[idx + 22]; 
        eIm11 = out1024[idx + 23];
        resIm11_s = eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out1024[idx + 23] = resIm11_s;
        out1024[idx + 235] = -resIm11_s;
        resRe11_s = eRe11 + (oRe11 * tRe11 - oIm11 * tRe21);
        out1024[idx + 234] = resRe11_s;
        out1024[idx + 22] = resRe11_s; 
        resRe53_s = eRe11 - (oRe11 * tRe11 - oIm11 * tRe21);
        out1024[idx + 150] = resRe53_s;
        out1024[idx + 106] = resRe53_s; 
        resIm53_s = -eIm11 + (oRe11 * tRe21 + oIm11 * tRe11);
        out1024[idx + 107] = resIm53_s;
        out1024[idx + 151] = -resIm53_s;

        oRe12 = out1024[idx + 152]; 
        oIm12 = out1024[idx + 153];
        eRe12 = out1024[idx + 24]; 
        eIm12 = out1024[idx + 25];
        resIm12_s = eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out1024[idx + 25] = resIm12_s;
        out1024[idx + 233] = -resIm12_s;
        resRe12_s = eRe12 + (oRe12 * tRe12 - oIm12 * tRe20);
        out1024[idx + 232] = resRe12_s;
        out1024[idx + 24] = resRe12_s; 
        resRe52_s = eRe12 - (oRe12 * tRe12 - oIm12 * tRe20);
        out1024[idx + 152] = resRe52_s;
        out1024[idx + 104] = resRe52_s; 
        resIm52_s = -eIm12 + (oRe12 * tRe20 + oIm12 * tRe12);
        out1024[idx + 105] = resIm52_s;
        out1024[idx + 153] = -resIm52_s;

        oRe13 = out1024[idx + 154]; 
        oIm13 = out1024[idx + 155];
        eRe13 = out1024[idx + 26]; 
        eIm13 = out1024[idx + 27];
        resIm13_s = eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out1024[idx + 27] = resIm13_s;
        out1024[idx + 231] = -resIm13_s;
        resRe13_s = eRe13 + (oRe13 * tRe13 - oIm13 * tRe19);
        out1024[idx + 230] = resRe13_s;
        out1024[idx + 26] = resRe13_s; 
        resRe51_s = eRe13 - (oRe13 * tRe13 - oIm13 * tRe19);
        out1024[idx + 154] = resRe51_s;
        out1024[idx + 102] = resRe51_s; 
        resIm51_s = -eIm13 + (oRe13 * tRe19 + oIm13 * tRe13);
        out1024[idx + 103] = resIm51_s;
        out1024[idx + 155] = -resIm51_s;

        oRe14 = out1024[idx + 156]; 
        oIm14 = out1024[idx + 157];
        eRe14 = out1024[idx + 28]; 
        eIm14 = out1024[idx + 29];
        resIm14_s = eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out1024[idx + 29] = resIm14_s;
        out1024[idx + 229] = -resIm14_s;
        resRe14_s = eRe14 + (oRe14 * tRe14 - oIm14 * tRe18);
        out1024[idx + 228] = resRe14_s;
        out1024[idx + 28] = resRe14_s; 
        resRe50_s = eRe14 - (oRe14 * tRe14 - oIm14 * tRe18);
        out1024[idx + 156] = resRe50_s;
        out1024[idx + 100] = resRe50_s; 
        resIm50_s = -eIm14 + (oRe14 * tRe18 + oIm14 * tRe14);
        out1024[idx + 101] = resIm50_s;
        out1024[idx + 157] = -resIm50_s;

        oRe15 = out1024[idx + 158]; 
        oIm15 = out1024[idx + 159];
        eRe15 = out1024[idx + 30]; 
        eIm15 = out1024[idx + 31];
        resIm15_s = eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out1024[idx + 31] = resIm15_s;
        out1024[idx + 227] = -resIm15_s;
        resRe15_s = eRe15 + (oRe15 * tRe15 - oIm15 * tRe17);
        out1024[idx + 226] = resRe15_s;
        out1024[idx + 30] = resRe15_s; 
        resRe49_s = eRe15 - (oRe15 * tRe15 - oIm15 * tRe17);
        out1024[idx + 158] = resRe49_s;
        out1024[idx + 98] = resRe49_s; 
        resIm49_s = -eIm15 + (oRe15 * tRe17 + oIm15 * tRe15);
        out1024[idx + 99] = resIm49_s;
        out1024[idx + 159] = -resIm49_s;

        oRe16 = out1024[idx + 160]; 
        oIm16 = out1024[idx + 161];
        eRe16 = out1024[idx + 32]; 
        eIm16 = out1024[idx + 33];
        resIm16_s = eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out1024[idx + 33] = resIm16_s;
        out1024[idx + 225] = -resIm16_s;
        resRe16_s = eRe16 + (oRe16 * tRe16 - oIm16 * tRe16);
        out1024[idx + 224] = resRe16_s;
        out1024[idx + 32] = resRe16_s; 
        resRe48_s = eRe16 - (oRe16 * tRe16 - oIm16 * tRe16);
        out1024[idx + 160] = resRe48_s;
        out1024[idx + 96] = resRe48_s; 
        resIm48_s = -eIm16 + (oRe16 * tRe16 + oIm16 * tRe16);
        out1024[idx + 97] = resIm48_s;
        out1024[idx + 161] = -resIm48_s;

        oRe17 = out1024[idx + 162]; 
        oIm17 = out1024[idx + 163];
        eRe17 = out1024[idx + 34]; 
        eIm17 = out1024[idx + 35];
        resIm17_s = eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out1024[idx + 35] = resIm17_s;
        out1024[idx + 223] = -resIm17_s;
        resRe17_s = eRe17 + (oRe17 * tRe17 - oIm17 * tRe15);
        out1024[idx + 222] = resRe17_s;
        out1024[idx + 34] = resRe17_s; 
        resRe47_s = eRe17 - (oRe17 * tRe17 - oIm17 * tRe15);
        out1024[idx + 162] = resRe47_s;
        out1024[idx + 94] = resRe47_s; 
        resIm47_s = -eIm17 + (oRe17 * tRe15 + oIm17 * tRe17);
        out1024[idx + 95] = resIm47_s;
        out1024[idx + 163] = -resIm47_s;

        oRe18 = out1024[idx + 164]; 
        oIm18 = out1024[idx + 165];
        eRe18 = out1024[idx + 36]; 
        eIm18 = out1024[idx + 37];
        resIm18_s = eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out1024[idx + 37] = resIm18_s;
        out1024[idx + 221] = -resIm18_s;
        resRe18_s = eRe18 + (oRe18 * tRe18 - oIm18 * tRe14);
        out1024[idx + 220] = resRe18_s;
        out1024[idx + 36] = resRe18_s; 
        resRe46_s = eRe18 - (oRe18 * tRe18 - oIm18 * tRe14);
        out1024[idx + 164] = resRe46_s;
        out1024[idx + 92] = resRe46_s; 
        resIm46_s = -eIm18 + (oRe18 * tRe14 + oIm18 * tRe18);
        out1024[idx + 93] = resIm46_s;
        out1024[idx + 165] = -resIm46_s;

        oRe19 = out1024[idx + 166]; 
        oIm19 = out1024[idx + 167];
        eRe19 = out1024[idx + 38]; 
        eIm19 = out1024[idx + 39];
        resIm19_s = eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out1024[idx + 39] = resIm19_s;
        out1024[idx + 219] = -resIm19_s;
        resRe19_s = eRe19 + (oRe19 * tRe19 - oIm19 * tRe13);
        out1024[idx + 218] = resRe19_s;
        out1024[idx + 38] = resRe19_s; 
        resRe45_s = eRe19 - (oRe19 * tRe19 - oIm19 * tRe13);
        out1024[idx + 166] = resRe45_s;
        out1024[idx + 90] = resRe45_s; 
        resIm45_s = -eIm19 + (oRe19 * tRe13 + oIm19 * tRe19);
        out1024[idx + 91] = resIm45_s;
        out1024[idx + 167] = -resIm45_s;

        oRe20 = out1024[idx + 168]; 
        oIm20 = out1024[idx + 169];
        eRe20 = out1024[idx + 40]; 
        eIm20 = out1024[idx + 41];
        resIm20_s = eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out1024[idx + 41] = resIm20_s;
        out1024[idx + 217] = -resIm20_s;
        resRe20_s = eRe20 + (oRe20 * tRe20 - oIm20 * tRe12);
        out1024[idx + 216] = resRe20_s;
        out1024[idx + 40] = resRe20_s; 
        resRe44_s = eRe20 - (oRe20 * tRe20 - oIm20 * tRe12);
        out1024[idx + 168] = resRe44_s;
        out1024[idx + 88] = resRe44_s; 
        resIm44_s = -eIm20 + (oRe20 * tRe12 + oIm20 * tRe20);
        out1024[idx + 89] = resIm44_s;
        out1024[idx + 169] = -resIm44_s;

        oRe21 = out1024[idx + 170]; 
        oIm21 = out1024[idx + 171];
        eRe21 = out1024[idx + 42]; 
        eIm21 = out1024[idx + 43];
        resIm21_s = eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out1024[idx + 43] = resIm21_s;
        out1024[idx + 215] = -resIm21_s;
        resRe21_s = eRe21 + (oRe21 * tRe21 - oIm21 * tRe11);
        out1024[idx + 214] = resRe21_s;
        out1024[idx + 42] = resRe21_s; 
        resRe43_s = eRe21 - (oRe21 * tRe21 - oIm21 * tRe11);
        out1024[idx + 170] = resRe43_s;
        out1024[idx + 86] = resRe43_s; 
        resIm43_s = -eIm21 + (oRe21 * tRe11 + oIm21 * tRe21);
        out1024[idx + 87] = resIm43_s;
        out1024[idx + 171] = -resIm43_s;

        oRe22 = out1024[idx + 172]; 
        oIm22 = out1024[idx + 173];
        eRe22 = out1024[idx + 44]; 
        eIm22 = out1024[idx + 45];
        resIm22_s = eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out1024[idx + 45] = resIm22_s;
        out1024[idx + 213] = -resIm22_s;
        resRe22_s = eRe22 + (oRe22 * tRe22 - oIm22 * tRe10);
        out1024[idx + 212] = resRe22_s;
        out1024[idx + 44] = resRe22_s; 
        resRe42_s = eRe22 - (oRe22 * tRe22 - oIm22 * tRe10);
        out1024[idx + 172] = resRe42_s;
        out1024[idx + 84] = resRe42_s; 
        resIm42_s = -eIm22 + (oRe22 * tRe10 + oIm22 * tRe22);
        out1024[idx + 85] = resIm42_s;
        out1024[idx + 173] = -resIm42_s;

        oRe23 = out1024[idx + 174]; 
        oIm23 = out1024[idx + 175];
        eRe23 = out1024[idx + 46]; 
        eIm23 = out1024[idx + 47];
        resIm23_s = eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out1024[idx + 47] = resIm23_s;
        out1024[idx + 211] = -resIm23_s;
        resRe23_s = eRe23 + (oRe23 * tRe23 - oIm23 * tRe9);
        out1024[idx + 210] = resRe23_s;
        out1024[idx + 46] = resRe23_s; 
        resRe41_s = eRe23 - (oRe23 * tRe23 - oIm23 * tRe9);
        out1024[idx + 174] = resRe41_s;
        out1024[idx + 82] = resRe41_s; 
        resIm41_s = -eIm23 + (oRe23 * tRe9 + oIm23 * tRe23);
        out1024[idx + 83] = resIm41_s;
        out1024[idx + 175] = -resIm41_s;

        oRe24 = out1024[idx + 176]; 
        oIm24 = out1024[idx + 177];
        eRe24 = out1024[idx + 48]; 
        eIm24 = out1024[idx + 49];
        resIm24_s = eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out1024[idx + 49] = resIm24_s;
        out1024[idx + 209] = -resIm24_s;
        resRe24_s = eRe24 + (oRe24 * tRe24 - oIm24 * tRe8);
        out1024[idx + 208] = resRe24_s;
        out1024[idx + 48] = resRe24_s; 
        resRe40_s = eRe24 - (oRe24 * tRe24 - oIm24 * tRe8);
        out1024[idx + 176] = resRe40_s;
        out1024[idx + 80] = resRe40_s; 
        resIm40_s = -eIm24 + (oRe24 * tRe8 + oIm24 * tRe24);
        out1024[idx + 81] = resIm40_s;
        out1024[idx + 177] = -resIm40_s;

        oRe25 = out1024[idx + 178]; 
        oIm25 = out1024[idx + 179];
        eRe25 = out1024[idx + 50]; 
        eIm25 = out1024[idx + 51];
        resIm25_s = eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out1024[idx + 51] = resIm25_s;
        out1024[idx + 207] = -resIm25_s;
        resRe25_s = eRe25 + (oRe25 * tRe25 - oIm25 * tRe7);
        out1024[idx + 206] = resRe25_s;
        out1024[idx + 50] = resRe25_s; 
        resRe39_s = eRe25 - (oRe25 * tRe25 - oIm25 * tRe7);
        out1024[idx + 178] = resRe39_s;
        out1024[idx + 78] = resRe39_s; 
        resIm39_s = -eIm25 + (oRe25 * tRe7 + oIm25 * tRe25);
        out1024[idx + 79] = resIm39_s;
        out1024[idx + 179] = -resIm39_s;

        oRe26 = out1024[idx + 180]; 
        oIm26 = out1024[idx + 181];
        eRe26 = out1024[idx + 52]; 
        eIm26 = out1024[idx + 53];
        resIm26_s = eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out1024[idx + 53] = resIm26_s;
        out1024[idx + 205] = -resIm26_s;
        resRe26_s = eRe26 + (oRe26 * tRe26 - oIm26 * tRe6);
        out1024[idx + 204] = resRe26_s;
        out1024[idx + 52] = resRe26_s; 
        resRe38_s = eRe26 - (oRe26 * tRe26 - oIm26 * tRe6);
        out1024[idx + 180] = resRe38_s;
        out1024[idx + 76] = resRe38_s; 
        resIm38_s = -eIm26 + (oRe26 * tRe6 + oIm26 * tRe26);
        out1024[idx + 77] = resIm38_s;
        out1024[idx + 181] = -resIm38_s;

        oRe27 = out1024[idx + 182]; 
        oIm27 = out1024[idx + 183];
        eRe27 = out1024[idx + 54]; 
        eIm27 = out1024[idx + 55];
        resIm27_s = eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out1024[idx + 55] = resIm27_s;
        out1024[idx + 203] = -resIm27_s;
        resRe27_s = eRe27 + (oRe27 * tRe27 - oIm27 * tRe5);
        out1024[idx + 202] = resRe27_s;
        out1024[idx + 54] = resRe27_s; 
        resRe37_s = eRe27 - (oRe27 * tRe27 - oIm27 * tRe5);
        out1024[idx + 182] = resRe37_s;
        out1024[idx + 74] = resRe37_s; 
        resIm37_s = -eIm27 + (oRe27 * tRe5 + oIm27 * tRe27);
        out1024[idx + 75] = resIm37_s;
        out1024[idx + 183] = -resIm37_s;

        oRe28 = out1024[idx + 184]; 
        oIm28 = out1024[idx + 185];
        eRe28 = out1024[idx + 56]; 
        eIm28 = out1024[idx + 57];
        resIm28_s = eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out1024[idx + 57] = resIm28_s;
        out1024[idx + 201] = -resIm28_s;
        resRe28_s = eRe28 + (oRe28 * tRe28 - oIm28 * tRe4);
        out1024[idx + 200] = resRe28_s;
        out1024[idx + 56] = resRe28_s; 
        resRe36_s = eRe28 - (oRe28 * tRe28 - oIm28 * tRe4);
        out1024[idx + 184] = resRe36_s;
        out1024[idx + 72] = resRe36_s; 
        resIm36_s = -eIm28 + (oRe28 * tRe4 + oIm28 * tRe28);
        out1024[idx + 73] = resIm36_s;
        out1024[idx + 185] = -resIm36_s;

        oRe29 = out1024[idx + 186]; 
        oIm29 = out1024[idx + 187];
        eRe29 = out1024[idx + 58]; 
        eIm29 = out1024[idx + 59];
        resIm29_s = eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out1024[idx + 59] = resIm29_s;
        out1024[idx + 199] = -resIm29_s;
        resRe29_s = eRe29 + (oRe29 * tRe29 - oIm29 * tRe3);
        out1024[idx + 198] = resRe29_s;
        out1024[idx + 58] = resRe29_s; 
        resRe35_s = eRe29 - (oRe29 * tRe29 - oIm29 * tRe3);
        out1024[idx + 186] = resRe35_s;
        out1024[idx + 70] = resRe35_s; 
        resIm35_s = -eIm29 + (oRe29 * tRe3 + oIm29 * tRe29);
        out1024[idx + 71] = resIm35_s;
        out1024[idx + 187] = -resIm35_s;

        oRe30 = out1024[idx + 188]; 
        oIm30 = out1024[idx + 189];
        eRe30 = out1024[idx + 60]; 
        eIm30 = out1024[idx + 61];
        resIm30_s = eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out1024[idx + 61] = resIm30_s;
        out1024[idx + 197] = -resIm30_s;
        resRe30_s = eRe30 + (oRe30 * tRe30 - oIm30 * tRe2);
        out1024[idx + 196] = resRe30_s;
        out1024[idx + 60] = resRe30_s; 
        resRe34_s = eRe30 - (oRe30 * tRe30 - oIm30 * tRe2);
        out1024[idx + 188] = resRe34_s;
        out1024[idx + 68] = resRe34_s; 
        resIm34_s = -eIm30 + (oRe30 * tRe2 + oIm30 * tRe30);
        out1024[idx + 69] = resIm34_s;
        out1024[idx + 189] = -resIm34_s;

        oRe31 = out1024[idx + 190]; 
        oIm31 = out1024[idx + 191];
        eRe31 = out1024[idx + 62]; 
        eIm31 = out1024[idx + 63];
        resIm31_s = eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out1024[idx + 63] = resIm31_s;
        out1024[idx + 195] = -resIm31_s;
        resRe31_s = eRe31 + (oRe31 * tRe31 - oIm31 * tRe1);
        out1024[idx + 194] = resRe31_s;
        out1024[idx + 62] = resRe31_s; 
        resRe33_s = eRe31 - (oRe31 * tRe31 - oIm31 * tRe1);
        out1024[idx + 190] = resRe33_s;
        out1024[idx + 66] = resRe33_s; 
        resIm33_s = -eIm31 + (oRe31 * tRe1 + oIm31 * tRe31);
        out1024[idx + 67] = resIm33_s;
        out1024[idx + 191] = -resIm33_s;

        oRe32  = out1024[idx +  192]; 
        oIm32 = out1024[idx +  193];
        eRe32  = out1024[idx +   64]; 
        eIm32 = out1024[idx +   65];
        resIm32_s = eIm32 + oRe32;
        out1024[idx +  65] =  resIm32_s;
        out1024[idx + 193] = -resIm32_s;
        resRe32_s = eRe32 - oIm32;
        out1024[idx + 192] =  resRe32_s;
        out1024[idx +  64] =  resRe32_s; 
    }

}


/*
int main() {
  return 0;
}*/

