document.addEventListener('DOMContentLoaded', () => {
    const vokabeln = [];
    let aktuellesWort = null;
    let gerateneBuchstaben = [];
    let falscheVersuche = 0;
    let punkte = 0;

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
        aktuellesWort = vokabeln[Math.floor(Math.random() * vokabeln.length)];
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
            .map(buchstabe => (gerateneBuchstaben.includes(buchstabe.toLowerCase()) ? buchstabe : '_')
            .join(' ');
        punkteElement.textContent = `Punkte: ${punkte}`;
    }

    // Buchstabe raten
    function buchstabeRaten(buchstabe) {
        if (gerateneBuchstaben.includes(buchstabe)) return;

        gerateneBuchstaben.push(buchstabe);

        if (!aktuellesWort.danish.toLowerCase().includes(buchstabe)) {
            falscheVersuche++;
            zeichneHangman(falscheVersuche);
        }

        if (falscheVersuche === 6) {
            alert(`Game Over! Das dänische Wort war: ${aktuellesWort.danish}`);
            neustartButton.style.display = 'block';
            buchstabenContainer.querySelectorAll('button').forEach(button => button.disabled = true);
        } else if (aktuellesWort.danish.split('').every(b => gerateneBuchstaben.includes(b.toLowerCase()))) {
            punkte++;
            alert('Richtig! Du hast einen Punkt erhalten.');
            neuesSpiel();
        }

        aktualisiereAnzeige();
        document.querySelector(`.buchstabe-button[disabled]`); // Deaktiviere den geratenen Buchstaben
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