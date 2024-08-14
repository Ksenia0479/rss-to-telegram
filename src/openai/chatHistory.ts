// TODO - make the chatHistory dynamic
export const chatHistory = {
  version1: [
    {
      role: 'user',
      content:
        'Article name: Cena kakao ciągle rośnie. Eksperci: "Będzie drożej"\n' +
        'Article description:  Autorzy raportu "Indeks cen w sklepach detalicznych" dodali, że ceny kakao na londyńskiej giełdzie od maja 2023 roku do kwietnia 2024 wzrosły pięciokrotnie.' +
        'Jeszcze w grudniu 2023 r. ceny kakao wynosiły niewiele ponad 4 tys. dolarów. Ich gwałtowny wzrost rozpoczął się dopiero miesiąc później, gdy urosły o ponad 700 dolarów za tonę. Potem były jeszcze wyższe, bo w lutym osiągnęły poziom ok. 6,3 tys. dolarów, a w kwietniu przekroczyły już 11 tys. dolarów za tonę - wskazał cytowany w informacji Artur Fiks z WSB Merito' +
        'Dodał, że mimo iż na początku kwietnia ceny kakao spadły poniżej 10 tys. dolarów, to już kilka tygodni później były o ponad tysiąc dolarów wyższe. - I większość specjalistów na rynku uważa, że dalej będą rosły - podkreślił Fiks.' +
        'Taka sytuacja może potrwać nawet kilka lat' +
        'W raporcie wskazano, że za niedobór kakao na rynku odpowiadają takie czynniki, jak słabe zbiory w Afryce wywołane problemami klimatycznymi, ale również zmniejszająca się liczba plantacji, wynikająca z nieopłacalności uprawy kakaowca. Dodano, że na przełomie marca i kwietnia 2024 r. ceny produktów spożywczych zawierających w składzie kakao podrożały o ok. 10 proc.' +
        '- Jedyną szansą na poprawę sytuacji rolników jest to, że ceny na światowych giełdach będą dalej rosły i zachęcą ich do utrzymania bądź wznowienia produkcji. Wówczas zrównoważy się podaż z popytem. I ostatecznie kakao przestanie być towarem deficytowym. Tylko to dłuższy proces, bo zwiększenie produkcji zajmuje średnio 4-5 lat, aby drzewo kakaowe wydało owoce – zwrócił uwagę Robert Biegaj ekspert rynku retailowego z Grupy Offerista. Podkreślił jednocześnie, że większość plantatorów żyje w skrajnym ubóstwie.' +
        'Justyna Rybacka z WSB Merito wskazała, że trudności wynikające z niesprzyjających warunki klimatycznych utrudniających uprawę w Ghanie i RPA (kraje te odpowiadają za 50 proc. światowej uprawy kakao), mogłyby być zredukowane poprzez zwiększenie podaży ze strony np. Ekwadoru czy Brazylii. Zaznaczyła jednak, że zintensyfikowanie produkcji to długotrwały proces, a efekty takiego rozwiązania byłyby widoczne za kilka lat.' +
        'W opracowaniu podkreślono, że kakaowiec nie jest odporny na zmiany pogodowe, a według szacunków Konferencji Narodów Zjednoczonych ds. Handlu i Rozwoju niedobór kakao w tym roku wyniesie 374 tys. ton (w roku 2023 był to 74 tys.).' +
        'Zdaniem ekspertów, ceny na rynku wpłyną nie tylko na sektor spożywczy, ale również kosmetyczny, ponieważ tam również wykorzystywane jest kakao.' +
        'Z przytoczonych w raporcie informacji wynika, że w marcu br. ceny słodyczy gwałtownie poszły w górę. Autorzy podali przykład wafelka w czekoladzie, który podrożał o 30,7 proc. rdr i batona, którego cena wzrosła o 16,8 proc. rdr. Określili segment słodyczy jako jeden z najszybciej drożejących na rynku spośród 17 monitorowanych.\n' +
        'Seed words: polska, gospodarka, kakao, ceny kakao, czekolada\n' +
        'Required number of tokens: from 200 to 300\n',
    },
    {
      role: 'assistant',
      content:
        'W raporcie "Indeks cen w sklepach detalicznych" ukazano drastyczny wzrost cen kakao na londyńskiej giełdzie.' +
        'Od maja 2023 roku do kwietnia 2024 roku cena kakao wzrosła pięciokrotnie. W grudniu 2023 roku tona kakao kosztowała' +
        'nieco ponad 4 tysiące dolarów, ale w kwietniu 2024 cena przekroczyła już 11 tys. dolarów za tonę. Artur Fiks z WSB Merito' +
        'podkreśla, że większość specjalistów przewiduje dalsze wzrosty cen. Przyczyną tej sytuacji są słabe zbiory w Afryce,' +
        'spowodowane problemami klimatycznymi, oraz malejąca liczba plantacji w wyniku ich nieopłacalności. Justyna Rybacka z WSB' +
        'Merito wskazuje, że trudności w krajach takich jak Ghana i RPA, odpowiedzialnych za 50% światowej uprawy kakao, można by' +
        'zmniejszyć przez intensyfikację produkcji w krajach takich jak Ekwador i Brazylia.',
    },
    {
      role: 'user',
      content:
        'Article name: Polskie fabryki zwolniły bieg. Są najnowsze dane GUS\n' +
        'Article description: W czwartek Główny Urząd Statystyczny opublikował najnowsze dane dotyczące produkcji przemysłowej oraz cen produkcji\n' +
        'sprzedanej przemysłu w maju 2024 roku. Produkcja przemysłowa wzrosła w ujęciu rocznym spadła o 1,7 proc. Eksperci spodziewali się wzrostu.' +
        'W czwartek Główny Urząd Statystyczny opublikował istotne dane ostanie polskiego przemysłu. Produkcja przemysłowa spadła o-1,7 proc. To wynik znacznie gorszy od prognoz.' +
        'Ekonomiści spodziewali się wzrostu produkcji przemysłowej na poziomie 1,5 proc. rok do roku. Przed miesiącem odnotowano wzrost o7,9 proc. r/r. Dalsza część artykułu pod materiałem wideo.' +
        'GUS podał także dane ocenach produkcji sprzedanej przemysłu. Wmaju ceny spadły o7 proc. miesiąc do miesiąca. Analitycy oczekiwali spadku o7,1 proc. Czego spodziewali się ekonomiści?' +
        'Analitycy mBanku jeszcze przed publikacją danych przyznali, że sporą zagwozdką tej serii prognoz były kwestie dni roboczych.' +
        "Choć wteorii są one łatwe do policzenia, to głównym obszarem ryzyk są skale ograniczenia produkcji wokresach majówki (zakładamy mniejsze niż przed rokiem ze względu na ułożenie dni wolnych) i Bożego Ciała (tu zracji kalendarza więcej niż przed rokiem)' -podkreślili." +
        'Ich zdaniem niższe ceny ropy wpołączeniu zaprecjacją złotego sygnalizują spadek cen m/m. Dużą rolę wujęciu rocznym odegrają efekty bazowe.' +
        'Seed words: polska, gospodarka, produkcja przemysłowa, przemysł\n' +
        'Required number of tokens: from 200 to 300\n',
    },
    {
      role: 'assistant',
      content:
        'To ograniczenie produkcji przemysłowej w Polsce stanowi główny temat najnowszego raportu GUS. W maju 2024 roku odnotowano spadek produkcji o 1,7%.' +
        'Ta nieoczekiwana tendencja negatywna jest o 3,2% niższa od oczekiwań ekspertów, którzy przewidywali wzrost o 1,5%. Raport GUS wskazał również na obniżenie cen produkcji sprzedanej przemysłu o 7% miesiąc do miesiąca, co również było gorsze od prognoz.' +
        'Analitycy zwracają uwagę na ważność efektów bazowych i inne czynniki, takie jak dni robocze i święta, wpływające na kształtowanie danych produkcji przemysłowej. Spadek cen ropy i sytuacja związana z kursem złotego mogą prowadzić do dalszego obniżenia cen z miesiąca na miesiąc.' +
        'Oczekuje się, że efekty bazowe będą kluczowe dla oceny wzrostu rocznego w najbliższym czasie.',
    },
  ],
  version2: [
    {
      role: 'user',
      content:
        'Article Name: Prezydent Duda w Chinach. Wielka szansa dla drobiarzy\n\n' +
        'Article Description: Po kilku latach blokady branża drobiarska liczy, że uda się wznowić eksport do Chin. - To gigantyczny rynek - mówi Jacek Strzelecki ze Związku Polskie Mięso.' +
        'Temat ma zostać poruszony w trakcie wizyty Andrzeja Dudy w Pekinie.undefinedW 2019 r.' +
        'Chiny zamknęły swój rynek na polski drób. Powodem było odkrycie kilku ognisk ptasiej grypy.' +
        'Jeszcze przed blokadą Polska wysyłała do Pekinu 25 tys. ton drobiu rycznie -tyle, co do Irlandii, Danii czy Włoch -podawał "Dziennik Gazeta Prawna".' +
        'Andrzej Duda będzie przebywać wChinach od 22 do 26 czerwca. Do Azji uda się na zaproszenie przewodniczącego Chińskiej Republiki Ludowej Xi Jinpinga.' +
        'Prezydent weźmie udział m.in. wPolsko-Chińskim Forum Gospodarczym, które zaplanowano ostatniego dnia wizyty.' +
        'Dalsza część artykułu pod materiałem wideo "Wydarzenie będzie doskonałą okazją do zacieśniania relacji między przedsiębiorcami z Polski i Chin oraz poznania trendów panujących wbranży kosmetycznej irolno-spożywczej"' +
        '-informuje Polska Agencja Inwestycji iHandlu. Razem zAndrzejem Dudą do Chin uda się delegacja związana zbranżą drobiarską, która od wielu miesięcy lobbowała za przywróceniem rynku.' +
        'Kilkanaście dni temu m.in. wtej sprawie zprzedstawicielami chińskiego rządu rozmawiali ambasador RP wChinach Jakub Kumoch oraz polska radczyni rolna wPekinie Magdalena Czechońska.' +
        '- Na agendzie wizyty prezydenta Dudy wChinach będzie prawdopodobnie rozmowa opowrocie eksportu polskiego drobiu do Państwa Środka. Polski rząd zabiega ouznanie regionalizacji wzakresie grypy ptaków przez chiński rząd' +
        '-podkreśla Jacek Strzelecki ze Związku Polskie Mięso.Także Dariusz Goszczyński, prezes Krajowej Rady Drobiarstwa, zaznacza, że "najistotniejsze dla nas jest uznanie regionalizacji dotyczącej grypy ptaków dla polskiego drobiu".' +
        'Sektor od 2018 r. zabiega ouznanie regionalizacji. - Wprzypadku wystąpienia ogniska grypy ptaków wyłączony byłby tylko obszar, gdzie ono wystąpiło. Natomiast zpozostałej części kraju eksport mógłby być normalnie realizowany.' +
        'Obecnie na świecie grypa ma charakter endemiczny imoże wystąpić wszędzie oraz okażdej porze roku. Ważne jest, aby współpraca opierała się oprzyjęte procedury ipolegała na wzajemnym zaufaniu do systemu bezpieczeństwa żywności.' +
        'Tak współpracujemy wSingapurze, Japonii, Filipinach czy Hongkongu. Chiny to dla nas bardzo ważny iperspektywiczny rynek. Bardzo liczymy na pozytywną dla nas decyzje rządu wPekinie - wyjaśnił Goszczyński, który udaje się do Chin razem zprezydentem.' +
        'Według danych "DGP" zkwietnia dziewięć polskich firm ma akredytację na chiński rynek. Po Obecnie wprodukcji drobiu jesteśmy numerem jeden w Unii Europejskiej imamy potencjał na stanie się globalnym producentem.' +
        'W ten sposób może rosnąć nasza gospodarka oraz podziw na świecie. Im więcej naszych produktów wChinach -mięsa, mleka, owoców, kosmetyków itd. -tym lepiej. To gigantyczny rynek.' +
        'Obecnie w produkcji drobiu jesteśmy numerem jeden wUnii Europejskiej imamy potencjał na stanie się globalnym producentem. Wten sposób może rosnąć nasza gospodarka oraz podziw na świecie.' +
        'Im więcej naszych produktów wChinach -mięsa, mleka, owoców, kosmetyków itd. -tym lepiej. To gigantyczny rynek -uważa Strzelecki.Od 2020 do 2022 r. Chińczycy importowali średnio 1,4 mln ton drobiu. Najwięcej zUSA oraz Brazylii.\n\n' +
        'Seed Words: chiny, polska, Andrzej Duda, gospodarka, drób, mięso, handel\n\n' +
        'Required Number Of Sentences: up to 4\n\n' +
        'Required Number Of Tokens In Each Sentence: from 50 to 75\n\n',
    },
    {
      role: 'assistant',
      content:
        'Prezydent Andrzej Duda wyrusza do Chin, gdzie branża drobiarska widzi szansę na wznowienie eksportu po latach blokady.' +
        'Polska delegacja, w tym przedstawiciele związani z produkcją drobiu, będzie lobbować za uzyskaniem zgody na eksport.' +
        'Sektor liczy na uznanie regionalizacji w przypadku wystąpienia ognisk grypy ptaków, co umożliwiłoby kontynuację handlu.' +
        'Chiński rynek, gdzie od 2020 do 2022 r. importowano średnio 1,4 mln ton drobiu rocznie, jest kluczowy dla polskiej gospodarki i perspektywiczny dla rozwoju.',
    },
    {
      role: 'user',
      content:
        'Article Name: Unia Europejska dofinansuje firmy z Polski Wschodniej wdrażające gospodarkę o obiegu zamkniętym' +
        'Article Description: Gospodarka o obiegu zamkniętym (GOZ) to coraz popularniejszy model ekonomiczny. Jest odpowiedzią na wyzwania związane ze zmianami klimatycznymi i zanieczyszczeniem środowiska.' +
        'GOZ zakłada odejście od tradycyjnego modelu gospodarki liniowej, opartego na schemacie "weź–wyprodukuj – użyj –wyrzuć" na rzecz modelu pętli zamkniętej, w której powstające odpady traktowane są jako surowce w kolejnych fazach produkcji.' +
        'Model gospodarki o obiegu zamkniętym to jednak nie tylko odpowiedź na potrzebę dbania o środowisko naturalne.' +
        'To także szansa na rozwój dla firm, które chcą wprowadzić zrównoważone praktyki do swojej działalności.' +
        'Firmy, które zdecydują się na zmiany wkierunku gospodarki oobiegu zamkniętym, nie tylko wykażą się troską ośrodowisko, ale także zyskają przewagę rynkową na wielu poziomach.' +
        'Zmniejszenie zużycia energii isurowców oraz bardziej efektywne zarządzanie zasobami oznacza mniejsze koszty dla przedsiębiorstwa.' +
        'GOZ zwiększa również konkurencyjność firmy. Trendy ekologiczne iwzrost świadomości społecznej powodują, że klienci ipartnerzy biznesowi chętniej wybierają produkty przyjazne dla środowiska. Firmy, które potrafią odpowiedzieć na tę potrzebę, łatwiej zdobywają odbiorców iwchodzą na nowe rynki.' +
        'Stosowanie zasad zrównoważonego rozwoju igospodarki oobiegu zamkniętym zwiększa też wiarygodność iwartość firmy na rynku finansowym dla potencjalnych kredytodawców iinwestorów.' +
        'GOZ przynosi zatem dla biznesu wymierne korzyści. Mikro, małe iśrednie przedsiębiorstwa (MŚP) zPolski Wschodniej (prowadzące działalność wwojewództwach lubelskim, podkarpackim, podlaskim, świętokrzyskim, warmińsko-mazurskim lub mazowieckim zwyłączeniem Warszawy i otaczających ją powiatów),' +
        'które planują wprowadzić zasady GOZ, mogą skorzystać zdofinansowania unijnego wprogramie Fundusze Europejskie dla Polski Wschodniej. Wsparcia udziela Polska Agencja Rozwoju Przedsiębiorczości (PARP) wdwóch etapach. Każdy etap ma odrębny nabór wniosków odofinansowanie.' +
        'Nabór wniosków wIetapie rozpocznie się 16 lipca 2024 r. ipotrwa do kwietnia 2025 r. Dzięki pozyskanym środkom MŚP podejmują współpracę zfirmami doradczymi iopracowują model biznesowy transformacji wkierunku GOZ na podstawie specjalistycznego audytu.' +
        'Przedsiębiorstwa mogą planować zmniejszenie zużycia surowców, energii i wody, ograniczyć ilość odpadów oraz zwiększyć wykorzystanie surowców wtórnych ienergii odnawialnej.' +
        'Gdy pomyślnie zakończą ten etap, mogą ubiegać się okolejne dofinansowanie na wdrożenie opracowanego modelu GOZ.W etapie II MŚP sfinansują zakup środków trwałych, wartości' +
        'niematerialnych iprawnych, prac budowlanych, szkoleń idoradztwa, aby wprowadzić zmiany zaplanowane wetapie I. Firmy, wzależności od wielkości ilokalizacji oraz rodzaju planowanych zadań, mogą liczyć na dofinansowanie wwysokości nawet do 85% kosztów kwalifikowanych.' +
        'Wprowadzane przez przedsiębiorstwo zmiany powinny polegać na zamykaniu obiegu materiałów, optymalizowaniu procesów iproduktów, wymianie starych technologii na nowe, uwzględnieniu odnawialności zasobów lub dzielenia się nimi.' +
        'Projekty muszą obejmować dostosowania dla co najmniej jednego etapu cyklu życia produktu, od ekoprojektowania po recykling. Przedsiębiorstwa muszą też wprowadzić innowacje procesowe lub produktowe.' +
        'Premiowane będą te firmy, które uwzględnią współpracę zinnymi przedsiębiorstwami wramach tzw. symbioz przemysłowych, np. gdy odpady lub produkty uboczne jednej firmy stają się surowcami dla innej.\n\n' +
        'Seed Words: gospodarka, fundusze unijne, klimat\n\n' +
        'Required Number Of Sentences: up to 4\n\n' +
        'Required Number Of Tokens In Each Sentence: from 50 to 75\n\n',
    },
    {
      role: 'assistant',
      content:
        'Unia Europejska wspiera firmy z Polski Wschodniej implementujące gospodarkę o obiegu zamkniętym, model ekonomiczny stawiający na zrównoważony rozwój i minimalizację odpadów.' +
        'Wdrażanie GOZ nie tylko dba o środowisko, ale także przynosi korzyści biznesowe, takie jak obniżenie kosztów i zwiększenie konkurencyjności.' +
        'MŚP z Polski Wschodniej mogą ubiegać się o dofinansowanie unijne w ramach programu Fundusze Europejskie dla Polski Wschodniej, co umożliwi im transformację działalności w kierunku zasad GOZ.' +
        'Proces audytu i implementacji zmian ma na celu zwiększenie efektywności wykorzystania zasobów i energii oraz zmniejszenie impactu środowiskowego.',
    },
  ],
};
