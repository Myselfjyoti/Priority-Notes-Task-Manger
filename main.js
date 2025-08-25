// ======== DSA Structures (Heap, Trie, Stack for Undo/Redo) ========
class MaxHeap {
    constructor() { this.heap = []; }
    insert(note) { this.heap.push(note); this.bubbleUp(this.heap.length - 1); }
    bubbleUp(index) {
        if(index === 0) return;
        const parent = Math.floor((index-1)/2);
        if(this.heap[index].priority > this.heap[parent].priority){
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            this.bubbleUp(parent);
        }
    }
}
class TrieNode { constructor(){ this.children = {}; this.isEnd=false; } }
class Trie {
    constructor(){ this.root=new TrieNode(); }
    insert(word){
        let node=this.root;
        for(let c of word.toLowerCase()){
            if(!node.children[c]) node.children[c]=new TrieNode();
            node=node.children[c];
        }
        node.isEnd=true;
    }
    searchPrefix(prefix){
        let node=this.root;
        for(let c of prefix.toLowerCase()){ if(!node.children[c]) return []; node=node.children[c]; }
        return this.collectWords(node, prefix.toLowerCase());
    }
    collectWords(node, prefix){
        let res=[];
        if(node.isEnd) res.push(prefix);
        for(let c in node.children) res=res.concat(this.collectWords(node.children[c], prefix+c));
        return res;
    }
}
class UndoRedo { 
    constructor(){ this.undoStack=[]; this.redoStack=[]; }
    addAction(act){ this.undoStack.push(act); this.redoStack=[]; }
    undo(){ if(this.undoStack.length===0) return null; const act=this.undoStack.pop(); this.redoStack.push(act); return act; }
    redo(){ if(this.redoStack.length===0) return null; const act=this.redoStack.pop(); this.undoStack.push(act); return act; }
}

// ======== Global Variables ========
const heap = new MaxHeap();
const trie = new Trie();
const undoRedo = new UndoRedo();

const notesArea = document.getElementById('notesArea');
const searchInput = document.getElementById('search');

// ======== Render Notes ========
function renderNotes() {
    notesArea.innerHTML = '';
    heap.heap.forEach(note => {
        const div = document.createElement('div');
        div.className = `note-card ${note.priorityClass}`;
        div.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <div class="tags">${note.tags.join(', ')}</div>
            <button class="deleteBtn">Delete</button>
        `;
        div.querySelector('.deleteBtn').onclick = () => deleteNote(note);
        notesArea.appendChild(div);
    });
    renderTags();
}

// ======== Sidebar Tags ========
function renderTags() {
    const tagListDiv = document.getElementById('tagList');
    tagListDiv.innerHTML = '';
    const allTags = new Set();
    heap.heap.forEach(note => note.tags.forEach(tag => allTags.add(tag)));
    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.textContent = tag;
        btn.onclick = () => filterNotesByTag(tag);
        tagListDiv.appendChild(btn);
    });
    const showAllBtn = document.createElement('button');
    showAllBtn.textContent = 'Show All';
    showAllBtn.onclick = () => renderNotes();
    tagListDiv.appendChild(showAllBtn);
}
function filterNotesByTag(tag){
    notesArea.innerHTML='';
    heap.heap.forEach(note=>{
        if(note.tags.includes(tag)){
            const div=document.createElement('div');
            div.className=`note-card ${note.priorityClass}`;
            div.innerHTML=`<h3>${note.title}</h3><p>${note.content}</p>
                           <div class="tags">${note.tags.join(', ')}</div>
                           <button class="deleteBtn">Delete</button>`;
            div.querySelector('.deleteBtn').onclick = ()=>deleteNote(note);
            notesArea.appendChild(div);
        }
    });
}

// ======== Add Note ========
function addNote(title, content, priority, tags){
    const priorityValue = priority==='High'?3:priority==='Medium'?2:1;
    const note={ title, content, priority:priorityValue, priorityClass:priority.toLowerCase()+'-priority', tags };
    heap.insert(note);
    trie.insert(title);
    undoRedo.addAction({type:'add', note});
    renderNotes();
    addToCalendar(note);
}

// ======== Delete Note ========
function deleteNote(note){
    const index = heap.heap.indexOf(note);
    if(index>-1){ heap.heap.splice(index,1); heap.heap.forEach((_,i)=>heap.bubbleUp(i)); }
    undoRedo.addAction({type:'delete', note});
    renderNotes();
}

// ======== Modal ========
const modal = document.createElement('div');
modal.id='noteModal';
modal.style.display='none';
modal.innerHTML=`<div style="position:fixed;top:0;left:0;width:100%;height:100%;
 background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;">
 <div style="background:#fff;padding:20px;border-radius:8px;width:300px;position:relative;">
 <span id="closeModal" style="position:absolute;top:5px;right:10px;cursor:pointer;">&times;</span>
 <h2>Add Note</h2>
 <input type="text" id="noteTitle" placeholder="Title" style="width:100%;margin:5px 0;">
 <textarea id="noteContent" placeholder="Content" style="width:100%;margin:5px 0;"></textarea>
 <select id="notePriority" style="width:100%;margin:5px 0;">
 <option>High</option><option>Medium</option><option>Low</option>
 </select>
 <input type="text" id="noteTags" placeholder="Tags (comma separated)" style="width:100%;margin:5px 0;">
 <button id="saveNoteBtn" style="width:100%;margin-top:5px;">Save Note</button>
 </div></div>`;
document.body.appendChild(modal);

document.getElementById('addNoteBtn').onclick = ()=>modal.style.display='flex';
document.getElementById('closeModal').onclick = ()=>modal.style.display='none';
document.getElementById('saveNoteBtn').onclick = ()=>{
    const title=document.getElementById('noteTitle').value.trim();
    const content=document.getElementById('noteContent').value.trim();
    let priority=document.getElementById('notePriority').value;
    const tags=document.getElementById('noteTags').value.split(',').map(t=>t.trim()).filter(t=>t);
    if(!title||!content){ alert('Title and Content required'); return; }
    if(!['High','Medium','Low'].includes(priority)) priority='Low';
    addNote(title, content, priority, tags);
    document.getElementById('noteTitle').value='';
    document.getElementById('noteContent').value='';
    document.getElementById('noteTags').value='';
    modal.style.display='none';
}

// ======== Undo / Redo ========
document.getElementById('undoBtn').onclick = ()=>{
    const action=undoRedo.undo();
    if(!action) return;
    if(action.type==='add') deleteNote(action.note);
    else if(action.type==='delete'){ heap.insert(action.note); renderNotes(); }
};
document.getElementById('redoBtn').onclick = ()=>{
    const action=undoRedo.redo();
    if(!action) return;
    if(action.type==='add'){ heap.insert(action.note); renderNotes(); }
    else if(action.type==='delete') deleteNote(action.note);
}

// ======== Search Engine ========
let searchDropdown=document.createElement('div');
searchDropdown.id='searchDropdown';
searchDropdown.style.position='absolute';
searchDropdown.style.background='#fff';
searchDropdown.style.border='1px solid #ccc';
searchDropdown.style.maxHeight='150px';
searchDropdown.style.overflowY='auto';
searchDropdown.style.display='none';
document.body.appendChild(searchDropdown);

searchInput.addEventListener('input',()=>{
    const query=searchInput.value.trim();
    searchDropdown.innerHTML='';
    if(!query){ searchDropdown.style.display='none'; renderNotes(); return; }
    const results=trie.searchPrefix(query);
    if(results.length===0){ searchDropdown.style.display='none'; return; }
    results.forEach(title=>{
        const item=document.createElement('div');
        item.textContent=title;
        item.style.padding='5px';
        item.style.cursor='pointer';
        item.onmouseover=()=>item.style.background='#eee';
        item.onmouseout=()=>item.style.background='#fff';
        item.onclick=()=>{
            searchDropdown.style.display='none';
            filterNotesByTitle(title);
            searchInput.value='';
        }
        searchDropdown.appendChild(item);
    });
    const rect=searchInput.getBoundingClientRect();
    searchDropdown.style.top=rect.bottom+'px';
    searchDropdown.style.left=rect.left+'px';
    searchDropdown.style.width=rect.width+'px';
    searchDropdown.style.display='block';
});

function filterNotesByTitle(title){
    notesArea.innerHTML='';
    heap.heap.forEach(note=>{
        if(note.title.toLowerCase()===title.toLowerCase()){
            const div=document.createElement('div');
            div.className=`note-card ${note.priorityClass}`;
            div.innerHTML=`<h3>${note.title}</h3><p>${note.content}</p>
                           <div class="tags">${note.tags.join(', ')}</div>
                           <button class="deleteBtn">Delete</button>`;
            div.querySelector('.deleteBtn').onclick = ()=>deleteNote(note);
            notesArea.appendChild(div);
        }
    });
}

// ======== Calendar Sync ========
function addToCalendar(note){
    if(!window.calendar) return;
    if(note.priorityClass==='high-priority'){
        window.calendar.addEvent({title:note.title, start:new Date(), description:note.content});
    }
}
document.addEventListener('DOMContentLoaded',function(){
    const calendarEl=document.getElementById('calendar');
    window.calendar=new FullCalendar.Calendar(calendarEl,{initialView:'dayGridMonth', height:400});
    window.calendar.render();
});

// ======== PDF Export ========
document.getElementById('exportPDFBtn').onclick=()=>{
    if(heap.heap.length===0){ alert('No notes to export!'); return; }
    const { jsPDF }=window.jspdf;
    const doc=new jsPDF();
    let y=10;
    heap.heap.forEach((note,index)=>{
        doc.setFontSize(14);
        doc.text(`${index+1}. ${note.title} [${note.priorityClass.replace('-priority','')}]`,10,y);
        y+=8;
        doc.setFontSize(12);
        const splitContent=doc.splitTextToSize(note.content,180);
        doc.text(splitContent,12,y);
        y+=splitContent.length*6;
        if(note.tags.length>0){
            doc.setFontSize(10);
            doc.text(`Tags: ${note.tags.join(', ')}`,12,y);
            y+=8;
        } else y+=4;
        if(y>280){ doc.addPage(); y=10; }
    });
    doc.save('Notes.pdf');
};

// ======== Example Notes ========
addNote('Project Proposal','Finish client proposal','High',['Work','Important']);
addNote('Grocery List','Milk, Eggs, Bread','Low',['Personal']);
