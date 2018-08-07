TimeLineGL
==========

Applikasjonen viser tidslinjer (tiden løper fra venstre mot høyre) under hverandre. Hver tidslinje består av fargekodede bokser. Tidslinjene kan for eksempel visualisere et sett individers status (f.eks i jobb, sykemeldt, på tiltak, ...) gjennom flere år.

Applikasjonen bruker OpenGL som back end, og er i stand til å vise et meget stort antall tidslinjer samtidig på en maskin med moderne GPU.
Det er støtte for interaktiv zoom og pan i datagrunnlaget.

# Komme i gang

Bindinger er typescript. Ingen rammeverk. 
Bygg med tsc, og launch javascript i en moderne browser.

Det er en del logging som kan hentes opp i browserens console.

Applikasjonen søker datafiler i json-format. Data er tidsintervaller pr. ID markert med 'type' - som mappes til en farge.

Det er p.t. vanskelig å få dette opp uten hjelp, men i det minste mulig ved å se på kildekoden. Ta kontakt (se under) ved interesse, så skal vi forsøke å hjelpe.

---

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan rettes mot:

* anders.topper@nav.no

## For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #ai-lab
