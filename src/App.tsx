import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Haslo = {
  numer: number
  odpowiedz: string
  pytanie: string
  kierunek: 'poziomo' | 'pionowo'
  wiersz: number
  kolumna: number
}

const hasla: Haslo[] = [
  { numer: 1, odpowiedz: 'FUNKCJA', pytanie: 'Wydzielony, wywoływalny fragment kodu', kierunek: 'poziomo', wiersz: 0, kolumna: 3 },
  { numer: 2, odpowiedz: 'KOMPILATOR', pytanie: 'Program tłumaczący kod źródłowy na kod maszynowy', kierunek: 'pionowo', wiersz: 0, kolumna: 6 },
  { numer: 3, odpowiedz: 'REACT', pytanie: 'Biblioteka do budowania interfejsów od Mety', kierunek: 'pionowo', wiersz: 1, kolumna: 10 },
  { numer: 4, odpowiedz: 'SERWER', pytanie: 'Komputer udostępniający usługi w sieci', kierunek: 'pionowo', wiersz: 2, kolumna: 3 },
  { numer: 5, odpowiedz: 'PETLA', pytanie: 'Instrukcja powtarzająca fragment kodu', kierunek: 'poziomo', wiersz: 3, kolumna: 6 },
  { numer: 6, odpowiedz: 'GIT', pytanie: 'System kontroli wersji', kierunek: 'poziomo', wiersz: 5, kolumna: 8 },
  { numer: 7, odpowiedz: 'BLAD', pytanie: 'Polska nazwa buga', kierunek: 'pionowo', wiersz: 5, kolumna: 12 },
  { numer: 8, odpowiedz: 'ZMIENNA', pytanie: 'Nazwane miejsce w pamięci na dane', kierunek: 'poziomo', wiersz: 6, kolumna: 0 },
  { numer: 9, odpowiedz: 'TABLICA', pytanie: 'Uporządkowana kolekcja elementów', kierunek: 'poziomo', wiersz: 7, kolumna: 6 },
  { numer: 10, odpowiedz: 'JAVASCRIPT', pytanie: 'Język skryptowy działający w przeglądarce', kierunek: 'poziomo', wiersz: 9, kolumna: 0 },
]

const liczbaWierszy = 10
const liczbaKolumn = 13
const kluczZapisu = 'krzyzowka-programowanie-v2'
type Litery = Record<string, string>

function pozycja(wiersz: number, kolumna: number) {
  return `${wiersz}-${kolumna}`
}

function komorkiHasla(haslo: Haslo) {
  return Array.from({ length: haslo.odpowiedz.length }, (_, i) => ({
    wiersz: haslo.wiersz + (haslo.kierunek === 'pionowo' ? i : 0),
    kolumna: haslo.kolumna + (haslo.kierunek === 'poziomo' ? i : 0),
  }))
}

function pobierzZapis(): Litery {
  try {
    return JSON.parse(localStorage.getItem(kluczZapisu) || '{}') as Litery
  } catch {
    return {}
  }
}

function App() {
  const [litery, ustawLitery] = useState<Litery>(pobierzZapis)
  const [aktywneHaslo, ustawAktywneHaslo] = useState(4)
  const [sprawdzono, ustawSprawdzono] = useState(false)

  const aktywne = hasla.find((haslo) => haslo.numer === aktywneHaslo) || hasla[0]

  useEffect(() => {
    localStorage.setItem(kluczZapisu, JSON.stringify(litery))
  }, [litery])

  const planszaRozwiazania = useMemo(() => {
    const pola: Record<string, string> = {}
    hasla.forEach((haslo) => komorkiHasla(haslo).forEach(({ wiersz, kolumna }, i) => {
      pola[pozycja(wiersz, kolumna)] = haslo.odpowiedz[i]
    }))
    return pola
  }, [])

  const zajete = useMemo(() => {
    const pola: Record<string, number[]> = {}
    hasla.forEach((haslo) => komorkiHasla(haslo).forEach(({ wiersz, kolumna }) => {
      const klucz = pozycja(wiersz, kolumna)
      pola[klucz] = [...(pola[klucz] || []), haslo.numer]
    }))
    return pola
  }, [])

  const wynik = Object.keys(planszaRozwiazania).filter((klucz) => litery[klucz] === planszaRozwiazania[klucz]).length
  const maxPunktow = Object.keys(planszaRozwiazania).length

  function wpisz(wiersz: number, kolumna: number, wartosc: string) {
    const klucz = pozycja(wiersz, kolumna)
    const litera = wartosc.toUpperCase().replace(/[^A-Z]/g, '').slice(-1)
    ustawLitery((poprzednie) => {
      const nowe = { ...poprzednie }
      if (litera) nowe[klucz] = litera
      else delete nowe[klucz]
      return nowe
    })
    ustawSprawdzono(false)
    if (litera) {
      const pola = komorkiHasla(aktywne)
      const indeks = pola.findIndex((pole) => pole.wiersz === wiersz && pole.kolumna === kolumna)
      const nastepne = pola[indeks + 1]
      if (nastepne) document.getElementById(pozycja(nastepne.wiersz, nastepne.kolumna))?.focus()
    }
  }

  function wybierzPole(wiersz: number, kolumna: number) {
    const pasujace = zajete[pozycja(wiersz, kolumna)] || []
    if (pasujace.length) ustawAktywneHaslo(pasujace.find((numer) => numer === aktywneHaslo) || pasujace[0])
  }

  function wyczysc() {
    ustawLitery({})
    ustawAktywneHaslo(4)
    ustawSprawdzono(false)
  }

  function pokazRozwiazanie() {
    ustawLitery(planszaRozwiazania)
    ustawSprawdzono(false)
  }

  return (
    <main className="strona">
      <h1>Krzyżówka</h1>
      <section className="gra">
        <div className="plansza">
          <div className="siatka">
            {Array.from({ length: liczbaWierszy * liczbaKolumn }, (_, index) => {
              const wiersz = Math.floor(index / liczbaKolumn)
              const kolumna = index % liczbaKolumn
              const klucz = pozycja(wiersz, kolumna)
              const numery = zajete[klucz] || []
              const zaznaczone = komorkiHasla(aktywne).some((pole) => pole.wiersz === wiersz && pole.kolumna === kolumna)
              const numerPoczatku = hasla.find((haslo) => haslo.wiersz === wiersz && haslo.kolumna === kolumna)?.numer
              const klasaWyniku = sprawdzono && litery[klucz]
                ? litery[klucz] === planszaRozwiazania[klucz] ? ' poprawna' : ' bledna'
                : ''

              return <div key={klucz} className={`kratka ${numery.length ? 'czynna' : 'pusta'} ${zaznaczone ? 'zaznaczona' : ''}${klasaWyniku}`}>
                {numery.length > 0 && <>
                  {numerPoczatku && <span className="numer">{numerPoczatku}</span>}
                  <input
                    id={klucz}
                    value={litery[klucz] || ''}
                    onFocus={() => wybierzPole(wiersz, kolumna)}
                    onClick={() => wybierzPole(wiersz, kolumna)}
                    onChange={(event) => wpisz(wiersz, kolumna, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace' && !litery[klucz]) {
                        const pola = komorkiHasla(aktywne)
                        const indeks = pola.findIndex((pole) => pole.wiersz === wiersz && pole.kolumna === kolumna)
                        const poprzednie = pola[indeks - 1]
                        if (poprzednie) document.getElementById(pozycja(poprzednie.wiersz, poprzednie.kolumna))?.focus()
                      }
                    }}
                    maxLength={1}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </>}
              </div>
            })}
          </div>
          <div className="sterowanie">
            <button onClick={() => ustawSprawdzono(true)}>Sprawdź</button>
            <button onClick={pokazRozwiazanie}>Pokaż rozwiązanie</button>
            <button onClick={wyczysc}>Wyczyść</button>
            <span>{wynik}/{maxPunktow}</span>
          </div>
        </div>

        <div className="podpowiedzi">
          {(['poziomo', 'pionowo'] as const).map((kierunek) => <div key={kierunek}>
            <h2>{kierunek === 'poziomo' ? 'Poziomo' : 'Pionowo'}</h2>
            {hasla.filter((haslo) => haslo.kierunek === kierunek).map((haslo) => <button
              key={haslo.numer}
              className={`podpowiedz ${aktywneHaslo === haslo.numer ? 'wybrana' : ''}`}
              onClick={() => ustawAktywneHaslo(haslo.numer)}
            >
              <b>{haslo.numer}.</b> {haslo.pytanie} ({haslo.odpowiedz.length})
            </button>)}
          </div>)}
        </div>
      </section>
    </main>
  )
}

export default App
