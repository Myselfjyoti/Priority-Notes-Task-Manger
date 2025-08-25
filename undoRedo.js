class UndoRedo {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    addAction(action) {
        this.undoStack.push(action);
        this.redoStack = []; // clear redo on new action
    }

    undo() {
        if(this.undoStack.length === 0) return null;
        const action = this.undoStack.pop();
        this.redoStack.push(action);
        return action;
    }

    redo() {
        if(this.redoStack.length === 0) return null;
        const action = this.redoStack.pop();
        this.undoStack.push(action);
        return action;
    }
}
