document.addEventListener('DOMContentLoaded', () => {
    const vokabeln = [];
    let aktuellesWort = null;
    let gerateneBuchstaben = [];
    let falscheVersuche = 0;
    let punkte = 0;
    let erstesSpiel = true;

    const deutschesWortElement = document.getElementById('deutsches-wort');
    const danishDisplayElement = document.getElementById('danish-display');
    const punkteElement = document.getElementById('punkte');
    const buchstabenContainer = document.getElementById('buchstaben-container');
    const neustartButton = document.getElementById('neustart-button');
    const canvas = document.getElementById('hangman-canvas');
    const ctx = canvas.getContext('2d');

    // Canvas-Größe
    canvas.width = 200;
    canvas.height = 300;

    // Alphabet für die Buttons
    const alphabet = 'abcdefghijklmnopqrstuvwxyzæøå'.split('');

    // Vokabeln laden
    fetch('vokabeln.csv')
        .then(response => response.text())
        .then(data => {
            data.split('\n').forEach(line => {
                const [deutsch, danish] = line.split(',');
                vokabeln.push({ deutsch, danish });
            });
            neuesSpiel();
        });

    // Neues Spiel starten
    function neuesSpiel() {
        if (erstesSpiel) {
            // Beim ersten Spiel das erste Wort der Liste verwenden
            aktuellesWort = vokabeln[0];
            erstesSpiel = false; // Flagge zurücksetzen
        } else {
            // Bei jedem weiteren Spiel ein zufälliges Wort auswählen
            aktuellesWort = vokabeln[Math.floor(Math.random() * vokabeln.length)];
        }
        gerateneBuchstaben = [];
        falscheVersuche = 0;
        aktualisiereAnzeige();
        neustartButton.style.display = 'none';
        buchstabenContainer.innerHTML = ''; // Buttons zurücksetzen
        alphabet.forEach(buchstabe => {
            const button = document.createElement('button');
            button.textContent = buchstabe.toUpperCase();
            button.classList.add('buchstabe-button');
            button.addEventListener('click', () => buchstabeRaten(buchstabe));
            buchstabenContainer.appendChild(button);
        });
        zeichneHangman(0); // Galgen zurücksetzen
    }

    // Anzeige aktualisieren
    function aktualisiereAnzeige() {
        deutschesWortElement.textContent = `Deutsches Wort: ${aktuellesWort.deutsch}`;
        danishDisplayElement.textContent = aktuellesWort.danish
            .split('')
            .map(buchstabe => {
                if (buchstabe === ' ') {
                    return ' '; // Leerzeichen direkt anzeigen
                } else if (gerateneBuchstaben.includes(buchstabe.toLowerCase())) {
                    return buchstabe; // Geratene Buchstaben anzeigen
                } else {
                    return '_'; // Ungeratene Buchstaben als Unterstrich anzeigen
                }
            })
            .join(''); // Leerzeichen bleiben erhalten
        punkteElement.textContent = `Punkte: ${punkte}`;
    }

    function buchstabeRaten(buchstabe) {
        if (gerateneBuchstaben.includes(buchstabe)) return;

        gerateneBuchstaben.push(buchstabe);

        // Deaktiviere den Button für den geratenen Buchstaben
        const button = Array.from(buchstabenContainer.children).find(
            btn => btn.textContent.toLowerCase() === buchstabe
        );
        if (button) {
            button.disabled = true; // Button deaktivieren
        }

        // Überprüfen, ob der Buchstabe im Wort vorkommt (ignoriere Leerzeichen)
        if (!aktuellesWort.danish.toLowerCase().includes(buchstabe) && buchstabe !== ' ') {
            falscheVersuche++;
            zeichneHangman(falscheVersuche);
        }

        // Überprüfen, ob das Wort vollständig geraten wurde (ignoriere Leerzeichen)
        const wortOhneLeerzeichen = aktuellesWort.danish.replace(/\s/g, '');
        const gerateneBuchstabenOhneLeerzeichen = gerateneBuchstaben.filter(b => b !== ' ');
        if (wortOhneLeerzeichen.split('').every(b => gerateneBuchstabenOhneLeerzeichen.includes(b.toLowerCase()))) {
            punkte++;
            alert('Richtig! Du hast einen Punkt erhalten.');
            neuesSpiel(); // Neues Spiel starten
        }

        aktualisiereAnzeige();
    }

    // Hangman zeichnen
    function zeichneHangman(versuche) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Galgen
        if (versuche >= 1) ctx.fillRect(10, 290, 180, 10); // Basis
        if (versuche >= 2) ctx.fillRect(50, 50, 10, 240);  // Pfahl
        if (versuche >= 3) ctx.fillRect(50, 50, 100, 10);  // Querbalken
        if (versuche >= 4) ctx.fillRect(150, 50, 10, 50);   // Seil

        // Kopf
        if (versuche >= 5) ctx.beginPath(), ctx.arc(155, 120, 20, 0, Math.PI * 2), ctx.stroke();

        // Körper
        if (versuche >= 6) ctx.fillRect(150, 140, 10, 80);
    }

    // Neustart
    neustartButton.addEventListener('click', () => {
        punkte = 0;
        neuesSpiel();
    });
});