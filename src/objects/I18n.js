import Rosetta from 'rosetta';

// case sensitive keys
const i18n = new Rosetta({
	de: {
		index: {
			'Drop CSV file with data anywhere to visualize it': 'Ziehe eine CSV-Datei mit Daten hierher, um sie zu visualisieren',
			'What is this?': "Worum geht's?",
			'This is a visualizer tool for your work data': "Dies ist ein Visualisierungstool für deine Arbeitszeitdaten",
			'Drag and drop a CSV file with such data anywhere onto this area to get started': "Ziehe eine CSV-Datei mit solchen Daten überall in diesen Bereich, um loszulegen",
			'CSV columns': "CSV-Spalten",
			'Example': "Beispiel",
			'You can leave out any days you do not want to be displayed as well, gaps are supported': "Du kannst jeden Tag auslassen, den du nicht angezeigt haben möchtest, Lücken werden unterstützt",
			'Always put in the expected columns in the first row of your CSV': "Zuerst immer die erwarteten Spalten in der ersten Zeile deiner CSV einfügen",
			'Limitations': "Einschränkungen",
			'This tool is not meant to be used for work that spans multiple days': "Dieses Tool ist nicht für Arbeit gedacht, die auf mehrere Tage verteilt ist",
			'Your work needs to start and end on the same day for this tool to accurately work': "Deine Arbeit muss am selben Tag beginnen und enden, damit dieses Tool korrekt funktioniert.",
			'Sample': "Beispiel",
			'Use this sample to get started quickly, simply reload the page to see this text again': "Benutze dieses Beispiel, um schnell loszulegen, um diesen Text erneut zu sehen, lade einfach die Seite neu",
			'Use example': "Beispiel nutzen",
			'Download': "Herunterladen",
			'Some example note': "Eine Beispielnotiz",
		},
		home: {
			'Table': "Tabelle",
			'Times': "Zeiten",
			'Dates': "Datum",
			'End': "Ende",
			'Summary': "Zusammenfassung",
			'day': "Tag",
			'days': "Tage",
			'Averages': "Durchschnitt",
			'Totals': "Gesamt",
			'Partial sick days and half vacation days are counted towards sick/vacation and work days': "Anteilige Krankheitstage und halbe Urlaubstage werden sowohl als Arbeitstag als auch als Krankheits-/Urlaubtstag gezählt",
			'Break times': "Pausenzeiten",
		},
		calendar: {
			'Total': "Gesamt",
			'in': "im",
			'Workdays': "Arbeitstage",
		},
		ChartElement: {
			'Workdays': "Arbeitstage",
			'Absent days off': 'Abwesenheiten aus',
			'Absent days on': 'Abwesenheiten an',
			'Starttime on': 'Startzeit an',
			'Starttime off': 'Startzeit aus'
		},
		Table: {
			'End': "Ende",
			'Date': "Datum",
			'Note': "Notiz",
			'Worktime': "Arbeitszeit",
			'Break from/to': "Pause von/bis",
			'No data available': "Keine Daten verfügbar",
		},
		icon: {
			'Holidays': "Feiertage",
			'Break': "Pause",
			'Sick': "Krank",
			'Overtime probability': "Überstunden Wahrscheinlichkeit",
			'Vacation': "Urlaub",
			'Work': "Arbeit",
		}
	},
});
i18n.locale(
	(navigator.language || navigator.userLanguage).substr(0, 2)
);

const __ = (key, opts, lang) => {
	let t = i18n.t(key, opts, lang);

	return t.length > 0 && t !== key ? t : key.replace(/^.+?\./i, '');
}

export default __;