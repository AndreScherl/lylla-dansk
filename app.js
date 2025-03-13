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
    const nachrichtElement = document.getElementById('nachricht');

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
            spielstandLaden();
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
        nachrichtAusblenden();
    }

    // Anzeige aktualisieren
    function aktualisiereAnzeige() {
        deutschesWortElement.textContent = `${aktuellesWort.deutsch}`;
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

        // Überprüfen, ob das Spiel verloren ist
        if (falscheVersuche === 8) {
            nachrichtAnzeigen(`Game Over! Das dänische Wort war: ${aktuellesWort.danish}`);
            buchstabenContainer.querySelectorAll('button').forEach(button => button.disabled = true);
            neustartButton.style.display = 'block';
            spielstandSpeichern();
            return;
        }

        // Überprüfen, ob das Wort vollständig geraten wurde (ignoriere Leerzeichen)
        const wortOhneLeerzeichen = aktuellesWort.danish.replace(/\s/g, '');
        const gerateneBuchstabenOhneLeerzeichen = gerateneBuchstaben.filter(b => b !== ' ');
        if (wortOhneLeerzeichen.split('').every(b => gerateneBuchstabenOhneLeerzeichen.includes(b.toLowerCase()))) {
            punkte++;
            nachrichtAnzeigen('Richtig! Du hast einen Punkt erhalten.');
            setTimeout(() => {
                neuesSpiel();
            }, 3000);
        }

        aktualisiereAnzeige();
        spielstandSpeichern();
    }

    // Nachricht anzeigen
    function nachrichtAnzeigen(text) {
        nachrichtElement.textContent = text;
        nachrichtElement.style.display = 'block';
    }

    // Nachricht ausblenden
    function nachrichtAusblenden() {
        nachrichtElement.style.display = 'none';
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

        // Arme
        if (versuche >= 7) {
            ctx.beginPath();
            ctx.moveTo(150, 160); // Linker Arm
            ctx.lineTo(120, 140);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(160, 160); // Rechter Arm
            ctx.lineTo(190, 140);
            ctx.stroke();
        }

        // Beine
        if (versuche >= 8) {
            ctx.beginPath();
            ctx.moveTo(150, 220); // Linkes Bein
            ctx.lineTo(120, 260);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(160, 220); // Rechtes Bein
            ctx.lineTo(190, 260);
            ctx.stroke();
        }
    }

    // Neustart
    neustartButton.addEventListener('click', () => {
        punkte = 0;
        neuesSpiel();
    });

    // Spielstand speichern
    function spielstandSpeichern() {
        const spielstand = {
            punkte,
            aktuellesWort,
            gerateneBuchstaben,
            falscheVersuche
        };
        localStorage.setItem('hangmanSpielstand', JSON.stringify(spielstand));
    }

    // Spielstand laden
    function spielstandLaden() {
        const spielstand = JSON.parse(localStorage.getItem('hangmanSpielstand'));
        if (spielstand) {
            punkte = spielstand.punkte || 0;
            aktuellesWort = spielstand.aktuellesWort || null;
            gerateneBuchstaben = spielstand.gerateneBuchstaben || [];
            falscheVersuche = spielstand.falscheVersuche || 0;
        }
    }
});