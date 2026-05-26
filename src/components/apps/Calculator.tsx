
import {useState} from 'react';

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);

  const handleNumber = (n: string) => {
    if (display === '0' || shouldReset) {
      setDisplay(n);
      setShouldReset(false);
    } else {
      setDisplay(display + n);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setShouldReset(true);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // Simple eval for demo, in production use a math library
      const result = eval(fullEquation.replace('×', '*').replace('÷', '/'));
      setDisplay(String(result));
      setEquation('');
      setShouldReset(true);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const buttons = [
    {label: 'C', action: clear, className: 'text-orange-500 font-bold'},
    {label: '±', action: () => setDisplay(String(Number(display) * -1))},
    {label: '%', action: () => setDisplay(String(Number(display) / 100))},
    {label: '÷', action: () => handleOperator('÷'), className: 'text-orange-500 font-bold'},
    {label: '7', action: () => handleNumber('7')},
    {label: '8', action: () => handleNumber('8')},
    {label: '9', action: () => handleNumber('9')},
    {label: '×', action: () => handleOperator('×'), className: 'text-orange-500 font-bold'},
    {label: '4', action: () => handleNumber('4')},
    {label: '5', action: () => handleNumber('5')},
    {label: '6', action: () => handleNumber('6')},
    {label: '-', action: () => handleOperator('-'), className: 'text-orange-500 font-bold'},
    {label: '1', action: () => handleNumber('1')},
    {label: '2', action: () => handleNumber('2')},
    {label: '3', action: () => handleNumber('3')},
    {label: '+', action: () => handleOperator('+'), className: 'text-orange-500 font-bold'},
    {label: '0', action: () => handleNumber('0'), className: 'col-span-2'},
    {label: '.', action: () => handleNumber('.')},
    {label: '=', action: calculate, className: 'bg-orange-600 text-white font-bold hover:bg-orange-500'},
  ];

  return (
    <div className="h-full bg-[#16181d] flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-[280px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="mb-4 px-2 text-right">
          <div className="h-4 text-[10px] text-zinc-600 font-mono mb-1">{equation}</div>
          <div className="text-3xl font-bold text-white truncate">{display}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className={`h-12 rounded-xl flex items-center justify-center text-sm transition-all active:scale-95 ${btn.className || 'bg-white/5 hover:bg-white/10 text-zinc-300'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[280px]">
        <div className="p-3 rounded-xl bg-orange-600/10 border border-orange-500/20">
          <div className="text-[8px] font-bold text-orange-500 uppercase mb-1">Precision</div>
          <div className="text-[10px] text-zinc-400">64-bit Sambi Math</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Status</div>
          <div className="text-[10px] text-zinc-400">Stable</div>
        </div>
      </div>
    </div>
  );
}
