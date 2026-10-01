import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';

export const BaiiiPlusModal: React.FC = () => {
  const { isCalculatorOpen, toggleCalculator } = useLms();
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [previousVal, setPreviousVal] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Financial TVM Registers
  const [nVal, setNVal] = useState<string>('5');
  const [iyVal, setIyVal] = useState<string>('6.0');
  const [pvVal, setPvVal] = useState<string>('385420');
  const [pmtVal, setPmtVal] = useState<string>('120000');
  const [fvVal, setFvVal] = useState<string>('0');
  const [tvmMode, setTvmMode] = useState<'END' | 'BGN'>('BGN');
  const [cptMode, setCptMode] = useState<boolean>(false);

  if (!isCalculatorOpen) return null;

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousVal(null);
    setOperator(null);
    setWaitingForOperand(false);
    setCptMode(false);
  };

  const handleOperator = (nextOp: string) => {
    const inputValue = parseFloat(display);

    if (previousVal === null) {
      setPreviousVal(inputValue);
    } else if (operator) {
      const currentVal = previousVal || 0;
      let result = currentVal;
      if (operator === '+') result = currentVal + inputValue;
      else if (operator === '-') result = currentVal - inputValue;
      else if (operator === '×') result = currentVal * inputValue;
      else if (operator === '÷') result = inputValue !== 0 ? currentVal / inputValue : 0;
      else if (operator === 'y^x') result = Math.pow(currentVal, inputValue);

      setDisplay(String(Number(result.toFixed(6))));
      setPreviousVal(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
    setCptMode(false);
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);
    if (operator && previousVal !== null) {
      let result = previousVal;
      if (operator === '+') result = previousVal + inputValue;
      else if (operator === '-') result = previousVal - inputValue;
      else if (operator === '×') result = previousVal * inputValue;
      else if (operator === '÷') result = inputValue !== 0 ? previousVal / inputValue : 0;
      else if (operator === 'y^x') result = Math.pow(previousVal, inputValue);

      setDisplay(String(Number(result.toFixed(6))));
      setPreviousVal(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  // TVM computation: CPT PV / FV / PMT
  const handleTvmRegister = (reg: 'N' | 'I/Y' | 'PV' | 'PMT' | 'FV') => {
    const val = parseFloat(display);

    if (cptMode) {
      // Compute requested register
      const n = parseFloat(nVal) || 1;
      const r = (parseFloat(iyVal) || 0) / 100;
      const pmt = parseFloat(pmtVal) || 0;
      const fv = parseFloat(fvVal) || 0;

      if (reg === 'PV') {
        // PV calculation for annuity
        if (r === 0) {
          const res = -(pmt * n + fv);
          setDisplay(res.toFixed(2));
          setPvVal(res.toFixed(2));
        } else {
          const factor = (1 - Math.pow(1 + r, -n)) / r;
          const timingMult = tvmMode === 'BGN' ? 1 + r : 1;
          const pvOfPmt = pmt * factor * timingMult;
          const pvOfFv = fv / Math.pow(1 + r, n);
          const computedPv = -(pvOfPmt + pvOfFv);
          setDisplay(computedPv.toFixed(2));
          setPvVal(computedPv.toFixed(2));
        }
      } else if (reg === 'FV') {
        const factor = (Math.pow(1 + r, n) - 1) / r;
        const timingMult = tvmMode === 'BGN' ? 1 + r : 1;
        const computedFv = -(pmt * factor * timingMult);
        setDisplay(computedFv.toFixed(2));
        setFvVal(computedFv.toFixed(2));
      }
      setCptMode(false);
      setWaitingForOperand(true);
      return;
    }

    // Set register value
    if (reg === 'N') setNVal(display);
    if (reg === 'I/Y') setIyVal(display);
    if (reg === 'PV') setPvVal(display);
    if (reg === 'PMT') setPmtVal(display);
    if (reg === 'FV') setFvVal(display);
    setWaitingForOperand(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#1c2833] text-surface-container-lowest w-full max-w-sm rounded-2xl shadow-2xl border border-secondary/40 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header bar */}
        <div className="bg-[#111822] px-4 py-2.5 flex items-center justify-between border-b border-[#2d3b48]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-widest text-tertiary-fixed font-mono uppercase">
              TEXAS INSTRUMENTS
            </span>
            <span className="text-[10px] bg-secondary px-1.5 py-0.2 rounded font-bold text-on-secondary">
              BA II PLUS
            </span>
          </div>
          <button
            onClick={toggleCalculator}
            className="text-outline-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* LCD Screen Display */}
        <div className="p-4 bg-[#0a0f14]">
          <div className="flex items-center justify-between text-[10px] font-mono text-tertiary-fixed-dim pb-1">
            <span>{cptMode ? 'COMPUTE' : 'STANDARD'}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTvmMode(tvmMode === 'BGN' ? 'END' : 'BGN')}
                className="hover:underline cursor-pointer"
              >
                MODE: {tvmMode}
              </button>
              <span>DEG</span>
            </div>
          </div>
          <div className="bg-[#b4c5b9] text-[#111] p-3 rounded-md font-mono text-2xl font-black text-right tracking-wider shadow-inner overflow-x-auto min-h-[52px] flex items-center justify-end">
            {display}
          </div>
          {/* Active TVM Registers summary strip */}
          <div className="grid grid-cols-5 text-[9px] font-mono text-center text-[#9bb0c4] pt-2">
            <div>N={nVal}</div>
            <div>I/Y={iyVal}</div>
            <div>PV={pvVal}</div>
            <div>PMT={pmtVal}</div>
            <div>FV={fvVal}</div>
          </div>
        </div>

        {/* Keypad */}
        <div className="p-3 bg-[#1e2a38] grid grid-cols-5 gap-1.5 text-xs font-bold">
          {/* Row 1: CPT & TVM keys */}
          <button
            onClick={() => setCptMode(!cptMode)}
            className={`py-2 rounded text-center transition-all ${
              cptMode ? 'bg-tertiary-fixed text-on-tertiary-fixed font-black' : 'bg-[#2b3a4a] text-tertiary-fixed-dim'
            }`}
          >
            CPT
          </button>
          <button onClick={() => handleTvmRegister('N')} className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]">
            N
          </button>
          <button onClick={() => handleTvmRegister('I/Y')} className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]">
            I/Y
          </button>
          <button onClick={() => handleTvmRegister('PV')} className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]">
            PV
          </button>
          <button onClick={() => handleTvmRegister('PMT')} className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]">
            PMT
          </button>

          {/* Row 2: Secondary finance & math */}
          <button onClick={() => handleTvmRegister('FV')} className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]">
            FV
          </button>
          <button
            onClick={() => {
              const v = parseFloat(display);
              setDisplay(String(v !== 0 ? (1 / v).toFixed(6) : 0));
            }}
            className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]"
          >
            1/x
          </button>
          <button
            onClick={() => {
              const v = parseFloat(display);
              setDisplay(String(Math.sqrt(Math.max(0, v)).toFixed(6)));
            }}
            className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]"
          >
            √x
          </button>
          <button onClick={() => handleOperator('y^x')} className="py-2 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]">
            y^x
          </button>
          <button onClick={() => handleOperator('÷')} className="py-2 rounded bg-[#006874] text-white hover:bg-[#007b89]">
            ÷
          </button>

          {/* Row 3 */}
          <button onClick={() => handleDigit('7')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            7
          </button>
          <button onClick={() => handleDigit('8')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            8
          </button>
          <button onClick={() => handleDigit('9')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            9
          </button>
          <button onClick={handleClear} className="py-2.5 rounded bg-[#93000a] text-white hover:bg-[#b00010]">
            CE/C
          </button>
          <button onClick={() => handleOperator('×')} className="py-2 rounded bg-[#006874] text-white hover:bg-[#007b89]">
            ×
          </button>

          {/* Row 4 */}
          <button onClick={() => handleDigit('4')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            4
          </button>
          <button onClick={() => handleDigit('5')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            5
          </button>
          <button onClick={() => handleDigit('6')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            6
          </button>
          <button
            onClick={() => {
              const v = parseFloat(display);
              setDisplay(String(-v));
            }}
            className="py-2.5 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]"
          >
            +/-
          </button>
          <button onClick={() => handleOperator('-')} className="py-2 rounded bg-[#006874] text-white hover:bg-[#007b89]">
            -
          </button>

          {/* Row 5 */}
          <button onClick={() => handleDigit('1')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            1
          </button>
          <button onClick={() => handleDigit('2')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            2
          </button>
          <button onClick={() => handleDigit('3')} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            3
          </button>
          <button
            onClick={() => {
              const v = parseFloat(display);
              setDisplay(String(Math.log(v > 0 ? v : 1).toFixed(6)));
            }}
            className="py-2.5 rounded bg-[#2b3a4a] text-white hover:bg-[#394d62]"
          >
            LN
          </button>
          <button onClick={() => handleOperator('+')} className="py-2 rounded bg-[#006874] text-white hover:bg-[#007b89]">
            +
          </button>

          {/* Row 6 */}
          <button onClick={() => handleDigit('0')} className="col-span-2 py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            0
          </button>
          <button onClick={handleDecimal} className="py-2.5 rounded bg-[#334454] text-white hover:bg-[#41566b] text-sm">
            .
          </button>
          <button
            onClick={handleEqual}
            className="col-span-2 py-2.5 rounded bg-tertiary-fixed-dim text-on-tertiary-fixed font-black hover:bg-tertiary-fixed text-sm shadow-sm"
          >
            =
          </button>
        </div>

        {/* Quick prompt */}
        <div className="bg-[#111822] p-2 text-center text-[10px] text-outline">
          💡 Bấm CPT rồi bấm PV để tính hiện giá dòng tiền định kỳ (Annuity).
        </div>
      </div>
    </div>
  );
};
