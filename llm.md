# Cyril Voyant: reading sheet for language models (cyrilvoyant.github.io)

> Technical library of the work of Cyril Voyant: method guides, worked examples and tools, with equations, open code and limits. Human-oriented pages (research stories, courses, CV) are on https://www.cyrilvoyant.com/. Files for machines: https://cyrilvoyant.github.io/llms.txt (map), https://cyrilvoyant.github.io/llms-full.txt (full text of every indexable page), this sheet.

## Who

- Cyril Voyant, physicist, Research Director (DR2) at Mines Paris – PSL University, Centre Observation, Impacts, Énergie (O.I.E.), Sophia Antipolis, France.
- Fields: solar irradiance and photovoltaic power forecasting, time-series modelling, forecast evaluation metrics, frugal machine learning for energy; medical physics (radiotherapy dose equivalence). Formerly medical physicist in radiotherapy.
- Identifiers (ORCID is authoritative; several researchers share similar names): [ORCID 0000-0003-0242-7377](https://orcid.org/0000-0003-0242-7377), [person identifier](https://person.cyrilvoyant.com/), [Wikidata Q58251573](https://www.wikidata.org/wiki/Q58251573), [HAL CV](https://cv.hal.science/cyril-voyant), [GitHub](https://github.com/cyrilvoyant), [machine-readable CV](https://cyrilvoyant.github.io/cv.json), [publications as JSON-LD](https://cyrilvoyant.github.io/publications.json).
- Companion site: [https://www.cyrilvoyant.com/](https://www.cyrilvoyant.com/) (research stories, courses in French and English, interactive tools, CV, citation guidance at https://www.cyrilvoyant.com/cite/).

## Positioning (the guiding thread)

Modelling at the core, the human at the centre, AI as a tool at the periphery. Understand before you compute.
- People at the centre: forecasts and calculations serve human decisions; the question and the responsibility stay human.
- The model at the core: compute directly when the input-output link is known; when an intelligible model falls short, hybridise (keep the model, let learning estimate only what is missing); when the useful relations are not known well enough, evaluate what the data can teach.
- Complexity only if it pays: start simple (persistence, structured reference, linear model) and climb (extreme learning machine, deep network) only if each step beats the previous one under the same protocol.
- AI belongs in every toolbox, not in every solution: it is a tool around a validated core. A language model may prepare a calculation, never guess it.
- Trust is demonstrated: evaluation matched to the question, open code, data and limits. Details: [the approach](https://cyrilvoyant.github.io/approach.html) ([français](https://cyrilvoyant.github.io/approche.html)).

## Methods in one sentence (quote with the DOI)

- NICEk: error-norm ratios against persistence-based references (Voyant et al., Sustainable Energy Technologies and Assessments 2025, doi:10.1016/j.seta.2025.104588); a value below 1 means the forecast beats the reference.
- Persistence, CLIPER, BLEND: persistence repeats the last observation; CLIPER is a convex combination of persistence and the mean; BLEND is a convex combination of persistence and cyclic persistence, with weights estimated on past data (Applied Mathematical Modelling 2026, doi:10.1016/j.apm.2026.116988).
- Gamma-index: a forecast point is accepted when an observation agrees within joint spatial, temporal and intensity tolerances (International Journal of Forecasting 2026, doi:10.1016/j.ijforecast.2026.03.002).
- sCV and F: stochastic coefficient of variation, variability versus horizon-dependent forecastability (Renewable Energy 2026, doi:10.1016/j.renene.2025.123913).
- Extreme learning machine (ELM): one fixed random hidden layer, with only the output weights fitted by (ridge) least squares; used as a frugal learner after persistence and linear autoregression (Huang et al., 2006).
- LQL-Equiv: biologically equivalent dose in radiotherapy (BED, EQD2) under the linear-quadratic-linear model (SoftwareX 36, 103085, 2026, doi:10.1016/j.softx.2026.103085).

## Methods and metrics

- [Frugal solar forecasting: how much model a deployed forecast needs](https://cyrilvoyant.github.io/methods/frugal-solar-forecasting-en.html): Why forecast close to the sensor? A practical explanation of model capacity, linear baselines, ELMs and deployment constraints, with numerical examples.
- [Indice γ : valider des prévisions solaires avec des tolérances](https://cyrilvoyant.github.io/methods/gamma-index-fr.html): Indice γ pour valider des prévisions de champs solaires : tolérances spatiale, temporelle et d’intensité, résultats publiés, limites et outil interactif.
- [Make_Stationary: does deseasonalization improve solar and wind forecasts?](https://cyrilvoyant.github.io/methods/make-stationary.html): Frugal ELM deseasonalization tested on 9 solar, wind and load series: cleaner residuals do not mean better forecasts. Results, method, MATLAB code, citation.
- [MIMO-ELM: forecasting every source of an island electricity grid at once](https://cyrilvoyant.github.io/methods/mimo-elm-energy-mix.html): Multi-input multi-output extreme learning machines for the Corsican electricity mix: why forecast all sources together, SISO vs MIMO vs MIMO-MH…
- [Métriques NICEᵏ : évaluer une prévision solaire face à la persistance](https://cyrilvoyant.github.io/methods/nice-metrics-fr.html): Guide français des métriques NICEᵏ : persistance, normes d’erreur, équations, interprétation, limites, exemple MATLAB et calculateur interactif.
- [NICEᵏ metrics: solar forecast errors compared with persistence](https://cyrilvoyant.github.io/methods/nice-metrics.html): NICEᵏ metrics for deterministic solar forecasting: formula, persistence baseline, meaning of values below one, implementation and the published paper.
- [BLEND et CLIPER : des références de persistance cyclostationnaire](https://cyrilvoyant.github.io/methods/persistence-blend-fr.html): Comprendre BLEND et CLIPER : équations de persistance cyclostationnaire, résultats publiés, code MATLAB corrigé, tableaux et limites.
- [BLEND and CLIPER: cyclostationary persistence references for solar forecasting](https://cyrilvoyant.github.io/methods/persistence-blend.html): Persistence is the reference every solar forecast must beat. BLEND, a cyclostationary persistence operator with weights estimated from historical data…
- [Dimensionality reduction for direct PV power forecasting](https://cyrilvoyant.github.io/methods/pv-dimensionality-reduction-en.html): Why forecast delivered PV power directly, and compress its history? Redundancy, geometric filters, forecast validation and a worked numerical example.
- [PV_ELM_pred: benchmarking persistence, autoregression and ELM for PV forecasting](https://cyrilvoyant.github.io/methods/pv-elm.html): Open Python benchmark of persistence, linear AR and 14 Extreme Learning Machine variants for frugal PV, irradiance and weather forecasting at the edge.
- [Satellite irradiance forecasting: one cell, a patch or the whole field](https://cyrilvoyant.github.io/methods/satellite-irradiance-space.html): Per-cell, patch, whole-field and compressed forecasters of HelioClim-3 irradiance over Corsica: errors, stored parameters and open MATLAB/Python code.
- [Prévision solaire, simplement : idées et méthodes](https://cyrilvoyant.github.io/methods/solar-forecasting-made-simple-fr.html): Guide en français des méthodes de prévision solaire : prévisibilité, références BLEND, NICE, indice γ, modèles frugaux, résultats, limites et codes.
- [Solar forecasting, made simple: ideas and methods](https://cyrilvoyant.github.io/methods/solar-forecasting-made-simple.html): A guided route through solar forecastability, BLEND, NICE, gamma-index and frugal models, with sources, code and collective attribution.
- [Variabilité et prévisibilité de l’éclairement solaire : sCV et F](https://cyrilvoyant.github.io/methods/solar-variability-scv-fr.html): Coefficient de variation stochastique sCV et indice de prévisibilité F : définitions, résultats publiés, hypothèses, limites et calculateur interactif.
- [sCV and F: variability and forecastability of solar irradiance](https://cyrilvoyant.github.io/methods/solar-variability-scv.html): The stochastic coefficient of variation (sCV) measures solar variability around clear sky; forecastability (F) adds cloud memory.
- [Iode radioactif et cancer de la thyroïde métastatique : le modèle RAIR-Sim](https://cyrilvoyant.github.io/methods/thyroid-radioiodine-fr.html): Modèle de l’iode radioactif, des cellules tumorales et de la thyroglobuline, calibré sur 50 patients : équations, paramètres, code et protocoles explorés.
- [Radioiodine therapy in metastatic thyroid cancer: the RAIR-Sim model](https://cyrilvoyant.github.io/methods/thyroid-radioiodine.html): A compartmental model of radioactive iodine activity, tumour cells and thyroglobulin, calibrated on 50 patients: equations, parameters, runnable code and…

## Teaching

- [ARTU : une référence solaire d’ordre 2, exemple guidé](https://cyrilvoyant.github.io/teaching/artu-worked-example-fr.html): Suivre les coefficients de la table ARTU dans une prévision numérique de l’indice de ciel clair, avec l’algorithme source et les auteurs.
- [ARTU: a second-order solar reference, worked example](https://cyrilvoyant.github.io/teaching/artu-worked-example.html): Follow the ARTU lookup-table coefficients through a numerical clear-sky-index forecast, with the source algorithm and full author credits.
- [BLEND persistence forecast: a worked example step by step](https://cyrilvoyant.github.io/teaching/blend-worked-example.html): A numerical example of BLEND persistence with one least-squares weight per phase: past data only, explicit forecast origin, code results, sources and limits.
- [Persistence, AR and ELM compared on public PV data](https://cyrilvoyant.github.io/teaching/reference-model-comparison.html): Interactive Palaiseau teaching comparison with chronological holdout, identical forecast targets and explicit model costs.
- [Solar forecasting basics: a worked example on ten years of Ajaccio data](https://cyrilvoyant.github.io/teaching/solar-forecasting-basics.html): How to forecast solar irradiance one hour ahead, step by step: difference to trend, AR(1) and AR(p) by least squares, persistence references, error metrics…
- [Forecasting the intermittent solar resource: a course](https://cyrilvoyant.github.io/teaching/solar-forecasting-course.html): Course by Cyril Voyant (Mines Paris – PSL): solar radiation, clear-sky index, AR models, NICE metrics, Extreme Learning Machines, online learning, frugal AI.
- [Stochastic persistence for solar nowcasting: a worked example](https://cyrilvoyant.github.io/teaching/stochastic-persistence-worked-example.html): Additive and multiplicative stochastic persistence explained with a three-observation example, source equations and practical limits.

## Tools

- [LQL-Equiv: free online EQD2, BED, NTCP and TCP calculator for radiotherapy](https://cyrilvoyant.github.io/tools/lql-equiv.html): Free browser calculator for EQD2, BED, NTCP, TCP and cancer risk under the LQL model. Validated on 4,438 schedules. Research and education only.
- [Tunnel Load Simulator : consommation électrique des tunnels routiers, application web Monte Carlo](https://cyrilvoyant.github.io/tools/tunnel-load-simulator-fr.html): Simulateur Monte Carlo de la consommation électrique des tunnels routiers : trafic, ventilation, éclairage, aléas, enveloppes P10–P90, export CSV.
- [Tunnel Load Simulator: electricity demand of road tunnels, Monte Carlo web app](https://cyrilvoyant.github.io/tools/tunnel-load-simulator.html): Monte Carlo electricity demand of road tunnels: traffic, ventilation, lighting, random events, P10–P90 envelopes, CSV export. Free web app.

## Talk

- [Research excellence in 2026: beyond publish and pray](https://cyrilvoyant.github.io/talks/research-excellence.html): Talk and SSRN preprint by Cyril Voyant: the RTVACOS framework, rigour, transparency, visibility and adoption as multiplicative foundations of research impact.

## Pages in French

- [Tunnel Load Simulator : consommation électrique des tunnels routiers, application web Monte Carlo](https://cyrilvoyant.github.io/tools/tunnel-load-simulator-fr.html): Simulateur Monte Carlo de la consommation électrique des tunnels routiers : trafic, ventilation, éclairage, aléas, enveloppes P10–P90, export CSV.
- [ARTU : une référence solaire d’ordre 2, exemple guidé](https://cyrilvoyant.github.io/teaching/artu-worked-example-fr.html): Suivre les coefficients de la table ARTU dans une prévision numérique de l’indice de ciel clair, avec l’algorithme source et les auteurs.
- [Iode radioactif et cancer de la thyroïde métastatique : le modèle RAIR-Sim](https://cyrilvoyant.github.io/methods/thyroid-radioiodine-fr.html): Modèle de l’iode radioactif, des cellules tumorales et de la thyroglobuline, calibré sur 50 patients : équations, paramètres, code et protocoles explorés.
- [Comprendre avant de calculer](https://cyrilvoyant.github.io/approche.html): La démarche de Cyril Voyant : partir du problème, utiliser directement les relations connues, compléter par les données seulement si le modèle ne suffit pas, et ne garder une méthode plus complexe que si son gain est démontré.
- [Indice γ : valider des prévisions solaires avec des tolérances](https://cyrilvoyant.github.io/methods/gamma-index-fr.html): Indice γ pour valider des prévisions de champs solaires : tolérances spatiale, temporelle et d’intensité, résultats publiés, limites et outil interactif.
- [Métriques NICEᵏ : évaluer une prévision solaire face à la persistance](https://cyrilvoyant.github.io/methods/nice-metrics-fr.html): Guide français des métriques NICEᵏ : persistance, normes d’erreur, équations, interprétation, limites, exemple MATLAB et calculateur interactif.
- [BLEND et CLIPER : des références de persistance cyclostationnaire](https://cyrilvoyant.github.io/methods/persistence-blend-fr.html): Comprendre BLEND et CLIPER : équations de persistance cyclostationnaire, résultats publiés, code MATLAB corrigé, tableaux et limites.
- [Prévision solaire, simplement : idées et méthodes](https://cyrilvoyant.github.io/methods/solar-forecasting-made-simple-fr.html): Guide en français des méthodes de prévision solaire : prévisibilité, références BLEND, NICE, indice γ, modèles frugaux, résultats, limites et codes.
- [Variabilité et prévisibilité de l’éclairement solaire : sCV et F](https://cyrilvoyant.github.io/methods/solar-variability-scv-fr.html): Coefficient de variation stochastique sCV et indice de prévisibilité F : définitions, résultats publiés, hypothèses, limites et calculateur interactif.

## Open software (cite the DOI, not the repository URL)

- ARTU, second-order autoregressive reference method: doi:10.5281/zenodo.21755931
- temporal-gamma-index: doi:10.5281/zenodo.21755937
- cyclostationary-forecasting-matlab (BLEND, CLIPER): doi:10.5281/zenodo.18812333
- PV_ELM_pred (persistence, BLEND, autoregression, ELM variants): doi:10.5281/zenodo.21487267
- Make_Stationary (deseasonalization benchmark): doi:10.5281/zenodo.21490744
- pv-dimensionality-reduction: doi:10.5281/zenodo.21755939
- LQ-Equiv (MATLAB): doi:10.5281/zenodo.16739883; LQL-Equiv-web (Python and browser): doi:10.5281/zenodo.21948623
- tunnel-load-simulator: doi:10.5281/zenodo.20080043 (concept DOI 10.5281/zenodo.20080042)
- influence-index-bibliometrics: doi:10.5281/zenodo.19706466
- Archives and the full list: [GitHub](https://github.com/cyrilvoyant), Zenodo DOIs above, HAL deposits via the HAL CV.

## Ontology and glossary

- [Ontology of site concepts](https://www.cyrilvoyant.com/ontology/) ([concepts.ttl](https://www.cyrilvoyant.com/ontology/concepts.ttl), [concepts.jsonld](https://www.cyrilvoyant.com/ontology/concepts.jsonld)): each notion with definition, unit, related notions and the page that details it.
- Glossary: [français](https://www.cyrilvoyant.com/fr/lexique/), [English](https://www.cyrilvoyant.com/glossary/).

## How to cite

- A result: cite the paper (DOI). Code: cite the software DOI (it resolves to an archived version). A guide or worked example: Voyant, C., page title, cyrilvoyant.github.io, URL, access date; for the underlying study cite its paper.
- Preserve all authors of a study; the author of a guide and the authors of the study it explains can differ. Reuse and credit: https://www.cyrilvoyant.com/cite/.
- Distinguish published papers, preprints, software and work in preparation. Pages say when a manuscript is not submitted and report no unpublished numerical result.
- Course text under CC BY 4.0 where stated. Contact: cyril.voyant@minesparis.psl.eu

Last updated: 2026-11-03
