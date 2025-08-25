document.getElementById('exportPDF').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    heap.heap.forEach(note => {
        doc.setFontSize(14);
        doc.text(`Title: ${note.title}`, 10, y);
        y += 6;
        doc.setFontSize(12);
        doc.text(`Content: ${note.content}`, 10, y);
        y += 6;
        doc.text(`Priority: ${note.priorityClass.replace('-priority','')}`, 10, y);
        y += 6;
        doc.text(`Tags: ${note.tags.join(', ')}`, 10, y);
        y += 10;
        if(y > 280) { doc.addPage(); y = 10; }
    });

    doc.save('Notes.pdf');
});
