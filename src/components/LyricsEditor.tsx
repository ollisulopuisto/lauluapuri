import React, { useState, useMemo } from 'react';
import { syllabify, isLongSyllable, getStressPattern, doRhyme } from '../utils/finnishSyllables';
import type { StressLevel } from '../utils/finnishSyllables';

interface AnalyzedSyllable {
  text: string;
  isLong: boolean;
  stress: StressLevel;
}

interface AnalyzedLine {
  originalText: string;
  syllables: AnalyzedSyllable[];
  syllableCount: number;
  lastWord: string;
  rhymeGroup?: number;
}

const LyricsEditor: React.FC = () => {
  const [lyrics, setLyrics] = useState<string>('');

  const analyzedLines = useMemo(() => {
    const lines = lyrics.split('\n');
    const result: AnalyzedLine[] = [];
    const rhymeGroups: Map<string, number> = new Map();
    let nextGroupId = 1;

    lines.forEach((lineText) => {
      const words = lineText.trim().split(/\s+/).filter(Boolean);
      const allSyllables: AnalyzedSyllable[] = [];
      const lastWord = words.length > 0 ? words[words.length - 1].replace(/[^a-zäö]/gi, '') : '';

      words.forEach((word) => {
        const wordSyllables = syllabify(word);
        const stresses = getStressPattern(wordSyllables);
        
        wordSyllables.forEach((s, i) => {
          allSyllables.push({
            text: s,
            isLong: isLongSyllable(s),
            stress: stresses[i]
          });
        });
      });

      let rhymeGroup: number | undefined;
      if (lastWord) {
        // Check if it rhymes with any previous rhyme group's word
        for (const [prevWord, groupId] of rhymeGroups.entries()) {
          if (doRhyme(lastWord, prevWord)) {
            rhymeGroup = groupId;
            break;
          }
        }
        
        if (!rhymeGroup) {
          // Check if it rhymes with any previous line's last word that wasn't in a group yet
          for (let i = 0; i < result.length; i++) {
             if (result[i].lastWord && doRhyme(lastWord, result[i].lastWord)) {
                rhymeGroup = nextGroupId++;
                result[i].rhymeGroup = rhymeGroup;
                rhymeGroups.set(result[i].lastWord, rhymeGroup);
                break;
             }
          }
        }

        if (rhymeGroup) {
          rhymeGroups.set(lastWord, rhymeGroup);
        }
      }

      result.push({
        originalText: lineText,
        syllables: allSyllables,
        syllableCount: allSyllables.length,
        lastWord,
        rhymeGroup
      });
    });

    return result;
  }, [lyrics]);

  const getSyllableSymbol = (syllable: AnalyzedSyllable) => {
    let symbol = syllable.isLong ? '—' : '◡';
    if (syllable.stress === 'primary') return symbol; // We'll use CSS for stress visualization
    return symbol;
  };

  const getRhymeColor = (groupId?: number) => {
    if (!groupId) return 'transparent';
    const colors = ['#FF3B30', '#34C759', '#007AFF', '#5856D6', '#FF9500', '#AF52DE'];
    return colors[(groupId - 1) % colors.length];
  };

  return (
    <div className="lyrics-editor-container">
      <div className="editor-section">
        <textarea
          placeholder="Kirjoita laululyriikkaa tähän...&#10;&#10;Esim:&#10;Kultaista on rannalla&#10;Sulla kaunis kannalla"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div className="analysis-section">
        {analyzedLines.map((line, idx) => (
          <div key={idx} className="analyzed-line">
            <div className="line-meta">
              <span className="syllable-count">{line.syllableCount} tavua</span>
              {line.rhymeGroup && (
                <span 
                  className="rhyme-indicator" 
                  style={{ backgroundColor: getRhymeColor(line.rhymeGroup) }}
                  title={`Riimiryhmä ${line.rhymeGroup}`}
                >
                  {String.fromCharCode(64 + (line.rhymeGroup % 26))}
                </span>
              )}
            </div>
            <div className="line-visualization">
              {line.syllables.map((s, sIdx) => (
                <span 
                  key={sIdx} 
                  className={`syllable ${s.stress} ${s.isLong ? 'long' : 'short'}`}
                >
                  {getSyllableSymbol(s)}
                </span>
              ))}
            </div>
            <div className="line-text-syllabified">
              {line.syllables.map(s => s.text).join('-')}
            </div>
          </div>
        ))}
        {lyrics === '' && (
          <div className="empty-state">
            <p>Aloita kirjoittamalla jotain vasemmalle.</p>
            <p>Sovellus analysoi suomen kielen tavut, painotukset ja riimit lennosta.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsEditor;
