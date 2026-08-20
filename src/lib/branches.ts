/**
 * Branch-specific invoice template data powering /skabeloner/[slug]/ pages.
 *
 * Each entry contains real invoicing specifics for the trade (typical line
 * items, rate levels, invoicing tips) so the pages carry genuine, distinct
 * content rather than templated boilerplate. Prices are indicative Danish
 * market levels and phrased with ranges on the pages.
 */

export interface BranchLineItem {
	description: string;
	quantity: string;
	unit: string;
	unitPrice: string;
}

export interface Branch {
	slug: string;
	/** Erhverv, singular lowercase — used in body copy. */
	trade: string;
	/** Plural form used in titles and headings. */
	tradePlural: string;
	description: string;
	intro: string[];
	lineItems: BranchLineItem[];
	rateNote: string;
	tips: string[];
	/** Optional trade-specific moms nuance. */
	momsNote?: string;
}

export const BRANCHES: Branch[] = [
	{
		slug: 'elektriker',
		trade: 'elektriker',
		tradePlural: 'elektrikere',
		description:
			'Gratis faktura skabelon til elektrikere med typiske poster som el-arbejde, materialer og FE-godkendt udstyr. Download eller lav fakturaen online.',
		intro: [
			'Som elektriker fakturerer du typisk en blanding af arbejdstimer, kørsel og materialer — og det er vigtigt, at posterne står tydeligt adskilt på fakturaen, så kunden kan se, hvad der er hvad.',
			'Vores skabelon indeholder alle de lovpligtige felter (CVR, fakturanummer, momsbeløb m.v.) og er klar til brug med det samme.'
		],
		lineItems: [
			{
				description: 'Elinstallation - nedlukning af gruppetavle',
				quantity: '2,5',
				unit: 'timer',
				unitPrice: '595'
			},
			{
				description: 'Montering af nye stikkontakter',
				quantity: '4',
				unit: 'stk',
				unitPrice: '250'
			},
			{
				description: 'Materiale: stikkontakter og ledning',
				quantity: '1',
				unit: 'sæt',
				unitPrice: '480'
			}
		],
		rateNote:
			'Elektrikere i Danmark fakturerer typisk mellem 400 og 700 kr. i timen ekskl. moms afhængigt af opgavens art og region, plus materialer med avance.',
		tips: [
			'Adskil arbejde og materialer på hver sin linje — det gør det lettere for kunden at gennemskøre tilbuddet.',
			'Skriv FE-godkendt udstyr ind i beskrivelsen, når du monterer komponenter.',
			'Fakturer kørsel som en separat linje, hvis den ikke er indeholdt i timeprisen.'
		]
	},
	{
		slug: 'toemrer',
		trade: 'tømrer',
		tradePlural: 'tømrere',
		description:
			'Gratis faktura skabelon til tømrere med typiske poster som tømrerarbejde, materialer og montering. Download Word/Excel/PDF eller fakturer online.',
		intro: [
			'Tømreropgaver spænder fra mindre reparationer til hele tilbygninger, og fakturaen skal derfor nemt kunne rumme både timer, materialer og fastpriser.',
			'Med skabelonen her får du en professionel faktura med alle lovkrav opfyldt — uanset om opgaven var et nyt dæk eller en carport.'
		],
		lineItems: [
			{ description: 'Reparation af træterrasse', quantity: '6', unit: 'timer', unitPrice: '450' },
			{
				description: 'Materiale: trykimpregneret træ',
				quantity: '12',
				unit: 'm²',
				unitPrice: '145'
			},
			{
				description: 'Bortskaffelse af gammelt materiale',
				quantity: '1',
				unit: 'parti',
				unitPrice: '350'
			}
		],
		rateNote:
			'Tømrere fakturerer typisk mellem 350 og 550 kr. i timen ekskl. moms, mens materialer lægges oveni med avance.',
		tips: [
			'Læg materialer på fakturaen med en klar materiellinje — ikke gemt i timeprisen.',
			'Ved fastprisaftaler skal aftalen gå frem af fakturabeskrivelsen, så der ikke er tvivl.',
			'Husk at fakturadato og leveringsdato kan falde forskelligt, hvis arbejdet strakte sig over flere dage.'
		]
	},
	{
		slug: 'maler',
		trade: 'maler',
		tradePlural: 'malere',
		description:
			'Gratis faktura skabelon til malere med typiske poster som malerarbejde pr. m², maling og afdækning. Download eller lav fakturaen online.',
		intro: [
			'Malere fakturerer oftest efter antal kvadratmeter eller efter time — og nogle gange begge dele på samme opgave. Skabelonen her håndterer begge dele.',
			'Du får alle de lovpligtige felter med, så fakturaen er klar til at sende til kunden med det samme.'
		],
		lineItems: [
			{
				description: 'Maling af vægge og lofter - 2 gange',
				quantity: '85',
				unit: 'm²',
				unitPrice: '95'
			},
			{ description: 'Afdækning og forberedelse', quantity: '3', unit: 'timer', unitPrice: '375' },
			{ description: 'Materiale: vægmaling', quantity: '9', unit: 'L', unitPrice: '189' }
		],
		rateNote:
			'Malerarbejde ligger typisk på 60–150 kr. pr. m² ekskl. moms eller 200–350 kr. i timen, afhængigt af overflade og antal strøg.',
		tips: [
			'Skriv antal strøg og malingstype i beskrivelsen — det dokumenterer, hvad prisen dækker.',
			'Maling og afdækning bør fremgå som egne linjer, så kunden kan se materialeforbruget.',
			'Tag billeder af arealet før og efter; det gør eventuelle diskussioner om omfanget meget lettere.'
		]
	},
	{
		slug: 'vvs',
		trade: 'VVS-installatør',
		tradePlural: 'VVS-installatører',
		description:
			'Gratis faktura skabelon til VVS-installatører med typiske poster som installationsarbejde, fittings og service. Download eller fakturer online.',
		intro: [
			'VVS-opgaver kombinerer ofte akut service, fastprisinstallationer og materialeforbrug — og fakturaen skal kunne holde orden på det hele.',
			'Skabelonen er sat op med de typiske poster for VVS-arbejde og opfylder samtidig alle lovkrav til fakturaindhold.'
		],
		lineItems: [
			{
				description: 'Udskiftning af blandingsbatteri',
				quantity: '1,5',
				unit: 'timer',
				unitPrice: '650'
			},
			{
				description: 'Materiale: blandingsbatteri og slanger',
				quantity: '1',
				unit: 'sæt',
				unitPrice: '850'
			},
			{
				description: 'Tæthedskontrol og afprøvning',
				quantity: '0,5',
				unit: 'timer',
				unitPrice: '650'
			}
		],
		rateNote:
			'VVS-installatører fakturerer typisk 500–800 kr. i timen ekskl. moms, ofte med mindstebeløb for serviceopgaver.',
		tips: [
			'Ved serviceopkald er det god skik at skrive ankomsttidsrummet på fakturaen.',
			'Materialelinjer skal specificeres — kunder spørger ofte til prisen på fittings og batterier.',
			'Husk at nævne eventuel garanti på arbejdet direkte på fakturaen.'
		]
	},
	{
		slug: 'murer',
		trade: 'murer',
		tradePlural: 'murere',
		description:
			'Gratis faktura skabelon til murere med typiske poster som murearbejde, materialer og stillads. Download Word/Excel/PDF eller fakturer online.',
		intro: [
			'Murerarbejde faktureres ofte efter m², efter time eller som fastpris på hele opgaven — og materialer udgør en stor del af regningen.',
			'Skabelonen her er bygget til at blande alle tre beregningstyper på samme faktura uden at miste overblikket.'
		],
		lineItems: [
			{ description: 'Opmuring af skalmur', quantity: '42', unit: 'm²', unitPrice: '725' },
			{
				description: 'Materiale: teglsten og mørtel',
				quantity: '1',
				unit: 'parti',
				unitPrice: '9.800'
			},
			{
				description: 'Stillads - opsætning og nedtagning',
				quantity: '1',
				unit: 'sæt',
				unitPrice: '1.450'
			}
		],
		rateNote:
			'Murere fakturerer typisk 400–600 kr. i timen eller fastpris pr. m² afhængigt af murværkstype, plus materialer og stillads.',
		tips: [
			'Stillads bør altid være en egen linje — det ellers skjulte beløb overrasker ofte kunden.',
			'Specificér stentype og antal på materiellinjen, så fakturaen matcher tilbuddet.',
			'Ved flere etaper (fx fundament og muring) kan du med fordel sende delfakturaer med løbende numre.'
		]
	},
	{
		slug: 'blikkenslager',
		trade: 'blikkenslager',
		tradePlural: 'blikkenslagere',
		description:
			'Gratis faktura skabelon til blikkenslagere med typiske poster som tagdækning, render og materialer. Download eller lav fakturaen online.',
		intro: [
			'Blikkenslagerarbejde handler ofte om tag, render og nedløbsrør — opgaver hvor både timer, materialer og stillads skal med på regningen.',
			'Skabelonen giver dig en faktura med plads til det hele, og med de lovpligtige felter allerede på plads.'
		],
		lineItems: [
			{
				description: 'Nydækning af tag - stålplader',
				quantity: '110',
				unit: 'm²',
				unitPrice: '245'
			},
			{ description: 'Montering af tagrender', quantity: '18', unit: 'm', unitPrice: '195' },
			{ description: 'Stillads og sikring', quantity: '1', unit: 'sæt', unitPrice: '2.100' }
		],
		rateNote:
			'Blikkenslagere fakturerer typisk 400–700 kr. i timen ekskl. moms eller pr. m² på dækningsopgaver, plus materialer.',
		tips: [
			'Angiv materialetype og tykkelse i beskrivelsen — det gør garanti-diskussioner enklere.',
			'Tagrender og nedløb bør specificeres i meter, så kunden kan eftertjekke omfanget.',
			'Husk stilladslinjen; den er ofte den post, kunder bliver mest overraskede over.'
		]
	},
	{
		slug: 'anlaegsgartner',
		trade: 'anlægsgartner',
		tradePlural: 'anlægsgartnere',
		description:
			'Gratis faktura skabelon til anlægsgartnere med typiske poster som anlægsarbejde, planter og materiel. Download eller fakturer online.',
		intro: [
			'Anlægsgartneropgaver bugner af småposter: jord, planter, belægning og maskintimer. Fakturaen skal kunne holde dem adskilt.',
			'Med skabelonen her får du struktureret regningen med alle lovpligtige felter — klar til at sende.'
		],
		lineItems: [
			{
				description: 'Anlæg af græsplæne - frø og jordforbedring',
				quantity: '150',
				unit: 'm²',
				unitPrice: '65'
			},
			{ description: 'Plantning af hækkeplanter', quantity: '40', unit: 'stk', unitPrice: '89' },
			{ description: 'Minigraver med fører', quantity: '4', unit: 'timer', unitPrice: '550' }
		],
		rateNote:
			'Anlægsgartnere fakturerer typisk 300–500 kr. i timen ekskl. moms; maskintimer og planter lægges til som separate poster.',
		tips: [
			'Planter og jord bør specificeres i antal/kubikmeter — ikke som én samlet poste.',
			'Maskintimer (minigraver, tromle) bør have egen linje med timeantal.',
			'Giv vækstgaranti en egen linje eller fodnote, hvis I har aftalt det.'
		]
	},
	{
		slug: 'rengoering',
		trade: 'rengøringsfirma',
		tradePlural: 'rengøringsfirmaer',
		description:
			'Gratis faktura skabelon til rengøringsfirmaer med typiske poster som løbende rengøring, grundrengøring og vinduespudsning. Download eller fakturer online.',
		intro: [
			'Rengøring faktureres oftest som abonnement med fast månedligt beløb — men grundrengøring og vinduespudsning lægges ved siden af som enkeltopgaver.',
			'Skabelonen er klar til begge situationer og sørger for, at momsen regnes rigtigt.'
		],
		lineItems: [
			{
				description: 'Løbende rengøring - 2 gange månedligt',
				quantity: '1',
				unit: 'md',
				unitPrice: '1.850'
			},
			{ description: 'Grundrengøring', quantity: '8', unit: 'timer', unitPrice: '325' },
			{ description: 'Vinduespudsning indvendig', quantity: '18', unit: 'vinduer', unitPrice: '55' }
		],
		rateNote:
			'Rengøring ligger typisk på 250–400 kr. i timen ekskl. moms; fastpriser pr. besøg er også udbredt.',
		tips: [
			'Ved abonnementer skal perioden (fx "januar 2026") fremgå af fakturabeskrivelsen.',
			'Adskil fastpris-besøg fra timeregnskab, så kunden kan se, hvad der er aftalt.',
			'Vinduespudsning bør faktureres pr. vindue eller pr. række — aftal hvad, og skriv det på fakturaen.'
		]
	},
	{
		slug: 'vinduespudser',
		trade: 'vinduespudser',
		tradePlural: 'vinduespudsere',
		description:
			'Gratis faktura skabelon til vinduespudsere med typiske poster som pudsning pr. vindue, rammer og karm. Download eller lav fakturaen online.',
		intro: [
			'Vinduespudsning er en klassisk pr. stk.-faktura: hver række og etage tælles, og rammer lægges til.',
			'Skabelonen er bygget til at specificere antal vinduer og tilvalg, så regningen er til at gennemskue for kunden.'
		],
		lineItems: [
			{
				description: 'Pudsning af vinduer - udvendig og indvendig',
				quantity: '24',
				unit: 'vinduer',
				unitPrice: '65'
			},
			{ description: 'Rensning af rammer og karme', quantity: '24', unit: 'stk', unitPrice: '20' },
			{ description: 'Pudsning af ovenlys', quantity: '2', unit: 'stk', unitPrice: '120' }
		],
		rateNote:
			'Vinduespudsning koster typisk 30–80 kr. pr. vindue ekskl. moms afhængigt af etage, sproger og indvendig/udvendig.',
		tips: [
			'Skriv tydeligt om prisen gælder indvendig, udvendig eller begge dele.',
			'Ovenlys og fransk altan bør have egen prislinje — de tager længere tid.',
			'Ved løbende aftaler (fx forår/efterår) fremgår intervallet bedst af beskrivelsen.'
		]
	},
	{
		slug: 'fotograf',
		trade: 'fotograf',
		tradePlural: 'fotografer',
		description:
			'Gratis faktura skabelon til fotografer med typiske poster som fotografering, retouch og licens. Download Word/Excel/PDF eller fakturer online.',
		intro: [
			'Fotografer sælger både tid (fotografering) og rettigheder (licens til billeder) — og fakturaen bør adskille de to, så kunden ved, hvad de køber.',
			'Skabelonen er sat op med de typiske fotografiposter og klarer moms og nummerering automatisk, når du bruger den online.'
		],
		lineItems: [
			{
				description: 'Bryllupsfotografering - 6 timer',
				quantity: '6',
				unit: 'timer',
				unitPrice: '1.250'
			},
			{
				description: 'Retouch og billedbehandling',
				quantity: '1',
				unit: 'sæt',
				unitPrice: '1.800'
			},
			{
				description: 'Licens til privat brug - 50 billeder',
				quantity: '1',
				unit: 'licens',
				unitPrice: '950'
			}
		],
		rateNote:
			'Fotografer fakturerer typisk 800–1.500 kr. i timen eller pakkepriser; kommerciel billedlicens lægges til separat.',
		tips: [
			'Beskriv licensens omfang (privat/kommerciel, varighed, medier) i fakturateksten.',
			'Læg retouch som egen linje — det er arbejde, kunden ellers glemmer, der indgår.',
			'Ved barneshows og bryllupper er depositum/alici-betaling almindeligt; skriv den som forudbetaling på slutregningen.'
		],
		momsNote:
			'Sælger du billedlicenser med ophavsretlig beskythed, kan momssatsen i visse tilfælde afvige — tjek reglerne for kultur-ydelser, før du fakturerer udenlandske kunder.'
	},
	{
		slug: 'grafisk-designer',
		trade: 'grafisk designer',
		tradePlural: 'grafiske designere',
		description:
			'Gratis faktura skabelon til grafiske designere med typiske poster som designarbejde, revideringer og printfiler. Download eller fakturer online.',
		intro: [
			'Designarbejde faktureres oftest i faser: koncept, udkast og færdige filer — og revisionsrunder skal gerne fremgå, så omfanget er aftalt.',
			'Skabelonen hjælper dig med at strukturere det, så kunden kan se, hvad hver post dækker.'
		],
		lineItems: [
			{
				description: 'Design af visuel identitet - konceptfase',
				quantity: '10',
				unit: 'timer',
				unitPrice: '695'
			},
			{
				description: 'Revideringer (2 runder inkl.)',
				quantity: '3',
				unit: 'timer',
				unitPrice: '695'
			},
			{
				description: 'Færdige filer til print og web',
				quantity: '1',
				unit: 'pakke',
				unitPrice: '750'
			}
		],
		rateNote:
			'Grafiske designere fakturerer typisk 500–900 kr. i timen ekskl. moms eller fastpris pr. projekt.',
		tips: [
			'Skriv antal inkluderede revisionsrunder direkte på fakturaen — det forhindrer misforståelser.',
			'Levering af filer (printklar/web) bør være en egen linje, ikke gratis usynligt arbejde.',
			'Ophavsret overdrages typisk først ved fuld betaling; det kan med fordel stå på fakturaen.'
		]
	},
	{
		slug: 'webdesigner',
		trade: 'webdesigner',
		tradePlural: 'webdesignere',
		description:
			'Gratis faktura skabelon til webdesignere og webudviklere med typiske poster som design, udvikling og drift. Download eller fakturer online.',
		intro: [
			'Webprojekter faktureres ofte i milepæle (design, build, launch) og afsluttes med løbende drift — skabelonen håndterer begge dele.',
			'Du får en professionel faktura med alle lovpligtige felter og automatisk moms, når du bruger generatoren.'
		],
		lineItems: [
			{
				description: 'Design og prototype - landingsside',
				quantity: '12',
				unit: 'timer',
				unitPrice: '750'
			},
			{
				description: 'Udvikling og implementering',
				quantity: '20',
				unit: 'timer',
				unitPrice: '750'
			},
			{
				description: 'Drift og vedligehold - 1. kvartal',
				quantity: '1',
				unit: 'kvartal',
				unitPrice: '2.400'
			}
		],
		rateNote:
			'Webdesignere og -udviklere i Danmark fakturerer typisk 600–1.100 kr. i timen ekskl. moms; fastpriser er udbredte på hele projekter.',
		tips: [
			'Fakturer i milepæle (50/50 eller 33/33/33) og skriv milepælen i beskrivelsen.',
			'Drift og hosting bør være en egen linje, så det står klart, hvad der er løbende.',
			'Ved salg til udlandet (B2B, EU) kan omvendt momsæftelse være aktuel — brug fakturanummer på din egen momsregistrering som dokumentation.'
		]
	},
	{
		slug: 'it-konsulent',
		trade: 'IT-konsulent',
		tradePlural: 'IT-konsulenter',
		description:
			'Gratis faktura skabelon til IT-konsulenter med typiske poster som rådgivning, implementering og support. Download eller lav fakturaen online.',
		intro: [
			'IT-konsulenter sælger timer til høje satser, og kunderne forventer en detaljeret specifikation af, hvad timerne gik til.',
			'Skabelonen giver dig strukturen — generatoren tilføjer CVR-opslag og moms automatisk.'
		],
		lineItems: [
			{
				description: 'Rådgivning - IT-infrastruktur',
				quantity: '8',
				unit: 'timer',
				unitPrice: '1.095'
			},
			{
				description: 'Implementering af backup-løsning',
				quantity: '14',
				unit: 'timer',
				unitPrice: '995'
			},
			{ description: 'Support og opfølgning', quantity: '2', unit: 'timer', unitPrice: '895' }
		],
		rateNote:
			'IT-konsulenter fakturerer typisk 800–1.400 kr. i timen ekskl. moms afhængigt af specialisering.',
		tips: [
			'Beskriv for hver blok, hvilke systemer og opgaver timerne dækkede.',
			'Ved fast retainer bør perioden og det inkluderede timeantal stå på fakturaen.',
			'Udenlandske B2B-kunder: undersøg omvendt momsæftelse, før du sender fakturaen.'
		]
	},
	{
		slug: 'bogholder',
		trade: 'bogholder',
		tradePlural: 'bogholdere',
		description:
			'Gratis faktura skabelon til bogholdere med typiske poster som løbende bogholderi, lønafregning og årsafslutning. Download eller fakturer online.',
		intro: [
			'Bogholderi sælges oftest som fast månedligt abonnement med tilvalg ved årsafslutning og særlige opgaver.',
			'Skabelonen er sat op til abonnementsfakturering med alle lovpligtige felter.'
		],
		lineItems: [
			{
				description: 'Løbende bogholderi - månedligt',
				quantity: '1',
				unit: 'md',
				unitPrice: '1.450'
			},
			{
				description: 'Lønafregning - op til 5 ansatte',
				quantity: '1',
				unit: 'md',
				unitPrice: '650'
			},
			{
				description: 'Årsafslutning og indberetninger',
				quantity: '1',
				unit: 'stk',
				unitPrice: '3.500'
			}
		],
		rateNote:
			'Bogholdere fakturerer typisk 1.000–3.000 kr. pr. måned ekskl. moms for løbende bogholderi afhængigt af transaktionsvolume.',
		tips: [
			'Skriv perioden (fx "1.–31. januar 2026") tydeligt i fakturabeskrivelsen.',
			'Årsafslutning bør faktureres særskilt fra det løbende abonnement.',
			'Prisen bør afspejle antal bilag — overvej at notere det aftalte interval på fakturaen.'
		]
	},
	{
		slug: 'psykolog',
		trade: 'psykolog',
		tradePlural: 'psykologer',
		description:
			'Gratis faktura skabelon til psykologer med typiske poster som samtaleforløb og test. Med momsfritagelsesregler for behandling. Download eller fakturer online.',
		intro: [
			'Privatpraktiserende psykologer fakturerer patienter for samtaler og test — og momsfritagelsen afhænger af, om behandlingen er omfattet af sundhedsloven.',
			'Skabelonen indeholder alle lovpligtige felter, og du kan vælge momsfri fakturering i generatoren.'
		],
		lineItems: [
			{
				description: 'Psykologsamtale (50 min.)',
				quantity: '4',
				unit: 'gange',
				unitPrice: '1.050'
			},
			{
				description: 'Psykologisk test og udredning',
				quantity: '3',
				unit: 'timer',
				unitPrice: '1.150'
			},
			{ description: 'Skriftlig rapport', quantity: '1', unit: 'stk', unitPrice: '1.800' }
		],
		rateNote:
			'Privatpraktiserende psykologer tager typisk 800–1.200 kr. pr. samtale; udredning og rapport kommer oveni.',
		tips: [
			'Lægevidnede forløb og sundhedslovsbehandling er som udgangspunkt momsfritagne — sæt moms til 0 kr. og skriv "momsfritaget".',
			'Faktura til patienter må ikke indeholde flere oplysninger om behandlingen end nødvendigt.',
			'Betalingsfrister på 8–14 dage er almindelige ved private betalere.'
		],
		momsNote:
			'Samtaler der er omfattet af sundhedslovens bestemmelser (fx med lægevidne) er momsfritagne. Erhvervsretlige samtaler og undervisning er som regel momspligtige.'
	},
	{
		slug: 'fysioterapeut',
		trade: 'fysioterapeut',
		tradePlural: 'fysioterapeuter',
		description:
			'Gratis faktura skabelon til fysioterapeuter med typiske poster som behandling, træning og test. Download eller lav fakturaen online.',
		intro: [
			'Fysioterapeuter i privat praksis fakturerer pr. behandling eller forløb — ofte til private kunder eller virksomheder.',
			'Skabelonen er klar til brug med momsfritagelse, hvor det gælder.'
		],
		lineItems: [
			{
				description: 'Fysioterapeutisk behandling (45 min.)',
				quantity: '6',
				unit: 'gange',
				unitPrice: '595'
			},
			{
				description: 'Træningsvejledning - individuel',
				quantity: '2',
				unit: 'timer',
				unitPrice: '650'
			},
			{ description: 'Funktionstest og rapport', quantity: '1', unit: 'stk', unitPrice: '850' }
		],
		rateNote:
			'Private fysioterapeuter tager typisk 450–700 kr. pr. behandling ekskl. eventuel moms.',
		tips: [
			'Sundhedslovsbehandling er momsfritaget — tjek reglerne, før du sætter momssatsen.',
			'Ved forsikringsopgaver (f.eks. efter trafikskader) skal skadeoplysninger stå i beskrivelsen, ikke diagnoser.',
			'Fakturaer til virksomheder (forebyggende træning) er som regel momspligtige.'
		],
		momsNote:
			'Behandling efter sundhedsloven er momsfritaget, mens forebyggende tilbud til virksomheder normalt er momspligtige ved 25%.'
	},
	{
		slug: 'massoer',
		trade: 'massør',
		tradePlural: 'massører',
		description:
			'Gratis faktura skabelon til massører med typiske poster som massage, triggerpunktbehandling og holdmassage. Download eller fakturer online.',
		intro: [
			'Massører fakturerer typisk pr. behandling (30, 45 eller 60 minutter) og sælger clipcards med rabat.',
			'Skabelonen kan både håndtere enkeltbehandlinger og forudbetalte klip.'
		],
		lineItems: [
			{ description: 'Massage 60 min. - helkrop', quantity: '1', unit: 'stk', unitPrice: '650' },
			{ description: 'Triggerpunktbehandling', quantity: '30', unit: 'min', unitPrice: '400' },
			{ description: 'Clipcard - 5 behandlinger', quantity: '1', unit: 'stk', unitPrice: '2.950' }
		],
		rateNote: 'Massage koster typisk 400–700 kr. i timen; clipcards sælges ofte med 10–15% rabat.',
		tips: [
			'Før op på clipcardet, hvor mange behandlinger kunden har brugt, og skriv saldoen på næste faktura.',
			'Massage er som udgangspunkt momspligtig — medmindre den er lægevidnet behandling efter sundhedsloven.',
			'Afbud regninger bør have egen linje med jeres afbudsregler i beskrivelsen.'
		]
	},
	{
		slug: 'frisoer',
		trade: 'frisør',
		tradePlural: 'frisører',
		description:
			'Gratis faktura skabelon til frisører og mobile frisører med typiske poster som klipning, farvning og produkter. Download eller lav fakturaen online.',
		intro: [
			'Frisøropgaver kombinerer arbejde og produktforkøb — og mobil frisørvirksomhed tilføjer kørsel til regningen.',
			'Skabelonen adskiller timer, behandlinger og produkter på hver sin linje.'
		],
		lineItems: [
			{ description: 'Klip og styling', quantity: '1', unit: 'stk', unitPrice: '425' },
			{ description: 'Farvning - hel farve', quantity: '1', unit: 'stk', unitPrice: '950' },
			{ description: 'Materiale: plejeprodukter', quantity: '1', unit: 'sæt', unitPrice: '285' }
		],
		rateNote:
			'Klipninger ligger typisk på 300–600 kr.; farvning og behandlinger fra 700 kr. og opefter ekskl. moms.',
		tips: [
			'Produktforkøb skal specificeres med produkt og mængde på fakturaen.',
			'Mobil frisør: skriv kørselsbeløbet som egen linje, hvis det ikke er i prisen.',
			'Husk at rabatter (fx studierabat) bør vises som en selvstændig rabatlinje.'
		]
	},
	{
		slug: 'kosmetolog',
		trade: 'kosmetolog',
		tradePlural: 'kosmetologer',
		description:
			'Gratis faktura skabelon til kosmetologer med typiske poster som ansigtsbehandling, hårfjerning og forløb. Download eller fakturer online.',
		intro: [
			'Kosmetologbehandlinger faktureres pr. gang eller som forløb med forudbetaling — og produktforkøb skal specificeres.',
			'Skabelonen er sat op med de typiske behandlingsposter.'
		],
		lineItems: [
			{
				description: 'Ansigtsbehandling - dybderens',
				quantity: '1',
				unit: 'stk',
				unitPrice: '695'
			},
			{
				description: 'Hårfjerning - laser, hele ben',
				quantity: '1',
				unit: 'behandling',
				unitPrice: '1.250'
			},
			{
				description: 'Forløb: 3 behandlinger (forudbetalt)',
				quantity: '1',
				unit: 'forløb',
				unitPrice: '1.850'
			}
		],
		rateNote:
			'Kosmetologbehandlinger koster typisk 400–800 kr. pr. gang; laserbehandlinger ofte 500–2.000 kr. afhængigt af område.',
		tips: [
			'Ved forudbetalte forløb skal resterende antal behandlinger fremgå af hver ny faktura/kvittering.',
			'Produktforkøb bør have egen linje med produkt og mængde.',
			'Skriv anbefalet interval mellem behandlinger i beskrivelsen — det dokumenterer forløbets omfang.'
		]
	},
	{
		slug: 'personlig-traener',
		trade: 'personlig træner',
		tradePlural: 'personlige trænere',
		description:
			'Gratis faktura skabelon til personlige trænere med typiske poster som træningssessioner, programmer og holdtræning. Download eller fakturer online.',
		intro: [
			"PT'ere sælger enkeltsessioner, forløb og programmer — ofte med forudbetaling og holdtræning ved siden af.",
			'Skabelonen holder styr på de forskellige typer opgaver på samme faktura.'
		],
		lineItems: [
			{
				description: 'Personlig træning - 60 min.',
				quantity: '8',
				unit: 'gange',
				unitPrice: '550'
			},
			{
				description: 'Træningsprogram - skræddersyet',
				quantity: '1',
				unit: 'stk',
				unitPrice: '750'
			},
			{ description: 'Holdtræning - morning bootcamp', quantity: '1', unit: 'md', unitPrice: '399' }
		],
		rateNote:
			'Personlige trænere tager typisk 400–700 kr. pr. session; holdtræning 300–500 kr. pr. måned.',
		tips: [
			'Ved forudbetalte forløb bør resterende sessioner fremgå af kvitteringen/fakturaen.',
			'Leje af lokaler eller fitness-center bør ikke ligge på kundefakturaen — det er din egen omkostning.',
			'Træningsprogrammer (PDF m.v.) er momspligtige som udgangspunkt — sørg for korrekt 25% moms.'
		]
	},
	{
		slug: 'dj',
		trade: 'DJ',
		tradePlural: "DJ'er",
		description:
			"Gratis faktura skabelon til DJ'er med typiske poster som spilletid, transport og teknik. Download Word/Excel/PDF eller lav fakturaen online.",
		intro: [
			'DJ-opgaver er ofte fastprisaftaler (gig) med transport, tekniker og overtid som tillæg.',
			'Skabelonen er bygget til gig-fakturering med tydelige tillægsposter.'
		],
		lineItems: [
			{ description: 'DJ-gig - bryllup, 5 timer', quantity: '1', unit: 'gig', unitPrice: '7.500' },
			{ description: 'Transport og opstilling', quantity: '1', unit: 'stk', unitPrice: '650' },
			{ description: 'Overtid - 1 time', quantity: '1', unit: 'time', unitPrice: '950' }
		],
		rateNote:
			'DJ-priser ligger typisk mellem 5.000 og 10.000 kr. for privatarrangementer ekskl. moms, afhængigt af varighed og udstyr.',
		tips: [
			'Skriv spilledato og spilletid (fx "22.00–03.00") i fakturabeskrivelsen.',
			'Transport bør have egen linje med km eller fast beløb.',
			'Afbudsregler bør fremgå af tilbuddet — ikke først på fakturaen.'
		]
	},
	{
		slug: 'catering',
		trade: 'cateringfirma',
		tradePlural: 'cateringfirmaer',
		description:
			'Gratis faktura skabelon til cateringfirmaer med typiske poster som menu pr. kuvert, service og levering. Download eller fakturer online.',
		intro: [
			'Cateringfakturaer er kuvert-baserede: antal gæster × pris pr. kuvert, plus service og levering.',
			'Skabelonen er bygget til den opstilling, så regningen bliver til at læse for både private og virksomheder.'
		],
		lineItems: [
			{ description: 'Middag - 3 retter', quantity: '45', unit: 'kuverter', unitPrice: '275' },
			{ description: 'Servicepersonale', quantity: '6', unit: 'timer', unitPrice: '325' },
			{ description: 'Levering og opstilling', quantity: '1', unit: 'stk', unitPrice: '850' }
		],
		rateNote:
			'Catering koster typisk 150–350 kr. pr. kuvert ekskl. moms afhængigt af antal retter og råvarer.',
		tips: [
			'Antal kuverter skal stå tydeligt — det er den hyppigste kilde til tvister.',
			'Servicepersonale bør faktureres i timer, ikke gemt i kuvertprisen.',
			'Ved store arrangementer er depositum almindeligt; vis det som forudbetaling på slutregningen.'
		]
	},
	{
		slug: 'oversaetter',
		trade: 'oversætter',
		tradePlural: 'oversættere',
		description:
			'Gratis faktura skabelon til oversættere med typiske poster som oversættelse pr. ord eller pr. time og korrektur. Download eller lav fakturaen online.',
		intro: [
			'Oversættere fakturerer pr. standardlinje, pr. ord eller pr. time — og rush-opgaver med tillæg.',
			'Skabelonen er klar til at specificere beregningsgrundlaget, så kunden ser, hvordan prisen er sat sammen.'
		],
		lineItems: [
			{
				description: 'Oversættelse DA→EN - hjemmeside',
				quantity: '4.500',
				unit: 'ord',
				unitPrice: '1,25'
			},
			{ description: 'Korrektur og harmonisering', quantity: '2', unit: 'timer', unitPrice: '595' },
			{ description: 'Rush-tillæg (48 t.)', quantity: '1', unit: 'opgave', unitPrice: '480' }
		],
		rateNote:
			'Oversættelse koster typisk 1–2 kr. pr. ord eller 400–700 kr. i timen ekskl. moms, afhængigt af sprogpar og fagområde.',
		tips: [
			'Skriv sprogparret og ordantallet i beskrivelsen — det dokumenterer beregningen.',
			'Rush-tillæg bør være en egen linje, så kunden ser, hvad hastework kostede.',
			'Minimumsgebyrer for små opgaver bør fremgå af fakturaen som en egen linje.'
		]
	},
	{
		slug: 'tekstforfatter',
		trade: 'tekstforfatter',
		tradePlural: 'tekstforfattere',
		description:
			'Gratis faktura skabelon til tekstforfattere og copywritere med typiske poster som tekstproduktion, research og redaktion. Download eller fakturer online.',
		intro: [
			'Copywriting faktureres pr. tekst, pr. time eller som pakke — og research skal med, hvis den ikke er i prisen.',
			'Skabelonen hjælper dig med at vise kunden prissammensætningen tydeligt.'
		],
		lineItems: [
			{ description: 'SEO-artikel - ca. 800 ord', quantity: '4', unit: 'stk', unitPrice: '2.400' },
			{ description: 'Research og interview', quantity: '3', unit: 'timer', unitPrice: '695' },
			{
				description: 'Redaktion - kundens eksisterende tekster',
				quantity: '2',
				unit: 'timer',
				unitPrice: '650'
			}
		],
		rateNote:
			'Tekstforfattere fakturerer typisk 500–900 kr. i timen ekskl. moms eller fastpris pr. artikel.',
		tips: [
			'Angiv omfang (antal ord) og målgruppe i fakturabeskrivelsen.',
			'Antal inkluderede revisionsrunder bør stå på fakturaen.',
			'Ved løbende content-aftaler: skriv perioden og det aftalte antal tekster.'
		]
	},
	{
		slug: 'videograf',
		trade: 'videograf',
		tradePlural: 'videografer',
		description:
			'Gratis faktura skabelon til videografer med typiske poster som optagelse, klip og farv. Download Word/Excel/PDF eller lav fakturaen online.',
		intro: [
			'Videoproduktion faktureres i faser — optagelse (halv-/heldag), klip og færdiggørelse — ofte med eksternt billedpersonale.',
			'Skabelonen er sat op til fase-fakturering med tydelige poster.'
		],
		lineItems: [
			{
				description: 'Optagelse - heldag, 2 kameraer',
				quantity: '1',
				unit: 'dag',
				unitPrice: '8.500'
			},
			{ description: 'Klip og efterproduktion', quantity: '12', unit: 'timer', unitPrice: '695' },
			{ description: 'Farv, lyd og grafik', quantity: '4', unit: 'timer', unitPrice: '750' }
		],
		rateNote:
			'Videografer fakturerer typisk 4.000–12.000 kr. for optagelsesdage ekskl. moms afhængigt af udstyr og besætning.',
		tips: [
			'Angiv antal kameraer og personel i optagelseslinjen.',
			'Klip/arbejdstimer efter dagens optagelse bør fremgå særskilt, så kunden ser arbejdsomfanget.',
			'Leveringsformater (aspect ratios) kan med fordel stå i beskrivelsen af leverancen.'
		]
	},
	{
		slug: 'cykelmekaniker',
		trade: 'cykelmekaniker',
		tradePlural: 'cykelmekanikere',
		description:
			'Gratis faktura skabelon til cykelmekanikere med typiske poster som service, reparation og reservedele. Download eller fakturer online.',
		intro: [
			'Cykelværksteder fakturerer faste servicepriser plus reservedele — og mobil cykelservice tilføjer kørsel.',
			'Skabelonen adskiller arbejde, dele og kørsel på hver sin linje.'
		],
		lineItems: [
			{
				description: 'Stor service - gear og bremser',
				quantity: '1',
				unit: 'stk',
				unitPrice: '749'
			},
			{
				description: 'Materiale: kæde, kabler og belæg',
				quantity: '1',
				unit: 'sæt',
				unitPrice: '385'
			},
			{
				description: 'Mobil service - opstilling hos kunde',
				quantity: '1',
				unit: 'stk',
				unitPrice: '250'
			}
		],
		rateNote:
			'Cykelservice koster typisk 500–900 kr. for stor service ekskl. moms og dele; reparationer faktureres ofte i kvarter.',
		tips: [
			'Reserverede dele skal specificeres mærke/model, så fakturaen matcher tilbud.',
			'Ved mobil service: skriv kørsel som egen linje med km-antal eller fast beløb.',
			'Garanti på arbejde (fx 3 måneder) kan med fordel stå på fakturaen.'
		]
	}
];

/** Lookup a branch by slug (returns undefined for unknown slugs). */
export function getBranch(slug: string): Branch | undefined {
	return BRANCHES.find((b) => b.slug === slug);
}

/** Slugs for sitemap generation, kept in declaration order. */
export const BRANCH_SLUGS: string[] = BRANCHES.map((b) => b.slug);
