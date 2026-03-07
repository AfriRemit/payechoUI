import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { apiPostBlob } from '../../lib/api';

const VOICES = ['Echo (Abena)', 'Kwame', 'Amara'];
const LANGUAGES = ['English', 'Twi', 'French', 'Swahili'];
/** ElevenLabs voice IDs — display name -> voice_id (use your account’s IDs if different) */
const VOICE_IDS: Record<string, string> = {
  'Echo (Abena)': 'EXAVITQu4vr4xnSDxMaL', // Bella / multilingual
  'Kwame': 'pNInz6obpgDQGcFmaJgB',         // Adam
  'Amara': 'VR6AewLTigWG4xSOukaG',         // Arnold
};
const TEST_PHRASES: Record<string, string> = {
  English: 'Payment received. 25 USDC. This is a test of the PayEcho voice.',
  Twi: 'Payment received. 25 USDC. PayEcho voice test.',
  French: 'Paiement reçu. 25 USDC. Ceci est un test de la voix PayEcho.',
  Swahili: 'Malipo yamepokelewa. 25 USDC. Hii ni jaribio la sauti ya PayEcho.',
};
const STORAGE_KEY = 'payecho_voice_settings';

function loadSettings(): { volume: number; quietStart: string; quietEnd: string; voice: string; language: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Record<string, unknown>;
      return {
        volume: typeof s.volume === 'number' ? s.volume : 80,
        quietStart: typeof s.quietStart === 'string' ? s.quietStart : '22:00',
        quietEnd: typeof s.quietEnd === 'string' ? s.quietEnd : '07:00',
        voice: typeof s.voice === 'string' && VOICES.includes(s.voice) ? s.voice : VOICES[0],
        language: typeof s.language === 'string' && LANGUAGES.includes(s.language) ? s.language : LANGUAGES[0],
      };
    }
  } catch {
    /* ignore */
  }
  return { volume: 80, quietStart: '22:00', quietEnd: '07:00', voice: VOICES[0], language: LANGUAGES[0] };
}

function saveSettings(settings: { volume: number; quietStart: string; quietEnd: string; voice: string; language: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

/** True if current time is inside quiet hours (start/end in "HH:mm", may span midnight). */
function isQuietHours(quietStart: string, quietEnd: string): boolean {
  const now = new Date();
  const [sh, sm] = quietStart.split(':').map(Number);
  const [eh, em] = quietEnd.split(':').map(Number);
  const nowM = now.getHours() * 60 + now.getMinutes();
  let startM = sh * 60 + sm;
  let endM = eh * 60 + em;
  if (startM <= endM) return nowM >= startM && nowM < endM;
  return nowM >= startM || nowM < endM;
}

export default function Voice() {
  const { getToken } = useAuth();
  const saved = loadSettings();
  const [voice, setVoice] = useState(saved.voice);
  const [language, setLanguage] = useState(saved.language);
  const [volume, setVolume] = useState(saved.volume);
  const [quietStart, setQuietStart] = useState(saved.quietStart);
  const [quietEnd, setQuietEnd] = useState(saved.quietEnd);
  const [testPlaying, setTestPlaying] = useState(false);

  const handleVoiceChange = (v: string) => { setVoice(v); saveSettings({ volume, quietStart, quietEnd, voice: v, language }); };
  const handleLanguageChange = (l: string) => { setLanguage(l); saveSettings({ volume, quietStart, quietEnd, voice, language: l }); };
  const handleVolumeChange = (v: number) => { setVolume(v); saveSettings({ volume: v, quietStart, quietEnd, voice, language }); };
  const handleQuietStartChange = (v: string) => { setQuietStart(v); saveSettings({ volume, quietStart: v, quietEnd, voice, language }); };
  const handleQuietEndChange = (v: string) => { setQuietEnd(v); saveSettings({ volume, quietStart, quietEnd: v, voice, language }); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">Voice</h1>
        <p className="text-secondary text-sm mt-1">
          AI voice confirmation per payment. Voice selector, language, volume, quiet hours, test button.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary rounded-xl border border-white/10 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Voice</label>
            <select
              value={voice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full rounded-xl bg-tertiary border border-white/10 px-4 py-2.5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            >
              {VOICES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full rounded-xl bg-tertiary border border-white/10 px-4 py-2.5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-primary">Volume</label>
              <span className="text-secondary">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-3 rounded-full bg-tertiary appearance-none accent-accent-green cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-green [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>
        <div className="bg-secondary rounded-xl border border-white/10 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-primary">Quiet hours</h2>
          <p className="text-sm text-secondary">No voice announcements during this period.</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="time"
              value={quietStart}
              onChange={(e) => handleQuietStartChange(e.target.value)}
              className="w-full sm:w-auto rounded-xl bg-tertiary border border-white/10 px-4 py-2.5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            />
            <span className="text-secondary text-center sm:text-left">to</span>
            <input
              type="time"
              value={quietEnd}
              onChange={(e) => handleQuietEndChange(e.target.value)}
              className="w-full sm:w-auto rounded-xl bg-tertiary border border-white/10 px-4 py-2.5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            />
          </div>
          <button
            type="button"
            disabled={testPlaying}
            onClick={async () => {
              const token = await getToken();
              if (!token) {
                toast.error('Log in to test voice.');
                return;
              }
              if (isQuietHours(quietStart, quietEnd)) {
                toast.info('Quiet hours — voice is muted. Change quiet hours or try again later.');
                return;
              }
              setTestPlaying(true);
              try {
                const voiceId = VOICE_IDS[voice] ?? VOICE_IDS[VOICES[0]];
                const text = TEST_PHRASES[language] ?? TEST_PHRASES['English'];
                const blob = await apiPostBlob(
                  '/api/voice/speak',
                  { text, voiceId, lang: language },
                  { token },
                );
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.volume = volume / 100;
                await audio.play();
                audio.onended = () => {
                  URL.revokeObjectURL(url);
                  setTestPlaying(false);
                };
              } catch {
                toast.error('Voice is unavailable. Set ELEVENLABS_API_KEY on the server to enable it.');
                setTestPlaying(false);
              }
            }}
            className="w-full rounded-xl bg-accent-green px-4 py-3 text-sm font-semibold text-white hover:bg-accent-green-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.076L4 12H2a1 1 0 01-1-1V9a1 1 0 011-1h2l4.383-4.924a1 1 0 011.617.076z"
                clipRule="evenodd"
              />
            </svg>
            {testPlaying ? 'Playing…' : 'Test voice'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
