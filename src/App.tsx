import LyricsEditor from './components/LyricsEditor'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Lauluapuri</h1>
        <p className="subtitle">Suomenkielisen lyriikan rytmi- ja tavuanalyysi</p>
      </header>
      <main>
        <LyricsEditor />
      </main>
      <footer>
        <p style={{textAlign: 'center', marginTop: '40px', color: '#86868b', fontSize: '0.8rem'}}>
          Tavut: [!] painollinen, (·) sivupainollinen | — pitkä, ◡ lyhyt
        </p>
      </footer>
    </div>
  )
}

export default App
