import { useTheme } from '@/contexts/themeContext';

interface CleanHeaderProps {
  selectedModel: string;
  models: { model: string; name: string }[];
  onModelChange: (model: string) => void;
  isConnected: boolean;
}

const colors = {
  light: {
    bg: 'bg-yellow-50',
    card: 'bg-white',
    border: 'border-yellow-100',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
  },
  dark: {
    bg: 'bg-purple-950',
    card: 'bg-purple-900',
    border: 'border-purple-800',
    text: 'text-slate-50',
    textSecondary: 'text-slate-200',
  }
};

export const CleanHeader: React.FC<CleanHeaderProps> = ({
  selectedModel,
  models,
  onModelChange,
  isConnected,
}) => {
  const { theme, toggleTheme } = useTheme();
  const c = theme === 'light' ? colors.light : colors.dark;
  const currentModelName = models.find(m => m.model === selectedModel)?.name || selectedModel;

  return (
    <header className={`fixed top-4 left-4 right-4 z-50 ${c.card} border-2 ${c.border} rounded-2xl backdrop-blur-xl transition-all duration-200 shadow-lg`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${theme === 'light'
                ? 'bg-linear-to-br from-pink-400 to-blue-400 text-white'
                : 'bg-linear-to-br from-pink-500 to-blue-500 text-white'
              }`}>
              N
            </div>
            <span className={`text-lg font-semibold hidden sm:inline ${c.text}`}>
              Consultor
            </span>
          </div>

          <div className="hidden md:block flex-1 max-w-xs">
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${theme === 'light'
                  ? 'bg-white border-yellow-100 text-slate-900 hover:border-pink-200 focus:border-pink-400'
                  : 'bg-purple-900 border-purple-800 text-slate-50 hover:border-pink-700 focus:border-pink-500'
                } focus:outline-none focus:ring-0`}
            >
              {models.map(m => (
                <option key={m.model} value={m.model}>
                  {m.name || m.model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${theme === 'light'
                ? `border-green-200 ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 border-red-200'}`
                : `border-green-800 ${isConnected ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300 border-red-800'}`
              }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
              <span className="hidden sm:inline text-xs font-semibold">{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all border-2 ${theme === 'light'
                  ? 'border-yellow-100 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:border-yellow-200'
                  : 'border-purple-800 bg-purple-900 text-yellow-400 hover:bg-purple-800 hover:border-purple-700'
                }`}
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM5 8a1 1 0 100-2H4a1 1 0 100 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden mt-3">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${theme === 'light'
                ? 'bg-white border-yellow-100 text-slate-900'
                : 'bg-purple-900 border-purple-800 text-slate-50'
              } focus:outline-none focus:ring-0`}
          >
            {models.map(m => (
              <option key={m.model} value={m.model}>
                {m.name || m.model}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
