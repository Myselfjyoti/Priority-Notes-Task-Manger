class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for(let char of word.toLowerCase()){
            if(!node.children[char]) node.children[char] = new TrieNode();
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    searchPrefix(prefix) {
        let node = this.root;
        for(let char of prefix.toLowerCase()){
            if(!node.children[char]) return [];
            node = node.children[char];
        }
        return this.collectWords(node, prefix.toLowerCase());
    }

    collectWords(node, prefix){
        let results = [];
        if(node.isEndOfWord) results.push(prefix);
        for(let char in node.children){
            results = results.concat(this.collectWords(node.children[char], prefix + char));
        }
        return results;
    }
}
