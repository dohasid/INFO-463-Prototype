const letterFrequencies = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'C', 'U', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z'];

const nextLetterMap = {
    T: ['H', 'R', 'O'],
    H: ['E', 'A', 'I'],
    A: ['N', 'T', 'S'],
    // etc...
};
