// CVC (Consonant-Vowel-Consonant) words appropriate for early readers
const CVC_WORDS = [
    // Animals
    'cat', 'dog', 'pig', 'cow', 'fox', 'rat', 'bat', 'hen', 'duck',
    
    // Body parts
    'eye', 'ear', 'arm', 'leg', 'lip', 'toe',
    
    // Food
    'egg', 'jam', 'pie', 'nut', 'cup', 'mug',
    
    // Nature
    'sun', 'moon', 'star', 'tree', 'leaf', 'rock', 'sand',
    
    // Colors
    'red', 'blue', 'pink', 'gray', 'brown',
    
    // Actions
    'run', 'sit', 'stand', 'jump', 'hop', 'walk', 'talk', 'look', 'see',
    
    // Objects
    'hat', 'cap', 'bag', 'box', 'map', 'book', 'pen', 'key', 'door', 'wall',
    
    // Family
    'mom', 'dad', 'boy', 'girl', 'man', 'woman',
    
    // Numbers
    'one', 'two', 'ten',
    
    // Common words
    'the', 'and', 'for', 'can', 'get', 'put', 'let', 'big', 'small', 'hot', 'cold',
    'wet', 'dry', 'new', 'old', 'good', 'bad', 'yes', 'no', 'up', 'down', 'in', 'out',
    'on', 'off', 'at', 'to', 'of', 'is', 'it', 'he', 'she', 'we', 'me', 'my', 'you'
];

// Function to get random words without duplicates
function getRandomWords(count = 6) {
    const shuffled = [...CVC_WORDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CVC_WORDS, getRandomWords };
} 