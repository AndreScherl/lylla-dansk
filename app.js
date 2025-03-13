document.addEventListener('DOMContentLoaded', () => {
    const vokabeln = [];
    let aktuellesWort = null;
    let gerateneBuchstaben = [];
    let versuche = 3;
    let punkte = 0;

    const deutschesWortElement = document.getElementById('deutsches-wort');
    const danishDisplayElement = document.getElementById('danish-display');
    const versucheElement = document.getElementById('versuche');
    const punkteElement = document.getElementById('punkte');
    const buchstabenContainer = document.getElementById('buchstaben-container');
    const neustartButton = document.getElementById('neustart-button');

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
        versuche = 3;
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
    }

    // Anzeige aktualisieren
    function aktualisiereAnzeige() {
        deutschesWortElement.textContent = `Deutsches Wort: ${aktuellesWort.deutsch}`;
        danishDisplayElement.textContent = aktuellesWort.danish
            .split('')
            .map(buchstabe => (gerateneBuchstaben.includes(buchstabe.toLowerCase()) ? buchstabe : '_'))
            .join(' ');
        versucheElement.textContent = `Verbleibende Versuche: ${versuche}`;
        punkteElement.textContent = `Punkte: ${punkte}`;
    }

    // Buchstabe raten
    function buchstabeRaten(buchstabe) {
        if (gerateneBuchstaben.includes(buchstabe)) return;

        gerateneBuchstaben.push(buchstabe);

        if (!aktuellesWort.danish.toLowerCase().includes(buchstabe)) {
            versuche--;
        }

        if (versuche === 0) {
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

    // Neustart
    neustartButton.addEventListener('click', () => {
        punkte = 0;
        neuesSpiel();
    });
});