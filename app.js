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
    const eingabeElement = document.getElementById('eingabe');
    const ratenButton = document.getElementById('raten-button');
    const neustartButton = document.getElementById('neustart-button');

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
        ratenButton.disabled = false;
    }

    // Anzeige aktualisieren
    function aktualisiereAnzeige() {
        deutschesWortElement.textContent = `Deutsches Wort: ${aktuellesWort.deutsch}`;
        danishDisplayElement.textContent = aktuellesWort.danish
            .split('')
            .map(buchstabe => (gerateneBuchstaben.includes(buchstabe) ? buchstabe : '_'))
            .join(' ');
        versucheElement.textContent = `Verbleibende Versuche: ${versuche}`;
        punkteElement.textContent = `Punkte: ${punkte}`;
    }

    // Buchstabe raten
    ratenButton.addEventListener('click', () => {
        const buchstabe = eingabeElement.value.toLowerCase();
        eingabeElement.value = '';

        if (!buchstabe || gerateneBuchstaben.includes(buchstabe)) return;

        gerateneBuchstaben.push(buchstabe);

        if (!aktuellesWort.danish.toLowerCase().includes(buchstabe)) {
            versuche--;
        }

        if (versuche === 0) {
            alert(`Game Over! Das dänische Wort war: ${aktuellesWort.danish}`);
            neustartButton.style.display = 'block';
            ratenButton.disabled = true;
        } else if (aktuellesWort.danish.split('').every(b => gerateneBuchstaben.includes(b))) {
            punkte++;
            alert('Richtig! Du hast einen Punkt erhalten.');
            neuesSpiel();
        }

        aktualisiereAnzeige();
    });

    // Neustart
    neustartButton.addEventListener('click', () => {
        punkte = 0;
        neuesSpiel();
    });
});